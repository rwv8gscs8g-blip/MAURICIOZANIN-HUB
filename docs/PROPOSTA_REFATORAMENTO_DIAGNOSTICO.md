# Proposta de refatoramento – Sistema de diagnóstico

Documento para **aprovação** antes da implementação. Objetivo: simplificar a lógica de salvamento, alinhar salas ao conceito “uma sala = um município = um diagnóstico” e tornar a interface coerente com o fluxo de uso.

---

## 1. Problemas atuais (resumo)

| Problema | Situação atual | Impacto |
|----------|----------------|--------|
| **Estrutura do diagnóstico** | Respostas do município e comentários/notas do consultor estão em blocos separados (eixos vs analises). | Leitura fragmentada; não fica claro “pergunta → resposta → comentário do consultor”. |
| **Salas e login** | Entrada na sala exige código + token; pode exigir login em alguns fluxos. | Dificulta coleta em sala de aula (MVP). |
| **Salvamento = muitas “versões”** | Cada **salvamento** (incluindo autosave) gera uma nova **DiagnosticoVersion** (snapshot). | Dezenas de “versões” (ex.: 27) sem significado de evolução (T0, T1, T2); confusão entre “não perder dados” e “histórico de etapas”. |
| **Um diagnóstico por município/sala** | Um mesmo município pode ter vários registros Diagnostico (por sala/wizard). Cada save atualiza um e cria nova versão. | Conceito “uma sala = um município = um único diagnóstico” não está explícito; resultado de uma sala deveria ser **um** documento. |
| **Ficha do município** | Ao clicar no município, há versões e conteúdo, mas falta seletor claro T0/T1/T2 e **gráfico comparativo** de avanços/retrocessos. | Dificulta ver evolução e tomar decisão. |
| **Impressão** | Hoje: impressão de um diagnóstico (por id). | Necessidade: imprimir **um ou mais** diagnósticos do município (ex.: T0, T1 e T2). |

---

## 2. Conceitos-alvo após refatoramento

### 2.1 Diagnóstico = formulário único (perguntas + respostas + consultor)

- O diagnóstico é **um formulário** com:
  - **Perguntas** (por eixo e perguntas-chave).
  - **Respostas** do município (preenchidas na sala ou pelo wizard).
  - **Comentários e notas do consultor** (por eixo e, se aplicável, perguntas-chave).
- **Regra de exibição:** em cada pergunta/eixo, mostrar:
  - A pergunta.
  - A resposta do município.
  - Abaixo ou ao lado: **comentário e nota do consultor** (quando existir).

Ou seja: **resposta do município** e **comentário do consultor** ficam juntos no mesmo bloco (abaixo ou ao lado), não em seções totalmente separadas.

### 2.2 Salas = um município, um diagnóstico (MVP: link aberto)

- **Uma sala = um município = um único diagnóstico.**
- Na criação da sala, o consultor/admin associa a sala a um município (ou a sala já é criada “para” aquele município). Quem entra na sala preenche **sempre o mesmo** diagnóstico daquele município.
- **MVP – Coleta sem login:**
  - **Link aberto:** uma URL fixa (ex.: `/sala/entrar` ou `/sala/coleta`).
  - **Sem necessidade de login.**
  - A pessoa informa **apenas o número da sala** (111, 222, 333, etc.).
  - Opcional: nome (ou identificação mínima) para registro de quem preencheu.
  - Com o número da sala, o sistema identifica o município e o diagnóstico (um por sala) e abre o formulário para preenchimento/continuação.
- **Salvamento (ver seção 2.3):** os dados são gravados no **mesmo** documento (mesmo Diagnostico), para não perder nada; não é “novo diagnóstico” a cada save.

### 2.3 Salvamento: mesmo documento; versões só em marcos

- **Objetivo do save:** evitar perda de dados (autosave, salvamento contínuo).
- **Regra:**  
  - **Um** registro **Diagnostico** por (município + sala), quando for fluxo por sala.  
  - **Salvar** = **atualizar** esse mesmo registro (eixos, perguntas-chave, identificação).  
  - **Não** criar uma nova “versão” (DiagnosticoVersion) a cada autosave.
- **Versões (T0, T1, T2) como marcos:**
  - **T0:** primeiro “envio” ou “conclusão” do preenchimento pelo município (ex.: botão “Enviar diagnóstico” ou “Finalizar preenchimento”).
  - **T1, T2, …:** marcos seguintes (ex.: após devolutiva do consultor e novo preenchimento, ou “Versão aprovada pelo consultor”).
  - Ou seja: **criar snapshot (DiagnosticoVersion) apenas em eventos explícitos** (envio pelo município, aprovação/revisão pelo consultor), não a cada save.
- **Efeito:** menos “versões” na lista; T0, T1, T2 passam a ter significado claro (etapas do processo), e o resultado de uma sala continua sendo **um** diagnóstico (um documento) que é apenas atualizado até o próximo marco.

