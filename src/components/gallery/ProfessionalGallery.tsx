"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Pause, Play } from "lucide-react";

interface ProfessionalPhoto {
  id: string;
  src: string;
  alt: string;
  filename?: string;
}

interface ProfessionalGalleryProps {
  photos: ProfessionalPhoto[];
  autoPlayInterval?: number; // em milissegundos
}

export function ProfessionalGallery({
  photos,
  autoPlayInterval = 5000,
}: ProfessionalGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, photos.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const handleDownload = async (photo: ProfessionalPhoto) => {
    try {
      const imagePath = photo.src.startsWith('/') 
        ? `${window.location.origin}${photo.src}`
        : photo.src;
      
      const response = await fetch(imagePath);
      if (!response.ok) throw new Error('Erro ao carregar imagem');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.filename || `mauricio-zanin-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
      window.open(photo.src.startsWith('/') ? `${window.location.origin}${photo.src}` : photo.src, '_blank');
    }
  };

  useEffect(() => {
    console.log("ProfessionalGallery - Fotos carregadas:", photos.length);
    if (photos.length > 0) {
      console.log("Primeira foto:", photos[0].src);
    }
  }, [photos]);

  if (photos.length === 0) {
    return (
      <div className="bg-slate-200 aspect-[3/4] flex items-center justify-center rounded-lg">
        <span className="text-slate-400 text-fluid-sm">Nenhuma foto disponível</span>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];
  
  if (!currentPhoto) {
    return (
      <div className="bg-slate-200 aspect-[3/4] flex items-center justify-center rounded-lg">
        <span className="text-slate-400 text-fluid-sm">Erro ao carregar foto</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Carrossel Principal */}
      <div className="relative aspect-[3/4] bg-slate-200 rounded-lg overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={currentPhoto.src}
              alt={currentPhoto.alt}
              className="w-full h-full object-cover"
              loading={currentIndex === 0 ? "eager" : "lazy"}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                console.error("Erro ao carregar imagem:", currentPhoto.src);
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Controles de Navegação */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Controle de Auto-play */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label={isAutoPlaying ? "Pausar" : "Reproduzir"}
              >
                {isAutoPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </button>
            </div>

            {/* Botão de Download */}
            <div className="absolute bottom-4 right-4 z-10">
              <button
                onClick={() => handleDownload(currentPhoto)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg text-fluid-sm font-medium transition-colors shadow-lg"
                aria-label="Baixar foto"
              >
                <Download className="h-4 w-4" />
                <span>Baixar</span>
              </button>
            </div>
          </>
        )}

        {/* Indicadores de Slide */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Ir para foto ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas (Thumbnails) */}
      {photos.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-[#1E3A8A] scale-105"
                  : "border-transparent hover:border-slate-300 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
