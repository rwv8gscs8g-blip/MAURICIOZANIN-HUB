"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, History, Network, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { MultimediaTimeline } from "@/components/timeline/MultimediaTimeline";
import {
  historicoInovajuntosEvents,
  redeTimelineEvents,
} from "@/data/inovajuntos-timeline";

const repositories = [
  {
    title: "Projetos e documentos",
    description: "Repositório oficial com relatórios, propostas e evidências.",
    href: "/produtos?cliente=inovajuntos",
  },
  {
    title: "Relatórios de acompanhamento",
    description: "Relatórios periódicos e registros de impacto.",
    href: "/relatorios",
  },
  {
    title: "Publicacoes e midia",
    description: "Artigos, publicacoes e registros institucionais.",
    href: "/publicacoes",
  },
];

export default function InovajuntosPage() {
  return (
    <>
      <JsonLd type="organization" />
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid space-y-16">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center px-3 py-1 text-fluid-xs font-semibold uppercase tracking-[0.2em] text-[#1E3A8A] bg-[#E0E7FF]">
              Rede Inovajuntos
            </span>
            <h1 className="text-fluid-4xl font-bold text-[#0F172A] tracking-tight">
              Transição oficial do Projeto Inovajuntos para a Rede Inovajuntos
            </h1>
            <p className="text-fluid-base text-[#64748B] leading-[1.8] max-w-4xl">
              O Projeto Inovajuntos foi uma iniciativa de cooperação com começo,
              meio e fim. A Rede Inovajuntos nasce oficialmente em 23 de janeiro
              de 2026, iniciando uma nova etapa com governança permanente,
              integrando cooperação internacional, compras governamentais e
              suporte a municípios.
            </p>
            <p className="text-fluid-sm text-[#64748B]">
              O domínio inovajuntos.org segue em validação para migração total.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/trajetoria"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm font-semibold hover:bg-[#1E3A8A]/10 transition-colors"
              >
                Ver histórico completo
              </Link>
              <a
                href="https://inovajuntos.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A8A] text-white text-fluid-sm font-semibold hover:bg-[#1E3A8A]/90 transition-colors"
              >
                Acessar arquivo original
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-[1.1fr_1fr] gap-8"
          >
            <div className="bg-white border border-[#E2E8F0] p-8 space-y-4">
              <div className="flex items-center gap-3 text-[#1E3A8A]">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="text-fluid-xl font-bold text-[#0F172A]">
                  MVP da migração total
                </h2>
              </div>
              <p className="text-fluid-base text-[#64748B] leading-[1.7]">
                Esta fase concentra a preservação do histórico, projetos e
                documentos oficiais. Toda nova ação da Rede Inovajuntos já
                atualiza automaticamente o histórico do hub.
              </p>
              <ul className="grid gap-3 text-fluid-sm text-[#64748B]">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#1E3A8A]" />
                  Histórico completo com validação automática por gatilhos.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#1E3A8A]" />
                  Projetos e documentos centralizados em repositórios oficiais.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#1E3A8A]" />
                  Linha do tempo unificada com evidências e mídia.
                </li>
              </ul>
            </div>

            <div className="grid gap-4">
              {repositories.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="border border-[#E2E8F0] bg-white p-6 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                      <FileText className="h-5 w-5 text-[#1E3A8A]" />
                    </div>
                    <div>
                      <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-fluid-sm text-[#64748B] leading-[1.6]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <Network className="h-6 w-6 text-[#1E3A8A]" />
              <h2 className="text-fluid-2xl font-bold text-[#0F172A] tracking-tight">
                Linha do tempo da Rede Inovajuntos
              </h2>
            </div>
            <MultimediaTimeline events={redeTimelineEvents} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <History className="h-6 w-6 text-[#1E3A8A]" />
              <h2 className="text-fluid-2xl font-bold text-[#0F172A] tracking-tight">
                Histórico do Projeto Inovajuntos
              </h2>
            </div>
            <MultimediaTimeline events={historicoInovajuntosEvents} />
          </motion.section>
        </div>
      </div>
    </>
  );
}
