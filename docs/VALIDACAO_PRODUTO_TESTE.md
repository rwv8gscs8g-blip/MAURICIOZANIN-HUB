# Validação de produtos (teste e reset Inovajuntos)

## Validação Vercel + Neon + R2 (reset + 1 produto)

Quando os produtos aparecem **sem imagens** e o **PDF retorna 404** (como no kit2024), use esta sequência para resetar o Inovajuntos e subir **apenas 1 produto** para validar se a conexão **Vercel + Neon + R2** está funcionando.

### Ordem dos passos

1. **Backup (recomendado)**  
   `bash scripts/backup-db.sh`

2. **Reset Inovajuntos (banco + R2)**  
   `CONFIRM_RESET_INOVAJUNTOS=1 node scripts/reset-inovajuntos-with-r2.js`  
   - Apaga todos os produtos do cliente Inovajuntos e os `ContentItem`.  
   - Apaga as pastas `products/{slug}/` no R2 (se R2 estiver configurado no `.env`).

3. **Subir 1 produto de teste**  
   `node scripts/seed-one-inovajuntos-test.js`  
   - Cria o cliente/projeto Inovajuntos (se não existir) e **um** produto: `1-kit2023-postais-inova-juntos-brasil`.  
   - O PDF deve estar em `public/resources/2025/inovajuntos/1-kit2023-postais-inova-juntos-brasil.pdf`.

4. **Garantir que o PDF está no deploy**  
   - Commit e push de `public/resources/2025/inovajuntos/` (pelo menos o PDF do produto de teste).  
   - Fazer deploy na Vercel (ou aguardar o deploy automático).  
   - Sem o arquivo em produção, o proxy do PDF continua retornando 404. O proxy lê o arquivo de `public/` no servidor; em produção isso é o que foi implantado pelo build.

5. **Validar em produção (mauriciozanin.com)**  
   - **Neon:** Listagem `/produtos` mostra o 1 produto (dados vêm do banco).  
   - **Vercel + Neon:** Página do produto abre e mostra descrição e seção “Visualização do documento”.  
   - **Vercel (proxy):** “Baixar PDF” usa `/api/products/[slug]/pdf` e deve baixar o arquivo (não 404).  
   - **R2 (opcional):** No Admin, em “Processar PDF” para esse produto; depois a página deve mostrar galeria/capa no lightbox (confirma escrita no R2).

Depois de validar, reimporte a base com `import-inovajuntos-products.js` e `migrate-content-structure.js` (ver secção 2 abaixo).

---

## 1) Produto para testar na rota /produtos

Estes produtos têm PDF em **repositório** em `public/resources/2025/inovajuntos/` e são os mais prováveis de funcionar em produção (desde que a pasta esteja no deploy do Vercel):

| Produto | URL de teste |
|--------|----------------|
| 1.kit2023_postais_Inova_Juntos_Brasil | https://mauriciozanin.com/produtos/1-kit2023-postais-inova-juntos-brasil |
| 2.kit2024_postais_Inova_Juntos_Brasil | https://mauriciozanin.com/produtos/2-kit2024-postais-inova-juntos-brasil |
| 3.kit2025_postais_Inova_Juntos_Brasil | https://mauriciozanin.com/produtos/3-kit2025-postais-inova-juntos-brasil |
| Relatório Técnico Final Inovajuntos (assinado) | https://mauriciozanin.com/produtos/relatoriotecnicofinalinovajuntos-menorresolucao-assinado |

**O que validar**

- Abrir a URL → ver descrição do produto e a seção **Visualização do documento**.
- O PDF deve carregar no viewer (ou aparecer mensagem de erro + link “Baixar PDF”).
- Clicar em **Baixar PDF** → deve baixar o arquivo (não 404). O link usa o proxy `/api/products/[slug]/pdf`.
- Se no Admin você clicar em **Processar PDF**, as imagens vão para o R2 e a página passa a mostrar a **galeria (lightbox)**; clicar na capa deve abrir o álbum.

Se **todos** derem 404 no PDF ou na visualização, é provável que `public/resources/` não esteja no deploy (ou não commitado). Confira no repositório e no build do Vercel.

---

## 2) Se não houver produto correto: reset completo + um teste + reimportar

Quando quiser **apagar todos os produtos do Inovajuntos**, **apagar os arquivos associados no R2**, **subir um produto de teste**, **validar** e **reimportar a base**:

### Passo 1 – Backup (recomendado)

```bash
bash scripts/backup-db.sh
```

### Passo 2 – Reset Inovajuntos (banco + R2)

Apaga todos os produtos do cliente Inovajuntos, os `ContentItem` ligados e as pastas `products/{slug}/` no R2.

```bash
CONFIRM_RESET_INOVAJUNTOS=1 node scripts/reset-inovajuntos-with-r2.js
```

Exige `CONFIRM_RESET_INOVAJUNTOS=1`. Se o R2 não estiver configurado em `.env`, só o banco é limpo.

### Passo 3 – Um produto de teste

Cria um único produto (slug `1-kit2023-postais-inova-juntos-brasil`) com PDF em `public/resources/2025/inovajuntos/1-kit2023-postais-inova-juntos-brasil.pdf`:

```bash
node scripts/seed-one-inovajuntos-test.js
```

O script verifica se o PDF existe em `public/` antes de criar o produto.

### Passo 4 – Validar

1. Abrir **Produtos** e o produto de teste.
2. Ver **Visualização do documento** (viewer ou erro + “Baixar PDF”).
3. Clicar em **Baixar PDF** → deve baixar (proxy).
4. (Opcional) No Admin, **Processar PDF** e conferir galeria/lightbox e capa clicável.

### Passo 5 – Reimportar a base

Depois de validar, reimportar todos os PDFs do Inovajuntos e sincronizar conteúdo:

```bash
node scripts/import-inovajuntos-products.js
node scripts/migrate-content-structure.js
```

Ajuste `SOURCE_DIR` em `import-inovajuntos-products.js` para a pasta onde estão os PDFs de origem. Os PDFs são copiados para `public/resources/{ano}/inovajuntos/` e os produtos são criados/atualizados no banco.

---

## Scripts envolvidos

| Script | Função |
|--------|--------|
| `reset-inovajuntos-with-r2.js` | Apaga produtos Inovajuntos no banco e pastas `products/{slug}/` no R2. |
| `reset-inovajuntos-products.js` | Só banco (ContentItem + Product). Não mexe no R2. |
| `seed-one-inovajuntos-test.js` | Cria/atualiza um produto de teste (1-kit2023-postais-inova-juntos-brasil). |
| `import-inovajuntos-products.js` | Importa todos os PDFs do Inovajuntos para `public/` e banco. |
| `migrate-content-structure.js` | Sincroniza Product ↔ ContentItem e canais (timeline, compartilhe). |
