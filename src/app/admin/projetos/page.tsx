"use client";

import { useEffect, useState } from "react";

type ProjectItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  hub: string;
  isActive: boolean;
  client: { id: string; name: string };
};

export default function AdminProjetosPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    clientId: "",
    hub: "COOPERACAO_INTERNACIONAL",
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/projects");
    const clientsRes = await fetch("/api/admin/clients");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects || []);
    }
    if (clientsRes.ok) {
      const data = await clientsRes.json();
      setClients(data.clients || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Erro ao criar projeto.");
      return;
    }
    setForm({ name: "", slug: "", description: "", clientId: "", hub: "COOPERACAO_INTERNACIONAL" });
    load();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    load();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid">
        <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">
          Projetos por hub
        </h1>
        <p className="text-fluid-sm text-[#64748B] mb-6">
          Vincule projetos a clientes e hubs para controle de acesso.
        </p>

        {error && <div className="text-sm text-rose-600 mb-4">{error}</div>}

        <form onSubmit={create} className="bg-white border border-[#E2E8F0] p-5 mb-6 grid gap-3">
          <input
            className="border border-[#E2E8F0] px-3 py-2 text-sm"
            placeholder="Nome do projeto"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="border border-[#E2E8F0] px-3 py-2 text-sm"
            placeholder="Slug (ex: inovajuntos)"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
          />
          <select
            className="border border-[#E2E8F0] px-3 py-2 text-sm"
            value={form.clientId}
            onChange={(e) => setForm((prev) => ({ ...prev, clientId: e.target.value }))}
          >
            <option value="">Selecione o cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <select
            className="border border-[#E2E8F0] px-3 py-2 text-sm"
            value={form.hub}
            onChange={(e) => setForm((prev) => ({ ...prev, hub: e.target.value }))}
          >
            <option value="COOPERACAO_INTERNACIONAL">Cooperação Internacional</option>
            <option value="COMPRAS_GOVERNAMENTAIS">Compras Governamentais e Governança</option>
            <option value="SUPORTE_MUNICIPIOS">Suporte aos Municípios</option>
            <option value="DESENVOLVIMENTO_SOFTWARE">Desenvolvimento de Software</option>
          </select>
          <textarea
            className="border border-[#E2E8F0] px-3 py-2 text-sm"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <button className="px-4 py-2 bg-[#1E3A8A] text-white text-sm">
            Criar projeto
          </button>
        </form>

        {loading ? (
          <div className="text-sm text-[#64748B]">Carregando...</div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white border border-[#E2E8F0] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-[#64748B]">
                      {project.client.name} • {project.hub}
                    </div>
                    <div className="text-fluid-lg font-semibold text-[#0F172A]">
                      {project.name}
                    </div>
                    <div className="text-xs text-[#64748B]">{project.slug}</div>
                  </div>
                  <button
                    onClick={() => toggleActive(project.id, !project.isActive)}
                    className="px-3 py-2 text-xs border border-[#1E3A8A] text-[#1E3A8A]"
                  >
                    {project.isActive ? "Ativo" : "Inativo"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
