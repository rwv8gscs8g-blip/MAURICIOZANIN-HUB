"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { VideoEventCard } from "./VideoEventCard";
import { VerticalTimeline } from "./VerticalTimeline";
import { Video, FileText, Newspaper, Briefcase, BookOpen, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = "all" | "VIDEO" | "DOC" | "NEWS" | "PROJECT" | "PUBLICATION";

interface TimelineEvent {
  id: string;
  date: Date | string;
  title: string;
  description?: string;
  type: "VIDEO" | "DOC" | "NEWS" | "PROJECT" | "PUBLICATION";
  category?: string;
  url?: string;
  thumbnailUrl?: string;
  duration?: number;
  location?: string;
  axis?: string;
}

interface MultimediaTimelineProps {
  events: TimelineEvent[];
}

const typeIcons = {
  VIDEO: Video,
  DOC: FileText,
  NEWS: Newspaper,
  PROJECT: Briefcase,
  PUBLICATION: BookOpen,
};

const typeLabels = {
  VIDEO: "Vídeos",
  DOC: "Documentos",
  NEWS: "Notícias",
  PROJECT: "Projetos",
  PUBLICATION: "Publicações",
};

export function MultimediaTimeline({ events }: MultimediaTimelineProps) {
  const [filter, setFilter] = useState<EventType>("all");
  const [axisFilter, setAxisFilter] = useState<string>("all");

  const axisOptions = Array.from(
    new Set(events.map((event) => event.axis).filter(Boolean))
  ) as string[];

  const filteredEvents = events.filter((event) => {
    const matchesType = filter === "all" || event.type === filter;
    const matchesAxis = axisFilter === "all" || event.axis === axisFilter;
    return matchesType && matchesAxis;
  });

  // Separar eventos por tipo para renderização diferente
  const videoEvents = filteredEvents.filter((e) => e.type === "VIDEO");
  const otherEvents = filteredEvents.filter((e) => e.type !== "VIDEO");

  return (
    <div>
      {axisOptions.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setAxisFilter("all")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-fluid-sm font-medium transition-colors border",
              axisFilter === "all"
                ? "bg-[#0F172A] text-white border-[#0F172A]"
                : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0F172A] hover:text-[#0F172A]"
            )}
          >
            Todos os eixos
          </button>
          {axisOptions.map((axis) => (
            <button
              key={axis}
              onClick={() => setAxisFilter(axis)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 text-fluid-sm font-medium transition-colors border",
                axisFilter === axis
                  ? "bg-[#0F172A] text-white border-[#0F172A]"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0F172A] hover:text-[#0F172A]"
              )}
            >
              {axis}
            </button>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-12">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 text-fluid-sm font-medium transition-colors border",
            filter === "all"
              ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
              : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
          )}
        >
          <Filter className="h-4 w-4" />
          Todos
        </button>
        {Object.entries(typeLabels).map(([type, label]) => {
          const Icon = typeIcons[type as keyof typeof typeIcons];
          return (
            <button
              key={type}
              onClick={() => setFilter(type as EventType)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 text-fluid-sm font-medium transition-colors border",
                filter === type
                  ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid de Vídeos */}
      {videoEvents.length > 0 && (
        <div className="mb-16">
          <h3 className="text-fluid-xl font-bold text-[#0F172A] mb-6 tracking-tight flex items-center gap-2">
            <Video className="h-6 w-6 text-[#1E3A8A]" />
            Vídeos e Conteúdo Multimídia
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoEvents.map((event) => (
              <VideoEventCard
                key={event.id}
                id={event.id}
                title={event.title}
                description={event.description}
                date={event.date}
                url={event.url || ""}
                thumbnailUrl={event.thumbnailUrl}
                duration={event.duration}
                category={event.category}
              />
            ))}
          </div>
        </div>
      )}

      {/* Timeline de Outros Eventos */}
      {otherEvents.length > 0 && (
        <div>
          <h3 className="text-fluid-xl font-bold text-[#0F172A] mb-6 tracking-tight">
            Linha do Tempo
          </h3>
          <div className="bg-white border border-[#E2E8F0] p-8 md:p-12">
            <VerticalTimeline events={otherEvents} />
          </div>
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="bg-white border border-[#E2E8F0] p-12 text-center">
          <p className="text-[#64748B] text-fluid-base">
            Nenhum evento encontrado para o filtro selecionado.
          </p>
        </div>
      )}
    </div>
  );
}
