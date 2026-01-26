#!/bin/bash

# Script para executar comandos com tokens carregados automaticamente
# Uso: bash scripts/executar-com-tokens.sh "comando aqui"

ENV_FILE="/Users/macbookpro/Projetos/MAURICIOZANIN-HUB/.env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Arquivo .env.local não encontrado"
    echo "   Execute: bash CONFIGURAR_TOKENS.sh"
    exit 1
fi

# Carregar variáveis de ambiente
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Executar comando passado como argumento
if [ $# -eq 0 ]; then
    echo "Uso: bash scripts/executar-com-tokens.sh 'comando'"
    exit 1
fi

# Executar comando com tokens carregados
eval "$@"
