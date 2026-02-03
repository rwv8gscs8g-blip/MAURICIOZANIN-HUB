"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CitationBox } from "@/components/citation/CitationBox";
import { YouTubePlaylist } from "@/components/youtube/YouTubePlaylist";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProfessionalGallery } from "@/components/gallery/ProfessionalGallery";
import { professionalPhotos } from "@/data/professional-photos";
import { Printer, Globe, ShoppingCart, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const biography = {
  name: "Luís Maurício Junqueira Zanin",
  title: "International Project Manager | Public Procurement & Governance Specialist",
  summary: `
    Especialista em gestão de projetos internacionais, com mais de 25 anos de experiência em governança pública, compras públicas sustentáveis e cooperação internacional. Reconhecido pela capacidade de liderar equipes remotas e multiculturais, articular atores institucionais em contextos municipais, nacionais e internacionais, e entregar resultados mensuráveis em projetos de alta complexidade financiados por organismos multilaterais.
    
    Expertise consolidada na estruturação de redes institucionais, implementação de agendas globais (ODS, Nova Agenda Urbana) e coordenação de consórcios internacionais em ambientes culturalmente diversos, com foco em diplomacia pública, desenvolvimento institucional e fortalecimento de capacidades locais.
  `
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
            <p className="text-fluid-lg text-[#64748B] print:text-black font-semibold">
              {biography.title}
            </p>
            <div className="mt-6 text-[#64748B] max-w-4xl mx-auto leading-relaxed print:text-black text-justify">
              {biography.summary.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">{paragraph.trim()}</p>
              ))}
            </div>
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
                Governança & Compras
              </button>
              <button
                onClick={() => setActiveTab("internacional")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all",
                  activeTab === "internacional"
                    ? "bg-white text-purple-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Globe className="w-4 h-4" />
                Cooperação Internacional
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] transition-colors text-sm font-medium shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir Currículo
            </button>
          </div>

          {/* Contact Info (Print Only) */}
          <div className="hidden print:block mb-8 border-b border-gray-300 pb-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                mauriciozanin@me.com
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +55 61 98132-1000
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                mauriciozanin.com
              </div>
            </div>
          </div>

          {/* Currículo Content */}
          <div className="reading-column mb-16 print:mb-4">
            <div className="bg-gradient-to-br from-[#1E3A8A]/5 to-transparent border-l-4 border-[#1E3A8A] p-8 md:p-10 rounded-r-lg print:border-l-0 print:border-none print:bg-none print:p-0">

              {/* Tab: Compras Governamentais */}
              {activeTab === "compras" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key="compras"
                  className="space-y-8"
                >
                  <SectionTitle color="bg-blue-600">Experiência em Governança, Compliance e Políticas Públicas</SectionTitle>

                  <ExperienceItem
                    role="Diretor de Projetos | Gestão de Projetos Tecnológicos e Fortalecimento Institucional"
                    org="Confederação Nacional de Municípios (2006-2015)"
                  >
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Desenvolvimento e coordenação de projetos estratégicos de modernização administrativa municipal.</li>
                      <li>Articulação com tribunais de contas, ministérios públicos e órgãos de controle para garantir conformidade e transparência.</li>
                      <li>Implementação de políticas de integridade e governança em municípios de diferentes portes.</li>
                    </ul>
                  </ExperienceItem>

                  <ExperienceItem
                    role="Consultor SEBRAE Nacional | Unidade de Políticas Públicas"
                    org="Estratégia Nacional de Compras Governamentais (2006-2015)"
                  >
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Desenho da Política Nacional de Compras Públicas do SEBRAE e distribuição de metodologias para todos os SEBRAEs estaduais.</li>
                      <li>Elaboração de programas estaduais de compras governamentais (Rio de Janeiro, Rio Grande do Sul, Distrito Federal).</li>
                      <li>Criação de cursos oficiais para compradores públicos e fornecedores, com foco em desenvolvimento local e inclusão de micro e pequenas empresas.</li>
                      <li>Capacitação de multiplicadores em compras governamentais em 17 estados brasileiros.</li>
                    </ul>
                  </ExperienceItem>

                  <ExperienceItem
                    role="Instrutor e Conteudista"
                    org="Escola Nacional de Administração Pública (ENAP) (2005-2013)"
                  >
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Desenvolvimento de conteúdo técnico sobre evolução das compras governamentais no Brasil e no mundo.</li>
                      <li>Formação de gestores públicos em logística de suprimentos, licitações sustentáveis e políticas públicas aplicadas.</li>
                      <li>Parceria com Banco Interamericano de Desenvolvimento (BID) para programa de capacitação municipal.</li>
                    </ul>
                  </ExperienceItem>

                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-blue-600">Produção Técnica e Publicações Relevantes</SectionTitle>
                    <div className="space-y-4">
                      <PublicationItem title="Compras governamentais com a aplicação dos benefícios para as micro e pequenas empresas: guia do educador" publisher="Brasília: Sebrae, 2009, 368 p." />
                      <PublicationItem title="Compras governamentais: como vender para a administração pública sem risco: guia do educador" publisher="Brasília: SEBRAE, 2009. 308 p. (em coautoria com Noelma Silva)" />
                      <PublicationItem title="Tecnologia e Modernização Administrativa: do Governo Eletrônico à Governança Conectada" publisher="Brasília: CNM, 2008, 104 p." />
                      <PublicationItem title="Cartilha do Fornecedor: Compras públicas governamentais: seu novo canal de negócios" publisher="Brasília: CNM, Sebrae, 2008 (em coautoria com Cláudio Pereira Barreto)" />
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
                  className="space-y-8"
                >
                  <SectionTitle color="bg-purple-600">Experiência Internacional em Cooperação e Diplomacia Pública</SectionTitle>

                  <ExperienceItem
                    role="Coordenador Geral - Projeto InovaJuntos (2019-2024)"
                    org="Confederação Nacional de Municípios (CNM) | Financiamento: União Europeia"
                  >
                    <p className="mb-3 italic">Coordenei durante 4 anos um dos maiores projetos de cooperação descentralizada entre Brasil, Portugal e América Latina, envolvendo 19 municípios brasileiros, 12 municípios portugueses e 15 municípios latino-americanos.</p>
                    <h4 className="font-semibold text-sm uppercase text-slate-500 mb-2">Principais Responsabilidades e Resultados:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Gestão de Consórcio Internacional:</strong> Articulação entre CNM (Brasil) e Centro de Estudos Sociais da Universidade de Coimbra (Portugal), garantindo coerência metodológica e governança multinível.</li>
                      <li><strong>Coordenação de Equipes Multiculturais:</strong> Liderança de equipes técnicas distribuídas em 3 continentes.</li>
                      <li><strong>Diplomacia Pública:</strong> Promoção de diálogo contínuo entre governos locais, nacionais e organismos multilaterais (UE, ONU-Habitat).</li>
                      <li><strong>Implementação de Agendas Globais:</strong> Incorporação dos ODS e da Nova Agenda Urbana em políticas locais.</li>
                      <li><strong>Monitoramento e Avaliação:</strong> Gestão de logframe, indicadores de impacto e sistema OPSYS da UE (aprovado em auditorias ROM).</li>
                      <li><strong>Impactos:</strong> 18 espaços de inovação, 19 diagnósticos vocacionais, Rede InovaJuntos criada.</li>
                    </ul>
                  </ExperienceItem>

                  <ExperienceItem
                    role="Consultor Internacional em Governança e Compras Públicas"
                    org="Organismos Multilaterais e Cooperação Técnica Internacional (2002-2024)"
                  >
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Portugal:</strong> Consultoria à Presidência do Conselho de Ministros para validação do Plano Nacional de Compras Eletrônicas (PNCE).</li>
                      <li><strong>América Latina:</strong> Missões técnicas em El Salvador, Guatemala, México, Chile e Bolívia para sistemas de compras governamentais.</li>
                      <li><strong>Europa:</strong> Orador em fóruns da União Europeia (Lisbon Information Society Forum, Smart City Expo Barcelona).</li>
                      <li><strong>Organismos:</strong> Colaboração com OEA, BID e PNUD.</li>
                    </ul>
                  </ExperienceItem>

                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-purple-600">Diferenciais para Projetos de Diplomacia Pública da UE</SectionTitle>
                    <div className="grid md:grid-cols-2 gap-3">
                      <CheckItem>Experiência comprovada em coordenação de projetos financiados pela UE</CheckItem>
                      <CheckItem>Expertise em governança multinível e cooperação descentralizada</CheckItem>
                      <CheckItem>Histórico de compliance com sistemas de monitoramento da UE</CheckItem>
                      <CheckItem>Experiência em gestão de equipes remotas e consórcios internacionais</CheckItem>
                      <CheckItem>Rede consolidada de contatos institucionais</CheckItem>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Shared: Formação e Idiomas (Visible in both prints effectively, or logically placed) */}
              <div className="mt-12 pt-8 border-t border-gray-200 print:break-inside-avoid">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wider">Formação Acadêmica</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="font-bold">MBA em Políticas Públicas</p>
                        <p className="text-sm text-slate-600">Fundação Getúlio Vargas (FGV)</p>
                      </div>
                      <div>
                        <p className="font-bold">Bacharel em Administração Pública</p>
                        <p className="text-sm text-slate-600">Universidade Estadual Paulista (UNESP)</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wider">Idiomas</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Português</span> <span className="font-semibold text-slate-900">Nativo</span>
                      </li>
                      <li className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Espanhol</span> <span className="font-semibold text-slate-900">Fluente</span>
                      </li>
                      <li className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Inglês</span> <span className="font-semibold text-slate-900">Intermediário</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
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

function SectionTitle({ children, color }: { children: React.ReactNode, color: string }) {
  return (
    <h2 className="text-xl font-bold text-[#0F172A] mb-6 tracking-tight flex items-center gap-3">
      <span className={cn("w-8 h-1 rounded-full block print:bg-black", color)}></span>
      {children}
    </h2>
  );
}

function ExperienceItem({ role, org, children }: { role: string, org: string, children?: React.ReactNode }) {
  return (
    <div className="mb-6 print:mb-4">
      <h3 className="font-bold text-[#1E3A8A] text-lg print:text-black leading-tight">{role}</h3>
      <div className="text-slate-600 font-medium mb-2 print:text-black">{org}</div>
      <div className="text-slate-700 leading-relaxed text-sm print:text-black">
        {children}
      </div>
    </div>
  );
}

function PublicationItem({ title, publisher }: { title: string, publisher: string }) {
  return (
    <div className="mb-3">
      <p className="font-bold text-slate-800 text-sm print:text-black">{title}</p>
      <p className="text-xs text-slate-500 print:text-black">{publisher}</p>
    </div>
  )
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-700 print:text-black">
      <span className="text-green-600 font-bold print:text-black">✓</span>
      <span>{children}</span>
    </div>
  )
}
