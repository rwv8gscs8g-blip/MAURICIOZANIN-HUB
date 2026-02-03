"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type VersionItem = {
  id: string;
  versionNumber: number;
  createdAt: string;
};

export function DiagnosticoImprimirSelecaoClient({
  ibgeId,
  municipioNome,
  municipioUf,
  versions,
  diagnosticoId,
}: {
  ibgeId: string;
  municipioNome: string;
  municipioUf: string | null;
  versions: VersionItem[];
  diagnosticoId: string;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(versions.map((v) => v.id))
  );

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(versions.map((v) => v.id)));
  const selectNone = () => setSelectedIds(new Set());

  const handleGerarRelatorio = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds).join(",");
    router.push(`/diagnostico/imprimir?versaoIds=${encodeURIComponent(ids)}`);
  };

  if (versions.length === 0) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6">
        <p className="text-sm text-[#64748B]">
          Nenhuma versão (marco T0/T1/T2) registrada ainda. Registre um marco na ficha do município antes de imprimir.
        </p>
        <Link
          href={`/diagnostico/municipio/${ibgeId}`}
          className="mt-4 inline-block px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] hover:bg-[#F8FAFC]"
        >
          Voltar à ficha do município
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-4">
        <h2 className="text-lg font-semibold text-[#0F172A]">Versões disponíveis</h2>
        <p className="text-sm text-[#64748B] mt-1">
          Marque as versões que deseja incluir no relatório. Todas serão reunidas em um único documento.
        </p>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-[#1E3A8A] hover:underline"
          >
            Selecionar todas
          </button>
          <span className="text-[#CBD5E1]">|</span>
          <button
            type="button"
            onClick={selectNone}
            className="text-sm text-[#1E3A8A] hover:underline"
          >
            Desmarcar todas
          </button>
        </div>
        <ul className="space-y-2">
          {versions.map((v) => {
            const label = `T${v.versionNumber - 1}`;
            const checked = selectedIds.has(v.id);
            return (
              <li key={v.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`versao-${v.id}`}
                  checked={checked}
                  onChange={() => toggle(v.id)}
                  className="rounded border-[#E2E8F0] text-[#1E3A8A]"
                />
                <label htmlFor={`versao-${v.id}`} className="text-sm text-[#0F172A] cursor-pointer">
                  <span className="font-medium">{label}</span>
                  {" — "}
                  {new Date(v.createdAt).toLocaleDateString("pt-BR")}
                </label>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={handleGerarRelatorio}
            disabled={selectedIds.size === 0}
            className="px-5 py-2 bg-[#0F766E] text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gerar relatório para impressão
          </button>
          <Link
            href={`/diagnostico/municipio/${ibgeId}`}
            className="px-5 py-2 border border-[#E2E8F0] text-sm text-[#0F172A] rounded-lg hover:bg-[#F8FAFC]"
          >
            Voltar à ficha do município
          </Link>
          <Link
            href={`/diagnostico/imprimir?id=${diagnosticoId}`}
            className="text-sm text-[#64748B] hover:underline"
          >
            Imprimir estado atual (sem marcos)
          </Link>
        </div>
      </div>
    </div>
  );
}
