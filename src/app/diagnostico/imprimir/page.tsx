"use client";

import "./print.css";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { eixosDiagnostico } from "@/data/diagnostico-eixos";
import { cn } from "@/lib/utils";

type DiagnosticoPayload = {
  id: string;
  status: string;
  respondentName: string | null;
  respondentEmail: string | null;
  respondentPhone: string | null;
  municipioIbgeId: number | null;
  municipio?: {
    nome: string;
    uf: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  finalizedAt: string | null;
  eixos: Array<any>;
  analises: Array<any>;
  perguntas: any | null;
};

const statusLabel: Record<string, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Submetido",
  IN_REVIEW: "Em análise",
  RETURNED: "Devolvido para ajustes",
  FINALIZED: "Finalizado",
};

function calcEixoMedia(eixo: any) {
  const values = [
    typeof eixo.positivoNotaConsultor === "number" ? eixo.positivoNotaConsultor : eixo.positivoNota ?? 0,
    typeof eixo.negativoNotaConsultor === "number" ? eixo.negativoNotaConsultor : eixo.negativoNota ?? 0,
    typeof eixo.solucaoNotaConsultor === "number" ? eixo.solucaoNotaConsultor : eixo.solucaoNota ?? 0,
  ];
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function maturityFromScore(score: number) {
  if (score <= 0) return { level: "Não iniciado", band: "—" };
  if (score < 2.5) return { level: "Inicial", band: "T0–T1" };
  if (score < 5) return { level: "Básico", band: "T1–T2" };
  if (score < 7.5) return { level: "Intermediário", band: "T2–T3" };
  if (score < 9) return { level: "Avançado", band: "T3–T4" };
  return { level: "Referência", band: "T4" };
}

type VersionSnapshot = {
  id: string;
  versionNumber: number;
  createdAt: string;
  snapshot: {
    status?: string;
    respondentName?: string;
    respondentEmail?: string;
    respondentPhone?: string;
    dataDiagnostico?: string;
    eixoRespostas?: Array<{
      eixoKey: string;
      positivoNota?: number;
      negativoNota?: number;
      solucaoNota?: number;
      positivoParte2?: string;
      negativoParte2?: string;
      solucaoParte2?: string;
      solucaoSebraeDescs?: string[];
    }>;
    analises?: Array<{
      eixoKey: string;
      positivoParte3?: string;
      negativoParte3?: string;
      solucaoParte3?: string;
    }>;
    perguntasChave?: Record<string, unknown> & { consultorAnalise?: string };
  };
};

type MultiVersionPayload = {
  versions: VersionSnapshot[];
  diagnostico: { id: string; municipioIbgeId: string; status: string } | null;
  municipio: { nome: string; uf: string | null } | null;
};

function DiagnosticoImprimirContent() {
  const searchParams = useSearchParams();
  const diagnosticoId = searchParams.get("id");
  const versaoIdsParam = searchParams.get("versaoIds");
  const [diagnostico, setDiagnostico] = useState<DiagnosticoPayload | null>(null);
  const [multiVersion, setMultiVersion] = useState<MultiVersionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (versaoIdsParam?.trim()) {
      setLoading(true);
      setDiagnostico(null);
      fetch(`/api/diagnosticos/versions-by-ids?ids=${encodeURIComponent(versaoIdsParam.trim())}`)
        .then((res) => res.json())
        .then((data) => setMultiVersion(
          data.versions?.length ? {
            versions: data.versions,
            diagnostico: data.diagnostico ?? null,
            municipio: data.municipio ?? null,
          } : null
        ))
        .catch(() => setMultiVersion(null))
        .finally(() => setLoading(false));
      return;
    }
    setMultiVersion(null);
    if (!diagnosticoId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/diagnosticos/${diagnosticoId}`)
      .then((res) => res.json())
      .then((data) => setDiagnostico(data.diagnostico || null))
      .catch(() => setDiagnostico(null))
      .finally(() => setLoading(false));
  }, [diagnosticoId, versaoIdsParam]);

  const eixoScores = useMemo(() => {
    if (!diagnostico) return [];
    return eixosDiagnostico.map((eixo) => {
      const eixoData = diagnostico.eixos?.find((item: any) => item.eixoKey === eixo.key);
      return {
        key: eixo.key,
        title: eixo.title,
        media: eixoData ? calcEixoMedia(eixoData) : 0,
        eixoData,
      };
    });
  }, [diagnostico]);

  const notaGeral = useMemo(() => {
    if (!diagnostico) return 0;
    const values = diagnostico.eixos
      .map((eixo: any) => [
        typeof eixo.positivoNotaConsultor === "number" ? eixo.positivoNotaConsultor : eixo.positivoNota ?? 0,
        typeof eixo.negativoNotaConsultor === "number" ? eixo.negativoNotaConsultor : eixo.negativoNota ?? 0,
        typeof eixo.solucaoNotaConsultor === "number" ? eixo.solucaoNotaConsultor : eixo.solucaoNota ?? 0,
      ])
      .flat();
    if (values.length === 0) return 0;
    return Math.round((values.reduce((a: number, b: number) => a + b, 0) / values.length) * 10) / 10;
  }, [diagnostico]);

  const maturity = useMemo(() => maturityFromScore(notaGeral), [notaGeral]);

  const rankingEixos = useMemo(() => {
    return [...eixoScores].sort((a, b) => b.media - a.media);
  }, [eixoScores]);

  const topEixos = [...eixoScores].sort((a, b) => b.media - a.media).slice(0, 3);
  const bottomEixos = [...eixoScores].sort((a, b) => a.media - b.media).slice(0, 3);
  const lacunas = eixoScores.filter((item) => item.media === 0);

  if (!diagnosticoId && !versaoIdsParam) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid">
          <div className="bg-white border border-[#E2E8F0] p-8">
            <p className="text-fluid-sm text-[#64748B]">
              Informe o id do diagnóstico (ex.: /diagnostico/imprimir?id=...) ou escolha as versões na ficha do município (Imprimir relatório).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Modo múltiplas versões (T0, T1, T2…)
  if (multiVersion?.versions?.length) {
    const municipio = multiVersion.municipio;
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12">
        <div className="container-fluid space-y-8">
          <div className="border border-[#E2E8F0] p-6 bg-white print-card print-section">
            <div className="text-xs uppercase tracking-[0.24em] text-[#64748B]">
              Rede Inovajuntos • Diagnóstico de Compras Governamentais
            </div>
            <div className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
              Relatório com múltiplas versões (T0, T1, T2…)
            </div>
            <div className="text-fluid-sm text-[#64748B] mt-2">
              Município: {municipio?.nome || "—"} {municipio?.uf ? `/${municipio.uf}` : ""}
            </div>
            <div className="text-fluid-sm text-[#64748B] mt-1">
              Gerado em {new Date().toLocaleDateString("pt-BR")}
            </div>
          </div>
          {multiVersion.versions.map((ver) => {
            const snap = ver.snapshot || {};
            const eixoRespostas = snap.eixoRespostas || [];
            const analises = snap.analises || [];
            const notaPorEixo = eixosDiagnostico.map((eixo) => {
              const e = eixoRespostas.find((x: any) => x.eixoKey === eixo.key);
              if (!e) return 0;
              const p = e.positivoNota ?? 0;
              const n = e.negativoNota ?? 0;
              const s = e.solucaoNota ?? 0;
              return (p + n + s) / 3;
            });
            const notaGeralVer = notaPorEixo.length ? notaPorEixo.reduce((a, b) => a + b, 0) / notaPorEixo.length : 0;
            const label = `T${ver.versionNumber - 1}`;
            return (
              <div key={ver.id} className="space-y-6 print-card print-section">
                <div className="bg-white border border-[#E2E8F0] p-6">
                  <h2 className="text-xl font-bold text-[#0F172A]">
                    Versão {label} — {new Date(ver.createdAt).toLocaleDateString("pt-BR")}
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1">
                    Status no snapshot: {statusLabel[snap.status as string] || snap.status || "—"}
                    {snap.respondentName && ` • Responsável: ${snap.respondentName}`}
                  </p>
                </div>
                <div className="bg-white border border-[#E2E8F0] p-6">
                  <h3 className="font-semibold text-[#0F172A] mb-3">Nota geral desta versão: {notaGeralVer.toFixed(1)}</h3>
                  <div className="grid gap-2 text-sm text-[#64748B]">
                    {eixosDiagnostico.map((eixo, idx) => {
                      const nota = notaPorEixo[idx] ?? 0;
                      return (
                        <div key={eixo.key} className="flex justify-between">
                          <span>{eixo.title}</span>
                          <span className="font-medium text-[#0F172A]">{nota.toFixed(1)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white border border-[#E2E8F0] p-6">
                  <h3 className="font-semibold text-[#0F172A] mb-3">Respostas e análise por eixo</h3>
                  <div className="space-y-4 text-sm">
                    {eixosDiagnostico.map((eixo) => {
                      const e = eixoRespostas.find((x: any) => x.eixoKey === eixo.key);
                      const a = analises.find((x: any) => x.eixoKey === eixo.key);
                      if (!e && !a) return null;
                      return (
                        <div key={eixo.key} className="border border-[#E2E8F0] p-4 rounded-lg">
                          <div className="font-medium text-[#0F172A]">{eixo.title}</div>
                          {(e?.positivoParte2 || e?.negativoParte2 || e?.solucaoParte2) && (
                            <div className="mt-2 text-[#64748B] text-xs space-y-1">
                              {e.positivoParte2 && <div><strong>Positivo:</strong> {e.positivoParte2}</div>}
                              {e.negativoParte2 && <div><strong>Negativo:</strong> {e.negativoParte2}</div>}
                              {e.solucaoParte2 && <div><strong>Solução:</strong> {e.solucaoParte2}</div>}
                            </div>
                          )}
                          {(a?.positivoParte3 || a?.negativoParte3 || a?.solucaoParte3) && (
                            <div className="mt-2 pt-2 border-t border-[#E2E8F0] text-[#0F766E] text-xs space-y-1">
                              <div className="font-medium text-[#64748B]">Comentário do consultor</div>
                              {a.positivoParte3 && <div><strong>Positivo:</strong> {a.positivoParte3}</div>}
                              {a.negativoParte3 && <div><strong>Negativo:</strong> {a.negativoParte3}</div>}
                              {a.solucaoParte3 && <div><strong>Solução:</strong> {a.solucaoParte3}</div>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {(snap.perguntasChave && typeof snap.perguntasChave === "object" && "consultorAnalise" in snap.perguntasChave && (snap.perguntasChave as { consultorAnalise?: string }).consultorAnalise) && (
                  <div className="bg-white border border-[#E2E8F0] p-6">
                    <h3 className="font-semibold text-[#0F172A] mb-2">Análise consolidada do consultor</h3>
                    <p className="text-sm text-[#64748B]">{String((snap.perguntasChave as { consultorAnalise?: string }).consultorAnalise)}</p>
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex flex-wrap gap-3 print-hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm"
            >
              Imprimir relatório
            </button>
            <Link href="/diagnostico" className="px-5 py-2 bg-[#1E3A8A] text-white text-fluid-sm">
              Voltar ao diagnóstico
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (versaoIdsParam && !loading && !multiVersion?.versions?.length) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid">
          <div className="bg-white border border-[#E2E8F0] p-8">
            <p className="text-fluid-sm text-[#64748B]">Nenhuma versão encontrada ou erro ao carregar.</p>
            <Link href="/diagnostico" className="mt-4 inline-block text-[#1E3A8A] hover:underline">Voltar ao diagnóstico</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid space-y-8">
        <div className="border border-[#E2E8F0] p-6 bg-white print-card print-section">
          <div className="text-xs uppercase tracking-[0.24em] text-[#64748B]">
            Rede Inovajuntos • Diagnóstico de Compras Governamentais
          </div>
          <div className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
            Conclusões e recomendações do diagnóstico
          </div>
          <div className="text-fluid-sm text-[#64748B] mt-2">
            Gerado em {new Date().toLocaleDateString("pt-BR")}
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E2E8F0] p-6">
            <p className="text-fluid-sm text-[#64748B]">Carregando diagnóstico...</p>
          </div>
        ) : !diagnostico ? (
          <div className="bg-white border border-[#E2E8F0] p-6">
            <p className="text-fluid-sm text-[#64748B]">Diagnóstico não encontrado.</p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-[#E2E8F0] p-8 print-card print-section">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-[#64748B]">
                    Capa do relatório
                  </div>
                  <h1 className="text-fluid-3xl font-bold text-[#0F172A] mt-3">
                    Diagnóstico de maturidade em compras governamentais
                  </h1>
                  <p className="text-fluid-sm text-[#64748B] mt-3">
                    Município: {diagnostico.municipio?.nome || "Não informado"}{" "}
                    {diagnostico.municipio?.uf ? `/${diagnostico.municipio.uf}` : ""}
                  </p>
                  <p className="text-fluid-sm text-[#64748B]">
                    Status: {statusLabel[diagnostico.status] || diagnostico.status}
                  </p>
                  <p className="text-fluid-sm text-[#64748B]">
                    Data de emissão: {new Date().toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="border border-dashed border-[#CBD5F5] bg-[#EFF6FF] p-6">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#64748B]">
                    Logomarcas (opcional)
                  </div>
                  <div className="mt-4 h-24 border border-dashed border-[#93C5FD] bg-white" />
                  <div className="mt-3 h-24 border border-dashed border-[#93C5FD] bg-white" />
                </div>
              </div>
              <div className="mt-8 grid lg:grid-cols-[1fr_1fr] gap-6 text-fluid-sm text-[#64748B]">
                <div className="border border-[#E2E8F0] p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#64748B] mb-2">
                    Responsável
                  </div>
                  <div className="text-[#0F172A] font-semibold">
                    {diagnostico.respondentName || "Não informado"}
                  </div>
                  <div>{diagnostico.respondentEmail || "E-mail não informado"}</div>
                  <div>{diagnostico.respondentPhone || "Telefone não informado"}</div>
                </div>
                <div className="border border-[#E2E8F0] p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#64748B] mb-2">
                    Identificação
                  </div>
                  <div>IBGE: {diagnostico.municipioIbgeId || "Não informado"}</div>
                  <div>Nota geral: {notaGeral}</div>
                  <div>
                    Atualizado em: {new Date(diagnostico.updatedAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
              <div className="bg-white border border-[#E2E8F0] p-6 print-card print-section">
                <h2 className="text-fluid-xl font-bold text-[#0F172A] mb-4">Resumo executivo</h2>
                <div className="grid gap-3 text-fluid-sm text-[#64748B]">
                  <div className="text-fluid-base text-[#0F172A] font-semibold">
                    Nota geral: {notaGeral}
                  </div>
                  <div>
                    Nível de maturidade:{" "}
                    <span className="text-[#0F172A] font-semibold">{maturity.level}</span>{" "}
                    <span className="text-xs text-[#64748B]">({maturity.band})</span>
                  </div>
                  <div>
                    Status: {statusLabel[diagnostico.status] || diagnostico.status}
                  </div>
                  <div>
                    Município: {diagnostico.municipio?.nome || "Não informado"}{" "}
                    {diagnostico.municipio?.uf ? `/${diagnostico.municipio.uf}` : ""}
                  </div>
                  <div>IBGE: {diagnostico.municipioIbgeId || "Não informado"}</div>
                  <div>Respondente: {diagnostico.respondentName || "Não informado"}</div>
                  <div>
                    Atualizado em: {new Date(diagnostico.updatedAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-6 print-card print-section">
                <h2 className="text-fluid-xl font-bold text-[#0F172A] mb-4">Eixos com melhor desempenho</h2>
                <div className="grid gap-2 text-fluid-sm text-[#64748B]">
                  {topEixos.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className="text-[#0F172A] font-semibold">{item.media}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
              <div className="bg-white border border-[#E2E8F0] p-6 print-card print-section">
                <h2 className="text-fluid-xl font-bold text-[#0F172A] mb-4">Principais lacunas</h2>
                <div className="grid gap-2 text-fluid-sm text-[#64748B]">
                  {bottomEixos.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className={cn("font-semibold", item.media < 5 ? "text-rose-600" : "text-[#0F172A]")}>
                        {item.media}
                      </span>
                    </div>
                  ))}
                  {lacunas.length > 0 && (
                    <div className="text-xs text-rose-600 mt-2">
                      Eixos sem nota registrada: {lacunas.map((item) => item.title).join(", ")}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-6 print-card print-section">
                <h2 className="text-fluid-xl font-bold text-[#0F172A] mb-4">Recomendações prioritárias</h2>
                <div className="text-fluid-sm text-[#64748B] space-y-2">
                  {bottomEixos.map((item) => (
                    <div key={item.key}>
                      <span className="text-[#0F172A] font-semibold">{item.title}:</span>{" "}
                      Priorizar plano de acao e monitoramento para elevar a maturidade do eixo.
                    </div>
                  ))}
                  {lacunas.length > 0 && (
                    <div>
                      <span className="text-[#0F172A] font-semibold">Preenchimento:</span>{" "}
                      Revisar e completar eixos sem nota para consolidar o diagnostico.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-6 print-card print-section">
              <h2 className="text-fluid-xl font-bold text-[#0F172A] mb-4">Ranking por eixo (básico)</h2>
              <div className="grid gap-2 text-fluid-sm text-[#64748B]">
                {rankingEixos.map((item, idx) => (
                  <div key={item.key} className="flex items-center justify-between border-b border-[#E2E8F0] py-2">
                    <span>
                      {idx + 1}. {item.title}
                    </span>
                    <span className="text-[#0F172A] font-semibold">{item.media}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-[#94A3B8] mt-3">
                Observação: ranking calculado pela média simples das notas (município/consultor) registradas por eixo.
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-6 print-card print-section">
              <h2 className="text-fluid-xl font-bold text-[#0F172A] mb-4">Plano de ação prioritário (placeholder)</h2>
              <div className="text-fluid-sm text-[#64748B] space-y-3">
                <div>
                  <span className="text-[#0F172A] font-semibold">Foco imediato:</span>{" "}
                  atuar primeiro nos eixos com menor nota e definir responsáveis, prazos e evidências.
                </div>
                <div className="grid gap-2">
                  {bottomEixos.map((item) => (
                    <div key={`plano-${item.key}`} className="border border-[#E2E8F0] p-4">
                      <div className="text-[#0F172A] font-semibold">{item.title}</div>
                      <ul className="mt-2 list-disc pl-5">
                        <li>Meta: elevar a nota do eixo em +1,0 no próximo ciclo.</li>
                        <li>Próxima ação: mapear processos atuais e gaps (checklist) e priorizar 3 melhorias.</li>
                        <li>Evidências: documentos, atas, registros em sistemas e indicadores.</li>
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-[#94A3B8]">
                  Este bloco é propositalmente simples no MVP; a fase 2 evolui para plano de ação estruturado e recomendação automática.
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-6 print-card print-section">
              <h2 className="text-fluid-xl font-bold text-[#0F172A] mb-4">Recomendações SEBRAE (quando informadas)</h2>
              <div className="grid gap-4 text-fluid-sm text-[#64748B]">
                {eixoScores.map((item) => (
                  <div key={item.key} className="border border-[#E2E8F0] p-4">
                    <div className="font-semibold text-[#0F172A] mb-2">{item.title}</div>
                    <div className="text-xs text-[#64748B] grid gap-1">
                      {(item.eixoData?.solucaoSebraeDescs || [])
                        .filter((desc: string) => desc?.trim())
                        .slice(0, 10)
                        .map((desc: string, idx: number) => (
                          <div key={`${item.key}-sebrae-${idx}`}>- {desc}</div>
                        ))}
                      {!item.eixoData?.solucaoSebraeDescs?.some((desc: string) => desc?.trim()) && (
                        <span className="text-[#94A3B8]">Não informado.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-6 print-card print-section">
              <h2 className="text-fluid-xl font-bold text-[#0F172A] mb-4">Análise técnica do consultor</h2>
              <div className="grid gap-4 text-fluid-sm text-[#64748B]">
                {eixoScores.map((item) => {
                  const analise = diagnostico.analises?.find((entry: any) => entry.eixoKey === item.key);
                  return (
                    <div key={`analise-${item.key}`} className="border border-[#E2E8F0] p-4">
                      <div className="font-semibold text-[#0F172A] mb-2">{item.title}</div>
                      <div className="grid gap-2 text-xs text-[#64748B]">
                        <div>
                          <span className="uppercase tracking-[0.16em] text-[#94A3B8] text-[11px]">Positivos</span>
                          <div className="mt-1">{analise?.positivoParte3 || "Não informado."}</div>
                        </div>
                        <div>
                          <span className="uppercase tracking-[0.16em] text-[#94A3B8] text-[11px]">Negativos</span>
                          <div className="mt-1">{analise?.negativoParte3 || "Não informado."}</div>
                        </div>
                        <div>
                          <span className="uppercase tracking-[0.16em] text-[#94A3B8] text-[11px]">Soluções</span>
                          <div className="mt-1">{analise?.solucaoParte3 || "Não informado."}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {diagnostico.perguntas?.consultorAnalise && (
                <div className="mt-6 border border-[#E2E8F0] p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#64748B] mb-2">
                    Análise consolidada
                  </div>
                  <p className="text-fluid-sm text-[#64748B]">
                    {diagnostico.perguntas.consultorAnalise}
                  </p>
                </div>
              )}
              {!diagnostico.perguntas?.consultorAnalise && (
                <div className="mt-6 text-xs text-[#94A3B8]">
                  Análise consolidada não informada.
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E2E8F0] p-6 print-card print-section">
              <h2 className="text-fluid-xl font-bold text-[#0F172A] mb-4">Assinatura e validação</h2>
              <div className="grid lg:grid-cols-2 gap-6 text-fluid-sm text-[#64748B]">
                <div className="border border-dashed border-[#CBD5F5] p-4 h-28 flex items-end">
                  <div>
                    <div className="border-t border-[#94A3B8] pt-2 text-xs uppercase tracking-[0.2em] text-[#64748B]">
                      Assinatura do consultor
                    </div>
                  </div>
                </div>
                <div className="border border-dashed border-[#CBD5F5] p-4 h-28 flex items-end">
                  <div>
                    <div className="border-t border-[#94A3B8] pt-2 text-xs uppercase tracking-[0.2em] text-[#64748B]">
                      Assinatura do município
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 print-hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm"
              >
                Imprimir conclusões
              </button>
              <Link
                href="/diagnostico"
                className="px-5 py-2 bg-[#1E3A8A] text-white text-fluid-sm"
              >
                Voltar ao wizard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function DiagnosticoImprimirPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando relatório...</div>}>
      <DiagnosticoImprimirContent />
    </Suspense>
  );
}
