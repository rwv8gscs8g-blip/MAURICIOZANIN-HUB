import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractRequestInfo } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";
import { requireApiAuth } from "@/lib/api-guard";

const ALLOWED_ROLES = ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] as const;

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent, requestId } = extractRequestInfo(request);

  try {
    const auth = await requireApiAuth(request, {
      allowedRoles: [...ALLOWED_ROLES],
      audit: { entity: "ClassroomParticipant", action: "ACCESS_DENIED", data: { op: "CREATE" } },
    });
    if (!auth.ok) return auth.response;
    const session = auth.session;

    const body = await request.json();
    const { classroomSessionId, name, email, role, organization } = body ?? {};

    if (!classroomSessionId || typeof classroomSessionId !== "string") {
      return NextResponse.json({ error: "classroomSessionId é obrigatório" }, { status: 400 });
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const classroom = await prisma.classroomSession.findUnique({
      where: { id: classroomSessionId },
      select: { id: true, consultantId: true, clientOrganizationId: true, clientUnitId: true },
    });
    if (!classroom) {
      return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });
    }

    const isAdminLike = session.user.role === "ADMIN" || session.user.role === "SUPERCONSULTOR";
    if (!isAdminLike && classroom.consultantId !== session.user.id) {
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
        data: { reason: "NOT_OWNER", op: "PARTICIPANT_CREATE" },
      });
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const normalizedEmail = typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
    const existing = normalizedEmail
      ? await prisma.classroomParticipant.findFirst({
          where: { classroomSessionId: classroom.id, email: normalizedEmail },
        })
      : null;

    const participant =
      existing ||
      (await prisma.classroomParticipant.create({
        data: {
          classroomSessionId: classroom.id,
          name: name.trim(),
          email: normalizedEmail || undefined,
          role: typeof role === "string" ? role.trim() : undefined,
          organization: typeof organization === "string" ? organization.trim() : undefined,
        },
      }));

    await logAudit({
      entity: "ClassroomParticipant",
      entityId: participant.id,
      action: existing ? "UPSERT_EXISTING" : "CREATE",
      performedBy: session.user.id,
      userId: session.user.id,
      clientOrganizationId: classroom.clientOrganizationId || null,
      clientUnitId: classroom.clientUnitId || null,
      ipAddress,
      userAgent,
      requestId,
      data: {
        classroomSessionId: classroom.id,
        participantEmail: participant.email || null,
      },
    });

    return NextResponse.json({ participant });
  } catch (error) {
    console.error("classrooms participants error", error);
    return NextResponse.json({ error: "Erro ao criar participante" }, { status: 500 });
  }
}

