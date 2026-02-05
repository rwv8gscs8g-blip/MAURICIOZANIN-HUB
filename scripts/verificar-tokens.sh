#!/bin/bash

# Script para verificar se tokens estão configurados
# Execute: bash scripts/verificar-tokens.sh

echo "🔍 Verificando Tokens Configurados..."
echo ""

ROOT_DIR="/Users/macbookpro/Projetos/MAURICIOZANIN-HUB"
ENV_BASE="$ROOT_DIR/.env"
ENV_LOCAL="$ROOT_DIR/.env.local"

# Carregar primeiro .env (base) e depois .env.local (overrides), se existirem
if [ -f "$ENV_BASE" ]; then
    # shellcheck disable=SC1090
    source "$ENV_BASE" 2>/dev/null
else
    echo "⚠️  Arquivo .env não encontrado em $ROOT_DIR"
fi

if [ -f "$ENV_LOCAL" ]; then
    # shellcheck disable=SC1090
    source "$ENV_LOCAL" 2>/dev/null
else
    echo "⚠️  Arquivo .env.local não encontrado em $ROOT_DIR (use CONFIGURAR_TOKENS.sh para criá-lo)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Status dos Tokens:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# GitHub
if [ ! -z "$GITHUB_TOKEN" ]; then
    TOKEN_PREVIEW=$(echo "$GITHUB_TOKEN" | cut -c1-10)
    echo "✅ GitHub Token: ${TOKEN_PREVIEW}..."
else
    echo "❌ GitHub Token: Não configurado"
fi

# Vercel
if [ ! -z "$VERCEL_TOKEN" ]; then
    TOKEN_PREVIEW=$(echo "$VERCEL_TOKEN" | cut -c1-10)
    echo "✅ Vercel Token: ${TOKEN_PREVIEW}..."
else
    echo "❌ Vercel Token: Não configurado"
fi

# Neon
if [ ! -z "$NEON_API_KEY" ]; then
    TOKEN_PREVIEW=$(echo "$NEON_API_KEY" | cut -c1-10)
    echo "✅ Neon API Key: ${TOKEN_PREVIEW}..."
else
    echo "❌ Neon API Key: Não configurado"
fi

# Database
if [ ! -z "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL: Configurado"
else
    echo "❌ DATABASE_URL: Não configurado"
fi

# LinkedIn
if [ ! -z "$LINKEDIN_ACCESS_TOKEN" ]; then
    TOKEN_PREVIEW=$(echo "$LINKEDIN_ACCESS_TOKEN" | cut -c1-10)
    echo "✅ LinkedIn Token: ${TOKEN_PREVIEW}..."
else
    echo "⏳ LinkedIn Token: Aguardando aprovação da API"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testando Conexões:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Testar GitHub
if [ ! -z "$GITHUB_TOKEN" ]; then
    echo -n "GitHub: "
    GIT_ASKPASS=echo GIT_TERMINAL_PROMPT=0 git ls-remote https://${GITHUB_TOKEN}@github.com/rwv8gscs8g-blip/MAURICIOZANIN-HUB.git > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ OK"
    else
        echo "❌ Erro de autenticação"
    fi
fi

# Testar Vercel
if command -v vercel &> /dev/null; then
    echo -n "Vercel: "
    vercel whoami > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ OK"
    else
        echo "❌ Não autenticado (execute: vercel login)"
    fi
else
    echo "Vercel CLI: ❌ Não instalado"
fi

# Testar Database
if [ ! -z "$DATABASE_URL" ]; then
    echo -n "Database: "
    # Teste básico de formato
    if [[ "$DATABASE_URL" == postgresql://* ]]; then
        echo "✅ Formato válido"
    else
        echo "⚠️  Formato pode estar incorreto"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Verificação concluída!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
