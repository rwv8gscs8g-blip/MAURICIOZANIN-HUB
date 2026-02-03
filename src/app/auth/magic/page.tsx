"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "consuming">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setStatus("consuming");
    fetch("/api/auth/magic/consume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Token inválido");
        }
        window.location.href = "/dashboard";
      })
      .catch((err) => {
        setError(err.message);
        setStatus("idle");
      });
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/auth/request-magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Erro ao solicitar link");
      setStatus("idle");
      return;
    }
    setStatus("sent");
  };

  return (
    <div className="w-full max-w-md bg-white border border-[#E2E8F0] p-8">
      <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">
        Acesso por link
      </h1>
      <p className="text-fluid-sm text-[#64748B] mb-6">
        Enviaremos um link rápido para seu e-mail.
      </p>

      {status === "consuming" && (
        <div className="text-sm text-[#64748B]">Validando link...</div>
      )}

      {status === "sent" ? (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2">
          Se o e-mail estiver cadastrado, você receberá o link em instantes.
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
  );
}

export default function MagicLinkPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-sm text-[#64748B]">Carregando...</div>}>
        <MagicLinkContent />
      </Suspense>
    </div>
  );
}