### 2.4 Ficha do município (ao clicar no nome)

- Ao **clicar no nome do município** (na lista da área administrativa ou no mapa):
  - Abrir a **Ficha do município** (uma única tela de visualização).
- Conteúdo da ficha:
  - **Cabeçalho:** nome do município, UF, links úteis (preencher/editar, imprimir).
  - **Seletor de visualização:** escolha entre **T0, T1, T2** (conforme versões/marcos existentes). Ao selecionar, mostrar o **conteúdo daquele marco** (perguntas + respostas + comentários do consultor, já no formato “resposta abaixo ou ao lado de comentário”).
  - **Gráfico comparativo:** evolução entre T0, T1, T2 (e outros marcos): indicadores por eixo (ex.: notas) ao longo do tempo, mostrando **avanços e retrocessos** (ex.: gráfico de linhas ou barras por eixo/versão).
- Assim, a ficha concentra: **leitura do diagnóstico** (por etapa) e **comparativo visual** para decisão.

### 2.5 Impressão

- **Escopo:** impressão de **um ou mais** diagnósticos do **mesmo município** (ex.: T0, T1 e T2).
- **Fluxo:** na Ficha do município, opção “Imprimir” permitindo escolher quais marcos imprimir (ex.: só T0; T0 e T1; T0, T1 e T2). Gerar um único documento para impressão com as seções escolhidas (formato limpo, adequado para PDF/impressora).

---

## 3. Proposta de mudanças por camada

### 3.1 Modelo de dados (Prisma) – ajustes conceituais

- **Manter:**  
  - `Diagnostico` (um por município quando for “uma sala = um município”; ou um por município no wizard sem sala).  
  - `ClassroomSession` (sala) com vínculo opcional a `municipioIbgeId`.  
  - `DiagnosticoVersion`: usar **apenas para marcos** (T0, T1, T2), não para todo save.
- **Regras:**
  - Ao criar sala: definir `municipioIbgeId` (uma sala = um município).
  - Ao “entrar na sala” com código 111/222/333: buscar sala pelo código; buscar ou criar **um único** Diagnostico para (sala + município) e usar sempre esse registro para salvar.
  - No POST de diagnóstico (save):  
    - Se vier `classroomCode` (e opcionalmente sala já vinculada a município): **atualizar** o Diagnostico existente dessa sala/município (ou criar um se não existir).  
    - **Não** chamar `diagnosticoVersion.create` no save normal; só criar versão em “eventos de marco” (ex.: submissão, finalização de etapa pelo consultor).
- **Opcional:** campo em `DiagnosticoVersion` ou em `Diagnostico` para indicar “tipo de marco” (ex.: T0_SUBMITTED, T1_REVIEWED) para etiquetar T0, T1, T2 na interface.

### 3.2 API

- **POST `/api/diagnosticos`** (salvar/autosave):  
  - Sempre **update** (ou create se não existir) no **mesmo** Diagnostico quando for mesma sala/município.  
  - **Não** criar `DiagnosticoVersion` neste fluxo.  
  - Retornar sucesso e, se necessário, `diagnosticoId` para o cliente continuar editando.
- **Novo endpoint ou ação “Submeter / Registrar marco”** (ex.: POST `/api/diagnosticos/[id]/submit` ou `/api/diagnosticos/[id]/marco`):  
  - Ao ser chamado (ex.: botão “Enviar diagnóstico” ou “Registrar T1”):  
    - Atualizar status se aplicável.  
    - **Criar** uma entrada em `DiagnosticoVersion` (snapshot) para esse marco (T0, T1, T2).  
  - Assim, o histórico de versões fica só com marcos.
- **GET diagnóstico por município/sala:**  
  - Garantir que, dado `classroomCode` (ou sala) + município, retorne **um** Diagnostico (o que está vinculado àquela sala).

### 3.3 Entrada na sala (MVP – link aberto)

- **Rota:** manter ou padronizar em algo como `/sala/entrar` (ou `/sala/coleta`).
- **Comportamento:**  
  - Página **pública** (sem login).  
  - Único campo obrigatório para “entrar”: **número da sala** (111, 222, 333, etc.).  
  - Opcional: nome (ou identificação) do respondente.  
  - Sem token na MVP (link aberto): qualquer um que saiba o número pode acessar e preencher aquele município.  
  - Ao enviar: validar se a sala existe e está ativa; redirecionar para o formulário do diagnóstico **daquele** município (mesmo Diagnostico), em modo preenchimento.
- **Segurança MVP:** aceitar que o link é “aberto” por número de sala; depois pode-se acrescentar token ou senha se necessário.

### 3.4 Formulário do diagnóstico (exibição)

- **Refatorar a exibição** (tela de preenchimento e tela de leitura) para que, por cada **pergunta/eixo**:  
  - Mostre a **pergunta**.  
  - Mostre a **resposta do município**.  
  - Abaixo ou ao lado: **comentário e nota do consultor** (quando houver).  
