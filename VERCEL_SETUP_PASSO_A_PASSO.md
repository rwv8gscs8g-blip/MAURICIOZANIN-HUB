# Setup Vercel - Passo a Passo Visual

## 🎯 Objetivo

Criar um projeto completamente isolado no Vercel para o **Mauricio Zanin Hub**.

## 📸 Passo 1: Criar Novo Projeto

### 1.1. No Dashboard do Vercel

1. **Localize o botão "Add New..."**
   - Está no canto superior direito do dashboard
   - Você verá um dropdown quando clicar

2. **Selecione "Project"**
   - No dropdown, clique em **"Project"**
   - Isso abrirá a tela de importação

### 1.2. Importar do GitHub

1. **Se ainda não conectou o GitHub:**
   - Clique em **"Import Git Repository"**
   - Autorize o Vercel a acessar seus repositórios
   - Selecione a organização/conta correta

2. **Procurar o Repositório:**
   - Use a busca: digite `MAURICIOZANIN-HUB`
   - Ou procure na lista de repositórios
   - Clique no repositório correto

3. **Importar:**
   - Clique no botão **"Import"** ao lado do repositório

## ⚙️ Passo 2: Configurar Projeto

### 2.1. Configurações Básicas

Após importar, você verá uma tela de configuração:

**Project Name:**
```
mauriciozanin-hub
```

**Framework Preset:**
```
Next.js (deve detectar automaticamente)
```

**Root Directory:**
```
./ (raiz do projeto)
```

### 2.2. Configurações Avançadas

Clique em **"Show Advanced Options"** ou **"Configure Project"**:

**Build and Development Settings:**

- **Node.js Version**: Selecione `20.x`
- **Install Command**: `npm ci`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Development Command**: `npm run dev`

**Environment Variables:**
- Vamos configurar depois (pode pular por enquanto)

## 🔒 Passo 3: Configurar Variáveis de Ambiente (Isolamento)

### 3.1. Após o Primeiro Deploy

1. **Vá em Settings** (ícone de engrenagem)
2. **Clique em "Environment Variables"**
3. **Adicione cada variável:**

Clique em **"Add New"** para cada uma:

**Variável 1:**
```
Name: DATABASE_URL
Value: postgresql://user:password@host:5432/database
Environment: Production, Preview, Development (marque todos)
```

**Variável 2:**
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://mauriciozanin.com.br
Environment: Production, Preview, Development
```

**Variável 3:**
```
Name: LINKEDIN_CLIENT_ID
Value: seu_client_id
Environment: Production, Preview, Development
```

**Variável 4:**
```
Name: LINKEDIN_CLIENT_SECRET
Value: seu_client_secret
Environment: Production, Preview, Development
```

**Variável 5:**
```
Name: LINKEDIN_ACCESS_TOKEN
Value: seu_access_token
Environment: Production, Preview, Development
```

**Variável 6:**
```
Name: LINKEDIN_ORG_ID
Value: urn:li:organization:seu_org_id
Environment: Production, Preview, Development
```

**Variável 7:**
```
Name: LINKEDIN_WEBHOOK_SECRET
Value: seu_webhook_secret
Environment: Production, Preview, Development
```

### 3.2. Verificar Isolamento

- ✅ Cada variável é específica deste projeto
- ✅ Outros projetos não têm acesso a essas variáveis
- ✅ Você pode ter variáveis com o mesmo nome em outros projetos, mas com valores diferentes

## 🌐 Passo 4: Configurar Domínio

### 4.1. Adicionar Domínio Customizado

1. **Vá em Settings → Domains**
2. **Clique em "Add Domain"**
3. **Digite:** `mauriciozanin.com.br`
4. **Clique em "Add"**

### 4.2. Configurar DNS

O Vercel mostrará instruções específicas. Geralmente:

**Opção A - Nameservers (Mais Simples):**

No seu registrador de domínio, altere os nameservers para:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Opção B - Registros DNS:**

Adicione estes registros no seu DNS:

```
Tipo: A
Nome: @
Valor: 76.76.21.21
TTL: 3600

Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
TTL: 3600
```

### 4.3. Verificar SSL

- O Vercel configura SSL automaticamente
- Aguarde alguns minutos após configurar DNS
- Verifique em: Settings → Domains → Verifique se mostra "Valid"

## 🚀 Passo 5: Primeiro Deploy

### 5.1. Deploy Inicial

1. **Na tela de configuração, clique em "Deploy"**
2. **Aguarde o build:**
   - Você verá logs em tempo real
   - O build pode levar 2-5 minutos

### 5.2. Verificar Deploy

Após o deploy:

1. **URL de Preview**: `mauriciozanin-hub-xxxxx.vercel.app`
2. **Status**: Deve mostrar "Ready" ou "Success"
3. **Clique na URL** para testar

### 5.3. Verificar Logs

1. **Clique no deploy**
2. **Vá em "Functions"** ou **"Logs"**
3. **Verifique se há erros**

## 🔍 Passo 6: Validar Isolamento

### 6.1. Verificar que está Isolado

1. **Volte ao Dashboard**
2. **Verifique que o projeto aparece separado** dos outros
3. **Cada projeto tem:**
   - ✅ URL única
   - ✅ Variáveis de ambiente próprias
   - ✅ Deploys independentes
   - ✅ Logs separados

### 6.2. Teste de Isolamento

1. **Faça uma mudança pequena** no código
2. **Faça commit e push**
3. **Verifique que apenas este projeto faz deploy**
4. **Outros projetos não são afetados**

## 📊 Passo 7: Configurações Adicionais

### 7.1. Branch Protection

1. **Vá em Settings → Git**
2. **Production Branch**: `main`
3. **Ignored Build Step**: Deixe vazio (ou configure se necessário)

### 7.2. Analytics

1. **Vá em Settings → Analytics**
2. **Ative "Vercel Analytics"**
3. Isso dará métricas específicas deste projeto

### 7.3. Notifications

1. **Vá em Settings → Notifications**
2. **Configure alertas** para:
   - Deploy failures
   - Build errors
   - Domain issues

## ✅ Checklist Final

Antes de considerar completo:

- [ ] Projeto criado e isolado
- [ ] Repositório GitHub conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio adicionado
- [ ] DNS configurado
- [ ] SSL ativo
- [ ] Primeiro deploy realizado
- [ ] Site acessível
- [ ] Isolamento verificado
- [ ] Analytics ativado (opcional)

## 🎯 Próximos Passos

Após configurar o Vercel:

1. ✅ Configurar DNS no registrador
2. ✅ Executar migrations do Prisma
3. ✅ Validar funcionalidades
4. ✅ Configurar monitoramento
5. ✅ Documentar processo

## ⚠️ Dicas Importantes

1. **Nunca compartilhe variáveis** entre projetos
2. **Use nomes descritivos** para o projeto
3. **Mantenha documentação** atualizada
4. **Revise configurações** regularmente
5. **Teste deploys** antes de produção

---

**Última atualização:** 26 de Janeiro de 2026
