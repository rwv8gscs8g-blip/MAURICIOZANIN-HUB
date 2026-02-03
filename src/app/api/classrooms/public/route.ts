import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/classrooms/public
 * Lista pública (sem login) das salas ATIVAS por município.
 * Não expõe código/token (mantidos apenas para implementação futura).
 */
export async function GET(_request: NextRequest) {
  try {
    // Fecha automaticamente salas vencidas (best-effort).
    const now = new Date();
    await prisma.classroomSession.updateMany({
      where: { status: "ATIVA", expiresAt: { lt: now } },
      data: { status: "ENCERRADA" },
    });

    const rawSessions = await prisma.classroomSession.findMany({
      where: {
        status: { in: ["PREPARACAO", "ATIVA"] },
        municipioIbgeId: { not: null },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ municipioIbgeId: "asc" }],
      select: {
        id: true,
        municipioIbgeId: true,
        expiresAt: true,
        status: true,
        createdAt: true,
        municipio: { select: { nome: true, uf: true } },
      },
      take: 500,
    });

    // Garante no máximo uma sala por município na lista pública:
    // prioriza ATIVA; se não houver, usa a mais antiga em PREPARACAO.
    const byMunicipio = new Map<string, typeof rawSessions[0]>();
    for (const session of rawSessions) {
      if (!session.municipioIbgeId) continue;
      const key = session.municipioIbgeId;
      const current = byMunicipio.get(key);
      if (!current) {
        byMunicipio.set(key, session);
        continue;
      }
      if (current.status === "ATIVA" && session.status !== "ATIVA") {
        continue;
      }
      if (session.status === "ATIVA" && current.status !== "ATIVA") {
        byMunicipio.set(key, session);
        continue;
      }
      if (session.createdAt < current.createdAt) {
        byMunicipio.set(key, session);
      }
    }

    const sessions = Array.from(byMunicipio.values());

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        municipioIbgeId: s.municipioIbgeId,
        expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
        createdAt: s.createdAt.toISOString(),
        status: s.status,
        municipio: s.municipio ? { nome: s.municipio.nome, uf: s.municipio.uf } : null,
      })),
    });
  } catch (error) {
    console.error("classrooms public list error", error);
    return NextResponse.json({ error: "Erro ao listar salas" }, { status: 500 });
  }
}

