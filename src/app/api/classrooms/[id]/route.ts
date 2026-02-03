import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractRequestInfo } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";
import { requireApiAuth } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] as const;
const ALLOWED_STATUS = ["PREPARACAO", "ATIVA", "ENCERRADA", "CANCELADA"] as const;

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const auth = await requireApiAuth(_request, {
      allowedRoles: [...ALLOWED_ROLES],
      audit: {
        entity: "ClassroomSession",
        action: "ACCESS_DENIED",
        data: { op: "GET", classroomSessionId: params.id },
      },
    });
    if (!auth.ok) return auth.response;
    const session = auth.session;

    const isAdminLike = session.user.role === "ADMIN" || session.user.role === "SUPERCONSULTOR";
    const classroom = await prisma.classroomSession.findFirst({
      where: {
        id: params.id,
        ...(isAdminLike ? {} : { consultantId: session.user.id }),
      },
      include: {
        participants: { orderBy: { createdAt: "asc" }, take: 500 },
        _count: { select: { participants: true, diagnosticos: true } },
      },
    });
    if (!classroom) return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });

    return NextResponse.json({ classroom });
  } catch (error) {
    console.error("classroom fetch error", error);
    return NextResponse.json({ error: "Erro ao buscar sala" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { ipAddress, userAgent, requestId } = extractRequestInfo(request);

  try {
    const auth = await requireApiAuth(request, {
      allowedRoles: [...ALLOWED_ROLES],
      audit: {
        entity: "ClassroomSession",
        action: "ACCESS_DENIED",
        data: { op: "PATCH", classroomSessionId: params.id },
      },
    });
    if (!auth.ok) return auth.response;
    const session = auth.session;

    const body = await request.json();
    const { status, title, description, expiresAt } = body ?? {};

    if (status && !ALLOWED_STATUS.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const existing = await prisma.classroomSession.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        consultantId: true,
        status: true,
        clientOrganizationId: true,
        clientUnitId: true,
        municipioIbgeId: true,
      },
    });
    if (!existing) return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });

    const isAdminLike = session.user.role === "ADMIN" || session.user.role === "SUPERCONSULTOR";
    if (!isAdminLike && existing.consultantId !== session.user.id) {
      await logAudit({
        entity: "ClassroomSession",
        entityId: existing.id,
        action: "ACCESS_DENIED",
        performedBy: session.user.id,
        userId: session.user.id,
        clientOrganizationId: existing.clientOrganizationId || null,
        clientUnitId: existing.clientUnitId || null,
        ipAddress,
        userAgent,
        requestId,
        data: { reason: "NOT_OWNER", op: "PATCH" },
      });
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Regra: apenas uma sala ATIVA por município ao mesmo tempo.
    if (status === "ATIVA" && existing.municipioIbgeId) {
      const otherActive = await prisma.classroomSession.findFirst({
        where: {
          municipioIbgeId: existing.municipioIbgeId,
          status: "ATIVA",
          NOT: { id: existing.id },
        },
        select: { id: true, title: true },
      });
      if (otherActive) {
        return NextResponse.json(
          {
            error:
              "Já existe uma sala ATIVA para este município. Encerre a outra sala antes de ativar uma nova.",
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.classroomSession.update({
      where: { id: params.id },
      data: {
        status: status || undefined,
        title: typeof title === "string" ? title : undefined,
        description: typeof description === "string" ? description : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });

    await logAudit({
      entity: "ClassroomSession",
      entityId: updated.id,
      action: "UPDATE",
      performedBy: session.user.id,
      userId: session.user.id,
      clientOrganizationId: existing.clientOrganizationId || null,
      clientUnitId: existing.clientUnitId || null,
      ipAddress,
      userAgent,
      requestId,
      data: {
        prevStatus: existing.status,
        status: updated.status,
      },
    });

    return NextResponse.json({ classroom: updated });
  } catch (error) {
    console.error("classroom patch error", error);
    return NextResponse.json({ error: "Erro ao atualizar sala" }, { status: 500 });
  }
}

