"use client";

import { useState } from "react";
import { VerticalTimeline } from "@/components/timeline/VerticalTimeline";
import { motion } from "framer-motion";
import { BookOpen, FileText, Globe, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | "CARTILHA_SEBRAE" | "ARTIGO_TECNICO" | "PROJETO_INTERNACIONAL";

const mockPublications = [
  {
    id: "1",
    date: "2024-01-15",
    title: "Cartilha Sebrae: Compras Públicas para Pequenos Negócios",
    description:
      "Guia completo sobre como pequenas empresas podem participar de licitações públicas, com foco na Lei 14.133/2021.",
    category: "Cartilha Sebrae",
    link: "https://example.com/cartilha-sebrae",
    type: "publication" as const,
  },
  {
    id: "2",
    date: "2023-11-20",
    title: "Cooperação Internacional em Compras Governamentais",
    description:
      "Artigo técnico sobre as melhores práticas de cooperação entre municípios brasileiros e entidades internacionais.",
    category: "Artigo Técnico",
    link: "https://example.com/artigo-cooperacao",
    type: "publication" as const,
  },
  {
    id: "3",
    date: "2023-08-10",
    title: "Projeto Inovajuntos: Rede de Inovação Municipal",
    description:
      "Lançamento da Rede Inovajuntos, projeto internacional de cooperação entre municípios para inovação em gestão pública.",
    category: "Projeto Internacional",
    location: "São Paulo, Brasil",
    link: "https://example.com/inovajuntos",
    type: "event" as const,
  },
  {
    id: "4",
    date: "2022-06-15",
    title: "Cartilha: Governança em Municípios de Pequeno Porte",
    description:
      "Publicação sobre estratégias de governança para municípios com menos de 50 mil habitantes.",
    category: "Cartilha Sebrae",
    link: "https://example.com/governanca-municipios",
    type: "publication" as const,
  },
  {
    id: "5",
    date: "2022-03-22",
    title: "Workshop Internacional: Compras Sustentáveis",
    description:
      "Participação como palestrante no workshop sobre compras públicas sustentáveis em parceria com a União Europeia.",
    category: "Projeto Internacional",
    location: "Bruxelas, Bélgica",
    type: "event" as const,
  },
  {
    id: "6",
    date: "2021-12-01",
    title: "Artigo: A Nova Lei de Licitações e seus Impactos",
    description:
      "Análise técnica sobre a Lei 14.133/2021 e seus principais impactos na gestão de compras públicas.",
    category: "Artigo Técnico",
    link: "https://example.com/nova-lei-licitacoes",
    type: "publication" as const,
  },
];

const categoryIcons = {
  CARTILHA_SEBRAE: BookOpen,
  ARTIGO_TECNICO: FileText,
  PROJETO_INTERNACIONAL: Globe,
};

export default function PublicacoesPage() {
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filteredPublications = mockPublications.filter((pub) => {
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
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

        {/* Timeline */}
        <div className="bg-white border border-[#E2E8F0] p-8 md:p-12">
          <VerticalTimeline events={filteredPublications} />
        </div>
      </div>
    </div>
  );
}
