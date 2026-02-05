# Configuração Completa do Vercel - Ambiente Isolado

## 🎯 Objetivo

Configurar o projeto **Mauricio Zanin Hub** no Vercel de forma completamente isolada dos outros projetos, garantindo que não haja interferência entre ambientes.

## 📋 Passo 1: Criar Novo Projeto Isolado

### 1.1. Criar Projeto no Vercel

1. **Acesse o Dashboard do Vercel**
   - URL: https://vercel.com/dashboard
   - Faça login com sua conta

2. **Clique em "Add New..." → "Project"**
   - No canto superior direito, clique no botão **"Add New..."**
   - Selecione **"Project"** no dropdown

3. **Importar Repositório do GitHub**
   - Se ainda não conectou o GitHub, clique em **"Import Git Repository"**
   - Autorize o acesso ao GitHub se solicitado
   - Procure pelo repositório: `MAURICIOZANIN-HUB`
   - Clique em **"Import"**

### 1.2. Configurar Nome e Framework

Após importar o repositório, configure:

- **Project Name**: `mauriciozanin-hub` (ou `mauricio-zanin-hub`)
- **Framework Preset**: **Next.js** (deve detectar automaticamente)
- **Root Directory**: `./` (raiz do projeto)
- **Build Command**: `npm run build` (já configurado no `package.json`)
- **Output Directory**: `.next` (padrão do Next.js)
- **Install Command**: `npm ci` (recomendado para produção)

### 1.3. Configurações Avançadas (Importante para Isolamento)

Clique em **"Show Advanced Options"** e configure:

- **Environment Variables**: Vamos configurar depois
- **Build and Development Settings**: 
  - Node.js Version: `20.x` (ou a versão que você está usando)
  - Install Command: `npm ci`
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Development Command: `npm run dev`

## 🔒 Passo 2: Isolamento Completo do Ambiente

### 2.1. Variáveis de Ambiente Específicas

No Vercel, cada projeto tem suas próprias variáveis de ambiente. Configure:

1. **Vá em Settings → Environment Variables**

2. **Adicione as seguintes variáveis** (marcando para Production, Preview e Development):

```env
# Database (específico para este projeto)
DATABASE_URL=postgresql://user:password@host:5432/mauriciozanin_db

# Site URL (específico para este projeto)
NEXT_PUBLIC_SITE_URL=https://mauriciozanin.com.br

# LinkedIn API (quando aprovado)
LINKEDIN_CLIENT_ID=seu_client_id_especifico
LINKEDIN_CLIENT_SECRET=seu_client_secret_especifico
LINKEDIN_ACCESS_TOKEN=seu_access_token_especifico
LINKEDIN_ORG_ID=urn:li:organization:seu_org_id
LINKEDIN_WEBHOOK_SECRET=seu_webhook_secret_especifico

# Prisma
PRISMA_GENERATE_DATAPROXY=1
```

**⚠️ IMPORTANTE:** 
- Cada projeto no Vercel tem variáveis de ambiente **completamente isoladas**
- Variáveis de um projeto **não são acessíveis** por outros projetos
- Use nomes específicos para evitar confusão

### 2.2. Configurar Domínio Isolado

1. **Vá em Settings → Domains**

2. **Adicione Domínio Customizado**
   - Clique em **"Add Domain"**
   - Digite: `mauriciozanin.com.br`
   - Clique em **"Add"**

3. **Configurar Subdomínios (Opcional)**
   - `www.mauriciozanin.com.br` → Redirecionar para domínio principal
   - `staging.mauriciozanin.com.br` → Para ambiente de staging (se necessário)

### 2.3. Isolamento de Branch

Configure branches específicas para este projeto:

1. **Vá em Settings → Git**

2. **Production Branch**: `main` (ou `master`)
   - Apenas commits nesta branch fazem deploy para produção

3. **Preview Branches**: `develop`, `staging`, `feature/*`
   - Branches que geram previews automáticos

4. **Ignored Build Step**: 
   - Deixe vazio ou configure para ignorar commits específicos
   - Exemplo: `git diff HEAD^ HEAD --quiet .`

## 🛡️ Passo 3: Configurações de Segurança e Isolamento

### 3.1. Headers de Segurança (já no vercel.json)

O arquivo `vercel.json` já está configurado com headers de segurança. Verifique se está sendo aplicado:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3.2. Permissões de Acesso

1. **Vá em Settings → Team**

2. **Configure Acesso da Equipe**
   - Adicione apenas pessoas que precisam acessar este projeto
   - Use roles específicos (Viewer, Developer, Admin)

3. **Deploy Protection** (se disponível no seu plano)
   - Ative proteção de deploy para branches críticas
   - Requer aprovação antes de deploy em produção

### 3.3. Isolamento de Funções Serverless

Cada projeto no Vercel tem suas próprias funções serverless isoladas:

- **API Routes**: `/api/*` são isoladas por projeto
- **Serverless Functions**: Cada projeto tem seu próprio ambiente de execução
- **Edge Functions**: Isoladas por projeto

## 🔧 Passo 4: Configurações Específicas do Projeto

### 4.1. Build Settings

No Vercel, vá em **Settings → General**:

