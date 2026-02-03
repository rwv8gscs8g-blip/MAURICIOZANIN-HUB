"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  File,
  FileSpreadsheet,
  Presentation,
  FileArchive,
  FileType,
} from "lucide-react";
import { motion } from "framer-motion";
import { kitComprasZaninResources } from "@/data/kit-compras-zanin";

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return FileText;
    case "doc":
    case "rtf":
      return File;
    case "xls":
      return FileSpreadsheet;
    case "ppsx":
    case "pptx":
      return Presentation;
    case "zip":
      return FileArchive;
    default:
      return FileType;
  }
};

export default function CompartilhePage() {
  const [tab, setTab] = useState("COMPRAS_GOVERNAMENTAIS");
  const [sharedProducts, setSharedProducts] = useState<any[]>([]);
  const tabs = [
    { key: "COMPRAS_GOVERNAMENTAIS", label: "Compras Gov. e Governança" },
    { key: "COOPERACAO_INTERNACIONAL", label: "Cooperação Internacional" },
    { key: "SUPORTE_MUNICIPIOS", label: "Suporte aos Municípios" },
    { key: "DESENVOLVIMENTO_SOFTWARE", label: "Desenvolvimento de Software" },
  ];

  useEffect(() => {
    fetch("/api/compartilhe/products")
      .then((res) => res.json())
      .then((data) => setSharedProducts(data.products || []))
      .catch(() => setSharedProducts([]));
  }, []);

  const filteredProducts = useMemo(() => {
    return sharedProducts.filter((product) => product.hub === tab);
  }, [sharedProducts, tab]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Grid de Arquivos */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-3 tracking-tight">
                Materiais Compartilhados
              </h1>
              <p className="text-fluid-base text-[#64748B]">
                Acesse recursos exclusivos sobre governança e compras públicas
              </p>
            </motion.div>

            <div className="mb-10">
              <div className="flex flex-wrap gap-3">
                {tabs.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key)}
                    className={`px-4 py-2 text-sm border ${
                      tab === item.key
                        ? "border-[#1E3A8A] bg-[#1E3A8A] text-white"
                        : "border-[#E2E8F0] text-[#0F172A]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h2 className="text-fluid-2xl font-bold text-[#0F172A] mb-2 tracking-tight">
                  Compartilhe — {tabs.find((t) => t.key === tab)?.label}
                </h2>
                <p className="text-fluid-base text-[#64748B]">
                  Materiais públicos selecionados por hub.
                </p>
              </motion.div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] p-6 text-sm text-[#64748B]">
                  Nenhum material publicado neste hub ainda.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredProducts.map((product: any) => (
                    <div
                      key={product.id}
                      className="bg-white border border-[#E2E8F0] p-6 rounded-lg"
                    >
                      <div className="text-xs text-[#64748B] mb-1">
                        {product.client?.name || "Cliente"}
                        {product.year ? ` • ${product.year}` : ""}
                      </div>
                      <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-3">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-fluid-sm text-[#64748B] mb-4">
                          {product.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <a
                          href={`/produtos/${product.slug}`}
                          className="px-3 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-xs"
                        >
                          Ver produto
                        </a>
                        {product.fileUrl && (
                          <a
                            href={product.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 bg-[#1E3A8A] text-white text-xs"
                          >
                            Baixar
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kit Compras Zanin - Sebrae */}
            <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h2 className="text-fluid-2xl font-bold text-[#0F172A] mb-2 tracking-tight">
                  Kit Compras Zanin - Sebrae
                </h2>
                <p className="text-fluid-base text-[#64748B]">
                  Materiais educacionais e ferramentas sobre compras públicas, licitações e governança
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {kitComprasZaninResources.map((resource, index) => {
                  const Icon = getFileIcon(resource.type);

                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-[#E2E8F0] p-6 transition-all duration-300 hover:-translate-y-1 rounded-lg"
                    >
                      <div className="flex items-start space-x-4 mb-5">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 flex items-center justify-center bg-[#1E3A8A]/10 rounded-lg">
                            <Icon className="h-5 w-5 text-[#1E3A8A]" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-fluid-xs font-medium text-[#1E3A8A] bg-[#1E3A8A]/10 px-2 py-0.5 rounded">
                              {resource.category}
                            </span>
                            {resource.size && (
                              <span className="text-fluid-xs text-[#64748B]">
                                {resource.size}
                              </span>
                            )}
                          </div>
                          <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-1 tracking-tight">
                            {resource.name}
                          </h3>
                          <p className="text-fluid-sm text-[#64748B] leading-[1.6]">
                            {resource.description}
                          </p>
                          {resource.author && (
                            <p className="text-fluid-xs text-[#64748B] mt-2">
                              Por: {resource.author}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={resource.filePath}
                        download
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-fluid-sm font-medium transition-colors border border-[#E2E8F0] bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 border-[#1E3A8A] rounded"
                      >
                        <Download className="h-4 w-4" />
                        <span>Baixar</span>
                      </a>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Call-to-Action Lateral */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1E3A8A] p-8 text-white sticky top-8 border border-[#1E3A8A]"
            >
              <h2 className="text-fluid-xl font-bold mb-4 tracking-tight">
                Precisa de Consultoria?
              </h2>
              <p className="text-fluid-sm text-white/80 mb-6 leading-[1.7]">
                Entre em contato e descubra como podemos ajudar sua organização
                a alcançar a conformidade e excelência em gestão pública.
              </p>
              <button className="w-full bg-white text-[#1E3A8A] font-semibold py-3 px-6 text-fluid-sm transition-colors hover:bg-slate-50">
                Solicitar Consultoria
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
