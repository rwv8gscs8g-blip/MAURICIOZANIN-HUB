"use client";

import { motion } from "framer-motion";
import { FileText, Download, Calendar, MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { JsonLd } from "@/components/seo/JsonLd";
import { CitationBox } from "@/components/citation/CitationBox";

interface Document {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "doc" | "xls";
  url: string;
  pages?: number;
  size?: string;
  category: string;
  publishedAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: "em-andamento" | "concluido";
  location?: string;
  documents: Document[];
}

const projects: Project[] = [
  {
    id: "inovajuntos",
    name: "Rede Inovajuntos",
    description:
      "Rede de inovação municipal com mais de 200 municípios brasileiros, focada em compartilhamento de conhecimento e boas práticas em gestão pública, compras governamentais e cooperação intermunicipal.",
    startDate: "2023-08-10",
    status: "em-andamento",
    location: "Brasil",
    documents: [
      {
        id: "1",
        title: "Proposta Técnica - Rede Inovajuntos",
        description:
          "Documento técnico completo com a proposta de criação da rede, objetivos, metodologia e estrutura organizacional.",
        type: "pdf",
        url: "https://example.com/inovajuntos-proposta.pdf",
        pages: 45,
        size: "3.2 MB",
        category: "Documento Técnico",
        publishedAt: "2023-08-10",
      },
      {
        id: "2",
        title: "Manual de Adesão - Rede Inovajuntos",
        description:
          "Manual completo para municípios interessados em aderir à rede, incluindo requisitos, benefícios e processo de adesão.",
        type: "pdf",
        url: "https://example.com/inovajuntos-manual.pdf",
        pages: 28,
        size: "2.1 MB",
        category: "Manual",
        publishedAt: "2023-09-15",
      },
      {
        id: "3",
        title: "Relatório Anual 2023 - Rede Inovajuntos",
        description:
          "Relatório completo das atividades, resultados e impactos da Rede Inovajuntos no primeiro ano de operação.",
        type: "pdf",
        url: "https://example.com/inovajuntos-relatorio-2023.pdf",
        pages: 120,
        size: "8.5 MB",
        category: "Relatório",
        publishedAt: "2024-01-20",
      },
      {
        id: "4",
        title: "Planilha de Indicadores - Rede Inovajuntos",
        description:
          "Planilha Excel com indicadores de performance, métricas de adesão e acompanhamento de resultados.",
        type: "xls",
        url: "https://example.com/inovajuntos-indicadores.xls",
        size: "1.8 MB",
        category: "Planilha",
        publishedAt: "2023-10-01",
      },
    ],
  },
  {
    id: "cooperacao-ue",
    name: "Projeto de Cooperação UE-Brasil",
    description:
      "Projeto de cooperação internacional sobre compras públicas sustentáveis em parceria com a União Europeia, incluindo workshops, capacitações e troca de experiências.",
    startDate: "2021-03-15",
    endDate: "2023-12-31",
    status: "concluido",
    location: "Bruxelas, Bélgica / Brasil",
    documents: [
      {
        id: "5",
        title: "Acordo de Cooperação UE-Brasil",
        description:
          "Documento oficial do acordo de cooperação entre União Europeia e Brasil em compras públicas sustentáveis.",
        type: "pdf",
        url: "https://example.com/ue-brasil-acordo.pdf",
        pages: 35,
        size: "2.8 MB",
        category: "Acordo",
        publishedAt: "2021-03-15",
      },
      {
        id: "6",
        title: "Relatório Final - Projeto UE-Brasil",
        description:
          "Relatório final com resultados, impactos e recomendações do projeto de cooperação.",
        type: "pdf",
        url: "https://example.com/ue-brasil-relatorio-final.pdf",
        pages: 95,
        size: "6.2 MB",
        category: "Relatório",
        publishedAt: "2023-12-31",
      },
    ],
  },
];

export default function ProjetosPage() {
  return (
    <>
      <JsonLd type="organization" />
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
              Projetos e Documentos Oficiais
            </h1>
            <p className="text-fluid-base text-[#64748B] leading-[1.7] max-w-3xl">
              Repositório completo de documentos oficiais dos projetos Inovajuntos
              e Cooperação Internacional. Mais de 400 páginas de documentação
              técnica disponível para consulta.
            </p>
          </motion.div>

          <div className="space-y-16">
            {projects.map((project, projectIndex) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: projectIndex * 0.1 }}
                className="bg-white border border-[#E2E8F0] p-8 md:p-12"
              >
                {/* Header do Projeto */}
                <div className="mb-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-fluid-2xl font-bold text-[#0F172A] mb-3 tracking-tight">
                        {project.name}
                      </h2>
                      <p className="text-fluid-base text-[#64748B] leading-[1.8] mb-4">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-6 text-fluid-sm text-[#64748B]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(project.startDate), "dd/MM/yyyy")}
                            {project.endDate &&
                              ` - ${format(new Date(project.endDate), "dd/MM/yyyy")}`}
                          </span>
                        </div>
                        {project.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{project.location}</span>
                          </div>
                        )}
                        <span
                          className={`px-3 py-1 border text-fluid-xs ${
                            project.status === "em-andamento"
                              ? "text-blue-600 bg-blue-50 border-blue-200"
                              : "text-emerald-600 bg-emerald-50 border-emerald-200"
                          }`}
                        >
                          {project.status === "em-andamento"
                            ? "Em Andamento"
                            : "Concluído"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documentos Oficiais */}
                <div>
                  <h3 className="text-fluid-xl font-bold text-[#0F172A] mb-6 tracking-tight flex items-center gap-2">
                    <FileText className="h-6 w-6 text-[#1E3A8A]" />
                    Documentos Oficiais ({project.documents.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {project.documents.map((doc, docIndex) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: docIndex * 0.05 }}
                        className="border border-[#E2E8F0] p-6 hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-[#1E3A8A] rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-fluid-lg font-semibold text-[#0F172A] mb-2 tracking-tight">
                              {doc.title}
                            </h4>
                            <p className="text-fluid-sm text-[#64748B] leading-[1.7] mb-3">
                              {doc.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-fluid-xs text-[#64748B] mb-4">
                              <span className="px-2 py-1 bg-slate-50 border border-[#E2E8F0]">
                                {doc.category}
                              </span>
                              {doc.pages && <span>{doc.pages} páginas</span>}
                              {doc.size && <span>{doc.size}</span>}
                              <time>
                                {format(new Date(doc.publishedAt), "dd/MM/yyyy")}
                              </time>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-fluid-sm text-[#1E3A8A] hover:underline font-medium"
                            >
                              <Download className="h-4 w-4" />
                              Baixar Documento
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Citation Box para Projetos */}
          <div className="mt-16 max-w-2xl mx-auto">
            <CitationBox
              author="ZANIN, Luís Maurício Junqueira"
              title="Projetos e Documentos Oficiais - Rede Inovajuntos e Cooperação Internacional"
              publisher="Maurício Zanin"
              year={new Date().getFullYear().toString()}
              url="https://mauriciozanin.com.br/projetos"
              type="outro"
            />
          </div>
        </div>
      </div>
    </>
  );
}
