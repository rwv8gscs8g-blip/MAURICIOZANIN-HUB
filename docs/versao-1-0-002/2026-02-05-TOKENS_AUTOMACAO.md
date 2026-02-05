# 🤖 Tokens para Automação Completa

## 🎯 Objetivo

Configurar tokens para que o assistente possa gerenciar todos os serviços diretamente via CLI, sem necessidade de interação manual.

## 📋 Serviços que Precisam de Tokens

### 1. ✅ GitHub (Já Configurado - SSH)
- **Status**: Funcionando via SSH
- **Token necessário**: Apenas se quiser usar HTTPS
- **Uso**: Push, pull, criar branches, gerenciar repositório

### 2. ⏳ Vercel
- **Status**: Precisa configurar
- **Token**: Vercel Access Token
- **Uso**: Deploy, gerenciar projetos, configurar domínios

### 3. ⏳ Neon Database
- **Status**: Precisa configurar
- **Token**: Neon API Key
- **Uso**: Executar migrations, gerenciar banco

### 4. ⏳ LinkedIn API
- **Status**: Aguardando aprovação
- **Tokens**: Client ID, Secret, Access Token
- **Uso**: Sincronizar posts, webhooks

## 🚀 Como Configurar (Rápido)

### Opção 1: Script Automático (Recomendado)

```bash
cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB
bash CONFIGURAR_TOKENS.sh
```

O script vai:
- Pedir cada token
- Criar arquivo `.env.local` seguro
- Configurar Git e Vercel CLI
- Testar autenticação

### Opção 2: Manual

Crie o arquivo `.env.local` manualmente:

```env
# GitHub (opcional - SSH já funciona)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Vercel
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Neon
NEON_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://user:password@host:5432/database

# LinkedIn (quando aprovado)
LINKEDIN_CLIENT_ID=77863f22nm5iqx
LINKEDIN_CLIENT_SECRET=seu_client_secret
LINKEDIN_ACCESS_TOKEN=seu_access_token
LINKEDIN_ORG_ID=urn:li:organization:seu_org_id
```

## 🔗 Links para Criar Tokens

1. **GitHub**: https://github.com/settings/tokens
2. **Vercel**: https://vercel.com/account/tokens
3. **Neon**: https://console.neon.tech → Settings → API Keys
4. **LinkedIn**: https://developer.linkedin.com/ (quando aprovado)

## ✅ Após Configurar

O assistente poderá executar automaticamente:

```bash
# GitHub
git push
git pull
git branch
git tag

# Vercel
vercel deploy
vercel domains add
vercel env add

# Neon
npx prisma migrate deploy
npx prisma db push

# LinkedIn (quando aprovado)
# Sincronização automática via API
```

## 🔒 Segurança

- ✅ `.env.local` está no `.gitignore`
- ✅ Tokens não serão commitados
- ✅ Use escopos mínimos necessários
- ✅ Revogue tokens antigos regularmente

## 📝 Verificar Configuração

```bash
# Verificar se tokens estão configurados
cat .env.local | grep -E "TOKEN|KEY" | cut -d'=' -f1

# Testar GitHub
git push

# Testar Vercel
vercel whoami

# Testar Neon
npx prisma db pull
```

---

**Execute:** `bash CONFIGURAR_TOKENS.sh` para configurar tudo de uma vez!
