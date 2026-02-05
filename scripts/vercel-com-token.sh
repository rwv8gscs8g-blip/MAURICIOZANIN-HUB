#!/bin/bash

# Script para executar comandos Vercel com token carregado
# Uso: bash scripts/vercel-com-token.sh "comando vercel"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Arquivo .env.local não encontrado em $ROOT_DIR"
    exit 1
fi

# Carregar variáveis
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Usar npx vercel (não precisa instalação global)
if [ $# -eq 0 ]; then
    npx vercel --token="$VERCEL_TOKEN" --version
else
    npx vercel --token="$VERCEL_TOKEN" "$@"
fi
