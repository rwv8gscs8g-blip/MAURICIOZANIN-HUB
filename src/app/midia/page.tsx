"use client";

import { motion } from "framer-motion";
import { ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface NewsMention {
  id: string;
  url: string;
  title: string;
  source: string;
  excerpt: string;
  publishedAt: string;
  hub?: string;
}

export default function MidiaPage() {
  const [approvedNews, setApprovedNews] = useState<NewsMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    fetch("/api/midia")
      .then((res) => res.json())
      .then((data) => {
        setApprovedNews(
          (data.items || []).map((item: any) => ({
            ...item,
            hub: item.hub || "SEM_HUB",
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setIsClient(data?.user?.role === "CLIENTE"))
      .catch(() => setIsClient(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        {isClient && (
          <div className="mb-4 text-xs text-[#64748B]">
            <a href="/dashboard" className="text-[#1E3A8A] hover:underline">
              Área do cliente
            </a>
            <span className="mx-2">/</span>
            <span>Na mídia</span>
          </div>
        )}
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

        {loading ? (
          <div className="border border-[#E2E8F0] bg-white p-8 text-fluid-base text-[#64748B]">
            Carregando menções...
          </div>
        ) : approvedNews.length === 0 ? (
          <div className="border border-[#E2E8F0] bg-white p-8 text-fluid-base text-[#64748B]">
            Menções em consolidação. Em breve, publicaremos as referências oficiais.
          </div>
        ) : (
          Object.entries(
            approvedNews.reduce<Record<string, NewsMention[]>>((acc, item) => {
              const key = item.hub || "SEM_HUB";
              acc[key] = acc[key] || [];
              acc[key].push(item);
              return acc;
            }, {})
          ).map(([hubKey, items]) => (
            <section key={hubKey} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-fluid-xl font-semibold text-[#0F172A]">
                  {hubKey === "COOPERACAO_INTERNACIONAL"
                    ? "Cooperação Internacional"
                    : hubKey === "COMPRAS_GOVERNAMENTAIS"
                    ? "Compras Governamentais e Governança"
                    : hubKey === "SUPORTE_MUNICIPIOS"
                    ? "Suporte aos Municípios"
                    : hubKey === "DESENVOLVIMENTO_SOFTWARE"
                    ? "Desenvolvimento de Software"
                    : "Sem hub definido"}
                </h2>
                <span className="text-xs text-[#64748B]">{items.length} itens</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((news, index) => (
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
            </section>
          ))
        )}
      </div>
    </div>
  );
}
