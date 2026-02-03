#!/usr/bin/env node

/**
 * Script executado antes do build
 * Incrementa versão e gera variáveis de ambiente
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
const VERSION_FILE = path.join(__dirname, '..', '.version');

// Determinar ambiente
let environment = 'development';
if (ENV === 'production') {
  environment = 'production';
} else if (ENV === 'preview') {
  environment = 'preview';
}

// Ler versão atual (não incrementa automaticamente: release precisa ser reprodutível
// e a mesma versão/commit deve poder ser promovida entre preview e produção).
let version = 'V1.0.000';
let build = Date.now().toString().slice(-6);
let buildDate = new Date().toISOString();

try {
  version = execSync('node scripts/version-manager.js get', { encoding: 'utf8' }).trim();
  // Preferir SHA do git para manter o mesmo "build" entre dev/preview/prod
  // para o MESMO commit (promovível).
  try {
    build = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    build = execSync('node scripts/version-manager.js build', { encoding: 'utf8' }).trim();
  }
} catch (error) {
  console.error('⚠️  Erro ao ler versão:', error.message);
}

// Criar arquivo .env.build com variáveis de build
const envBuildPath = path.join(__dirname, '..', '.env.build');
const envBuildContent = `# Variáveis de Build (geradas automaticamente)
NEXT_PUBLIC_VERSION=${version}
NEXT_PUBLIC_BUILD=${build}
NEXT_PUBLIC_BUILD_DATE=${buildDate}
NEXT_PUBLIC_ENVIRONMENT=${environment}
NEXT_PUBLIC_GIT_SHA=${build}
`;

fs.writeFileSync(envBuildPath, envBuildContent, 'utf8');

// Também criar .env.local.build para Next.js carregar automaticamente
const envLocalBuildPath = path.join(__dirname, '..', '.env.local.build');
fs.writeFileSync(envLocalBuildPath, envBuildContent, 'utf8');

console.log(`✅ Variáveis de build geradas:`);
console.log(`   Versão: ${version}`);
console.log(`   Build: ${build}`);
console.log(`   Ambiente: ${environment}`);
console.log(`   Data: ${buildDate}`);
