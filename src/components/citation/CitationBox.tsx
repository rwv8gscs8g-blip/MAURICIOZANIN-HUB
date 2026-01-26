"use client";

import { useState } from "react";
import { Copy, Check, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface CitationBoxProps {
  author: string;
  title: string;
  publisher: string;
  year: string;
  url?: string;
  type?: "cartilha" | "artigo" | "livro" | "biografia" | "outro";
}

const getCurrentDate = () => {
  const today = new Date();
  return today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const citationFormats = {
  abnt: (props: CitationBoxProps) => {
    const { author, title, publisher, year, url } = props;
    if (props.type === "biografia") {
      const currentDate = getCurrentDate();
      return `${author.toUpperCase()}. ${title}. Disponível em: ${url}. Acesso em: ${currentDate}.`;
    }
    return `${author.toUpperCase()}. ${title}. ${publisher}, ${year}.`;
  },
  apa: (props: CitationBoxProps) => {
    const { author, title, publisher, year, url } = props;
    if (props.type === "biografia") {
      const currentDate = getCurrentDate();
      return `${author}. (${year}). ${title}. Disponível em: ${url}. Acesso em: ${currentDate}.`;
    }
    const urlPart = url ? ` Disponível em: ${url}.` : "";
    return `${author}. (${year}). ${title}. ${publisher}.${urlPart}`;
  },
  bibtex: (props: CitationBoxProps) => {
    const { author, title, publisher, year, url } = props;
    const entryType = props.type === "biografia" ? "@misc" : "@article";
    const key = author
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toLowerCase();
    return `@misc{${key}${year},
  author = {${author}},
  title = {${title}},
  year = {${year}},
  publisher = {${publisher}},
  url = {${url || ""}},
  note = {Acesso em: ${getCurrentDate()}}
}`;
  },
};

export function CitationBox({
  author,
  title,
  publisher,
  year,
  url,
  type = "outro",
}: CitationBoxProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<"abnt" | "apa" | "bibtex">("abnt");

  const citation = citationFormats[activeFormat]({
    author,
    title,
    publisher,
    year,
    url,
    type,
  });

  const handleCopy = (format: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-50 border border-[#E2E8F0] p-6 rounded-lg"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-[#1E3A8A]" />
        <h3 className="text-fluid-lg font-semibold text-[#0F172A]">
          Como Citar
        </h3>
      </div>

      {/* Seletor de Formato */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["abnt", "apa", "bibtex"] as const).map((format) => (
          <button
            key={format}
            onClick={() => setActiveFormat(format)}
            className={`px-4 py-2 text-fluid-sm font-medium transition-colors border ${
              activeFormat === format
                ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
            }`}
          >
            {format.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Citação */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded mb-4">
        <p className="text-fluid-base text-[#0F172A] leading-[1.8] font-mono">
          {citation}
        </p>
      </div>

      {/* Botão Copiar */}
      <button
        onClick={() => handleCopy(activeFormat)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1E3A8A] text-white text-fluid-sm font-medium hover:bg-[#1E3A8A]/90 transition-colors border border-[#1E3A8A]"
      >
        {copiedFormat === activeFormat ? (
          <>
            <Check className="h-4 w-4" />
            <span>Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span>Copiar Citação</span>
          </>
        )}
      </button>

      {url && (
        <p className="text-fluid-xs text-[#64748B] mt-4 text-center">
          URL: <a href={url} className="text-[#1E3A8A] hover:underline">{url}</a>
        </p>
      )}
    </motion.div>
  );
}
