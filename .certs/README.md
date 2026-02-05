# Certificados digitais

Pasta local para armazenar arquivos .pfx/.p12 usados no login por certificado.

**Importante:** arquivos `.pfx` e `.p12` não são commitados (estão no `.gitignore`).

## Uso

1. Coloque seu certificado aqui, ex: `.certs/meu-certificado.pfx`
2. Execute o script de vínculo apontando para o ambiente desejado:

```bash
source scripts/carregar-env.sh

# Dev (DATABASE_URL)
USER_EMAIL="seu@email.com" CERT_FILE=".certs/meu-certificado.pfx" CERT_PASSWORD="xxx" ENV=dev npm run admin:link-cert

# Preview (DATABASE_URL_PREVIEW)
USER_EMAIL="seu@email.com" CERT_FILE=".certs/meu-certificado.pfx" CERT_PASSWORD="xxx" ENV=preview npm run admin:link-cert

# Production (DATABASE_URL_PRODUCTION)
USER_EMAIL="seu@email.com" CERT_FILE=".certs/meu-certificado.pfx" CERT_PASSWORD="xxx" ENV=production npm run admin:link-cert
```
