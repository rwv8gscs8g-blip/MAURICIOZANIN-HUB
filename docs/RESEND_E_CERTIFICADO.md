# Resend (email) e Certificado Digital

## 1. Configurar Resend para troca de senha

O fluxo "Esqueci minha senha" **já está implementado**. Para funcionar em produção:

### Variáveis na Vercel (Production)

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `RESEND_API_KEY` | Chave da API em resend.com | Sim |
| `MAIL_FROM` | Remetente (domínio verificado no Resend), ex: `no-reply@mauriciozanin.com.br` | Sim |
| `APP_BASE_URL` | `https://mauriciozanin.com.br` (ou seu domínio) | Sim |

### Passos

1. Acesse [resend.com](https://resend.com) e crie uma conta.
2. Verifique seu domínio (DNS) para enviar de `@mauriciozanin.com.br`.
3. Crie uma API Key em **API Keys**.
4. No Vercel → Projeto → Settings → Environment Variables:
   - Adicione `RESEND_API_KEY` (Production)
   - Adicione `MAIL_FROM=no-reply@mauriciozanin.com.br` (Production)
   - Adicione `APP_BASE_URL=https://mauriciozanin.com.br` (Production)
5. Faça redeploy para aplicar as variáveis.

### Fluxo de uso

1. Na tela de login (`/auth/login`), clique em **Esqueci minha senha** (abaixo do botão Entrar), ou acesse `/auth/request`.
2. Informe o e-mail cadastrado.
3. Receba o link de redefinição no e-mail (expira em 30 min).
4. Clique no link e defina uma nova senha.
5. Faça login com e-mail e a nova senha.

---

## 2. Habilitar login por Certificado Digital

O login por certificado (.pfx) **já existe** na aba "Certificado" da tela de login. Para funcionar, o usuário precisa ter o **thumbprint** do certificado vinculado ao seu cadastro.

### Opção A: Vincular certificado via script (sem precisar entrar no admin)

Execute localmente apontando para a base de **produção**:

```bash
cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB
source scripts/carregar-env.sh
export DATABASE_URL="$DATABASE_URL_PRODUCTION"

# Vincular certificado ao seu usuário
USER_EMAIL="mauriciozanin@gmail.com" \
CERT_FILE="/caminho/para/seu-certificado.pfx" \
CERT_PASSWORD="senha_do_certificado" \
node scripts/link-certificate-admin.js
```

O script extrai o thumbprint do .pfx e grava no usuário. Depois, basta usar a aba **Certificado** no login: envie o arquivo e a senha.

### Opção B: Vincular pelo painel admin (quando já tiver acesso)

1. Login no admin.
2. **Admin → Usuários** → editar o usuário.
3. Campo **Certificado (thumbprint)** → cole o thumbprint em hex (ex: `a1b2c3...`).

Para obter o thumbprint sem o script, use a aba Certificado na tela de login: envie o .pfx e a senha. Se aparecer "Certificado válido, mas não autorizado", o thumbprint está sendo exibido na resposta (a API de validate retorna `certInfo`). Você pode adicionar um log temporário ou usar o script acima para gravar automaticamente.
