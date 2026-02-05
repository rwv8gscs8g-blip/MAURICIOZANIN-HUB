# Segurança e perfis de acesso

## Visão geral

O sistema usa **sessão em cookie** (JWT assinado com `AUTH_SECRET`) e **perfis de acesso (roles)**. Rotas administrativas exigem role **ADMIN**; outras áreas usam roles como CLIENTE, CONSULTOR, etc.

## Camadas de proteção

### 1. Middleware (`src/middleware.ts`)

- Valida o cookie `session` com JWT (assinatura e expiração).
- **Gates**: cada prefixo de rota está associado a uma lista de roles permitidos.
- `/admin` e `/api/admin`: **apenas ADMIN**.
- Se não houver sessão → redireciona para `/auth/login?next=...`.
- Se a role não estiver no gate → redireciona para `/auth/login?denied=1`.

### 2. APIs (Route Handlers)

- Todas as rotas em `/api/admin/*` usam `requireAuth(["ADMIN"])` de `@/lib/auth`.
- `requireAuth` chama `getSession()`, que:
  - Lê e decodifica o cookie (JWT).
  - Verifica expiração (campo `expires` no payload).
  - Confere no banco se `user.currentSessionId === payload.sessionId` (invalida sessões antigas após novo login).
- Se não houver sessão ou a role não for permitida → lança erro; o handler retorna **403** com mensagem amigável (helpers `isAuthError` e `getAuthErrorMessage` em `@/lib/auth`).

### 3. Páginas admin (ex.: Admin Produtos)

- Requisições às APIs usam `credentials: "include"` para enviar o cookie.
- Se qualquer chamada (produtos, atestados, clientes, projetos) retornar **403**, a página exibe a mensagem e **redireciona para `/auth/login?next=/admin/produtos&reason=session`** para o usuário autenticar de novo.

### 4. Login

- A página de login lê `next` e, após login bem-sucedido, redireciona para `next` (se for path válido) em vez de sempre ir para `/dashboard`.
- Exibe mensagem quando `reason=session` (sessão expirada) ou `denied=1` (perfil sem permissão).

## Perfis (roles) usados nos gates

| Role              | Áreas típicas                          |
|-------------------|----------------------------------------|
| ADMIN             | `/admin`, `/api/admin/*`               |
| SUPERCONSULTOR     | dashboard, agenda, produtos, clientes, sala |
| CONSULTOR         | idem                                   |
| MUNICIPIO         | idem                                   |
| CLIENTE           | idem (com restrições por cliente)      |
| AGENDA            | agenda                                 |

## Mensagens de 403

As APIs admin retornam mensagens padronizadas:

- **Sessão expirada ou inexistente**: faça login novamente.
- **Apenas administradores podem acessar**: faça login como Admin.
- **Sessão expirada ou sem permissão**: faça login como Admin.

Helpers em `src/lib/auth.ts`: `isAuthError()`, `getAuthErrorMessage()`.

## Boas práticas

1. Manter **AUTH_SECRET** (ou NEXTAUTH_SECRET) em produção e não expor em cliente.
2. Novas rotas em `/api/admin/*` devem usar `requireAuth(["ADMIN"])` e, no `catch`, usar `isAuthError` e `getAuthErrorMessage` para responder 403 com mensagem clara.
3. Novas páginas em `/admin/*` devem tratar 403 das APIs e redirecionar para login com `next` quando for caso de sessão/permissão.
