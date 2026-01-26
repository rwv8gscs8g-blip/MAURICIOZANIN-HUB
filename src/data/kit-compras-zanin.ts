/**
 * KIT COMPRAS ZANIN - Recursos do Sebrae
 * 
 * Materiais educacionais e ferramentas sobre compras públicas
 */

export interface KitResource {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "Cartilha" | "Curso" | "Guia" | "Planilha" | "E-book" | "Apresentação" | "Arquivo";
  type: "pdf" | "doc" | "xls" | "ppsx" | "pptx" | "rtf" | "zip";
  filePath: string;
  author?: string;
  publishedAt?: string;
  size?: string;
}

export const kitComprasZaninResources: KitResource[] = [
  {
    id: "kit-001",
    slug: "leia-me",
    name: "LEIA-ME - Instruções do Kit",
    description: "Instruções e informações sobre o Kit Compras Zanin",
    category: "Arquivo",
    type: "rtf",
    filePath: "/resources/kit-compras-zanin/001-LEIA-ME.rtf",
    publishedAt: "2025-01-01",
  },
  {
    id: "kit-002",
    slug: "cartilha-comprador",
    name: "Cartilha do Comprador",
    description: "Guia completo para gestores públicos sobre compras governamentais e processos licitatórios",
    category: "Cartilha",
    type: "pdf",
    filePath: "/resources/kit-compras-zanin/002-cartilha_comprador.pdf",
    author: "Sebrae",
    publishedAt: "2024-01-01",
    size: "6.9 MB",
  },
  {
    id: "kit-003",
    slug: "cartilha-fornecedor",
    name: "Cartilha do Fornecedor",
    description: "Manual para empresas que desejam participar de licitações públicas",
    category: "Cartilha",
    type: "pdf",
    filePath: "/resources/kit-compras-zanin/003-cartilha_fornecedor.pdf",
    author: "Sebrae",
    publishedAt: "2024-01-01",
    size: "12 MB",
  },
  {
    id: "kit-004",
    slug: "curso-compras-gov",
    name: "Curso Online - Compras.gov.br: Da Teoria à Prática",
    description: "Material do curso sobre o portal Compras.gov.br desenvolvido em parceria com TCE-PR e Sebrae",
    category: "Curso",
    type: "pdf",
    filePath: "/resources/kit-compras-zanin/004-CursoOnLine-Comprasgovbr-DaTeoriaAPratica-TCEPR-Sebrae.pdf",
    author: "TCE-PR / Sebrae",
    publishedAt: "2024-01-01",
    size: "298 KB",
  },
  {
    id: "kit-005",
    slug: "curso-base-zanin",
    name: "Curso Base - Apresentação Zanin",
    description: "Apresentação base do curso sobre compras públicas e governança",
    category: "Curso",
    type: "ppsx",
    filePath: "/resources/kit-compras-zanin/005-Curso-Base-Zanin.ppsx",
    author: "Maurício Zanin",
    publishedAt: "2024-01-01",
    size: "39 MB",
  },
  {
    id: "kit-006",
    slug: "guia-empreendendo-transformando",
    name: "Guia Empreendendo e Transformando Juntos",
    description: "Guia digital sobre empreendedorismo e transformação na gestão pública",
    category: "Guia",
    type: "pdf",
    filePath: "/resources/kit-compras-zanin/006-Guia_Empreendendo-Transformando-Juntos_Digital.pdf",
    author: "Sebrae",
    publishedAt: "2024-01-01",
    size: "4.9 MB",
  },
  {
    id: "kit-007",
    slug: "planilha-pca-credenciamento",
    name: "Planilha PCA + Credenciamento 2025",
    description: "Ferramenta para gestão de processos de credenciamento e cadastro de fornecedores",
    category: "Planilha",
    type: "xls",
    filePath: "/resources/kit-compras-zanin/007-PlanilhaPCA+Credenciamento2025.xlsx",
    author: "Sebrae",
    publishedAt: "2025-01-01",
    size: "2.1 MB",
  },
  {
    id: "kit-008",
    slug: "ebook-contratacao-generos-alimenticios",
    name: "E-book - Contratação de Gêneros Alimentícios",
    description: "Guia completo sobre contratação de gêneros alimentícios na administração pública",
    category: "E-book",
    type: "pdf",
    filePath: "/resources/kit-compras-zanin/008-EBOOK_Sebrae_Contratacao de Generos Alimenticios.pdf",
    author: "Sebrae",
    publishedAt: "2024-01-01",
    size: "473 KB",
  },
  {
    id: "kit-010-pdf",
    slug: "contrata-mais-brasil-pdf",
    name: "Contrata Mais Brasil - Versão Agosto 2025 (PDF)",
    description: "Manual completo sobre o programa Contrata Mais Brasil para inclusão de MPEs nas compras públicas",
    category: "Guia",
    type: "pdf",
    filePath: "/resources/kit-compras-zanin/010 - CONTRATA MAIS BRASIL_versao_Agosto2025  -  Read-Only.pdf",
    author: "Sebrae / MGI",
    publishedAt: "2025-08-01",
    size: "41 MB",
  },
  {
    id: "kit-010-ppsx",
    slug: "contrata-mais-brasil-ppsx",
    name: "Contrata Mais Brasil - Apresentação (PPSX)",
    description: "Apresentação sobre o programa Contrata Mais Brasil - versão editável",
    category: "Apresentação",
    type: "ppsx",
    filePath: "/resources/kit-compras-zanin/010 - CONTRATA MAIS BRASIL_versao_Agosto2025.ppsx",
    author: "Sebrae / MGI",
    publishedAt: "2025-08-01",
    size: "67 MB",
  },
  {
    id: "kit-010-pptx",
    slug: "contrata-mais-brasil-pptx",
    name: "Contrata Mais Brasil - Apresentação (PPTX)",
    description: "Apresentação sobre o programa Contrata Mais Brasil - formato PowerPoint",
    category: "Apresentação",
    type: "pptx",
    filePath: "/resources/kit-compras-zanin/010 - CONTRATA MAIS BRASIL_versao_Agosto2025.pptx",
    author: "Sebrae / MGI",
    publishedAt: "2025-08-01",
    size: "67 MB",
  },
  {
    id: "kit-013",
    slug: "ods-para-municipios",
    name: "ODS para Municípios - Outubro 2025",
    description: "Kit completo sobre Objetivos de Desenvolvimento Sustentável (ODS) para municípios brasileiros",
    category: "Arquivo",
    type: "zip",
    filePath: "/resources/kit-compras-zanin/013-ODS-ParaMunicípios-Outubro-2025.zip",
    author: "Sebrae",
    publishedAt: "2025-10-01",
    size: "38 MB",
  },
];
