"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HelpButton } from "@/components/ui/HelpButton";
import {
  LayoutDashboard,
  ArrowLeft,
  ExternalLink,
  Play,
  Square,
  Users,
  FileCheck,
  AlertTriangle,
  FileText,
  Code,
  CalendarRange,
} from "lucide-react";

type PollPayload = {
  classroom: {
    id: string;
    code: string;
    title: string;
    status: "PREPARACAO" | "ATIVA" | "ENCERRADA" | "CANCELADA";
    expiresAt: string | null;
    updatedAt: string;
    counts: { participants: number; diagnosticos: number };
  };
  diagnosticos: Array<{
    id: string;
    status: string;
    municipioIbgeId: string;
    respondentName: string;
    updatedAt: string;
  }>;
  hasConflicts: boolean;
  conflicts: Array<{
    diagnosticoId: string;
    versionNumber: number;
    createdAt: string;
    createdByRole: string;
    conflict: any;
  }>;
};

const statusLabel: Record<PollPayload["classroom"]["status"], string> = {
  PREPARACAO: "Preparação",
  ATIVA: "Ativa",
  ENCERRADA: "Encerrada",
  CANCELADA: "Cancelada",
};

const statusBadgeClass: Record<PollPayload["classroom"]["status"], string> = {
  PREPARACAO: "bg-amber-100 text-amber-800 border-amber-200",
  ATIVA: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ENCERRADA: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELADA: "bg-red-100 text-red-800 border-red-200",
};

