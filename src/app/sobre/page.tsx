"use client";

import { motion } from "framer-motion";
import { CitationBox } from "@/components/citation/CitationBox";
import { YouTubePlaylist } from "@/components/youtube/YouTubePlaylist";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProfessionalGallery } from "@/components/gallery/ProfessionalGallery";
import { professionalPhotos } from "@/data/professional-photos";

const biography = {
  name: "Luís Maurício Junqueira Zanin",
  title: "Estrategista de Compras Públicas",
  content: `
    Luís Maurício Junqueira Zanin é reconhecido como uma das principais autoridades brasileiras em compras governamentais focada na inclusão de Micro e Pequenas Empresas nas contratações públicas para a promoção do desenvolvimento nacional sustentável, cooperação intermunicipal  e internacional para compartilhamento e boas práticas   e gestão pública. Com mais de 25 anos de experiência dedicados à transformação da administração pública, combina expertise técnica com visão estratégica para resultados transformadores. A Primeira interação com o Compras.gov.br teve inicio  no ano 2000 no lançamento do portal. 

    Sua trajetória profissional é marcada pela liderança em projetos de grande impacto nacional e internacional. Como  Coordenador do Projeto Inovajuntos e fundador da Rede Inovajuntos, consolidou a maior rede de inovação municipal do Brasil, conectando mais de 200 municípios em uma plataforma de compartilhamento de conhecimento e boas práticas em gestão pública.

    Especialista em conformidade legal e implementação de novas legislações, Maurício Zanin tem sido referência na adaptação de municípios à Lei 14.133/2021, a nova lei de licitações e contratos administrativos. Sua abordagem combina rigor técnico com pragmatismo, facilitando a transição de gestores públicos para os novos paradigmas legais.

    No âmbito internacional, atua como consultor de organismos multilaterais, incluindo a União Europeia e agências das Nações Unidas, desenvolvendo projetos de cooperação técnica em compras públicas sustentáveis e governança. Sua expertise transcende fronteiras, contribuindo para o fortalecimento de sistemas de compras públicas em diversos países.

    Como autor e educador, produziu dezenas de publicações técnicas, cartilhas e materiais didáticos que se tornaram referência para gestores públicos. Suas obras abordam desde aspectos práticos de processos licitatórios até estratégias avançadas de cooperação intermunicipal e consórcios públicos.

    A atuação em mídia, especialmente através de programas da Confederação Nacional de Municípios (CNM), amplificou seu alcance, permitindo que milhares de gestores públicos tenham acesso a conhecimento especializado sobre compras governamentais e gestão municipal.

    Sua visão estratégica e capacidade de articulação transformaram a Rede Inovajuntos em um case de sucesso, demonstrando como a cooperação intermunicipal pode gerar resultados concretos em eficiência, economia e qualidade na gestão pública brasileira.
  `,
};

export default function SobrePage() {
  return (
    <>
      <JsonLd type="person" />
      <div className="min-h-screen bg-white py-16">
        <div className="container-fluid">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
              {biography.name}
            </h1>
            <p className="text-fluid-lg text-[#64748B]">
              {biography.title}
            </p>
          </motion.div>

          {/* Mini Currículo */}
          <div className="reading-column mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#1E3A8A]/5 to-transparent border-l-4 border-[#1E3A8A] p-6 rounded-r-lg"
            >
              <h2 className="text-fluid-xl font-bold text-[#0F172A] mb-4 tracking-tight">
                Formação e Atuação
              </h2>
              <div className="space-y-4 text-fluid-base text-[#0F172A] leading-[1.8]">
                <div>
                  <p className="font-semibold text-[#1E3A8A] mb-2">Formação Acadêmica</p>
                  <p>
                    Formado em <strong>Administração Pública</strong> pela{" "}
                    <strong>Universidade Estadual Paulista – Unesp</strong> e pós-graduado com{" "}
                    <strong>MBA em Políticas Públicas</strong> pela{" "}
                    <strong>Fundação Getúlio Vargas – FGV</strong>.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[#1E3A8A] mb-2">Atuação Profissional</p>
                  <p>
                    É autor da estratégia e dos conteúdos de compras governamentais do{" "}
                    <strong>Sebrae Nacional</strong>. Atua como consultor de Compras Governamentais
                    junto ao Sebrae no <strong>Ministério da Gestão, Inovação e Governo Digital</strong>{" "}
                    na elaboração e evolução dos portais <strong>Compras.gov.br</strong> e{" "}
                    <strong>PNCP</strong>.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[#1E3A8A] mb-2">Relacionamento com Órgãos de Controle, Municípios e Poderes Públicos</p>
                  <p>
                    Realiza as ações junto aos órgãos de controle como{" "}
                    <strong>Tribunais de Contas</strong>, <strong>Atricon</strong>,{" "}
                    <strong>Ministério Público</strong>, <strong>AGU</strong> e{" "}
                    <strong>procuradorias</strong>  incentivando políticas de governança e melhoria da Getão Pública bem como atua com e demais clientes na promoção desenvolvimento de políticas públicas municipais para a promoção do desenvolvimento econômico local e regional assim como atua na estruturação pragmática de obtenção dos ODS em municípios e na implementação da Nova Agenda Urbana - NAU
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Galeria de Fotos Profissionais */}
          <div className="reading-column mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <ProfessionalGallery photos={professionalPhotos} autoPlayInterval={5000} />
            </motion.div>
          </div>

          {/* Biografia - Coluna de Leitura */}
          <div className="reading-column mb-16">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="prose prose-lg max-w-none"
            >
              <div className="text-serif text-fluid-base text-[#0F172A] leading-[1.9] whitespace-pre-line">
                {biography.content.trim()}
              </div>
            </motion.article>
          </div>

          {/* Citation Box */}
          <div className="reading-column mb-16">
            <CitationBox
              author="ZANIN, Luís Maurício Junqueira"
              title="Biografia e Trajetória Profissional"
              publisher="Maurício Zanin"
              year={new Date().getFullYear().toString()}
              url="https://mauriciozanin.com.br/sobre"
              type="biografia"
            />
          </div>

          {/* Histórico de Media */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-fluid-2xl font-bold text-[#0F172A] mb-4 tracking-tight text-center">
                Histórico de Media
              </h2>
              <p className="text-fluid-base text-[#64748B] text-center max-w-2xl mx-auto leading-[1.7]">
                Vídeos, entrevistas e programas sobre compras públicas, governança
                e cooperação intermunicipal produzidos para a CNM e projetos Inovajuntos.
              </p>
            </motion.div>

            <YouTubePlaylist maxVideos={12} />
          </div>
        </div>
      </div>
    </>
  );
}
