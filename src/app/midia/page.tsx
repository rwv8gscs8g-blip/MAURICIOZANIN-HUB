"use client";

import { motion } from "framer-motion";
import { ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";

interface NewsMention {
  id: string;
  url: string;
  title: string;
  source: string;
  excerpt: string;
  publishedAt: string;
}

const approvedNews: NewsMention[] = [
  {
    id: "1",
    url: "https://example.com/noticia1",
    title: "Especialista em Compras Públicas lança nova cartilha",
    source: "Folha de S.Paulo",
    excerpt:
      "Luís Maurício Junqueira Zanin, reconhecido especialista em governança pública, lançou nova cartilha sobre licitações que já está sendo utilizada por mais de 200 municípios brasileiros.",
    publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "2",
    url: "https://example.com/noticia2",
    title: "Rede Inovajuntos alcança 200 municípios",
    source: "Portal G1",
    excerpt:
      "A Rede Inovajuntos, liderada por Maurício Zanin, expandiu sua atuação para mais de 200 municípios brasileiros, consolidando-se como a maior rede de inovação municipal do país.",
    publishedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "3",
    url: "https://example.com/noticia3",
    title: "Workshop internacional sobre compras públicas",
    source: "Agência Brasil",
    excerpt:
      "Maurício Zanin participa de workshop internacional sobre compras públicas sustentáveis em Bruxelas, representando o Brasil em discussões sobre governança pública.",
    publishedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

export default function MidiaPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
            Na Mídia
          </h1>
          <p className="text-fluid-base text-[#64748B] leading-[1.7] max-w-2xl">
            Menções e coberturas sobre o trabalho em governança e compras públicas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedNews.map((news, index) => (
            <motion.article
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-[#E2E8F0] p-6 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-2 text-fluid-xs text-[#64748B] mb-3">
                <Calendar className="h-3 w-3" />
                <time>{format(new Date(news.publishedAt), "dd/MM/yyyy")}</time>
              </div>

              <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-3 tracking-tight">
                {news.title}
              </h3>

              <p className="text-fluid-sm text-[#64748B] leading-[1.7] mb-4 flex-1">
                {news.excerpt}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                <span className="text-fluid-xs font-medium text-[#1E3A8A]">
                  {news.source}
                </span>
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-fluid-xs text-[#1E3A8A] hover:underline"
                >
                  Ler mais
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
