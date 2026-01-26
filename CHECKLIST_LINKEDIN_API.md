# Checklist - Configuração LinkedIn API

## ✅ Status Atual

- [x] Aplicação criada: **Mauricio Zanin Hub**
- [x] Client ID obtido: `77863f22nm5iqx`
- [x] **Produtos da API solicitados** ✅ (26/01/2026)
- [ ] Aprovação recebida ⏳ (Aguardando - até 7 dias úteis)
- [ ] Access Token configurado
- [ ] Organization ID obtido
- [ ] Variáveis de ambiente configuradas
- [ ] Sincronização testada

### 📋 Produtos Solicitados (26/01/2026)

- ⏳ **Pages Data Portability API** ⭐ (PRIORITÁRIO)
- ⏳ **Community Management API**
- ⏳ **Member Data Portability API**
- ⏳ **Events Management API**
- ⏳ **Verified on LinkedIn** (Review in progress)
- ⏳ **Advertising API**
- ⏳ **Lead Sync API**
- ⏳ **Live Events**
- ⏳ **Conversions API**
- ✅ **Share on LinkedIn** (Já adicionado)
- ✅ **Sign In with LinkedIn using OpenID Connect** (Já adicionado)

**Status:** Todas as solicitações foram enviadas com sucesso. Aguardando aprovação (até 7 dias úteis).

## 🔴 AÇÕES NECESSÁRIAS AGORA

### 1. Solicitar Acesso - Pages Data Portability API ⚠️ PRIORIDADE

**Localização:** Aba "Products" → Procure por "Pages Data Portability API"

**⚠️ PROBLEMA COMUM:** Se você pode ver os endpoints mas não vê o botão "Request access":

**Solução 1 - Link Direto:**
1. Acesse diretamente: https://www.linkedin.com/developers/apps/230659564/products/pages-data-portability-api
2. Ou navegue: Products → Procure na lista completa (pode estar em "View all products")

**Solução 2 - Verificar Status:**
1. Verifique se já foi solicitado (status "Pending" ou "Requested")
2. Verifique se você é ADMINISTRATOR da página do LinkedIn
3. Verifique se a página está ativa

**Solução 3 - Contatar Suporte:**
Se não aparecer em lugar nenhum, contate: https://www.linkedin.com/help/linkedin/answer/a1338220

**Passos (quando encontrar o botão):**
1. Clique no botão **"Request access"** ou **"Apply"** ao lado de "Pages Data Portability API"
2. Preencha o formulário com:

   **Use Case:**
   ```
   Exibir timeline de posts do LinkedIn no site pessoal
   ```

   **Descrição Detalhada:**
   ```
   Preciso integrar os posts da minha página do LinkedIn no meu 
   site pessoal (mauriciozanin.com.br) para criar uma timeline 
   automática que exiba minhas publicações mais recentes. Isso 
   permite que visitantes vejam minhas atualizações profissionais 
   diretamente no site, mantendo o conteúdo sincronizado sem 
   necessidade de atualização manual.
   
   A integração será usada apenas para exibir conteúdo público 
   da minha própria página do LinkedIn no meu site pessoal.
   ```

3. Aguarde aprovação (geralmente 1-3 dias úteis)

### 2. Solicitar Acesso - Community Management API (Opcional)

**Localização:** Aba "Products" → Procure por "Community Management API"

**Passos:**
1. Clique no botão **"Request access"** ao lado de "Community Management API"
2. Preencha o formulário com:

   **Use Case:**
   ```
   Automatizar publicação de conteúdo no LinkedIn
   ```

   **Descrição Detalhada:**
   ```
   Desejo automatizar a publicação de artigos e notícias do meu 
   site (mauriciozanin.com.br) na minha página do LinkedIn, 
   permitindo que o conteúdo seja compartilhado automaticamente 
   quando publicado no site. Isso amplia o alcance do conteúdo 
   e mantém as redes sociais atualizadas.
   ```

**Nota:** Esta API é opcional. Se você só quer EXIBIR posts na timeline, 
não precisa desta. Se quiser PUBLICAR automaticamente, precisa desta.

### 3. Após Aprovação - Obter Credenciais

