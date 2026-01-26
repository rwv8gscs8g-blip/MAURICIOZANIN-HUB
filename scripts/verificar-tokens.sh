#!/bin/bash

# Script para verificar se tokens estão configurados
# Execute: bash scripts/verificar-tokens.sh

echo "🔍 Verificando Tokens Configurados..."
echo ""

ENV_FILE="/Users/macbookpro/Projetos/MAURICIOZANIN-HUB/.env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Arquivo .env.local não encontrado"
    echo "   Execute: bash CONFIGURAR_TOKENS.sh"
    exit 1
fi

# Carregar variáveis
source "$ENV_FILE" 2>/dev/null

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
