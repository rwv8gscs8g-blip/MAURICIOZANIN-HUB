# Fluxo do diagnóstico – entendimento e proposta de interface

## Onde está isso no sistema

| O quê | URL / rota | Arquivo no código |
|-------|------------|-------------------|
| **Página principal do diagnóstico** (mapa, lista de municípios T0/T1/T2, wizard) | `/diagnostico` | `src/app/diagnostico/page.tsx` |
| **Entrar na sala** (código da sala + nome para preencher diagnóstico) | `/sala/entrar` | `src/app/sala/entrar/page.tsx` |
| **Visualização do diagnóstico** (versões, conteúdo, comparativo, análise consultor) | `/diagnostico/municipio/[ibgeId]`<br>Ex.: `/diagnostico/municipio/2600054` (Abreu e Lima) | `src/app/diagnostico/municipio/[ibgeId]/page.tsx`<br>Componente: `DiagnosticoMunicipioViewClient.tsx` |
| Redirecionamento antigo “ver” | `/diagnostico/municipio/[ibgeId]/ver` → redireciona para a visualização acima | `src/app/diagnostico/municipio/[ibgeId]/ver/page.tsx` |
| **Imprimir relatório** (escolher versões T0/T1/T2) | `/diagnostico/municipio/[ibgeId]/imprimir` → seleção → `/diagnostico/imprimir?versaoIds=...` | `src/app/diagnostico/municipio/[ibgeId]/imprimir/page.tsx` |
| **Impressão por id** (estado atual do diagnóstico) | `/diagnostico/imprimir?id=<diagnosticoId>` | `src/app/diagnostico/imprimir/page.tsx` |
| **Análise do consultor** (notas, parte 3) | Dentro da visualização do município (seção “Análise do consultor”) | `src/app/diagnostico/municipio/[ibgeId]/ConsultorNotesClient.tsx` |

**Como chegar na visualização do diagnóstico:**
1. Acesse `/diagnostico` (é preciso estar logado).
2. Selecione um estado no mapa (ex.: PE).
3. Na lista “Municípios PE — Criar, editar e ajustar”, **clique no nome do município** ou no botão **“Ver diagnóstico”**.
4. Abre a página `/diagnostico/municipio/<ibgeId>` com versões (T0, T1…), conteúdo (perguntas e respostas) e comparativo. Se for consultor, aparece também a seção “Análise do consultor”.

---

## Seus passos no sistema (explicação tela a tela)

### 1) Logado como admin: Clientes → Sebrae
- **Onde:** `/clientes/sebrae`
- **O que é:** Painel do cliente Sebrae. Dali você escolhe **“Operar diagnóstico”** (Abrir diagnóstico, Gerenciar salas, Entrar na sala), Rascunhos e Produtos em destaque.
- **Fluxo:** É a porta de entrada para tudo que é diagnóstico nesse cliente.

### 2) Clicar em “Abrir diagnóstico”
- **Onde:** Leva para `/diagnostico` (com client/unit na URL, ex. `?client=sebrae&unit=sebrae-nacional`).
- **O que é:** A **página principal do diagnóstico**: mapa do Brasil, escolha de estado e, ao lado, a lista de municípios daquele estado (ex.: Pernambuco) com status T0, T1, T2… e ações (Criar, Editar, Ver diagnóstico, Relatório, Análise consultor).
- **Fluxo:** Aqui você escolhe o **estado** (ex.: PE) e vê todos os **municípios** e o estágio de cada um (Não iniciado, T0, T1, …, T4).

### 3) Estado PE selecionado, lista “Municípios de Pernambuco”
- **Onde:** Mesma página `/diagnostico`, com PE selecionado no mapa.
- **O que é:** Lista de municípios de PE com colunas: **MUNICÍPIO**, **STATUS** (Não iniciado, T0–T4), **ÚLTIMA NOTA**, **AÇÃO** (Criar/Editar, Ver diagnóstico, Relatório, Análise consultor).
- **Significado do STATUS:**  
  - **Não iniciado** = ainda não existe nenhuma versão salva.  
  - **T0** = 1 versão salva (ex.: primeira vez que a sala preencheu).  
  - **T1** = 2 versões, **T2** = 3, **T3** = 4, **T4** = 5 ou mais. Quanto maior o T, mais “evoluções” do mesmo diagnóstico (salvas pela sala ou pelo consultor).

