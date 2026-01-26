#!/bin/bash

# Script para fazer push no GitHub - Versão Final
# Execute: bash COMANDOS_PUSH_FINAL.sh

echo "🚀 Configurando push para GitHub..."
echo ""

# Verificar se já tem remote
if git remote | grep -q "^origin$"; then
    echo "⚠️  Remote 'origin' já existe:"
    git remote -v
    echo ""
    echo "Deseja remover e configurar novamente? (s/n)"
    read -r resposta
    if [ "$resposta" = "s" ]; then
        git remote remove origin
        echo "✅ Remote removido"
    else
        echo "Usando remote existente..."
    fi
fi

# Verificar se tem remote
if ! git remote | grep -q "^origin$"; then
    echo ""
    echo "📋 Cole a URL do seu repositório GitHub:"
    echo "   Exemplo: https://github.com/rwv8gscs8g-blip/MAURICIOZANIN-HUB.git"
    read -r GITHUB_URL

    if [ -z "$GITHUB_URL" ]; then
        echo "❌ URL não fornecida. Operação cancelada."
        exit 1
    fi

    # Adicionar remote
    echo ""
    echo "🔗 Adicionando remote..."
    git remote add origin "$GITHUB_URL"
    echo "✅ Remote configurado"
fi

# Verificar status
echo ""
echo "📊 Status do repositório:"
git status --short

# Verificar se há commits
COMMITS=$(git log --oneline | wc -l | tr -d ' ')
echo ""
echo "📝 Commits locais: $COMMITS"

if [ "$COMMITS" -eq 0 ]; then
    echo "⚠️  Nenhum commit encontrado. Faça commit primeiro!"
    exit 1
fi

# Fazer push
echo ""
echo "📤 Fazendo push para GitHub..."
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Username: rwv8gscs8g-blip"
echo "   - Password: Use seu Personal Access Token (não sua senha!)"
echo "   - Crie token em: https://github.com/settings/tokens"
echo ""
echo "Pressione Enter para continuar..."
read -r

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push realizado com sucesso!"
    echo ""
    echo "🌐 Acesse seu repositório:"
    git remote get-url origin | sed 's/\.git$//'
    echo ""
    echo "📋 Próximo passo:"
    echo "   1. Vá para o Vercel Dashboard"
    echo "   2. Clique em 'Add New...' → 'Project'"
    echo "   3. Selecione o repositório MAURICIOZANIN-HUB"
    echo "   4. Siga: VERCEL_SETUP_PASSO_A_PASSO.md"
else
    echo ""
    echo "❌ Erro ao fazer push"
    echo ""
    echo "Possíveis soluções:"
    echo "1. Verifique se criou o repositório no GitHub"
    echo "2. Use Personal Access Token (não senha)"
    echo "3. Verifique a URL do repositório"
    echo ""
    echo "📚 Veja: COMO_CRIAR_TOKEN_GITHUB.md"
fi