- **Node.js Version**: `20.x`
- **Install Command**: `npm ci`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Development Command**: `npm run dev`

### 4.2. Prisma Configuration

Como estamos usando Prisma, configure:

1. **Post-build (recomendado no MVP): apenas `prisma generate`**

```json
{
  "scripts": {
    "postbuild": "prisma generate"
  }
}
```

2. **Importante (MVP)**:
   - Evite `prisma db push` dentro do build do Vercel.
   - Aplique `db push` manualmente por ambiente (com `DATABASE_URL` correto) para reduzir risco.

### 4.3. Environment-Specific Config

Crie diferentes configurações para cada ambiente:

**Production:**
```env
NEXT_PUBLIC_SITE_URL=https://mauriciozanin.com.br
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db
```

**Preview (Staging):**
```env
NEXT_PUBLIC_SITE_URL=https://mauriciozanin-hub-git-develop.vercel.app
DATABASE_URL=postgresql://staging_user:staging_pass@staging_host:5432/staging_db
```

**Development:**
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://dev_user:dev_pass@dev_host:5432/dev_db
```

## 📊 Passo 5: Monitoramento Isolado

### 5.1. Vercel Analytics

1. **Vá em Settings → Analytics**
2. **Ative Vercel Analytics** para este projeto específico
3. Configure alertas específicos para este projeto

### 5.2. Logs e Observability

1. **Vá em Observability** (se disponível no seu plano)
2. Configure monitoramento específico para este projeto
3. Configure alertas para:
   - Erros de build
   - Erros de runtime
   - Performance degradada

### 5.3. Webhooks Isolados

Se precisar de webhooks específicos:

1. **Vá em Settings → Git → Webhooks**
2. Configure webhooks específicos para este projeto
3. URLs de webhook serão únicas para este projeto

## 🔄 Passo 6: Deploy e Validação

### 6.1. Primeiro Deploy

1. **Clique em "Deploy"** após configurar tudo
2. Aguarde o build completar
3. Verifique os logs do build

### 6.2. Validar Isolamento

Após o deploy, valide:

- [ ] URL do projeto é única: `mauriciozanin-hub.vercel.app`
- [ ] Variáveis de ambiente não são compartilhadas com outros projetos
- [ ] Domínio customizado aponta apenas para este projeto
- [ ] Logs são específicos deste projeto
- [ ] Analytics são isolados

### 6.3. Testar Ambiente

1. Acesse: `https://mauriciozanin-hub.vercel.app`
2. Verifique se todas as páginas carregam
3. Teste funcionalidades específicas
4. Verifique se não há interferência de outros projetos

## 📋 Checklist de Configuração Completa

### Configuração Básica
- [ ] Projeto criado no Vercel
- [ ] Repositório GitHub conectado
- [ ] Framework detectado corretamente (Next.js)
- [ ] Build settings configurados

### Isolamento
- [ ] Variáveis de ambiente específicas configuradas
- [ ] Domínio customizado adicionado
- [ ] Branch de produção configurada
- [ ] Permissões de acesso configuradas

### Segurança
- [ ] Headers de segurança ativos
- [ ] SSL/TLS configurado automaticamente
- [ ] Deploy protection ativado (se disponível)

### Banco de Dados
- [ ] DATABASE_URL configurado
- [ ] Prisma configurado para deploy
- [ ] Migrations configuradas

### Monitoramento
- [ ] Analytics ativado
- [ ] Logs configurados
- [ ] Alertas configurados

### Deploy
- [ ] Primeiro deploy realizado com sucesso
- [ ] Site acessível
- [ ] Todas as funcionalidades testadas

## 🎯 Garantias de Isolamento

Com esta configuração, você garante:

1. ✅ **Isolamento de Variáveis**: Cada projeto tem suas próprias variáveis
2. ✅ **Isolamento de Domínio**: Domínio específico para este projeto
3. ✅ **Isolamento de Build**: Builds independentes
4. ✅ **Isolamento de Funções**: API routes isoladas
5. ✅ **Isolamento de Logs**: Logs específicos do projeto
6. ✅ **Isolamento de Analytics**: Métricas isoladas

## 🔍 Verificar Isolamento

### Teste 1: Variáveis de Ambiente
```bash
# No Vercel CLI
vercel env ls

# Deve mostrar apenas variáveis deste projeto
```

### Teste 2: Deploy
- Faça um deploy e verifique que não afeta outros projetos
- Verifique que a URL é única

### Teste 3: Logs
- Acesse logs no Vercel
- Verifique que são específicos deste projeto

## 📞 Próximos Passos

Após configurar o Vercel:

1. ✅ Configurar DNS do domínio
2. ✅ Aplicar schema (MVP) via `npm run prisma:dbpush` por ambiente
3. ✅ Validar todas as funcionalidades
4. ✅ Configurar monitoramento
5. ✅ Documentar processo de deploy

## ⚠️ Importante

- **Nunca compartilhe variáveis de ambiente** entre projetos
- **Use nomes específicos** para evitar confusão
- **Mantenha documentação** de cada projeto isolado
- **Revise permissões** regularmente

---

**Última atualização:** 26 de Janeiro de 2026
