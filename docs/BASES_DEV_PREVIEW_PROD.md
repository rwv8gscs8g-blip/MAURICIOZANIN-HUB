# Separação das bases: Dev e Produção (Preview opcional)

Este documento descreve como manter **dev** e **produção** em bancos diferentes (branches no Neon). Preview na Vercel é opcional.

## Visão geral (mínimo: dev + produção)

| Ambiente   | Onde configurar | Variável       | Quando usa |
|-----------|------------------|----------------|------------|
| **Dev**   | `.env.local` → `DATABASE_URL` | branch **dev** (ou outro não-produção) | `npm run dev` |
| **Produção** | Vercel → Environment Variables → **Production** → `DATABASE_URL` | branch **main**/production | Site em produção |

Regra: **dev e produção usam `DATABASE_URL` diferentes** (branches diferentes no Neon). Opcionalmente você pode configurar **Preview** na Vercel com outro branch.

---

## Passo a passo no Neon (3 branches)

### 1. Branch **production** (já existe)

No projeto Neon **mauriciozanin-hub** você já tem o branch **production** (ou main).  
Esse branch é o que a **Produção** (Vercel) deve usar.

- No Neon: **Dashboard** → **Branches** → branch **production**.
- Copie a **Connection string** (ou “Connection string” na aba do branch).
- Essa URL será usada **só** no ambiente **Production** da Vercel.

### 2. Criar branch **preview**

- No Neon: **Branches** → **Create branch**.
- Nome sugerido: `preview`.
- Parent branch: **production** (ou main).
- Crie o branch.
- Copie a **Connection string** do novo branch **preview**.
- Essa URL será usada **só** no ambiente **Preview** da Vercel.

### 3. Criar branch **dev** (opcional, para local)

- **Branches** → **Create branch**.
- Nome sugerido: `dev`.
- Parent: **production** ou **preview**.
- Copie a **Connection string** do branch **dev**.
- Essa URL será usada **só** no seu `.env.local` para `npm run dev`.

Se preferir, pode usar temporariamente a mesma URL do **preview** no `.env.local` (não recomendado para uso contínuo).

---

## Sincronizar .env.local → Vercel (Preview e Production)

Se você já preencheu `DATABASE_URL_PREVIEW` e `DATABASE_URL_PRODUCTION` no `.env.local`, rode:

```bash
node scripts/vercel-sync-database-urls.js
```

O script lê o `.env.local` e cria/atualiza na Vercel as variáveis `DATABASE_URL` para **Preview** e **Production**. Exige `VERCEL_TOKEN` no `.env.local`.

---

## Configurar na Vercel (manual)

1. Acesse o projeto no [Vercel](https://vercel.com) → **Settings** → **Environment Variables**.
2. Configure **duas** entradas para `DATABASE_URL`:
   - **Preview**: valor = Connection string do branch **preview** do Neon.  
     Marque **apenas** o ambiente **Preview**.
   - **Production**: valor = Connection string do branch **production** do Neon.  
     Marque **apenas** o ambiente **Production**.
3. Salve. Em deploys futuros, Preview e Produção passarão a usar bases diferentes.

---

## Configurar no seu PC (dev)

No projeto, no arquivo **`.env.local`** (não commitar):

```env
# Use a URL do branch "dev" (ou "preview") do Neon
DATABASE_URL="postgresql://usuario:senha@ep-xxx-pool.region.aws.neon.tech/neondb?sslmode=require"
# ... outras variáveis (AUTH_SECRET, etc.)
```

Assim, **dev** (localhost), **preview** (Vercel) e **produção** (Vercel) ficam com bases separadas.

---

## Schema (migrações) em cada branch

Cada branch no Neon é um banco independente. Depois de criar os branches **preview** e **dev**:

- **Production**: aplicar migrações no branch production (já deve estar aplicado).
- **Preview**: na primeira vez, aplicar no branch preview, por exemplo:
  - Definir temporariamente `DATABASE_URL` com a URL do branch **preview** (no `.env.local` ou em um script).
  - Rodar: `npx prisma db push` ou `npx prisma migrate deploy`.
- **Dev**: o mesmo para o branch **dev** (rodar com `DATABASE_URL` do branch dev).

Ou use o **Neon + Vercel integration** (Preview Workflow): ao instalar a integração, o Neon pode criar branches automáticos por deploy de Preview e você configura as migrações no pipeline (por exemplo, rodar migração no deploy de Preview).

---

## Resumo de verificação

- [ ] Neon: branch **production** existe e você tem a Connection string.
- [ ] Neon: branch **preview** criado e Connection string copiada.
- [ ] Neon: branch **dev** criado (opcional) e Connection string copiada.
- [ ] Vercel: `DATABASE_URL` para **Preview** = URL do branch preview.
- [ ] Vercel: `DATABASE_URL` para **Production** = URL do branch production.
- [ ] `.env.local`: `DATABASE_URL` = URL do branch dev (ou preview, só para testes).

Com isso, os três ambientes ficam com bases separadas e prontos para testar com segurança.

---

## Onde o dev estava salvando? (regularização)

- **Antes:** Se no `.env.local` (ou no `.env`) o `DATABASE_URL` era a connection string do branch de **produção**, então o `npm run dev` gravava direto no **banco de produção**. Isso é arriscado.
- **Agora:** Defina no `.env.local`:
  - **`DATABASE_URL`** = connection string do branch **dev** (só para uso local).
  - Assim o ambiente local passa a usar só o branch **dev**; produção e preview continuam separados na Vercel.
- **Resumo:** Dev = `.env.local` → branch dev. Preview = Vercel (Preview) → branch preview. Production = Vercel (Production) → branch main/production.
