import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMagicToken, generateRoomCode, hashToken, extractRequestInfo } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";
import { requireApiAuth } from "@/lib/api-guard";

const ALLOWED_ROLES = ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] as const;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request, {
      allowedRoles: [...ALLOWED_ROLES],
      audit: { entity: "ClassroomSession", action: "ACCESS_DENIED", data: { op: "LIST" } },
    });
    if (!auth.ok) return auth.response;
    const session = auth.session;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const isAdminLike = session.user.role === "ADMIN" || session.user.role === "SUPERCONSULTOR";

    const sessions = await prisma.classroomSession.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(isAdminLike ? {} : { consultantId: session.user.id }),
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        municipio: { select: { nome: true, uf: true, ibgeId: true } },
        _count: { select: { participants: true, diagnosticos: true } },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("classrooms list error", error);
    return NextResponse.json({ error: "Erro ao listar salas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request, {
      allowedRoles: [...ALLOWED_ROLES],
      audit: { entity: "ClassroomSession", action: "ACCESS_DENIED", data: { op: "CREATE" } },
    });
    if (!auth.ok) return auth.response;
    const session = auth.session;

    const { ipAddress, userAgent, requestId } = extractRequestInfo(request);
    const body = await request.json();

    const {
      description,
      municipioIbgeId,
      clientOrganizationId,
      clientUnitId,
      cicloGestaoInicio,
      cicloGestaoFim,
      expiresAt,
    } = body ?? {};

    if (!municipioIbgeId || typeof municipioIbgeId !== "string" || !municipioIbgeId.trim()) {
      return NextResponse.json({ error: "Município é obrigatório" }, { status: 400 });
    }

    const municipio = await prisma.municipio.findUnique({
      where: { ibgeId: municipioIbgeId.trim() },
      select: { nome: true, uf: true },
    });
    if (!municipio) {
      return NextResponse.json({ error: "Município inválido (IBGE não encontrado)" }, { status: 400 });
    }

    // Nome da sala = nome do município (conforme fluxo simplificado).
    const title = `${municipio.nome}${municipio.uf ? ` (${municipio.uf})` : ""}`;

    // Determina horário de fechamento automático:
    // - Se vier no payload, usa o valor informado.
    // - Caso contrário, define para hoje às 18h (horário do servidor).
    const now = new Date();
    let finalExpiresAt: Date | null = null;
    if (expiresAt) {
      finalExpiresAt = new Date(expiresAt);
    } else {
      const closing = new Date(now);
      closing.setHours(18, 0, 0, 0);
      // Se já passou das 18h, fecha no dia seguinte às 18h para evitar sala expirada imediatamente.
      if (closing.getTime() <= now.getTime()) {
        closing.setDate(closing.getDate() + 1);
      }
      finalExpiresAt = closing;
    }

    // Regra extra de segurança: apenas uma sala ATIVA por município.
    const existingActive = await prisma.classroomSession.findFirst({
      where: {
        municipioIbgeId: municipioIbgeId.trim(),
        status: "ATIVA",
      },
      select: { id: true, title: true },
    });
    if (existingActive) {
      return NextResponse.json(
        {
          error:
            "Já existe uma sala ATIVA para este município. Encerre ou cancele a sala atual antes de criar uma nova.",
        },
        { status: 409 },
      );
    }

    const token = generateMagicToken();
    const tokenHash = hashToken(token);

    let created: any | null = null;
    for (let attempt = 0; attempt < 6; attempt++) {
      const code = generateRoomCode();
      try {
        created = await prisma.classroomSession.create({
          data: {
            code,
            tokenHash,
            title,
            description: typeof description === "string" ? description : undefined,
            municipioIbgeId: municipioIbgeId.trim(),
            clientOrganizationId:
              typeof clientOrganizationId === "string" ? clientOrganizationId : undefined,
            clientUnitId: typeof clientUnitId === "string" ? clientUnitId : undefined,
            consultantId: session.user.id,
            cicloGestaoInicio: typeof cicloGestaoInicio === "number" ? cicloGestaoInicio : undefined,
            cicloGestaoFim: typeof cicloGestaoFim === "number" ? cicloGestaoFim : undefined,
            status: "ATIVA",
            expiresAt: finalExpiresAt ?? undefined,
          },
        });
        break;
      } catch (e: any) {
        // colisão de code (unique) -> tenta novamente
        if (e?.code === "P2002") continue;
        throw e;
      }
    }

    if (!created) {
      return NextResponse.json(
        { error: "Não foi possível gerar um código único para a sala" },
        { status: 500 }
      );
    }

    await logAudit({
      entity: "ClassroomSession",
      entityId: created.id,
      action: "CREATE",
      performedBy: session.user.id,
      userId: session.user.id,
      clientOrganizationId: created.clientOrganizationId || null,
      clientUnitId: created.clientUnitId || null,
      ipAddress,
      userAgent,
      requestId,
      data: {
        code: created.code,
        status: created.status,
        title: created.title,
      },
    });

    return NextResponse.json({
      session: created,
      // Importante: código e token ficam ocultos na UX (mantidos para implementação futura).
      // Não retornamos code/token para evitar “sala inválida” e simplificar entrada.
    });
  } catch (error: any) {
    console.error("classrooms create error", error);
    return NextResponse.json({ error: "Erro ao criar sala" }, { status: 500 });
  }
}

