#!/bin/bash

# Gera um arquivo de sign-off local para permitir deploy em produção.
# Regra: deve existir um preview prévio no mesmo commit (.release/preview.json).

set -e

cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB

mkdir -p .release

if [ ! -f ".release/preview.json" ]; then
  echo "❌ Sign-off de PREVIEW não encontrado (.release/preview.json)."
  echo "   Primeiro rode: npm run deploy:preview"
  exit 1
fi

GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
PREVIEW_SHA="$(node -e "try{process.stdout.write(JSON.parse(require('fs').readFileSync('.release/preview.json','utf8')).gitSha||'')}catch(e){process.stdout.write('')}" )"

if [ -z "$PREVIEW_SHA" ] || [ "$PREVIEW_SHA" != "$GIT_SHA" ]; then
  echo "❌ Preview não corresponde ao commit atual."
  echo "   Commit atual:   $GIT_SHA"
  echo "   Commit preview: ${PREVIEW_SHA:-<vazio>}"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ QA SIGN-OFF (Preview → Produção)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Checklist: docs/QA_FUNCIONAL_CHECKLIST.md"
echo "Commit: $GIT_SHA"
echo ""

read -p "Após executar o checklist em DEV e PREVIEW, digite 'APROVADO' para gerar o sign-off: " confirmacao
if [ "$confirmacao" != "APROVADO" ]; then
  echo "❌ Sign-off cancelado."
  exit 0
fi

read -p "Nome (responsável pela validação): " responsavel
read -p "URL do Preview (opcional): " previewUrl

cat > .release/qa.json <<EOF
{
  "approved": true,
  "gitSha": "${GIT_SHA}",
  "approvedBy": "${responsavel}",
  "previewUrl": "${previewUrl}",
  "at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "checklist": "docs/QA_FUNCIONAL_CHECKLIST.md"
}
EOF

echo ""
echo "✅ Sign-off gerado:"
echo "   .release/qa.json"
echo "Agora você pode rodar: npm run deploy:prod"

