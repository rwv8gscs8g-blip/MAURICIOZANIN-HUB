"use client";

import { useEffect, useState } from "react";
import { VerticalTimeline } from "@/components/timeline/VerticalTimeline";
import { motion } from "framer-motion";
import { BookOpen, FileText, Globe, Filter, Newspaper, RefreshCw, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterType = "all" | "news" | "updates" | "publications";

interface UnifiedItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  category: string;
  type: "publication" | "timeline";
  hub?: string;
  link?: string;
}

export default function PublicacoesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/publicacoes")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "publications") return item.type === "publication" || item.category === "Cartilhas" || item.category === "Artigos";
    if (activeFilter === "news") return item.category === "Notícias";
    if (activeFilter === "updates") return item.category === "Atualizações" || item.type === "timeline";
    return true;
  });

  const filters = [
    { id: "all", label: "Todas", icon: LayoutGrid },
    { id: "news", label: "Notícias", icon: Newspaper },
    { id: "updates", label: "Atualizações", icon: RefreshCw },
    { id: "publications", label: "Publicações", icon: BookOpen },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
            Publicações e Atualizações
          </h1>
          <p className="text-fluid-base text-[#64748B] leading-[1.7] max-w-2xl">
            Acompanhe a trajetória, notícias e materiais técnicos produzidos.
          </p>
        </motion.div>

        {/* Filtros */}
        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as FilterType)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-900 text-white shadow-md relative" // Removed ring to avoid clutter
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {isActive && (
                  <motion.span layoutId="active-pill" className="absolute inset-0 bg-blue-900 rounded-full -z-10" />
                )}
                <Icon className="w-4 h-4" />
                <span className="relative z-10">{f.label}</span>
              </button>
            )
          })}
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 animate-pulse">Carregando conteúdo...</div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupByYear(filteredItems)).map(([year, groupItems]) => (
              <div key={year} className="bg-white border border-slate-200 rounded-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
                  {year}
                </h2>
                <div className="space-y-6">
                  {groupItems.map((item) => (
                    <div key={item.id} className="group flex gap-4 items-start">
                      <div className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 group-hover:bg-blue-600 transition-colors" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                          <span>•</span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded",
                            item.type === 'publication' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {item.category || (item.type === 'publication' ? 'Publicação' : 'Atualização')}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                          <a href={item.link || '#'} target={item.link ? "_blank" : undefined} className="focus:outline-none">
                            {item.title}
                            {item.link && <span className="ml-2 inline-block text-blue-400">↗</span>}
                          </a>
                        </h3>
                        {item.description && (
                          <p className="text-slate-600 max-w-3xl text-sm leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Nenhum item encontrado neste filtro.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function groupByYear(items: UnifiedItem[]) {
  return items.reduce((acc, item) => {
    const year = new Date(item.date).getFullYear() || "Antigos";
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {} as Record<string, UnifiedItem[]>);
}
