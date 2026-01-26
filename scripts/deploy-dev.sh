#!/bin/bash

# Deploy para ambiente DEV (local)
# Não incrementa versão, apenas testa build

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOY - AMBIENTE DEV"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB

# Carregar tokens
source scripts/carregar-env.sh 2>/dev/null || true

# Definir ambiente
export NODE_ENV=development
export VERCEL_ENV=development

# Gerar variáveis de build (sem incrementar versão)
echo "📦 Gerando variáveis de build..."
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
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build DEV concluído com sucesso!"
  echo ""
  echo "📋 Informações:"
  echo "   Versão: ${NEXT_PUBLIC_VERSION:-V1.0.000}"
  echo "   Build: ${NEXT_PUBLIC_BUILD:-000000}"
  echo "   Ambiente: DEV"
  echo ""
  echo "▶️  Para testar localmente: npm run start"
else
  echo ""
  echo "❌ Build falhou!"
  exit 1
fi
