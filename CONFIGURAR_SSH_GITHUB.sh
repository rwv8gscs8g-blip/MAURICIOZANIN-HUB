#!/bin/bash

# Script para configurar SSH e fazer push no GitHub
# Execute: bash CONFIGURAR_SSH_GITHUB.sh

echo "🔐 Configurando SSH para GitHub..."
echo ""

# Verificar se já tem chave SSH
if [ -f ~/.ssh/id_ed25519 ] || [ -f ~/.ssh/id_rsa ]; then
    echo "✅ Chave SSH encontrada"
    if [ -f ~/.ssh/id_ed25519 ]; then
        SSH_KEY=~/.ssh/id_ed25519
    else
        SSH_KEY=~/.ssh/id_rsa
    fi
    echo "Chave: $SSH_KEY"
else
    echo "📝 Gerando nova chave SSH..."
    read -p "Digite seu email do GitHub: " GITHUB_EMAIL
    
    if [ -z "$GITHUB_EMAIL" ]; then
        echo "❌ Email não fornecido"
        exit 1
    fi
    
    # Gerar chave SSH
    ssh-keygen -t ed25519 -C "$GITHUB_EMAIL" -f ~/.ssh/id_ed25519 -N ""
    SSH_KEY=~/.ssh/id_ed25519
    echo "✅ Chave SSH gerada"
fi

# Mostrar chave pública
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SUA CHAVE SSH PÚBLICA (copie tudo):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat ${SSH_KEY}.pub
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. Copie a chave acima (todo o conteúdo)"
echo ""
echo "2. Acesse: https://github.com/settings/keys"
echo ""
echo "3. Clique em 'New SSH key'"
echo ""
echo "4. Preencha:"
echo "   - Title: MacBook Pro - Mauricio Zanin Hub"
echo "   - Key: Cole a chave que copiou"
echo ""
echo "5. Clique em 'Add SSH key'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Já adicionou a chave SSH no GitHub? (s/n): " adicionou

if [ "$adicionou" != "s" ]; then
    echo ""
    echo "⏸️  Adicione a chave SSH no GitHub primeiro"
    echo "   Acesse: https://github.com/settings/keys"
    exit 0
fi

# Testar conexão SSH
echo ""
echo "🔍 Testando conexão SSH com GitHub..."
ssh -T git@github.com 2>&1 | head -3

# Alterar remote para SSH
echo ""
echo "🔗 Alterando remote para SSH..."
cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB
git remote set-url origin git@github.com:rwv8gscs8g-blip/MAURICIOZANIN-HUB.git

echo "✅ Remote alterado para SSH"
echo ""
echo "📋 Remote configurado:"
git remote -v

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
    echo "🌐 Acesse: https://github.com/rwv8gscs8g-blip/MAURICIOZANIN-HUB"
    echo ""
    echo "📋 Próximo passo - Vercel:"
    echo "   1. Vá para: https://vercel.com/dashboard"
    echo "   2. Clique em 'Add New...' → 'Project'"
    echo "   3. Selecione 'MAURICIOZANIN-HUB'"
    echo ""
else
    echo ""
    echo "❌ Erro ao fazer push"
    echo "   Verifique se adicionou a chave SSH no GitHub"
fi
