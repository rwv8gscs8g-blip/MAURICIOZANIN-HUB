import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-guard";
import { extractRequestInfo } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";

const ALLOWED_ROLES = ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] as const;

function isAdminLike(role: string) {
  return role === "ADMIN" || role === "SUPERCONSULTOR";
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const auth = await requireApiAuth(request, {
      allowedRoles: [...ALLOWED_ROLES],
      audit: {
        entity: "ClassroomSession",
        action: "ACCESS_DENIED",
        data: { op: "POLL", classroomSessionId: params.id },
      },
    });
    if (!auth.ok) return auth.response;
    const session = auth.session;

    const classroom = await prisma.classroomSession.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        code: true,
        status: true,
        title: true,
        consultantId: true,
        expiresAt: true,
        updatedAt: true,
        _count: { select: { participants: true, diagnosticos: true } },
      },
    });
    if (!classroom) return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });

    // Se expirar, encerra automaticamente (best-effort).
    if (classroom.status === "ATIVA" && classroom.expiresAt && classroom.expiresAt.getTime() < Date.now()) {
      await prisma.classroomSession.update({
        where: { id: classroom.id },
        data: { status: "ENCERRADA" },
      }).catch(() => null);
    }

    if (!isAdminLike(session.user.role) && classroom.consultantId !== session.user.id) {
      const { ipAddress, userAgent, requestId } = extractRequestInfo(request);
      await logAudit({
        entity: "ClassroomSession",
        entityId: classroom.id,
        action: "ACCESS_DENIED",
        performedBy: session.user.id,
        userId: session.user.id,
        ipAddress,
        userAgent,
        requestId,
        data: { reason: "NOT_OWNER", op: "POLL" },
      });
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const diagnosticos = await prisma.diagnostico.findMany({
      where: { classroomSessionId: classroom.id },
      select: { id: true, status: true, municipioIbgeId: true, respondentName: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });

    const diagnosticoIds = diagnosticos.map((d) => d.id);
    const versions =
      diagnosticoIds.length === 0
        ? []
        : await prisma.diagnosticoVersion.findMany({
          where: { diagnosticoId: { in: diagnosticoIds } },
          orderBy: { createdAt: "desc" },
          take: 400,
          select: { diagnosticoId: true, versionNumber: true, createdAt: true, createdByRole: true, snapshot: true },
        });

    // Detecta conflitos marcados em snapshots (Last-write-wins + aviso)
    const conflictVersions = versions.filter((v: any) => v?.snapshot?.conflict?.detected === true);
    const resolvedFrom = new Set<number>();
    for (const v of versions as any[]) {
      const resolved = v?.snapshot?.conflictResolution?.resolvedFromVersionNumber;
      if (typeof resolved === "number") resolvedFrom.add(resolved);
    }

    const conflicts = conflictVersions
      .filter((v: any) => !resolvedFrom.has(v.versionNumber))
      .slice(0, 50)
      .map((v: any) => ({
        diagnosticoId: v.diagnosticoId,
        versionNumber: v.versionNumber,
        createdAt: v.createdAt,
        createdByRole: v.createdByRole,
        conflict: v.snapshot.conflict,
      }));

    return NextResponse.json({
      classroom: {
        id: classroom.id,
        code: classroom.code,
        title: classroom.title,
        status: classroom.status,
        expiresAt: classroom.expiresAt,
        updatedAt: classroom.updatedAt,
        counts: classroom._count,
      },
      diagnosticos,
      hasConflicts: conflicts.length > 0,
      conflicts,
    });
  } catch (error) {
    console.error("classroom poll error", error);
    return NextResponse.json({ error: "Erro ao consultar sala" }, { status: 500 });
  }
}

