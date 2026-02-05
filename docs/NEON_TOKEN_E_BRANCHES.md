# Token Neon e criação segura dos branches

Para o script criar os branches **preview** e **dev** no Neon com segurança, você precisa de um **API key** do Neon. O token **nunca** deve ser commitado no repositório.

**Quem usa o token é você, no seu computador** — o script roda localmente (por exemplo, `node scripts/neon-create-branches.js`) e chama a API do Neon da sua máquina; o token não é enviado a terceiros nem ao repositório.

**Conta gratuita:** Criar *organização* no Neon é pago. Para continuar no plano gratuito, use uma **Personal API key** (Account settings → API keys) ou configure as connection strings **manualmente** (veja seção "Configuração manual (sem API)" mais abaixo).

---

## 1) Como obter o token (API key) no Neon

1. Acesse o **Neon Console**: [https://console.neon.tech](https://console.neon.tech) e faça login.
2. No menu da conta (canto superior direito), abra **Account settings** (ou **Settings**).
3. No menu lateral, clique em **API keys**.
4. Clique em **Create new** (ou **Create API key**).
5. Dê um nome, por exemplo: `mauriciozanin-hub-branches`.
6. **Copie o token na hora** — ele é exibido **apenas uma vez**. Se perder, será preciso revogar e criar outro.
7. Guarde em um gerenciador de senhas ou em um arquivo local que **não** seja commitado (por exemplo, só no `.env.local`).

**Tipos de chave (resumo):**

- **Personal API Key**: acesso a todos os projetos da sua conta. Use esta se o projeto estiver na sua conta pessoal.
- **Project-scoped**: acesso só a um projeto. Use se quiser limitar o alcance do token.

---

## 2) Onde colocar o token (seguro)

- No **`.env.local`** (já está no `.gitignore`):

  ```env
  NEON_API_KEY=seu_token_aqui_64_caracteres
  ```

- **Não** coloque no `.env` que vai para o Git.
- **Não** commite o token em nenhum arquivo.

Se a sua conta Neon usar **organização**, adicione também no `.env.local`:

```env
NEON_ORG_ID=org-xxxx   # Neon Console → Settings (da organização) → copie o Organization ID
```

Assim só quem tem o repositório **e** o seu `.env.local` consegue usar esse token.

---

## 3) Criar os branches e configurar os 3 ambientes

Com o token em `.env.local`:

```bash
# Carregar variáveis (inclui NEON_API_KEY e, se quiser, VERCEL_TOKEN)
source scripts/carregar-env.sh

# 1) Criar branches preview e dev no projeto Neon (se ainda não existirem)
node scripts/neon-create-branches.js

# 2) Obter connection strings e configurar tudo
#    - Atualiza .env.local com DATABASE_URL do branch dev
#    - Se VERCEL_TOKEN estiver definido, define DATABASE_URL na Vercel (Preview e Production)
node scripts/neon-setup-env.js
```

O script:

- Usa **somente** a variável `NEON_API_KEY` do ambiente (por exemplo, do `.env.local`).
- Lista seus projetos e usa o projeto configurado (ou o primeiro).
- Obtém o branch padrão (production/main).
- Cria o branch **preview** (com compute read_write).
- Cria o branch **dev** (com compute read_write).
- Mostra os IDs e, quando a API permitir, as **connection strings** para você colar na Vercel e no `.env.local`.

Se o script não conseguir obter a connection string pela API, ele mostra o **branch ID** e o **host** do endpoint; aí você copia a connection string no Neon Console (em cada branch) e usa nos três ambientes conforme o [guia de bases](BASES_DEV_PREVIEW_PROD.md).

---

## 4) Revogar o token (se precisar)

1. Neon Console → **Account settings** → **API keys**.
2. Localize a chave usada para o script.
3. Clique em **Revoke**.
4. Crie uma nova chave se for usar o script de novo.

---

## Resumo

| O quê              | Onde / como |
|--------------------|-------------|
| Obter token        | Neon Console → Account settings → API keys → Create new → copiar uma vez |
| Guardar token      | Apenas em `.env.local` (não commitar) |
| Criar branches     | `source scripts/carregar-env.sh` e `node scripts/neon-create-branches.js` |
| Usar as URLs       | Ver [BASES_DEV_PREVIEW_PROD.md](BASES_DEV_PREVIEW_PROD.md) (Vercel + .env.local) |

Assim você garante acesso ao Neon só para quem tem o token no ambiente local e cria os branches de forma controlada e segura.

---

## Configuração manual (sem API, conta gratuita)

Se não quiser usar a API (ou se a API pedir `org_id` e você estiver na conta gratuita):

1. **Neon Console** → seu projeto → **Branches**.
2. Para cada branch (**main**/production, **preview**, **dev**), abra o branch e copie a **Connection string**.
3. **.env.local** (no seu PC): defina `DATABASE_URL` com a connection string do branch **dev**.
4. **Vercel** → projeto → **Settings** → **Environment Variables**:
   - Crie `DATABASE_URL` para **Preview** = connection string do branch **preview**.
   - Crie `DATABASE_URL` para **Production** = connection string do branch **main**/production.

Assim os três ambientes ficam separados sem precisar de organização paga nem de `NEON_ORG_ID`.
