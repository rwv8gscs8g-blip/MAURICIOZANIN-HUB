# Etapa 7 — Dev / Preview / Produção (Vercel + Neon) com bancos corretos

Objetivo: ter **3 ambientes separados** com **3 bancos separados**, com rastreabilidade do commit/versão e um fluxo de promoção **do mesmo código validado**.

## 1) Padrão recomendado (3 projetos no Vercel)

Para ter URLs persistentes e evitar confusão de banco, use **3 projetos** distintos no Vercel:

- **DEV**: `mauriciozanin-hub-dev`
- **PREVIEW (staging)**: `mauriciozanin-hub-preview`
- **PROD**: `mauriciozanin-hub-prod`

> Alternativa: 1 projeto único (Preview deployments por PR + Prod no `main`).  
> Para MVP em produção com “dev online” persistente, 3 projetos é o caminho mais claro.

## 2) Bancos (Neon) — 3 databases/branches

Crie 3 bancos isolados (um por ambiente):

- `mauriciozanin_dev`
- `mauriciozanin_preview`
- `mauriciozanin_prod`

Regra: **nunca** reutilize `DATABASE_URL` do ambiente errado.

## 3) Vercel — Git branch por projeto

Configure em **Settings → Git**:

- Projeto DEV:
  - **Production Branch**: `dev`
- Projeto PREVIEW:
  - **Production Branch**: `preview` (ou `staging`)
- Projeto PROD:
  - **Production Branch**: `main`

Assim, cada projeto fica “fixo” no seu branch e o risco de publicar no banco errado cai muito.

## 4) Variáveis de ambiente (por projeto)

Em **Settings → Environment Variables** (de cada projeto), configure pelo menos:

- **Database**
  - `DATABASE_URL` (do banco do ambiente)
- **Sessão/segurança**
  - `AUTH_SECRET` (um secret forte e diferente por ambiente)
- **URL do app**
  - `APP_BASE_URL`
  - `NEXT_PUBLIC_SITE_URL`

Boas práticas para evitar confusão:

- No DEV, use `APP_BASE_URL=https://dev.<seu-dominio>`
- No PREVIEW, use `APP_BASE_URL=https://preview.<seu-dominio>`
- No PROD, use `APP_BASE_URL=https://mauriciozanin.com.br`

## 5) Prisma (MVP): `db push` por ambiente

Este MVP usa **Prisma db push** (sem migrations nesta fase).

Antes do primeiro deploy de cada ambiente, rode localmente apontando para o banco correto:

```bash
# DEV
DATABASE_URL="postgresql://..." npm run prisma:dbpush

# PREVIEW
DATABASE_URL="postgresql://..." npm run prisma:dbpush

# PROD
DATABASE_URL="postgresql://..." npm run prisma:dbpush
```

> O runner `scripts/prisma-runner.js` foi ajustado para **não sobrescrever** `DATABASE_URL` quando você passa explicitamente no shell.

## 6) Fluxo de release (mesmo commit validado)

### 6.1. Dev (validação inicial)

- Faça push para `dev` e valide a URL do projeto DEV.
- Rode o checklist funcional: `docs/QA_FUNCIONAL_CHECKLIST.md`

### 6.2. Preview (staging)

- Faça merge (ou cherry-pick) do mesmo commit para `preview`
- Deploy no Vercel Preview (projeto PREVIEW)
- Rode o mesmo checklist funcional novamente

### 6.3. Aprovação (sign-off)

Depois de validar DEV + PREVIEW, gere o sign-off local:

```bash
npm run qa:signoff
```

Isso cria `.release/qa.json` (ignorado pelo git) para liberar produção.

### 6.4. Produção

Promova o mesmo commit para `main` (ou mantenha `main` alinhado) e faça deploy:

```bash
npm run deploy:prod
```

Regras do script:
- exige `.release/preview.json` do **mesmo commit**
- exige `.release/qa.json` aprovado para o **mesmo commit**
- usa o **mesmo artefato prebuilt** gerado no Preview (`.vercel/output`)

## 7) Verificação rápida pós-deploy

- checar `/sala` (consultor) e `/sala/entrar` (público)
- criar uma sala e entrar como participante
- confirmar autosave e submissão do diagnóstico
- abrir relatório HTML `/diagnostico/imprimir?id=...`

