export type EixoKey =
  | "governanca_planejamento"
  | "capacitacao_pessoas"
  | "gestao_riscos"
  | "digitalizacao_sistemas"
  | "sustentabilidade_inclusao"
  | "integracao_mpe"
  | "aderencia_14133";

export const eixosDiagnostico = [
  {
    key: "governanca_planejamento",
    title: "Governança e Planejamento das Contratações",
  },
  {
    key: "capacitacao_pessoas",
    title: "Capacitação e Gestão de Pessoas",
  },
  {
    key: "gestao_riscos",
    title: "Gestão de Riscos e Controle Interno",
  },
  {
    key: "digitalizacao_sistemas",
    title: "Digitalização e Sistemas",
  },
  {
    key: "sustentabilidade_inclusao",
    title: "Sustentabilidade e Inclusão Econômica",
  },
  {
    key: "integracao_mpe",
    title: "Integração com MPE e Desenvolvimento Local",
  },
  {
    key: "aderencia_14133",
    title: "Aderência à Lei nº 14.133/2021",
  },
] as const;

export const blocosDiagnostico = [
  {
    key: "positivo",
    title: "Aspectos Positivos",
  },
  {
    key: "negativo",
    title: "Aspectos Negativos",
  },
  {
    key: "solucao",
    title: "Alternativas de Solução",
  },
] as const;

