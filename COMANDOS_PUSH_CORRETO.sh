#!/bin/bash

# Script para fazer push no GitHub - Versão Corrigida
# Execute: bash COMANDOS_PUSH_CORRETO.sh

echo "🚀 Configurando push para GitHub..."
echo ""

# Verificar se está no diretório correto
if [ ! -d ".git" ]; then
    echo "❌ Erro: Não é um repositório Git"
    echo "Execute: cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB"
    exit 1
fi

# Verificar remote
echo "📋 Verificando remote..."
if git remote | grep -q "^origin$"; then
    echo "✅ Remote 'origin' configurado:"
    git remote -v
    echo ""
    read -p "Deseja alterar o remote? (s/n): " resposta
    if [ "$resposta" = "s" ]; then
        git remote remove origin
        echo "✅ Remote removido"
    fi
fi

# Configurar remote se não existir
if ! git remote | grep -q "^origin$"; then
    echo ""
    echo "🔗 Configurando remote..."
    git remote add origin https://github.com/rwv8gscs8g-blip/MAURICIOZANIN-HUB.git
    echo "✅ Remote configurado"
fi

# Configurar credential helper
echo ""
echo "🔐 Configurando credential helper (salva token no keychain)..."
git config --global credential.helper osxkeychain
echo "✅ Credential helper configurado"

# Verificar commits
COMMITS=$(git log --oneline | wc -l | tr -d ' ')
echo ""
echo "📝 Commits locais: $COMMITS"

if [ "$COMMITS" -eq 0 ]; then
    echo "⚠️  Nenhum commit encontrado!"
    exit 1
fi

# Mostrar últimos commits
echo ""
echo "📋 Últimos commits:"
git log --oneline -5

# Instruções
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  IMPORTANTE - ANTES DE FAZER PUSH:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Crie um Personal Access Token no GitHub:"
echo "   👉 https://github.com/settings/tokens"
echo ""
echo "2. Clique em 'Generate new token' → 'Generate new token (classic)'"
echo ""
echo "3. Configure:"
echo "   - Note: Mauricio Zanin Hub"
echo "   - Scopes: Marque 'repo' (acesso completo)"
echo "   - Expiration: Escolha (90 dias ou 'No expiration')"
echo ""
echo "4. Gere e COPIE o token (você não verá novamente!)"
echo ""
echo "5. Quando fizer push:"
echo "   - Username: rwv8gscs8g-blip"
echo "   - Password: COLE O TOKEN (não sua senha!)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Já criou o token e está pronto? (s/n): " pronto

if [ "$pronto" != "s" ]; then
    echo ""
    echo "⏸️  Crie o token primeiro e execute o script novamente"
    echo "   Ou acesse: https://github.com/settings/tokens"
    exit 0
fi

# Fazer push
echo ""
echo "📤 Fazendo push para GitHub..."
echo ""
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ PUSH REALIZADO COM SUCESSO!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Acesse seu repositório:"
    echo "   https://github.com/rwv8gscs8g-blip/MAURICIOZANIN-HUB"
    echo ""
    echo "📋 Próximo passo - Vercel:"
    echo "   1. Vá para: https://vercel.com/dashboard"
    echo "   2. Clique em 'Add New...' → 'Project'"
    echo "   3. Selecione o repositório 'MAURICIOZANIN-HUB'"
    echo "   4. Siga: VERCEL_SETUP_PASSO_A_PASSO.md"
    echo ""
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ ERRO AO FAZER PUSH"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Possíveis causas:"
    echo "1. Token inválido ou expirado"
    echo "2. Token sem permissão 'repo'"
    echo "3. Repositório não existe no GitHub"
    echo ""
    echo "Soluções:"
    echo "1. Verifique se criou o token corretamente"
    echo "2. Use o token como senha (não sua senha do GitHub)"
    echo "3. Crie o repositório: https://github.com/new"
    echo ""
    echo "📚 Veja: SOLUCAO_AUTENTICACAO_GITHUB.md"
fi
