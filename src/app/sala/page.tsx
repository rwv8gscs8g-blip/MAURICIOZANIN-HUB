"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HelpButton } from "@/components/ui/HelpButton";
import { LayoutDashboard, Plus, LogIn, Filter, Users, FileCheck, Settings2, Play, Square } from "lucide-react";

type ClassroomSession = {
  id: string;
  code: string;
  title: string;
  status: "PREPARACAO" | "ATIVA" | "ENCERRADA" | "CANCELADA";
  updatedAt: string;
  municipio?: { nome: string; uf: string; ibgeId: string } | null;
  _count?: { participants: number; diagnosticos: number };
};

const statusLabel: Record<ClassroomSession["status"], string> = {
  PREPARACAO: "Preparação",
  ATIVA: "Ativa",
  ENCERRADA: "Encerrada",
  CANCELADA: "Cancelada",
};

const statusBadgeClass: Record<ClassroomSession["status"], string> = {
  PREPARACAO: "bg-amber-100 text-amber-800 border-amber-200",
  ATIVA: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ENCERRADA: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELADA: "bg-red-100 text-red-800 border-red-200",
};

export default function SalaIndexPage() {
  const [sessions, setSessions] = useState<ClassroomSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = filter !== "all" ? `?status=${encodeURIComponent(filter)}` : "";
      const res = await fetch(`/api/classrooms${qs}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Erro ao carregar salas.");
        setSessions([]);
        return;
      }
      setSessions(data.sessions || []);
    } catch {
      setError("Erro inesperado ao carregar salas.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const visible = useMemo(() => sessions, [sessions]);

  const patchStatus = async (id: string, status: ClassroomSession["status"]) => {
    try {
      setError(null);
      const res = await fetch(`/api/classrooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Não foi possível atualizar o status da sala.");
        return;
      }
      await load();
    } catch {
      setError("Não foi possível atualizar o status da sala.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid max-w-5xl space-y-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#64748B]">
              <LayoutDashboard className="h-4 w-4" aria-hidden /> Sala de aula
            </div>
            <h1 className="text-fluid-2xl font-bold text-[#0F172A] mt-2">Salas</h1>
            <p className="text-fluid-sm text-[#64748B] mt-2">
              Crie e acompanhe salas para uso em sala de aula (sem WebSockets, com polling).
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sala/criar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white text-fluid-sm rounded-lg hover:bg-[#1E3A8A]/90 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden /> Criar sala
            </Link>
            <Link
              href="/sala/entrar"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm rounded-lg hover:bg-[#1E3A8A]/5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 transition-colors"
            >
              <LogIn className="h-4 w-4" aria-hidden /> Entrada (participante)
            </Link>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Filter className="h-4 w-4" aria-hidden /> Filtros
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "PREPARACAO", "ATIVA", "ENCERRADA", "CANCELADA"].map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={[
                  "px-3 py-1.5 border text-sm rounded-lg transition-colors",
                  filter === key
                    ? "border-[#1E3A8A] bg-[#1E3A8A]/5 text-[#1E3A8A] font-medium"
                    : "border-[#CBD5E1] text-[#64748B] hover:border-[#94A3B8]",
                ].join(" ")}
                type="button"
              >
                {key === "all" ? "Todas" : statusLabel[key as ClassroomSession["status"]]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8 text-fluid-sm text-[#64748B] text-center">
            Carregando salas...
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6 text-fluid-sm text-rose-600">
            {error}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8 text-fluid-sm text-[#64748B] text-center">
            Nenhuma sala encontrada. Crie uma sala para começar.
          </div>
        ) : (
          <div className="grid gap-4">
            {visible.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 hover:border-[#CBD5E1] transition-colors"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span
                        className={[
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                          statusBadgeClass[item.status],
                        ].join(" ")}
                      >
                        {statusLabel[item.status]}
                      </span>
                      <span className="text-xs text-[#64748B]">Código {item.code}</span>
                    </div>
                    <div className="text-fluid-lg font-semibold text-[#0F172A] mt-2">{item.title}</div>
                    {item.municipio?.nome && (
                      <div className="text-xs text-[#64748B] mt-1">
                        Município: {item.municipio.nome}{item.municipio.uf ? `/${item.municipio.uf}` : ""} • IBGE {item.municipio.ibgeId}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {item._count?.participants ?? 0} participantes
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileCheck className="h-3.5 w-3.5" /> {item._count?.diagnosticos ?? 0} diagnósticos
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/sala/${item.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-sm rounded-lg hover:bg-[#1E3A8A]/5 transition-colors"
                    >
                      <Settings2 className="h-4 w-4" /> Gerenciar
                    </Link>
                    {item.status === "PREPARACAO" && (
                      <button
                        type="button"
                        onClick={() => patchStatus(item.id, "ATIVA")}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                      >
                        <Play className="h-4 w-4" /> Ativar
                      </button>
                    )}
                    {item.status === "ATIVA" && (
                      <button
                        type="button"
                        onClick={() => patchStatus(item.id, "ENCERRADA")}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white text-sm rounded-lg hover:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:ring-offset-2 transition-colors"
                      >
                        <Square className="h-4 w-4" /> Encerrar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <HelpButton title="Salas (consultor)" helpHref="/ajuda/sala">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Use esta tela para <strong>listar</strong> e <strong>gerenciar</strong> salas. Ela é restrita a
            consultor/admin.
          </li>
          <li>
            Fluxo recomendado: criar sala → compartilhar código/token → ativar quando todos entrarem → acompanhar
            diagnósticos e conflitos via polling.
          </li>
          <li>
            Botões “Ativar/Encerrar” apenas mudam o status; participantes entram via <code>/sala/entrar</code>.
          </li>
        </ul>
      </HelpButton>
    </div>
  );
}

