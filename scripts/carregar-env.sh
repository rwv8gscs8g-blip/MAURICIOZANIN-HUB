#!/bin/bash

# Script para carregar variáveis de ambiente do .env.local
# Use: cd /caminho/MAURICIOZANIN-HUB && source scripts/carregar-env.sh

# 1) Sempre tentar primeiro no diretório atual (onde você deu cd)
if [ -f "$PWD/.env.local" ]; then
  ENV_FILE="$PWD/.env.local"
# 2) Senão, achar raiz pelo caminho do script (resolve sempre a partir do script)
elif [ -n "${BASH_SOURCE[0]}" ] && [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." 2>/dev/null && pwd)/.env.local" ]; then
  ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." 2>/dev/null && pwd)"
  ENV_FILE="${ROOT_DIR}/.env.local"
elif [ -n "$0" ] && [ "$0" != "zsh" ] && [ "$0" != "bash" ] && [ -f "$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)/.env.local" ]; then
  ROOT_DIR="$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)"
  ENV_FILE="${ROOT_DIR}/.env.local"
else
  ENV_FILE="$PWD/.env.local"
fi

if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
    echo "✅ Variáveis de ambiente carregadas de .env.local"
else
    echo "⚠️  Arquivo .env.local não encontrado em: $ENV_FILE"
    echo "   Execute: bash CONFIGURAR_TOKENS.sh"
fi
