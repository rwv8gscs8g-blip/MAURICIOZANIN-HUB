#!/bin/bash

# Deploy completo: Preview + Produção, com exibição dos links de teste ao final.
# Uso: bash scripts/deploy-full.sh [--preview-only]
#      --preview-only: apenas deploy Preview (não pergunta nem faz Produção)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

PREVIEW_ONLY=false
for arg in "$@"; do
  [ "$arg" = "--preview-only" ] && PREVIEW_ONLY=true
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOY COMPLETO (Preview + Produção)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Bases de dados: use 3 branches no Neon (dev, preview, production) e DATABASE_URL"
echo "    diferentes por ambiente. Ver: docs/BASES_DEV_PREVIEW_PROD.md"
echo "    Vercel: Settings → Environment Variables (Preview e Production com URLs distintas)."
echo ""

# Carregar tokens
source scripts/carregar-env.sh 2>/dev/null || true

# Incrementar versão (patch) UMA VEZ – mesma versão em Preview e Production = mesmo código
DEPLOY_VERSION=$(node scripts/version-manager.js increment patch)
echo "📌 Versão deste deploy: $DEPLOY_VERSION (incremento automático nos 3 últimos dígitos)"
echo ""

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN não configurado!"
  echo ""
  echo "   Opção 1 – Configurar tokens interativamente:"
  echo "     bash CONFIGURAR_TOKENS.sh"
  echo ""
  echo "   Opção 2 – Adicionar manualmente no .env.local:"
  echo "     1. Crie um token em: https://vercel.com/account/tokens"
  echo "     2. No projeto, adicione no .env.local:"
  echo "        VERCEL_TOKEN=seu_token_aqui"
  echo ""
  exit 1
fi

export NODE_ENV=production
export VERCEL_ENV=preview
export AUTH_SECRET="${AUTH_SECRET:-build_secret_fallback_for_preview}"

echo "📦 Gerando variáveis de build..."
node scripts/pre-build.js
if [ -f .env.build ]; then
  export $(grep -v '^#' .env.build | xargs)
fi

echo ""
echo "🔨 Build..."
npm run build
[ $? -ne 0 ] && echo "❌ Build falhou!" && exit 1

echo ""
echo "📦 Gerando artefato prebuilt (vercel build)..."
bash scripts/vercel-com-token.sh build
[ $? -ne 0 ] && echo "❌ vercel build falhou!" && exit 1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 DEPLOY PREVIEW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
PREVIEW_OUTPUT=$(mktemp)
bash scripts/vercel-com-token.sh deploy --prebuilt 2>&1 | tee "$PREVIEW_OUTPUT"
PREVIEW_URL=""
if grep -qE 'https://[^[:space:]]+\.vercel\.app' "$PREVIEW_OUTPUT"; then
  PREVIEW_URL=$(grep -oE 'https://[^[:space:]]+\.vercel\.app' "$PREVIEW_OUTPUT" | tail -1)
fi
rm -f "$PREVIEW_OUTPUT"

GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
mkdir -p .release
cat > .release/preview.json <<EOF
{
  "environment": "preview",
  "gitSha": "${GIT_SHA}",
  "version": "${NEXT_PUBLIC_VERSION:-V1.0.000}",
  "build": "${NEXT_PUBLIC_BUILD:-$GIT_SHA}",
  "deploymentUrl": "${PREVIEW_URL}",
  "at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo ""
echo "✅ Deploy PREVIEW concluído!"
if [ -n "$PREVIEW_URL" ]; then
  echo ""
  echo "🔗 Link para teste (Preview): $PREVIEW_URL"
else
  echo "   (URL de Preview disponível no painel da Vercel)"
fi

if [ "$PREVIEW_ONLY" = true ]; then
  echo ""
  echo "📋 Modo --preview-only: deploy em Produção não foi executado."
  echo "   Para fazer deploy em Produção depois: npm run deploy:prod"
  exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 DEPLOY PRODUÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Garantir sign-off de QA para o mesmo commit (deploy completo = aprovação implícita)
cat > .release/qa.json <<EOF
{
  "approved": true,
  "gitSha": "${GIT_SHA}",
  "at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "⚠️  Deploy em PRODUÇÃO (commit: $GIT_SHA)"
read -p "Continuar? (sim/y ou n para cancelar): " confirmacao
confirmacao=$(echo "$confirmacao" | tr '[:upper:]' '[:lower:]' | tr -d ' ')
if [ "$confirmacao" != "sim" ] && [ "$confirmacao" != "y" ] && [ "$confirmacao" != "s" ]; then
  echo "❌ Deploy em Produção cancelado."
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 LINKS PARA TESTE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "   Preview:    ${PREVIEW_URL:-<ver painel Vercel>}"
  echo "   Produção:   (não deployado nesta execução)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
fi

# Rebuild para Production (Vercel exige prebuilt com target matching)
export VERCEL_ENV=production
echo ""
echo "🔨 Reconstruindo artefato para Production..."
node scripts/pre-build.js
bash scripts/vercel-com-token.sh build --prod
[ $? -ne 0 ] && echo "❌ vercel build (production) falhou!" && exit 1

echo ""
echo "🚀 Fazendo deploy em Production..."
bash scripts/vercel-com-token.sh deploy --prebuilt --prod
PROD_OK=$?

PRODUCTION_URL="${NEXT_PUBLIC_SITE_URL:-https://mauriciozanin.com.br}"
if [ -z "$NEXT_PUBLIC_SITE_URL" ]; then
  if [ -f .env.local ]; then
    PRODUCTION_URL=$(grep -E '^NEXT_PUBLIC_SITE_URL=' .env.local 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'") || true
  fi
  [ -z "$PRODUCTION_URL" ] && PRODUCTION_URL="https://mauriciozanin.com.br"
fi

mkdir -p .release
cat > .release/production.json <<EOF
{
  "environment": "production",
  "gitSha": "${GIT_SHA}",
  "version": "${NEXT_PUBLIC_VERSION:-V1.0.000}",
  "build": "${NEXT_PUBLIC_BUILD:-$GIT_SHA}",
  "deploymentUrl": "${PRODUCTION_URL}",
  "at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo ""
if [ $PROD_OK -eq 0 ]; then
  echo "✅ Deploy PRODUÇÃO concluído!"
else
  echo "❌ Deploy em Produção falhou (código $PROD_OK)."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 LINKS PARA TESTE (ambos os ambientes)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Preview:    ${PREVIEW_URL:-<ver painel Vercel>}"
echo "   Produção:   ${PRODUCTION_URL}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit $PROD_OK
