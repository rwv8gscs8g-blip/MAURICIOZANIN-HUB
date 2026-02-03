import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractRequestInfo, canJoinSession } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";
import { requireApiAuth } from "@/lib/api-guard";
import { verifyToken } from "@/lib/classroom";

const PRIVILEGED_ROLES = ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] as const;

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { ipAddress, userAgent, requestId } = extractRequestInfo(request);
    const diagnosticoId = params.id;
    const body = await request.json().catch(() => ({}));
    const classroomCode = body?.classroomCode;
    const classroomToken = body?.classroomToken;
    const classroomSessionId = typeof body?.classroomSessionId === "string" ? body.classroomSessionId.trim() : null;

    // Fluxo 1: participante entrou por sala/entrar (seleção de município) — envia só classroomSessionId.
    if (classroomSessionId) {
      const classroom = await prisma.classroomSession.findUnique({
        where: { id: classroomSessionId },
        select: { id: true, expiresAt: true, status: true },
      });
      if (!classroom) {
        await logAudit({
          entity: "Diagnostico",
          entityId: requestId,
          action: "ACCESS_DENIED",
          ipAddress,
          userAgent,
          requestId,
          data: { reason: "CLASSROOM_SESSION_NOT_FOUND", op: "SUBMIT", diagnosticoId: params.id },
        });
        return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });
      }
      if (classroom.expiresAt && classroom.expiresAt.getTime() < Date.now()) {
        // Sala expirada: mesmo assim permite submeter (diagnóstico considerado enviado).
      }
      if (!canJoinSession(classroom.status)) {
        await logAudit({
          entity: "Diagnostico",
          entityId: requestId,
          action: "ACCESS_DENIED",
          ipAddress,
          userAgent,
          requestId,
          data: { reason: "CLASSROOM_NOT_JOINABLE", op: "SUBMIT", diagnosticoId: params.id },
        });
        return NextResponse.json({ error: "Sala indisponível para envio" }, { status: 409 });
      }
      const target = await prisma.diagnostico.findUnique({
        where: { id: params.id },
        select: { id: true, classroomSessionId: true },
      });
      if (!target || target.classroomSessionId !== classroom.id) {
        await logAudit({
          entity: "Diagnostico",
          entityId: requestId,
          action: "ACCESS_DENIED",
          ipAddress,
          userAgent,
          requestId,
          data: { reason: "DIAGNOSTICO_NOT_IN_CLASSROOM", op: "SUBMIT", diagnosticoId: params.id },
        });
        return NextResponse.json({ error: "Este diagnóstico não está vinculado a esta sala." }, { status: 403 });
      }
      // Autorizado por classroomSessionId; segue para o update abaixo.
    } else if (classroomCode || classroomToken) {
      // Fluxo 2: participante com code+token (sala por código).
      if (!classroomCode || !classroomToken) {
        await logAudit({
          entity: "Diagnostico",
          entityId: requestId,
          action: "ACCESS_DENIED",
          ipAddress,
          userAgent,
          requestId,
          data: { reason: "MISSING_CLASSROOM_CREDENTIALS", op: "SUBMIT", diagnosticoId: params.id },
        });
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }

      const classroom = await prisma.classroomSession.findUnique({
        where: { code: String(classroomCode).trim().toUpperCase() },
        select: { id: true, tokenHash: true, expiresAt: true, status: true },
      });
      if (!classroom || !classroom.tokenHash) {
        await logAudit({
          entity: "Diagnostico",
          entityId: requestId,
          action: "ACCESS_DENIED",
          ipAddress,
          userAgent,
          requestId,
          data: { reason: "CLASSROOM_NOT_FOUND", op: "SUBMIT", diagnosticoId: params.id },
        });
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      if (classroom.expiresAt && classroom.expiresAt.getTime() < Date.now()) {
        await logAudit({
          entity: "Diagnostico",
          entityId: requestId,
          action: "ACCESS_DENIED",
          ipAddress,
          userAgent,
          requestId,
          data: { reason: "CLASSROOM_EXPIRED", op: "SUBMIT", diagnosticoId: params.id },
        });
        return NextResponse.json({ error: "Sala expirada" }, { status: 410 });
      }
      if (!verifyToken(String(classroomToken), classroom.tokenHash)) {
        await logAudit({
          entity: "Diagnostico",
          entityId: requestId,
          action: "ACCESS_DENIED",
          ipAddress,
          userAgent,
          requestId,
          data: { reason: "INVALID_CLASSROOM_TOKEN", op: "SUBMIT", diagnosticoId: params.id },
        });
        return NextResponse.json({ error: "Token inválido" }, { status: 403 });
      }

      const target = await prisma.diagnostico.findUnique({
        where: { id: params.id },
        select: { id: true, classroomSessionId: true },
      });
      if (!target || target.classroomSessionId !== classroom.id) {
        await logAudit({
          entity: "Diagnostico",
          entityId: requestId,
          action: "ACCESS_DENIED",
          ipAddress,
          userAgent,
          requestId,
          data: { reason: "DIAGNOSTICO_NOT_IN_CLASSROOM", op: "SUBMIT", diagnosticoId: params.id },
        });
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    } else {
      // Sem sala: exige sessão consultor/admin (uso interno).
      const auth = await requireApiAuth(request, {
        allowedRoles: [...PRIVILEGED_ROLES],
        audit: { entity: "Diagnostico", action: "ACCESS_DENIED", data: { op: "SUBMIT", diagnosticoId: params.id } },
      });
      if (!auth.ok) return auth.response;
    }

    const diagnostico = await prisma.$transaction(async (tx) => {
      const record = await tx.diagnostico.update({
        where: { id: params.id },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

      const existingCount = await tx.diagnosticoVersion.count({
        where: { diagnosticoId: record.id },
      });

      await tx.diagnosticoVersion.create({
        data: {
          diagnosticoId: record.id,
          versionNumber: existingCount + 1,
          createdByRole: "MUNICIPIO",
          snapshot: {
            status: record.status,
            submittedAt: record.submittedAt,
          },
        },
      });

      return record;
    });

    await logAudit({
      entity: "Diagnostico",
      entityId: diagnostico.id,
      action: "SUBMIT",
      ipAddress,
      userAgent,
      requestId,
      data: { status: diagnostico.status, classroomSessionId: diagnostico.classroomSessionId || null },
    });

    return NextResponse.json({ id: diagnostico.id, status: diagnostico.status });
  } catch (error) {
    console.error("diagnostico submit error", error);
    return NextResponse.json({ error: "Erro ao submeter diagnostico" }, { status: 500 });
  }
}
