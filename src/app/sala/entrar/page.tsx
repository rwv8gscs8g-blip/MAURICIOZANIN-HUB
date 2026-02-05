"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { HelpButton } from "@/components/ui/HelpButton";
import { LogIn, ArrowLeft, User, ChevronDown, ChevronUp } from "lucide-react";

function SalaEntrarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedClassroomId = useMemo(() => searchParams.get("classroomId")?.trim() || "", [searchParams]);

  const [sessions, setSessions] = useState<
    Array<{
      id: string;
      municipioIbgeId: string;
      expiresAt: string | null;
      createdAt: string;
      status: string;
      municipio: { nome: string; uf: string } | null;
    }>
  >([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(preselectedClassroomId);

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [showOptional, setShowOptional] = useState(false);

  useEffect(() => {
    setLoadingSessions(true);
    fetch("/api/classrooms/public", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSessions([]);
          setError(data?.error || "Não foi possível carregar as salas públicas.");
          return;
        }
        setSessions(data.sessions || []);
      })
      .catch(() => {
        setSessions([]);
        setError("Não foi possível carregar as salas públicas.");
      })
      .finally(() => setLoadingSessions(false));
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (!selectedSessionId) {
        setError("Selecione o município (sala ativa) para entrar.");
        return;
      }
      const res = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroomSessionId: selectedSessionId,
          name: name.trim() || "Participante",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Não foi possível entrar na sala.");
        return;
      }

      sessionStorage.setItem(`classroomSessionId`, String(data.classroomSessionId || selectedSessionId));
      sessionStorage.setItem(`classroomParticipantId`, String(data.participantId || ""));

      const params = new URLSearchParams({ classroomSessionId: String(data.classroomSessionId || selectedSessionId) });
      if (data.municipioIbgeId) params.set("municipio", data.municipioIbgeId);
      router.push(`/diagnostico?${params.toString()}`);
    } catch {
      setError("Erro inesperado ao entrar na sala.");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "border border-[#CBD5E1] px-3 py-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] transition-colors";

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid max-w-2xl">
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#64748B]">
              <LogIn className="h-4 w-4" aria-hidden /> Sala de aula
            </div>
            <h1 className="text-fluid-2xl font-bold text-[#0F172A] mt-2">Diagnóstico por município</h1>
            <p className="text-fluid-sm text-[#64748B] mt-2">
              Link aberto para coleta: selecione o <strong>município</strong> (salas ativas) e clique em <strong>Entrar</strong>. Uma sala = um município = um diagnóstico.
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-5">
            <label className="grid gap-2">
              <span className="text-sm text-[#0F172A] font-medium">Município (salas ativas)</span>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className={inputClass}
                disabled={loadingSessions}
              >
                <option value="">
                  {loadingSessions ? "Carregando..." : "Selecione o município"}
                </option>
                {sessions.map((s) => {
                  const abertura = new Date(s.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const fechamento = s.expiresAt
                    ? new Date(s.expiresAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "sem horário";
                  return (
                    <option key={s.id} value={s.id}>
                      {s.municipio?.nome || "Município"}
                      {s.municipio?.uf ? ` (${s.municipio.uf})` : ""} — {abertura} → {fechamento}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm text-[#0F172A] font-medium">
                <User className="h-4 w-4 text-[#64748B]" /> Seu nome
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Nome e sobrenome"
              />
            </label>

            <div className="border-t border-[#E2E8F0] pt-4">
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-2 text-fluid-sm text-[#64748B] hover:text-[#0F172A]"
              >
                {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                E-mail, órgão e função (opcional) — (desativado no modo lista)
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white text-fluid-sm rounded-lg hover:bg-[#1E3A8A]/90 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 disabled:opacity-60 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                {busy ? "Entrando..." : "Entrar e iniciar diagnóstico"}
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm rounded-lg hover:bg-[#1E3A8A]/5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao site
              </Link>
            </div>
          </form>
        </div>
      </div>
      <HelpButton title="Entrar na sala (participante)" helpHref="/ajuda/sala">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>MVP:</strong> Entrada via lista: selecione o <strong>município</strong> que estiver com sala ativa e clique em Entrar.
          </li>
          <li>
            Após entrar, o sistema guarda a referência da sala no navegador para <strong>autosave</strong>.
          </li>
          <li>
            Para retomar, volte a esta página e selecione o mesmo município.
          </li>
        </ul>
      </HelpButton>
    </div>
  );
}

export default function SalaEntrarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-12">Carregando sala...</div>}>
      <SalaEntrarContent />
    </Suspense>
  );
}