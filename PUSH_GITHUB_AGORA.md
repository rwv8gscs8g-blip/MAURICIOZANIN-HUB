# 🚀 Push para GitHub - Comandos Prontos

## ✅ Status

- ✅ Erro `cleanUrl` duplicado corrigido
- ✅ Alterações no mini currículo commitadas
- ✅ 6 commits prontos para push
- ⏳ Aguardando configuração do GitHub

## 📋 Passo 1: Criar Repositório no GitHub

**IMPORTANTE:** Você precisa criar o repositório no GitHub primeiro!

1. **Acesse:** https://github.com/new
2. **Preencha:**
   - **Repository name**: `MAURICIOZANIN-HUB`
   - **Description**: "Hub de Autoridade - Consultoria em Governança e Compras Públicas"
   - **Visibility**: Private (recomendado)
   - **NÃO marque** nenhuma opção (README, .gitignore, license)
3. **Clique em:** "Create repository"

## 🔐 Passo 2: Criar Personal Access Token

O GitHub não aceita senhas. Você precisa de um token:

1. **Acesse:** https://github.com/settings/tokens
2. **Clique em:** "Generate new token" → "Generate new token (classic)"
3. **Preencha:**
   - **Note**: `Mauricio Zanin Hub`
   - **Expiration**: Escolha (90 dias ou "No expiration")
   - **Scopes**: Marque **`repo`** (acesso completo)
4. **Clique em:** "Generate token"
5. **COPIE O TOKEN** (você não verá novamente!)
   - Será algo como: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🚀 Passo 3: Fazer Push

Execute estes comandos no terminal:

```bash
cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB

# Adicionar remote (substitua rwv8gscs8g-blip se seu usuário for diferente)
git remote add origin https://github.com/rwv8gscs8g-blip/MAURICIOZANIN-HUB.git

# Verificar
git remote -v

# Fazer push
git push -u origin main
```

**Quando pedir credenciais:**
- **Username**: `rwv8gscs8g-blip`
- **Password**: Cole o **token** que você criou (não sua senha!)

## ✅ Verificar

Após o push, acesse:
https://github.com/rwv8gscs8g-blip/MAURICIOZANIN-HUB

Você deve ver todos os arquivos e os 6 commits.

## 🎯 Próximo Passo: Vercel

Após o push funcionar:

1. Vá para o Vercel Dashboard
2. Clique em "Add New..." → "Project"
3. O repositório `MAURICIOZANIN-HUB` aparecerá
4. Clique em "Import"

---

**⚠️ Lembre-se:** Use o **token** como senha, não sua senha do GitHub!