#### 3.1. Organization ID (URN)

**Método 1 - Via Developer Portal:**
1. Vá em "Settings" → "Products"
2. Procure por "Organization" ou "LinkedIn Page"
3. O URN estará no formato: `urn:li:organization:12345678`

**Método 2 - Via API (após ter token):**
```bash
curl -X GET "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Linkedin-Version: 202501"
```

#### 3.2. Access Token

**Opção A - Token de Desenvolvimento (Testes):**
1. Vá em "Auth" na sua aplicação
2. Clique em "Generate token"
3. Selecione os scopes necessários
4. Copie o token gerado

**Opção B - OAuth 2.0 Flow (Produção):**
1. Configure Redirect URI em "Auth" → "Redirect URLs"
2. Use o fluxo OAuth 2.0 para obter token
3. Implemente renovação automática (tokens expiram)

**Scopes necessários:**
- `r_organization_social` - Ler posts da organização
- `w_organization_social` - Publicar posts (se usar Community Management API)

### 4. Configurar Variáveis de Ambiente

Adicione ao `.env.local`:

```env
# LinkedIn API Configuration
LINKEDIN_CLIENT_ID=77863f22nm5iqx
LINKEDIN_CLIENT_SECRET=seu_client_secret_aqui
LINKEDIN_ACCESS_TOKEN=seu_access_token_aqui
LINKEDIN_ORG_ID=urn:li:organization:12345678
LINKEDIN_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

**Onde encontrar:**
- `CLIENT_ID`: Já tem → `77863f22nm5iqx`
- `CLIENT_SECRET`: Aba "Auth" → "Client secret"
- `ACCESS_TOKEN`: Gerado em "Auth" → "Generate token"
- `ORG_ID`: Ver passo 3.1 acima
- `WEBHOOK_SECRET`: Gerado ao configurar webhook (opcional)

## 📋 Checklist de Verificação

Após solicitar acesso, verifique:

- [ ] Email de confirmação recebido do LinkedIn
- [ ] Status da solicitação em "Products" → "Requested"
- [ ] Email de aprovação (pode levar 1-3 dias)
- [ ] Produto aparece como "Approved" em "Products"
- [ ] Organization ID obtido e configurado
- [ ] Access Token válido e configurado
- [ ] Teste de API funcionando: `GET /api/linkedin/posts`

## 🧪 Testar Integração

### Teste 1: Verificar Token
```bash
curl -X GET "https://api.linkedin.com/v2/me" \
  -H "Authorization: Bearer {SEU_TOKEN}" \
  -H "Linkedin-Version: 202501"
```

### Teste 2: Buscar Posts da Página
```bash
curl -X GET "https://api.linkedin.com/v2/organizationalEntityShares?q=organizationalEntity&organizationalEntity={ORG_ID}" \
  -H "Authorization: Bearer {SEU_TOKEN}" \
  -H "Linkedin-Version: 202501" \
  -H "X-Restli-Protocol-Version: 2.0.0"
```

### Teste 3: Via API do Site
```bash
curl http://localhost:3001/api/linkedin/posts?limit=5
```

## ⚠️ Problemas Comuns

### "Insufficient permissions"
- Verifique se o produto foi aprovado
- Confirme que o token tem os scopes corretos
- Aguarde aprovação se ainda estiver pendente

### "Organization not found"
- Verifique se o ORG_ID está correto
- Confirme que você é admin da página do LinkedIn
- Use o formato correto: `urn:li:organization:12345678`

### "Rate limit exceeded"
- LinkedIn tem limites de requisições
- Implemente retry com backoff exponencial
- Reduza frequência de sincronização

## 📞 Suporte

- LinkedIn Developer Support: https://www.linkedin.com/help/linkedin/answer/a1338220
- Documentação: https://learn.microsoft.com/en-us/linkedin/
- Status da API: https://status.linkedin.com/

## 🎯 Próximos Passos Após Aprovação

1. ✅ Configurar variáveis de ambiente
2. ✅ Testar busca de posts via API
3. ✅ Implementar sincronização automática
4. ✅ Configurar cron job
5. ✅ Verificar posts aparecendo na timeline
