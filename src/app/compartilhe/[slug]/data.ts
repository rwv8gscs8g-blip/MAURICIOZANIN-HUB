export interface ResourceDetail {
    id: string;
    slug: string;
    name: string;
    description: string;
    fullDescription: string;
    type: "pdf" | "doc" | "xls";
    syncUrl: string;
    author: string;
    publishedAt: string;
    category: string;
    pages?: number;
    size?: string;
}

export const resources: Record<string, ResourceDetail> = {
    "guia-conformidade-lei-14133": {
        id: "1",
        slug: "guia-conformidade-lei-14133",
        name: "Guia de Conformidade - Lei 14.133/2021",
        description: "Manual completo sobre a nova lei de licitações",
        fullDescription:
            "Este guia completo aborda todos os aspectos da Lei 14.133/2021, a nova lei de licitações e contratos administrativos. Inclui análises detalhadas sobre processos licitatórios, modalidades, fases do procedimento, e as principais mudanças em relação à legislação anterior. Ideal para gestores públicos, prefeitos, secretários e equipes técnicas que precisam se adequar à nova legislação.",
        type: "pdf",
        syncUrl: "https://sync.com/resource1",
        author: "Maurício Zanin",
        publishedAt: "2024-01-15",
        category: "Cartilha Sebrae",
        pages: 120,
        size: "5.2 MB",
    },
    "template-edital-padrao": {
        id: "2",
        slug: "template-edital-padrao",
        name: "Template de Edital Padrão",
        description: "Modelo de edital conforme legislação vigente",
        fullDescription:
            "Template completo e atualizado de edital de licitação conforme a Lei 14.133/2021. Inclui todas as cláusulas essenciais, termos de referência, critérios de julgamento e condições de participação. Pronto para uso, com campos editáveis e orientações de preenchimento.",
        type: "doc",
        syncUrl: "https://sync.com/resource2",
        author: "Maurício Zanin",
        publishedAt: "2023-11-20",
        category: "Template",
        pages: 45,
        size: "2.1 MB",
    },
    "planilha-controle-licitacoes": {
        id: "3",
        slug: "planilha-controle-licitacoes",
        name: "Planilha de Controle de Licitações",
        description: "Ferramenta para gestão de processos licitatórios",
        fullDescription:
            "Planilha Excel completa para controle e gestão de processos licitatórios. Inclui dashboards, indicadores de performance, controle de prazos, status de processos e relatórios automatizados. Facilita a gestão de múltiplos processos simultaneamente.",
        type: "xls",
        syncUrl: "https://sync.com/resource3",
        author: "Maurício Zanin",
        publishedAt: "2023-08-10",
        category: "Ferramenta",
        size: "1.8 MB",
    },
    "checklist-conformidade": {
        id: "4",
        slug: "checklist-conformidade",
        name: "Checklist de Conformidade",
        description: "Lista de verificação para processos públicos",
        fullDescription:
            "Checklist completo para verificação de conformidade em processos licitatórios. Inclui verificação de documentos, prazos, publicações, habilitação e julgamento. Essencial para garantir que todos os processos estejam em conformidade com a legislação vigente.",
        type: "pdf",
        syncUrl: "https://sync.com/resource4",
        author: "Maurício Zanin",
        publishedAt: "2022-06-15",
        category: "Checklist",
        pages: 25,
        size: "1.2 MB",
    },
};
