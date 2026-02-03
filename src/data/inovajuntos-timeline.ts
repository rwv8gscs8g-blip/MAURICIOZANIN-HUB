export type TimelineEventType = "VIDEO" | "DOC" | "NEWS" | "PROJECT" | "PUBLICATION";
export type TimelineEventSource = "historico" | "rede";

export interface TimelineEventItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: TimelineEventType;
  category?: string;
  url?: string;
  thumbnailUrl?: string;
  duration?: number;
  location?: string;
  tags?: string[];
  source: TimelineEventSource;
  axis?:
    | "Cooperação Internacional"
    | "Inovajuntos"
    | "Compras Governamentais"
    | "Suporte a Municípios"
    | "Outros";
}

const triggers = [
  "inovajuntos",
  "rede inovajuntos",
  "inova juntos",
  "união europeia",
  "cooperação internacional",
  "cooperação descentralizada",
  "fronteiras",
  "ods",
  "atuação internacional",
];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const hasTrigger = (value: string) => {
  const normalized = normalizeText(value);
  return triggers.some((trigger) => normalized.includes(trigger));
};

export const isInovajuntosLinked = (event: TimelineEventItem) => {
  const tagText = (event.tags || []).join(" ");
  if (tagText && hasTrigger(tagText)) return true;

  const content = [event.title, event.description, event.category]
    .filter(Boolean)
    .join(" ");

  return content ? hasTrigger(content) : false;
};

import { aiTimelineEvents } from "./timeline-ai";

