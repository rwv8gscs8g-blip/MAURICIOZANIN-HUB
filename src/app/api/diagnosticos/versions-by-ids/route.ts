import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * GET /api/diagnosticos/versions-by-ids?ids=id1,id2
 * Retorna as versões (snapshots) pelos ids, com diagnostico e municipio para impressão.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    if (!idsParam || !idsParam.trim()) {
      return NextResponse.json({ error: "Parâmetro ids é obrigatório" }, { status: 400 });
    }
    const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json({ error: "Nenhum id de versão informado" }, { status: 400 });
    }

    const versions = await prisma.diagnosticoVersion.findMany({
      where: { id: { in: ids } },
      orderBy: { versionNumber: "asc" },
      include: {
        diagnostico: {
          select: {
            id: true,
            municipioIbgeId: true,
            status: true,
            municipio: { select: { nome: true, uf: true } },
          },
        },
      },
    });

    if (versions.length === 0) {
      return NextResponse.json({ versions: [], diagnostico: null, municipio: null }, { status: 200 });
    }

    const first = versions[0];
    const diagnostico = first.diagnostico;
    const municipio = diagnostico?.municipio
      ? { nome: diagnostico.municipio.nome, uf: diagnostico.municipio.uf }
      : null;

    return NextResponse.json({
      versions: versions.map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
        createdAt: v.createdAt.toISOString(),
        snapshot: v.snapshot,
      })),
      diagnostico: diagnostico
        ? {
            id: diagnostico.id,
            municipioIbgeId: diagnostico.municipioIbgeId,
            status: diagnostico.status,
          }
        : null,
      municipio,
    });
  } catch (error) {
    console.error("versions-by-ids error", error);
    return NextResponse.json(
      { error: "Erro ao carregar versões" },
      { status: 500 }
    );
  }
}
