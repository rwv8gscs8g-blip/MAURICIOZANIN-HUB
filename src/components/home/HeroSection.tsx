"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ProfessionalGallery } from "@/components/gallery/ProfessionalGallery";
import { professionalPhotos } from "@/data/professional-photos";

export function HeroSection() {
  return (
    <section className="relative bg-[#FAFAFA] py-24 md:py-32 overflow-hidden">
      <div className="container-fluid">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Foto Profissional / Carrossel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="max-w-md mx-auto shadow-2xl rounded-lg overflow-hidden">
              <ProfessionalGallery
                photos={professionalPhotos}
                autoPlayInterval={3000}
              />
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

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/auth/login"
                className="px-5 py-2.5 bg-[#1E3A8A] text-white text-fluid-sm font-medium border border-[#1E3A8A] hover:bg-[#1E3A8A]/90 transition-colors"
              >
                Acessar sistema
              </Link>
              <Link
                href="/auth/cadastro"
                className="px-5 py-2.5 bg-white text-[#1E3A8A] text-fluid-sm font-medium border border-[#1E3A8A] hover:bg-[#F8FAFF] transition-colors"
              >
                Cadastre-se
              </Link>
            </div>

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
