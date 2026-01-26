"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { professionalPhotos } from "@/data/professional-photos";

export function HeroSection() {
  // Usar a primeira foto da galeria
  const mainPhoto = professionalPhotos[0];

  useEffect(() => {
    if (mainPhoto) {
      console.log("HeroSection - Foto principal:", mainPhoto.src);
    } else {
      console.warn("HeroSection - Nenhuma foto encontrada");
    }
  }, [mainPhoto]);

  return (
    <section className="relative bg-[#FAFAFA] py-24 md:py-32 overflow-hidden">
      <div className="container-fluid">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Foto Profissional com Máscara de Gradiente */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative w-full aspect-[4/5] max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-200 shadow-lg">
              {mainPhoto ? (
                <div className="relative w-full h-full">
                  {/* Imagem de fundo */}
                  <img
                    src={mainPhoto.src}
                    alt={mainPhoto.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      console.error("Erro ao carregar imagem:", mainPhoto.src);
                    }}
                    onLoad={() => {
                      console.log("HeroSection - Imagem carregada com sucesso:", mainPhoto.src);
                    }}
                  />
                  {/* Gradiente de fundo (fallback) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-transparent opacity-0 pointer-events-none" />
                  {/* Overlay de gradiente superior */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none" />
                </div>
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <span className="text-slate-400 text-sm">Foto Profissional</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Conteúdo Textual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-fluid-4xl font-bold text-[#0F172A] mb-6 tracking-tightest leading-[1.1]">
                Especialista em{" "}
                <span className="text-[#1E3A8A]">Governança e Compras Públicas</span>
              </h1>
            </div>

            <p className="text-fluid-lg text-[#64748B] leading-[1.8] max-w-xl">
              Transformando a gestão pública através de consultoria especializada,
              alinhada com a Lei 14.133/2021 e as melhores práticas de governança.
            </p>

            <div className="pt-4">
              <div className="flex flex-wrap gap-6 text-fluid-sm text-[#64748B]">
                <span>Consultoria Especializada</span>
                <span className="text-slate-300">•</span>
                <span>Conformidade Legal</span>
                <span className="text-slate-300">•</span>
                <span>Gestão Pública</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
