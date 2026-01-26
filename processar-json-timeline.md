# INSTRUÇÕES PARA PROCESSAR JSON DA TIMELINE

Quando você receber o JSON processado pelo GPT/Gemini, siga estes passos:

## 1. VALIDAR O JSON

Certifique-se de que o JSON está válido. Você pode usar:
- https://jsonlint.com/
- Ou qualquer validador JSON online

## 2. FORMATO ESPERADO

O JSON deve ter esta estrutura:

```json
{
  "events": [
    {
      "id": "string",
      "date": "YYYY-MM-DD",
      "title": "string",
      "description": "string",
      "type": "VIDEO" | "DOC" | "NEWS" | "PROJECT" | "PUBLICATION",
      "category": "string",
      "url": "string (opcional)",
      "location": "string (opcional)",
      "duration": "number (opcional, apenas para vídeos)"
    }
  ]
}
```

## 3. ENVIAR PARA INSERÇÃO

Envie o JSON completo e eu vou:
1. Validar a estrutura
2. Mesclar com os eventos existentes
3. Ordenar por data
4. Inserir na timeline

## 4. EXEMPLO DE COMO ENVIAR

Você pode:
- Colar o JSON diretamente na conversa
- Ou dizer: "Aqui está o JSON processado: [cole o JSON]"

---

**Dica:** Se o JSON vier com markdown (```json ... ```), remova as tags de markdown antes de enviar.
