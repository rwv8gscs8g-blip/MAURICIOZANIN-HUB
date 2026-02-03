"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  id: string;
  title: string;
  source: string;
  status: "PENDENTE" | "APROVADO" | "REJEITADO";
  publishedAt?: string | null;
  hub?: string | null;
};

export default function AdminMidiaPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/midia");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const update = async (id: string, status: NewsItem["status"]) => {
    await fetch(`/api/admin/midia/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchItems();
  };

  const updateHub = async (id: string, hub: string | null) => {
    await fetch(`/api/admin/midia/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hub }),
    });
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid">
        <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">
          Aprovação de Na Mídia
        </h1>
        <p className="text-fluid-sm text-[#64748B] mb-6">
          Apenas menções aprovadas aparecem no público.
        </p>

        {loading ? (
          <div className="text-sm text-[#64748B]">Carregando...</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-[#E2E8F0] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#64748B]">
                      {item.source} •{" "}
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString("pt-BR")
                        : "Sem data"}
                    </div>
                    <h2 className="text-fluid-lg font-semibold text-[#0F172A]">
                      {item.title}
                    </h2>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <select
                      value={item.hub || ""}
                      onChange={(e) => updateHub(item.id, e.target.value || null)}
                      className="border border-[#E2E8F0] px-2 py-1 text-xs"
                    >
                      <option value="">Sem hub</option>
                      <option value="COOPERACAO_INTERNACIONAL">Cooperação Internacional</option>
                      <option value="COMPRAS_GOVERNAMENTAIS">Compras Governamentais e Governança</option>
                      <option value="SUPORTE_MUNICIPIOS">Suporte aos Municípios</option>
                      <option value="DESENVOLVIMENTO_SOFTWARE">Desenvolvimento de Software</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => update(item.id, "APROVADO")}
                        className="px-3 py-2 text-xs border border-emerald-500 text-emerald-600"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => update(item.id, "REJEITADO")}
                        className="px-3 py-2 text-xs border border-rose-500 text-rose-600"
                      >
                        Rejeitar
                      </button>
                      <button
                        onClick={() => update(item.id, "PENDENTE")}
                        className="px-3 py-2 text-xs border border-amber-500 text-amber-600"
                      >
                        Pendente
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
