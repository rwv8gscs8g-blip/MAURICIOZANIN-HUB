"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, History, Network } from "lucide-react";

const highlights = [
  {
    title: "Projeto Inovajuntos",
    description: "Projeto de cooperação com começo, meio e fim, preservado em seu histórico oficial.",
    icon: History,
    href: "/trajetoria",
    cta: "Ver linha do tempo",
  },
  {
    title: "Rede Inovajuntos",
    description: "Rede ativa com início oficial em 23 de janeiro de 2026.",
    icon: Network,
    href: "/inovajuntos",
    cta: "Ver rede",
  },
  {
    title: "Repositórios e documentos",
    description: "Documentos, relatórios e evidências centralizados no hub.",
    icon: FileText,
    href: "/produtos?cliente=inovajuntos",
    cta: "Ver documentos",
  },
];

export function InovajuntosTransition() {
  return (
    <section className="relative py-20 bg-white">
      <div className="container-fluid">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            <span className="inline-flex items-center px-3 py-1 text-fluid-xs font-semibold uppercase tracking-[0.2em] text-[#1E3A8A] bg-[#E0E7FF]">
              Transição Oficial
            </span>
            <div>
              <h2 className="text-fluid-3xl font-bold text-[#0F172A] tracking-tight mb-4">
                Projeto Inovajuntos concluído. Rede Inovajuntos em operação.
              </h2>
              <p className="text-fluid-base text-[#64748B] leading-[1.8]">
                Este hub registra a transição do Projeto Inovajuntos para a Rede
                Inovajuntos, preservando o histórico, projetos e documentos.
                A Rede nasce oficialmente em 23 de janeiro de 2026 e inicia uma
                nova fase de cooperação internacional, compras governamentais e
                suporte a municípios.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/inovajuntos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A8A] text-white text-fluid-sm font-semibold hover:bg-[#1E3A8A]/90 transition-colors"
              >
                Entrar na Rede
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/trajetoria"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm font-semibold hover:bg-[#1E3A8A]/10 transition-colors"
              >
                Ver linha do tempo
              </Link>
            </div>

            <p className="text-fluid-sm text-[#64748B]">
              Arquivo do projeto original (domínio em validação para migração total):{" "}
              <a
                href="https://inovajuntos.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E3A8A] hover:text-[#1E3A8A]/80 font-semibold"
              >
                inovajuntos.org
              </a>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="border border-[#E2E8F0] p-6 bg-[#FAFAFA] flex flex-col gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center">
                    <Icon className="h-6 w-6 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-fluid-sm text-[#64748B] leading-[1.6]">
                      {item.description}
                    </p>
                  </div>
                  <Link
                    href={item.href}
                    className="text-fluid-sm font-semibold text-[#1E3A8A] inline-flex items-center gap-2"
                  >
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
