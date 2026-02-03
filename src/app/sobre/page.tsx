"use client";

import { useState, useEffect } from "react";
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

  // Atualiza o título da página para que o cabeçalho da impressão fique correto
  useEffect(() => {
    document.title = `Sobre | ${currentBio.name} - ${currentBio.title}`;
  }, [currentBio]);

  return (
    <>
      <JsonLd type="person" />
      <div className="min-h-screen bg-white py-16 print:py-0 print:m-0">
        <div className="container-fluid print:p-0 print:max-w-none">

          {/* Controls (No Print) */}
          <div className="no-print flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6 print:hidden">
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

          {/* Header Section (Magazine Style) */}
          <div className="mb-12 print:mb-6 flex flex-col md:flex-row gap-8 md:gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Foto Profissional (Magazine Cover Style) */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 relative group">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-500 bg-white border-4 border-white/50 ring-1 ring-slate-900/5">
                <img
                  src={professionalPhotos[0]?.src || "/images/avatar-placeholder.jpg"}
                  alt="Maurício Zanin"
                  className="object-cover w-full h-full scale-105 group-hover:scale-100 transition-transform duration-700"
                />
              </div>
              {/* Decorative Element */}
              <div className="absolute -z-10 top-4 -right-4 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl blur-xl" />
            </div>

            <div className="flex-grow pt-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] mb-4 tracking-tighter print:text-2xl print:mb-1 leading-[1.1]">
                {currentBio.name}
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 mb-6 rounded-full" />

              <p className="text-xl md:text-2xl text-[#64748B] print:text-black font-semibold print:text-lg mb-8 leading-snug">
                {currentBio.title}
              </p>

              {/* Summary */}
              <div className="text-slate-600 text-lg leading-relaxed text-justify print:text-sm print:leading-normal border-l-4 border-slate-200 pl-6">
                {currentBio.summary.split('\n').map((paragraph, index) => (
                  paragraph.trim() && <p key={index} className="mb-3 last:mb-0">{paragraph.trim()}</p>
                ))}
              </div>
            </div>
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
                <Mail className="w-3 h-3" /> mauriciozanin@gmail.com
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
                    <SectionTitle color="bg-purple-600">Experiência Internacional em Cooperação e Diplomacia Pública</SectionTitle>

                    <ExperienceItem
                      role="Coordenador Geral - Projeto InovaJuntos (2019-2024)"
                      org="Confederação Nacional de Municípios (CNM) | Financiamento: União Europeia"
                    >
                      <p className="mb-3 italic">Coordenei durante 4 anos um dos maiores projetos de cooperação descentralizada entre Brasil, Portugal e América Latina, envolvendo 19 municípios brasileiros, 12 municípios portugueses e 15 municípios latino-americanos.</p>

                      <h4 className="font-semibold text-sm uppercase text-slate-500 mb-2 print:text-black">Principais Responsabilidades e Resultados:</h4>
                      <ul className="list-disc pl-5 space-y-2 text-sm mb-4">
                        <li><strong>Gestão de Consórcio Internacional:</strong> Articulação entre CNM (Brasil) e Centro de Estudos Sociais da Universidade de Coimbra (Portugal), garantindo coerência metodológica, cumprimento de marcos contratuais e governança multinível.</li>
                        <li><strong>Coordenação de Equipes Multiculturais:</strong> Liderança de equipes técnicas distribuídas em 3 continentes, assegurando alinhamento estratégico, padronização de processos e integração operacional.</li>
                        <li><strong>Diplomacia Pública e Articulação Institucional:</strong> Promoção de diálogo contínuo entre governos locais, nacionais e organismos multilaterais, incluindo participação em eventos da União Europeia, ONU-Habitat e encontros ministeriais, com representantes de agentes de cooperação e articulação do SubGrupo 18 do Mercosul.</li>
                        <li><strong>Implementação de Agendas Globais:</strong> Incorporação dos ODS e da Nova Agenda Urbana em políticas locais através de diagnósticos vocacionais participativos, capacitações técnicas e criação de espaços de inovação municipal.</li>
                        <li><strong>Monitoramento e Avaliação:</strong> Gestão de logframe, indicadores de impacto e sistema OPSYS da UE, com aprovação em auditorias independentes (ROM - Results-Oriented Monitoring).</li>
                        <li><strong>Transferência de Tecnologia e Conhecimento:</strong> Realização de 4 missões técnicas internacionais, 7 capacitações presenciais, mais de 100 encontros virtuais e publicação de 3 volumes de boas práticas.</li>
                        <li><strong>Construção de Acordos de Cooperação:</strong> Facilitação de 43 termos de intenção e múltiplos acordos bilaterais de cooperação técnica entre municípios de diferentes países.</li>
                      </ul>

                      <h4 className="font-semibold text-sm uppercase text-slate-500 mb-2 print:text-black">Impactos Mensuráveis:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 print:bg-white print:border-none print:p-0">
                        <li>18 espaços de inovação constituídos e equipados</li>
                        <li>19 diagnósticos vocacionais participativos realizados</li>
                        <li>Mais de 200 boas práticas documentadas e disponibilizadas</li>
                        <li>Criação da Rede InovaJuntos para sustentabilidade pós-projeto</li>
                        <li>Reconhecimento internacional como modelo de cooperação descentralizada</li>
                      </ul>
                    </ExperienceItem>

                    <ExperienceItem
                      role="Consultor Internacional em Governança e Compras Públicas"
                      org="Organismos Multilaterais e Cooperação Técnica Internacional (2002-2024)"
                    >
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        <li><strong>Portugal:</strong> Consultoria à Presidência do Conselho de Ministros para validação do Plano Nacional de Compras Eletrônicas (PNCE) e implantação de sistemas de compras governamentais junto à UMIC.</li>
                        <li><strong>América Latina:</strong> Missões técnicas em El Salvador, Guatemala, México, Chile e Bolívia para implementação de sistemas de compras governamentais e transferência de conhecimento brasileiro.</li>
                        <li><strong>Europa:</strong> Participação como orador em fóruns da União Europeia, incluindo Lisbon Information Society Forum, Smart City Expo Barcelona e EU-Latin America & Caribbean Forum.</li>
                        <li><strong>Organismos Internacionais:</strong> Colaboração com Organização dos Estados Americanos (OEA), Banco Interamericano de Desenvolvimento (BID) e Programa das Nações Unidas para o Desenvolvimento (PNUD).</li>
                      </ul>
                    </ExperienceItem>
                  </div>

                  {/* Experiência Governança */}
                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-purple-600">Experiência em Governança, Compliance e Políticas Públicas</SectionTitle>

                    <ExperienceItem
                      role="Diretor de Projetos - Confederação Nacional de Municípios (2006-2025)"
                      org="Gestão de Projetos Tecnológicos e Fortalecimento Institucional"
                    >
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        <li>Desenvolvimento e coordenação de projetos estratégicos de modernização administrativa municipal. Apresentador do programa da TV CNM - Bate Papo com a CNM. Criador e organizador da Rede de Agentes Municipalistas.</li>
                        <li>Articulação com Presidência da República, Ministérios e Itamaraty em ações de cooperação Internacional. Representante do SubGrupo 18 do Mercosul para definição de políticas de Integração Transfronteiriça e discussão do impacto do Acordo de Mercado Comum Brasil-União Europeia.</li>
                        <li>Atuação com órgãos de controle, tribunais de contas e ministérios públicos para garantir conformidade e transparência de ações para Municípios.</li>
                        <li>Elaboração de Cartilhas, estudos técnicos e material de qualificação de equipes multidisciplinares. Articulação e Participação da Elaboração dos eventos Marcha a Brasília em Defesa dos Municípios.</li>
                        <li>Criação de políticas públicas multisetoriais de integridade e governança em municípios de diferentes portes.</li>
                      </ul>
                    </ExperienceItem>

                    <ExperienceItem

                      role="Consultor SEBRAE Nacional (2006-2026)"
                      org="Unidade de Políticas Públicas - Estratégia Nacional de Compras Governamentais"
                    >
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        <li>Desenho da Política Nacional de Compras Públicas do SEBRAE e distribuição de metodologias para todos os SEBRAEs estaduais. Atuação em conjunto com a Unidade De Desenvolvimento Territorial.</li>
                        <li>Elaboração de programas estaduais de compras governamentais.</li>
                        <li>Criação de cursos oficiais para compradores públicos e fornecedores, com foco em desenvolvimento local e inclusão de micro e pequenas empresas. Consultor técnico do das melhorias do portal Compras.gov.br e do Portal Nacional de Contratações Públicas - PNCP</li>
                        <li>Capacitação de multiplicadores em compras governamentais em todos estados brasileiros.</li>
                      </ul>
                    </ExperienceItem>

                    <ExperienceItem
                      role="Instrutor e Conteudista - Escola Nacional de Administração Pública (ENAP)"
                      org="Cursos de Sistemas Eletrônicos de Compras e Programa Brasil Municípios (2005-2013)"
                    >
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        <li>Desenvolvimento de conteúdo técnico sobre evolução das compras governamentais no Brasil e no mundo.</li>
                        <li>Formação de gestores públicos em logística de suprimentos, licitações sustentáveis e políticas públicas aplicadas.</li>
                        <li>Parceria com Banco Interamericano de Desenvolvimento (BID) para programa de capacitação municipal.</li>
                      </ul>
                    </ExperienceItem>
                  </div>

                  {/* Competências */}
                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-purple-600">Competências Técnicas Destacadas</SectionTitle>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm print:text-xs">
                      <div>
                        <strong className="block text-slate-900 print:text-black mb-2 text-base">Gestão de Projetos Internacionais</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 print:text-black">
                          <li>Coordenação de consórcios multinacionais</li>
                          <li>Gestão de equipes remotas e multiculturais</li>
                          <li>Monitoramento de logframe e sistemas de M&A</li>
                          <li>Compliance com normas da União Europeia</li>
                          <li>Elaboração de relatórios técnicos e financeiros</li>
                          <li>Relacionamento com auditores e avaliadores independentes</li>
                        </ul>
                      </div>
                      <div>
                        <strong className="block text-slate-900 print:text-black mb-2 text-base">Diplomacia Pública e Articulação Institucional</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 print:text-black">
                          <li>Construção de redes de cooperação internacional</li>
                          <li>Facilitação de diálogos multinível (local-nacional-internacional)</li>
                          <li>Mediação entre atores públicos, privados e sociedade civil</li>
                          <li>Representação institucional em fóruns internacionais</li>
                          <li>Negociação de acordos de cooperação técnica</li>
                        </ul>
                      </div>
                      <div>
                        <strong className="block text-slate-900 print:text-black mb-2 text-base">Desenvolvimento Territorial e Inovação</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 print:text-black">
                          <li>Diagnósticos participativos e planejamento estratégico local</li>
                          <li>Implementação de agendas globais (ODS, NAU)</li>
                          <li>Metodologias de cocriação e participação cidadã</li>
                          <li>Transferência de tecnologia e boas práticas</li>
                          <li>Criação de observatórios e plataformas de conhecimento</li>
                        </ul>
                      </div>
                      <div>
                        <strong className="block text-slate-900 print:text-black mb-2 text-base">Compras Públicas Sustentáveis</strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 print:text-black">
                          <li>Especialista em Lei 8.666/93, Lei 10.520/02 e Lei 14.133/21</li>
                          <li>Pregão eletrônico e sistemas de compras governamentais</li>
                          <li>Inclusão produtiva e desenvolvimento local via compras públicas</li>
                          <li>Compliance e integridade em licitações</li>
                          <li>Formação de gestores e capacitação técnica</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Produção Técnica */}
                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-purple-600">Produção Técnica e Publicações Relevantes</SectionTitle>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2 tex-sm print:text-black">Livros e Manuais (Seleção)</h4>
                        <div className="space-y-2">
                          <PublicationItem
                            title="Relatório Técnico Final - Projeto InovaJuntos (2019-2024)"
                            publisher="Brasília: CNM, União Europeia, 2025. (Documento Oficial Assinado)"
                            url="/inovajuntos/relatorio-final/RelatorioTecnicoFinalInovajuntos-MenorResolucao_assinado.pdf"
                            highlight={true}
                          />
                          <PublicationItem title="Compras governamentais com a aplicação dos benefícios para as micro e pequenas empresas: guia do educador" publisher="Brasília: Sebrae, 2009, 368 p." />
                          <PublicationItem title="Compras governamentais: como vender para a administração pública sem risco: guia do educador" publisher="Brasília: SEBRAE, 2009. 308 p. (em coautoria com Noelma Silva)" />
                          <PublicationItem title="Tecnologia e Modernização Administrativa: do Governo Eletrônico à Governança Conectada" publisher="Brasília: CNM, 2008, 104 p." />
                          <PublicationItem title="Cartilha do Fornecedor: Compras públicas governamentais: seu novo canal de negócios" publisher="Brasília: CNM, Sebrae, 2008 (em coautoria com Cláudio Pereira Barreto)" />
                          <PublicationItem title="Atuação Internacional Municipal: Estratégias para Gestores Municipais Projetarem Mundialmente sua Cidade" publisher="Brasília: CNM, 2008, 128 p." />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2 tex-sm print:text-black">Outras Publicações</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 print:text-black">
                          <li>Múltiplas apostilas e materiais didáticos para ENAP, SEBRAE e CNM</li>
                          <li>Artigos técnicos sobre compras governamentais e modernização administrativa</li>
                          <li>Coletâneas sobre Objetivos de Desenvolvimento do Milênio (ODM) e políticas municipais</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Experiência em Comunicação */}
                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-purple-600">Experiência em Comunicação e Disseminação</SectionTitle>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-[#1E3A8A] text-lg print:text-black mb-2">Apresentações Internacionais (Seleção)</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 print:text-black">
                          <li>IV Encontro Iberoamericano de Cidades Digitais (México, 2003)</li>
                          <li>Microsoft Leaders Summit (Seattle, EUA, 2003)</li>
                          <li>Lisbon Information Society Forum (Portugal, 2003)</li>
                          <li>OEA - Fórum de Melhores Práticas (videoconferência pan-americana, 2004)</li>
                          <li>Smart City Expo World Congress (Barcelona, 2022)</li>
                          <li>First Global Meeting of Partners (Bruxelas, 2023)</li>
                          <li>EU-Latin America & Caribbean Forum (Bruxelas, 2023)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1E3A8A] text-lg print:text-black mb-2">Capacitação e Formação</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 print:text-black">
                          <li>Mais de 100 seminários e capacitações presenciais realizados em 17 estados brasileiros</li>
                          <li>Treinamentos internacionais em Guatemala, El Salvador, México e Portugal</li>
                          <li>Desenvolvimento de metodologias pedagógicas inovadoras (jogos de licitação, workshops participativos)</li>
                          <li>Criação de plataformas de ensino à distância e conteúdos multimídia</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="print:break-inside-avoid">
                    <SectionTitle color="bg-purple-600">Diferenciais para Projetos de Diplomacia Pública da UE</SectionTitle>
                    <div className="grid md:grid-cols-2 gap-3">
                      <CheckItem>Experiência comprovada em coordenação de projetos financiados pela UE com múltiplos parceiros internacionais</CheckItem>
                      <CheckItem>Capacidade de articulação entre diferentes níveis de governo e culturas organizacionais</CheckItem>
                      <CheckItem>Expertise em governança multinível e cooperação descentralizada</CheckItem>
                      <CheckItem>Histórico de compliance com sistemas de monitoramento e auditoria da UE</CheckItem>
                      <CheckItem>Habilidade para traduzir objetivos estratégicos em resultados operacionais mensuráveis</CheckItem>
                      <CheckItem>Experiência em gestão de equipes remotas e coordenação de consórcios internacionais</CheckItem>
                      <CheckItem>Conhecimento profundo das realidades administrativa, política e cultural de Brasil, Portugal e América Latina</CheckItem>
                      <CheckItem>Rede consolidada de contatos institucionais em organismos multilaterais e governos locais</CheckItem>
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

