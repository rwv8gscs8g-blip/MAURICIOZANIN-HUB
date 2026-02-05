# Lógica de visibilidade – área pública, timeline e produtos

Este documento descreve como o conteúdo aparece (ou não) nas áreas públicas do site: listagem de produtos, linha do tempo, Compartilhe e detalhe do produto.

---

## 1. Fonte dos dados

- **Produtos** vêm da tabela `Product` (Prisma).
- **Linha do tempo** e **Compartilhe** usam a tabela `ContentItem` ligada a canais (`ContentChannel` / `ContentItemChannel`).
- Cada `Product` pode ter um `ContentItem` associado (`product.contentItemId`). Esse vínculo é criado/atualizado:
  - pelo script `scripts/migrate-content-structure.js`, ou
  - quando o admin altera um produto (PATCH em `/api/admin/products/[id]`).

---

## 2. Listagem de produtos (`/produtos`)

**Arquivo:** `src/app/produtos/page.tsx`

- **Consulta:** `prisma.product.findMany(where: whereClause)`.
- **Quem vê o quê:**
  - **Visitante não logado:** só produtos com `isVisiblePublic === true`.
  - **Cliente (role CLIENTE) sem aprovação:** só `isVisiblePublic === true`.
  - **Admin (role ADMIN):** todos os produtos (sem filtro de visibilidade).
  - **Outros (ex.: CONSULTOR):** produtos que atendam ao menos um dos critérios:
    - `isVisiblePublic === true`, ou
    - `clientId` em unidades que o usuário tem acesso, ou
    - `projectId` em projetos com acesso, ou
    - `hub` em hubs com acesso.
- **Filtros opcionais:** `?q=...` (busca em nome, descrição, nome do cliente) e `?cliente=slug` (filtrar por cliente).
- **Fallback:** se não houver nenhum produto no banco e não houver `q`, a página usa `data/inovajuntos-products.json` para montar a lista (somente leitura).

**Resumo:** Para o produto aparecer na listagem pública, é obrigatório `isVisiblePublic === true` (ou ser admin / ter acesso por cliente/projeto/hub).

---

## 3. Detalhe do produto (`/produtos/[slug]`)

**Arquivo:** `src/app/produtos/[slug]/page.tsx`

- **Quem pode ver:**
  - `canView` começa com `product.isVisiblePublic`.
  - Se o usuário estiver logado e não puder ver por padrão, o sistema verifica acesso ao **cliente** e ao **projeto** do produto. Se tiver permissão (ex.: VIEWER), `canView` vira `true`.
- Se `!canView`, a página mostra mensagem de “restrito” e link para login.
- **Documento (PDF):** o viewer usa a rota de proxy `/api/products/[slug]/pdf` (que evita CORS e trata URL relativa/absoluta). O link “Baixar PDF” (no topo da seção e no fallback do viewer) também usa o proxy, evitando 404 quando o arquivo está apenas em `public/` no servidor.

**Resumo:** Aparecer na listagem não garante ver o detalhe; o detalhe exige `isVisiblePublic` ou acesso de cliente/projeto. O PDF precisa existir em `public/` (URL relativa) ou estar acessível na URL absoluta (ex.: R2).

#### Fluxo produto com PDF (padrão desejado)

1. **Descrição do produto** – exibida no topo da página de detalhe.
2. **PDF para download** – link “Baixar PDF” (no topo da seção e no fallback do viewer) aponta para o proxy `/api/products/[slug]/pdf`, que serve o arquivo de `public/` ou R2.
3. **Conversão PDF → imagens** – no Admin, o botão “Processar PDF” (rota `POST /api/admin/products/[id]/process-pdf`) gera as imagens das páginas e envia para o R2 (ou armazena conforme config).
4. **Galeria (lightbox)** – quando existem imagens da galeria, a seção “Visualização do documento” mostra:
   - uma **capa clicável** que abre o álbum no lightbox (índice 0);
   - miniaturas que também abrem o lightbox na página correspondente.
5. **Sem galeria** – quando ainda não há imagens processadas, é exibido o `PdfFlipViewer` (visualização página a página no navegador); o link “Baixar PDF” continua usando o proxy.

**Resumo:** Produto com PDF tem descrição, download via proxy, e opcionalmente galeria de imagens (lightbox); a capa do documento abre o álbum de imagens quando a galeria existe.

