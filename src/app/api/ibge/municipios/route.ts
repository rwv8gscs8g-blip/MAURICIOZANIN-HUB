import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uf = searchParams.get("uf") || "PE";

  try {
    const municipiosDb = await prisma.municipio.findMany({
      where: { uf },
      orderBy: { nome: "asc" },
      select: { ibgeId: true, nome: true, fontes: true },
    });

    if (municipiosDb.length) {
      const origem = (municipiosDb[0].fontes as any)?.origemMunicipios || null;
      return NextResponse.json({
        municipios: municipiosDb.map((item) => ({
          id: item.ibgeId,
          nome: item.nome,
          uf,
          fonte: (item.fontes as any)?.origemMunicipios || origem,
        })),
        fonte: origem,
      });
    }

    const response = await fetch(`${IBGE_BASE}/estados/${uf}/municipios`, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Falha ao consultar municípios no IBGE" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const municipios = data.map((item: any) => ({
      id: String(item.id),
      nome: item.nome,
      microrregiao: item.microrregiao?.nome || null,
      mesorregiao: item.microrregiao?.mesorregiao?.nome || null,
      uf,
      fonte: "IBGE API",
    }));

    return NextResponse.json({ municipios, fonte: "IBGE API" });
  } catch (error) {
    console.error("IBGE municipios error", error);
    return NextResponse.json(
      { error: "Erro ao consultar municípios" },
      { status: 500 }
    );
  }
}
