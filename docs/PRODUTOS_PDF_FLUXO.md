# Produtos em PDF: fluxo direto e criação manual

## 1) Forma direta: download no link e “deixar pronto” ao importar

### Download já disponível no link

Assim que um **produto existe no banco** com **`fileUrl`** preenchido (caminho em `public/` ou URL no R2), o **download** fica disponível no link:

- Na página do produto, o link **“Baixar PDF”** usa o proxy:  
  `/api/products/[slug]/pdf`  
  O proxy lê o arquivo de `public/` (se `fileUrl` for relativo) ou do R2 (se for URL absoluta) e entrega o PDF. Nenhum passo extra é necessário para o download funcionar.

### Deixar “pronto” (capa + galeria/lightbox) ao importar

Hoje o **import** só cria o produto e copia o PDF para `public/resources/...`. A **capa e a galeria** (imagens no R2 para o lightbox) são geradas quando alguém clica em **“Processar PDF”** no Admin.

Para deixar todos os produtos importados “prontos” (com capa e lightbox) de forma direta:

1. **Após rodar o import**  
   `node scripts/import-inovajuntos-products.js`

2. **No Admin** (`/admin/produtos`):
   - **Opção A:** Clicar em **“Processar PDF”** em cada produto (gera imagens e envia para o R2).
   - **Opção B:** Colocar os **mesmos PDFs** na pasta **`entrada`** na raiz do projeto, com **nome do arquivo = slug do produto** (ex.: `1-kit2023-postais-inova-juntos-brasil.pdf`), e clicar em **“Processar Pasta 'Entrada'”**. Esse fluxo espera que os **produtos já existam** no banco (criados pelo import); ele faz upload do PDF para o R2, gera capa e galeria e atualiza o `fileUrl` do produto para a URL do R2.

**Processar PDF com `fileUrl` relativo:**  
Se o produto tem `fileUrl` relativo (ex.: `/resources/2025/inovajuntos/xxx.pdf`), o **“Processar PDF”** no Admin agora lê o arquivo direto de `public/` no servidor, sem usar `fetch` com URL relativa. Assim o erro “Failed to parse URL from /resources/...” deixa de ocorrer.

**Resumo:** O link de download fica disponível assim que o produto tem `fileUrl`. Para ter capa e lightbox em todos os produtos que vêm como PDF, use “Processar PDF” (por produto) ou “Processar Pasta 'Entrada'” (em lote, com PDFs nomeados pelo slug) após o import.

---

## 2) Forma manual de criar um produto no sistema

Hoje **não existe** tela de **“Novo produto”** no Admin. Os produtos são criados por:

### A) Script de import (recomendado para vários PDFs)

- **Arquivo:** `scripts/import-inovajuntos-products.js`
- **Uso:** Ajustar `SOURCE_DIR` para a pasta onde estão os PDFs. O script:
  - Cria/atualiza o cliente Inovajuntos e o projeto
  - Para cada PDF: copia para `public/resources/{ano}/inovajuntos/`, gera um **slug** a partir do nome do arquivo e faz **upsert** do produto no banco (`fileUrl` = caminho em `public/`).
- Assim o produto já fica com **download** disponível no link (via proxy). Para capa/lightbox, use “Processar PDF” ou “Processar Pasta 'Entrada'” como acima.

### B) Script de um produto de teste

- **Arquivo:** `scripts/seed-one-inovajuntos-test.js`
- **Uso:** Cria **um** produto (slug `1-kit2023-postais-inova-juntos-brasil`) com PDF em `public/resources/2025/inovajuntos/1-kit2023-postais-inova-juntos-brasil.pdf`.
- Serve de modelo para criar manualmente um produto via script (copiar o PDF para `public/`, ajustar slug/nome no script e rodar).

### C) Processar Pasta “Entrada” (atualizar produtos existentes)

- **Rota:** Admin → Produtos → **“Processar Pasta 'Entrada'”**
- **Comportamento:** Não cria produto. Espera uma pasta **`entrada`** na raiz do projeto com PDFs cujo **nome do arquivo (sem .pdf) = slug** de um produto **já existente** no banco. Para cada arquivo:
  - Lê o PDF, envia para o R2 (pasta `products/{slug}/`), gera capa e galeria
  - Atualiza o produto com `fileUrl` = URL do PDF no R2
- **Quando usar:** Quando os produtos já foram criados (ex.: pelo import) e você quer colocar os PDFs na pasta `entrada` e processar todos de uma vez (upload R2 + capa + galeria).

### Resumo da criação manual

| Objetivo | Como fazer |
|----------|------------|
| Vários produtos a partir de PDFs | `import-inovajuntos-products.js` (ajustar `SOURCE_DIR`) |
| Um produto de teste / um único PDF | Copiar PDF para `public/resources/...`, usar `seed-one-inovajuntos-test.js` como modelo (ou criar um script parecido com outro slug/nome) |
| Produtos já existem; só enviar PDFs e gerar capa/lightbox | Colocar PDFs em `entrada/` (nome = slug) e usar “Processar Pasta 'Entrada'” no Admin |

Para ter um formulário **“Novo produto”** no Admin (nome, slug, cliente, projeto, upload de PDF, etc.), seria necessário implementar uma nova tela e uma API POST de criação de produto; hoje isso não existe.
