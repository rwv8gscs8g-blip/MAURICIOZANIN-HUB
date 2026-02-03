"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CitationBox } from "@/components/citation/CitationBox";
import { YouTubePlaylist } from "@/components/youtube/YouTubePlaylist";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProfessionalGallery } from "@/components/gallery/ProfessionalGallery";
import { professionalPhotos } from "@/data/professional-photos";
import { Printer, Globe, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const biography = {
  name: "Luís Maurício Junqueira Zanin",
  title: "Estrategista de Compras Públicas & Cooperação Internacional",
  content: `
    Luís Maurício Junqueira Zanin é reconhecido como uma das principais autoridades brasileiras em compras governamentais focada na inclusão de Micro e Pequenas Empresas nas contratações públicas para a promoção do desenvolvimento nacional sustentável, cooperação intermunicipal e internacional para compartilhamento e boas práticas e gestão pública. Com mais de 25 anos de experiência dedicados à transformação da administração pública, combina expertise técnica com visão estratégica para resultados transformadores. A Primeira interação com o Compras.gov.br teve inicio no ano 2000 no lançamento do portal.

    Sua trajetória profissional é marcada pela liderança em projetos de grande impacto nacional e internacional. Como Coordenador do Projeto Inovajuntos e fundador da Rede Inovajuntos, consolidou a maior rede de inovação municipal do Brasil, conectando mais de 200 municípios em uma plataforma de compartilhamento de conhecimento e boas práticas em gestão pública.

    Especialista em conformidade legal e implementação de novas legislações, Maurício Zanin tem sido referência na adaptação de municípios à Lei 14.133/2021, a nova lei de licitações e contratos administrativos. Sua abordagem combina rigor técnico com pragmatismo, facilitando a transição de gestores públicos para os novos paradigmas legais.

    No âmbito internacional, atua como consultor de organismos multilaterais, incluindo a União Europeia e agências das Nações Unidas, desenvolvendo projetos de cooperação técnica em compras públicas sustentáveis e governança. Sua expertise transcende fronteiras, contribuindo para o fortalecimento de sistemas de compras públicas em diversos países.

    Como autor e educador, produziu dezenas de publicações técnicas, cartilhas e materiais didáticos que se tornaram referência para gestores públicos. Suas obras abordam desde aspectos práticos de processos licitatórios até estratégias avançadas de cooperação intermunicipal e consórcios públicos.

    A atuação em mídia, especialmente através de programas da Confederação Nacional de Municípios (CNM), amplificou seu alcance, permitindo que milhares de gestores públicos tenham acesso a conhecimento especializado sobre compras governamentais e gestão municipal.

    Sua visão estratégica e capacidade de articulação transformaram a Rede Inovajuntos em um case de sucesso, demonstrando como a cooperação intermunicipal pode gerar resultados concretos em eficiência, economia e qualidade na gestão pública brasileira.
  `,
};

type CurriculumTab = "compras" | "internacional";

export default function SobrePage() {
  const [activeTab, setActiveTab] = useState<CurriculumTab>("compras");

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <JsonLd type="person" />
      <div className="min-h-screen bg-white py-16 print:py-0">
        <div className="container-fluid">
          {/* Header */}
          <div className="mb-12 text-center print:mb-8 print:text-left">
            <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-2 tracking-tight">
              {biography.name}
            </h1>
            <p className="text-fluid-lg text-[#64748B] print:text-black">
              {biography.title}
            </p>
          </div>

          {/* Controls (No Print) */}
          <div className="no-print flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
            <div className="flex p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setActiveTab("compras")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all",
                  activeTab === "compras"
                    ? "bg-white text-blue-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <ShoppingCart className="w-4 h-4" />
                Compras Governamentais
              </button>
              <button
                onClick={() => setActiveTab("internacional")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all",
                  activeTab === "internacional"
                    ? "bg-white text-blue-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Globe className="w-4 h-4" />
                Cooperação Internacional
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              Imprimir Currículo
            </button>
          </div>

          {/* Currículo Content */}
          <div className="reading-column mb-16 print:mb-4">
            <div className="bg-gradient-to-br from-[#1E3A8A]/5 to-transparent border-l-4 border-[#1E3A8A] p-8 md:p-10 rounded-r-lg print:border-l-2 print:border-black print:bg-none print:p-0 print:pl-4">

              {/* Tab: Compras Governamentais */}
              {activeTab === "compras" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key="compras"
                >
                  <h2 className="text-2xl font-bold text-[#0F172A] mb-6 tracking-tight flex items-center gap-3">
                    <span className="w-8 h-1 bg-blue-600 rounded-full block print:bg-black"></span>
                    Compras Governamentais & Governança
                  </h2>
                  <div className="space-y-8 text-[#0F172A] leading-relaxed">
                    <div>
                      <h3 className="font-bold text-[#1E3A8A] text-lg mb-2 print:text-black">Formação Acadêmica</h3>
                      <p>
                        Formado em <strong>Administração Pública</strong> pela{" "}
                        <strong>Universidade Estadual Paulista – Unesp</strong> e pós-graduado com{" "}
                        <strong>MBA em Políticas Públicas</strong> pela{" "}
                        <strong>Fundação Getúlio Vargas – FGV</strong>.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E3A8A] text-lg mb-2 print:text-black">Atuação Profissional</h3>
                      <p>
                        Autor da estratégia e dos conteúdos de compras governamentais do{" "}
                        <strong>Sebrae Nacional</strong>. Atua como consultor especializado junto ao Ministério da Gestão, Inovação e Governo Digital na evolução dos portais <strong>Compras.gov.br</strong> e <strong>PNCP</strong>.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E3A8A] text-lg mb-2 print:text-black">Consultoria Estratégica</h3>
                      <p>
                        Lidera ações junto a órgãos de controle (Tribunais de Contas, Atricon, Ministério Público) para implementação de políticas de governança. Especialista na <strong>Nova Lei de Licitações (14.133/2021)</strong>, capacitando gestores em todo o país.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab: Cooperação Internacional */}
              {activeTab === "internacional" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key="internacional"
                >
                  <h2 className="text-2xl font-bold text-[#0F172A] mb-6 tracking-tight flex items-center gap-3">
                    <span className="w-8 h-1 bg-purple-600 rounded-full block print:bg-black"></span>
                    Cooperação Internacional & Projetos
                  </h2>
                  <div className="space-y-8 text-[#0F172A] leading-relaxed">
                    <div>
                      <h3 className="font-bold text-[#1E3A8A] text-lg mb-2 print:text-black">Liderança de Projetos</h3>
                      <p>
                        Coordenador e Fundador da <strong>Rede Inovajuntos</strong>, projeto de cooperação internacional que conecta mais de 200 municípios brasileiros e portugueses para intercâmbio de inovação e tecnologia na gestão pública.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E3A8A] text-lg mb-2 print:text-black">Consultoria Multilateral</h3>
                      <p>
                        Consultor para organismos como <strong>União Europeia</strong> e agências da <strong>ONU</strong>. Desenvolve frameworks para compras sustentáveis e localização dos ODS (Objetivos de Desenvolvimento Sustentável) em governos locais.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E3A8A] text-lg mb-2 print:text-black">Nova Agenda Urbana</h3>
                      <p>
                        Implementador da Nova Agenda Urbana (NAU), atuando na estruturação pragmática de consórcios públicos intermunicipais e parcerias globais para o desenvolvimento regional sustentável.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Biografia Completa (Sempre Visível, ajustada para print) */}
          <div className="reading-column mb-16 print:mb-0">
            <div className="print:hidden mb-8">
              <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">Biografia Detalhada</h3>
            </div>
            <article className="prose prose-lg max-w-none text-justify print:prose-base">
              <div className="text-serif text-fluid-base text-[#0F172A] leading-[1.9] whitespace-pre-line">
                {biography.content.trim()}
              </div>
            </article>
          </div>

          {/* Citation Box (Print Visible) */}
          <div className="reading-column mb-16 break-inside-avoid">
            <CitationBox
              author="ZANIN, Luís Maurício Junqueira"
              title={`Currículo: ${activeTab === 'compras' ? 'Compras Governamentais' : 'Cooperação Internacional'}`}
              publisher="Maurício Zanin Hub"
              year={new Date().getFullYear().toString()}
              url="https://mauriciozanin.com.br/sobre"
              type="biografia"
            />
          </div>

          {/* Galeria e Media (Ocultos na Impressão) */}
          <div className="no-print">
            <div className="reading-column mb-16">
              <ProfessionalGallery photos={professionalPhotos} autoPlayInterval={5000} />
            </div>

            <div className="mb-16">
              <div className="mb-8">
                <h2 className="text-fluid-2xl font-bold text-[#0F172A] mb-4 tracking-tight text-center">
                  Histórico de Media
                </h2>
                <p className="text-fluid-base text-[#64748B] text-center max-w-2xl mx-auto leading-[1.7]">
                  Vídeos, entrevistas e programas sobre compras públicas, governança
                  e cooperação intermunicipal produzidos para a CNM e projetos Inovajuntos.
                </p>
              </div>
              <YouTubePlaylist maxVideos={12} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
