# Bases de dados: Dev, Preview e Produção (resumo)

Para **separação completa** dos três ambientes (dev, preview, produção), use um **branch** no Neon por ambiente e configure `DATABASE_URL` em cada lugar.

**Guia passo a passo (criar branches no Neon e configurar Vercel + .env.local):**  
→ **[docs/BASES_DEV_PREVIEW_PROD.md](./BASES_DEV_PREVIEW_PROD.md)**

## Resumo rápido

| Ambiente   | Onde configurar | Variável       |
|-----------|------------------|----------------|
| **Dev**   | `.env.local`     | `DATABASE_URL` = branch **dev** |
| **Preview** | Vercel → Environment Variables → **Preview** | `DATABASE_URL` = branch **preview** |
| **Produção** | Vercel → Environment Variables → **Production** | `DATABASE_URL` = branch **production** |

Três ambientes = três bases (três branches no mesmo projeto Neon).
