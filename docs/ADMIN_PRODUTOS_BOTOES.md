# Admin Produtos – Botão Lixeira e Processar Entrada

## 1) Botão "Resetar Inovajuntos" (ícone de lixeira)

- **O que faz:** Apaga **todos** os produtos do cliente **Inovajuntos** (e só esse cliente). Não depende de seleção.
- **No banco:** Remove os `Product` do Inovajuntos e os `ContentItem` ligados.
- **No R2:** Remove as pastas `products/{slug}` desses produtos (capa e galeria).
- **Outros clientes:** Não são alterados.

A **seleção de produtos** (checkboxes "Marcar todos") serve para **atualização em massa** de visibilidade (Público, Timeline, Compartilhe, etc.), não para a lixeira. O botão **"Excluir"** em cada **atestado** remove só aquele atestado, não o produto.

---

## 2) Botão "Processar Pasta 'Entrada'"

- **Modo:** Em lote, para enviar PDFs ao R2 e gerar capa/galeria.
- **Requisito:** Pasta **`entrada`** na raiz do projeto com arquivos `.pdf` (e subpastas).
- **Regra:** O **nome do arquivo** (sem `.pdf`) é o **slug** do produto. O sistema procura um produto **já existente** com esse slug. Se não encontrar, esse PDF é ignorado (mensagem "Produto não encontrado para este slug").
- **Para cada PDF encontrado:**
  1. Envia o PDF para o R2 em `products/{slug}/`.
  2. Gera capa e galeria e envia para o R2.
  3. Atualiza o produto: `fileUrl` = URL do PDF no R2, visibilidade pública/cliente/timeline ativadas.
  4. **Apaga o arquivo da pasta `entrada`** após sucesso.

**Resumo:** Não cria produtos novos. Só atualiza produtos já cadastrados (por import na interface ou por script), envia PDF e imagens ao R2 e **remove o PDF da pasta entrada**. Para inserir em lote produtos **novos**, use antes a **importação pela interface** (um a um) ou o **script de import**; depois use "Processar Pasta 'Entrada'" para enviar os PDFs ao R2 e limpar a pasta.
