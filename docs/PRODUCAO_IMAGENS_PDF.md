# Produção: imagens e PDF dos produtos

## Comportamento

- **Localhost**: PDF pode estar em `public/resources/...`; capa e galeria podem vir do R2 ou de arquivos locais.
- **Produção (ex.: Vercel)**: O filesystem é efêmero. Para produtos e PDFs funcionarem, use **R2**.

## O que configurar em produção (Vercel)

1. **Variáveis de ambiente** no projeto Vercel:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - (Opcional) `R2_PUBLIC_URL` se o bucket tiver URL pública

2. **Importação de produtos**: A partir da alteração atual, ao importar um produto (Admin → Produtos → Importar novo produto):
   - O PDF é enviado para o R2 em `products/{slug}/{slug}.pdf`.
   - O `fileUrl` do produto é salvo como a **URL do R2** (retorno do upload).
   - A capa e as páginas da galeria continuam em `products/{slug}/cover.jpg` e `page-N.jpg`.

Assim, em produção o proxy de PDF e o proxy de imagens leem do R2 e funcionam mesmo sem arquivos em `public/`.

## Produtos já existentes (criados antes desta alteração)

- Se o produto tinha `fileUrl` apenas como path local (ex.: `/resources/2024/inovajuntos/xxx.pdf`) e o PDF **não** está no repositório em `public/`, em produção o PDF não será encontrado.
- **Soluções**:
  1. **Reimportar o produto** em produção (com R2 configurado): o novo fluxo sobe o PDF e as imagens para o R2 e atualiza o `fileUrl`.
  2. Ou commitar o PDF em `public/resources/...` e fazer novo deploy (o proxy continua servindo de `public/` quando o arquivo existe).
- O proxy de PDF tem **fallback**: se o path local não existir, tenta R2 em `products/{slug}/{slug}.pdf`. Isso só ajuda se em algum momento esse PDF tiver sido enviado ao R2 (por reimportação ou script).

## Resumo

| Ambiente   | R2 configurado | PDF e imagens |
|-----------|-----------------|----------------|
| Localhost | Não             | Path em `public/` + processar PDF (capa local ou R2 se configurado). |
| Localhost | Sim             | Tudo pode vir do R2; import sobe PDF + imagens. |
| Produção  | Não             | Só funciona se os arquivos estiverem em `public/` no build (commitados). |
| Produção  | Sim             | Import sobe PDF e imagens para R2; proxy serve tudo a partir do R2. |

Em produção, configure R2 e prefira **sempre reimportar** (ou importar) os produtos pela interface admin para que PDF e galeria fiquem no R2 e apareçam corretamente.
