"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const reason = searchParams.get("reason") || "";
  const denied = searchParams.get("denied") === "1";
  const sessionExpired = reason === "session";
  const [tab, setTab] = useState<"magic" | "password" | "certificate">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicStatus, setMagicStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [magicSimulated, setMagicSimulated] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPassword, setCertPassword] = useState("");
  const [certLoading, setCertLoading] = useState(false);
  const [certSuccess, setCertSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Falha ao autenticar");
      setLoading(false);
      return;
    }
    const data = await res.json().catch(() => null);
    const role = data?.user?.role;
    const clientSlug = data?.user?.clientOrganizationSlug;
    if (role === "CLIENTE" && clientSlug && !next) {
      window.location.href = `/clientes/${clientSlug}`;
      return;
    }
    const redirectTo = next && next.startsWith("/") ? next : "/dashboard";
    window.location.href = redirectTo;
  };

  const handleMagic = async (event: React.FormEvent) => {
    event.preventDefault();
    setMagicStatus("loading");
    setError(null);
    const res = await fetch("/api/auth/request-magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error || "Erro ao solicitar link");
      setMagicStatus("idle");
      return;
    }
    setMagicSimulated(Boolean(data?.simulated));
    setMagicStatus("sent");
  };

  const handleCertificateLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setCertSuccess(false);

    if (!certFile || !certPassword) {
      setError("Envie o certificado e a senha.");
      return;
    }

    setCertLoading(true);
    try {
      const buildFormData = () => {
        const fd = new FormData();
        fd.append("certificate", certFile);
        fd.append("password", certPassword);
        return fd;
      };

      // 1. Validar certificado
      const validateRes = await fetch("/api/auth/certificate/validate", {
        method: "POST",
        body: buildFormData(),
      });
      const validateData = await validateRes.json();
      if (!validateRes.ok || !validateData.success) {
        setError(validateData?.error || "Erro ao validar certificado.");
        return;
      }
      if (!validateData.canLogin) {
        setError("Certificado válido, mas não autorizado.");
        return;
      }

      // 2. Login
      const loginRes = await fetch("/api/auth/certificate/login", {
        method: "POST",
        body: buildFormData(),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok || !loginData.success) {
        setError(loginData?.error || "Erro ao fazer login.");
        return;
      }

      setCertSuccess(true);
      const redirectTo = next && next.startsWith("/") ? next : "/dashboard";
      window.location.href = redirectTo;
    } finally {
      setCertLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] p-8">
        <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">Acesso</h1>
        {sessionExpired && (
          <p className="text-fluid-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mb-4 rounded">
            Sessão expirada ou sem permissão. Faça login novamente para continuar.
          </p>
        )}
        {denied && !sessionExpired && (
          <p className="text-fluid-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mb-4 rounded">
            Acesso negado para seu perfil. Esta área é restrita a administradores.
          </p>
        )}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTab("magic")}
            className={`px-3 py-2 text-xs border ${
              tab === "magic"
                ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                : "bg-white text-[#64748B] border-[#E2E8F0]"
            }`}
          >
            Código por e-mail
          </button>
          <button
            type="button"
            onClick={() => setTab("password")}
            className={`px-3 py-2 text-xs border ${
              tab === "password"
                ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                : "bg-white text-[#64748B] border-[#E2E8F0]"
            }`}
          >
            Senha
          </button>
          <button
            type="button"
            onClick={() => setTab("certificate")}
            className={`px-3 py-2 text-xs border ${
              tab === "certificate"
                ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                : "bg-white text-[#64748B] border-[#E2E8F0]"
            }`}
          >
            Certificado
          </button>
        </div>
        <p className="text-fluid-sm text-[#64748B] mb-6">
          {tab === "magic"
            ? "Envie um link seguro para seu e-mail."
            : tab === "password"
            ? "Use e-mail e senha como alternativa."
            : "Acesso por certificado digital (A1)."}
        </p>
        {tab === "magic" && (
          <form className="grid gap-4" onSubmit={handleMagic}>
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
              disabled={magicStatus === "loading"}
              className="px-4 py-2 bg-[#1E3A8A] text-white text-fluid-sm"
            >
              {magicStatus === "loading" ? "Enviando..." : "Enviar código"}
            </button>
            {magicStatus === "sent" && (
              <div
                className={`text-xs px-3 py-2 border ${
                  magicSimulated
                    ? "text-amber-700 bg-amber-50 border-amber-200"
                    : "text-emerald-700 bg-emerald-50 border-emerald-200"
                }`}
              >
                {magicSimulated ? (
                  <>
                    <strong>Resend não configurado.</strong> O e-mail não foi
                    enviado. Configure RESEND_API_KEY e MAIL_FROM no .env.local
                    (dev) ou na Vercel (produção).
                  </>
                ) : (
                  "Se o e-mail estiver cadastrado, você receberá o link em instantes."
                )}
              </div>
            )}
          </form>
        )}
        {tab === "password" && (
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
            <label className="grid gap-2 text-fluid-sm text-[#64748B]">
              Senha
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
              disabled={loading}
              className="px-4 py-2 bg-[#1E3A8A] text-white text-fluid-sm"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <div className="text-xs text-[#64748B]">
              <Link href="/auth/request" className="text-[#1E3A8A] hover:underline">
                Esqueci minha senha
              </Link>
            </div>
          </form>
        )}
        {tab === "certificate" && (
          <form className="grid gap-4" onSubmit={handleCertificateLogin}>
            <label className="grid gap-2 text-fluid-sm text-[#64748B]">
              Certificado A1 (.pfx/.p12)
              <input
                type="file"
                accept=".pfx,.p12"
                onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                className="border border-[#E2E8F0] px-3 py-2"
                required
              />
            </label>
            <label className="grid gap-2 text-fluid-sm text-[#64748B]">
              Senha do certificado
              <input
                type="password"
                value={certPassword}
                onChange={(e) => setCertPassword(e.target.value)}
                className="border border-[#E2E8F0] px-3 py-2"
                required
              />
            </label>
            {error && <div className="text-xs text-rose-600">{error}</div>}
            {certSuccess && (
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded">
                ✓ Login realizado! Redirecionando...
              </div>
            )}
            <button
              type="submit"
              disabled={certLoading}
              className="px-4 py-2 bg-[#1E3A8A] text-white text-fluid-sm disabled:opacity-70"
            >
              {certLoading ? "Validando e entrando..." : "Entrar com certificado"}
            </button>
          </form>
        )}
        <div className="mt-4 flex items-center justify-between text-xs text-[#64748B]">
          <Link href="/auth/magic" className="text-[#1E3A8A] hover:underline">
            Verificação de link recebido
          </Link>
        </div>
        <div className="mt-3 text-xs text-[#64748B]">
          Ainda não tem acesso?{" "}
          <Link href="/auth/cadastro" className="text-[#1E3A8A] hover:underline">
            Solicitar cadastro
          </Link>
        </div>
        <div className="mt-3 text-xs text-[#64748B]">
          <Link href="/" className="text-[#1E3A8A] hover:underline">
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <p className="text-[#64748B]">Carregando...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
