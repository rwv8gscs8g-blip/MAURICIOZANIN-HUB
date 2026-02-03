"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const HUBS = [
  { key: "COOPERACAO_INTERNACIONAL", label: "Cooperação Internacional" },
  { key: "COMPRAS_GOVERNAMENTAIS", label: "Compras Governamentais e Governança" },
  { key: "SUPORTE_MUNICIPIOS", label: "Suporte aos Municípios" },
  { key: "DESENVOLVIMENTO_SOFTWARE", label: "Desenvolvimento de Software" },
];

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"PADRAO" | "CLIENTE">("PADRAO");
  const [clientOrganizationId, setClientOrganizationId] = useState("");
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [selectedHubs, setSelectedHubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      const res = await fetch("/api/clients/public");
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      setClients(data?.clients || []);
    };
    loadClients();
  }, []);

  const toggleHub = (key: string) => {
    setSelectedHubs((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        userType,
        clientOrganizationId,
        hubs: selectedHubs,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Não foi possível enviar a solicitação.");
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white border border-[#E2E8F0] p-8">
        <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">
          Solicitar cadastro
        </h1>
        <p className="text-fluid-sm text-[#64748B] mb-6">
          Informe seus dados e selecione o tipo de acesso. A liberação para áreas de
          clientes é feita pela equipe responsável.
        </p>

        {success ? (
          <div className="text-sm text-emerald-600">
            Solicitação enviada. Você receberá um retorno por e-mail.
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-fluid-sm text-[#64748B]">
              Nome completo
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-[#E2E8F0] px-3 py-2"
                required
              />
            </label>
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
                minLength={8}
                required
              />
            </label>

            <label className="grid gap-2 text-fluid-sm text-[#64748B]">
              Tipo de cadastro
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as "PADRAO" | "CLIENTE")}
                className="border border-[#E2E8F0] px-3 py-2"
              >
                <option value="PADRAO">Usuário padrão</option>
                <option value="CLIENTE">Cliente</option>
              </select>
            </label>

            {userType === "CLIENTE" && (
              <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                Cliente
                <select
                  value={clientOrganizationId}
                  onChange={(e) => setClientOrganizationId(e.target.value)}
                  className="border border-[#E2E8F0] px-3 py-2"
                  required
                  disabled={clients.length === 0}
                >
                  <option value="">Selecione o cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <span className="text-xs text-amber-700">
                    Nenhum cliente cadastrado ainda.
                  </span>
                )}
              </label>
            )}

            <div className="grid gap-2 text-fluid-sm text-[#64748B]">
              Hubs de interesse
              <div className="grid gap-2">
                {HUBS.map((hub) => (
                  <label
                    key={hub.key}
                    className="flex items-center gap-2 text-sm text-[#0F172A]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHubs.includes(hub.key)}
                      onChange={() => toggleHub(hub.key)}
                    />
                    {hub.label}
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="text-xs text-rose-600">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#1E3A8A] text-white text-fluid-sm"
            >
              {loading ? "Enviando..." : "Solicitar acesso"}
            </button>
          </form>
        )}

        <div className="mt-4 text-xs text-[#64748B]">
          Já tem acesso?{" "}
          <Link href="/auth/login" className="text-[#1E3A8A] hover:underline">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