function PublicationItem({ title, publisher, url, highlight }: { title: string, publisher: string, url?: string, highlight?: boolean }) {
  return (
    <div className={cn(
      "mb-2 print:mb-1",
      highlight && "bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-md my-4 shadow-sm print:border-black print:bg-transparent print:p-0 print:border-l-0 print:my-1"
    )}>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="group block">
          <p className={cn(
            "font-bold text-slate-800 text-sm print:text-black print:text-xs transition-colors flex items-center gap-1",
            !highlight && "group-hover:text-blue-700",
            highlight && "text-slate-900 text-base"
          )}>
            {title}
            {highlight && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 print:hidden">
                DESTAQUE 2025
              </span>
            )}
            <span className={cn(
              "text-[10px] px-1 rounded border print:hidden opacity-0 group-hover:opacity-100 transition-opacity",
              highlight ? "text-amber-700 bg-amber-100 border-amber-200" : "text-blue-600 bg-blue-50 border-blue-100"
            )}>PDF</span>
          </p>
          <p className="text-xs text-slate-500 print:text-black print:text-[10px] group-hover:text-slate-700">{publisher}</p>
        </a>
      ) : (
        <>
          <p className="font-bold text-slate-800 text-sm print:text-black print:text-xs">{title}</p>
          <p className="text-xs text-slate-500 print:text-black print:text-[10px]">{publisher}</p>
        </>
      )}
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


