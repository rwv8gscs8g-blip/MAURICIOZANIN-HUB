"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type ImageItem = {
  src: string;
  alt?: string;
};

export function ImageLightboxGallery({
  images,
  coverSrc,
  downloadUrl,
}: {
  images: ImageItem[];
  coverSrc?: string | null;
  downloadUrl?: string | null;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const open = (index: number) => setActiveIndex(index);
  const close = () => setActiveIndex(null);
  const prev = () =>
    setActiveIndex((prevIndex) =>
      prevIndex === null ? null : (prevIndex - 1 + images.length) % images.length
    );
  const next = () =>
    setActiveIndex((prevIndex) =>
      prevIndex === null ? null : (prevIndex + 1) % images.length
    );

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
      if (event.key === "ArrowLeft") {
        prev();
      }
      if (event.key === "ArrowRight") {
        next();
      }
      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        next();
      }
      if (event.key === "Home") {
        setActiveIndex(0);
      }
      if (event.key === "End") {
        setActiveIndex(images.length - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, images.length]);

  return (
    <div>
      {coverSrc && (
        <button
          type="button"
          onClick={() => open(0)}
          className="mb-4 w-full border border-[#E2E8F0] bg-white overflow-hidden"
        >
          <img
            src={coverSrc}
            alt="Capa do documento"
            className="w-full max-h-[420px] object-contain"
          />
        </button>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, index) => (
          <button
            key={img.src}
            type="button"
            onClick={() => open(index)}
            className="border border-[#E2E8F0] bg-white overflow-hidden"
          >
            <img src={img.src} alt={img.alt || "Página"} className="w-full h-40 object-contain" />
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center">
          <button
            type="button"
            onClick={close}
            className="absolute top-6 right-6 text-white"
          >
            <X className="h-6 w-6" />
          </button>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-6 left-6 text-white text-sm underline"
            >
              Baixar PDF
            </a>
          )}
          <button
            type="button"
            onClick={prev}
            className="absolute left-6 text-white"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <img
            src={images[activeIndex].src}
            alt={images[activeIndex].alt || "Página"}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />
          <button
            type="button"
            onClick={next}
            className="absolute right-6 text-white"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      )}
    </div>
  );
}
