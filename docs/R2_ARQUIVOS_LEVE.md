# Arquivos no R2 – Código Leve em Todos os Ambientes

## Resumo

O deploy na Vercel estava falhando porque as Serverless Functions excediam o limite de **2 GB**, ao empacotar pastas como `entrada/`, `public/inovajuntos/`, `data/`, etc.

**Solução:** Excluir pastas pesadas do deploy e usar **R2** como única origem de arquivos em produção/preview.

---

## Alterações Feitas

### 1. `.vercelignore`

Passaram a ser ignorados:

- Pastas: `entrada/`, `data/`, `coverage/`, `playwright-report/`, `.tmp/`, `public/inovajuntos/clippings/`, `public/resources/`
- Extensões: `*.pptx`, `*.ppsx`, `*.xlsx`, `*.docx` (além das já existentes)

### 2. `next.config.js` – `outputFileTracingExcludes`

O rastreamento de arquivos passou a excluir:

- `entrada/**`, `data/**`, `public/inovajuntos/**`, `public/resources/**`
- `coverage/**`, `playwright-report/**`, `.tmp/**`
- Arquivos `*.pptx`, `*.ppsx`, `*.xlsx`, `*.docx`

### 3. APIs – Apenas R2 (sem fallback local)

| API | Antes | Depois |
|-----|-------|--------|
| `/api/products/[slug]/cover` | R2 → fallback `public/` | Apenas R2 |
| `/api/products/[slug]/image/[key]` | R2 → fallback `public/` | Apenas R2 |
| `/api/products/[slug]/pdf` | `public/` ou R2 | R2 primeiro → URL absoluta (fetch) |
| `/api/admin/products/scan-entrada` | Scan local em `entrada/` | Em Vercel: retorna 501 (uso só local) |

### 4. Fluxo em Produção/Preview

- **Produtos (PDF, capa, galeria):** vêm de R2 (`products/{slug}/`).
- **Importação:** upload via FormData → envio para R2 → URL salva no banco.
- **Scan de pasta:** não existe na Vercel; só disponível localmente.

---

## Ambiente Local (dev)

- `entrada/` continua sendo usada para o scan em massa (Admin → Produtos).
- Fallback em disco foi removido; use R2 ou importe via upload direto.

---

## Pré-requisitos para Produção

1. **R2 configurado** no `.env` / Vercel:
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL` (opcional, para URLs públicas)

2. **Produtos em R2:**
   - Importar via Admin → Produtos → Importar (upload direto).
   - Ou rodar o scan local (`entrada/`) e, em seguida, publicar para produção.

---

## Imagens de Produtos em Produção

- **Lista (`/produtos`):** Usa `ProductCoverImage` com fallback para placeholder quando a API retorna 404 (imagem ainda não no R2).
- **Detalhe (`/produtos/[slug]`):** Sempre tenta exibir a capa via proxy; com fallback para placeholder em erro. Galeria e capa usam `ImageLightboxGallery` com fallback nas miniaturas.
- **Pré-requisito:** Produtos precisam ter sido importados/processados com imagens no R2 (Admin → Processar PDF ou Importar com upload).

---

## Verificação

Depois das mudanças, o tamanho das Serverless Functions deve ficar bem menor. Para conferir:

```bash
npm run build
# Em seguida:
vercel build
```
