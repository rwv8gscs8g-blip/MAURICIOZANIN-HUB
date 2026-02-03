"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { blocosDiagnostico, eixosDiagnostico, type EixoKey } from "@/data/diagnostico-eixos";
import { cn } from "@/lib/utils";

type EixoRespostaDTO = {
  eixoKey: EixoKey;
  positivoParte1?: unknown;
  positivoParte2?: string | null;
  negativoParte1?: unknown;
  negativoParte2?: string | null;
  solucaoParte1?: unknown;
  solucaoParte2?: string | null;
  positivoNotaConsultor: number | null;
  negativoNotaConsultor: number | null;
  solucaoNotaConsultor: number | null;
};

function formatParteMunicipio(parte1: unknown, parte2: string | null | undefined): string {
  const p1 = parte1 == null ? "" : Array.isArray(parte1) ? parte1.filter(Boolean).join(" • ") : String(parte1);
  const p2 = parte2?.trim() ?? "";
  return [p1, p2].filter(Boolean).join(" — ");
}

type EixoAnaliseDTO = {
  eixoKey: EixoKey;
  positivoParte3: string | null;
  negativoParte3: string | null;
  solucaoParte3: string | null;
};

export function ConsultorNotesClient({
  municipio,
  diagnostico,
}: {
  municipio: { ibgeId: string; nome: string | null; uf: string | null };
  diagnostico: {
    id: string;
    status: string;
    updatedAt: string;
    eixos: EixoRespostaDTO[];
    analises: EixoAnaliseDTO[];
    perguntas: { consultorAnalise: string | null } | null;
  };
}) {
  const initialByEixo = useMemo(() => {
    const byKey = new Map<EixoKey, { notas: EixoRespostaDTO; analise: EixoAnaliseDTO }>();
    eixosDiagnostico.forEach((eixo) => {
      const found = diagnostico.eixos.find((i) => i.eixoKey === eixo.key);
      const notas: EixoRespostaDTO = found
        ? { ...found, positivoNotaConsultor: found.positivoNotaConsultor ?? null, negativoNotaConsultor: found.negativoNotaConsultor ?? null, solucaoNotaConsultor: found.solucaoNotaConsultor ?? null }
        : { eixoKey: eixo.key, positivoNotaConsultor: null, negativoNotaConsultor: null, solucaoNotaConsultor: null };
      const analise = diagnostico.analises.find((i) => i.eixoKey === eixo.key) || {
        eixoKey: eixo.key,
        positivoParte3: null,
        negativoParte3: null,
        solucaoParte3: null,
      };
      byKey.set(eixo.key, { notas, analise });
    });
    return byKey;
  }, [diagnostico.analises, diagnostico.eixos]);

  const [status, setStatus] = useState(diagnostico.status);
  const [consultorAnalise, setConsultorAnalise] = useState(diagnostico.perguntas?.consultorAnalise || "");
  const [saving, setSaving] = useState(false);
  const [saveInfo, setSaveInfo] = useState<{ ok: boolean; message: string } | null>(null);

  const [byEixo, setByEixo] = useState(() => {
    const obj: Record<string, any> = {};
    initialByEixo.forEach((val, key) => {
      obj[key] = {
        notas: { ...val.notas },
        analise: { ...val.analise },
      };
    });
    return obj as Record<
      EixoKey,
      { notas: EixoRespostaDTO; analise: EixoAnaliseDTO }
    >;
  });

  const updateNota = (
    eixoKey: EixoKey,
    blocoKey: "positivo" | "negativo" | "solucao",
    value: number
  ) => {
    const field =
      blocoKey === "positivo"
        ? "positivoNotaConsultor"
        : blocoKey === "negativo"
          ? "negativoNotaConsultor"
          : "solucaoNotaConsultor";
    setByEixo((prev) => ({
      ...prev,
      [eixoKey]: {
        ...prev[eixoKey],
        notas: { ...prev[eixoKey].notas, [field]: Number.isFinite(value) ? value : 0 },
      },
    }));
  };

  const updateParte3 = (
    eixoKey: EixoKey,
    blocoKey: "positivo" | "negativo" | "solucao",
    value: string
  ) => {
    const field =
      blocoKey === "positivo"
        ? "positivoParte3"
        : blocoKey === "negativo"
          ? "negativoParte3"
          : "solucaoParte3";
    setByEixo((prev) => ({
      ...prev,
      [eixoKey]: {
        ...prev[eixoKey],
        analise: { ...prev[eixoKey].analise, [field]: value },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveInfo(null);
    try {
      const analises = eixosDiagnostico.map((eixo) => ({
        eixoKey: eixo.key,
        positivoParte3: byEixo[eixo.key]?.analise?.positivoParte3 || null,
        negativoParte3: byEixo[eixo.key]?.analise?.negativoParte3 || null,
        solucaoParte3: byEixo[eixo.key]?.analise?.solucaoParte3 || null,
      }));
      const eixoRespostas = eixosDiagnostico.map((eixo) => ({
        eixoKey: eixo.key,
        positivoNotaConsultor: byEixo[eixo.key]?.notas?.positivoNotaConsultor ?? null,
        negativoNotaConsultor: byEixo[eixo.key]?.notas?.negativoNotaConsultor ?? null,
        solucaoNotaConsultor: byEixo[eixo.key]?.notas?.solucaoNotaConsultor ?? null,
      }));
      const perguntasChave = { consultorAnalise: consultorAnalise || null };

      const res = await fetch(`/api/diagnosticos/${diagnostico.id}/consultor`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ analises, eixoRespostas, perguntasChave, status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Falha ao salvar (HTTP ${res.status})`);
      }

      setSaveInfo({ ok: true, message: "Salvo." });
    } catch (e: any) {
      setSaveInfo({ ok: false, message: e?.message || "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#64748B]">Diagnóstico</div>
            <h1 className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
              {municipio.nome || "Município"} {municipio.uf ? `(${municipio.uf})` : ""}
            </h1>
            <div className="text-sm text-[#64748B] mt-2">
              IBGE: <span className="font-mono text-[#0F172A]">{municipio.ibgeId}</span> • Última atualização:{" "}
              {new Date(diagnostico.updatedAt).toLocaleString("pt-BR")}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/diagnostico?municipio=${municipio.ibgeId}`}
              className="px-4 py-2 border border-[#E2E8F0] text-sm text-[#0F172A] bg-white"
            >
              Abrir wizard completo
            </Link>
            <Link
              href={`/diagnostico/imprimir?id=${diagnostico.id}`}
              className="px-4 py-2 border border-[#0F766E] text-sm text-[#0F766E] bg-white"
            >
              Relatório HTML
            </Link>
            <a
              href={`/api/diagnosticos/${diagnostico.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#1E3A8A] text-white text-sm"
            >
              Exportar JSON
            </a>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="grid gap-2 text-xs text-[#64748B]">
              Status
              <select
                className="border border-[#E2E8F0] px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="SUBMITTED">Submetido</option>
                <option value="IN_REVIEW">Em análise</option>
                <option value="RETURNED">Devolvido</option>
                <option value="FINALIZED">Finalizado</option>
              </select>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  "px-5 py-2 text-sm",
                  saving ? "bg-slate-400 text-white" : "bg-emerald-600 text-white"
                )}
              >
                {saving ? "Salvando..." : "Salvar análise (consultor)"}
              </button>
              {saveInfo && (
                <span
                  className={cn(
                    "text-xs border px-3 py-2",
                    saveInfo.ok
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-rose-700 bg-rose-50 border-rose-200"
                  )}
                >
                  {saveInfo.message}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-xs uppercase tracking-[0.2em] text-[#64748B] mb-2">
              Análise consolidada (consultor)
            </div>
            <textarea
              value={consultorAnalise}
              onChange={(e) => setConsultorAnalise(e.target.value)}
              className="border border-[#E2E8F0] px-3 py-2 min-h-[120px] w-full text-sm"
              placeholder="Resumo e recomendações para a devolutiva."
            />
          </div>
        </div>

        <div className="space-y-6">
          {eixosDiagnostico.map((eixo) => (
            <div key={eixo.key} className="bg-white border border-[#E2E8F0] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#64748B]">Eixo</div>
                  <h2 className="text-lg font-bold text-[#0F172A] mt-1">{eixo.title}</h2>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-4 mt-5">
                {blocosDiagnostico.map((bloco) => {
                  const blocoKey = bloco.key;
                  const nota =
                    blocoKey === "positivo"
                      ? byEixo[eixo.key]?.notas?.positivoNotaConsultor
                      : blocoKey === "negativo"
                        ? byEixo[eixo.key]?.notas?.negativoNotaConsultor
                        : byEixo[eixo.key]?.notas?.solucaoNotaConsultor;
                  const parte3 =
                    blocoKey === "positivo"
                      ? byEixo[eixo.key]?.analise?.positivoParte3
                      : blocoKey === "negativo"
                        ? byEixo[eixo.key]?.analise?.negativoParte3
                        : byEixo[eixo.key]?.analise?.solucaoParte3;
                  const parte1 =
                    blocoKey === "positivo"
                      ? byEixo[eixo.key]?.notas?.positivoParte1
                      : blocoKey === "negativo"
                        ? byEixo[eixo.key]?.notas?.negativoParte1
                        : byEixo[eixo.key]?.notas?.solucaoParte1;
                  const parte2 =
                    blocoKey === "positivo"
                      ? byEixo[eixo.key]?.notas?.positivoParte2
                      : blocoKey === "negativo"
                        ? byEixo[eixo.key]?.notas?.negativoParte2
                        : byEixo[eixo.key]?.notas?.solucaoParte2;
                  const textoMunicipio = formatParteMunicipio(parte1, parte2);
                  const accent =
                    blocoKey === "positivo"
                      ? "border-emerald-400"
                      : blocoKey === "negativo"
                        ? "border-rose-400"
                        : "border-blue-400";

                  return (
                    <div key={blocoKey} className={cn("border border-l-4 p-4", accent)}>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#64748B]">
                        {bloco.title}
                      </div>

                      {textoMunicipio && (
                        <div className="mt-3 p-3 bg-slate-50 border border-[#E2E8F0] rounded text-sm text-[#475569]">
                          <div className="text-xs font-medium text-[#64748B] mb-1">Texto preenchido pelo município</div>
                          <p className="whitespace-pre-wrap">{textoMunicipio}</p>
                        </div>
                      )}

                      <label className="grid gap-2 mt-3 text-xs text-[#64748B]">
                        Nota do consultor (0-10)
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={10}
                            value={nota ?? 0}
                            onChange={(e) => updateNota(eixo.key, blocoKey, Number(e.target.value))}
                            className="w-full accent-[#1E3A8A]"
                          />
                          <input
                            type="number"
                            min={0}
                            max={10}
                            value={nota ?? 0}
                            onChange={(e) => updateNota(eixo.key, blocoKey, Number(e.target.value))}
                            className="border border-[#E2E8F0] px-2 py-1 w-20 text-sm"
                          />
                        </div>
                      </label>

                      <label className="grid gap-2 mt-3 text-xs text-[#64748B]">
                        Parte 3 (texto do consultor)
                        <textarea
                          value={parte3 || ""}
                          onChange={(e) => updateParte3(eixo.key, blocoKey, e.target.value)}
                          className="border border-[#E2E8F0] px-3 py-2 min-h-[140px] text-sm"
                          placeholder="Registre sua análise e recomendações."
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

