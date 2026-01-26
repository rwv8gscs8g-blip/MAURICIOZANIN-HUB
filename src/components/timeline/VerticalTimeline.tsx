"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface TimelineEvent {
  id: string;
  date: Date | string;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  link?: string;
  type: "publication" | "event" | "milestone";
}

interface VerticalTimelineProps {
  events: TimelineEvent[];
}

export function VerticalTimeline({ events }: VerticalTimelineProps) {
  // Ordenar eventos por data (mais recente primeiro)
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#E2E8F0] hidden md:block" />

      <div className="space-y-12">
        {sortedEvents.map((event, index) => {
          const eventDate = new Date(event.date);
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: isEven ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex items-start gap-8"
            >
              {/* Ponto na linha */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-[#1E3A8A] flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-[#1E3A8A]" />
                </div>
                <div className="absolute inset-0 rounded-full bg-[#1E3A8A]/10 animate-ping" />
              </div>

              {/* Conteúdo do evento */}
              <div className="flex-1 pt-1">
                <div className="bg-white border border-[#E2E8F0] p-6 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <time className="text-fluid-sm font-semibold text-[#1E3A8A]">
                          {format(eventDate, "dd/MM/yyyy")}
                        </time>
                        {event.category && (
                          <span className="text-fluid-xs text-[#64748B] px-2 py-1 bg-slate-50 border border-[#E2E8F0]">
                            {event.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-fluid-xl font-bold text-[#0F172A] mb-2 tracking-tight">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-fluid-base text-[#64748B] mb-4 leading-[1.7]">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-fluid-sm text-[#64748B]">
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[#1E3A8A] hover:text-[#1E3A8A]/80 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Ver mais</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
