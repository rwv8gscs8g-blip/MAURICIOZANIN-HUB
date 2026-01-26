"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface NewsMention {
  id: string;
  url: string;
  title: string;
  source: string;
  excerpt: string;
  status: "PENDENTE" | "APROVADO" | "REJEITADO";
  publishedAt: string;
}

const mockNewsMentions: NewsMention[] = [
  {
    id: "1",
    url: "https://example.com/noticia1",
    title: "Especialista em Compras Públicas lança nova cartilha",
    source: "Folha de S.Paulo",
    excerpt:
      "Luís Maurício Junqueira Zanin, reconhecido especialista em governança pública, lançou nova cartilha sobre licitações.",
    status: "PENDENTE",
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "2",
    url: "https://example.com/noticia2",
    title: "Rede Inovajuntos alcança 200 municípios",
    source: "Portal G1",
    excerpt:
      "A Rede Inovajuntos, liderada por Maurício Zanin, expandiu sua atuação para mais de 200 municípios brasileiros.",
    status: "PENDENTE",
    publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "3",
    url: "https://example.com/noticia3",
    title: "Workshop internacional sobre compras públicas",
    source: "Agência Brasil",
    excerpt:
      "Maurício Zanin participa de workshop internacional sobre compras públicas sustentáveis em Bruxelas.",
    status: "APROVADO",
    publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export default function DashboardPage() {
  const [mentions, setMentions] = useState<NewsMention[]>(mockNewsMentions);
  const [filter, setFilter] = useState<"all" | "PENDENTE" | "APROVADO" | "REJEITADO">("all");

  const filteredMentions = mentions.filter((mention) => {
    if (filter === "all") return true;
    return mention.status === filter;
  });

  const handleValidate = (id: string, approved: boolean) => {
    setMentions((prev) =>
      prev.map((mention) =>
        mention.id === id
          ? {
              ...mention,
              status: approved ? "APROVADO" : "REJEITADO",
            }
          : mention
      )
    );
  };

  const pendingCount = mentions.filter((m) => m.status === "PENDENTE").length;
  const approvedCount = mentions.filter((m) => m.status === "APROVADO").length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-2 tracking-tight">
                Monitoramento de Marca
              </h1>
              <p className="text-fluid-base text-[#64748B]">
                Gerencie menções ao seu nome na web
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white text-fluid-sm font-medium hover:bg-[#1E3A8A]/90 transition-colors border border-[#1E3A8A]">
              <RefreshCw className="h-4 w-4" />
              Atualizar Busca
            </button>
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-[#E2E8F0] p-6">
              <div className="text-fluid-sm text-[#64748B] mb-2">Total de Menções</div>
              <div className="text-fluid-2xl font-bold text-[#0F172A]">
                {mentions.length}
              </div>
            </div>
            <div className="bg-white border border-[#E2E8F0] p-6">
              <div className="text-fluid-sm text-[#64748B] mb-2">Pendentes</div>
              <div className="text-fluid-2xl font-bold text-amber-600">
                {pendingCount}
              </div>
            </div>
            <div className="bg-white border border-[#E2E8F0] p-6">
              <div className="text-fluid-sm text-[#64748B] mb-2">Aprovadas</div>
              <div className="text-fluid-2xl font-bold text-emerald-600">
                {approvedCount}
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-3 mb-8">
            {[
              { value: "all" as const, label: "Todas" },
              { value: "PENDENTE" as const, label: "Pendentes" },
              { value: "APROVADO" as const, label: "Aprovadas" },
              { value: "REJEITADO" as const, label: "Rejeitadas" },
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={cn(
                  "px-5 py-2.5 text-fluid-sm font-medium transition-colors border",
                  filter === filterOption.value
                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                    : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
                )}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Lista de Menções */}
        <div className="space-y-4">
          {filteredMentions.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] p-12 text-center">
              <Search className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
              <p className="text-[#64748B] text-fluid-base">
                Nenhuma menção encontrada
              </p>
            </div>
          ) : (
            filteredMentions.map((mention, index) => (
              <motion.div
                key={mention.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-[#E2E8F0] p-6 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-fluid-lg font-semibold text-[#0F172A]">
                        {mention.title}
                      </h3>
                      <span
                        className={cn(
                          "text-fluid-xs px-2 py-1 border",
                          mention.status === "APROVADO"
                            ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                            : mention.status === "REJEITADO"
                            ? "text-red-600 bg-red-50 border-red-200"
                            : "text-amber-600 bg-amber-50 border-amber-200"
                        )}
                      >
                        {mention.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-fluid-sm text-[#64748B] mb-3">
                      <span className="font-medium">{mention.source}</span>
                      <span className="text-slate-300">•</span>
                      <time>
                        {format(new Date(mention.publishedAt), "dd/MM/yyyy")}
                      </time>
                    </div>
                    <p className="text-fluid-base text-[#64748B] leading-[1.7] mb-4">
                      {mention.excerpt}
                    </p>
                    <a
                      href={mention.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-fluid-sm text-[#1E3A8A] hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver notícia completa
                    </a>
                  </div>

                  {mention.status === "PENDENTE" && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleValidate(mention.id, true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-fluid-sm font-medium hover:bg-emerald-700 transition-colors border border-emerald-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleValidate(mention.id, false)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 text-fluid-sm font-medium hover:bg-red-50 transition-colors border border-red-600"
                      >
                        <XCircle className="h-4 w-4" />
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