### 4) Clicar em “Abreu e Lima” **no primeiro mapa / lista** (visão “Município”)
- **Onde:** Continua em `/diagnostico`. O sistema **seleciona o município Abreu e Lima** no wizard (para preencher/editar) e mostra à direita a **“Linha do tempo de versões”**.
- **O que são as “27 versões”:** Cada vez que alguém **salva** o formulário (participante na sala ou consultor), o sistema grava um **snapshot** (cópia daquele momento). Essas 27 entradas são **27 salvamentos** do diagnóstico de Abreu e Lima: Versão 1 = primeiro save (T0), Versão 2 = segundo (T1), … até a Versão 27.
- **“Nenhuma legível” / “não sei o que significam”:** Nessa tela do **wizard** (mesma página do diagnóstico), ao clicar em “Clique para ver conteúdo” em uma versão, o conteúdo aparece no **painel ao lado** (identificação, eixos, perguntas-chave). Se estiver em formato muito técnico (ex.: JSON ou blocos densos), a leitura fica difícil. A tela **“Ver diagnóstico”** (passo 5) foi feita justamente para mostrar esse conteúdo de forma **clara e legível** (perguntas e respostas por eixo, comparativo entre versões).

### 5) Na **Área administrativa**, clicar em “Ver diagnóstico” para Abreu e Lima
- **Onde:** Na mesma `/diagnostico`, na seção **“Municípios PE — Criar, editar e ajustar”**, na linha de **Abreu e Lima**, o botão **“Ver diagnóstico”**.
- **O que deveria acontecer:** Abrir a página **Visualização do diagnóstico** do município: `/diagnostico/municipio/2600054` (2600054 = código IBGE de Abreu e Lima). Nessa página você vê:
  - Versões em formato **T0, T1, T2…** (clique para escolher).
  - **Conteúdo da versão** em texto legível (perguntas e respostas por eixo).
  - **Comparativo** entre duas versões (ex.: T0 vs T2).
  - Se for consultor: bloco **“Análise do consultor”** (notas e recomendações).
- **Erro “não consegue destravar”:** Ao clicar em “Ver diagnóstico” ocorria um **Build Error** (erro de sintaxe no componente `DiagnosticoMunicipioViewClient.tsx`). Com isso, a página `/diagnostico/municipio/2600054` não carregava e a interface “trava” nesse ponto. Esse erro foi corrigido no código (fechamento do bloco condicional `)}` no JSX). Depois da correção, **“Ver diagnóstico”** deve abrir a visualização e você consegue **destravar** e ler o conteúdo de Abreu e Lima.

### Resumo da interação com o fluxo
- **Salas** → participantes entram com código, preenchem → cada **save** vira uma nova **versão** (T0, T1, …).
- **Consultor** → acessa o diagnóstico, **lê** o conteúdo (na página “Ver diagnóstico”) e **complementa** (notas, análise) na mesma página, seção “Análise do consultor”.
- **Relatório** → “Imprimir relatório” usa o conteúdo + notas em formato para impressão.
- **As “27 versões”** = histórico de 27 salvamentos do diagnóstico de Abreu e Lima; **“Ver diagnóstico”** é a tela onde esse histórico vira leitura clara e comparativo.

---

## Entendimento do fluxo

### 1) Diagnóstico = evolução dos questionários (T0, T1, T2…)
- O diagnóstico mostra a **evolução** dos formulários preenchidos: T0, T1, T2, T3, T4.
- Essa informação **já está correta** e aparece nos valores do mapa (por estado/município).

### 2) Salas de aula
- Salas são criadas para **atividade em sala**: as pessoas entram com um **código**, acessam a sala e preenchem o conteúdo.
- Esse conteúdo fica **dentro da sala** e é preenchido pelos participantes.
- O dado é registrado no sistema como **T0** (primeira versão do diagnóstico daquele município).

### 3) Papel do consultor
- O **consultor acessa esse conteúdo** e:
  - **Lê** o que foi perguntado e respondido (perguntas e respostas).
  - **Complementa** os dados e **coloca notas** (análise, parte 3, notas do consultor).
- **Problema atual**: não há interface clara para **ler o conteúdo** (perguntas e respostas). Falta uma tela que leve ao que foi perguntado e ao que foi respondido.

### 4) Relatório
- O **relatório** deve trazer o **conteúdo + notas** em formato **bonito para impressão**, com recomendações.
- Rota atual: `/diagnostico/imprimir?id=<diagnosticoId>`.

### 5) Clique no nome do município
- Ao **clicar no nome do município** (na lista/mapa), deve ser possível:
  - **Ver os formulários** que foram preenchidos: T0, T1, T2…
  - **Ver o documento** de cada versão (perguntas e respostas).
  - Ter um **comparativo visual** entre versões (o que mudou de uma para outra).

### Requisito central
- **Tudo precisa de uma interface de visualização do diagnóstico.** O diagnóstico serve para **tomada de decisão**; portanto, leitura e comparação devem ser fáceis e claras.

