/**
 * Gerenciamento de Tokens para Automação CLI
 * 
 * Este módulo permite que o assistente acesse tokens de forma segura
 * para automação de tarefas via CLI.
 */

/**
 * Carrega tokens do arquivo .env.local
 * Apenas para uso em scripts Node.js/CLI
 */
export function loadTokens() {
  // Em produção, tokens devem vir de variáveis de ambiente
  // Este arquivo é apenas para referência e documentação
  
  return {
    github: process.env.GITHUB_TOKEN,
    vercel: process.env.VERCEL_TOKEN,
    neon: process.env.NEON_API_KEY,
    database: process.env.DATABASE_URL,
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      orgId: process.env.LINKEDIN_ORG_ID,
    },
  };
}

/**
 * Verifica se tokens estão configurados
 */
export function hasTokens() {
  const tokens = loadTokens();
  return {
    github: !!tokens.github,
    vercel: !!tokens.vercel,
    neon: !!tokens.neon,
    database: !!tokens.database,
    linkedin: !!tokens.linkedin.accessToken,
  };
}
