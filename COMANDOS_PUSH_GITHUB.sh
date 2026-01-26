#!/bin/bash

# Script para conectar e fazer push no GitHub
# Execute: bash COMANDOS_PUSH_GITHUB.sh

echo "🚀 Configurando push para GitHub..."
echo ""

# Verificar se já tem remote
if git remote | grep -q "^origin$"; then
    echo "⚠️  Remote 'origin' já existe"
    echo "Deseja remover e adicionar novamente? (s/n)"
    read -r resposta
    if [ "$resposta" = "s" ]; then
        git remote remove origin
        echo "✅ Remote removido"
    else
        echo "❌ Operação cancelada"
        exit 1
    fi
fi

# Solicitar URL do repositório
echo "📋 Cole a URL do seu repositório GitHub:"
echo "   Exemplo: https://github.com/seu-usuario/MAURICIOZANIN-HUB.git"
read -r GITHUB_URL

if [ -z "$GITHUB_URL" ]; then
    echo "❌ URL não fornecida. Operação cancelada."
    exit 1
fi

# Adicionar remote
echo ""
echo "🔗 Adicionando remote..."
git remote add origin "$GITHUB_URL"

# Verificar remote
echo ""
echo "✅ Remote configurado:"
git remote -v

# Fazer push
echo ""
echo "📤 Fazendo push para GitHub..."
echo "   (Você pode precisar autenticar)"
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push realizado com sucesso!"
    echo "🌐 Acesse seu repositório no GitHub para verificar"
    echo ""
    echo "📋 Próximo passo:"
    echo "   1. Vá para o Vercel"
    echo "   2. Clique em 'Add New...' → 'Project'"
    echo "   3. Selecione o repositório MAURICIOZANIN-HUB"
else
    echo ""
    echo "❌ Erro ao fazer push"
    echo "   Verifique:"
    echo "   - URL do repositório está correta"
    echo "   - Você tem permissão para fazer push"
    echo "   - Autenticação está correta (use Personal Access Token)"
fi
