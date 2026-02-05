#!/bin/bash

# Deploy para ambiente PREVIEW (Vercel Preview)
# Objetivo: publicar o MESMO commit que será promovido para produção (reprodutível).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOY - AMBIENTE PREVIEW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Carregar tokens
source scripts/carregar-env.sh 2>/dev/null || true

# Verificar se Vercel token está configurado
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN não configurado!"
  echo "   Adicione no .env.local: VERCEL_TOKEN=seu_token (crie em https://vercel.com/account/tokens)"
  echo "   Ou execute: bash CONFIGURAR_TOKENS.sh"
  exit 1
fi

# Definir ambiente
export NODE_ENV=production
export VERCEL_ENV=preview
# Garantir AUTH_SECRET para o build (fallback se não estiver no .env.local)
export AUTH_SECRET="${AUTH_SECRET:-build_secret_fallback_for_preview}"

# Incrementar versão (patch) – garante identificador único por deploy
DEPLOY_VERSION=$(node scripts/version-manager.js increment patch)
echo "📌 Versão deste deploy: $DEPLOY_VERSION"
echo ""

# Gerar variáveis de build
echo "📦 Gerando variáveis de build..."
node scripts/pre-build.js

# Carregar variáveis de build
if [ -f .env.build ]; then
  export $(grep -v '^#' .env.build | xargs)
fi

# Executar testes
# echo ""
# echo "🧪 Executando testes..."
# npm run test:ci

# Build
echo ""
echo "🔨 Executando build..."
npm run build

# Verificar build
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Build falhou!"
  exit 1
fi

# Gerar artefato prebuilt do Vercel (para promoção reprodutível)
echo ""
echo "📦 Gerando artefato prebuilt (vercel build)..."
bash scripts/vercel-com-token.sh build

# Deploy no Vercel (Preview) usando prebuilt
echo ""
echo "🚀 Fazendo deploy no Vercel (Preview)..."
bash scripts/vercel-com-token.sh deploy --prebuilt

# Verificar deploy
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deploy PREVIEW concluído com sucesso!"
  echo ""
  echo "🧾 Registrando sign-off local do Preview..."
  mkdir -p .release
  GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
  cat > .release/preview.json <<EOF
{
  "environment": "preview",
  "gitSha": "${GIT_SHA}",
  "version": "${NEXT_PUBLIC_VERSION:-V1.0.000}",
  "build": "${NEXT_PUBLIC_BUILD:-${GIT_SHA}}",
  "at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
  echo "   Arquivo: .release/preview.json"
  echo ""
  echo "📋 Informações:"
  echo "   Versão: ${NEXT_PUBLIC_VERSION}"
  echo "   Build: ${NEXT_PUBLIC_BUILD}"
  echo "   Ambiente: PREVIEW"
  echo ""
  echo "🔗 URL será exibida acima"
else
  echo ""
  echo "❌ Deploy falhou!"
  exit 1
fi
