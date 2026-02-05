# PROMPT PARA PROCESSAR RELATÓRIOS INOVAJUNTOS

Use este prompt no ChatGPT, Claude, Gemini ou outro assistente de IA para processar os relatórios do InovaJuntos e gerar um JSON estruturado:

---

## PROMPT COMPLETO:

```
Você é um assistente especializado em processar documentos e extrair informações estruturadas para uma linha do tempo (timeline).

Analise os seguintes relatórios do projeto InovaJuntos e extraia TODOS os eventos, atividades, publicações, vídeos, workshops, reuniões e marcos importantes mencionados em cada documento:

**Relatórios para processar:**
- (2020) Relatório de ações - InovaJuntos
- (2021) Relatório de ações - InovaJuntos  
- (2022) Relatório de ações - InovaJuntos
- (2024) Relatório de ações - InovaJuntos

**Para cada evento encontrado, extraia:**
1. Data (formato: YYYY-MM-DD) - use a data exata do evento, se não houver, use 31/12 do ano do relatório
2. Título do evento/atividade (seja específico e descritivo)
3. Descrição detalhada (2-3 frases explicando o evento)
4. Tipo: "VIDEO", "DOC", "NEWS", "PROJECT", ou "PUBLICATION"
5. Categoria: "Inovajuntos", "CNM", "Cooperação Internacional", "Sebrae", "Artigo Técnico", etc.
6. URL/Link (se mencionado - links do Google Drive, YouTube, sites, etc.)
7. Localização (se mencionada - cidade, país)
8. Duração (se for vídeo, em segundos)

**Formato de saída esperado (JSON puro, sem markdown):**

{
  "events": [
    {
      "id": "inovajuntos-2024-01",
      "date": "2024-03-15",
      "title": "Título Completo do Evento",
      "description": "Descrição completa do evento, atividade ou publicação com contexto e importância.",
      "type": "VIDEO",
      "category": "Inovajuntos",
      "url": "https://link.com/evento",
      "location": "São Paulo, Brasil",
      "duration": 3600
    }
  ]
}

**Instruções importantes:**
- Inclua TODOS os eventos mencionados nos relatórios, não apenas os principais
- Mantenha as datas exatas como aparecem nos documentos
- Se um evento não tiver data específica, use 31/12/YYYY do ano do relatório
- Preserve links, URLs e referências exatas dos documentos
- Se houver vídeos do YouTube, extraia o link completo (https://www.youtube.com/watch?v=...)
- Se houver documentos do Google Drive, mantenha os links completos
- Ordene os eventos por data (mais recente primeiro)
- Seja detalhado nas descrições, incluindo contexto, participantes e importância
- Para relatórios anuais, crie um evento do tipo "DOC" com a data 31/12/YYYY

**Tipos de eventos:**
- VIDEO: Vídeos do YouTube, programas CNM, webinars, transmissões
- DOC: Documentos, relatórios, cartilhas, PDFs, apresentações
- NEWS: Notícias, artigos de mídia, menções em jornais
- PROJECT: Projetos, lançamentos, marcos do InovaJuntos, parcerias
- PUBLICATION: Publicações técnicas, artigos acadêmicos, cartilhas

**Após processar, retorne APENAS o JSON válido, sem texto adicional, sem markdown, sem explicações. Apenas o objeto JSON.**
```

---

## COMO USAR:

1. **Abra ChatGPT, Claude ou Gemini**
2. **Cole o prompt completo acima**
3. **Anexe ou cole o conteúdo dos 4 relatórios:**
   - (2020) Relatório de ações - InovaJuntos
   - (2021) Relatório de ações - InovaJuntos  
   - (2022) Relatório de ações - InovaJuntos
   - (2024) Relatório de ações - InovaJuntos
4. **Peça para processar e gerar o JSON**
5. **Copie o JSON gerado (apenas o objeto, sem markdown)**
6. **Envie para inserção na timeline**

---

## EXEMPLO DE JSON ESPERADO:

```json
{
  "events": [
    {
      "id": "inovajuntos-2024-relatorio",
      "date": "2024-12-31",
      "title": "Relatório de Ações - InovaJuntos 2024",
      "description": "Relatório anual completo das atividades, ações e resultados do projeto InovaJuntos em 2024.",
      "type": "DOC",
      "category": "Inovajuntos",
      "url": "https://drive.google.com/file/d/ABC123/view"
    },
    {
      "id": "inovajuntos-2024-workshop",
      "date": "2024-06-15",
      "title": "Workshop Internacional: Compras Públicas Sustentáveis",
      "description": "Workshop realizado em parceria com a União Europeia sobre compras públicas sustentáveis.",
      "type": "VIDEO",
      "category": "Cooperação Internacional",
      "url": "https://www.youtube.com/watch?v=xyz789",
      "location": "Bruxelas, Bélgica",
      "duration": 3600
    }
  ]
}
```

---

## ESTRUTURA TÉCNICA:

Cada evento segue esta interface TypeScript:

```typescript
interface TimelineEvent {
  id: string;                    // ID único (ex: "inovajuntos-2024-01")
  date: string;                  // Data no formato "YYYY-MM-DD"
  title: string;                 // Título descritivo do evento
  description: string;            // Descrição completa (2-3 frases)
  type: "VIDEO" | "DOC" | "NEWS" | "PROJECT" | "PUBLICATION";
  category: string;              // Categoria do evento
  url?: string;                  // Link opcional (Google Drive, YouTube, etc.)
  location?: string;             // Localização opcional
  duration?: number;             // Duração em segundos (apenas para vídeos)
  thumbnailUrl?: string;         // URL da thumbnail (apenas para vídeos)
}
```

---

**Após receber o JSON, envie-o para que eu possa inserir na timeline do site.**
