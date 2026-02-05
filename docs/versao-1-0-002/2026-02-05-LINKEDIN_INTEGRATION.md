# Integração LinkedIn - Documentação Completa

## Visão Geral

Este documento descreve como integrar o site com o LinkedIn para sincronizar automaticamente posts e publicações na linha do tempo do site.

## Opções de Integração

### 1. LinkedIn Posts API (v2) - Recomendado

**Vantagens:**
- Acesso oficial e suportado pela Microsoft/LinkedIn
- Permite buscar posts de um perfil específico
- Suporte a diferentes tipos de conteúdo (texto, imagens, vídeos)

**Limitações:**
- Requer autenticação OAuth 2.0
- Necessita aprovação da Microsoft para acesso
- Rate limits aplicáveis

**Documentação Oficial:**
- [Posts API - LinkedIn | Microsoft Learn](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2025-02)
- [LinkedIn Developer Portal](https://developer.linkedin.com/)

### 2. LinkedIn Webhooks

**Vantagens:**
- Notificações em tempo real quando novos posts são publicados
- Não requer polling constante

**Limitações:**
- Disponível apenas para aplicações com casos de uso aprovados
- Requer validação HMACSHA256
- Configuração mais complexa

**Documentação:**
- [Developer Webhooks](https://learn.microsoft.com/en-us/linkedin/shared/api-guide/developer-webhooks)
- [Webhook Validation](https://learn.microsoft.com/en-us/linkedin/shared/api-guide/webhook-validation)

### 3. Solução Híbrida (Recomendada)

**Combinação de:**
- Webhooks para notificações em tempo real
- Posts API para sincronização periódica e recuperação de histórico

## Passo a Passo de Implementação

### Passo 1: Criar Aplicação no LinkedIn Developer Portal ✅

**Status:** Aplicação já criada!
- **App Name**: Mauricio Zanin Hub
- **Client ID**: `77863f22nm5iqx`
- **App Type**: Standalone app
- **Created**: Jan 26, 2026

### Passo 2: Solicitar Acesso aos Produtos da API (IMPORTANTE)

Com base na configuração atual, você precisa solicitar acesso aos seguintes produtos:

#### 🔴 OBRIGATÓRIO - Para exibir posts na timeline do site:

**1. Pages Data Portability API** (Standard Tier)
- **Descrição**: "Provides access to LinkedIn Pages data to developers upon Page admin authorization."
- **Por que precisa**: Esta API permite buscar posts de uma página do LinkedIn para exibir na timeline do seu site.
- **Ação**: Clique em **"Request access"** ao lado deste produto
- **Use Case**: "Preciso exibir automaticamente os posts da minha página do LinkedIn na timeline do meu site pessoal (mauriciozanin.com.br) para manter os visitantes atualizados sobre minhas publicações."

#### 🟡 RECOMENDADO - Para publicar conteúdo no LinkedIn:

**2. Community Management API** (Development Tier)
- **Descrição**: "Enable brands to build a presence and engage with their LinkedIn community."
- **Por que precisa**: Permite publicar conteúdo programaticamente no LinkedIn (opcional, se quiser automatizar publicações).
- **Ação**: Clique em **"Request access"** ao lado deste produto
- **Use Case**: "Desejo automatizar a publicação de notícias e artigos do meu site no LinkedIn para ampliar o alcance do conteúdo."

#### 🟢 OPCIONAL - Para autenticação:

**3. Sign In with LinkedIn using OpenID Connect** (Standard Tier)
- **Descrição**: "Using the OpenID Connect standard."
- **Por que precisa**: Necessário se quiser autenticar usuários ou obter permissões adicionais.
- **Ação**: Clique em **"Request access"** se precisar de autenticação

**4. Share on LinkedIn** (Default Tier)
- **Descrição**: "Amplify your content by sharing it on LinkedIn."
- **Por que precisa**: Alternativa mais simples para compartilhar conteúdo (se não usar Community Management API).
- **Ação**: Clique em **"Request access"** se preferir esta opção

### Passo 3: Preencher Formulário de Solicitação

Após clicar em "Request access", você será direcionado para um formulário onde deve explicar:

**Para Pages Data Portability API:**
```
Use Case: Exibir timeline de posts do LinkedIn no site pessoal
Descrição: Preciso integrar os posts da minha página do LinkedIn 
(mauriciozanin.com.br) no meu site pessoal para criar uma timeline 
automática que exiba minhas publicações mais recentes. Isso permite 
que visitantes vejam minhas atualizações profissionais diretamente 
no site, mantendo o conteúdo sincronizado.
```

**Para Community Management API:**
```
Use Case: Automatizar publicação de conteúdo no LinkedIn
Descrição: Desejo automatizar a publicação de artigos e notícias 
do meu site (mauriciozanin.com.br) na minha página do LinkedIn, 
permitindo que o conteúdo seja compartilhado automaticamente 
quando publicado no site.
```

### Passo 4: Configurar Variáveis de Ambiente

Adicione ao `.env.local`:

```env
LINKEDIN_CLIENT_ID=seu_client_id
LINKEDIN_CLIENT_SECRET=seu_client_secret
LINKEDIN_ACCESS_TOKEN=seu_access_token
LINKEDIN_ORG_ID=seu_organization_id
LINKEDIN_WEBHOOK_SECRET=seu_webhook_secret
```

### Passo 5: Obter Access Token e Organization ID

**IMPORTANTE:** Para usar a Pages Data Portability API, você precisa:

1. **Organization ID (URN)**: 
   - Vá em "Settings" → "Products" na sua aplicação
   - Ou use a API para buscar: `GET /v2/organizationalEntityAcls`
   - O URN terá formato: `urn:li:organization:12345678`

2. **Access Token**:
   - Vá em "Auth" na sua aplicação
   - Use OAuth 2.0 flow ou gere um token de desenvolvimento
   - Para produção, implemente renovação automática de tokens

**Opção A: OAuth 2.0 Flow (Recomendado para produção)**

```bash
# 1. Gerar URL de autorização
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&state={STATE}&scope=r_liteprofile r_basicprofile r_organization_social

# 2. Após autorização, trocar code por token
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -d "grant_type=authorization_code" \
  -d "code={CODE}" \
  -d "redirect_uri={REDIRECT_URI}" \
  -d "client_id={CLIENT_ID}" \
  -d "client_secret={CLIENT_SECRET}"
```

**Opção B: Token de Desenvolvimento (Apenas para testes)**

1. No Developer Portal, vá em "Auth"
2. Gere um token de teste
3. Use este token temporariamente

### Passo 6: Implementar API Route para Buscar Posts

**Usando Pages Data Portability API:**

A API permite buscar posts de uma página usando o endpoint:
```
GET /v2/organizationalEntityShares?q=organizationalEntity&organizationalEntity=urn:li:organization:{ORG_ID}
```

**Headers necessários:**
```
Authorization: Bearer {ACCESS_TOKEN}
Linkedin-Version: 202501
X-Restli-Protocol-Version: 2.0.0
```

Veja `src/app/api/linkedin/posts/route.ts` (será criado)

### Passo 7: Configurar Webhook (Opcional)

**Nota:** Webhooks podem não estar disponíveis para todos os produtos. 
Verifique na documentação da Pages Data Portability API se suporta webhooks.

1. No Developer Portal, vá em "Webhooks"
2. Adicione endpoint: `https://seu-dominio.com/api/linkedin/webhook`
3. LinkedIn enviará um `challengeCode` para validação
4. Implemente validação HMACSHA256 (veja `src/app/api/linkedin/webhook/route.ts`)

### Passo 8: Criar Job de Sincronização

Implemente um cron job ou função serverless que:
1. Busca novos posts via Posts API
2. Compara com posts já salvos no banco
3. Insere novos posts na tabela `LinkedInPost`
4. Cria eventos na timeline se necessário

## Estrutura de Dados

### Tabela LinkedInPost (Prisma)

```prisma
model LinkedInPost {
  id          String   @id @default(cuid())
  postId      String   @unique // ID único do LinkedIn
  content     String   @db.Text
  imageUrl    String?
  linkUrl     String?
  publishedAt DateTime
  likes       Int      @default(0)
  comments    Int      @default(0)
  shares      Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Sincronização com Timeline

Posts do LinkedIn podem ser automaticamente adicionados à timeline como eventos do tipo `PUBLICATION`:

```typescript
// Quando um novo post é detectado
const event = await prisma.event.create({
  data: {
    title: "Publicação no LinkedIn",
    description: post.content.substring(0, 200),
    date: post.publishedAt,
    type: EventType.PUBLICATION,
    category: EventCategory.SOCIAL,
    url: post.linkUrl || `https://linkedin.com/posts/${post.postId}`,
    thumbnailUrl: post.imageUrl,
  }
});
```

## Automação

### Opção 1: Vercel Cron Jobs

```typescript
// vercel.json
{
  "crons": [{
    "path": "/api/linkedin/sync",
    "schedule": "0 */6 * * *" // A cada 6 horas
  }]
}
```

### Opção 2: GitHub Actions

```yaml
# .github/workflows/linkedin-sync.yml
name: LinkedIn Sync
on:
  schedule:
    - cron: '0 */6 * * *' # A cada 6 horas
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Sync LinkedIn Posts
        run: curl -X POST https://seu-dominio.com/api/linkedin/sync
```

### Opção 3: Serverless Function (AWS Lambda, etc.)

Configure uma função serverless que executa periodicamente.

## Segurança

1. **Nunca exponha tokens no frontend**
2. **Use variáveis de ambiente** para credenciais
3. **Valide webhooks** com HMACSHA256
4. **Implemente rate limiting** para evitar bloqueios
5. **Armazene tokens de forma segura** (considerar rotação automática)

## Troubleshooting

### Erro: "Insufficient permissions"
- Verifique se todas as permissões necessárias foram aprovadas
- Confirme que o token tem os scopes corretos

### Erro: "Rate limit exceeded"
- Implemente retry com backoff exponencial
- Reduza frequência de sincronização
- Use webhooks quando possível

### Posts não aparecem
- Verifique se o `postId` está sendo salvo corretamente
- Confirme que a data de publicação está correta
- Verifique logs da API

## Próximos Passos

1. ✅ Criar estrutura de dados
2. ✅ Implementar API routes
3. ⏳ Configurar autenticação OAuth
4. ⏳ Implementar sincronização automática
5. ⏳ Configurar webhooks
6. ⏳ Adicionar à timeline automaticamente
