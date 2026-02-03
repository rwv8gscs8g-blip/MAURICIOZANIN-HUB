import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-guard";
import { extractRequestInfo, verifyToken } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";

const PRIVILEGED_ROLES = ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] as const;

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  try {
    const { searchParams } = new URL(request.url);
    const classroomCode = searchParams.get("classroomCode");
    const classroomToken = searchParams.get("classroomToken");

    // Acesso via sala (participante sem login): exige code+token e que o diagnóstico pertença à sala.
    if (classroomCode || classroomToken) {
      const { ipAddress, userAgent, requestId } = extractRequestInfo(request);
      if (!classroomCode || !classroomToken) {
        await logAudit({
          entity: "Diagnostico",
          entityId: requestId,
          action: "ACCESS_DENIED",
          ipAddress,
          userAgent,
          requestId,
          data: { reason: "MISSING_CLASSROOM_CREDENTIALS", op: "VERSIONS", diagnosticoId: id },
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
          data: { reason: "CLASSROOM_NOT_FOUND", op: "VERSIONS", diagnosticoId: id },
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
          data: { reason: "CLASSROOM_EXPIRED", op: "VERSIONS", diagnosticoId: id },
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
          data: { reason: "INVALID_CLASSROOM_TOKEN", op: "VERSIONS", diagnosticoId: id },
        });
        return NextResponse.json({ error: "Token inválido" }, { status: 403 });
      }

      const target = await prisma.diagnostico.findUnique({
        where: { id: id },
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
          data: { reason: "DIAGNOSTICO_NOT_IN_CLASSROOM", op: "VERSIONS", diagnosticoId: id },
        });
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    } else {
      // Acesso privilegiado (consultor/admin) para ver versões sem token.
      const auth = await requireApiAuth(request, {
        allowedRoles: [...PRIVILEGED_ROLES],
        audit: { entity: "Diagnostico", action: "ACCESS_DENIED", data: { op: "VERSIONS", diagnosticoId: id } },
      });
      if (!auth.ok) return auth.response;
    }

    const versions = await prisma.diagnosticoVersion.findMany({
      where: { diagnosticoId: id },
      orderBy: { versionNumber: "desc" },
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error("diagnostico versions error", error);
    return NextResponse.json(
      { error: "Erro ao carregar versões" },
      { status: 500 }
    );
  }
}
