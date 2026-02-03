"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError("Token inválido.");
      return;
    }
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Erro ao redefinir senha");
      setStatus("idle");
      return;
    }
    setStatus("done");
  };

  return (
    <div className="w-full max-w-md bg-white border border-[#E2E8F0] p-8">
      <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">
        Nova senha
      </h1>
      <p className="text-fluid-sm text-[#64748B] mb-6">
        Crie uma senha com pelo menos 8 caracteres.
      </p>

      {status === "done" ? (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2">
          Senha atualizada. Você já pode entrar.
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-fluid-sm text-[#64748B]">
            Nova senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {status === "loading" ? "Salvando..." : "Salvar senha"}
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

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-sm text-[#64748B]">Carregando...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
