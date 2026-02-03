"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { eixosDiagnostico, type EixoKey } from "@/data/diagnostico-eixos";
import { ConsultorNotesClient } from "./ConsultorNotesClient";
import { cn } from "@/lib/utils";

type VersionDto = {
  id: string;
  versionNumber: number;
  createdAt: string;
  createdByRole: string;
  snapshot: {
    status?: string;
    respondentName?: string;
    respondentEmail?: string;
    respondentPhone?: string;
    dataDiagnostico?: string;
    eixoRespostas?: Array<{
      eixoKey: string;
      positivoParte1?: unknown;
      positivoParte2?: string;
      positivoNota?: number;
      negativoParte1?: unknown;
      negativoParte2?: string;
      negativoNota?: number;
      solucaoParte1?: unknown;
      solucaoParte2?: string;
      solucaoNota?: number;
    }>;
    analises?: Array<{
      eixoKey: string;
      positivoParte3?: string;
      negativoParte3?: string;
      solucaoParte3?: string;
    }>;
    perguntasChave?: Record<string, unknown>;
  };
};

type EixoDto = {
  eixoKey: string;
  positivoParte1: unknown;
  positivoParte2: string | null;
  positivoNota: number | null;
  negativoParte1: unknown;
  negativoParte2: string | null;
  negativoNota: number | null;
  solucaoParte1: unknown;
  solucaoParte2: string | null;
  solucaoNota: number | null;
  positivoNotaConsultor: number | null;
  negativoNotaConsultor: number | null;
  solucaoNotaConsultor: number | null;
};

type AnaliseDto = {
  eixoKey: string;
  positivoParte3: string | null;
  negativoParte3: string | null;
  solucaoParte3: string | null;
};

