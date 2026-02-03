"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [tab, setTab] = useState<"magic" | "password" | "certificate">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicStatus, setMagicStatus] = useState<"idle" | "loading" | "sent">(
    "idle"
  );
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPassword, setCertPassword] = useState("");
  const [certValidated, setCertValidated] = useState(false);
  const [certCanLogin, setCertCanLogin] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [certInfo, setCertInfo] = useState<{
    thumbprint: string;
    subject: string;
    validFrom: string;
    validTo: string;
  } | null>(null);

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
    if (role === "CLIENTE" && clientSlug) {
      window.location.href = `/clientes/${clientSlug}`;
      return;
    }
    window.location.href = "/dashboard";
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
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Erro ao solicitar link");
      setMagicStatus("idle");
      return;
    }
    setMagicStatus("sent");
  };

  const handleValidateCertificate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setCertValidated(false);
    setCertCanLogin(false);
    setCertInfo(null);

    if (!certFile || !certPassword) {
      setError("Envie o certificado e a senha.");
      return;
    }

    setCertLoading(true);
    try {
      const formData = new FormData();
      formData.append("certificate", certFile);
      formData.append("password", certPassword);
      const res = await fetch("/api/auth/certificate/validate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data?.error || "Erro ao validar certificado.");
        return;
      }
      setCertValidated(true);
      setCertCanLogin(Boolean(data.canLogin));
      setCertInfo({
        thumbprint: data.certInfo.thumbprint,
        subject: data.certInfo.subject,
        validFrom: data.certInfo.validFrom,
        validTo: data.certInfo.validTo,
      });
      if (!data.canLogin) {
        setError("Certificado válido, mas não autorizado.");
      }
    } finally {
      setCertLoading(false);
    }
  };

  const handleCertificateLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!certValidated || !certCanLogin) {
      setError("Valide o certificado antes de entrar.");
      return;
    }

    if (!certFile || !certPassword) {
      setError("Envie o certificado e a senha.");
      return;
    }

    setCertLoading(true);
    try {
      const formData = new FormData();
      formData.append("certificate", certFile);
      formData.append("password", certPassword);
      const res = await fetch("/api/auth/certificate/login", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data?.error || "Erro ao fazer login.");
        return;
      }
      window.location.href = "/dashboard";
    } finally {
      setCertLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] p-8">
        <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">Acesso</h1>
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
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2">
                Se o e-mail estiver cadastrado, você receberá o link em instantes.
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleValidateCertificate}
                disabled={certLoading}
                className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm"
              >
                {certLoading ? "Validando..." : "Validar certificado"}
              </button>
              <button
                type="submit"
                disabled={certLoading}
                className="px-4 py-2 bg-[#1E3A8A] text-white text-fluid-sm"
              >
                Entrar
              </button>
            </div>
            {certInfo && (
              <div className="text-xs text-[#64748B] border border-[#E2E8F0] p-3">
                <div>Thumbprint: {certInfo.thumbprint}</div>
                <div>Validade: {new Date(certInfo.validFrom).toLocaleDateString("pt-BR")} até{" "}
                  {new Date(certInfo.validTo).toLocaleDateString("pt-BR")}</div>
              </div>
            )}
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
