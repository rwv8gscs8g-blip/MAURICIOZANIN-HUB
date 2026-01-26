#!/bin/bash

# Deploy para ambiente PREVIEW (Vercel Preview)
# Incrementa versão e faz deploy no Vercel

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOY - AMBIENTE PREVIEW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB

# Carregar tokens
source scripts/carregar-env.sh 2>/dev/null || true

# Verificar se Vercel token está configurado
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN não configurado!"
  echo "   Execute: bash CONFIGURAR_TOKENS.sh"
  exit 1
fi

# Definir ambiente
export NODE_ENV=production
export VERCEL_ENV=preview

# Gerar variáveis de build (incrementa versão)
echo "📦 Gerando variáveis de build e incrementando versão..."
node scripts/pre-build.js

# Carregar variáveis de build
if [ -f .env.build ]; then
  export $(grep -v '^#' .env.build | xargs)
fi

# Executar testes
echo ""
echo "🧪 Executando testes..."
npm run test:ci

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

# Deploy no Vercel (Preview)
echo ""
echo "🚀 Fazendo deploy no Vercel (Preview)..."
bash scripts/vercel-com-token.sh deploy --prebuilt

# Verificar deploy
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deploy PREVIEW concluído com sucesso!"
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
