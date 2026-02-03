"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CitationBox } from "@/components/citation/CitationBox";
import { YouTubePlaylist } from "@/components/youtube/YouTubePlaylist";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProfessionalGallery } from "@/components/gallery/ProfessionalGallery";
import { professionalPhotos } from "@/data/professional-photos";
import { Printer, Globe, ShoppingCart, Mail, Phone, MapPin, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Conteúdo Original para Compras Governamentais
const bioCompras = {
  name: "Luís Maurício Junqueira Zanin",
  title: "Estrategista de Compras Públicas",
  summary: `
    Luís Maurício Junqueira Zanin é reconhecido como uma das principais autoridades brasileiras em compras governamentais focada na inclusão de Micro e Pequenas Empresas nas contratações públicas para a promoção do desenvolvimento nacional sustentável, cooperação intermunicipal e internacional para compartilhamento e boas práticas e gestão pública. Com mais de 25 anos de experiência dedicados à transformação da administração pública, combina expertise técnica com visão estratégica para resultados transformadores. A Primeira interação com o Compras.gov.br teve inicio no ano 2000 no lançamento do portal.

    Sua trajetória profissional é marcada pela liderança em projetos de grande impacto nacional e internacional. Como Coordenador do Projeto Inovajuntos e fundador da Rede Inovajuntos, consolidou a maior rede de inovação municipal do Brasil, conectando mais de 200 municípios em uma plataforma de compartilhamento de conhecimento e boas práticas em gestão pública.

    Especialista em conformidade legal e implementação de novas legislações, Maurício Zanin tem sido referência na adaptação de municípios à Lei 14.133/2021, a nova lei de licitações e contratos administrativos. Sua abordagem combina rigor técnico com pragmatismo, facilitando a transição de gestores públicos para os novos paradigmas legais.

    No âmbito internacional, atua como consultor de organismos multilaterais, incluindo a União Europeia e agências das Nações Unidas, desenvolvendo projetos de cooperação técnica em compras públicas sustentáveis e governança. Sua expertise transcende fronteiras, contribuindo para o fortalecimento de sistemas de compras públicas em diversos países.

    Como autor e educador, produziu dezenas de publicações técnicas, cartilhas e materiais didáticos que se tornaram referência para gestores públicos. Suas obras abordam desde aspectos práticos de processos licitatórios até estratégias avançadas de cooperação intermunicipal e consórcios públicos.

    A atuação em mídia, especialmente através de programas da Confederação Nacional de Municípios (CNM), amplificou seu alcance, permitindo que milhares de gestores públicos tenham acesso a conhecimento especializado sobre compras governamentais e gestão municipal.

    Sua visão estratégica e capacidade de articulação transformaram a Rede Inovajuntos em um case de sucesso, demonstrando como a cooperação intermunicipal pode gerar resultados concretos em eficiência, economia e qualidade na gestão pública brasileira.
  `
};

// Conteúdo Novo Integral para Cooperação Internacional
const bioInternacional = {
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
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handlePrint = (tab: CurriculumTab) => {
    setActiveTab(tab);
    setShowPrintModal(false);
    // Pequeno delay para garantir que o React renderizou a aba correta antes de imprimir
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const currentBio = activeTab === "compras" ? bioCompras : bioInternacional;

  return (
    <>
      <JsonLd type="person" />
      <div className="min-h-screen bg-white py-16 print:py-0 print:m-0">
        <div className="container-fluid print:p-0 print:max-w-none">

          {/* Print Header (Photo + Name) */}
          <div className="mb-12 text-center print:mb-6 print:text-left print:flex print:items-start print:gap-6">
            {/* Foto pequena no currículo (Visível na impressão e tela) */}
            <div className="hidden print:block w-24 h-32 relative flex-shrink-0 border border-gray-200">
              {/* Placeholder para foto - usando uma das profissionais se disponivel ou fallback */}
              <img
                src={professionalPhotos[0]?.src || "/images/avatar-placeholder.jpg"}
                alt="Maurício Zanin"
                className="object-cover w-full h-full grayscale"
              />
            </div>

            <div className="flex-grow">
              <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-2 tracking-tight print:text-2xl print:mb-1">
                {currentBio.name}
              </h1>
              <p className="text-fluid-lg text-[#64748B] print:text-black font-semibold print:text-lg">
                {currentBio.title}
              </p>
              {/* Summary only for International or if needed for Compras summary view */}
              <div className="mt-6 text-[#64748B] max-w-4xl mx-auto leading-relaxed print:text-black text-justify print:mt-3 print:text-sm">
                {currentBio.summary.split('\n').map((paragraph, index) => (
                  paragraph.trim() && <p key={index} className="mb-2">{paragraph.trim()}</p>
                ))}
              </div>
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
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] transition-colors text-sm font-medium shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir Currículo
            </button>
          </div>

          {/* Print Selection Modal */}
          {showPrintModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 no-print backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Selecionar Versão para Impressão</h3>
                  <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => handlePrint('compras')}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <span className="font-medium text-slate-700 group-hover:text-blue-700">Compras Governamentais</span>
                    <Printer className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                  </button>
                  <button
                    onClick={() => handlePrint('internacional')}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                  >
                    <span className="font-medium text-slate-700 group-hover:text-purple-700">Cooperação Internacional</span>
                    <Printer className="w-4 h-4 text-slate-400 group-hover:text-purple-500" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info (Print Only) */}
          <div className="hidden print:flex mb-6 border-b border-gray-300 pb-4 justify-between items-center text-sm">
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> mauriciozanin@me.com
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> +55 61 98132-1000
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> mauriciozanin.com
            </div>
          </div>

          {/* Currículo Content */}
          <div className="reading-column mb-16 print:mb-0 print:w-full">
            <div className="bg-gradient-to-br from-[#1E3A8A]/5 to-transparent border-l-4 border-[#1E3A8A] p-8 md:p-10 rounded-r-lg print:border-l-0 print:border-none print:bg-none print:p-0">

              {/* Tab: Compras Governamentais (Conteúdo Original Restaurado + Estrutura) */}
              {activeTab === "compras" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key="compras"
                  className="space-y-8 print:space-y-4"
                >
                  <SectionTitle color="bg-blue-600">Mini-Currículo: Formação e Atuação</SectionTitle>

                  <div className="space-y-4 text-fluid-base text-[#0F172A] leading-[1.8] print:text-sm print:leading-normal">
                    <div>
                      <h3 className="font-semibold text-[#1E3A8A] mb-1 print:text-black print:uppercase print:text-xs print:font-bold">Formação Acadêmica</h3>
                      <p>
                        Formado em <strong>Administração Pública</strong> pela <strong>Universidade Estadual Paulista – Unesp</strong> e pós-graduado com <strong>MBA em Políticas Públicas</strong> pela <strong>Fundação Getúlio Vargas – FGV</strong>.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1E3A8A] mb-1 print:text-black print:uppercase print:text-xs print:font-bold">Atuação Profissional</h3>
                      <p>
                        É autor da estratégia e dos conteúdos de compras governamentais do <strong>Sebrae Nacional</strong>. Atua como consultor de Compras Governamentais junto ao Sebrae no <strong>Ministério da Gestão, Inovação e Governo Digital</strong> na elaboração e evolução dos portais <strong>Compras.gov.br</strong> e <strong>PNCP</strong>.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1E3A8A] mb-1 print:text-black print:uppercase print:text-xs print:font-bold">Relacionamento Institucional</h3>
                      <p>
                        Realiza as ações junto aos órgãos de controle como <strong>Tribunais de Contas</strong>, <strong>Atricon</strong>, <strong>Ministério Público</strong>, <strong>AGU</strong> e <strong>procuradorias</strong> incentivando e implementando políticas de governança e melhoria da Gestão Pública.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab: Cooperação Internacional (Conteúdo Integral Fornecido) */}
              {activeTab === "internacional" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key="internacional"
                  className="space-y-8 print:space-y-5"
                >
                  {/* Formação Acadêmica */}
                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-purple-600">Formação Acadêmica</SectionTitle>
                    <div className="grid md:grid-cols-2 gap-4 print:gap-2">
                      <div className="print:mb-2">
                        <p className="font-bold text-slate-900 print:text-black">Bacharel em Administração Pública</p>
                        <p className="text-slate-600 print:text-black text-sm">Universidade Estadual Paulista (UNESP)</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 print:text-black">MBA em Políticas Públicas</p>
                        <p className="text-slate-600 print:text-black text-sm">Fundação Getúlio Vargas (FGV)</p>
                        <p className="text-xs text-slate-500 print:text-black italic mt-1">Tema: Análise do Impacto da Nova Tendência de Contratação Pública e a Participação das MPEs (2006-2014)</p>
                      </div>
                    </div>
                  </div>

                  {/* Experiência Internacional */}
                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-purple-600">Experiência Internacional em Cooperação</SectionTitle>

                    <ExperienceItem
                      role="Coordenador Geral - Projeto InovaJuntos (2019-2024)"
                      org="Confederação Nacional de Municípios (CNM) | Financiamento: União Europeia"
                    >
                      <p className="mb-3 italic">Coordenei durante 4 anos um dos maiores projetos de cooperação descentralizada entre Brasil, Portugal e América Latina, envolvendo 19 municípios brasileiros, 12 municípios portugueses e 15 municípios latino-americanos.</p>
                      <h4 className="font-semibold text-sm uppercase text-slate-500 mb-2 print:text-black">Principais Responsabilidades e Resultados:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><strong>Gestão de Consórcio Internacional:</strong> Articulação entre CNM (Brasil) e Centro de Estudos Sociais da Universidade de Coimbra.</li>
                        <li><strong>Coordenação de Equipes Multiculturais:</strong> Liderança de equipes técnicas distribuídas em 3 continentes.</li>
                        <li><strong>Diplomacia Pública:</strong> Promoção de diálogo contínuo entre governos locais, nacionais e organismos multilaterais.</li>
                        <li><strong>Implementação de Agendas Globais:</strong> Incorporação dos ODS e da Nova Agenda Urbana em políticas locais.</li>
                        <li><strong>Monitoramento e Avaliação:</strong> Gestão de logframe, indicadores de impacto e sistema OPSYS da UE.</li>
                        <li><strong>Impactos:</strong> 18 espaços de inovação, 19 diagnósticos vocacionais, Rede InovaJuntos criada.</li>
                      </ul>
                    </ExperienceItem>

                    <ExperienceItem
                      role="Consultor Internacional em Governança e Compras Públicas"
                      org="Organismos Multilaterais e Cooperação Técnica Internacional (2002-2024)"
                    >
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        <li><strong>Portugal:</strong> Consultoria à Presidência do Conselho de Ministros para validação do Plano Nacional de Compras Eletrônicas.</li>
                        <li><strong>América Latina:</strong> Missões técnicas em El Salvador, Guatemala, México, Chile e Bolívia.</li>
                        <li><strong>Europa:</strong> Orador em fóruns da União Europeia (Lisbon Information Society Forum, Smart City Expo Barcelona).</li>
                        <li><strong>Organismos:</strong> Colaboração com OEA, BID e PNUD.</li>
                      </ul>
                    </ExperienceItem>
                  </div>

                  {/* Experiência Governança */}
                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-purple-600">Experiência em Governança e Políticas Públicas</SectionTitle>

                    <ExperienceItem
                      role="Diretor de Projetos (2006-2015)"
                      org="Confederação Nacional de Municípios"
                    >
                      <p className="text-sm">Desenvolvimento e coordenação de projetos estratégicos de modernização administrativa municipal e articulação com órgãos de controle.</p>
                    </ExperienceItem>

                    <ExperienceItem
                      role="Consultor SEBRAE Nacional (2006-2015)"
                      org="Unidade de Políticas Públicas"
                    >
                      <p className="text-sm">Desenho da Política Nacional de Compras Públicas do SEBRAE e capacitação de multiplicadores em 17 estados.</p>
                    </ExperienceItem>

                    <ExperienceItem
                      role="Instrutor e Conteudista (2005-2013)"
                      org="Escola Nacional de Administração Pública (ENAP)"
                    >
                      <p className="text-sm">Formação de gestores públicos em logística de suprimentos, licitações sustentáveis e políticas públicas aplicadas.</p>
                    </ExperienceItem>
                  </div>

                  {/* Competências */}
                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-purple-600">Competências Técnicas Destacadas</SectionTitle>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm print:text-xs">
                      <div>
                        <strong className="block text-slate-900 print:text-black mb-1">Gestão de Projetos Internacionais</strong>
                        <p className="text-slate-600 print:text-black">Coordenação de consórcios, Equipes remotas, Compliance UE, Sistemas M&A.</p>
                      </div>
                      <div>
                        <strong className="block text-slate-900 print:text-black mb-1">Diplomacia Pública</strong>
                        <p className="text-slate-600 print:text-black">Redes de cooperação, Diálogos multinível, Mediação público-privada.</p>
                      </div>
                      <div>
                        <strong className="block text-slate-900 print:text-black mb-1">Desenvolvimento Territorial</strong>
                        <p className="text-slate-600 print:text-black">Diagnósticos participativos, ODS/NAU, Cocriação.</p>
                      </div>
                      <div>
                        <strong className="block text-slate-900 print:text-black mb-1">Compras Públicas Sustentáveis</strong>
                        <p className="text-slate-600 print:text-black">Leis 8.666/14.133, Pregão eletrônico, Inclusão produtiva.</p>
                      </div>
                    </div>
                  </div>

                  {/* Produção Técnica */}
                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-purple-600">Produção Técnica e Publicações (Seleção)</SectionTitle>
                    <div className="space-y-2">
                      <PublicationItem title="Compras governamentais com a aplicação dos benefícios para as micro e pequenas empresas" publisher="Sebrae, 2009" />
                      <PublicationItem title="Compras governamentais: como vender para a administração pública sem risco" publisher="SEBRAE, 2009" />
                      <PublicationItem title="Tecnologia e Modernização Administrativa" publisher="CNM, 2008" />
                      <PublicationItem title="Atuação Internacional Municipal" publisher="CNM, 2008" />
                    </div>
                  </div>

                  {/* Idiomas e Apresentações */}
                  <div className="grid md:grid-cols-2 gap-8 print:break-inside-avoid">
                    <div>
                      <h3 className="font-bold text-[#1E3A8A] text-lg print:text-black mb-3">Idiomas</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="print:text-black">Português</span> <span className="font-semibold text-slate-900 print:text-black">Nativo</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="print:text-black">Espanhol</span> <span className="font-semibold text-slate-900 print:text-black">Fluente</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="print:text-black">Inglês</span> <span className="font-semibold text-slate-900 print:text-black">Intermediário</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E3A8A] text-lg print:text-black mb-3">Apresentações (Seleção)</h3>
                      <ul className="text-sm list-disc pl-5 space-y-1 text-slate-700 print:text-black">
                        <li>Smart City Expo World Congress (Barcelona, 2022)</li>
                        <li>EU-Latin America & Caribbean Forum (Bruxelas, 2023)</li>
                        <li>First Global Meeting of Partners (Bruxelas, 2023)</li>
                        <li>Lisbon Information Society Forum (Portugal, 2003)</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Galeria e Media (Ocultos na Impressão) */}
          <div className="no-print">
            {/* Citation Box */}
            <div className="reading-column mb-16">
              <CitationBox
                author="ZANIN, Luís Maurício Junqueira"
                title={`Currículo: ${activeTab === 'compras' ? 'Compras Governamentais' : 'Cooperação Internacional'}`}
                publisher="Maurício Zanin Hub"
                year={new Date().getFullYear().toString()}
                url="https://mauriciozanin.com.br/sobre"
                type="biografia"
              />
            </div>

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
    <h2 className="text-xl font-bold text-[#0F172A] mb-4 tracking-tight flex items-center gap-3 print:mb-2 print:text-lg print:border-b print:border-black print:pb-1">
      <span className={cn("w-8 h-1 rounded-full block print:bg-black", color)}></span>
      <span className="print:text-black">{children}</span>
    </h2>
  );
}

function ExperienceItem({ role, org, children }: { role: string, org: string, children?: React.ReactNode }) {
  return (
    <div className="mb-6 print:mb-4">
      <h3 className="font-bold text-[#1E3A8A] text-lg print:text-black leading-tight print:text-base">{role}</h3>
      <div className="text-slate-600 font-medium mb-2 print:text-black print:text-sm print:italic">{org}</div>
      <div className="text-slate-700 leading-relaxed text-sm print:text-black print:text-xs print:leading-normal">
        {children}
      </div>
    </div>
  );
}

function PublicationItem({ title, publisher }: { title: string, publisher: string }) {
  return (
    <div className="mb-2 print:mb-1">
      <p className="font-bold text-slate-800 text-sm print:text-black print:text-xs">{title}</p>
      <p className="text-xs text-slate-500 print:text-black print:text-[10px]">{publisher}</p>
    </div>
  )
}
