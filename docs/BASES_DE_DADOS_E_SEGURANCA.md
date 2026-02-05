# Onde ficam as bases de dados e como a segurança é garantida

## 1) Onde são salvas as bases de dados

### Três ambientes, três bases diferentes

O projeto deve usar **uma base de dados distinta** para cada ambiente:

| Ambiente   | Onde está a base?                    | Como é definido?                                                                 |
|-----------|--------------------------------------|-----------------------------------------------------------------------------------|
| **Dev**   | Servidor PostgreSQL (ex.: Neon dev)  | `DATABASE_URL` em `.env` / `.env.local` (no seu PC)                              |
| **Preview** | Servidor PostgreSQL (ex.: Neon preview) | `DATABASE_URL` na Vercel → Environment Variables → **Preview**               |
| **Produção** | Servidor PostgreSQL (ex.: Neon prod) | `DATABASE_URL` na Vercel → Environment Variables → **Production**             |

- **Dev (localhost):** o app usa `DATABASE_URL` do `.env` ou `.env.local`. A base é remota (ex.: Neon “dev”); nada fica em arquivo no PC.
- **Preview (Vercel):** cada deploy de preview (PR, branch) usa a `DATABASE_URL` configurada para o ambiente **Preview** na Vercel. Deve ser um banco de **teste**, diferente do de produção.
- **Produção (Vercel):** o app usa a `DATABASE_URL` configurada para o ambiente **Production** na Vercel. Deve ser **apenas** o banco de produção.

Garantia de separação: na Vercel, defina **duas entradas** para `DATABASE_URL` (uma para Preview, outra para Production), com **valores diferentes**. No seu PC, use outra URL em `.env.local` para dev. Detalhes em **`docs/DATABASES_DEV_PREVIEW_PROD.md`**.

---

## 2) Como a segurança é garantida

### Acesso ao banco

- A **senha e o host** do banco ficam **só** na `DATABASE_URL` (e em nenhum lugar commitado no Git).
- `.env` e `.env.local` estão no **.gitignore**; a Vercel usa **Environment Variables** (não lê seu `.env` local).
- Quem tem acesso aos dados é quem tem:
  - acesso ao repositório **e** ao `.env` local (dev), ou
  - acesso ao projeto na Vercel e às variáveis de ambiente (produção).

### Autenticação da aplicação

- **Login**: sessão em cookie (JWT) assinado com `AUTH_SECRET`.
- **Rotas admin** (`/admin`, `/api/admin/*`): exigem role **ADMIN**; a API valida sessão e perfil em cada request.
- **Middleware**: bloqueia acesso a rotas protegidas sem sessão válida e redireciona para login.
- Documentação detalhada: `docs/SEGURANCA_PERFIS_ACESSO.md`.

### Dados sensíveis

- **Nunca** são commitados: `DATABASE_URL`, `AUTH_SECRET`, `R2_*`, tokens, etc.
- Produção: todas as chaves e segredos vêm **somente** das Environment Variables da Vercel (e, se usar, do Neon/dashboard do banco).

---

## 3) Resumo

- **Localhost**: base de dados = banco remoto da `DATABASE_URL` do seu `.env` (ex.: Neon dev).
- **Produção**: base de dados = banco remoto da `DATABASE_URL` configurada na Vercel (ex.: Neon prod).
- **Segurança**: bancos separados por ambiente; credenciais só em variáveis de ambiente; app com auth (JWT + perfis) e middleware protegendo rotas sensíveis.
