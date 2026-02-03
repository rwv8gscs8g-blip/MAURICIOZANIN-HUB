"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Calendar } from "lucide-react";
import { format } from "date-fns";

interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration?: string;
}

interface YouTubePlaylistProps {
  playlistId?: string;
  videos?: YouTubeVideo[]; // Para mock ou dados do banco
  maxVideos?: number;
}

// Função para extrair ID do vídeo do YouTube
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Função para gerar thumbnail do YouTube
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function YouTubePlaylist({
  playlistId,
  videos: propVideos,
  maxVideos = 12,
}: YouTubePlaylistProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>(propVideos || []);
  const [loading, setLoading] = useState(!propVideos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!propVideos && !playlistId) {
      setVideos([]);
      setLoading(false);
    }
  }, [playlistId, propVideos]);

  // Lazy loading com Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
          }
        });
      },
      { rootMargin: "50px" }
    );

    const images = document.querySelectorAll("img[data-src]");
    images.forEach((img) => observerRef.current?.observe(img));

    return () => {
      images.forEach((img) => observerRef.current?.unobserve(img));
    };
  }, [videos]);

  const handleVideoClick = (videoId: string) => {
    setSelectedVideo(videoId);
    setIsModalOpen(true);
  };

  const displayVideos = videos.slice(0, maxVideos);

  if (loading) {
    return (
      <div className="text-center text-[#64748B] py-12">
        Carregando vídeos...
      </div>
    );
  }

  if (!loading && displayVideos.length === 0) {
    return (
      <div className="text-center text-[#64748B] py-12">
        Vídeos em consolidação. Em breve, publicaremos os registros oficiais.
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayVideos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-[#E2E8F0] overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => handleVideoClick(video.videoId)}
          >
            {/* Thumbnail com lazy loading */}
            <div className="relative aspect-video bg-slate-200 group">
              <img
                data-src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 text-[#1E3A8A] ml-1" fill="currentColor" />
                </div>
              </div>
              {video.duration && (
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-fluid-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              )}
            </div>

            {/* Conteúdo */}
            <div className="p-5">
              <div className="flex items-center gap-2 text-fluid-xs text-[#64748B] mb-2">
                <Calendar className="h-3 w-3" />
                <time>{format(new Date(video.publishedAt), "dd/MM/yyyy")}</time>
              </div>
              <h3 className="text-fluid-base font-semibold text-[#0F172A] mb-2 tracking-tight line-clamp-2">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-fluid-sm text-[#64748B] leading-[1.6] line-clamp-2">
                  {video.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Lightbox */}
      {isModalOpen && selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-5xl aspect-video bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors"
              aria-label="Fechar"
            >
              ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title="YouTube video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </div>
      )}
    </>
  );
}
