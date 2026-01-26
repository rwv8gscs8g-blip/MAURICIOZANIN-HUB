"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface VideoEventCardProps {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // em segundos
  category?: string;
}

// Função para extrair o ID do vídeo do YouTube
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Função para gerar thumbnail do YouTube
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Função para formatar duração
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function VideoEventCard({
  id,
  title,
  description,
  date,
  url,
  thumbnailUrl,
  duration,
  category,
}: VideoEventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoId = getYouTubeVideoId(url);
  const thumbnail = thumbnailUrl || (videoId ? getYouTubeThumbnail(videoId) : null);

  const eventDate = new Date(date);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white border border-[#E2E8F0] overflow-hidden hover:-translate-y-1 transition-all duration-300"
      >
        {/* Thumbnail */}
        {thumbnail && (
          <div className="relative aspect-video bg-slate-200 cursor-pointer group" onClick={() => setIsModalOpen(true)}>
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-[#1E3A8A] ml-1" fill="currentColor" />
              </div>
            </div>
            {duration && (
              <div className="absolute bottom-3 right-3 bg-black/80 text-white text-fluid-xs px-2 py-1 rounded">
                {formatDuration(duration)}
              </div>
            )}
          </div>
        )}

        {/* Conteúdo */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <time className="text-fluid-xs text-[#64748B] flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {format(eventDate, "dd/MM/yyyy")}
            </time>
            {category && (
              <span className="text-fluid-xs text-[#1E3A8A] px-2 py-1 bg-slate-50 border border-[#E2E8F0]">
                {category}
              </span>
            )}
          </div>

          <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-2 tracking-tight">
            {title}
          </h3>

          {description && (
            <p className="text-fluid-sm text-[#64748B] leading-[1.7] mb-4">
              {description}
            </p>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-fluid-sm text-[#1E3A8A] hover:underline"
          >
            <Play className="h-4 w-4" />
            Assistir vídeo
          </button>
        </div>
      </motion.div>

      {/* Modal Lightbox */}
      <AnimatePresence>
        {isModalOpen && videoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </button>

              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
