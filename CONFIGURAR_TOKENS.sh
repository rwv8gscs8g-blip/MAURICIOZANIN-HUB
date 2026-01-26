#!/bin/bash

# Script para configurar tokens de forma segura
# Execute: bash CONFIGURAR_TOKENS.sh

echo "🔐 Configuração de Tokens para Automação"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar se .env.local existe
ENV_FILE="/Users/macbookpro/Projetos/MAURICIOZANIN-HUB/.env.local"

if [ -f "$ENV_FILE" ]; then
    echo "⚠️  Arquivo .env.local já existe"
    read -p "Deseja sobrescrever? (s/n): " sobrescrever
    if [ "$sobrescrever" != "s" ]; then
        echo "Operação cancelada"
        exit 0
    fi
fi

echo "📋 Vamos configurar os tokens. Cole cada token quando solicitado:"
echo ""

# GitHub Token
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  GITHUB PERSONAL ACCESS TOKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Crie em: https://github.com/settings/tokens"
echo "Scopes: 'repo' (acesso completo)"
echo ""
read -sp "Cole o token GitHub (não será exibido): " GITHUB_TOKEN
echo ""

# Vercel Token
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  VERCEL ACCESS TOKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Crie em: https://vercel.com/account/tokens"
echo ""
read -sp "Cole o token Vercel (não será exibido): " VERCEL_TOKEN
echo ""

# Neon API Key
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  NEON DATABASE API KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Crie em: https://console.neon.tech → Settings → API Keys"
echo ""
read -sp "Cole o token Neon (não será exibido): " NEON_API_KEY
echo ""

# Database URL
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  DATABASE URL (Neon PostgreSQL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Formato: postgresql://user:password@host:5432/database"
echo ""
read -sp "Cole a DATABASE_URL (não será exibido): " DATABASE_URL
echo ""

# LinkedIn (Opcional)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  LINKEDIN API (Opcional - quando aprovado)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "Deseja configurar LinkedIn agora? (s/n): " config_linkedin

LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
LINKEDIN_ACCESS_TOKEN=""
LINKEDIN_ORG_ID=""

if [ "$config_linkedin" = "s" ]; then
    echo ""
    read -p "LINKEDIN_CLIENT_ID (77863f22nm5iqx): " LINKEDIN_CLIENT_ID
    LINKEDIN_CLIENT_ID=${LINKEDIN_CLIENT_ID:-77863f22nm5iqx}
    
    read -sp "LINKEDIN_CLIENT_SECRET: " LINKEDIN_CLIENT_SECRET
    echo ""
    
    read -sp "LINKEDIN_ACCESS_TOKEN: " LINKEDIN_ACCESS_TOKEN
    echo ""
    
    read -p "LINKEDIN_ORG_ID (urn:li:organization:...): " LINKEDIN_ORG_ID
    echo ""
fi

# Criar arquivo .env.local
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Criando arquivo .env.local..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > "$ENV_FILE" <<EOF
# Tokens para Automação CLI
# ⚠️  NUNCA COMMITE ESTE ARQUIVO!

# GitHub
GITHUB_TOKEN=${GITHUB_TOKEN}

# Vercel
VERCEL_TOKEN=${VERCEL_TOKEN}

# Neon Database
NEON_API_KEY=${NEON_API_KEY}
DATABASE_URL=${DATABASE_URL}

# LinkedIn API (quando aprovado)
LINKEDIN_CLIENT_ID=${LINKEDIN_CLIENT_ID}
LINKEDIN_CLIENT_SECRET=${LINKEDIN_CLIENT_SECRET}
LINKEDIN_ACCESS_TOKEN=${LINKEDIN_ACCESS_TOKEN}
LINKEDIN_ORG_ID=${LINKEDIN_ORG_ID}

# Site
NEXT_PUBLIC_SITE_URL=https://mauriciozanin.com.br
EOF

echo "✅ Arquivo .env.local criado!"
echo ""

# Configurar Git para usar token
echo "🔧 Configurando Git para usar token GitHub..."
if [ ! -z "$GITHUB_TOKEN" ]; then
    # Configurar credential helper
    git config --global credential.helper osxkeychain
    
    # Testar autenticação
    echo ""
    echo "🧪 Testando autenticação GitHub..."
    GIT_ASKPASS=echo GIT_TERMINAL_PROMPT=0 git ls-remote https://${GITHUB_TOKEN}@github.com/rwv8gscs8g-blip/MAURICIOZANIN-HUB.git > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ GitHub: Autenticação OK"
    else
        echo "⚠️  GitHub: Verifique o token"
    fi
fi

# Configurar Vercel CLI
echo ""
echo "🔧 Configurando Vercel CLI..."
if command -v vercel &> /dev/null; then
    if [ ! -z "$VERCEL_TOKEN" ]; then
        echo "$VERCEL_TOKEN" | vercel login --token
        if [ $? -eq 0 ]; then
            echo "✅ Vercel: Login OK"
        else
            echo "⚠️  Vercel: Verifique o token"
        fi
    fi
else
    echo "⚠️  Vercel CLI não instalado. Execute: npm i -g vercel"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Tokens salvos em: .env.local (não será commitado)"
echo ""
echo "📋 Próximos passos:"
echo "   1. O assistente pode usar esses tokens via CLI"
echo "   2. Tokens estão seguros (não commitados)"
echo "   3. Para usar: source .env.local (ou carregar automaticamente)"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Nunca commite o arquivo .env.local"
echo "   - Revogue tokens se suspeitar de comprometimento"
echo "   - Use escopos mínimos necessários"
echo ""
