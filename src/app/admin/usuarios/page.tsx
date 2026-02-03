"use client";

import { useEffect, useMemo, useState } from "react";

type UserRole = "ADMIN" | "SUPERCONSULTOR" | "CONSULTOR" | "MUNICIPIO" | "CLIENTE";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  certificateOnly?: boolean;
  clientAccessApproved?: boolean;
  createdAt?: string;
  lastLogin?: string | null;
  lockedUntil?: string | null;
  clientOrganizationId?: string | null;
  hubAccesses?: { hub: string }[];
  projectAccesses?: { projectId: string }[];
};

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UserRole | "all">("all");
  const [selected, setSelected] = useState<UserItem | null>(null);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    role: "MUNICIPIO" as UserRole,
    password: "",
    certificateOnly: false,
    certificateThumbprint: "",
    clientOrganizationId: "",
    clientAccessApproved: false,
    hubs: [] as string[],
    projects: [] as string[],
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "MUNICIPIO" as UserRole,
    password: "",
    certificateOnly: false,
    certificateThumbprint: "",
    lockedUntil: "",
    clientOrganizationId: "",
    clientAccessApproved: false,
    hubs: [] as string[],
    projects: [] as string[],
  });

  const hubOptions = [
    { value: "COOPERACAO_INTERNACIONAL", label: "Cooperação Internacional" },
    { value: "COMPRAS_GOVERNAMENTAIS", label: "Compras Governamentais e Governança" },
    { value: "SUPORTE_MUNICIPIOS", label: "Suporte aos Municípios" },
    { value: "DESENVOLVIMENTO_SOFTWARE", label: "Desenvolvimento de Software" },
  ];

  const filteredUsers = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((u) => u.role === filter);
  }, [users, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/users");
    const clientsRes = await fetch("/api/admin/clients");
    const projectsRes = await fetch("/api/admin/projects");
    if (!res.ok) {
      setError("Erro ao carregar usuários");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setUsers(data.users || []);
    if (clientsRes.ok) {
      const clientsData = await clientsRes.json();
      setClients(clientsData.clients || []);
    }
    if (projectsRes.ok) {
      const projectsData = await projectsRes.json();
      setProjects(projectsData.projects || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Erro ao criar usuário");
      return;
    }
    setCreateForm({
      name: "",
      email: "",
      role: "MUNICIPIO",
      password: "",
      certificateOnly: false,
      certificateThumbprint: "",
      clientOrganizationId: "",
      clientAccessApproved: false,
      hubs: [],
      projects: [],
    });
    fetchUsers();
  };

  const handleSelect = (user: UserItem) => {
    setSelected(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      certificateOnly: Boolean(user.certificateOnly),
      certificateThumbprint: "",
      lockedUntil: user.lockedUntil ? user.lockedUntil.slice(0, 16) : "",
      clientOrganizationId: (user as any).clientOrganizationId || "",
      clientAccessApproved: Boolean((user as any).clientAccessApproved),
      hubs: (user.hubAccesses || []).map((h) => h.hub),
      projects: (user.projectAccesses || []).map((p) => p.projectId),
    });
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    const payload: Record<string, any> = {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      certificateOnly: editForm.certificateOnly,
      certificateThumbprint: editForm.certificateThumbprint || null,
      lockedUntil: editForm.lockedUntil ? new Date(editForm.lockedUntil) : null,
      clientOrganizationId: editForm.clientOrganizationId || null,
      clientAccessApproved: editForm.clientAccessApproved,
      hubs: editForm.hubs,
      projects: editForm.projects,
    };
    if (editForm.password) payload.password = editForm.password;

    const res = await fetch(`/api/admin/users/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Erro ao atualizar usuário");
      return;
    }
    setEditForm((prev) => ({ ...prev, password: "" }));
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir este usuário?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Erro ao excluir usuário");
      return;
    }
    if (selected?.id === id) setSelected(null);
    fetchUsers();
  };

  const handleApproveClient = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientAccessApproved: true }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Erro ao aprovar cliente");
      return;
    }
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">
              Gestão de usuários
            </h1>
            <p className="text-fluid-sm text-[#64748B] mb-6">
              Controle de acesso e perfis com auditoria mínima.
            </p>

            <div className="flex gap-2 mb-4">
              {(
                ["all", "ADMIN", "SUPERCONSULTOR", "CONSULTOR", "MUNICIPIO", "CLIENTE"] as const
              ).map((role) => (
                <button
                  key={role}
                  onClick={() => setFilter(role)}
                  className={`px-4 py-2 border text-sm ${filter === role
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                      : "bg-white text-[#64748B] border-[#E2E8F0]"
                    }`}
                >
                  {role === "all" ? "Todos" : role}
                </button>
              ))}
            </div>

            {error && <div className="text-sm text-rose-600 mb-4">{error}</div>}

            {loading ? (
              <div className="text-sm text-[#64748B]">Carregando usuários...</div>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white border border-[#E2E8F0] p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A]">
                        {user.name}
                      </div>
                      <div className="text-xs text-[#64748B]">{user.email}</div>
                      <div className="text-xs text-[#64748B]">
                        {user.role} •{" "}
                        {user.lastLogin
                          ? `Último login ${new Date(user.lastLogin).toLocaleString("pt-BR")}`
                          : "Sem login"}
                        {user.role === "CLIENTE" && (
                          <span className="ml-2">
                            {user.clientAccessApproved ? "• Cliente aprovado" : "• Cliente pendente"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.role === "CLIENTE" && !user.clientAccessApproved && (
                        <button
                          className="px-3 py-1 text-xs border border-emerald-500 text-emerald-600"
                          onClick={() => handleApproveClient(user.id)}
                        >
                          Aprovar cliente
                        </button>
                      )}
                      <button
                        className="px-3 py-1 text-xs border border-[#1E3A8A] text-[#1E3A8A]"
                        onClick={() => handleSelect(user)}
                      >
                        Editar
                      </button>
                      <button
                        className="px-3 py-1 text-xs border border-rose-500 text-rose-600"
                        onClick={() => handleDelete(user.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="w-full max-w-sm bg-white border border-[#E2E8F0] p-6">
            <h2 className="text-fluid-lg font-semibold text-[#0F172A] mb-4">
              Novo usuário
            </h2>
            <form className="grid gap-3" onSubmit={handleCreate}>
              <input
                className="border border-[#E2E8F0] px-3 py-2 text-sm"
                placeholder="Nome completo"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
              />
              <input
                className="border border-[#E2E8F0] px-3 py-2 text-sm"
                placeholder="E-mail"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
              />
              <select
                className="border border-[#E2E8F0] px-3 py-2 text-sm"
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({ ...createForm, role: e.target.value as UserRole })
                }
              >
                <option value="MUNICIPIO">MUNICÍPIO</option>
                <option value="CONSULTOR">CONSULTOR</option>
                <option value="SUPERCONSULTOR">SUPERCONSULTOR</option>
                <option value="ADMIN">ADMIN</option>
                <option value="CLIENTE">CLIENTE</option>
              </select>
              <select
                className="border border-[#E2E8F0] px-3 py-2 text-sm"
                value={createForm.clientOrganizationId}
                onChange={(e) =>
                  setCreateForm({ ...createForm, clientOrganizationId: e.target.value })
                }
              >
                <option value="">Cliente (opcional)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {createForm.role === "CLIENTE" && (
                <label className="flex items-center gap-2 text-xs text-[#64748B]">
                  <input
                    type="checkbox"
                    checked={createForm.clientAccessApproved}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, clientAccessApproved: e.target.checked })
                    }
                  />
                  Acesso cliente aprovado
                </label>
              )}
              <div className="grid gap-2 text-xs text-[#64748B]">
                Hubs de acesso
                <div className="flex flex-wrap gap-2">
                  {hubOptions.map((hub) => (
                    <label key={hub.value} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={createForm.hubs.includes(hub.value)}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            hubs: e.target.checked
                              ? [...prev.hubs, hub.value]
                              : prev.hubs.filter((item) => item !== hub.value),
                          }))
                        }
                      />
                      {hub.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-2 text-xs text-[#64748B]">
                Projetos de acesso
                <div className="flex flex-wrap gap-2">
                  {projects.map((project) => (
                    <label key={project.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={createForm.projects.includes(project.id)}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            projects: e.target.checked
                              ? [...prev.projects, project.id]
                              : prev.projects.filter((item) => item !== project.id),
                          }))
                        }
                      />
                      {project.name}
                    </label>
                  ))}
                  {projects.length === 0 && (
                    <span className="text-xs text-[#94A3B8]">
                      Nenhum projeto cadastrado.
                    </span>
                  )}
                </div>
              </div>
              <input
                className="border border-[#E2E8F0] px-3 py-2 text-sm"
                placeholder="Senha inicial"
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
              />
              <label className="flex items-center gap-2 text-xs text-[#64748B]">
                <input
                  type="checkbox"
                  checked={createForm.certificateOnly}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, certificateOnly: e.target.checked })
                  }
                />
                Login somente por certificado
              </label>
              <input
                className="border border-[#E2E8F0] px-3 py-2 text-sm"
                placeholder="Thumbprint do certificado (opcional)"
                value={createForm.certificateThumbprint}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    certificateThumbprint: e.target.value,
                  })
                }
              />
              <button className="px-4 py-2 bg-[#1E3A8A] text-white text-sm">
                Criar usuário
              </button>
            </form>

            {selected && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
                  Editar usuário
                </h3>
                <form className="grid gap-3" onSubmit={handleUpdate}>
                  <input
                    className="border border-[#E2E8F0] px-3 py-2 text-sm"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                  <input
                    className="border border-[#E2E8F0] px-3 py-2 text-sm"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                  <select
                    className="border border-[#E2E8F0] px-3 py-2 text-sm"
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value as UserRole })
                    }
                  >
                    <option value="MUNICIPIO">MUNICÍPIO</option>
                    <option value="CONSULTOR">CONSULTOR</option>
                    <option value="SUPERCONSULTOR">SUPERCONSULTOR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="CLIENTE">CLIENTE</option>
                  </select>
                  <select
                    className="border border-[#E2E8F0] px-3 py-2 text-sm"
                    value={editForm.clientOrganizationId}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        clientOrganizationId: e.target.value,
                      })
                    }
                  >
                    <option value="">Cliente (opcional)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {editForm.role === "CLIENTE" && (
                    <label className="flex items-center gap-2 text-xs text-[#64748B]">
                      <input
                        type="checkbox"
                        checked={editForm.clientAccessApproved}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            clientAccessApproved: e.target.checked,
                          })
                        }
                      />
                      Acesso cliente aprovado
                    </label>
                  )}
                  <div className="grid gap-2 text-xs text-[#64748B]">
                    Hubs de acesso
                    <div className="flex flex-wrap gap-2">
                      {hubOptions.map((hub) => (
                        <label key={hub.value} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={editForm.hubs.includes(hub.value)}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                hubs: e.target.checked
                                  ? [...prev.hubs, hub.value]
                                  : prev.hubs.filter((item) => item !== hub.value),
                              }))
                            }
                          />
                          {hub.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2 text-xs text-[#64748B]">
                    Projetos de acesso
                    <div className="flex flex-wrap gap-2">
                      {projects.map((project) => (
                        <label key={project.id} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={editForm.projects.includes(project.id)}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                projects: e.target.checked
                                  ? [...prev.projects, project.id]
                                  : prev.projects.filter((item) => item !== project.id),
                              }))
                            }
                          />
                          {project.name}
                        </label>
                      ))}
                      {projects.length === 0 && (
                        <span className="text-xs text-[#94A3B8]">
                          Nenhum projeto cadastrado.
                        </span>
                      )}
                    </div>
                  </div>
                  <input
                    className="border border-[#E2E8F0] px-3 py-2 text-sm"
                    placeholder="Nova senha"
                    type="password"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm({ ...editForm, password: e.target.value })
                    }
                  />
                  <label className="flex items-center gap-2 text-xs text-[#64748B]">
                    <input
                      type="checkbox"
                      checked={editForm.certificateOnly}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          certificateOnly: e.target.checked,
                        })
                      }
                    />
                    Login somente por certificado
                  </label>
                  <input
                    className="border border-[#E2E8F0] px-3 py-2 text-sm"
                    placeholder="Thumbprint do certificado"
                    value={editForm.certificateThumbprint}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        certificateThumbprint: e.target.value,
                      })
                    }
                  />
                  <label className="text-xs text-[#64748B]">
                    Bloqueio até (opcional)
                    <input
                      className="border border-[#E2E8F0] px-3 py-2 text-sm w-full mt-1"
                      type="datetime-local"
                      value={editForm.lockedUntil}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lockedUntil: e.target.value })
                      }
                    />
                  </label>
                  <button className="px-4 py-2 bg-[#0F172A] text-white text-sm">
                    Salvar alterações
                  </button>
                </form>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
