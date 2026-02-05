# Admin: login em produção

**Prioridade atual:** site no ar + login em produção (via **certificado digital**). Resend e fluxos de e-mail estão registrados como dívida técnica em [DEBITO_TECNICO.md](./DEBITO_TECNICO.md).

## Problema: senha não entra em produção

Produção usa um **banco de dados separado** (Neon branch production). O usuário admin precisa existir nesse banco e a senha correta deve estar salva lá.

## Passo 0: Verificar o que existe na base de produção

Antes de criar/atualizar, confira se o admin existe e com qual e-mail:

```bash
cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB
source scripts/carregar-env.sh
export DATABASE_URL="$DATABASE_URL_PRODUCTION"
npm run admin:check
```

O script mostra os admins encontrados e se têm senha configurada. **Use exatamente o mesmo e-mail** que aparece lá (ou crie com mauriciozanin@gmail.com se não existir).

## Solução

### 1. Criar admin na base de produção (se ainda não existe)

Configure `DATABASE_URL` para apontar ao branch **production** do Neon e rode o script:

```bash
cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB

# Carregar env e garantir DATABASE_URL de produção
source scripts/carregar-env.sh

# Usar a connection string de PRODUÇÃO (do .env.local)
export DATABASE_URL="$DATABASE_URL_PRODUCTION"

# Criar admin – use o MESMO email que vai usar no login (ex: mauriciozanin@gmail.com)
ADMIN_EMAIL="mauriciozanin@gmail.com" \
ADMIN_PASSWORD="sua_senha_segura" \
npm run admin:create
```

### 2. Atualizar senha de admin existente

Se o admin já existe mas a senha não funciona (ex.: foi criado com outra senha):

```bash
export DATABASE_URL="$DATABASE_URL_PRODUCTION"

ADMIN_EMAIL="mauriciozanin@gmail.com" \
ADMIN_PASSWORD="nova_senha_segura" \
npm run admin:reset-password
```

### 3. Conferir variáveis na Vercel

Em **Vercel → Projeto → Settings → Environment Variables** (ambiente **Production**):

| Variável      | Obrigatório | Descrição                                      |
|---------------|-------------|------------------------------------------------|
| `AUTH_SECRET` | Sim         | Chave para assinar a sessão (deve ser a mesma usada no login) |
| `DATABASE_URL`| Sim         | Connection string do branch **production** do Neon |
| `ADMIN_EMAIL` | Não         | Só necessário para scripts locais              |
| `ADMIN_PASSWORD` | Não      | Só necessário para scripts locais              |

Se `AUTH_SECRET` estiver errado ou ausente, o login pode parecer aceitar mas a sessão não persiste.

### 4. Senhas longas (>72 caracteres)

O sistema suporta senhas de qualquer tamanho. Se você usa um gerenciador de senhas com senhas longas, funciona normalmente. Após alterações, **redefina a senha** com `--reset-password` para usar o novo formato.

### 5. Verificar se o usuário existe na base

No Neon Console, abra o branch **production** e rode:

```sql
SELECT id, email, role, "passwordHash" IS NOT NULL as tem_senha 
FROM "User" 
WHERE role = 'ADMIN';
```

Se não retornar linhas, o admin ainda não foi criado nesse branch.

---

## Login com certificado digital (recomendado para produção)

Enquanto o Resend não estiver configurado, use o **certificado digital** para entrar em produção:

1. **Vincule o certificado ao usuário** na base de produção (uma vez):
   ```bash
   source scripts/carregar-env.sh
   export DATABASE_URL="$DATABASE_URL_PRODUCTION"
   USER_EMAIL="mauriciozanin@gmail.com" CERT_FILE=".certs/seu-certificado.pfx" CERT_PASSWORD="sua_senha" npm run admin:link-cert:prod
   ```
2. Acesse a URL de produção → **Login** → aba **Certificado** → envie o .pfx e a senha.
3. Detalhes: [RESEND_E_CERTIFICADO.md](./RESEND_E_CERTIFICADO.md#2-habilitar-login-por-certificado-digital).
