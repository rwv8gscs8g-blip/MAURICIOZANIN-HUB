# Resend: verificar domínio (obrigatório)

Para enviar e-mails, o **domínio** usado em `MAIL_FROM` precisa estar **verificado** no Resend.

## Passo a passo

1. Acesse [resend.com](https://resend.com) e faça login.

2. Vá em **Domains** (menu lateral).

3. Clique em **Add domain**.

4. Digite o domínio: `mauriciozanin.com.br` (ou o que usar em MAIL_FROM).

5. O Resend mostra os registros DNS a criar. Adicione no seu provedor de DNS:
   - **SPF** (TXT)
   - **DKIM** (CNAME ou TXT)
   - **DMARC** (opcional)

6. Aguarde a propagação (minutos a algumas horas).

7. No Resend, clique em **Verify** – o status deve ficar **"Verified"** (verde).

8. Só depois disso os e-mails serão enviados. Se o domínio não estiver verificado, o Resend pode retornar erro ou bloquear o envio.

## Conferir MAIL_FROM

O valor de `MAIL_FROM` precisa usar um domínio verificado, por exemplo:
- `no-reply@mauriciozanin.com.br`
- `noreply@mauriciozanin.com.br`

Se `MAIL_FROM` usar um domínio não verificado (ex: outro domínio), o envio falha.