const sortByDateDesc = (events: TimelineEventItem[]) =>
  [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

const baseHistoricoEvents: TimelineEventItem[] = [
  {
    id: "inovajuntos-2019-12-01",
    date: "2019-12-01",
    title: "Início da execução do Projeto Inovajuntos",
    description:
      "Início oficial do projeto de cooperação internacional entre CNM, CES/Universidade de Coimbra e União Europeia.",
    type: "PROJECT",
    category: "Inovajuntos",
    tags: ["inovajuntos", "união europeia", "cooperação internacional"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2020-43",
    date: "2020-12-17",
    title: "Seminário: Os papéis dos diferentes atores na consolidação da Agenda 2030",
    description:
      "O Coordenador do Projeto, Mauricio Zanin, palestrou no seminário de lançamento do livro organizado pelo Município de Birigui e divulgou o Projeto no evento.",
    type: "PROJECT",
    category: "Inovajuntos",
    location: "Online",
    tags: ["inovajuntos", "cooperação internacional"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-42",
    date: "2020-12-16",
    title: "Publicação de Notícia: Município de Birigui (SP) e Agenda 2030",
    description:
      "Publicada notícia sobre o lançamento do livro de Birigui com práticas municipais relacionadas aos ODS. O InovaJuntos foi divulgado como oportunidade para implementação de ações voltadas aos ODS.",
    type: "NEWS",
    category: "Inovajuntos",
    url: "https://www.cnm.org.br/comunicacao/noticias/municipio-de-birigui-sp-publica-livro-com-praticas-municipais-relacionadas-aos-ods-cnm-acompanha",
    tags: ["inovajuntos", "ods"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-40",
    date: "2020-12-04",
    title: "Bate-papo CNM - Projeto InovaJuntos: Oportunidade de Cooperação Internacional",
    description:
      "Debate sobre o projeto e informações sobre o processo seletivo com participação da Delegação Europeia e equipe técnica. A transmissão menciona o projeto a partir do minuto 10:17.",
    type: "VIDEO",
    category: "Cooperação Internacional",
    url: "https://www.youtube.com/watch?v=k4x0CMj6E-M&t=147s",
    duration: 0,
    tags: ["inovajuntos", "cooperação internacional"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2020-39",
    date: "2020-12-03",
    title: "Reunião prévia ao Bate-Papo CNM",
    description:
      "Reunião de alinhamento com a Delegação da União Europeia no Brasil para organização do evento de divulgação do projeto.",
    type: "PROJECT",
    category: "Inovajuntos",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-37",
    date: "2020-11-26",
    title: "Playlist do Projeto na TV Portal CNM",
    description:
      "Criação de playlist para divulgação detalhada do projeto, incluindo etapas de seleção, prazos do edital, temas transversais e instruções de preenchimento de formulário.",
    type: "VIDEO",
    category: "Inovajuntos",
    url: "https://www.youtube.com/playlist?list=PLCBz2B8D9g569pAY9JBPhu3q77zVdSCZN",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-38",
    date: "2020-11-23",
    title: "Divulgação no Saudações Municipalistas",
    description:
      "Série de seminários para novos gestores municipais dividida por regiões apresentando o projeto InovaJuntos.",
    type: "PROJECT",
    category: "CNM",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-36",
    date: "2020-11-20",
    title: "Noticia: Desafios da gestao local em tempo de pandemia (BRICS)",
    description:
      "Publicação sobre a apresentação da CNM em evento dos BRICS abordando desafios municipais, com menção ao contexto do projeto.",
    type: "NEWS",
    category: "CNM",
    url: "https://www.cnm.org.br/comunicacao/noticias/cnm-apresenta-desafios-da-gestion-local-em-tempo-de-pandemia-durante-evento-dos-brics",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-32",
    date: "2020-11-18",
    title: "Lançamento do Edital InovaJuntos e Comunicação UE",
    description:
      "Lançamento oficial do edital e envio de comunicado formal à União Europeia detalhando os canais de inscrição para municípios brasileiros e portugueses.",
    type: "PROJECT",
    category: "Inovajuntos",
    url: "http://inovajuntos.cnm.org.br/edital/",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-31",
    date: "2020-11-13",
    title: "Notícia: Bate-Papo práticas municipais inspiradoras em moradia",
    description:
      "Publicação de notícia sobre o Bate-Papo da CNM que trouxe projetos voltados para inovação em moradia e práticas inspiradoras.",
    type: "NEWS",
    category: "CNM",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-29",
    date: "2020-11-01",
    title: "Revista CNM - Nós Somos Municípios",
    description:
      "Divulgação do Projeto InovaJuntos no boletim/revista da CNM do mês de novembro para representatividade e força do ente local.",
    type: "PUBLICATION",
    category: "CNM",
    url: "Revista_CNM_nov2020_.pdf",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-28",
    date: "2020-10-31",
    title: "Vídeo: Prazos do Edital InovaJuntos",
    description:
      "Vídeo explicativo detalhando o cronograma e os prazos estabelecidos no edital de seleção do projeto.",
    type: "VIDEO",
    category: "Inovajuntos",
    url: "https://youtu.be/SbYwC4eNEiY?si=ihg2dODs5ADi4ohq",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-25",
    date: "2020-10-31",
    title: "Video: Temas Transversais InovaJuntos",
    description:
      "Orientações em vídeo sobre os temas transversais que permeiam o projeto e devem ser observados pelos municípios participantes.",
    type: "VIDEO",
    category: "Inovajuntos",
    url: "https://youtu.be/zI6uCYRje08?si=amuBAzkjYBPbODnw",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-23",
    date: "2020-10-31",
    title: "Video: Conheca o InovaJuntos",
    description:
      "Apresentação audiovisual do projeto detalhando seus objetivos de cooperação e inovação para o desenvolvimento local.",
    type: "VIDEO",
    category: "Inovajuntos",
    url: "https://youtu.be/wFptxQHeyNg?si=arN7W2WOn8Hi11VR",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-01",
    date: "2020-10-19",
    title: "Reunião InovaJuntos - Formulário e Critérios",
    description:
      "Reunião entre CNM e CES para definição do formulário de seleção dos participantes e critérios técnicos de avaliação.",
    type: "PROJECT",
    category: "Inovajuntos",
    url: "https://youtu.be/4kxqGs7Y1og",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2020-relatorio",
    date: "2020-12-31",
    title: "Relatório de Ações - InovaJuntos 2020",
    description:
      "Relatório anual consolidando todas as reuniões de monitoramento, lançamento de edital e ações de divulgação do primeiro ano do projeto.",
    type: "DOC",
    category: "Inovajuntos",
    url: "/inovajuntos/relatorios/(2020)Relatório de ações - InovaJuntos - Google Docs.pdf",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2019-relatorio",
    date: "2019-12-31",
    title: "Relatório de Ações - InovaJuntos 2019",
    description:
      "Relatório anual consolidando as primeiras atividades, seleção e organização inicial do projeto.",
    type: "DOC",
    category: "Inovajuntos",
    url: "/inovajuntos/relatorios/(2019)Relatório de ações - InovaJuntos - Google Docs.pdf",
    tags: ["inovajuntos", "cooperação internacional"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2021-relatorio",
    date: "2021-12-31",
    title: "Relatório de Ações - InovaJuntos 2021",
    description:
      "Relatório anual com consolidação de atividades, capacitações e missão técnica.",
    type: "DOC",
    category: "Inovajuntos",
    url: "/inovajuntos/relatorios/(2021)Relatório de ações - InovaJuntos - Google Docs.pdf",
    tags: ["inovajuntos", "cooperação internacional"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2022-relatorio",
    date: "2022-12-31",
    title: "Relatório de Ações - InovaJuntos 2022",
    description:
      "Relatório anual com entregas, eventos e avanços da cooperação descentralizada.",
    type: "DOC",
    category: "Inovajuntos",
    url: "/inovajuntos/relatorios/(2022)Relatório de ações - InovaJuntos - Google Docs.pdf",
    tags: ["inovajuntos", "cooperação internacional", "cooperação descentralizada"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2024-relatorio",
    date: "2024-12-31",
    title: "Relatório de Ações - InovaJuntos 2024",
    description:
      "Relatório anual com consolidação das últimas entregas e transição para a Rede Inovajuntos.",
    type: "DOC",
    category: "Inovajuntos",
    url: "/inovajuntos/relatorios/(2024)Relatório de ações - InovaJuntos - Google Docs.pdf",
    tags: ["inovajuntos", "cooperação internacional"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2024-relatorio-html",
    date: "2024-12-31",
    title: "Relatório de Ações - InovaJuntos 2024 (HTML)",
    description:
      "Versão em HTML do relatório anual de 2024 para consulta rápida.",
    type: "DOC",
    category: "Inovajuntos",
    url: "/inovajuntos/relatorios/(2024)Relatório de ações - InovaJuntos - Google Docs.html",
    tags: ["inovajuntos"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2024-11-30",
    date: "2024-11-30",
    title: "Conclusão da execução do Projeto Inovajuntos",
    description:
      "Encerramento formal do projeto após quatro anos de atividades, entregas e cooperação internacional.",
    type: "PROJECT",
    category: "Inovajuntos",
    tags: ["inovajuntos", "cooperação internacional", "ods"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2025-02-final-report",
    date: "2025-02-01",
    title: "Relatório Técnico Final - Projeto Inovajuntos",
    description:
      "Relatório final consolidado com resultados, lições aprendidas e todas as entregas do projeto.",
    type: "DOC",
    category: "Inovajuntos",
    url: "/inovajuntos/relatorio-final/RelatorioTecnicoFinalInovajuntos-MenorResolucao_assinado.pdf",
    tags: ["inovajuntos", "união europeia", "cooperação internacional", "ods"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2020-clipping",
    date: "2020-12-31",
    title: "Clipping de notícias - InovaJuntos 2020",
    description:
      "Compilação de notícias e menções públicas do projeto em 2020.",
    type: "NEWS",
    category: "Inovajuntos",
    url: "/inovajuntos/clippings/(2020)-Clipping de noticias-  InovaJuntos .docx",
    tags: ["inovajuntos", "comunicação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2021-clipping",
    date: "2021-12-31",
    title: "Clipping de notícias - InovaJuntos 2021",
    description:
      "Compilação de notícias e menções públicas do projeto em 2021.",
    type: "NEWS",
    category: "Inovajuntos",
    url: "/inovajuntos/clippings/(2021)-Clipping de noticias-InovaJuntos .docx",
    tags: ["inovajuntos", "comunicação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2022-clipping",
    date: "2022-12-31",
    title: "Clipping de noticias - InovaJuntos 2022",
    description:
      "Compilacao de noticias e mencoes publicas do projeto em 2022.",
    type: "NEWS",
    category: "Inovajuntos",
    url: "/inovajuntos/clippings/(2022)-Clipping de noticias-InovaJuntos .docx",
    tags: ["inovajuntos", "comunicação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2023-clipping",
    date: "2023-12-31",
    title: "Clipping de noticias - InovaJuntos 2023",
    description:
      "Compilacao de noticias e mencoes publicas do projeto em 2023.",
    type: "NEWS",
    category: "Inovajuntos",
    url: "/inovajuntos/clippings/(2023)-Clipping de noticias-InovaJuntos .docx",
    tags: ["inovajuntos", "comunicação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2024-clipping",
    date: "2024-12-31",
    title: "Clipping de noticias - InovaJuntos 2024",
    description:
      "Compilacao de noticias e mencoes publicas do projeto em 2024.",
    type: "NEWS",
    category: "Inovajuntos",
    url: "/inovajuntos/clippings/(2024)-Clipping de noticias-InovaJuntos .docx",
    tags: ["inovajuntos", "comunicação"],
    source: "historico",
    axis: "Inovajuntos",
  },
];

const relatorioFinalEvents: TimelineEventItem[] = [
  {
    id: "inovajuntos-2021-07-visita-goias",
    date: "2021-07-01",
    title: "Visita tecnica a Goias (1a atividade presencial)",
    description:
      "Primeira atividade presencial registrada, marcando o retorno das visitas tecnicas.",
    type: "PROJECT",
    category: "Inovajuntos",
    url: "http://li.cnm.org.br/r/9eL4tF",
    tags: ["inovajuntos", "cooperação internacional"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2021-11-missao-portugal-1",
    date: "2021-11-01",
    title: "1a Missao em Portugal",
    description: "Missao tecnica internacional com participantes brasileiros e portugueses.",
    type: "PROJECT",
    category: "Inovajuntos",
    tags: ["inovajuntos", "cooperação internacional", "união europeia"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2022-11-missao-portugal-2",
    date: "2022-11-01",
    title: "2a Missao em Portugal",
    description: "Missao tecnica internacional do projeto InovaJuntos.",
    type: "PROJECT",
    category: "Inovajuntos",
    tags: ["inovajuntos", "cooperação internacional", "união europeia"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2023-12-missao-portugal-3",
    date: "2023-12-01",
    title: "3a Missao em Portugal (Clusters 2 e 4)",
    description: "Missao tecnica internacional com foco nos clusters 2 e 4.",
    type: "PROJECT",
    category: "Inovajuntos",
    tags: ["inovajuntos", "cooperação internacional"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2024-03-missao-portugal-4",
    date: "2024-03-01",
    title: "4a Missao em Portugal (Clusters 1 e 3)",
    description: "Missao tecnica internacional com foco nos clusters 1 e 3.",
    type: "PROJECT",
    category: "Inovajuntos",
    tags: ["inovajuntos", "cooperação internacional"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2022-05-capacitacao-brasilia-1",
    date: "2022-05-01",
    title: "1ª capacitação em Brasília",
    description: "Capacitação técnica realizada no âmbito das missões em Brasília.",
    type: "PROJECT",
    category: "Inovajuntos",
    tags: ["inovajuntos", "capacitação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2023-10-capacitacao-brasilia-2",
    date: "2023-10-01",
    title: "2ª capacitação em Brasília",
    description: "Capacitação técnica realizada no âmbito das missões em Brasília.",
    type: "PROJECT",
    category: "Inovajuntos",
    tags: ["inovajuntos", "capacitação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2023-03-marcha-xxiv",
    date: "2023-03-01",
    title: "XXIV Marcha a Brasília em Defesa dos Municípios",
    description: "Participação do projeto na marcha municipalista.",
    type: "PROJECT",
    category: "Inovajuntos",
    tags: ["inovajuntos", "municípios"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2024-05-marcha-xxv",
    date: "2024-05-01",
    title: "XXV Marcha a Brasília em Defesa dos Municípios",
    description: "Participação do projeto na marcha municipalista.",
    type: "PROJECT",
    category: "Inovajuntos",
    url: "http://li.cnm.org.br/r/6v1TJs",
    tags: ["inovajuntos", "municípios"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2022-03-smart-city-expo-curitiba",
    date: "2022-03-01",
    title: "Smart City Expo Curitiba",
    description: "Participação em evento de inovação urbana.",
    type: "NEWS",
    category: "Inovajuntos",
    url: "http://li.cnm.org.br/r/Ek22B2",
    tags: ["inovajuntos", "inovação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2022-05-cidade-empreendedora-sebrae",
    date: "2022-05-01",
    title: "Cidade Empreendedora - Sebrae",
    description: "Evento com apresentação de parcerias e boas práticas municipais.",
    type: "NEWS",
    category: "Inovajuntos",
    url: "http://li.cnm.org.br/r/VkPmsJ",
    tags: ["inovajuntos", "municípios"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2022-06-congresso-restinga-seca",
    date: "2022-06-01",
    title: "40º Congresso de Municípios - Restinga Seca/RS",
    description: "Participação em congresso municipalista.",
    type: "NEWS",
    category: "Inovajuntos",
    url: "http://li.cnm.org.br/r/fgRjJQ",
    tags: ["inovajuntos", "municípios"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2022-10-circuito-urbano",
    date: "2022-10-01",
    title: "Circuito Urbano 2022",
    description: "Participação em evento do ONU-Habitat Brasil.",
    type: "VIDEO",
    category: "Inovajuntos",
    url: "https://youtu.be/8RIZvINEQDg",
    tags: ["inovajuntos", "ods"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2022-11-smart-city-barcelona",
    date: "2022-11-01",
    title: "Smart City Expo World Congress - Barcelona",
    description: "Participação em evento internacional de cidades e inovação urbana.",
    type: "PROJECT",
    category: "Cooperação Internacional",
    tags: ["inovajuntos", "cooperação internacional"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2023-03-first-global-meeting",
    date: "2023-03-01",
    title: "First Global Meeting of Partners - Bruxelas",
    description: "Participação em encontro internacional de parceiros.",
    type: "PROJECT",
    category: "Cooperação Internacional",
    url: "http://li.cnm.org.br/r/nwXt94",
    tags: ["inovajuntos", "união europeia"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2023-03-smart-city-curitiba",
    date: "2023-03-01",
    title: "Smart City Expo Curitiba (2023)",
    description: "Participação em evento de inovação urbana.",
    type: "PROJECT",
    category: "Inovajuntos",
    tags: ["inovajuntos", "inovação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2023-06-dialogos-agenda-2030",
    date: "2023-06-01",
    title: "Diálogos para retomada da Agenda 2030 e dos ODS",
    description: "Primeiro encontro dos diálogos sobre Agenda 2030 e ODS.",
    type: "PROJECT",
    category: "Cooperação Internacional",
    tags: ["inovajuntos", "ods"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2023-06-reuniao-anmp",
    date: "2023-06-01",
    title: "Reunião na Associação Nacional de Municípios Portugueses (ANMP)",
    description: "Reunião de articulação com municípios portugueses.",
    type: "PROJECT",
    category: "Cooperação Internacional",
    url: "http://li.cnm.org.br/r/yRxYWx",
    tags: ["inovajuntos", "cooperação internacional"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2023-07-eu-latam-forum",
    date: "2023-07-01",
    title: "EU-Latin America & The Caribbean Forum - Bruxelas",
    description: "Participação em fórum internacional.",
    type: "PROJECT",
    category: "Cooperação Internacional",
    tags: ["inovajuntos", "união europeia"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2023-07-seminario-inclusao-social",
    date: "2023-07-01",
    title: "Seminário diálogo sobre inclusão social (União Europeia)",
    description: "Evento internacional promovido pela União Europeia.",
    type: "PROJECT",
    category: "Cooperação Internacional",
    tags: ["inovajuntos", "união europeia"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2023-10-circuito-urbano",
    date: "2023-10-01",
    title: "Circuito Urbano 2023 - ONU Habitat",
    description: "Participação em evento internacional sobre cidades.",
    type: "PROJECT",
    category: "Cooperação Internacional",
    tags: ["inovajuntos", "ods"],
    source: "historico",
    axis: "Cooperação Internacional",
  },
  {
    id: "inovajuntos-2021-01-boletim-cnm",
    date: "2021-01-01",
    title: "Boletim CNM - Janeiro 2021",
    description: "Publicação institucional sobre o projeto.",
    type: "PUBLICATION",
    category: "Publicação",
    url: "http://li.cnm.org.br/r/wKtJcl",
    tags: ["inovajuntos", "publicação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2021-04-boletim-cnm",
    date: "2021-04-01",
    title: "Boletim CNM - Abril 2021",
    description: "Publicação institucional sobre o projeto.",
    type: "PUBLICATION",
    category: "Publicação",
    url: "http://li.cnm.org.br/r/BHkllr",
    tags: ["inovajuntos", "publicação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2021-08-boletim-cnm",
    date: "2021-08-01",
    title: "Boletim CNM - Agosto 2021",
    description: "Publicação institucional sobre o projeto.",
    type: "PUBLICATION",
    category: "Publicação",
    url: "http://li.cnm.org.br/r/riWomO",
    tags: ["inovajuntos", "publicação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2022-04-boletim-cnm",
    date: "2022-04-01",
    title: "Boletim CNM - Abril 2022",
    description: "Publicação institucional sobre o projeto.",
    type: "PUBLICATION",
    category: "Publicação",
    url: "http://li.cnm.org.br/r/m1Yn4G",
    tags: ["inovajuntos", "publicação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2022-08-boletim-cnm",
    date: "2022-08-01",
    title: "Boletim CNM - Agosto 2022",
    description: "Publicação institucional sobre o projeto.",
    type: "PUBLICATION",
    category: "Publicação",
    url: "http://li.cnm.org.br/r/EY171i",
    tags: ["inovajuntos", "publicação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2023-11-boletim-cnm",
    date: "2023-11-01",
    title: "Boletim CNM - Novembro 2023",
    description: "Publicação institucional sobre o projeto.",
    type: "PUBLICATION",
    category: "Publicação",
    url: "http://li.cnm.org.br/r/NhCwEi",
    tags: ["inovajuntos", "publicação"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2023-11-kit-boas-praticas-pt",
    date: "2023-11-01",
    title: "Lançamento do Kit de Boas Práticas (Portugal)",
    description: "Primeira edição do kit com boas práticas portuguesas.",
    type: "PUBLICATION",
    category: "Inovajuntos",
    url: "https://youtu.be/9-Btxw9zH4s?si=8Hi2dECfvJTlhcur",
    tags: ["inovajuntos", "boas práticas"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2024-03-kit-boas-praticas-pt",
    date: "2024-03-01",
    title: "2ª edição do Kit de Boas Práticas (Portugal)",
    description: "Segunda edição do kit com boas práticas portuguesas.",
    type: "PUBLICATION",
    category: "Inovajuntos",
    url: "https://youtu.be/9-Btxw9zH4s?si=8Hi2dECfvJTlhcur",
    tags: ["inovajuntos", "boas práticas"],
    source: "historico",
    axis: "Inovajuntos",
  },
  {
    id: "inovajuntos-2024-05-kit-boas-praticas-br",
    date: "2024-05-01",
    title: "Lançamento do Kit de Boas Práticas (Brasil)",
    description: "Primeiro kit com boas práticas de municípios brasileiros.",
    type: "PUBLICATION",
    category: "Inovajuntos",
    url: "http://li.cnm.org.br/r/bcNdq2",
    tags: ["inovajuntos", "boas práticas"],
    source: "historico",
    axis: "Inovajuntos",
  },
];

export const historicoEvents: TimelineEventItem[] = [
  ...baseHistoricoEvents,
  ...relatorioFinalEvents,
];

export const redeEvents: TimelineEventItem[] = [
  {
    id: "rede-inovajuntos-2026-01-23",
    date: "2026-01-23",
    title: "Nascimento oficial da Rede Inovajuntos",
    description:
      "A Rede Inovajuntos nasce oficialmente como hub de cooperação internacional, compras governamentais e suporte a municípios.",
    type: "PROJECT",
    category: "Rede Inovajuntos",
    tags: ["rede inovajuntos", "inovajuntos"],
    source: "rede",
    axis: "Inovajuntos",
  },
];

export const historicoTimelineEvents = sortByDateDesc([
  ...historicoEvents,
  ...aiTimelineEvents,
  ...redeEvents,
]);

export const redeTimelineEvents = sortByDateDesc([
  ...redeEvents,
  ...historicoEvents.filter(isInovajuntosLinked),
  ...aiTimelineEvents.filter(isInovajuntosLinked),
]);

export const historicoInovajuntosEvents = sortByDateDesc(
  [...historicoEvents, ...aiTimelineEvents].filter(isInovajuntosLinked)
);
