import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractRequestInfo } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";
import { requireApiAuth } from "@/lib/api-guard";

const ALLOWED_ROLES = ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] as const;

function isAdminLike(role: string) {
  return role === "ADMIN" || role === "SUPERCONSULTOR";
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { ipAddress, userAgent, requestId } = extractRequestInfo(request);

  try {
    const auth = await requireApiAuth(request, {
      allowedRoles: [...ALLOWED_ROLES],
      audit: {
        entity: "DiagnosticoVersion",
        action: "ACCESS_DENIED",
        data: { op: "CONFLICT_RESOLVE", classroomSessionId: params.id },
      },
    });
    if (!auth.ok) return auth.response;
    const session = auth.session;

    const classroom = await prisma.classroomSession.findUnique({
      where: { id: params.id },
      select: { id: true, consultantId: true, clientOrganizationId: true, clientUnitId: true },
    });
    if (!classroom) return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });

    if (!isAdminLike(session.user.role) && classroom.consultantId !== session.user.id) {
      await logAudit({
        entity: "ClassroomSession",
        entityId: classroom.id,
        action: "ACCESS_DENIED",
        performedBy: session.user.id,
        userId: session.user.id,
        clientOrganizationId: classroom.clientOrganizationId || null,
        clientUnitId: classroom.clientUnitId || null,
        ipAddress,
        userAgent,
        requestId,
        data: { reason: "NOT_OWNER", op: "CONFLICT_RESOLVE" },
      });
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { diagnosticoId, conflictVersionNumber, note } = body ?? {};

    if (!diagnosticoId || typeof diagnosticoId !== "string") {
      return NextResponse.json({ error: "diagnosticoId é obrigatório" }, { status: 400 });
    }
    if (typeof conflictVersionNumber !== "number") {
      return NextResponse.json({ error: "conflictVersionNumber é obrigatório" }, { status: 400 });
    }

    const diagnostico = await prisma.diagnostico.findUnique({
      where: { id: diagnosticoId },
      select: { id: true, classroomSessionId: true },
    });
    if (!diagnostico || diagnostico.classroomSessionId !== classroom.id) {
      return NextResponse.json({ error: "Diagnóstico não pertence à sala" }, { status: 400 });
    }

    const version = await prisma.$transaction(async (tx) => {
      const existingCount = await tx.diagnosticoVersion.count({ where: { diagnosticoId } });
      return tx.diagnosticoVersion.create({
        data: {
          diagnosticoId,
          versionNumber: existingCount + 1,
          createdByRole: "CONSULTOR",
          snapshot: {
            conflictResolution: {
              resolvedFromVersionNumber: conflictVersionNumber,
              note: typeof note === "string" ? note : null,
              resolvedAt: new Date().toISOString(),
            },
          },
        },
      });
    });

    await logAudit({
      entity: "DiagnosticoVersion",
      entityId: version.id,
      action: "CONFLICT_RESOLVE",
      performedBy: session.user.id,
      userId: session.user.id,
      clientOrganizationId: classroom.clientOrganizationId || null,
      clientUnitId: classroom.clientUnitId || null,
      ipAddress,
      userAgent,
      requestId,
      data: {
        classroomSessionId: classroom.id,
        diagnosticoId,
        conflictVersionNumber,
      },
    });

    return NextResponse.json({ ok: true, version });
  } catch (error) {
    console.error("resolve conflict error", error);
    return NextResponse.json({ error: "Erro ao resolver conflito" }, { status: 500 });
  }
}

