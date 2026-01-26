"use client";

import { motion } from "framer-motion";
import { MultimediaTimeline } from "@/components/timeline/MultimediaTimeline";
import { YouTubePlaylist } from "@/components/youtube/YouTubePlaylist";
import { JsonLd } from "@/components/seo/JsonLd";

// Função para limpar URLs do formato markdown
function cleanUrl(url?: string): string | undefined {
  if (!url) return undefined;
  // Remove markdown links [texto](url) e retorna apenas a URL
  const markdownMatch = url.match(/\[.*?\]\((.*?)\)/);
  if (markdownMatch) return markdownMatch[1];
  // Remove links do Google Search
  if (url.includes("google.com/search")) return undefined;
  return url;
}

// Função para limpar URLs do formato markdown
function cleanUrl(url?: string): string | undefined {
  if (!url) return undefined;
  // Remove markdown links [texto](url) e retorna apenas a URL
  const markdownMatch = url.match(/\[.*?\]\((.*?)\)/);
  if (markdownMatch) return markdownMatch[1];
  return url;
}

// Eventos extraídos dos relatórios do InovaJuntos (2020-2024)
const mockEvents = [
  // Eventos de 2020 (do relatório processado)
  {
    id: "inovajuntos-2020-43",
    date: "2020-12-17",
    title: "Seminário: Os papéis dos diferentes atores na consolidação da Agenda 2030",
    description:
      "O Coordenador do Projeto, Maurício Zanin, palestrou no seminário de lançamento do livro organizado pelo Município de Birigui e divulgou o Projeto no evento.",
    type: "PROJECT" as const,
    category: "Inovajuntos",
    location: "Online",
  },
  {
    id: "inovajuntos-2020-42",
    date: "2020-12-16",
    title: "Publicação de Notícia: Município de Birigui (SP) e Agenda 2030",
    description:
      "Publicada notícia sobre o lançamento do livro de Birigui com práticas municipais relacionadas aos ODS. O InovaJuntos foi divulgado como oportunidade para implementação de ações voltadas aos ODS.",
    type: "NEWS" as const,
    category: "Inovajuntos",
    url: cleanUrl("https://www.cnm.org.br/comunicacao/noticias/municipio-de-birigui-sp-publica-livro-com-praticas-municipais-relacionadas-aos-ods-cnm-acompanha"),
  },
  {
    id: "inovajuntos-2020-40",
    date: "2020-12-04",
    title: "Bate-papo CNM – Projeto InovaJuntos: Oportunidade de Cooperação Internacional",
    description:
      "Debate sobre o projeto e informações sobre o processo seletivo com participação da Delegação Europeia e equipe técnica. A transmissão menciona o projeto a partir do minuto 10:17.",
    type: "VIDEO" as const,
    category: "Cooperação Internacional",
    url: cleanUrl("https://www.youtube.com/watch?v=k4x0CMj6E-M&t=147s"),
    duration: 0,
  },
  {
    id: "inovajuntos-2020-39",
    date: "2020-12-03",
    title: "Reunião Prévia ao Bate-Papo CNM",
    description:
      "Reunião de alinhamento com a Delegação da União Europeia no Brasil (Ministra Ana Beatriz Martins e Maria Cristina) para organização do evento de divulgação do projeto.",
    type: "PROJECT" as const,
    category: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-37",
    date: "2020-11-26",
    title: "Playlist do Projeto na TV Portal CNM",
    description:
      "Criação de playlist para divulgação detalhada do projeto, incluindo etapas de seleção, prazos do edital, temas transversais e instruções de preenchimento de formulário.",
    type: "VIDEO" as const,
    category: "Inovajuntos",
    url: cleanUrl("https://www.youtube.com/playlist?list=PLCBz2B8D9g569pAY9JBPhu3q77zVdSCZN"),
  },
  {
    id: "inovajuntos-2020-38",
    date: "2020-11-23",
    title: "Divulgação no Saudações Municipalistas",
    description:
      "Série de seminários para novos gestores municipais dividida por regiões (Nordeste, Centro-Oeste, Norte, Sudeste e Sul) apresentando o projeto InovaJuntos entre 23 e 30 de novembro.",
    type: "PROJECT" as const,
    category: "CNM",
  },
  {
    id: "inovajuntos-2020-36",
    date: "2020-11-20",
    title: "Notícia: Desafios da gestão local em tempo de pandemia (BRICS)",
    description:
      "Publicação sobre a apresentação da CNM em evento dos BRICS abordando desafios municipais, com menção ao contexto do projeto.",
    type: "NEWS" as const,
    category: "CNM",
    url: cleanUrl("https://www.cnm.org.br/comunicacao/noticias/cnm-apresenta-desafios-da-gestion-local-em-tempo-de-pandemia-durante-evento-dos-brics"),
  },
  {
    id: "inovajuntos-2020-32",
    date: "2020-11-18",
    title: "Lançamento do Edital InovaJuntos e Comunicação UE",
    description:
      "Lançamento oficial do edital e envio de comunicado formal à União Europeia detalhando os canais de inscrição para municípios brasileiros e portugueses.",
    type: "PROJECT" as const,
    category: "Inovajuntos",
    url: cleanUrl("http://inovajuntos.cnm.org.br/edital/"),
  },
  {
    id: "inovajuntos-2020-31",
    date: "2020-11-13",
    title: "Notícia: Bate-Papo práticas municipais inspiradoras em moradia",
    description:
      "Publicação de notícia sobre o Bate-Papo da CNM que trouxe projetos voltados para inovação em moradia e práticas inspiradoras.",
    type: "NEWS" as const,
    category: "CNM",
  },
  {
    id: "inovajuntos-2020-29",
    date: "2020-11-01",
    title: "Revista CNM - Nós Somos Municípios",
    description:
      "Divulgação do Projeto InovaJuntos no boletim/revista da CNM do mês de novembro para representatividade e força do ente local.",
    type: "PUBLICATION" as const,
    category: "CNM",
    url: "Revista_CNM_nov2020_.pdf",
  },
  {
    id: "inovajuntos-2020-28",
    date: "2020-10-31",
    title: "Vídeo: Prazos do Edital InovaJuntos",
    description:
      "Vídeo explicativo detalhando o cronograma e os prazos estabelecidos no edital de seleção do projeto.",
    type: "VIDEO" as const,
    category: "Inovajuntos",
    url: cleanUrl("https://youtu.be/SbYwC4eNEiY?si=ihg2dODs5ADi4ohq"),
  },
  {
    id: "inovajuntos-2020-25",
    date: "2020-10-31",
    title: "Vídeo: Temas Transversais InovaJuntos",
    description:
      "Orientações em vídeo sobre os temas transversais que permeiam o projeto e devem ser observados pelos municípios participantes.",
    type: "VIDEO" as const,
    category: "Inovajuntos",
    url: cleanUrl("https://youtu.be/zI6uCYRje08?si=amuBAzkjYBPbODnw"),
  },
  {
    id: "inovajuntos-2020-23",
    date: "2020-10-31",
    title: "Vídeo: Conheça o InovaJuntos",
    description:
      "Apresentação audiovisual do projeto detalhando seus objetivos de cooperação e inovação para o desenvolvimento local.",
    type: "VIDEO" as const,
    category: "Inovajuntos",
    url: cleanUrl("https://youtu.be/wFptxQHeyNg?si=arN7W2WOn8Hi11VR"),
  },
  {
    id: "inovajuntos-2020-01",
    date: "2020-10-19",
    title: "Reunião InovaJuntos - Formulário e Critérios",
    description:
      "Reunião entre CNM e CES para definição do formulário de seleção dos participantes e critérios técnicos de avaliação.",
    type: "PROJECT" as const,
    category: "Inovajuntos",
    url: cleanUrl("https://youtu.be/4kxqGs7Y1og"),
  },
  {
    id: "inovajuntos-2020-relatorio",
    date: "2020-12-31",
    title: "Relatório de Ações - InovaJuntos 2020",
    description:
      "Relatório anual consolidando todas as reuniões de monitoramento, lançamento de edital e ações de divulgação do primeiro ano do projeto.",
    type: "DOC" as const,
    category: "Inovajuntos",
  },
  {
    id: "1",
    date: "2024-03-15",
    title: "Workshop Internacional: Compras Públicas Sustentáveis",
    description:
      "Participação como palestrante no workshop sobre compras públicas sustentáveis em parceria com a União Europeia.",
    type: "VIDEO" as const,
    category: "Cooperação Internacional",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Exemplo - substituir por vídeo real
    duration: 3600, // 1 hora
  },
  {
    id: "2",
    date: "2023-11-20",
    title: "Programa CNM: Nova Lei de Licitações",
    description:
      "Entrevista sobre os impactos da Lei 14.133/2021 para os municípios brasileiros.",
    type: "VIDEO" as const,
    category: "CNM",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: 1800, // 30 minutos
  },
  {
    id: "3",
    date: "2023-08-10",
    title: "Lançamento da Rede Inovajuntos",
    description:
      "Evento de lançamento da Rede Inovajuntos, projeto internacional de cooperação entre municípios.",
    type: "PROJECT" as const,
    category: "Inovajuntos",
    location: "São Paulo, Brasil",
  },
  {
    id: "4",
    date: "2022-06-15",
    title: "Cartilha: Governança em Municípios de Pequeno Porte",
    description:
      "Publicação sobre estratégias de governança para municípios com menos de 50 mil habitantes.",
    type: "PUBLICATION" as const,
    category: "Sebrae",
    url: "https://example.com/cartilha-governanca",
  },
  {
    id: "5",
    date: "2021-12-01",
    title: "Artigo: A Nova Lei de Licitações e seus Impactos",
    description:
      "Análise técnica sobre a Lei 14.133/2021 e seus principais impactos na gestão de compras públicas.",
    type: "PUBLICATION" as const,
    category: "Artigo Técnico",
    url: "https://example.com/nova-lei-licitacoes",
  },
  {
    id: "6",
    date: "2020-05-20",
    title: "Programa CNM: Cooperação Intermunicipal",
    description:
      "Série de programas sobre cooperação intermunicipal e consórcios públicos.",
    type: "VIDEO" as const,
    category: "CNM",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: 2700, // 45 minutos
  },
  {
    id: "7",
    date: "2019-09-10",
    title: "Projeto de Cooperação UE-Brasil",
    description:
      "Início do projeto de cooperação entre União Europeia e Brasil em compras públicas.",
    type: "PROJECT" as const,
    category: "Cooperação Internacional",
    location: "Bruxelas, Bélgica",
  },
  {
    id: "8",
    date: "2018-03-15",
    title: "Primeira Cartilha Sebrae sobre Compras Públicas",
    description:
      "Lançamento da primeira cartilha em parceria com o Sebrae sobre compras públicas para pequenos negócios.",
    type: "PUBLICATION" as const,
    category: "Sebrae",
    url: "https://example.com/primeira-cartilha",
  },
];

export default function TrajetoriaPage() {
  return (
    <>
      <JsonLd type="person" />
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
              Trajetória e História
            </h1>
            <p className="text-fluid-base text-[#64748B] leading-[1.7] max-w-3xl">
              Uma linha do tempo completa da trajetória profissional, incluindo
              vídeos, publicações, projetos e eventos que marcaram a evolução da
              Rede Inovajuntos e da carreira em governança pública.
            </p>
          </motion.div>

          {/* Seção de Vídeos YouTube */}
          <div className="mb-16">
            <h2 className="text-fluid-2xl font-bold text-[#0F172A] mb-6 tracking-tight">
              Vídeos CNM e Inovajuntos
            </h2>
            <YouTubePlaylist maxVideos={12} />
          </div>

          {/* Timeline Multimídia */}
          <div>
            <h2 className="text-fluid-2xl font-bold text-[#0F172A] mb-6 tracking-tight">
              Linha do Tempo Completa
            </h2>
            <MultimediaTimeline events={mockEvents} />
          </div>
        </div>
      </div>
    </>
  );
}

