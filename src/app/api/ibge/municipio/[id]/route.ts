import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";
const POP_BASE = "https://servicodados.ibge.gov.br/api/v1/projecoes/populacao/municipios";

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  try {
    const municipioDb = await prisma.municipio.findUnique({
      where: { ibgeId: String(id) },
      select: {
        ibgeId: true,
        nome: true,
        uf: true,
        populacao: true,
        areaKm2: true,
        densidade: true,
        idhm: true,
        pibPerCapita: true,
        fontes: true,
      },
    });

    // Primeiro tenta usar os dados já importados para a base (especialmente para os 7 municípios piloto),
    // evitando depender da API externa do IBGE para o cartão do município.
    if (municipioDb) {
      const fontes = (municipioDb.fontes as any) || {};
      return NextResponse.json({
        ibgeId: municipioDb.ibgeId,
        nome: municipioDb.nome,
        uf: municipioDb.uf,
        areaKm2: municipioDb.areaKm2 ?? null,
        populacao: municipioDb.populacao ?? null,
        densidade: municipioDb.densidade ?? null,
        pibPerCapita: municipioDb.pibPerCapita ?? null,
        idhm: municipioDb.idhm ?? null,
        populacaoFonte: fontes.populacaoFonte || null,
        fontes: {
          ibgeMunicipio: fontes.ibgeMunicipio || null,
          ibgePopulacao: fontes.ibgePopulacao || null,
          origemMunicipios: fontes.origemMunicipios || null,
          wikipediaLocalizacao: fontes.wikipediaLocalizacao || null,
        },
      });
    }

    // Fallback: consulta a API pública do IBGE.
    const [municipioRes, populacaoRes] = await Promise.all([
      fetch(`${IBGE_BASE}/municipios/${id}`, { next: { revalidate: 60 * 60 * 24 } }),
      fetch(`${POP_BASE}/${id}`, { next: { revalidate: 60 * 60 * 24 } }),
    ]);

    if (!municipioRes.ok) {
      return NextResponse.json(
        { error: "Município não encontrado" },
        { status: 404 }
      );
    }

    const municipioData = await municipioRes.json();
    const popData = populacaoRes.ok ? await populacaoRes.json() : null;

    const areaKm2 = municipioData?.area?.["total"] || municipioData?.area?.total || null;
    const populacao = popData?.projecao?.populacao || null;
    const densidade = areaKm2 && populacao ? Number((populacao / areaKm2).toFixed(2)) : null;

    return NextResponse.json({
      ibgeId: String(municipioData.id),
      nome: municipioData.nome,
      uf: municipioData.microrregiao?.mesorregiao?.UF?.sigla || null,
      areaKm2,
      populacao,
      densidade,
      pibPerCapita: null,
      idhm: null,
      populacaoFonte: populacao ? "IBGE (projecao)" : null,
      fontes: {
        ibgeMunicipio: `${IBGE_BASE}/municipios/${id}`,
        ibgePopulacao: `${POP_BASE}/${id}`,
        origemMunicipios: null,
        wikipediaLocalizacao: null,
      },
    });
  } catch (error) {
    console.error("IBGE municipio error", error);
    return NextResponse.json(
      { error: "Erro ao consultar município" },
      { status: 500 }
    );
  }
}
