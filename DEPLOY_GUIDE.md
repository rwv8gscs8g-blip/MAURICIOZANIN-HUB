# Guia de Deploy - Mauricio Zanin Hub

## 🚀 Deploy para Produção

Este guia descreve o processo completo de deploy do site para produção com domínio customizado `mauriciozanin.com.br`.

## 📋 Pré-requisitos

1. ✅ Conta no Vercel (https://vercel.com)
2. ✅ Domínio `mauriciozanin.com.br` configurado
3. ✅ Banco de dados Neon PostgreSQL configurado
4. ✅ Variáveis de ambiente preparadas
5. ✅ Repositório Git (GitHub, GitLab, etc.)

## 🔧 Passo 1: Configurar Vercel

### 1.1. Criar Projeto no Vercel

1. Acesse: https://vercel.com/new
2. Conecte seu repositório GitHub/GitLab
3. Selecione o repositório `MAURICIOZANIN-HUB`
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm ci`

### 1.2. Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings** → **Environment Variables** e adicione:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Site
NEXT_PUBLIC_SITE_URL=https://mauriciozanin.com.br

# LinkedIn (quando aprovado)
LINKEDIN_CLIENT_ID=seu_client_id
LINKEDIN_CLIENT_SECRET=seu_client_secret
LINKEDIN_ACCESS_TOKEN=seu_access_token
LINKEDIN_ORG_ID=urn:li:organization:12345678
LINKEDIN_WEBHOOK_SECRET=seu_webhook_secret
```

**Importante:** Marque todas como **Production**, **Preview** e **Development**.

### 1.3. Configurar Build Settings

No Vercel, vá em **Settings** → **General**:

- **Node.js Version**: 20.x
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`

## 🌐 Passo 2: Configurar Domínio Customizado

### 2.1. Adicionar Domínio no Vercel

1. No painel do Vercel, vá em **Settings** → **Domains**
2. Clique em **Add Domain**
3. Digite: `mauriciozanin.com.br`
4. Clique em **Add**

### 2.2. Configurar DNS no Registrador

O Vercel fornecerá instruções específicas. Geralmente você precisa:

#### Opção A: Usar Nameservers do Vercel (Recomendado)

1. No seu registrador de domínio, altere os nameservers para:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

#### Opção B: Configurar Registros DNS

Adicione os seguintes registros no seu DNS:

**Para domínio principal:**
```
Tipo: A
Nome: @
Valor: 76.76.21.21
TTL: 3600
```

**Para www:**
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
TTL: 3600
```

### 2.3. Verificar SSL

O Vercel configura SSL automaticamente via Let's Encrypt. Aguarde alguns minutos após configurar o DNS.

## 🗄️ Passo 3: Configurar Banco de Dados

### 3.1. Neon PostgreSQL

1. Acesse: https://neon.tech
2. Crie um novo projeto
3. Copie a connection string
4. Adicione como `DATABASE_URL` no Vercel

### 3.2. Executar Migrations

Após o primeiro deploy, execute as migrations:

```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

Ou configure um script de build no Vercel:

```json
{
  "scripts": {
    "postbuild": "prisma migrate deploy"
  }
}
```

## 🧪 Passo 4: Testes Automatizados

### 4.1. GitHub Actions

Os workflows já estão configurados em `.github/workflows/`:

- **CI Pipeline**: Executa testes e build em cada PR
- **Deploy Pipeline**: Faz deploy automático para produção

### 4.2. Executar Testes Localmente

```bash
# Executar todos os testes
npm test

# Modo watch
npm run test:watch

# Com coverage
npm run test:coverage
```

### 4.3. Verificar Testes no CI

1. Faça push para `main` ou abra um PR
2. GitHub Actions executará automaticamente
3. Verifique o status em: **Actions** tab no GitHub

## 🚀 Passo 5: Deploy

### 5.1. Deploy Automático

O deploy é automático quando você faz push para `main`:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

O Vercel detectará o push e fará deploy automaticamente.

### 5.2. Deploy Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 5.3. Verificar Deploy

1. Acesse: https://vercel.com/dashboard
2. Verifique o status do último deploy
3. Clique no deploy para ver logs
4. Teste o site em: https://mauriciozanin.com.br

## 🔍 Passo 6: Validação Pós-Deploy

### Checklist de Validação

- [ ] Site carrega corretamente
- [ ] Todas as páginas funcionam (`/`, `/sobre`, `/trajetoria`, etc.)
- [ ] Imagens carregam corretamente
- [ ] Formulários funcionam (se houver)
- [ ] Links internos funcionam
- [ ] SEO está correto (meta tags, JSON-LD)
- [ ] SSL está ativo (https://)
- [ ] Performance está boa (Lighthouse)
- [ ] Mobile está responsivo

### Testes de Integridade

```bash
# Testar build localmente
npm run build
npm start

# Executar testes
npm test

# Verificar lint
npm run lint
```

## 🔄 Passo 7: Monitoramento

### 7.1. Vercel Analytics

1. Ative Vercel Analytics no painel
2. Monitore performance e erros
3. Configure alertas

### 7.2. Logs

Acesse logs em tempo real:

```bash
vercel logs
```

Ou no painel do Vercel: **Deployments** → Selecione deploy → **Functions** → Ver logs

### 7.3. Health Checks

Configure um health check endpoint:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}
```

## 🛡️ Passo 8: Segurança

### 8.1. Headers de Segurança

Já configurados no `vercel.json`:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy

### 8.2. Variáveis de Ambiente

- ✅ Nunca commite `.env` files
- ✅ Use Vercel Environment Variables
- ✅ Rotacione secrets regularmente

### 8.3. Rate Limiting

Configure rate limiting nas API routes se necessário.

## 📊 Passo 9: Performance

### 9.1. Otimizações

- ✅ Imagens otimizadas com `next/image`
- ✅ Code splitting automático
- ✅ Lazy loading de componentes
- ✅ Cache de API responses

### 9.2. Lighthouse

Execute Lighthouse regularmente:

```bash
# Via Chrome DevTools
# Ou via CLI
npm install -g lighthouse
lighthouse https://mauriciozanin.com.br
```

## 🔧 Troubleshooting

### Build Fails

1. Verifique logs no Vercel
2. Teste build local: `npm run build`
3. Verifique variáveis de ambiente
4. Verifique dependências

### Domínio Não Funciona

1. Verifique DNS (pode levar até 48h)
2. Verifique SSL no Vercel
3. Limpe cache do DNS: `dig mauriciozanin.com.br`

### Erros em Produção

1. Verifique logs: `vercel logs`
2. Verifique variáveis de ambiente
3. Teste localmente com `.env.production`
4. Verifique banco de dados

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Next.js Docs**: https://nextjs.org/docs

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Testes passando
- [ ] Build funcionando
- [ ] Domínio configurado
- [ ] SSL ativo
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados conectado
- [ ] Site validado
- [ ] Performance OK
- [ ] SEO configurado
- [ ] Monitoramento ativo

---

**Última atualização:** 26 de Janeiro de 2026
