"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Clock } from "lucide-react";

const SESSION_CHECK_INTERVAL_MS = 60_000; // Revalidar sessão a cada 1 min
const COUNTDOWN_UPDATE_MS = 1_000; // Atualizar contador a cada 1 s

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SessionCountdown() {
  const pathname = usePathname();
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  // Buscar sessão e obter expires
  useEffect(() => {
    let cancelled = false;

    const fetchSession = () => {
      fetch("/api/auth/session")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (cancelled) return;
          if (!data?.user) {
            setExpiresAt(null);
            setRemainingMs(null);
            const next = encodeURIComponent(pathname || "/");
            window.location.replace(`/auth/login?next=${next}`);
            return;
          }
          const exp = data.expires;
          if (exp) {
            const date = typeof exp === "string" ? new Date(exp) : new Date(exp);
            const ts = date.getTime();
            setExpiresAt(ts);
            setRemainingMs(Math.max(0, ts - Date.now()));
          } else {
            setExpiresAt(null);
            setRemainingMs(null);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setExpiresAt(null);
            setRemainingMs(null);
          }
        });
    };

    fetchSession();
    const interval = setInterval(fetchSession, SESSION_CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  // Contagem regressiva e redirecionamento ao chegar a 0
  useEffect(() => {
    if (expiresAt == null || remainingMs == null) return;

    const tick = () => {
      const ms = Math.max(0, expiresAt - Date.now());
      setRemainingMs(ms);
      if (ms <= 0) {
        const next = encodeURIComponent(pathname || "/");
        window.location.replace(`/auth/login?next=${next}`);
      }
    };

    const interval = setInterval(tick, COUNTDOWN_UPDATE_MS);
    return () => clearInterval(interval);
  }, [expiresAt, pathname]);

  if (remainingMs == null || remainingMs <= 0) return null;

  return (
    <div
      className="flex items-center gap-1.5 text-fluid-xs text-[#64748B] bg-slate-50 border border-[#E2E8F0] px-2.5 py-1.5 rounded-md"
      title="Tempo restante da sessão. Ao chegar a 0 você será redirecionado ao login."
    >
      <Clock className="h-3.5 w-3.5 text-[#64748B]" />
      <span className="tabular-nums font-medium">
        Sessão: {formatRemaining(remainingMs)}
      </span>
    </div>
  );
}
