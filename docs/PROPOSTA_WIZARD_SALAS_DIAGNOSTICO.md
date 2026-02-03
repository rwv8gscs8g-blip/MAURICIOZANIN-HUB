# Proposta: Interface em Wizard — Salas, Diagnóstico e Relatório

## Objetivo

Simplificar o fluxo atual em **três atores e três etapas claras**, com interface em formato **wizard**, mantendo robustez e segurança (token, auditoria, RBAC).

---

## Visão geral do fluxo

```
[CONSULTOR] Cria N salas (Wizard) → cada sala = 1 município, código 111, 222, 333…
        ↓
[PARTICIPANTE] Entra com código (ex: 111) → preenche diagnóstico (autosave) → só edita sua área
        ↓
[CONSULTOR] Recebe dados → avalia → T0/T1/T2… → comentários, notas, recomendações → pode editar área participante + área consultor
        ↓
[RELATÓRIO] Impressão com considerações gerais + resultado (T0, T1, T2…)
```

---

## 1) Wizard: Criar salas (consultor)

### Lógica

- **Uma sala = um município.** O consultor informa **quantas salas** quer criar (ex: 5).
- O sistema gera **N salas** com **códigos simples e fixos**:
  - Sala 1 → código **111**
  - Sala 2 → código **222**
  - Sala 3 → código **333**
  - …
  - Sala 9 → código **999**
  - Sala 10+ → **1110, 1111, …** ou convenção a definir (ex: 10 → 1010).
- Cada sala continua com **token** (como hoje) para segurança: o participante entra com **código + token**. O código 111/222 é fácil de comunicar; o token continua sendo o segredo.
- Opcional: **vincular cada sala a um município** já no wizard (estado + nome do município), para pré-preencher o diagnóstico.

### Wizard — passos sugeridos

| Passo | Tela | Ação |
|-------|------|------|
| **1. Quantidade** | "Quantas salas deseja criar?" | Número (1–20). Cada sala = 1 município. |
| **2. Municípios (opcional)** | Para cada sala: "Sala 1 (código 111) — qual município?" | Busca por nome do município (como hoje em Criar sala). Se pular, o município é escolhido depois pelo participante. |
| **3. Ciclo e expiração** | Ciclo de gestão (início/fim), expiração (opcional) | Único para todas as salas ou por sala. |
| **4. Confirmação** | Lista: Sala 1 = 111 + município X, Sala 2 = 222 + município Y… | Botão "Criar todas as salas". |
| **5. Resultado** | Códigos e tokens (um por sala) | Exibir/baixar: 111 → token1, 222 → token2… Lembrar: token exibido uma vez. |

### Regras técnicas

- Códigos **111, 222, 333…** podem ser **reservados** no banco (ex: campo `code` com valor fixo por sala na criação em lote).
- Validação de entrada: **código + token** (hash), como hoje.
- Auditoria: criação em lote registrada (quem criou, quantas salas, quando).

---

## 2) Participante: Entrar na sala e preencher diagnóstico

### Lógica

- Participante recebe do consultor: **"Sala do município X: código 111, token XXXXX"**.
- **Entrada:** uma tela só (como hoje `/sala/entrar`): código **111** + token + nome (e opcionais).
- Após entrar, vai para o **diagnóstico já vinculado à sala (e ao município, se foi definido no wizard)**.
- **Preenche apenas a sua área:** identificação, eixos (Parte 1 e 2 — checklist e narrativas). **Não** vê nem edita Parte 3 (consultor).
- **Autosave:** dados salvos automaticamente (como hoje), sem necessidade de "Salvar rascunho" a cada passo.
- Pode **submeter** quando terminar (botão "Submeter diagnóstico"); após isso, não edita mais, a não ser que o consultor devolva.

### Interface em wizard (participante)

| Etapa | Conteúdo |
|-------|----------|
| **0** | Escolher estado (se não veio da sala) e município — ou já vem pré-preenchido pela sala. |
| **1** | Identificação (nome, e-mail, data, CNPJ, município). |
| **2 … N** | Eixos: para cada eixo, Parte 1 (checklist) + Parte 2 (narrativas). Barra de progresso, "Anterior" / "Próximo". |
| **N+1** | Perguntas-chave (se houver). |
| **Final** | Resumo + botão "Submeter diagnóstico". Mensagem: "Seus dados serão analisados pelo consultor." |

