# Dívida técnica

Itens registrados para conclusão depois que o site estiver no ar e o login em produção funcionando.

---

## 1. Resend e e-mail (esqueci senha / magic link)

**Status:** Pendente.  
**Prioridade:** Após site no ar e login com certificado em produção.

- [ ] Verificar domínio no Resend (SPF/DKIM no Cloudflare já configurados para envio).
- [ ] Garantir `RESEND_API_KEY`, `MAIL_FROM`, `APP_BASE_URL` em **Production** na Vercel.
- [ ] Testar "Esqueci minha senha" e magic link em produção (e-mails devem chegar).
- Referência: [RESEND_VERIFICAR_DOMINIO.md](./RESEND_VERIFICAR_DOMINIO.md) e [RESEND_E_CERTIFICADO.md](./RESEND_E_CERTIFICADO.md).

---

## 2. Cloudflare Email Routing (receber e-mail)

**Status:** Parcial (MX e destino configurados; regras/duplicados podem precisar de ajuste).  
**Prioridade:** Após Resend e login por e-mail.

- [ ] Ajustar regra duplicada (contato@ → destino desejado) se necessário.
- [ ] Validar recebimento em contato@mauriciozanin.com encaminhando para o e-mail final.

---

## 3. Login e mail (visão geral)

**Status:** Login com certificado é a via principal para produção até o Resend estar ok.  
**Prioridade:** Site no ar → login com certificado → depois Resend + fluxos de e-mail.

- Login com **certificado digital**: já implementado; requer thumbprint vinculado ao usuário na base de produção (`admin:link-cert:prod`).
- Login com **senha** e **magic link**: dependem de Resend em produção (ver item 1).

---

*Última atualização: 2026-02-05. Prioridade atual: colocar o site no ar e permitir login em produção (certificado).*
