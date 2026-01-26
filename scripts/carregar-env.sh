#!/bin/bash

# Script para carregar variáveis de ambiente do .env.local
# Use: source scripts/carregar-env.sh

ENV_FILE="/Users/macbookpro/Projetos/MAURICIOZANIN-HUB/.env.local"

if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    echo "✅ Variáveis de ambiente carregadas de .env.local"
else
    echo "⚠️  Arquivo .env.local não encontrado"
    echo "   Execute: bash CONFIGURAR_TOKENS.sh"
fi