- Sem linha do tempo de versões na tela do participante (ou só "Rascunho salvo" e "Submetido").
- Sem comparativos T0/T1/T2 na tela do participante; isso fica no painel do consultor e no relatório.

---

## 3) Consultor: Receber, avaliar, T0/T1/T2, comentários e edição

### Lógica

- **Recebe os dados** submetidos (lista por sala/município, como hoje na área administrativa ou em "Diagnósticos submetidos").
- **Avalia o resultado** e define (ou o sistema calcula) **T0, T1, T2, T3, T4** por eixo/geral.
- **Inclui comentários, notas e recomendações** na **área exclusiva do consultor** (Parte 3 dos eixos + conclusões).
- **Pode modificar:**
  - **Área do participante:** ajustar texto, notas (Parte 1/2) se necessário.
  - **Área exclusiva do consultor:** sempre editável (Parte 3, recomendações).
- **Participante não edita** a área do consultor; **consultor pode editar** as duas áreas (mantendo auditoria/versões se desejado).

### Interface em wizard (consultor)

| Etapa | Conteúdo |
|-------|----------|
| **Lista** | Por sala/município: código (111, 222…), nome município, status (Rascunho / Submetido / Em análise / Devolvido / Finalizado), resultado atual (T0/T1/…). Ação: "Abrir para avaliar". |
| **Avaliação** | Uma tela por diagnóstico (wizard interno): 1) Ver resumo do participante (leitura). 2) Por eixo: notas do consultor (Parte 3), comentários, recomendação. 3) Indicar/confirmar nível (T0, T1, T2…) por eixo ou geral. 4) Considerações finais / recomendações gerais. 5) Status: Devolver / Finalizar. |
| **Edição** | Se "Editar área do participante": mesmas etapas do diagnóstico (identificação, eixos Parte 1 e 2), só que em modo consultor (bloqueio visual para o participante não confundir). Se "Editar minha área (consultor)": só Parte 3 e conclusões. |

- **Por sala** deve estar sempre visível: "Sala 111 — Município X" e, no relatório, "Resultado: T2" (ou o nível definido).

---

## 4) Relatório para impressão

### Conteúdo sugerido

- **Cabeçalho:** Projeto, município, sala (código 111), data.
- **Identificação:** responsável, e-mail, data do diagnóstico (dados do participante).
- **Por eixo:** 
  - Resumo do participante (Parte 1 e 2) — itens e narrativas.
  - Notas e comentários do consultor (Parte 3).
  - **Resultado do eixo:** T0, T1, T2, T3 ou T4 (conforme definido pelo consultor/sistema).
- **Nota geral / resultado geral:** T0, T1, T2… (um indicador claro por sala/município).
- **Considerações gerais:** texto do consultor (recomendações, conclusões).
- **Perguntas-chave** (se aplicável).

- **Segurança:** relatório só acessível para quem já pode ver o diagnóstico (consultor/admin ou participante com link/token conforme regra atual).

---

## 5) Simplificações mantendo robustez e segurança

| Aspecto | Simplificação | Mantido |
|---------|----------------|---------|
| **Código da sala** | Códigos fixos 111, 222, 333… no wizard (fácil de dizer "entre na 111"). | Token continua obrigatório (hash no banco). |
| **Criação de sala** | Wizard único: número de salas → (opcional) município por sala → criar em lote. | Uma sala = um município; vínculo com diagnóstico. |
| **Participante** | Wizard linear: entrada → identificação → eixos → submeter. Autosave. Sem timeline de versões. | Só edita sua área; submissão e status (Submetido, Devolvido). |
| **Consultor** | Lista por sala (111, 222…) e município; wizard de avaliação (ver → notas T0–T4 → comentários → finalizar). | Pode editar área participante + área consultor; RBAC; auditoria. |
| **Relatório** | Uma tela/PDF: identificação + eixos (participante + consultor) + resultado T0/T1/T2… + considerações gerais. | Impressão/PDF com tudo que é necessário para cada sala. |
| **T0/T1/T2** | Identificação clara **por sala/município** na lista do consultor e no relatório. | Cálculo ou definição manual por eixo/geral; consultor pode ajustar. |

