"use client";

import { useState } from "react";
import Link from "next/link";

export default function RequestResetPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [simulated, setSimulated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/auth/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error || "Erro ao solicitar reset");
      setStatus("idle");
      return;
    }
    setSimulated(Boolean(data?.simulated));
    setStatus("sent");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] p-8">
        <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">
          Redefinir senha
        </h1>
        <p className="text-fluid-sm text-[#64748B] mb-6">
          Informe seu e-mail para receber o link de redefinição.
        </p>

        {status === "sent" ? (
          <div
            className={`text-sm px-3 py-2 border ${
              simulated
                ? "text-amber-700 bg-amber-50 border-amber-200"
                : "text-emerald-700 bg-emerald-50 border-emerald-200"
            }`}
          >
            {simulated ? (
              <>
                <strong>Resend não configurado.</strong> O e-mail não foi enviado.
                Configure <code className="text-xs">RESEND_API_KEY</code> e{" "}
                <code className="text-xs">MAIL_FROM</code> no .env.local (dev) ou
                na Vercel (produção).
              </>
            ) : (
              "Se o e-mail estiver cadastrado, você receberá o link em instantes."
            )}
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-fluid-sm text-[#64748B]">
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-[#E2E8F0] px-3 py-2"
                required
              />
            </label>
            {error && <div className="text-xs text-rose-600">{error}</div>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-4 py-2 bg-[#1E3A8A] text-white text-fluid-sm"
            >
              {status === "loading" ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}

        <div className="mt-4 text-xs text-[#64748B]">
          <Link href="/auth/login" className="text-[#1E3A8A] hover:underline">
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
