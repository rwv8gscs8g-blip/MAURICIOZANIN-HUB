# 🔐 Configuração de Tokens para Automação Completa

Este guia mostra como configurar tokens para que o assistente possa gerenciar GitHub, Vercel, Neon e outros serviços diretamente via CLI.

## 📋 Tokens Necessários

### 1. GitHub Personal Access Token (Classic)

**Para:** Push, criar branches, gerenciar repositório

**Como criar:**
1. Acesse: https://github.com/settings/tokens
2. Clique em: "Generate new token" → "Generate new token (classic)"
3. Configure:
   - **Note**: `Mauricio Zanin Hub - CLI Automation`
   - **Expiration**: "No expiration" (ou 1 ano)
   - **Scopes**: Marque `repo` (acesso completo)
4. Gere e copie o token

**Como configurar:**
```bash
# Opção 1: Via variável de ambiente (recomendado)
export GITHUB_TOKEN="seu_token_aqui"

# Opção 2: Via Git credential helper
git config --global credential.helper store
echo "https://rwv8gscs8g-blip:seu_token@github.com" > ~/.git-credentials
```

### 2. Vercel Access Token

**Para:** Deploy, gerenciar projetos, configurar domínios

**Como criar:**
1. Acesse: https://vercel.com/account/tokens
2. Clique em: "Create Token"
3. Configure:
   - **Token Name**: `Mauricio Zanin Hub - CLI`
   - **Scope**: "Full Account" (ou específico)
   - **Expiration**: Escolha (recomendo 1 ano)
4. Gere e copie o token

**Como configurar:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login com token
vercel login --token seu_vercel_token

# Ou via variável de ambiente
export VERCEL_TOKEN="seu_token_aqui"
```

### 3. Neon Database Token

**Para:** Gerenciar banco de dados, executar migrations

**Como criar:**
1. Acesse: https://console.neon.tech
2. Vá em: Settings → API Keys
3. Clique em: "Create API Key"
4. Copie o token

**Como configurar:**
```bash
export NEON_API_KEY="seu_token_aqui"
export DATABASE_URL="postgresql://user:password@host:5432/database"
```

### 4. LinkedIn API Tokens (Quando Aprovado)

**Para:** Sincronizar posts, webhooks

**Como configurar:**
```bash
export LINKEDIN_CLIENT_ID="seu_client_id"
export LINKEDIN_CLIENT_SECRET="seu_client_secret"
export LINKEDIN_ACCESS_TOKEN="seu_access_token"
export LINKEDIN_ORG_ID="urn:li:organization:seu_org_id"
```

## 🔒 Armazenamento Seguro

### Opção 1: Arquivo .env.local (Recomendado)

Crie `/Users/macbookpro/Projetos/MAURICIOZANIN-HUB/.env.local`:

```env
# GitHub
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

**⚠️ IMPORTANTE:** Este arquivo está no `.gitignore` e NÃO será commitado!

### Opção 2: macOS Keychain (Mais Seguro)

```bash
# GitHub
security add-generic-password -a "github" -s "mauriciozanin-hub" -w "seu_token" -U

# Vercel
security add-generic-password -a "vercel" -s "mauriciozanin-hub" -w "seu_token" -U

# Recuperar
security find-generic-password -a "github" -s "mauriciozanin-hub" -w
```

### Opção 3: Variáveis de Ambiente do Sistema

Adicione ao `~/.zshrc` ou `~/.bash_profile`:

```bash
export GITHUB_TOKEN="seu_token"
export VERCEL_TOKEN="seu_token"
export NEON_API_KEY="seu_token"
```

Depois execute: `source ~/.zshrc`

## 🚀 Script de Configuração Automática

Execute para configurar tudo de uma vez:

```bash
bash CONFIGURAR_TOKENS.sh
```

## ✅ Verificar Configuração

```bash
# Verificar GitHub
echo $GITHUB_TOKEN | cut -c1-10

# Verificar Vercel
vercel whoami

# Verificar Neon
echo $NEON_API_KEY | cut -c1-10
```

## 📚 Próximos Passos

Após configurar os tokens, o assistente poderá:
- ✅ Fazer push/pull no GitHub
- ✅ Fazer deploy no Vercel
- ✅ Executar migrations no Neon
- ✅ Sincronizar LinkedIn (quando aprovado)
- ✅ Gerenciar domínios e configurações

---

**⚠️ SEGURANÇA:**
- Nunca commite tokens no código
- Use `.env.local` (já está no .gitignore)
- Revogue tokens antigos regularmente
- Use escopos mínimos necessários