export default function SalaDetalhePage() {
  const routeParams = useParams<{ id: string }>();
  const classroomId = String(routeParams?.id || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<PollPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [expiresAtInput, setExpiresAtInput] = useState<string>("");

  const poll = async () => {
    if (!classroomId) return;
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/poll`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Erro ao carregar sala.");
        return;
      }
      setPayload(data);
      setError(null);
    } catch {
      setError("Erro inesperado ao carregar sala.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!classroomId) return;
    poll();
    const t = setInterval(poll, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  const classroom = payload?.classroom || null;

  const enterLink = useMemo(() => {
    if (!classroom) return "/sala/entrar";
    return `/sala/entrar?classroomId=${encodeURIComponent(classroom.id)}`;
  }, [classroom]);

  const patchStatus = async (status: PollPayload["classroom"]["status"]) => {
    if (!classroomId) return;
    setBusy(true);
    try {
      await fetch(`/api/classrooms/${classroomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await poll();
    } finally {
      setBusy(false);
    }
  };

  const resolveConflict = async (diagnosticoId: string, conflictVersionNumber: number) => {
    setBusy(true);
    try {
      await fetch(`/api/classrooms/${classroomId}/resolve-conflict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosticoId, conflictVersionNumber }),
      });
      await poll();
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (classroom?.expiresAt) {
      const x = new Date(classroom.expiresAt);
      const y = x.getFullYear();
      const m = String(x.getMonth() + 1).padStart(2, "0");
      const d = String(x.getDate()).padStart(2, "0");
      const h = String(x.getHours()).padStart(2, "0");
      const min = String(x.getMinutes()).padStart(2, "0");
      setExpiresAtInput(`${y}-${m}-${d}T${h}:${min}`);
    } else {
      setExpiresAtInput("");
    }
  }, [classroom?.expiresAt]);

  const saveExpiresAt = async () => {
    if (!classroom) return;
    setBusy(true);
    try {
      await fetch(`/api/classrooms/${classroom.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresAt: expiresAtInput ? new Date(expiresAtInput).toISOString() : null,
        }),
      });
      await poll();
    } finally {
      setBusy(false);
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
            <h1 className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
              {classroom?.title || "Sala"}
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-2 text-fluid-sm text-[#64748B]">
              {classroom ? (
                <>
                  <span className="inline-flex items-center gap-1 font-medium text-[#0F172A]">
                    <Code className="h-4 w-4" /> {classroom.code}
                  </span>
                  <span
                    className={[
                      "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      statusBadgeClass[classroom.status],
                    ].join(" ")}
                  >
                    {statusLabel[classroom.status]}
                  </span>
                  <span className="text-xs">
                    Abertura:{" "}
                    {new Date(classroom.updatedAt || classroom.updatedAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                    {classroom.expiresAt &&
                      ` · Fechamento automático: ${new Date(classroom.expiresAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}`}
                  </span>
                </>
              ) : (
                "Carregando..."
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/sala"
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-sm rounded-lg hover:bg-[#1E3A8A]/5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
            <Link
              href={enterLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm rounded-lg hover:bg-[#1E3A8A]/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> Link para entrada
            </Link>
            {classroom?.status === "PREPARACAO" && (
              <button
                type="button"
                onClick={() => patchStatus("ATIVA")}
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
              >
                <Play className="h-4 w-4" /> Ativar
              </button>
            )}
            {classroom?.status === "ATIVA" && (
              <button
                type="button"
                onClick={() => patchStatus("ENCERRADA")}
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white text-sm rounded-lg hover:bg-[#1E293B] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:ring-offset-2 transition-colors"
              >
                <Square className="h-4 w-4" /> Encerrar
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8 text-fluid-sm text-[#64748B] text-center">
            Carregando painel...
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6 text-fluid-sm text-rose-600">
            {error}
          </div>
        ) : !payload ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8 text-fluid-sm text-[#64748B] text-center">
            Sem dados.
          </div>
        ) : (
          <>
            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#64748B] mb-3">
                <CalendarRange className="h-4 w-4" /> Horário da sala
              </div>
              <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end">
                <label className="grid gap-2 text-sm text-[#64748B]">
                  Horário de fechamento automático
                  <input
                    type="datetime-local"
                    value={expiresAtInput}
                    onChange={(e) => setExpiresAtInput(e.target.value)}
                    className="border border-[#E2E8F0] px-3 py-2 rounded-lg text-sm"
                  />
                  <span className="text-xs text-[#94A3B8]">
                    Se vazio, a sala não fecha automaticamente.
                  </span>
                </label>
                <button
                  type="button"
                  onClick={saveExpiresAt}
                  disabled={busy}
                  className="px-4 py-2 bg-[#1E3A8A] text-white text-sm rounded-lg hover:bg-[#1E3A8A]/90 disabled:opacity-60"
                >
                  Salvar horário
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#64748B]">
                  <Users className="h-4 w-4" /> Participantes
                </div>
                <div className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
                  {payload.classroom.counts.participants}
                </div>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#64748B]">
                  <FileCheck className="h-4 w-4" /> Diagnósticos
                </div>
                <div className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
                  {payload.classroom.counts.diagnosticos}
                </div>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#64748B]">
                  <AlertTriangle className="h-4 w-4" /> Conflitos
                </div>
                <div className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
                  {payload.conflicts.length}
                </div>
              </div>
            </div>

            {payload.hasConflicts && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-rose-700 font-medium">
                  <AlertTriangle className="h-4 w-4" /> Atenção
                </div>
                <div className="text-fluid-lg font-semibold text-[#0F172A] mt-2">
                  Conflitos detectados (last-write-wins)
                </div>
                <p className="text-fluid-sm text-[#64748B] mt-2">
                  Existem salvamentos concorrentes. Você pode registrar a resolução (sem WebSockets; atualização via polling).
                </p>
                <div className="mt-4 grid gap-3">
                  {payload.conflicts.map((c) => (
                    <div
                      key={`${c.diagnosticoId}-${c.versionNumber}`}
                      className="border border-rose-200 rounded-lg bg-white p-4"
                    >
                      <div className="text-sm text-[#0F172A] font-semibold">
                        Diagnóstico {c.diagnosticoId.slice(0, 8)}… • versão {c.versionNumber}
                      </div>
                      <div className="text-xs text-[#64748B] mt-1">
                        Campos: {(c.conflict?.fields || []).join(", ") || "—"} • Base:{" "}
                        {c.conflict?.baseVersionNumber} • Servidor: {c.conflict?.serverVersionNumber}
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => resolveConflict(c.diagnosticoId, c.versionNumber)}
                          className="px-4 py-2 bg-[#1E3A8A] text-white text-sm rounded-lg hover:bg-[#1E3A8A]/90 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 transition-colors"
                        >
                          Marcar como resolvido
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#64748B]">
                <FileText className="h-4 w-4" /> Diagnósticos vinculados
              </div>
              {payload.diagnosticos.length === 0 ? (
                <div className="text-fluid-sm text-[#64748B] mt-2">
                  Ainda não há diagnósticos nesta sala.
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {payload.diagnosticos.map((d) => (
                    <div
                      key={d.id}
                      className="border border-[#E2E8F0] rounded-lg p-4 hover:border-[#CBD5E1] transition-colors"
                    >
                      <div className="text-sm text-[#0F172A] font-semibold">{d.respondentName}</div>
                      <div className="text-xs text-[#64748B] mt-1">
                        Status: {d.status} • IBGE: {d.municipioIbgeId} • Atualizado em{" "}
                        {new Date(d.updatedAt).toLocaleString("pt-BR")}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/diagnostico/imprimir?id=${encodeURIComponent(d.id)}`}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-sm rounded-lg hover:bg-[#1E3A8A]/5 transition-colors"
                        >
                          <FileText className="h-4 w-4" /> Relatório (HTML)
                        </Link>
                        <Link
                          href={`/api/diagnosticos/${encodeURIComponent(d.id)}`}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-[#CBD5E1] text-[#64748B] text-sm rounded-lg hover:bg-[#F8FAFC] transition-colors"
                        >
                          Ver JSON
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <HelpButton title="Painel da sala (consultor)" helpHref="/ajuda/sala">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Esta tela faz <strong>polling</strong> a cada ~5s para atualizar contadores, diagnósticos e conflitos.
          </li>
          <li>
            Conflitos são “last-write-wins”: o sistema registra o conflito na versão e você pode marcar como resolvido
            (registro append-only).
          </li>
          <li>
            Use “Link para entrada” para distribuir o acesso aos participantes (<code>/sala/entrar</code>).
          </li>
        </ul>
      </HelpButton>
    </div>
  );
}

