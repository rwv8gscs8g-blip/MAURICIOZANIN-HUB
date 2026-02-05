#!/bin/bash

# Deploy para ambiente PRODUCTION (Vercel Production)
# Regra: só permite produção quando houver Preview aprovado no MESMO commit (sign-off).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOY - AMBIENTE PRODUCTION"
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

# Gate: exigir sign-off de preview no mesmo commit
if [ ! -f ".release/preview.json" ]; then
  echo "❌ Sign-off de PREVIEW não encontrado (.release/preview.json)."
  echo "   Primeiro rode: npm run deploy:preview"
  exit 1
fi

if [ ! -f ".release/qa.json" ]; then
  echo "❌ Sign-off de QA não encontrado (.release/qa.json)."
  echo "   Execute o checklist (docs/QA_FUNCIONAL_CHECKLIST.md) e rode: bash scripts/qa-signoff.sh"
  exit 1
fi

GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
PREVIEW_SHA="$(node -e "try{process.stdout.write(JSON.parse(require('fs').readFileSync('.release/preview.json','utf8')).gitSha||'')}catch(e){process.stdout.write('')}" )"
PREVIEW_VERSION="$(node -e "try{process.stdout.write(JSON.parse(require('fs').readFileSync('.release/preview.json','utf8')).version||'')}catch(e){process.stdout.write('')}" )"
PREVIEW_BUILD="$(node -e "try{process.stdout.write(JSON.parse(require('fs').readFileSync('.release/preview.json','utf8')).build||'')}catch(e){process.stdout.write('')}" )"

export NEXT_PUBLIC_VERSION="${PREVIEW_VERSION:-${NEXT_PUBLIC_VERSION}}"
export NEXT_PUBLIC_BUILD="${PREVIEW_BUILD:-${NEXT_PUBLIC_BUILD}}"

QA_SHA="$(node -e "try{const j=JSON.parse(require('fs').readFileSync('.release/qa.json','utf8'));process.stdout.write(j.gitSha||'')}catch(e){process.stdout.write('')}" )"
QA_APPROVED="$(node -e "try{const j=JSON.parse(require('fs').readFileSync('.release/qa.json','utf8'));process.stdout.write(j.approved===true?'1':'0')}catch(e){process.stdout.write('0')}" )"
if [ "$QA_APPROVED" != "1" ] || [ -z "$QA_SHA" ] || [ "$QA_SHA" != "$GIT_SHA" ]; then
  echo "❌ QA não aprovado para este commit."
  echo "   Commit atual: $GIT_SHA"
  echo "   QA sha:       ${QA_SHA:-<vazio>}"
  exit 1
fi

if [ -z "$PREVIEW_SHA" ] || [ "$PREVIEW_SHA" != "$GIT_SHA" ]; then
  echo "❌ Preview não corresponde ao commit atual."
  echo "   Commit atual:   $GIT_SHA"
  echo "   Commit preview: ${PREVIEW_SHA:-<vazio>}"
  echo "   Refaça o Preview para este commit antes de promover para produção."
  exit 1
fi

if [ ! -d ".vercel/output" ]; then
  echo "❌ Artefato prebuilt (.vercel/output) não encontrado."
  echo "   Rode Preview (que executa 'vercel build') antes de promover."
  exit 1
fi

# Confirmação
echo "⚠️  ATENÇÃO: Você está fazendo deploy em PRODUÇÃO!"
echo "   Commit (build): $GIT_SHA"
read -p "Deseja continuar? (sim/y ou n para cancelar): " confirmacao
confirmacao=$(echo "$confirmacao" | tr '[:upper:]' '[:lower:]' | tr -d ' ')
if [ "$confirmacao" != "sim" ] && [ "$confirmacao" != "y" ] && [ "$confirmacao" != "s" ]; then
  echo "❌ Deploy cancelado pelo usuário"
  exit 0
fi

# Definir ambiente
export NODE_ENV=production
export VERCEL_ENV=production

# Deploy no Vercel (Production) usando o MESMO prebuilt do Preview
echo ""
echo "🚀 Fazendo deploy no Vercel (Production)..."
bash scripts/vercel-com-token.sh deploy --prebuilt --prod

# Verificar deploy
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deploy PRODUCTION concluído com sucesso!"
  echo ""
  echo "🧾 Registrando sign-off local de Produção..."
  mkdir -p .release
  cat > .release/production.json <<EOF
{
  "environment": "production",
  "gitSha": "${GIT_SHA}",
  "version": "${NEXT_PUBLIC_VERSION:-V1.0.000}",
  "build": "${NEXT_PUBLIC_BUILD:-${GIT_SHA}}",
  "at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
  echo "   Arquivo: .release/production.json"
  echo ""
  echo "📋 Informações:"
  echo "   Versão: ${NEXT_PUBLIC_VERSION}"
  echo "   Build: ${NEXT_PUBLIC_BUILD}"
  echo "   Ambiente: PRODUCTION"
  echo ""
  echo "🔗 URL: https://mauriciozanin.com.br"
else
  echo ""
  echo "❌ Deploy falhou!"
  exit 1
fi