- Isso pode ser feito com os mesmos modelos atuais (`EixoResposta`, `EixoAnaliseConsultor`, `PerguntasChaveResposta`), apenas mudando o layout/agrupamento na UI (bloco “resposta + comentário” junto).

### 3.5 Ficha do município (nova/refatorada)

- **Rota:** `/diagnostico/municipio/[ibgeId]` (já existe; consolidar como “Ficha do município”).
- **Conteúdo:**
  1. Cabeçalho (município, links: preencher/editar, imprimir).
  2. **Seletor T0 / T1 / T2:** dropdown ou abas com as versões/marcos existentes (vindas de `DiagnosticoVersion`). Ao selecionar, exibir o conteúdo daquele snapshot no formato “pergunta + resposta + comentário do consultor”.
  3. **Gráfico comparativo:** por eixo (e, se fizer sentido, nota geral), exibir evolução entre T0, T1, T2 (valores no tempo), com destaque para avanços e retrocessos.
  4. Se consultor: bloco “Análise do consultor” (edição de notas e comentários) na mesma página ou em aba.

### 3.6 Impressão

- **Rota/página:** manter algo como `/diagnostico/imprimir` ou criar `/diagnostico/municipio/[ibgeId]/imprimir`.
- **Parâmetros:** `municipioIbgeId` (ou `ibgeId`) + **quais marcos** imprimir (ex.: `versoes=T0,T1,T2` ou `ids` das versões).
- **Comportamento:** gerar um único documento (HTML/PDF) contendo a ficha do município e as seções dos diagnósticos escolhidos (T0, T1, T2…) no formato “pergunta + resposta + comentário do consultor”, adequado para impressão.

---

## 4. Resumo da lógica após refatoramento

| Aspecto | Antes | Depois |
|--------|--------|--------|
| **Salvamento** | Cada save cria nova DiagnosticoVersion. | Save atualiza o mesmo Diagnostico; versão (T0/T1/T2) só em “Submeter / Registrar marco”. |
| **Sala** | Código + token; pode haver vários diagnósticos por município. | Uma sala = um município = um Diagnostico; MVP: link aberto só com número da sala (111, 222, 333). |
| **Exibição** | Respostas e comentários do consultor em blocos separados. | Resposta do município e comentário do consultor juntos (abaixo ou ao lado) por pergunta/eixo. |
| **Ficha do município** | Versões em lista; conteúdo e comparativo em evolução. | Seletor T0/T1/T2 + conteúdo do marco + **gráfico comparativo** de avanços/retrocessos. |
| **Impressão** | Um diagnóstico por vez (por id). | Um ou mais diagnósticos do município (T0, T1, T2) em um único documento. |

---

## 5. Ordem sugerida de implementação (após aprovação)

1. **API – Salvamento**  
   - Alterar POST `/api/diagnosticos` para **não** criar `DiagnosticoVersion` no save normal.  
   - Garantir “um Diagnostico por sala+município” (buscar por sala e município; update ou create).

2. **API – Marco (T0, T1, T2)**  
   - Criar endpoint “Submeter / Registrar marco” que atualiza o Diagnostico e cria **uma** `DiagnosticoVersion` para esse marco.

3. **Sala – Link aberto (MVP)**  
   - Página de entrada sem login; apenas número da sala (111, 222, 333); opcional nome.  
   - Redirecionar para o formulário do diagnóstico daquele município (mesmo documento).

4. **Formulário – Exibição**  
   - Reorganizar UI para “pergunta → resposta município → comentário/nota consultor” por eixo e perguntas-chave.

5. **Ficha do município**  
   - Seletor T0/T1/T2; carregar conteúdo do marco selecionado; adicionar **gráfico comparativo** (avanços/retrocessos).

6. **Impressão**  
   - Permitir escolher um ou mais marcos (T0, T1, T2) do município e gerar um único documento para impressão.

---

## 6. Pontos para decisão / aprovação

- **MVP sala:** link totalmente aberto (só número 111, 222, 333), sem token e sem login, está de acordo?
- **Marcos T0, T1, T2:** definir que T0 = primeiro envio pelo município; T1/T2 = após devolutiva/ Nova submissão ou “aprovação pelo consultor”? Quem dispara o “Registrar marco” (município vs consultor)?
- **Gráfico comparativo:** apenas notas por eixo ao longo de T0→T1→T2, ou incluir também outros indicadores (ex.: quantidade de itens preenchidos)?
- **Compatibilidade:** diagnósticos e versões já existentes (ex.: 27 versões de Abreu e Lima): manter como histórico legado (ex.: exibir como “Versão 1…N”) ou propor migração/consolidação para T0/T1/T2?

Assim que esses pontos forem aprovados, a implementação pode seguir na ordem acima (ou em outra que você preferir).
