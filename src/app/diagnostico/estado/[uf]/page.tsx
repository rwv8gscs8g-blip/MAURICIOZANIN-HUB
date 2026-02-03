"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

type MunicipioItem = { id: string; nome: string };

const STATUS_LEVELS = [
  { key: "nao-iniciado", label: "Não iniciado", min: 0, max: 0 },
  { key: "t0", label: "T0", min: 1, max: 1 },
  { key: "t1", label: "T1", min: 2, max: 2 },
  { key: "t2", label: "T2", min: 3, max: 3 },
  { key: "t3", label: "T3", min: 4, max: 4 },
  { key: "t4", label: "T4", min: 5, max: Infinity },
];

const resolveNota = (eixo: any, bloco: "positivo" | "negativo" | "solucao") => {
  const consultorKey = `${bloco}NotaConsultor`;
  const baseKey = `${bloco}Nota`;
  const value = eixo?.[consultorKey] ?? eixo?.[baseKey];
  return typeof value === "number" ? value : 0;
};

export default function DiagnosticoEstadoPage() {
  const params = useParams();
  const uf = String(params?.uf || "").toUpperCase();

  const [municipios, setMunicipios] = useState<MunicipioItem[]>([]);
  const [municipioFonte, setMunicipioFonte] = useState<string | null>(null);
  const [estadoDiagnosticos, setEstadoDiagnosticos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "t0" | "t1" | "t2" | "t3" | "t4" | "nao-iniciado"
  >("all");

  useEffect(() => {
    if (!uf) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/ibge/municipios?uf=${uf}`).then((res) => res.json()),
      fetch(`/api/diagnosticos?includeEixos=1&municipioUf=${uf}`).then((res) => res.json()),
    ])
      .then(([municipiosData, diagnosticosData]) => {
        setMunicipios(municipiosData.municipios || []);
        const fonte = municipiosData.municipios?.[0]?.fonte || municipiosData.fonte || null;
        setMunicipioFonte(fonte);
        setEstadoDiagnosticos(diagnosticosData.diagnosticos || []);
      })
      .catch(() => {
        setMunicipios([]);
        setEstadoDiagnosticos([]);
      })
      .finally(() => setLoading(false));
  }, [uf]);

  const diagnosticoByMunicipio = useMemo(() => {
    const map = new Map<string, { versions: number; ultimaNota: number | null }>();
    estadoDiagnosticos.forEach((item) => {
      if (!item.municipioIbgeId) return;
      const notas = (item.eixos || [])
        .map((eixo: any) => [
          resolveNota(eixo, "positivo"),
          resolveNota(eixo, "negativo"),
          resolveNota(eixo, "solucao"),
        ])
        .flat();
      const ultimaNota = notas.length
        ? Math.round((notas.reduce((a: number, b: number) => a + b, 0) / notas.length) * 10) / 10
        : null;
      map.set(String(item.municipioIbgeId), {
        versions: item._count?.versions ?? 0,
        ultimaNota,
      });
    });
    return map;
  }, [estadoDiagnosticos]);

  const resolveStatusLabel = (versions: number) => {
    const level = STATUS_LEVELS.find(
      (item) => versions >= item.min && versions <= item.max
    );
    return level?.key ?? "nao-iniciado";
  };

  const municipiosComStatus = useMemo(() => {
    const term = search.trim().toLowerCase();
    return municipios
      .filter((m) => !term || m.nome.toLowerCase().includes(term))
      .map((m) => {
        const diagnostico = diagnosticoByMunicipio.get(m.id);
        const versions = diagnostico?.versions ?? 0;
        const statusLabel = resolveStatusLabel(versions);
        return {
          ...m,
          statusLabel,
          ultimaNota: diagnostico?.ultimaNota ?? null,
        };
      })
      .filter((item) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "nao-iniciado") return item.statusLabel === "nao-iniciado";
        return item.statusLabel === statusFilter;
      });
  }, [municipios, diagnosticoByMunicipio, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "nao-iniciado": 0,
      t0: 0,
      t1: 0,
      t2: 0,
      t3: 0,
      t4: 0,
    };
    municipios.forEach((m) => {
      const diagnostico = diagnosticoByMunicipio.get(m.id);
      const versions = diagnostico?.versions ?? 0;
      const statusLabel = resolveStatusLabel(versions);
      counts[statusLabel] = (counts[statusLabel] || 0) + 1;
    });
    return counts;
  }, [municipios, diagnosticoByMunicipio]);

  if (!uf) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid">
          <p className="text-fluid-sm text-[#64748B]">Estado não informado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid space-y-6">
        <Link href="/diagnostico" className="text-[#1E3A8A] hover:underline text-sm">
          ← Voltar para o diagnóstico
        </Link>
        <div className="bg-white border border-[#E2E8F0] p-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-fluid-2xl font-bold text-[#0F172A]">{uf}</h1>
                <p className="text-fluid-sm text-[#64748B]">
                  Municípios com status (Não iniciado, T0-T4) e última nota.
                </p>
                {municipioFonte && (
                  <div className="text-xs text-[#64748B] mt-2">
                    Origem dos dados: {municipioFonte}
                  </div>
                )}
              </div>
            <div className="text-xs text-[#64748B]">
              {loading ? "Carregando..." : `${municipiosComStatus.length} municípios`}
            </div>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-fluid-xs text-[#64748B]">
              Buscar município
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm"
                placeholder="Digite o nome do município"
              />
            </label>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("nao-iniciado")}
                className={cn(
                  "px-3 py-1 border",
                  statusFilter === "nao-iniciado"
                    ? "border-slate-500 text-slate-700 bg-slate-50"
                    : "border-[#E2E8F0] text-[#64748B]"
                )}
              >
                Não iniciado ({statusCounts["nao-iniciado"] || 0})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("t0")}
                className={cn(
                  "px-3 py-1 border",
                  statusFilter === "t0"
                    ? "border-amber-500 text-amber-700 bg-amber-50"
                    : "border-[#E2E8F0] text-[#64748B]"
                )}
              >
                T0 ({statusCounts.t0})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("t1")}
                className={cn(
                  "px-3 py-1 border",
                  statusFilter === "t1"
                    ? "border-blue-500 text-blue-700 bg-blue-50"
                    : "border-[#E2E8F0] text-[#64748B]"
                )}
              >
                T1 ({statusCounts.t1})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("t2")}
                className={cn(
                  "px-3 py-1 border",
                  statusFilter === "t2"
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                    : "border-[#E2E8F0] text-[#64748B]"
                )}
              >
                T2 ({statusCounts.t2})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("t3")}
                className={cn(
                  "px-3 py-1 border",
                  statusFilter === "t3"
                    ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                    : "border-[#E2E8F0] text-[#64748B]"
                )}
              >
                T3 ({statusCounts.t3})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("t4")}
                className={cn(
                  "px-3 py-1 border",
                  statusFilter === "t4"
                    ? "border-violet-500 text-violet-700 bg-violet-50"
                    : "border-[#E2E8F0] text-[#64748B]"
                )}
              >
                T4 ({statusCounts.t4})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "px-3 py-1 border",
                  statusFilter === "all"
                    ? "border-[#1E3A8A] text-[#1E3A8A] bg-[#E0E7FF]"
                    : "border-[#E2E8F0] text-[#64748B]"
                )}
              >
                Todos ({municipios.length})
              </button>
            </div>

            <div className="grid gap-2 text-fluid-sm text-[#64748B]">
              {municipiosComStatus.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between border border-[#E2E8F0] px-4 py-3 bg-white"
                >
                  <div>
                    <div className="text-[#0F172A] font-semibold">{m.nome}</div>
                    <div className="text-xs text-[#94A3B8]">
                      Status: {STATUS_LEVELS.find((item) => item.key === m.statusLabel)?.label || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#64748B]">
                      Última nota: {m.ultimaNota ?? "—"}
                    </span>
                    <Link
                      href={`/diagnostico?uf=${uf}&municipio=${m.id}`}
                      className="text-xs text-[#1E3A8A] hover:underline"
                    >
                      Iniciar diagnóstico →
                    </Link>
                    <Link
                      href={`/diagnostico/municipio/${m.id}`}
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      Notas do consultor →
                    </Link>
                  </div>
                </div>
              ))}
              {municipiosComStatus.length === 0 && (
                <div className="text-fluid-sm text-[#64748B]">
                  Nenhum município encontrado para o filtro atual.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