export function DiagnosticoMunicipioViewClient({
  municipio,
  diagnostico,
  versions,
  isConsultant,
}: {
  municipio: { ibgeId: string; nome: string | null; uf: string | null };
  diagnostico: {
    id: string;
    status: string;
    updatedAt: string;
    eixos: EixoDto[];
    analises: AnaliseDto[];
    perguntas: { consultorAnalise: string | null } | null;
  } | null;
  versions: VersionDto[];
  isConsultant: boolean;
}) {
  const sortedVersions = useMemo(
    () => [...versions].sort((a, b) => a.versionNumber - b.versionNumber),
    [versions]
  );

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    sortedVersions.length > 0 ? sortedVersions[sortedVersions.length - 1]?.id ?? null : null
  );
  const [compareLeftId, setCompareLeftId] = useState<string | null>(null);
  const [compareRightId, setCompareRightId] = useState<string | null>(null);
  const [marcoBusy, setMarcoBusy] = useState(false);
  const router = useRouter();

  const selectedVersion = versions.find((v) => v.id === selectedVersionId) ?? null;
  const compareLeft = versions.find((v) => v.id === compareLeftId) ?? null;
  const compareRight = versions.find((v) => v.id === compareRightId) ?? null;

  function renderJsonAsList(value: unknown): string[] {
    if (Array.isArray(value)) return value.map((x) => (typeof x === "string" ? x : String(x)));
    if (typeof value === "string") return [value];
    return [];
  }

  /** Nota do município (Parte 1 e 2) — usada no relatório em texto */
  function resolveNota(eixo: { positivoNota?: number; negativoNota?: number; solucaoNota?: number } | undefined, bloco: "positivo" | "negativo" | "solucao"): number {
    if (!eixo) return 0;
    const n = bloco === "positivo" ? eixo.positivoNota : bloco === "negativo" ? eixo.negativoNota : eixo.solucaoNota;
    return typeof n === "number" ? n : 0;
  }

  /** Nota para gráficos e evolução: preferir nota do consultor quando existir, senão nota do município */
  function resolveNotaParaGrafico(
    eixo: {
      positivoNota?: number;
      negativoNota?: number;
      solucaoNota?: number;
      positivoNotaConsultor?: number | null;
      negativoNotaConsultor?: number | null;
      solucaoNotaConsultor?: number | null;
    } | undefined,
    bloco: "positivo" | "negativo" | "solucao"
  ): number {
    if (!eixo) return 0;
    const consultor =
      bloco === "positivo"
        ? eixo.positivoNotaConsultor
        : bloco === "negativo"
          ? eixo.negativoNotaConsultor
          : eixo.solucaoNotaConsultor;
    if (typeof consultor === "number" && !Number.isNaN(consultor)) return consultor;
    return resolveNota(eixo, bloco);
  }

  const PERGUNTAS_LABELS: Record<string, string> = {
    pcaPacPncp: "PCA/PAC no PNCP",
    integracaoPlanejamento: "Integração planejamento e compras",
    sebraeSolucoes: "Soluções SEBRAE no planejamento",
    sistemasUtilizados: "Sistemas utilizados",
    tramitacaoEletronicaNota: "Grau de tramitação eletrônica",
    tramitacaoEletronicaComentario: "Comentário tramitação eletrônica",
    salaEmpreendedor: "Sala do Empreendedor",
    estrategiasFornecedores: "Estratégias com fornecedores locais",
    beneficiosLc123: "Benefícios LC 123/2006",
    integracaoSustentabilidade: "Sustentabilidade e agricultura familiar",
    consultorAnalise: "Análise do consultor",
  };

  // Nota geral por versão (T0, T1, …) para o gráfico de evolução — usa nota do consultor quando existir
  const evolucaoNotas = useMemo(() => {
    return sortedVersions.map((v) => {
      const eixoRespostas = v.snapshot?.eixoRespostas ?? [];
      const notas = eixoRespostas.flatMap((e: { eixoKey: string; positivoNota?: number; negativoNota?: number; solucaoNota?: number; positivoNotaConsultor?: number | null; negativoNotaConsultor?: number | null; solucaoNotaConsultor?: number | null }) => [
        resolveNotaParaGrafico(e, "positivo"),
        resolveNotaParaGrafico(e, "negativo"),
        resolveNotaParaGrafico(e, "solucao"),
      ]);
      const media = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;
      return {
        versionId: v.id,
        label: `T${v.versionNumber - 1}`,
        nota: Math.round(media * 10) / 10,
        versionNumber: v.versionNumber,
      };
    });
  }, [sortedVersions]);

  const chartWidth = 560;
  const chartHeight = 200;
  const chartPadding = { top: 16, right: 16, bottom: 36, left: 40 };
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const maxNota = 10;
  const hasEvolucaoData = evolucaoNotas.length > 0 && evolucaoNotas.some((p) => p.nota > 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid max-w-5xl space-y-8">
        {/* Cabeçalho */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#64748B]">Visualização do diagnóstico</div>
              <h1 className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
                {municipio.nome || "Município"} {municipio.uf ? `(${municipio.uf})` : ""}
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
                IBGE: <span className="font-mono text-[#0F172A]">{municipio.ibgeId}</span>
                {diagnostico ? (
                  <>
                    {" · "}
                    Última atualização: {new Date(diagnostico.updatedAt).toLocaleString("pt-BR")}
                  </>
                ) : (
                  " · Radiografia disponível para todos os municípios"
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/diagnostico?municipio=${municipio.ibgeId}`}
                className="px-4 py-2 border border-[#E2E8F0] text-sm text-[#0F172A] bg-white rounded-lg hover:bg-[#F8FAFC]"
              >
                {diagnostico ? "Preencher / editar diagnóstico" : "Preencher diagnóstico"}
              </Link>
              {isConsultant && diagnostico && (
                <button
                  type="button"
                  disabled={marcoBusy}
                  onClick={async () => {
                    setMarcoBusy(true);
                    try {
                      const res = await fetch(`/api/diagnosticos/${diagnostico.id}/marco`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ label: `T${sortedVersions.length}` }),
                      });
                      if (res.ok) router.refresh();
                    } finally {
                      setMarcoBusy(false);
                    }
                  }}
                  className="px-4 py-2 border border-[#0F766E] text-sm text-[#0F766E] bg-white rounded-lg hover:bg-teal-50 disabled:opacity-50"
                >
                  {marcoBusy ? "Registrando…" : "Registrar marco (T0/T1/T2)"}
                </button>
              )}
              {diagnostico && (
                <Link
                  href={`/diagnostico/municipio/${municipio.ibgeId}/imprimir`}
                  className="px-4 py-2 border border-[#0F766E] text-sm text-[#0F766E] bg-white rounded-lg hover:bg-teal-50"
                >
                  Imprimir relatório
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Radiografia dos Diagnósticos — Gráfico de linha de evolução (T0 → T1 → …) */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden" aria-label="Radiografia dos diagnósticos">
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-4">
            <h2 className="text-lg font-semibold text-[#0F172A]">Radiografia dos diagnósticos</h2>
            <p className="text-sm text-[#64748B] mt-1">
              Evolução da nota geral do município ao longo dos marcos T0, T1, T2, T3, T4… Clique em uma versão abaixo para ler o relatório completo.
            </p>
          </div>
          <div className="p-6">
            {!hasEvolucaoData ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] py-12 text-sm text-[#64748B]">
                {sortedVersions.length === 0
                  ? "Nenhuma versão registrada ainda. Os dados aparecerão aqui quando houver marcos T0, T1, etc."
                  : "Não há notas calculadas para exibir no gráfico. Preencha as respostas do diagnóstico para ver a evolução."}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <svg width={chartWidth} height={chartHeight} className="overflow-visible" aria-hidden>
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1E3A8A" />
                      <stop offset="100%" stopColor="#0F766E" />
                    </linearGradient>
                  </defs>
                  {/* Eixo Y (nota 0–10) */}
                  <line
                    x1={chartPadding.left}
                    y1={chartPadding.top}
                    x2={chartPadding.left}
                    y2={chartPadding.top + plotHeight}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  {[0, 2, 4, 6, 8, 10].map((n) => {
                    const y = chartPadding.top + plotHeight - (n / maxNota) * plotHeight;
                    return (
                      <g key={n}>
                        <line
                          x1={chartPadding.left}
                          y1={y}
                          x2={chartPadding.left + plotWidth}
                          y2={y}
                          stroke="#F1F5F9"
                          strokeWidth="1"
                          strokeDasharray="4 2"
                        />
                        <text x={chartPadding.left - 8} y={y + 4} textAnchor="end" className="fill-[#64748B] text-[10px]">
                          {n}
                        </text>
                      </g>
                    );
                  })}
                  {/* Eixo X (T0, T1, …) */}
                  <line
                    x1={chartPadding.left}
                    y1={chartPadding.top + plotHeight}
                    x2={chartPadding.left + plotWidth}
                    y2={chartPadding.top + plotHeight}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  {/* Linha de evolução */}
                  {evolucaoNotas.length >= 1 && (
                    <g>
                      <polyline
                        fill="none"
                        stroke="url(#lineGrad)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={evolucaoNotas
                          .map((p, i) => {
                            const x = chartPadding.left + (evolucaoNotas.length <= 1 ? plotWidth / 2 : (i / (evolucaoNotas.length - 1)) * plotWidth);
                            const y = chartPadding.top + plotHeight - (p.nota / maxNota) * plotHeight;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                      {evolucaoNotas.map((p, i) => {
                        const x = chartPadding.left + (evolucaoNotas.length <= 1 ? plotWidth / 2 : (i / (evolucaoNotas.length - 1)) * plotWidth);
                        const y = chartPadding.top + plotHeight - (p.nota / maxNota) * plotHeight;
                        const isSelected = selectedVersionId === p.versionId;
                        return (
                          <g key={p.versionId}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isSelected ? 8 : 6}
                              fill={isSelected ? "#1E3A8A" : "#0F766E"}
                              stroke="#fff"
                              strokeWidth="2"
                              className="cursor-pointer"
                              onClick={() => setSelectedVersionId(p.versionId)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === "Enter" && setSelectedVersionId(p.versionId)}
                              aria-label={`Versão ${p.label}, nota ${p.nota}. Clique para ver relatório.`}
                            />
                            <text
                              x={x}
                              y={chartPadding.top + plotHeight + 18}
                              textAnchor="middle"
                              className="fill-[#64748B] text-[10px] font-medium"
                            >
                              {p.label}
                            </text>
                            <text x={x} y={y - 10} textAnchor="middle" className="fill-[#0F172A] text-[10px] font-semibold">
                              {p.nota}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  )}
                </svg>
              </div>
            )}
          </div>
        </section>

        {/* Versões T0, T1, T2… — Clique para ler o relatório completo abaixo */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-4">
            <h2 className="text-lg font-semibold text-[#0F172A]">Relatórios por versão (T0, T1, T2…)</h2>
            <p className="text-sm text-[#64748B] mt-1">
              Clique em uma versão para ler o relatório completo na íntegra no visualizador abaixo.
            </p>
          </div>
          <div className="p-6">
            {sortedVersions.length === 0 ? (
              <p className="text-sm text-[#64748B]">Nenhuma versão registrada ainda.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sortedVersions.map((version) => {
                  const label = `T${version.versionNumber - 1}`;
                  const isSelected = selectedVersionId === version.id;
                  return (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => setSelectedVersionId(version.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-[#1E3A8A] text-white"
                          : "bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0]"
                      )}
                      aria-pressed={isSelected}
                      aria-label={`Ver relatório ${label} completo`}
                    >
                      {label} ({new Date(version.createdAt).toLocaleDateString("pt-BR")})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Visualizador do relatório completo da versão selecionada (T0, T1, …) */}
        {selectedVersion && (
          <section className="bg-white border-2 border-[#1E3A8A] rounded-xl shadow-sm overflow-hidden" id="relatorio-completo" aria-label={`Relatório completo versão T${selectedVersion.versionNumber - 1}`}>
            <div className="bg-[#EFF6FF] border-b border-[#1E3A8A] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#0F172A]">
                Relatório T{selectedVersion.versionNumber - 1} na íntegra
              </h2>
              <p className="text-sm text-[#64748B] mt-1">
                Status: {selectedVersion.snapshot?.status ?? "—"} ·{" "}
                {new Date(selectedVersion.createdAt).toLocaleString("pt-BR")}
                {selectedVersion.snapshot?.respondentName && (
                  <> · Responsável: {selectedVersion.snapshot.respondentName}</>
                )}
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Identificação */}
              <div>
                <h3 className="text-sm font-semibold text-[#64748B] uppercase tracking-wider mb-2">Identificação</h3>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 grid gap-2 text-sm text-[#0F172A]">
                  <div><span className="text-[#64748B]">Responsável:</span> {selectedVersion.snapshot?.respondentName ?? "—"}</div>
                  <div><span className="text-[#64748B]">E-mail:</span> {selectedVersion.snapshot?.respondentEmail ?? "—"}</div>
                  <div><span className="text-[#64748B]">Telefone:</span> {selectedVersion.snapshot?.respondentPhone ?? "—"}</div>
                  <div>
                    <span className="text-[#64748B]">Data do diagnóstico:</span>{" "}
                    {selectedVersion.snapshot?.dataDiagnostico
                      ? new Date(selectedVersion.snapshot.dataDiagnostico).toLocaleDateString("pt-BR")
                      : "—"}
                  </div>
                </div>
              </div>

              {/* Eixos */}
              {eixosDiagnostico.map((eixo) => {
                const eixoSnapshot = selectedVersion.snapshot?.eixoRespostas?.find((e: { eixoKey: string }) => e.eixoKey === eixo.key);
                const eixoAnalise = selectedVersion.snapshot?.analises?.find((e: { eixoKey: string }) => e.eixoKey === eixo.key);
                if (!eixoSnapshot) return null;
                const posList = renderJsonAsList(eixoSnapshot.positivoParte1);
                const negList = renderJsonAsList(eixoSnapshot.negativoParte1);
                const solList = renderJsonAsList(eixoSnapshot.solucaoParte1);
                return (
                  <div key={eixo.key} className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                    <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3">
                      <h3 className="font-semibold text-[#0F172A]">{eixo.title}</h3>
                      <p className="text-xs text-[#64748B] mt-1">
                        Notas: Positivo {resolveNota(eixoSnapshot, "positivo")} · Negativo {resolveNota(eixoSnapshot, "negativo")} · Solução {resolveNota(eixoSnapshot, "solucao")}
                      </p>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-1">Resposta do município — Aspectos positivos</h4>
                        {posList.length > 0 && (
                          <ul className="list-disc list-inside text-sm text-[#0F172A] space-y-0.5">
                            {posList.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        )}
                        {eixoSnapshot.positivoParte2 && <p className="mt-2 text-sm text-[#0F172A]">{eixoSnapshot.positivoParte2}</p>}
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-1">Resposta do município — Aspectos negativos</h4>
                        {negList.length > 0 && (
                          <ul className="list-disc list-inside text-sm text-[#0F172A] space-y-0.5">
                            {negList.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        )}
                        {eixoSnapshot.negativoParte2 && <p className="mt-2 text-sm text-[#0F172A]">{eixoSnapshot.negativoParte2}</p>}
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-1">Resposta do município — Alternativas de solução</h4>
                        {solList.length > 0 && (
                          <ul className="list-disc list-inside text-sm text-[#0F172A] space-y-0.5">
                            {solList.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        )}
                        {eixoSnapshot.solucaoParte2 && <p className="mt-2 text-sm text-[#0F172A]">{eixoSnapshot.solucaoParte2}</p>}
                      </div>
                      <div className="border-t border-[#E2E8F0] pt-3 mt-3">
                        <h4 className="text-xs font-medium text-[#0F766E] uppercase tracking-wider mb-2">Comentário e nota do consultor</h4>
                        {(eixoAnalise?.positivoParte3 || eixoAnalise?.negativoParte3 || eixoAnalise?.solucaoParte3) ? (
                          <div className="text-sm text-[#0F172A] space-y-1">
                            {eixoAnalise?.positivoParte3 && <div><strong>Positivo:</strong> {eixoAnalise.positivoParte3}</div>}
                            {eixoAnalise?.negativoParte3 && <div><strong>Negativo:</strong> {eixoAnalise.negativoParte3}</div>}
                            {eixoAnalise?.solucaoParte3 && <div><strong>Solução:</strong> {eixoAnalise.solucaoParte3}</div>}
                          </div>
                        ) : (
                          <p className="text-xs text-[#94A3B8]">Nenhum comentário do consultor ainda.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Perguntas chave */}
              {selectedVersion.snapshot?.perguntasChave && Object.keys(selectedVersion.snapshot.perguntasChave).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#64748B] uppercase tracking-wider mb-2">Perguntas chave</h3>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 space-y-3">
                    {Object.entries(selectedVersion.snapshot.perguntasChave).map(([key, value]) => {
                      if (value == null || value === "") return null;
                      const label = PERGUNTAS_LABELS[key] ?? key;
                      return (
                        <div key={key}>
                          <h4 className="text-xs font-medium text-[#64748B]">{label}</h4>
                          <p className="mt-0.5 text-sm text-[#0F172A]">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
        </section>
        )}

        {/* Gráfico comparativo de evolução (T0 → T1 → T2…) */}
        {sortedVersions.length >= 1 && (
          <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#0F172A]">Gráfico comparativo de evolução</h2>
              <p className="text-sm text-[#64748B] mt-1">
                Evolução da nota média por eixo ao longo dos marcos (T0, T1, T2…). Verde = avanço, vermelho = retrocesso.
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {eixosDiagnostico.map((eixo) => {
                  const valores = sortedVersions.map((v) => {
                    const e = v.snapshot?.eixoRespostas?.find((x: { eixoKey: string }) => x.eixoKey === eixo.key);
                    const media = e
                      ? (resolveNotaParaGrafico(e, "positivo") + resolveNotaParaGrafico(e, "negativo") + resolveNotaParaGrafico(e, "solucao")) / 3
                      : 0;
                    return { versionNumber: v.versionNumber, media, label: `T${v.versionNumber - 1}` };
                  });
                  const maxVal = 10;
                  return (
                    <div key={eixo.key} className="border border-[#E2E8F0] rounded-lg p-4">
                      <div className="text-sm font-medium text-[#0F172A] mb-3">{eixo.title}</div>
                      <div className="flex items-end gap-2" style={{ minHeight: 48 }}>
                        {valores.map((item, idx) => {
                          const prev = valores[idx - 1]?.media ?? item.media;
                          const delta = item.media - prev;
                          const isUp = delta > 0;
                          const isDown = delta < 0;
                          const heightPct = Math.min(100, (item.media / maxVal) * 100);
                          return (
                            <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className={cn(
                                  "w-full rounded-t min-h-[6px] transition-all",
                                  isUp && "bg-emerald-500",
                                  isDown && "bg-rose-500",
                                  !isUp && !isDown && "bg-[#94A3B8]"
                                )}
                                style={{ height: `${Math.max(6, (heightPct / 100) * 40)}px` }}
                              />
                              <span className="text-[10px] text-[#64748B]">{item.label}</span>
                              <span className="text-xs font-medium text-[#0F172A]">{item.media.toFixed(1)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Comparativo entre versões (tabela A vs B) */}
        {sortedVersions.length >= 2 && (
          <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#0F172A]">Comparativo entre duas versões</h2>
              <p className="text-sm text-[#64748B] mt-1">
                Selecione duas versões para comparar notas e evolução.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-2 text-sm text-[#64748B]">
                  Versão A
                  <select
                    className="border border-[#E2E8F0] px-3 py-2 rounded-lg text-[#0F172A]"
                    value={compareLeftId ?? ""}
                    onChange={(e) => setCompareLeftId(e.target.value || null)}
                  >
                    <option value="">Selecione</option>
                    {sortedVersions.map((v) => (
                      <option key={v.id} value={v.id}>
                        T{v.versionNumber - 1} ({new Date(v.createdAt).toLocaleDateString("pt-BR")})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-[#64748B]">
                  Versão B
                  <select
                    className="border border-[#E2E8F0] px-3 py-2 rounded-lg text-[#0F172A]"
                    value={compareRightId ?? ""}
                    onChange={(e) => setCompareRightId(e.target.value || null)}
                  >
                    <option value="">Selecione</option>
                    {sortedVersions.map((v) => (
                      <option key={v.id} value={v.id}>
                        T{v.versionNumber - 1} ({new Date(v.createdAt).toLocaleDateString("pt-BR")})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {compareLeft && compareRight && (
                <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 gap-0 border-b border-[#E2E8F0]">
                    <div className="bg-[#F1F5F9] px-4 py-2 text-sm font-medium text-[#0F172A]">
                      T{compareLeft.versionNumber - 1}
                    </div>
                    <div className="bg-[#F1F5F9] px-4 py-2 text-sm font-medium text-[#0F172A]">
                      T{compareRight.versionNumber - 1}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 text-sm">
                    {eixosDiagnostico.map((eixo) => {
                      const leftEixo = compareLeft.snapshot?.eixoRespostas?.find((e: { eixoKey: string }) => e.eixoKey === eixo.key);
                      const rightEixo = compareRight.snapshot?.eixoRespostas?.find((e: { eixoKey: string }) => e.eixoKey === eixo.key);
                      const leftMedia = leftEixo
                        ? (resolveNotaParaGrafico(leftEixo, "positivo") + resolveNotaParaGrafico(leftEixo, "negativo") + resolveNotaParaGrafico(leftEixo, "solucao")) / 3
                        : 0;
                      const rightMedia = rightEixo
                        ? (resolveNotaParaGrafico(rightEixo, "positivo") + resolveNotaParaGrafico(rightEixo, "negativo") + resolveNotaParaGrafico(rightEixo, "solucao")) / 3
                        : 0;
                      const delta = rightMedia - leftMedia;
                      return (
                        <div key={eixo.key} className="col-span-2 flex items-center justify-between gap-4 py-2 border-b border-[#E2E8F0] last:border-0">
                          <span className="font-medium text-[#0F172A]">{eixo.title}</span>
                          <div className="flex items-center gap-4 text-[#64748B]">
                            <span>T{compareLeft.versionNumber - 1}: <strong className="text-[#0F172A]">{leftMedia.toFixed(1)}</strong></span>
                            <span>→</span>
                            <span>T{compareRight.versionNumber - 1}: <strong className="text-[#0F172A]">{rightMedia.toFixed(1)}</strong></span>
                            <span
                              className={cn(
                                "font-medium",
                                delta > 0 && "text-emerald-600",
                                delta < 0 && "text-rose-600",
                                delta === 0 && "text-[#64748B]"
                              )}
                            >
                              {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Análise do consultor (só para consultor e quando há diagnóstico) */}
        {isConsultant && diagnostico && (
          <section id="analise" className="scroll-mt-8">
          <ConsultorNotesClient
            municipio={{ ibgeId: municipio.ibgeId, nome: municipio.nome, uf: municipio.uf }}
            diagnostico={{
              id: diagnostico.id,
              status: diagnostico.status,
              updatedAt: diagnostico.updatedAt,
              eixos: diagnostico.eixos.map((e) => ({
                eixoKey: e.eixoKey as EixoKey,
                positivoParte1: e.positivoParte1,
                positivoParte2: e.positivoParte2 ?? null,
                negativoParte1: e.negativoParte1,
                negativoParte2: e.negativoParte2 ?? null,
                solucaoParte1: e.solucaoParte1,
                solucaoParte2: e.solucaoParte2 ?? null,
                positivoNotaConsultor: e.positivoNotaConsultor ?? null,
                negativoNotaConsultor: e.negativoNotaConsultor ?? null,
                solucaoNotaConsultor: e.solucaoNotaConsultor ?? null,
              })),
              analises: diagnostico.analises.map((a) => ({
                eixoKey: a.eixoKey as EixoKey,
                positivoParte3: a.positivoParte3 ?? null,
                negativoParte3: a.negativoParte3 ?? null,
                solucaoParte3: a.solucaoParte3 ?? null,
              })),
              perguntas: diagnostico.perguntas ? { consultorAnalise: diagnostico.perguntas.consultorAnalise ?? null } : null,
            }}
          />
          </section>
        )}
      </div>
    </div>
  );
}