---

## 6) Roteiro de implementação sugerido (por fases)

### Fase 1 — Wizard “Criar N salas”
- Tela wizard: número de salas (1–20).
- Geração em lote: códigos 111, 222, 333… (e 1010, 1011… se N > 9).
- (Opcional) Por sala: escolher município (busca por nome).
- Criar salas no backend (mesmo modelo atual de sala + token).
- Tela de resultado: tabela código × token × município; aviso “token só aparece uma vez”.

### Fase 2 — Fluxo participante simplificado
- Entrada: código (111, 222…) + token + nome (como hoje).
- Redirecionamento para diagnóstico já vinculado à sala (e município, se houver).
- Wizard linear: etapas 0 → 1 → 2… → submeter; autosave em cada etapa.
- Ocultar na interface do participante: linha do tempo de versões, comparativos, área do consultor.

### Fase 3 — Painel consultor por sala
- Lista “Por sala”: código 111, 222…, município, status, resultado (T0/T1/T2…).
- Abrir diagnóstico: modo consultor com wizard de avaliação (ver participante → preencher Parte 3 e T0–T4 → considerações gerais → Devolver/Finalizar).
- Regra clara: consultor pode editar área participante e área consultor; participante só a sua.

### Fase 4 — Relatório
- Página/rota de relatório por diagnóstico (como hoje) com:
  - Identificação, eixos (participante + consultor), **resultado T0/T1/T2… por eixo e geral**, considerações gerais.
- Botão imprimir / exportar PDF (browser ou futuro PDF server-side).

---

## 7) Esboço de telas (wizard)

### 7.1 Consultor — Wizard “Criar salas”

```
[Passo 1/4] Quantas salas?
  Número: [ 5 ]  (cada sala = 1 município)
  [Próximo]

[Passo 2/4] Município de cada sala (opcional)
  Sala 1 (código 111): [ Buscar município... ]  [ Aliança ]
  Sala 2 (código 222): [ Buscar município... ]
  ...
  [Próximo]

[Passo 3/4] Ciclo e expiração
  Ciclo início: [ 2025 ]  Fim: [ 2028 ]
  Expira em: [ opcional ]
  [Próximo]

[Passo 4/4] Confirmar
  Sala 1 — 111 — Aliança (PE)
  Sala 2 — 222 — (a definir)
  ...
  [Criar todas as salas]

[Resultado]
  Sala 1 — 111 — Token: xxxxx (copiar; não será exibido de novo)
  Sala 2 — 222 — Token: yyyyy
  ...
  [Concluído]
```

### 7.2 Participante — Entrada e diagnóstico

```
[Entrar]
  Código da sala: [ 111 ]
  Token: [ ________ ]
  Seu nome: [ ________ ]
  [Entrar e iniciar diagnóstico]

[Diagnóstico — Etapa 1/8] Identificação
  Nome, e-mail, município...
  (autosave)  [Próximo]

[Diagnóstico — Etapa 2/8] Eixo 1 — Governança...
  Parte 1 (checklist) + Parte 2 (narrativas)
  (autosave)  [Anterior] [Próximo]

...

[Diagnóstico — Etapa 8/8] Revisar e submeter
  Resumo.  [Submeter diagnóstico]
```

### 7.3 Consultor — Avaliar

```
[Salas]
  111 — Aliança (PE) — Submetido — [Avaliar]
  222 — Município Y — Submetido — [Avaliar]

[Avaliar — Sala 111 — Aliança]
  [1] Dados do participante (leitura)
  [2] Eixo 1 — Suas notas e comentários (Parte 3) | Resultado: [ T2 ]
  [3] Eixo 2 — ...
  [4] Considerações gerais
  [5] [Devolver] [Finalizar]
  (opção: [Editar área do participante])
```

---

Esta proposta mantém a **lógica de uma sala = um município**, **códigos simples (111, 222…)**, **token para segurança**, **autosave**, **áreas separadas (participante vs consultor)** e **resultado T0/T1/T2… por sala**, com interface em **wizard** em cada etapa. A implementação pode seguir as fases acima para reduzir complexidade sem perder robustez.
