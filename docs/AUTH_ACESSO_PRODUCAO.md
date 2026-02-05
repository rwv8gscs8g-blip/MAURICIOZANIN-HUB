# Acesso em produção: diagnóstico e correção

Se **senha**, **certificado** e **magic link** não funcionam, a causa costuma ser:

## 1. Banco de dados diferente

O app em produção usa o `DATABASE_URL` da **Vercel** (Production). O script `admin:link-cert` e `admin:reset-password` usam `DATABASE_URL_PRODUCTION` do **`.env.local`**.

Se forem diferentes, o usuário e o certificado estão em outro banco.

**Verificação:** Vercel → Projeto → Settings → Environment Variables → Production → `DATABASE_URL`  
Compare com `DATABASE_URL_PRODUCTION` no `.env.local`. Devem ser **iguais** (mesma connection string do Neon production).

**Correção:** Sincronize com:
```bash
node scripts/vercel-sync-database-urls.js
```

## 2. AUTH_SECRET ausente ou incorreto

Sem `AUTH_SECRET` correto, o login pode “funcionar” mas a sessão não persiste (redirect de volta para login).

**Verificação:** Vercel → Settings → Environment Variables → Production → `AUTH_SECRET` deve estar definido (32+ caracteres).

**Correção:** Gere uma nova chave:
```bash
openssl rand -base64 32
```
Atualize `AUTH_SECRET` na Vercel (Production) e faça um novo deploy.

## 3. API de diagnóstico

Para checar a configuração em produção:

1. Defina uma variável temporária na Vercel:
   - `AUTH_DIAGNOSE_TOKEN` = valor aleatório (ex.: `abc123temp`)
2. Faça um novo deploy.
3. Acesse: `https://mauriciozanin.com/api/auth/diagnose?token=abc123temp`
4. Remova `AUTH_DIAGNOSE_TOKEN` após o uso.

**Exemplo de resposta:**
```json
{
  "ok": true,
  "authSecretSet": true,
  "dbUrlSet": true,
  "dbConnected": true,
  "user": { "hasPassword": true, "hasCertificate": true }
}
```

Se `userExists: false` ou `dbConnected: false`, o problema é banco/env.

## 4. Cookies

Após o login, confira no **DevTools → Application → Cookies** se o cookie `session` aparece para `mauriciozanin.com`. Se não aparecer, o cookie não está sendo gravado.

## 5. Ordem recomendada

1. Rodar `node scripts/vercel-sync-database-urls.js`
2. Conferir `AUTH_SECRET` na Vercel (Production)
3. Rodar `ENV=production npm run admin:check` (usuário e certificado na base)
4. Rodar `ENV=production npm run admin:reset-password` (garantir senha atualizada)
5. Rodar `ENV=production npm run admin:link-cert` (garantir certificado vinculado)
6. Novo deploy (não “Redeploy”, mas novo deploy via push)
7. Testar login
