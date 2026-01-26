/**
 * Sistema de Versionamento
 * Carrega informações de versão, build e data do deploy
 */

export interface VersionInfo {
  version: string;
  build: string;
  buildDate: string;
  environment: 'development' | 'preview' | 'production';
}

/**
 * Carrega informações de versão do arquivo .version
 * Em produção, essas informações são injetadas via variáveis de ambiente
 */
export function getVersionInfo(): VersionInfo {
  // Em build time, Next.js injeta essas variáveis via .env.build
  // Em runtime, essas variáveis estão disponíveis via NEXT_PUBLIC_*
  const version = process.env.NEXT_PUBLIC_VERSION || 'V1.0.000';
  const build = process.env.NEXT_PUBLIC_BUILD || Date.now().toString().slice(-6);
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString();
  
  // Determinar ambiente baseado em variáveis disponíveis
  let env: VersionInfo['environment'] = 'development';
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    env = 'production';
  } else if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'preview') {
    env = 'preview';
  } else if (process.env.VERCEL_ENV === 'production') {
    env = 'production';
  } else if (process.env.VERCEL_ENV === 'preview') {
    env = 'preview';
  }

  return {
    version,
    build,
    buildDate,
    environment: env,
  };
}

/**
 * Formata data de build para exibição
 */
export function formatBuildDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(date);
  } catch {
    return dateString;
  }
}
