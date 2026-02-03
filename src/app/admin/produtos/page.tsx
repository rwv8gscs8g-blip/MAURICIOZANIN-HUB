"use client";

import { useEffect, useState } from "react";

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  year?: number | null;
  fileUrl?: string | null;
  client: { id: string; name: string; slug: string };
  clientUnit?: { name: string } | null;
  isVisiblePublic: boolean;
  isVisibleClient: boolean;
  isVisibleTimeline: boolean;
  isVisibleShare: boolean;
  isVisibleAgenda: boolean;
  timeline?: { approved: boolean; visibility: "PUBLICO" | "INTERNO" } | null;
  unitVisibilityMode?: "ALL_UNITS" | "ALLOWLIST" | "DENYLIST" | null;
  unitVisibilityRules?: { id: string; kind: "ALLOW" | "DENY"; unit: { id: string; name: string } }[];
};

type AtestadoItem = {
  id: string;
  title: string;
  issuedBy?: string | null;
  issuedAt?: string | null;
  fileUrl?: string | null;
  products: { productId: string; product: { id: string; name: string } }[];
};

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [atestados, setAtestados] = useState<AtestadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [clientFilter, setClientFilter] = useState("");
  const [visibilityFilters, setVisibilityFilters] = useState({
    public: false,
    client: false,
    timeline: false,
    share: false,
    agenda: false,
  });

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [unitsByClientId, setUnitsByClientId] = useState<
    Record<string, Array<{ id: string; name: string; slug: string; uf?: string | null }>>
  >({});
  const [rulesByProductId, setRulesByProductId] = useState<
    Record<
      string,
      Array<{ id: string; kind: "ALLOW" | "DENY"; unit: { id: string; name: string; slug: string } }>
    >
  >({});
  const [rulesBusyKey, setRulesBusyKey] = useState<string | null>(null);

  const [form, setForm] = useState({
    productIds: [] as string[],
    title: "",
    issuedBy: "",
    issuedAt: "",
    fileUrl: "",
    summary: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    const productsRes = await fetch("/api/admin/products");
    const atestadosRes = await fetch("/api/admin/atestados");
    const clientsRes = await fetch("/api/admin/clients");

    if (!productsRes.ok || !atestadosRes.ok || !clientsRes.ok) {
      setError("Erro ao carregar dados.");
      setLoading(false);
      return;
    }

    const productsData = await productsRes.json();
    const atestadosData = await atestadosRes.json();
    const clientsData = await clientsRes.json();
    setProducts(productsData.products || []);
    setAtestados(atestadosData.atestados || []);
    setClients(clientsData.clients || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const ensureUnitsLoaded = async (clientId: string) => {
    if (unitsByClientId[clientId]) return;
    const res = await fetch(`/api/admin/clients/${clientId}/units`);
    if (!res.ok) throw new Error("Erro ao carregar unidades do cliente.");
    const data = await res.json();
    setUnitsByClientId((prev) => ({ ...prev, [clientId]: data.units || [] }));
  };

  const ensureRulesLoaded = async (productId: string) => {
    if (rulesByProductId[productId]) return;
    const res = await fetch(`/api/admin/products/${productId}/unit-visibility`);
    if (!res.ok) throw new Error("Erro ao carregar regras por unidade.");
    const data = await res.json();
    setRulesByProductId((prev) => ({ ...prev, [productId]: data.rules || [] }));
  };

  const toggleRule = async ({
    productId,
    clientUnitId,
    kind,
    enabled,
  }: {
    productId: string;
    clientUnitId: string;
    kind: "ALLOW" | "DENY";
    enabled: boolean;
  }) => {
    const key = `${productId}:${clientUnitId}:${kind}`;
    setRulesBusyKey(key);
    try {
      if (enabled) {
        const res = await fetch(`/api/admin/products/${productId}/unit-visibility`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientUnitId, kind }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Erro ao salvar regra.");
        }
      } else {
        const res = await fetch(
          `/api/admin/products/${productId}/unit-visibility?clientUnitId=${clientUnitId}`,
          { method: "DELETE" },
        );
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Erro ao remover regra.");
        }
      }

      // Recarrega regras do produto (fonte de verdade)
      const reload = await fetch(`/api/admin/products/${productId}/unit-visibility`);
      const data = await reload.json().catch(() => ({ rules: [] }));
      setRulesByProductId((prev) => ({ ...prev, [productId]: data.rules || [] }));
    } finally {
      setRulesBusyKey(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...form,
      issuedAt: form.issuedAt ? new Date(form.issuedAt).toISOString() : null,
    };
    const res = await fetch("/api/admin/atestados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Erro ao criar atestado");
      return;
    }
    setForm({
      productIds: [],
      title: "",
      issuedBy: "",
      issuedAt: "",
      fileUrl: "",
      summary: "",
    });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir este atestado?")) return;
    const res = await fetch(`/api/admin/atestados/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Erro ao excluir atestado.");
      return;
    }
    fetchAll();
  };

  const groupedAtestados = atestados.reduce<Record<string, AtestadoItem[]>>((acc, item) => {
    item.products.forEach((link) => {
      acc[link.productId] = acc[link.productId] || [];
      acc[link.productId].push(item);
    });
    return acc;
  }, {});

  // Computed visible products based on filters
  const visibleProducts = products.filter((product) => {
    if (clientFilter && product.client.id !== clientFilter) return false;

    // Visibility filters
    if (visibilityFilters.public && !product.isVisiblePublic) return false;
    if (visibilityFilters.client && !product.isVisibleClient) return false;
    if (visibilityFilters.timeline && !product.isVisibleTimeline) return false;
    if (visibilityFilters.share && !product.isVisibleShare) return false;
    if (visibilityFilters.agenda && !product.isVisibleAgenda) return false;

    return true;
  });

  // Bulk Selection Logic
  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every(p => selectedIds.has(p.id));
  const someVisibleSelected = visibleProducts.some(p => selectedIds.has(p.id)) && !allVisibleSelected;

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      // Unselect all visible
      const next = new Set(selectedIds);
      visibleProducts.forEach(p => next.delete(p.id));
      setSelectedIds(next);
    } else {
      // Select all visible
      const next = new Set(selectedIds);
      visibleProducts.forEach(p => next.add(p.id));
      setSelectedIds(next);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkUpdate = async (field: keyof ProductItem, value: boolean) => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Tem certeza que deseja alterar "${field}" para ${selectedIds.size} produtos?`)) return;

    setIsBulkUpdating(true);
    try {
      // Process sequentially to avoid overwhelming server, or parallel batches
      const promises = Array.from(selectedIds).map(async (id) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        // Prepare payload preserving other fields
        const payload = {
          isVisiblePublic: product.isVisiblePublic,
          isVisibleClient: product.isVisibleClient,
          isVisibleTimeline: product.isVisibleTimeline,
          isVisibleShare: product.isVisibleShare,
          isVisibleAgenda: product.isVisibleAgenda,
          unitVisibilityMode: product.unitVisibilityMode,
          [field]: value
        };

        const res = await fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Falha ao atualizar ${product.name}`);
      });

      await Promise.all(promises);
      setSelectedIds(new Set()); // Clear selection after success
      await fetchAll(); // Refresh data
    } catch (err: any) {
      setError(err.message || "Erro durante atualização em massa.");
    } finally {
      setIsBulkUpdating(false);
    }
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
          Produtos e Atestados
        </h1>
        <p className="text-fluid-sm text-[#64748B] mb-6">
          Cadastre atestados de capacidade técnica para um ou mais produtos.
        </p>

        {error && <div className="text-sm text-rose-600 mb-4">{error}</div>}

        {loading ? (
          <div className="text-sm text-[#64748B]">Carregando...</div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-6">
              {/* FILTERS PANEL */}
              <div className="bg-white border border-[#E2E8F0] p-4 space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-[#64748B] block mb-1">Filtrar por cliente</label>
                    <select
                      className="w-full border border-[#E2E8F0] px-3 py-2 text-sm"
                      value={clientFilter}
                      onChange={(e) => setClientFilter(e.target.value)}
                    >
                      <option value="">Todos os clientes</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Visibility Filters */}
                  <div className="col-span-1 lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 text-sm text-[#0F172A]">
                      <input
                        type="checkbox"
                        checked={visibilityFilters.public}
                        onChange={e => setVisibilityFilters(prev => ({ ...prev, public: e.target.checked }))}
                      />
                      Público
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#0F172A]">
                      <input
                        type="checkbox"
                        checked={visibilityFilters.client}
                        onChange={e => setVisibilityFilters(prev => ({ ...prev, client: e.target.checked }))}
                      />
                      Visível ao cliente
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#0F172A]">
                      <input
                        type="checkbox"
                        checked={visibilityFilters.timeline}
                        onChange={e => setVisibilityFilters(prev => ({ ...prev, timeline: e.target.checked }))}
                      />
                      Timeline
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#0F172A]">
                      <input
                        type="checkbox"
                        checked={visibilityFilters.share}
                        onChange={e => setVisibilityFilters(prev => ({ ...prev, share: e.target.checked }))}
                      />
                      Compartilhe
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#0F172A]">
                      <input
                        type="checkbox"
                        checked={visibilityFilters.agenda}
                        onChange={e => setVisibilityFilters(prev => ({ ...prev, agenda: e.target.checked }))}
                      />
                      Agenda
                    </label>
                  </div>
                </div>

                {/* BULK ACTIONS BAR (Visible when selection > 0) */}
                {selectedIds.size > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 flex flex-wrap gap-3 items-center">
                    <span className="text-sm font-medium text-blue-800">{selectedIds.size} selecionados</span>

                    <div className="h-4 w-px bg-blue-200 mx-2 hidden md:block" />

                    <span className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Definir como:</span>

                    <div className="flex flex-wrap gap-2">
                      <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate("isVisiblePublic", true)} className="px-2 py-1 text-xs bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded">
                        Público
                      </button>
                      <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate("isVisibleClient", true)} className="px-2 py-1 text-xs bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded">
                        Cliente
                      </button>
                      <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate("isVisibleTimeline", true)} className="px-2 py-1 text-xs bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded">
                        Timeline
                      </button>
                      <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate("isVisibleShare", true)} className="px-2 py-1 text-xs bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded">
                        Compartilhe
                      </button>
                      <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate("isVisibleAgenda", true)} className="px-2 py-1 text-xs bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded">
                        Agenda
                      </button>
                    </div>

                    <div className="h-4 w-px bg-blue-200 mx-2 hidden md:block" />

                    <span className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Remover de:</span>

                    <div className="flex flex-wrap gap-2">
                      <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate("isVisiblePublic", false)} className="px-2 py-1 text-xs bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded">
                        Público
                      </button>
                      <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate("isVisibleClient", false)} className="px-2 py-1 text-xs bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded">
                        Cliente
                      </button>
                      <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate("isVisibleTimeline", false)} className="px-2 py-1 text-xs bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded">
                        Timeline
                      </button>
                      <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate("isVisibleShare", false)} className="px-2 py-1 text-xs bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded">
                        Compartilhe
                      </button>
                      <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate("isVisibleAgenda", false)} className="px-2 py-1 text-xs bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded">
                        Agenda
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SELECT ALL HEADER */}
              <div className="flex items-center gap-3 px-5 py-2 bg-slate-100 border border-[#E2E8F0] border-b-0">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={input => { if (input) input.indeterminate = someVisibleSelected; }}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {allVisibleSelected ? "Desmarcar todos" : "Marcar todos"} ({visibleProducts.length})
                </span>
              </div>

              {visibleProducts.map((product) => (
                <div key={product.id} className={`bg-white border border-[#E2E8F0] p-5 relative transition-colors ${selectedIds.has(product.id) ? 'border-l-4 border-l-blue-500 bg-blue-50/10' : ''}`}>
                  {/* SELECTION CHECKBOX */}
                  <div className="absolute top-5 left-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelection(product.id)}
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="pl-6"> {/* Added padding for checkbox */}
                    <div className="text-xs text-[#64748B]">
                      {product.client.name}
                      {product.clientUnit ? ` • ${product.clientUnit.name}` : ""}
                      {product.year ? ` • ${product.year}` : ""}
                    </div>
                    <h2 className="text-fluid-lg font-semibold text-[#0F172A] mb-3">
                      {product.name}
                    </h2>

                    <div className="flex flex-wrap gap-3 mb-4 text-xs">
                      {product.timeline && (
                        <span
                          className={`px-2 py-1 border text-xs ${product.timeline.visibility === "PUBLICO" && product.timeline.approved
                              ? "border-emerald-500 text-emerald-600"
                              : "border-amber-500 text-amber-600"
                            }`}
                        >
                          {product.timeline.approved
                            ? product.timeline.visibility === "PUBLICO"
                              ? "Publicado na timeline"
                              : "Aprovado (interno)"
                            : "Pendente na timeline"}
                        </span>
                      )}
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={product.isVisiblePublic}
                          onChange={async (e) => {
                            const res = await fetch(`/api/admin/products/${product.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                isVisiblePublic: e.target.checked,
                                isVisibleClient: product.isVisibleClient,
                                isVisibleTimeline: product.isVisibleTimeline,
                                isVisibleShare: product.isVisibleShare,
                                isVisibleAgenda: product.isVisibleAgenda,
                                unitVisibilityMode: product.unitVisibilityMode,
                              }),
                            });
                            if (!res.ok) {
                              setError("Erro ao atualizar visibilidade pública.");
                              return;
                            }
                            fetchAll();
                          }}
                        />
                        Público
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={product.isVisibleClient}
                          onChange={async (e) => {
                            const res = await fetch(`/api/admin/products/${product.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                isVisiblePublic: product.isVisiblePublic,
                                isVisibleClient: e.target.checked,
                                isVisibleTimeline: product.isVisibleTimeline,
                                isVisibleShare: product.isVisibleShare,
                                isVisibleAgenda: product.isVisibleAgenda,
                                unitVisibilityMode: product.unitVisibilityMode,
                              }),
                            });
                            if (!res.ok) {
                              setError("Erro ao atualizar visibilidade do cliente.");
                              return;
                            }
                            fetchAll();
                          }}
                        />
                        Visível ao cliente
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={product.isVisibleTimeline}
                          onChange={async (e) => {
                            const res = await fetch(`/api/admin/products/${product.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                isVisiblePublic: product.isVisiblePublic,
                                isVisibleClient: product.isVisibleClient,
                                isVisibleTimeline: e.target.checked,
                                isVisibleShare: product.isVisibleShare,
                                isVisibleAgenda: product.isVisibleAgenda,
                                unitVisibilityMode: product.unitVisibilityMode,
                              }),
                            });
                            if (!res.ok) {
                              setError("Erro ao atualizar timeline do produto.");
                              return;
                            }
                            fetchAll();
                          }}
                        />
                        Aparecer na timeline
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={product.isVisibleShare}
                          onChange={async (e) => {
                            const res = await fetch(`/api/admin/products/${product.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                isVisiblePublic: product.isVisiblePublic,
                                isVisibleClient: product.isVisibleClient,
                                isVisibleTimeline: product.isVisibleTimeline,
                                isVisibleShare: e.target.checked,
                                isVisibleAgenda: product.isVisibleAgenda,
                                unitVisibilityMode: product.unitVisibilityMode,
                              }),
                            });
                            if (!res.ok) {
                              setError("Erro ao atualizar Compartilhe.");
                              return;
                            }
                            fetchAll();
                          }}
                        />
                        Publicar em Compartilhe
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={product.isVisibleAgenda}
                          onChange={async (e) => {
                            const res = await fetch(`/api/admin/products/${product.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                isVisiblePublic: product.isVisiblePublic,
                                isVisibleClient: product.isVisibleClient,
                                isVisibleTimeline: product.isVisibleTimeline,
                                isVisibleShare: product.isVisibleShare,
                                isVisibleAgenda: e.target.checked,
                                unitVisibilityMode: product.unitVisibilityMode,
                              }),
                            });
                            if (!res.ok) {
                              setError("Erro ao atualizar exibição na agenda.");
                              return;
                            }
                            fetchAll();
                          }}
                        />
                        Aparecer na agenda
                      </label>
                      <label className="flex items-center gap-2">
                        <span>Unidades:</span>
                        <select
                          className="border border-[#E2E8F0] px-2 py-1 text-xs"
                          value={product.unitVisibilityMode || "ALL_UNITS"}
                          onChange={async (e) => {
                            const mode = e.target.value as ProductItem["unitVisibilityMode"];
                            const res = await fetch(`/api/admin/products/${product.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                isVisiblePublic: product.isVisiblePublic,
                                isVisibleClient: product.isVisibleClient,
                                isVisibleTimeline: product.isVisibleTimeline,
                                isVisibleShare: product.isVisibleShare,
                                isVisibleAgenda: product.isVisibleAgenda,
                                unitVisibilityMode: mode,
                              }),
                            });
                            if (!res.ok) {
                              setError("Erro ao atualizar modo de visibilidade por unidade.");
                              return;
                            }
                            fetchAll();
                          }}
                        >
                          <option value="ALL_UNITS">Todas as unidades</option>
                          <option value="ALLOWLIST">Somente unidades (ALLOW)</option>
                          <option value="DENYLIST">Todas exceto (DENY)</option>
                        </select>
                      </label>
                      <button
                        type="button"
                        className="text-xs text-[#1E3A8A] underline"
                        onClick={async () => {
                          try {
                            const next = expandedProductId === product.id ? null : product.id;
                            setExpandedProductId(next);
                            if (next) {
                              await ensureUnitsLoaded(product.client.id);
                              await ensureRulesLoaded(product.id);
                            }
                          } catch (err: any) {
                            setError(err?.message || "Erro ao carregar regras por unidade.");
                          }
                        }}
                      >
                        {expandedProductId === product.id ? "Ocultar regras por unidade" : "Regras por unidade"}
                      </button>
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/admin/products/${product.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              isVisiblePublic: false,
                              isVisibleClient: product.isVisibleClient,
                              isVisibleTimeline: false,
                              isVisibleShare: false,
                              isVisibleAgenda: false,
                              unitVisibilityMode: product.unitVisibilityMode,
                            }),
                          });
                          if (!res.ok) {
                            setError("Erro ao desfazer publicação.");
                            return;
                          }
                          fetchAll();
                        }}
                        className={`text-xs underline ${product.timeline &&
                            product.timeline.approved &&
                            product.timeline.visibility === "PUBLICO"
                            ? "text-rose-600"
                            : "text-slate-400 cursor-not-allowed"
                          }`}
                        disabled={
                          !(
                            product.timeline &&
                            product.timeline.approved &&
                            product.timeline.visibility === "PUBLICO"
                          )
                        }
                      >
                        Desfazer publicação
                      </button>
                      <button
                        onClick={async () => {
                          await fetch(`/api/admin/products/${product.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              isVisiblePublic: true,
                              isVisibleClient: true,
                              isVisibleTimeline: true,
                              isVisibleShare: product.isVisibleShare,
                              isVisibleAgenda: product.isVisibleAgenda,
                              unitVisibilityMode: product.unitVisibilityMode,
                            }),
                          });
                          await fetch("/api/admin/timeline/auto-approve", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              url: `/produtos/${product.slug}`,
                              visibility: "PUBLICO",
                            }),
                          });
                          fetchAll();
                        }}
                        className="text-xs text-[#1E3A8A] underline"
                      >
                        Publicar agora
                      </button>
                      <a
                        className="text-xs text-[#1D4ED8] underline"
                        href={`/produtos/${product.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visualizar produto
                      </a>
                      {product.fileUrl ? (
                        <a
                          className="text-xs text-[#1D4ED8] underline"
                          href={product.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir PDF
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {expandedProductId === product.id && (
                    <div className="mt-4 border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                      <div className="text-xs text-[#64748B] mb-2">
                        Controle por unidade/filial
                      </div>
                      {product.unitVisibilityMode === "ALL_UNITS" || !product.unitVisibilityMode ? (
                        <div className="text-sm text-[#64748B]">
                          Modo atual: <strong>todas as unidades</strong>. Para usar exceções, mude para ALLOWLIST ou DENYLIST.
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-[#0F172A] font-medium mb-2">
                            {product.unitVisibilityMode === "ALLOWLIST"
                              ? "ALLOWLIST: marque as unidades que podem ver este produto"
                              : "DENYLIST: marque as unidades que NÃO podem ver este produto"}
                          </div>
                          <div className="grid md:grid-cols-2 gap-2">
                            {(unitsByClientId[product.client.id] || []).map((unit) => {
                              const rules = rulesByProductId[product.id] || product.unitVisibilityRules || [];
                              const isChecked =
                                product.unitVisibilityMode === "ALLOWLIST"
                                  ? rules.some((r) => r.kind === "ALLOW" && r.unit.id === unit.id)
                                  : rules.some((r) => r.kind === "DENY" && r.unit.id === unit.id);
                              const kind = product.unitVisibilityMode === "ALLOWLIST" ? "ALLOW" : "DENY";
                              const busy = rulesBusyKey === `${product.id}:${unit.id}:${kind}`;
                              return (
                                <label
                                  key={unit.id}
                                  className="flex items-center justify-between gap-2 border border-[#E2E8F0] bg-white px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <div className="text-sm text-[#0F172A] truncate">{unit.name}</div>
                                    <div className="text-xs text-[#64748B] truncate">
                                      {unit.slug}{unit.uf ? ` • ${unit.uf}` : ""}
                                    </div>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={busy}
                                    onChange={async (e) => {
                                      try {
                                        await toggleRule({
                                          productId: product.id,
                                          clientUnitId: unit.id,
                                          kind,
                                          enabled: e.target.checked,
                                        });
                                      } catch (err: any) {
                                        setError(err?.message || "Erro ao atualizar regra.");
                                      }
                                    }}
                                  />
                                </label>
                              );
                            })}
                          </div>
                          <div className="mt-3 text-xs text-[#64748B]">
                            Observação: esta regra impacta principalmente a visibilidade interna (cliente/filiais) quando o usuário possui acesso por unidade.
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 pl-6">
                    {(groupedAtestados[product.id] || []).length === 0 ? (
                      <div className="text-sm text-[#64748B]">
                        Nenhum atestado cadastrado.
                      </div>
                    ) : (
                      groupedAtestados[product.id].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border border-[#E2E8F0] px-3 py-2 text-sm"
                        >
                          <div>
                            <div className="font-medium text-[#0F172A]">
                              {item.title}
                            </div>
                            {item.issuedBy && (
                              <div className="text-xs text-[#64748B]">{item.issuedBy}</div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-xs text-rose-600"
                          >
                            Excluir
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-white border border-[#E2E8F0] p-6">
              <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-4">
                Novo atestado
              </h3>
              <form className="grid gap-3" onSubmit={handleSubmit}>
                <select
                  className="border border-[#E2E8F0] px-3 py-2 text-sm"
                  multiple
                  value={form.productIds}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions).map(
                      (option) => option.value,
                    );
                    setForm({ ...form, productIds: values });
                  }}
                  required
                >
                  {products.length === 0 && <option value="">Nenhum produto</option>}
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  className="border border-[#E2E8F0] px-3 py-2 text-sm"
                  placeholder="Título do atestado"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <input
                  className="border border-[#E2E8F0] px-3 py-2 text-sm"
                  placeholder="Emitente"
                  value={form.issuedBy}
                  onChange={(e) => setForm({ ...form, issuedBy: e.target.value })}
                />
                <input
                  className="border border-[#E2E8F0] px-3 py-2 text-sm"
                  type="date"
                  value={form.issuedAt}
                  onChange={(e) => setForm({ ...form, issuedAt: e.target.value })}
                />
                <input
                  className="border border-[#E2E8F0] px-3 py-2 text-sm"
                  placeholder="URL do arquivo (opcional)"
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                />
                <textarea
                  className="border border-[#E2E8F0] px-3 py-2 text-sm"
                  placeholder="Resumo"
                  rows={4}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
                <button className="px-4 py-2 bg-[#1E3A8A] text-white text-sm">
                  Salvar atestado
                </button>
              </form>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
