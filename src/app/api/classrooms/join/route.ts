import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canJoinSession, extractRequestInfo, verifyToken } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent, requestId } = extractRequestInfo(request);

  try {
    const body = await request.json();
    const { classroomSessionId, code, token, name, email, role, organization } = body ?? {};

    const nameTrimmed = typeof name === "string" ? name.trim() : "";

    // Novo fluxo: entrada via lista pública (sem código/token visível) usando o id da sala.
    const byId = typeof classroomSessionId === "string" && classroomSessionId.trim();
    const session = await prisma.classroomSession.findUnique({
      where: byId ? { id: classroomSessionId.trim() } : { code: String(code || "").trim().toUpperCase() },
      include: { _count: { select: { participants: true, diagnosticos: true } } },
    });

    if (!session) {
      await logAudit({
        entity: "ClassroomSession",
        entityId: byId ? classroomSessionId : code,
        action: "JOIN_FAILED",
        ipAddress,
        userAgent,
        requestId,
        data: { reason: "not_found", code, classroomSessionId },
      });
      return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });
    }

    if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
      await logAudit({
        entity: "ClassroomSession",
        entityId: session.id,
        action: "JOIN_FAILED",
        ipAddress,
        userAgent,
        requestId,
        data: { reason: "expired", code: session.code },
      });
      return NextResponse.json({ error: "Sala expirada" }, { status: 410 });
    }

    // Participante pode entrar quando a sala estiver em preparação ou ativa.
    if (!canJoinSession(session.status)) {
      await logAudit({
        entity: "ClassroomSession",
        entityId: session.id,
        action: "JOIN_FAILED",
        ipAddress,
        userAgent,
        requestId,
        data: { reason: "status_blocked", status: session.status, code: session.code },
      });
      return NextResponse.json({ error: "Sala indisponível" }, { status: 409 });
    }

    // Token fica oculto na UX (mantido apenas para implementação futura).
    // Por compatibilidade, se for enviado, validamos.
    if (session.tokenHash && token) {
      const ok = verifyToken(String(token), session.tokenHash);
      if (!ok) {
        await logAudit({
          entity: "ClassroomSession",
          entityId: session.id,
          action: "JOIN_FAILED",
          ipAddress,
          userAgent,
          requestId,
          data: { reason: "invalid_token", code: session.code },
        });
        return NextResponse.json({ error: "Token inválido" }, { status: 403 });
      }
    }

    const normalizedEmail = typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
    const existing = normalizedEmail
      ? await prisma.classroomParticipant.findFirst({
          where: { classroomSessionId: session.id, email: normalizedEmail },
        })
      : null;

    const participant =
      existing ||
      (await prisma.classroomParticipant.create({
        data: {
          classroomSessionId: session.id,
          name: nameTrimmed || "Participante",
          email: normalizedEmail || undefined,
          role: typeof role === "string" ? role.trim() : undefined,
          organization: typeof organization === "string" ? organization.trim() : undefined,
        },
      }));

    await logAudit({
      entity: "ClassroomSession",
      entityId: session.id,
      action: "JOIN_SUCCESS",
      ipAddress,
      userAgent,
      requestId,
      data: {
        code: session.code,
        participantId: participant.id,
        participantEmail: participant.email || null,
      },
    });

    return NextResponse.json({
      classroomSessionId: session.id,
      classroomCode: session.code,
      participantId: participant.id,
      status: session.status,
      cicloGestaoInicio: session.cicloGestaoInicio ?? null,
      cicloGestaoFim: session.cicloGestaoFim ?? null,
      municipioIbgeId: session.municipioIbgeId ?? null,
    });
  } catch (error) {
    console.error("classrooms join error", error);
    await logAudit({
      entity: "ClassroomSession",
      entityId: "unknown",
      action: "JOIN_ERROR",
      ipAddress,
      userAgent,
      requestId,
      data: { error: "unexpected" },
    });
    return NextResponse.json({ error: "Erro ao entrar na sala" }, { status: 500 });
  }
}

