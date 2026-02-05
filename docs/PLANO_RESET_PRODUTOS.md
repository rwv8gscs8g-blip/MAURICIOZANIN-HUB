# Plano: Reset apenas produtos do Inovajuntos

**Objetivo:** Apagar somente os produtos do cliente **Inovajuntos** e refazer o upload/importação desses produtos de forma segura. Produtos de outros clientes (Sebrae, CNM, etc.) permanecem intactos.

**Status:** Aprovado. Script implementado: `scripts/reset-inovajuntos-products.js`.

---

## 1. Escopo do que será apagado

**Critério:** cliente com `slug = 'inovajuntos'` (ClientOrganization Inovajuntos).

| Tabela / dado | Ação | Motivo |
|---------------|------|--------|
| **Product** | Apagar somente onde `clientId` = id do cliente Inovajuntos | Apenas produtos Inovajuntos |
| **AtestadoProduct** | Removidos em cascata ao apagar esses Product | Junção produto ↔ atestado |
| **ContentItem** | Apagar somente os que estão ligados a esses produtos (`contentItemId` dos produtos Inovajuntos) | Conteúdo de timeline/compartilhe desses produtos |
| **ContentItemChannel** desses ContentItems | Removidos em cascata | Canais timeline/compartilhe/produtos |
| **ContentAttachment** desses ContentItems | Removidos em cascata | Anexos (PDF, capa) do conteúdo |

**Diagnostico:** Nenhum produto Inovajuntos é usado em diagnósticos (o diagnóstico é do Sebrae). Portanto nenhum `Diagnostico.productId` será alterado por este reset.

---

## 2. O que não será tocado (preservado)

- **Todos os produtos de outros clientes** (Sebrae, CNM, Comissão Europeia, etc.), inclusive o produto “Diagnóstico de Maturidade em Compras Governamentais”.
- **ClientOrganization** (incluindo o próprio Inovajuntos como cliente).
- **ClientUnit**, **Project** (incluindo projetos do Inovajuntos).
- **Atestado** (atestados em si; apenas vínculos com produtos Inovajuntos são removidos).
- **Diagnostico** (inalterado).
- **ContentItem** de outros tipos ou ligados a produtos de outros clientes.
- **User**, **ResourceAccess**, **ContentChannel** e todo o resto do sistema.

Ou seja: apenas **produtos do Inovajuntos** e o **conteúdo (ContentItem) ligado exclusivamente a esses produtos** são removidos.

---

## 3. Ordem segura das operações (para evitar erro de FK)

1. **Backup do banco** (obrigatório antes de qualquer exclusão).

2. **Identificar o cliente Inovajuntos**  
   - `client = await prisma.clientOrganization.findUnique({ where: { slug: 'inovajuntos' } })`  
   - Se não existir, abortar (nada a apagar).

3. **Listar produtos Inovajuntos e seus ContentItem**  
   - Buscar `Product` onde `clientId = client.id`.  
   - Coletar os `contentItemId` não nulos desses produtos (lista de IDs).

4. **Deletar os ContentItem ligados a esses produtos**  
   - `contentItem.deleteMany({ where: { id: { in: contentItemIds } } })`  
   - `ContentItemChannel` e `ContentAttachment` são removidos em cascata.

5. **Deletar os Product do Inovajuntos**  
   - `product.deleteMany({ where: { clientId: client.id } })`  
   - `AtestadoProduct` é removido em cascata.

A ordem 4 → 5 evita FK: primeiro removemos o conteúdo que é referenciado por `Product.contentItemId`; em seguida apagamos os produtos.

---

## 4. Forma de execução proposta

### Opção A (recomendada): Script único só para Inovajuntos

- **Nome sugerido:** `scripts/reset-inovajuntos-products.js`.
- **Passos do script:**
  1. Exigir confirmação explícita (ex.: variável de ambiente `CONFIRM_RESET_INOVAJUNTOS=1`).
  2. Buscar cliente por `slug: 'inovajuntos'`; se não existir, sair sem apagar nada.
  3. Rodar dentro de uma **transação** Prisma:
     - Listar produtos com `clientId = client.id` e coletar `contentItemId` não nulos.
     - `contentItem.deleteMany({ where: { id: { in: contentItemIds } } })`
     - `product.deleteMany({ where: { clientId: client.id } })`
  4. Logar quantidades removidas (ex.: X produtos, Y itens de conteúdo).