---

## Proposta de implementação (com a estrutura já criada)

### Objetivo
- **Uma única tela de “Visualização do diagnóstico” por município**, acessada ao clicar no nome do município.
- Essa tela deve: **mostrar conteúdo (perguntas e respostas)**, **versões (T0, T1, T2…)**, **comparativo entre versões** e, para consultor, **análise e notas**.

### Rota
- **`/diagnostico/municipio/[ibgeId]`** = página de visualização do diagnóstico do município.
- Ao clicar no nome do município (na lista do mapa), o link deve apontar para essa rota.

### Conteúdo da página (em ordem de uso)

1. **Cabeçalho**
   - Nome do município (UF).
   - Links: “Preencher/editar diagnóstico” (wizard), “Imprimir relatório”.

2. **Versões (T0, T1, T2…)**
   - Lista/timeline das versões do diagnóstico (a partir de `DiagnosticoVersion`).
   - Cada item: rótulo (T0, T1, T2…) + data.
   - Ao clicar em uma versão, ela fica selecionada e seu conteúdo é exibido abaixo.

3. **Conteúdo da versão selecionada**
   - Exibir de forma **clara e legível**:
     - **Eixos**: para cada eixo, aspectos positivos, negativos e alternativas de solução (perguntas e respostas, não só JSON).
     - **Perguntas chave**: cada pergunta com sua resposta (texto/lista, etc.).
   - Objetivo: **qualquer pessoa (e em especial o consultor) consegue ler o que foi perguntado e o que foi respondido.**

4. **Comparativo entre versões**
   - Permitir escolher **Versão A** e **Versão B** (ex.: T0 vs T1).
   - Mostrar **comparativo visual** (lado a lado ou destaque de diferenças) do conteúdo entre as duas versões.

5. **Análise do consultor** (apenas se usuário for consultor/admin)
   - Bloco na mesma página (ou aba) com:
     - Notas por eixo (positivo, negativo, solução).
     - Parte 3 (texto do consultor) por eixo.
     - Análise consolidada / recomendações.
     - Botão “Salvar análise”.
   - Assim o consultor **primeiro lê o conteúdo** (itens 2 e 3) e **depois preenche notas e recomendações** (item 5).

### Acesso
- **Quem pode abrir a visualização**: qualquer usuário logado que já acesse a lista/mapa de diagnósticos (ex.: consultor, admin). Opcional: permitir leitura para “sala” apenas do próprio município.
- **Consultor**: vê a mesma tela + o bloco “Análise do consultor”.

### Simplificação de rotas
- **`/diagnostico/municipio/[ibgeId]/ver`**: redirecionar para `/diagnostico/municipio/[ibgeId]` (tudo na mesma página).
- Manter **`/diagnostico/imprimir?id=...`** para relatório para impressão.

### Resumo do fluxo na interface
1. **Mapa** → municípios com T0, T1, T2… (já existe).
2. **Clique no nome do município** → abre **Visualização do diagnóstico** (`/diagnostico/municipio/[ibgeId]`).
3. Na visualização: **versões** → **conteúdo da versão** (perguntas e respostas) → **comparativo** (A vs B) → **análise do consultor** (se for consultor).
4. **Imprimir** → “Imprimir relatório” usa a página de impressão já existente, com conteúdo e notas.

Se esse fluxo estiver de acordo, a implementação segue essa estrutura.

---

## Implementado (resumo)

- **Rota única**: `/diagnostico/municipio/[ibgeId]` = visualização do diagnóstico (qualquer usuário logado).
- **Clique no nome do município** (lista do mapa) → abre essa página.
- **Conteúdo da página**: cabeçalho (município, links Preencher/editar, Imprimir relatório, Registrar marco) → versões T0, T1, T2… (clique para selecionar) → **conteúdo da versão selecionada** (perguntas e respostas por eixo + comentário do consultor junto a cada eixo) → **gráfico comparativo de evolução** (barras por eixo ao longo de T0→T1→T2, verde=avanço, vermelho=retrocesso) → **comparativo entre duas versões** (escolher A e B, tabela de evolução por eixo) → **análise do consultor** (só para consultor: notas e parte 3).
- **`/diagnostico/municipio/[ibgeId]/ver`** redireciona para `/diagnostico/municipio/[ibgeId]`.
- **Relatório**: link "Imprimir relatório" na ficha do município leva a `/diagnostico/municipio/[ibgeId]/imprimir`, onde o usuário escolhe uma ou mais versões (T0, T1, T2…); ao gerar, abre `/diagnostico/imprimir?versaoIds=...` com um único documento para impressão. Também é possível imprimir o estado atual por id: `/diagnostico/imprimir?id=...`.
