import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const diagnosticos = await prisma.diagnostico.findMany({
      where: { status: "FINALIZED" },
      select: {
        municipio: { select: { ibgeId: true, nome: true, uf: true } },
        eixos: {
          select: {
            positivoNota: true,
            positivoNotaConsultor: true,
            negativoNota: true,
            negativoNotaConsultor: true,
            solucaoNota: true,
            solucaoNotaConsultor: true,
          },
        },
      },
    });

    const ranking = diagnosticos.map((diagnostico) => {
      const scores = diagnostico.eixos
        .map((eixo) => [
          typeof eixo.positivoNotaConsultor === "number" ? eixo.positivoNotaConsultor : eixo.positivoNota ?? 0,
          typeof eixo.negativoNotaConsultor === "number" ? eixo.negativoNotaConsultor : eixo.negativoNota ?? 0,
          typeof eixo.solucaoNotaConsultor === "number" ? eixo.solucaoNotaConsultor : eixo.solucaoNota ?? 0,
        ])
        .flat();

      const average = scores.length
        ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
        : null;

      return {
        municipio: diagnostico.municipio,
        average,
      };
    });

    return NextResponse.json({
      ranking: ranking
        .filter((item) => item.average !== null)
        .sort((a, b) => (b.average ?? 0) - (a.average ?? 0)),
      disclaimer:
        "Ranking baseado apenas nos diagnósticos registrados no sistema; não representa avaliação oficial.",
    });
  } catch (error) {
    console.error("ranking error", error);
    return NextResponse.json({ error: "Erro ao gerar ranking" }, { status: 500 });
  }
}
