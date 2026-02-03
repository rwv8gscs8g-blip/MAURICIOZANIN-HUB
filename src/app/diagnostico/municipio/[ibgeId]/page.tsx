import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DiagnosticoMunicipioViewClient } from "./DiagnosticoMunicipioViewClient";

export const dynamic = "force-dynamic";

const PRIVILEGED_ROLES = ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] as const;

async function fetchMunicipioLabel(ibgeId: string): Promise<{ nome: string | null; uf: string | null }> {
  const db = await prisma.municipio.findUnique({
    where: { ibgeId },
    select: { nome: true, uf: true },
  });
  if (db?.nome) return { nome: db.nome, uf: db.uf || null };
  try {
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${ibgeId}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
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

export default async function DiagnosticoMunicipioPage({
  params,
}: {
  params: Promise<{ ibgeId: string }>;
}) {
  const resolvedParams = await params;
  const ibgeId = String(resolvedParams.ibgeId || "").trim();
  if (!ibgeId) redirect("/diagnostico");

  const session = await getSession();
  if (!session?.user) {
    redirect(`/auth/login?next=${encodeURIComponent(`/diagnostico/municipio/${ibgeId}`)}`);
  }

  const municipioLabel = await fetchMunicipioLabel(ibgeId);

  const diagnostico = await prisma.diagnostico.findFirst({
    where: { municipioIbgeId: ibgeId },
    orderBy: { updatedAt: "desc" },
    include: {
      eixos: true,
      analises: true,
      perguntas: true,
    },
  });

  const versions = diagnostico
    ? await prisma.diagnosticoVersion.findMany({
        where: { diagnosticoId: diagnostico.id },
        orderBy: { versionNumber: "desc" },
      })
    : [];

  const isConsultant = PRIVILEGED_ROLES.includes(session.user.role as (typeof PRIVILEGED_ROLES)[number]);

  return (
    <DiagnosticoMunicipioViewClient
      municipio={{ ibgeId, nome: municipioLabel.nome, uf: municipioLabel.uf }}
      diagnostico={
        diagnostico
          ? {
              id: diagnostico.id,
              status: diagnostico.status,
              updatedAt: diagnostico.updatedAt.toISOString(),
              eixos: diagnostico.eixos.map((e) => ({
                eixoKey: e.eixoKey,
                positivoParte1: e.positivoParte1,
                positivoParte2: e.positivoParte2,
                positivoNota: e.positivoNota,
                negativoParte1: e.negativoParte1,
                negativoParte2: e.negativoParte2,
                negativoNota: e.negativoNota,
                solucaoParte1: e.solucaoParte1,
                solucaoParte2: e.solucaoParte2,
                solucaoNota: e.solucaoNota,
                positivoNotaConsultor: e.positivoNotaConsultor ?? null,
                negativoNotaConsultor: e.negativoNotaConsultor ?? null,
                solucaoNotaConsultor: e.solucaoNotaConsultor ?? null,
              })),
              analises: diagnostico.analises.map((a) => ({
                eixoKey: a.eixoKey,
                positivoParte3: a.positivoParte3 ?? null,
                negativoParte3: a.negativoParte3 ?? null,
                solucaoParte3: a.solucaoParte3 ?? null,
              })),
              perguntas: diagnostico.perguntas
                ? { consultorAnalise: diagnostico.perguntas.consultorAnalise ?? null }
                : null,
            }
          : null
      }
      versions={
        diagnostico
          ? versions.map((v) => ({
              id: v.id,
              versionNumber: v.versionNumber,
              createdAt: v.createdAt.toISOString(),
              createdByRole: v.createdByRole,
              snapshot: (v.snapshot as Record<string, unknown>) || {},
            }))
          : []
      }
      isConsultant={isConsultant}
    />
  );
}