export const checklistPorEixo = {
  governanca_planejamento: {
    positivo: [
      "PCA/PAC elaborado e divulgado",
      "Calendário anual de compras consolidado",
      "Plano de contratações alinhado ao PPA/LDO/LOA",
      "Gestão por indicadores no planejamento",
      "Unidades demandantes integradas ao processo",
    ],
    negativo: [
      "Demandas emergenciais recorrentes",
      "Planejamento não publicado",
      "Falta de alinhamento com área técnica",
      "Ausência de cronograma oficial",
      "Riscos não mapeados no planejamento",
    ],
    solucao: [
      "Solução 1 - SEBRAE",
      "Solução 2 - SEBRAE",
      "Solução 3 - SEBRAE",
      "Solução 4 - SEBRAE",
      "Solução 5 - SEBRAE",
      "Solução 6 - SEBRAE",
      "Solução 7 - SEBRAE",
      "Solução 8 - SEBRAE",
      "Solução 9 - SEBRAE",
      "Solução 10 - SEBRAE",
    ],
  },
  capacitacao_pessoas: {
    positivo: [
      "Plano de capacitação anual ativo",
      "Equipe treinada na Lei 14.133/2021",
      "Rotinas de compartilhamento interno",
      "Acesso a cursos do SEBRAE",
      "Registro de competências por função",
    ],
    negativo: [
      "Alta rotatividade da equipe",
      "Capacitações pontuais sem continuidade",
      "Falta de trilhas por perfil",
      "Desconhecimento de normas atualizadas",
      "Baixa dedicação exclusiva ao setor",
    ],
    solucao: [
      "Solução 1 - SEBRAE",
      "Solução 2 - SEBRAE",
      "Solução 3 - SEBRAE",
      "Solução 4 - SEBRAE",
      "Solução 5 - SEBRAE",
      "Solução 6 - SEBRAE",
      "Solução 7 - SEBRAE",
      "Solução 8 - SEBRAE",
      "Solução 9 - SEBRAE",
      "Solução 10 - SEBRAE",
    ],
  },
  gestao_riscos: {
    positivo: [
      "Matriz de riscos aplicada",
      "Controles internos definidos",
      "Segregação de funções implementada",
      "Auditorias internas periódicas",
      "Plano de mitigação documentado",
    ],
    negativo: [
      "Riscos não formalizados",
      "Controles inexistentes ou informais",
      "Falhas recorrentes em licitações",
      "Ausência de plano de mitigação",
      "Baixa integração com controle interno",
    ],
    solucao: [
      "Solução 1 - SEBRAE",
      "Solução 2 - SEBRAE",
      "Solução 3 - SEBRAE",
      "Solução 4 - SEBRAE",
      "Solução 5 - SEBRAE",
      "Solução 6 - SEBRAE",
      "Solução 7 - SEBRAE",
      "Solução 8 - SEBRAE",
      "Solução 9 - SEBRAE",
      "Solução 10 - SEBRAE",
    ],
  },
  digitalizacao_sistemas: {
    positivo: [
      "Uso de PNCP e/ou compras.gov.br",
      "Processos eletrônicos implantados",
      "Gestão de contratos digital",
      "Portal da transparência atualizado",
      "Assinatura digital institucional",
    ],
    negativo: [
      "Processos ainda físicos",
      "Baixa interoperabilidade de sistemas",
      "Dados dispersos ou incompletos",
      "Equipe sem treinamento em sistemas",
      "Publicações fora do prazo",
    ],
    solucao: [
      "Solução 1 - SEBRAE",
      "Solução 2 - SEBRAE",
      "Solução 3 - SEBRAE",
      "Solução 4 - SEBRAE",
      "Solução 5 - SEBRAE",
      "Solução 6 - SEBRAE",
      "Solução 7 - SEBRAE",
      "Solução 8 - SEBRAE",
      "Solução 9 - SEBRAE",
      "Solução 10 - SEBRAE",
    ],
  },
  sustentabilidade_inclusao: {
    positivo: [
      "Critérios sustentáveis nas compras",
      "Compras com foco em impacto local",
      "Inclusão de grupos vulneráveis",
      "Diálogo com agricultura familiar",
      "Indicadores de sustentabilidade",
    ],
    negativo: [
      "Ausência de critérios sustentáveis",
      "Baixa articulação com políticas sociais",
      "Pouca divulgação a fornecedores locais",
      "Falta de indicadores socioambientais",
      "Pouco uso de compras inovadoras",
    ],
    solucao: [
      "Solução 1 - SEBRAE",
      "Solução 2 - SEBRAE",
      "Solução 3 - SEBRAE",
      "Solução 4 - SEBRAE",
      "Solução 5 - SEBRAE",
      "Solução 6 - SEBRAE",
      "Solução 7 - SEBRAE",
      "Solução 8 - SEBRAE",
      "Solução 9 - SEBRAE",
      "Solução 10 - SEBRAE",
    ],
  },
  integracao_mpe: {
    positivo: [
      "Ações conjuntas com Sala do Empreendedor",
      "Divulgação ativa de oportunidades",
      "Capacitação de fornecedores locais",
      "Mapeamento de MPE locais",
      "Uso de credenciamento",
    ],
    negativo: [
      "Baixa participação de MPE",
      "Pouca comunicação com setor produtivo",
      "Desconhecimento da LC 123/2006",
      "Dificuldade de cadastro de fornecedores",
      "Editais complexos para MPE",
    ],
    solucao: [
      "Solução 1 - SEBRAE",
      "Solução 2 - SEBRAE",
      "Solução 3 - SEBRAE",
      "Solução 4 - SEBRAE",
      "Solução 5 - SEBRAE",
      "Solução 6 - SEBRAE",
      "Solução 7 - SEBRAE",
      "Solução 8 - SEBRAE",
      "Solução 9 - SEBRAE",
      "Solução 10 - SEBRAE",
    ],
  },
  aderencia_14133: {
    positivo: [
      "Adequação normativa formalizada",
      "Processos alinhados à Lei 14.133/2021",
      "Gestão de contratos estruturada",
      "PCA/PAC alinhado ao PNCP",
      "Registro de governança formalizado",
    ],
    negativo: [
      "Procedimentos ainda baseados na 8.666",
      "Falta de atualização de normativos",
      "Equipe sem domínio da nova lei",
      "Ausência de plano de transição",
      "Documentação incompleta",
    ],
    solucao: [
      "Solução 1 - SEBRAE",
      "Solução 2 - SEBRAE",
      "Solução 3 - SEBRAE",
      "Solução 4 - SEBRAE",
      "Solução 5 - SEBRAE",
      "Solução 6 - SEBRAE",
      "Solução 7 - SEBRAE",
      "Solução 8 - SEBRAE",
      "Solução 9 - SEBRAE",
      "Solução 10 - SEBRAE",
    ],
  },
} as const;

export const perguntasChaveConfig = {
  governanca: {
    pcaPacPncp:
      "O município elabora e publica o PCA/PAC no PNCP?",
    integracaoPlanejamento:
      "Existe integração entre planejamento (demandantes) e setor de compras?",
    sebraeSolucoes:
      "Quais soluções do SEBRAE apoiam o planejamento?",
  },
  digitalizacao: {
    sistemasUtilizados: "Quais sistemas utiliza?",
    tramitacaoEletronica: "Grau de tramitação eletrônica",
  },
  inclusao: {
    salaEmpreendedor:
      "Interação com Sala do Empreendedor na divulgação de oportunidades",
    estrategiasFornecedores:
      "Estratégias para informar e preparar fornecedores locais",
    beneficiosLc123: "Aplicação de benefícios da LC 123/2006",
    integracaoSustentabilidade:
      "Integração entre sustentabilidade + agricultura familiar + MPE",
  },
};