---

## 4. Linha do tempo (home “Últimas atualizações” e `/trajetoria`)

**Arquivos:** `src/app/page.tsx`, `src/app/trajetoria/page.tsx`, `src/app/hubs/[hub]/page.tsx`

- **Fonte:** `ContentItem`, **não** `Product` diretamente.
- **Condições para um item aparecer:**
  - `status === "APPROVED"`
  - `isPublic === true`
  - Existir vínculo com o canal **timeline:** `channels` com `channel.key === "timeline"` e `isVisible === true`.
- **Ordenação:** `eventDate` ou `publishDate` ou `createdAt` (desc).
- Na home são exibidos até 10 itens; em `/trajetoria` e em `/hubs/[hub]` a lista completa (com filtros por hub).

**Como um produto entra na timeline:**  
O `ContentItem` do produto precisa estar ligado ao canal `"timeline"` com `isVisible: true`. Isso é feito quando:
- o admin marca **“Aparecer na timeline”** no produto (campo `isVisibleTimeline`), e
- o PATCH em `/api/admin/products/[id]` sincroniza e chama `syncChannel("timeline", product.isVisibleTimeline)`.

O script `migrate-content-structure.js` também sincroniza: para cada produto, define o canal timeline com base em `product.isVisibleTimeline`.

**Resumo:** Só entram na timeline itens aprovados, públicos e com canal timeline ativo. Para produtos, isso depende de `isVisibleTimeline` e da sincronização com `ContentItem`/canais.

---

## 5. Compartilhe (`/compartilhe`)

**Arquivos:** `src/app/compartilhe/page.tsx`, `src/app/api/compartilhe/products/route.ts`

- **Fonte:** `ContentItem` com `type === "PRODUCT"`.
- **Condições:**
  - `status === "APPROVED"`
  - `isPublic === true`
  - Canal **compartilhe** ativo: `channels` com `channel.key === "compartilhe"` e `isVisible === true`.
- A API retorna os produtos associados a esses itens; a página filtra por hub (aba).

**Como um produto entra no Compartilhe:**  
O admin marca o produto como **“Compartilhar”** (`isVisibleShare`). O PATCH do produto faz `syncChannel("compartilhe", product.isVisibleShare)`. O script `migrate-content-structure.js` faz o mesmo para todos os produtos.

**Resumo:** Produtos aparecem em Compartilhe quando têm `ContentItem` aprovado, público e canal compartilhe ativo (`isVisibleShare` no produto).

---

## 6. Canais de conteúdo (resumo)

| Canal        | Onde aparece                         | Controlado pelo produto (admin) |
|-------------|--------------------------------------|----------------------------------|
| `timeline`  | Home “Últimas atualizações”, /trajetoria, /hubs/[hub] | `isVisibleTimeline`             |
| `compartilhe` | /compartilhe                       | `isVisibleShare`                |
| `produtos`  | Sincronização interna (ContentItem)  | sempre ligado ao criar/atualizar produto |
| `clientes`  | Sincronização interna                | sempre ligado                    |

---

## 7. Checklist para um produto aparecer em tudo

1. **Banco:** produto existe com `fileUrl` preenchido (caminho em `public/` ou URL do R2).
2. **Listagem `/produtos`:** `isVisiblePublic === true`.
3. **Timeline:** `isVisibleTimeline === true` e rodar sincronização (salvar no admin ou `migrate-content-structure.js`) para o `ContentItem` ter canal `timeline` com `isVisible: true`.
4. **Compartilhe:** `isVisibleShare === true` e mesma sincronização para o canal `compartilhe`.
5. **PDF no detalhe:** arquivo existir em `public/` (para `fileUrl` relativo) ou URL acessível (R2). A rota `/api/products/[slug]/pdf` faz proxy para o viewer; em caso de falha, o usuário ainda vê o link “Baixar PDF”.

---

## 8. Scripts úteis

- **Sincronizar produtos → ContentItem e canais:**  
  `node scripts/migrate-content-structure.js`
- **Importar produtos Inovajuntos (JSON + public):**  
  `node scripts/import-inovajuntos-products.js`  
  (ajustar `SOURCE_DIR` e rodar com `DATABASE_URL` do ambiente desejado.)

---

*Última atualização: fevereiro 2026*
