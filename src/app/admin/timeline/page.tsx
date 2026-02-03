"use client";

import { useEffect, useMemo, useState } from "react";

type TimelineItem = {
  id: string;
  date: string;
  title: string;
  description?: string | null;
  axis?: string | null;
  hub?: string | null;
  type: string;
  category?: string | null;
  source?: string | null;
  url?: string | null;
  approved: boolean;
  visibility: "PUBLICO" | "INTERNO";
};

export default function AdminTimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todos");
  const [hubFilter, setHubFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<TimelineItem>>>({});

  const fetchItems = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (status !== "todos") params.set("status", status);
    if (hubFilter) params.set("hub", hubFilter);
    const res = await fetch(`/api/admin/timeline?${params.toString()}`);
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [query, status, hubFilter]);

  const updateItem = async (id: string, updates: Partial<TimelineItem>) => {
    await fetch(`/api/admin/timeline/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    fetchItems();
  };

  const startEdit = (item: TimelineItem) => {
    const dateValue = item.date ? new Date(item.date).toISOString().slice(0, 10) : "";
    setDrafts((prev) => ({
      ...prev,
      [item.id]: {
        ...item,
        date: dateValue,
      },
    }));
    setEditingId(item.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const currentDraft = useMemo(
    () => (editingId ? drafts[editingId] : null),
    [drafts, editingId],
  );

  const summary = useMemo(() => {
    const total = items.length;
    const pendentes = items.filter((item) => !item.approved).length;
    const aprovados = items.filter((item) => item.approved).length;
    const publicados = items.filter(
      (item) => item.approved && item.visibility === "PUBLICO",
    ).length;
    const internos = items.filter((item) => item.visibility === "INTERNO").length;
    const byHub = items.reduce<Record<string, number>>((acc, item) => {
      const key = item.hub || "SEM_HUB";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return { total, pendentes, aprovados, publicados, internos, byHub };
  }, [items]);

  const saveDraft = async () => {
    if (!editingId || !currentDraft) return;
    const payload: Partial<TimelineItem> = { ...currentDraft };
    if (payload.date && typeof payload.date === "string" && payload.date.length === 10) {
      payload.date = new Date(payload.date).toISOString();
    }
    await updateItem(editingId, payload);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid">
        <div className="mb-4">
          <a href="/admin" className="text-sm text-[#1E3A8A] hover:underline">
            ← Voltar à administração
          </a>
        </div>
        <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">
          Aprovação da linha do tempo
        </h1>
        <p className="text-fluid-sm text-[#64748B] mb-6">
          Itens precisam ser aprovados antes de entrar na timeline pública.
        </p>

        <div className="bg-white border border-[#E2E8F0] p-4 mb-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs text-[#64748B]">Pesquisar</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título, fonte, categoria..."
                className="w-full border border-[#E2E8F0] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748B]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-[#E2E8F0] px-3 py-2 text-sm"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="aprovado">Aprovados</option>
                <option value="publicado">Publicados</option>
                <option value="interno">Internos</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#64748B]">Hub</label>
              <select
                value={hubFilter}
                onChange={(e) => setHubFilter(e.target.value)}
                className="w-full border border-[#E2E8F0] px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                <option value="COOPERACAO_INTERNACIONAL">Cooperação Internacional</option>
                <option value="COMPRAS_GOVERNAMENTAIS">Compras Governamentais e Governança</option>
                <option value="SUPORTE_MUNICIPIOS">Suporte aos Municípios</option>
                <option value="DESENVOLVIMENTO_SOFTWARE">Desenvolvimento de Software</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 mb-6">
          <div className="grid gap-3 md:grid-cols-5">
            <div className="border border-[#E2E8F0] p-3">
              <div className="text-xs text-[#64748B]">Total</div>
              <div className="text-fluid-lg font-semibold text-[#0F172A]">
                {summary.total}
              </div>
            </div>
            <div className="border border-[#E2E8F0] p-3">
              <div className="text-xs text-[#64748B]">Pendentes</div>
              <div className="text-fluid-lg font-semibold text-[#B45309]">
                {summary.pendentes}
              </div>
            </div>
            <div className="border border-[#E2E8F0] p-3">
              <div className="text-xs text-[#64748B]">Aprovados</div>
              <div className="text-fluid-lg font-semibold text-[#059669]">
                {summary.aprovados}
              </div>
            </div>
            <div className="border border-[#E2E8F0] p-3">
              <div className="text-xs text-[#64748B]">Publicados</div>
              <div className="text-fluid-lg font-semibold text-[#1D4ED8]">
                {summary.publicados}
              </div>
            </div>
            <div className="border border-[#E2E8F0] p-3">
              <div className="text-xs text-[#64748B]">Internos</div>
              <div className="text-fluid-lg font-semibold text-[#0F172A]">
                {summary.internos}
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="border border-[#E2E8F0] p-3">
              <div className="text-xs text-[#64748B]">Cooperação Internacional</div>
              <div className="text-fluid-lg font-semibold text-[#0F172A]">
                {summary.byHub.COOPERACAO_INTERNACIONAL || 0}
              </div>
            </div>
            <div className="border border-[#E2E8F0] p-3">
              <div className="text-xs text-[#64748B]">Compras Gov. e Governança</div>
              <div className="text-fluid-lg font-semibold text-[#0F172A]">
                {summary.byHub.COMPRAS_GOVERNAMENTAIS || 0}
              </div>
            </div>
            <div className="border border-[#E2E8F0] p-3">
              <div className="text-xs text-[#64748B]">Suporte aos Municípios</div>
              <div className="text-fluid-lg font-semibold text-[#0F172A]">
                {summary.byHub.SUPORTE_MUNICIPIOS || 0}
              </div>
            </div>
            <div className="border border-[#E2E8F0] p-3">
              <div className="text-xs text-[#64748B]">Desenvolvimento de Software</div>
              <div className="text-fluid-lg font-semibold text-[#0F172A]">
                {summary.byHub.DESENVOLVIMENTO_SOFTWARE || 0}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-[#64748B]">Carregando...</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-[#E2E8F0] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#64748B]">
                      {new Date(item.date).toLocaleDateString("pt-BR")} • {item.type} •{" "}
                      {item.axis || "Sem eixo"}
                    </div>
                    <h2 className="text-fluid-lg font-semibold text-[#0F172A]">
                      {item.title}
                    </h2>
                    {item.description && (
                      <p className="text-sm text-[#64748B] mt-2 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}
                    <div className="text-xs text-[#94A3B8] mt-2 space-x-2">
                      {item.category && <span>Categoria: {item.category}</span>}
                      {item.source && <span>• Fonte: {item.source}</span>}
                      {item.url && (
                        <a
                          className="text-[#1D4ED8] underline ml-2"
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver fonte
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <select
                      value={item.hub || ""}
                      onChange={(e) => updateItem(item.id, { hub: e.target.value || null })}
                      className="border border-[#E2E8F0] px-2 py-1 text-xs"
                    >
                      <option value="">Sem hub</option>
                      <option value="COOPERACAO_INTERNACIONAL">Cooperação Internacional</option>
                      <option value="COMPRAS_GOVERNAMENTAIS">Compras Governamentais e Governança</option>
                      <option value="SUPORTE_MUNICIPIOS">Suporte aos Municípios</option>
                      <option value="DESENVOLVIMENTO_SOFTWARE">Desenvolvimento de Software</option>
                    </select>
                    <button
                      onClick={() => updateItem(item.id, { approved: !item.approved })}
                      className={`px-3 py-2 text-xs border ${
                        item.approved
                          ? "border-emerald-500 text-emerald-600"
                          : "border-amber-500 text-amber-600"
                      }`}
                    >
                      {item.approved ? "Aprovado" : "Pendente"}
                    </button>
                    <button
                      onClick={() =>
                        updateItem(item.id, {
                          visibility: item.visibility === "PUBLICO" ? "INTERNO" : "PUBLICO",
                        })
                      }
                      className="px-3 py-2 text-xs border border-[#1E3A8A] text-[#1E3A8A]"
                    >
                      {item.visibility === "PUBLICO" ? "Público" : "Interno"}
                    </button>
                    <button
                      onClick={() => startEdit(item)}
                      className="px-3 py-2 text-xs border border-[#0F172A] text-[#0F172A]"
                    >
                      Editar
                    </button>
                  </div>
                </div>

                {editingId === item.id && currentDraft && (
                  <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-xs text-[#64748B]">Título</label>
                        <input
                          value={currentDraft.title || ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...currentDraft, title: e.target.value },
                            }))
                          }
                          className="w-full border border-[#E2E8F0] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#64748B]">Data</label>
                        <input
                          type="date"
                          value={currentDraft.date || ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...currentDraft, date: e.target.value },
                            }))
                          }
                          className="w-full border border-[#E2E8F0] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#64748B]">Tipo</label>
                        <select
                          value={currentDraft.type || "NEWS"}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...currentDraft, type: e.target.value },
                            }))
                          }
                          className="w-full border border-[#E2E8F0] px-3 py-2 text-sm"
                        >
                          <option value="NEWS">NEWS</option>
                          <option value="PUBLICATION">PUBLICATION</option>
                          <option value="DOC">DOC</option>
                          <option value="VIDEO">VIDEO</option>
                          <option value="PROJECT">PROJECT</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-[#64748B]">Eixo</label>
                        <input
                          value={currentDraft.axis || ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...currentDraft, axis: e.target.value },
                            }))
                          }
                          className="w-full border border-[#E2E8F0] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#64748B]">Categoria</label>
                        <input
                          value={currentDraft.category || ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...currentDraft, category: e.target.value },
                            }))
                          }
                          className="w-full border border-[#E2E8F0] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#64748B]">Fonte</label>
                        <input
                          value={currentDraft.source || ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...currentDraft, source: e.target.value },
                            }))
                          }
                          className="w-full border border-[#E2E8F0] px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-[#64748B]">URL</label>
                        <input
                          value={currentDraft.url || ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...currentDraft, url: e.target.value },
                            }))
                          }
                          className="w-full border border-[#E2E8F0] px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-[#64748B]">Descrição</label>
                        <textarea
                          value={currentDraft.description || ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...currentDraft, description: e.target.value },
                            }))
                          }
                          className="w-full border border-[#E2E8F0] px-3 py-2 text-sm h-32"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={saveDraft}
                        className="px-4 py-2 text-xs border border-emerald-500 text-emerald-600"
                      >
                        Salvar alterações
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 text-xs border border-[#94A3B8] text-[#64748B]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
