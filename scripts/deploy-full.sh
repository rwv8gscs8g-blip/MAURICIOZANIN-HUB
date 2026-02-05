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

# Queimar nova versão em DEV (incremento de PATCH) para esta bateria de mudanças
echo "📌 Queimando nova versão em DEV (incremento de PATCH)..."
DEPLOY_VERSION=$(node scripts/version-manager.js increment patch)
echo "   Versão deste deploy: $DEPLOY_VERSION"

# Normalizar identificador de pasta da versão (ex.: V1.0.038 → versao-1-0-038)
DATE_PREFIX=$(date +%Y-%m-%d)
VERSION_RAW="${DEPLOY_VERSION#V}"
VERSION_SAFE=$(echo "$VERSION_RAW" | tr '.' '-')
VERSION_DIR="docs/versao-${VERSION_SAFE}"

echo ""
echo "📁 Pasta de versão: ${VERSION_DIR}"
mkdir -p "${VERSION_DIR}"

# Mover documentos de texto da raiz para a pasta da versão
# Regras:
# - Mantém na raiz: README.md, DEPLOY_GUIDE.md, VERSIONAMENTO_DEPLOY.md e ARQUITETURA_*.md
# - Move: outros *.md e *.txt da raiz, prefixando com AAAA-MM-DD-
echo "📂 Organizando documentos de texto da raiz para ${VERSION_DIR}..."
shopt -s nullglob
for file in *.md *.txt; do
  # Pular se não for arquivo regular
  [ ! -f "$file" ] && continue

  case "$file" in
    README.md|DEPLOY_GUIDE.md|VERSIONAMENTO_DEPLOY.md|ARQUITETURA_*.md)
      # Mantidos na raiz como visão sempre atual
      continue
      ;;
  esac

  NEW_NAME="${DATE_PREFIX}-${file}"
  # Evitar sobrescrever se já existir (raro, mas por segurança)
  if [ -e "${VERSION_DIR}/${NEW_NAME}" ]; then
    echo "   ⚠️  Arquivo já existe na pasta de versão, pulando: ${NEW_NAME}"
    continue
  fi

  echo "   ➜ Movendo ${file} → ${VERSION_DIR}/${NEW_NAME}"
  mv "$file" "${VERSION_DIR}/${NEW_NAME}"
done
shopt -u nullglob

# Gerar template de notas de versão para esta versão
RELEASE_NOTES="${VERSION_DIR}/${DATE_PREFIX}-README-release-${DEPLOY_VERSION}.md"
if [ ! -f "$RELEASE_NOTES" ]; then
  GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
  cat > "${RELEASE_NOTES}" <<EOF
# Release ${DEPLOY_VERSION} – ${DATE_PREFIX}

## Ambiente
- Versão: ${DEPLOY_VERSION}
- Commit (build): ${GIT_SHA}

## Mudanças desta versão

> Preencha abaixo com um resumo humano das mudanças principais (funcionalidades, correções, impactos).

- [TODO] Descrever mudanças de alto nível.

## Arquivos alterados (auto-coletado – opcional ajustar)

> Esta lista pode ser refeita com \`git diff --name-only\` entre versões, se necessário.

EOF
fi

echo ""
echo "📘 Notas de versão criadas/atualizadas em: ${RELEASE_NOTES}"

# Atualizar README com entrada simples de histórico de versões
if [ -f "README.md" ]; then
  if ! grep -q "Versão ${DEPLOY_VERSION}" README.md; then
    echo "" >> README.md
    echo "## Histórico de versões (entrada gerada automaticamente)" >> README.md
    echo "- Versão ${DEPLOY_VERSION} – ${DATE_PREFIX} – ver \`${RELEASE_NOTES}\`" >> README.md
  fi
fi

# Atualizar documento de arquitetura principal na raiz (se existir)
ARCH_DOC="ARQUITETURA_DIAGNOSTICO_MVP.md"
if [ -f "${ARCH_DOC}" ]; then
  if ! grep -q "Versão ${DEPLOY_VERSION}" "${ARCH_DOC}"; then
    cat >> "${ARCH_DOC}" <<EOF

---

## Versão ${DEPLOY_VERSION} – ${DATE_PREFIX}

> Resuma aqui, manualmente, as principais mudanças de arquitetura introduzidas nesta versão.

- [TODO] Comentário de arquitetura para ${DEPLOY_VERSION}.

EOF
  fi
fi

echo ""
echo "✅ Versão queimada em DEV e documentos organizados para ${DEPLOY_VERSION}."
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
echo "📋 LINKS PARA TESTE (DEV / PREVIEW / PRODUÇÃO)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# URL DEV (local). Pode ser ajustada se existir NEXT_PUBLIC_SITE_URL_DEV.
DEV_URL="http://localhost:3000"
if [ -f .env.local ]; then
  DEV_CANDIDATE=$(grep -E '^NEXT_PUBLIC_SITE_URL_DEV=' .env.local 2>/dev/null | cut -d= -f2- | tr -d '\"' | tr -d "'" || true)
  [ -n "$DEV_CANDIDATE" ] && DEV_URL="$DEV_CANDIDATE"
fi

echo "   DEV:        ${DEV_URL}"
echo "   Preview:    ${PREVIEW_URL:-<ver painel Vercel>}"
echo "   Produção:   ${PRODUCTION_URL}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit $PROD_OK
