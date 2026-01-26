import { Person, ScholarlyArticle, Organization } from "schema-dts";

// Schema.org para Person (Maurício Zanin) - Otimizado para Knowledge Graph
export const personSchema: Person = {
  "@type": "Person",
  "@id": "https://mauriciozanin.com.br/#person",
  name: "Luís Maurício Junqueira Zanin",
  alternateName: ["Maurício Zanin", "Luis Mauricio Zanin"],
  jobTitle: "Estrategista de Compras Públicas",
  description:
    "Especialista em Governança e Compras Públicas, fundador da Rede Inovajuntos, consultor de organismos internacionais. Autoridade reconhecida nacional e internacionalmente com mais de 15 anos de experiência em transformação da administração pública.",
  url: "https://mauriciozanin.com.br",
  sameAs: [
    "https://www.linkedin.com/in/mauriciozanin",
    "https://www.youtube.com/@mauriciozanin",
  ],
  knowsAbout: [
    "Compras Públicas",
    "Governança Pública",
    "Lei 14.133/2021",
    "Cooperação Intermunicipal",
    "Consórcios Públicos",
    "Licitações",
    "Gestão Municipal",
  ],
  affiliation: {
    "@type": "Organization",
    name: "Rede Inovajuntos",
    "@id": "https://mauriciozanin.com.br/projetos#inovajuntos",
  },
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "Instituições de Ensino Superior",
  },
  award: [
    "Fundador da Rede Inovajuntos",
    "Consultor de Organismos Internacionais",
  ],
  hasOccupation: {
    "@type": "Occupation",
    name: "Estrategista de Compras Públicas",
    occupationLocation: {
      "@type": "Country",
      name: "Brasil",
    },
  },
} as Person;

// Schema.org para ScholarlyArticle
export function createScholarlyArticleSchema({
  title,
  description,
  author,
  publisher,
  datePublished,
  url,
}: {
  title: string;
  description: string;
  author: string;
  publisher: string;
  datePublished: string;
  url: string;
}): ScholarlyArticle {
  return {
    "@type": "ScholarlyArticle",
    headline: title,
    description: description,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: publisher,
    },
    datePublished: datePublished,
    url: url,
  };
}

// Schema.org para Organization (Rede Inovajuntos)
export const inovajuntosSchema: Organization = {
  "@type": "Organization",
  name: "Rede Inovajuntos",
  description:
    "Rede de inovação municipal com mais de 200 municípios brasileiros, focada em compartilhamento de conhecimento e boas práticas em gestão pública.",
  founder: {
    "@type": "Person",
    name: "Luís Maurício Junqueira Zanin",
  },
  foundingDate: "2023",
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    value: "200",
    unitText: "municípios",
  } as any,
};
