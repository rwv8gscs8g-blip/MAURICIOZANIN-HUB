"use client";

import { useEffect, useState } from "react";
import { VerticalTimeline } from "@/components/timeline/VerticalTimeline";
import { motion } from "framer-motion";
import { BookOpen, FileText, Globe, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | "CARTILHA_SEBRAE" | "ARTIGO_TECNICO" | "PROJETO_INTERNACIONAL";

interface PublicationItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  category: string;
  hub?: string;
  link?: string;
  location?: string;
  type: "publication" | "event";
}

export default function PublicacoesPage() {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    fetch("/api/publicacoes")
      .then((res) => res.json())
      .then((data) => {
        const items = (data.items || []).map((item: any) => ({
          id: item.id,
          date: item.dateOriginal,
          title: item.title,
          description: item.description || undefined,
          category: item.category === "CARTILHA_SEBRAE"
            ? "Cartilha Sebrae"
            : item.category === "ARTIGO_TECNICO"
            ? "Artigo Técnico"
            : item.category === "PROJETO_INTERNACIONAL"
            ? "Projeto Internacional"
            : "Outros",
          hub: item.hub || "SEM_HUB",
          link: item.link || undefined,
          type: "publication",
        }));
        setPublications(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setIsClient(data?.user?.role === "CLIENTE"))
      .catch(() => setIsClient(false));
  }, []);

  const filteredPublications = publications.filter((pub) => {
    if (filter === "all") return true;
    const categoryMap: Record<string, CategoryFilter> = {
      "Cartilha Sebrae": "CARTILHA_SEBRAE",
      "Artigo Técnico": "ARTIGO_TECNICO",
      "Projeto Internacional": "PROJETO_INTERNACIONAL",
    };
    return categoryMap[pub.category] === filter;
  });

  const filters = [
    { value: "all" as CategoryFilter, label: "Todos", icon: Filter },
    {
      value: "CARTILHA_SEBRAE" as CategoryFilter,
      label: "Cartilhas Sebrae",
      icon: BookOpen,
    },
    {
      value: "ARTIGO_TECNICO" as CategoryFilter,
      label: "Artigos Técnicos",
      icon: FileText,
    },
    {
      value: "PROJETO_INTERNACIONAL" as CategoryFilter,
      label: "Projetos Internacionais",
      icon: Globe,
    },
  ];

  const hubLabels: Record<string, string> = {
    COOPERACAO_INTERNACIONAL: "Cooperação Internacional",
    COMPRAS_GOVERNAMENTAIS: "Compras Governamentais e Governança",
    SUPORTE_MUNICIPIOS: "Suporte aos Municípios",
    DESENVOLVIMENTO_SOFTWARE: "Desenvolvimento de Software",
    SEM_HUB: "Sem hub definido",
  };

  const byHub = filteredPublications.reduce<Record<string, PublicationItem[]>>((acc, item) => {
    const key = item.hub || "SEM_HUB";
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        {isClient && (
          <div className="mb-4 text-xs text-[#64748B]">
            <a href="/dashboard" className="text-[#1E3A8A] hover:underline">
              Área do cliente
            </a>
            <span className="mx-2">/</span>
            <span>Publicações</span>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
            Publicações e Linha do Tempo
          </h1>
          <p className="text-fluid-base text-[#64748B] leading-[1.7] max-w-2xl">
            Trajetória profissional e acadêmica, incluindo publicações, projetos
            e eventos que marcaram a evolução da Rede Inovajuntos.
          </p>
        </motion.div>

        {/* Filtros */}
        {publications.length > 0 && (
          <div className="mb-12 flex flex-wrap gap-3">
            {filters.map((filterOption) => {
              const Icon = filterOption.icon;
              const isActive = filter === filterOption.value;
              return (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 text-fluid-sm font-medium transition-all border",
                    isActive
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                      : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{filterOption.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-8">
          {loading ? (
            <div className="bg-white border border-[#E2E8F0] p-8 md:p-12">
              <p className="text-fluid-base text-[#64748B]">Carregando publicações...</p>
            </div>
          ) : filteredPublications.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] p-8 md:p-12">
              <p className="text-fluid-base text-[#64748B]">
                Publicações em consolidação. Em breve, os registros oficiais estarão disponíveis.
              </p>
            </div>
          ) : (
            Object.entries(byHub).map(([hubKey, items]) => {
              const grouped = items.reduce<Record<string, PublicationItem[]>>((acc, item) => {
                const year = item.date ? item.date.slice(0, 4) : "Sem ano";
                acc[year] = acc[year] || [];
                acc[year].push(item);
                return acc;
              }, {});

              const years = Object.keys(grouped).sort((a, b) => {
                if (a === "Sem ano") return 1;
                if (b === "Sem ano") return -1;
                return Number(b) - Number(a);
              });

              return (
                <section key={hubKey} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-fluid-xl font-semibold text-[#0F172A]">
                      {hubLabels[hubKey] || hubKey}
                    </h2>
                    <span className="text-xs text-[#64748B]">
                      {items.length} itens
                    </span>
                  </div>
                  {years.map((year) => (
                    <div key={`${hubKey}-${year}`} className="bg-white border border-[#E2E8F0] p-8 md:p-12">
                      <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-6">
                        {year}
                      </h3>
                      <VerticalTimeline events={grouped[year]} />
                    </div>
                  ))}
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
