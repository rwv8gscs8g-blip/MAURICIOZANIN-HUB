import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DiagnosticoImprimirSelecaoClient } from "./DiagnosticoImprimirSelecaoClient";

export const dynamic = "force-dynamic";

async function fetchMunicipioLabel(ibgeId: string): Promise<{ nome: string | null; uf: string | null }> {
  const db = await prisma.municipio.findUnique({
    where: { ibgeId },
    select: { nome: true, uf: true },
  });
  if (db?.nome) return { nome: db.nome, uf: db.uf || null };
  try {
    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${ibgeId}`,
      { next: { revalidate: 60 * 60 * 24 } }
    );
    if (!res.ok) return { nome: null, uf: null };
    const data: { nome?: string; microrregiao?: { mesorregiao?: { UF?: { sigla?: string } } } } = await res.json();
    return {
      nome: data?.nome || null,
      uf: data?.microrregiao?.mesorregiao?.UF?.sigla || null,
    };
  } catch {
    return { nome: null, uf: null };
  }
}

export default async function DiagnosticoMunicipioImprimirPage({
  params,
}: {
  params: Promise<{ ibgeId: string }>;
}) {
  const resolvedParams = await params;
  const ibgeId = String(resolvedParams.ibgeId || "").trim();
  if (!ibgeId) redirect("/diagnostico");

  const session = await getSession();
  if (!session?.user) {
    redirect(`/auth/login?next=${encodeURIComponent(`/diagnostico/municipio/${ibgeId}/imprimir`)}`);
  }

  const municipio = await fetchMunicipioLabel(ibgeId);
  const diagnostico = await prisma.diagnostico.findFirst({
    where: { municipioIbgeId: ibgeId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (!diagnostico) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid max-w-2xl">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8">
            <p className="text-[#64748B]">Nenhum diagnóstico encontrado para este município.</p>
            <Link
              href={`/diagnostico/municipio/${ibgeId}`}
              className="mt-4 inline-block text-[#1E3A8A] hover:underline"
            >
              Voltar à ficha do município
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const versions = await prisma.diagnosticoVersion.findMany({
    where: { diagnosticoId: diagnostico.id },
    orderBy: { versionNumber: "asc" },
    select: { id: true, versionNumber: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid max-w-2xl space-y-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-[#0F172A]">
            Imprimir relatório — {municipio.nome || "Município"} {municipio.uf ? `(${municipio.uf})` : ""}
          </h1>
          <p className="text-sm text-[#64748B] mt-2">
            Selecione uma ou mais versões (T0, T1, T2…) para incluir no relatório. Será gerado um único documento para impressão.
          </p>
        </div>
        <DiagnosticoImprimirSelecaoClient
          ibgeId={ibgeId}
          municipioNome={municipio.nome || "Município"}
          municipioUf={municipio.uf}
          versions={versions.map((v) => ({
            id: v.id,
            versionNumber: v.versionNumber,
            createdAt: v.createdAt.toISOString(),
          }))}
          diagnosticoId={diagnostico.id}
        />
      </div>
    </div>
  );
}
