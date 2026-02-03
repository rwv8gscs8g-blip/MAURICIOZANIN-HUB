"use client";

import { useEffect, useState } from "react";

type PublicationItem = {
  id: string;
  title: string;
  dateOriginal: string;
  category: string;
  approved: boolean;
  isPublic: boolean;
  hub?: string | null;
};

export default function AdminPublicacoesPage() {
  const [items, setItems] = useState<PublicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/publicacoes");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggle = async (id: string, updates: Partial<PublicationItem>) => {
    await fetch(`/api/admin/publicacoes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid">
        <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">
          Aprovação de publicações
        </h1>
        <p className="text-fluid-sm text-[#64748B] mb-6">
          Itens só aparecem no público quando aprovados e marcados como públicos.
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
                      {new Date(item.dateOriginal).toLocaleDateString("pt-BR")} •{" "}
                      {item.category}
                    </div>
                    <h2 className="text-fluid-lg font-semibold text-[#0F172A]">
                      {item.title}
                    </h2>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <select
                      value={item.hub || ""}
                      onChange={(e) => toggle(item.id, { hub: e.target.value || null })}
                      className="border border-[#E2E8F0] px-2 py-1 text-xs"
                    >
                      <option value="">Sem hub</option>
                      <option value="COOPERACAO_INTERNACIONAL">Cooperação Internacional</option>
                      <option value="COMPRAS_GOVERNAMENTAIS">Compras Governamentais e Governança</option>
                      <option value="SUPORTE_MUNICIPIOS">Suporte aos Municípios</option>
                      <option value="DESENVOLVIMENTO_SOFTWARE">Desenvolvimento de Software</option>
                    </select>
                    <button
                      onClick={() => toggle(item.id, { approved: !item.approved })}
                      className={`px-3 py-2 text-xs border ${
                        item.approved
                          ? "border-emerald-500 text-emerald-600"
                          : "border-amber-500 text-amber-600"
                      }`}
                    >
                      {item.approved ? "Aprovado" : "Pendente"}
                    </button>
                    <button
                      onClick={() => toggle(item.id, { isPublic: !item.isPublic })}
                      className="px-3 py-2 text-xs border border-[#1E3A8A] text-[#1E3A8A]"
                    >
                      {item.isPublic ? "Público" : "Interno"}
                    </button>
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