- **Backup:** não fazer backup dentro do script; backup continua sendo passo manual obrigatório antes (veja abaixo).

### Opção B: Comandos manuais (SQL ou Prisma Studio)

- Fazer backup.
- Identificar o `id` do cliente Inovajuntos e os `id` dos `ContentItem` ligados aos produtos desse cliente.
- Deletar primeiro esses `ContentItem`, depois os `Product` com `clientId` do Inovajuntos.

Recomendação: **Opção A**, para ter um único fluxo documentado e repetível.

---

## 5. Checklist obrigatório antes de rodar o reset

- [ ] **1. Backup do banco**  
  - Rodar: `bash scripts/backup-db.sh`  
  - Verificar se o arquivo foi gerado em `data/backups/backup_YYYYMMDD_HHMMSS.sql`.  
  - Se usar apenas `.env` (e não `.env.local`), ajustar o script ou ter `DATABASE_URL` no ambiente.

- [ ] **2. Ambiente**  
  - Confirmar que `DATABASE_URL` aponta para o banco que realmente será alterado (dev, staging ou produção).

- [ ] **3. Confirmação**  
  - Só executar o reset quando houver aprovação explícita e, no caso do script, com `CONFIRM_RESET_INOVAJUNTOS=1` (ou o que for definido).

---

## 6. Depois do reset: novo upload dos produtos Inovajuntos

1. **Colocar os PDFs** no diretório configurado no script de import (ex.: `Downloads/Produtos Inovajuntos` ou o definido em `import-inovajuntos-products.js`).

2. **Rodar o import:**  
   `node scripts/import-inovajuntos-products.js`  
   - O script mantém o cliente Inovajuntos e os projetos; cria/atualiza apenas os **produtos** com `fileUrl` em `public/resources/...`.

3. **Sincronizar conteúdo (timeline / Compartilhe):**  
   `node scripts/migrate-content-structure.js`  
   - Recria `ContentItem` e canais para **todos** os produtos (incluindo os novos do Inovajuntos). Produtos de outros clientes já existentes são apenas atualizados.

4. **Visibilidade (opcional):**  
   No **Admin → Produtos**, marcar para os produtos Inovajuntos (ou em massa): Público, Aparecer na timeline, Compartilhar.

Não é necessário rodar `seed-clients-products.js` para este plano: o foco é só Inovajuntos.

---

## 7. Riscos e mitigações

| Risco | Mitigação |
|-------|------------|
| Apagar banco errado | Backup obrigatório; conferir `DATABASE_URL` antes de rodar. |
| Apagar produtos de outro cliente | Script filtra apenas por `client.slug === 'inovajuntos'` (ou `clientId` do Inovajuntos). |
| Perder atestados | Apenas vínculos atestado–produto Inovajuntos são removidos; atestados em si permanecem. |
| Cliente Inovajuntos não existir | Script verifica existência do cliente e sai sem deletar nada se não encontrar. |

---

## 8. Resumo para aprovação

- **O que será feito:**  
  - Backup do banco.  
  - Deletar **somente** produtos do cliente Inovajuntos e os `ContentItem` ligados a eles (e dados em cascata).  
  - Produtos e conteúdo de todos os outros clientes permanecem.

- **Como:**  
  - Script único (ex.: `scripts/reset-inovajuntos-products.js`) com confirmação explícita e transação, **ou** passos manuais na mesma ordem (ContentItem primeiro, depois Product do Inovajuntos).

- **Depois:**  
  - Reimportar produtos Inovajuntos com `import-inovajuntos-products.js`.  
  - Rodar `migrate-content-structure.js`.  
  - Ajustar visibilidade no admin, se desejar.

Se você aprovar este plano, o próximo passo é implementar o script de reset apenas para Inovajuntos. Nenhuma alteração destrutiva no banco será feita antes da sua confirmação.
