# Passo a passo: Diagnóstico — Como fazer, editar e imprimir (por ator)

Este documento descreve **como cada ator** deve interagir com o sistema para **fazer o diagnóstico**, **editá-lo** e **imprimi-lo**.

---

## Atores do sistema

| Ator | Descrição | Acesso |
|------|-----------|--------|
| **Participante (Município)** | Responsável pelo município que preenche as Partes 1 e 2 do diagnóstico (identificação, pontos positivos/negativos, soluções). | Pode entrar via **sala** (código + token) ou pelo **portal do cliente** (ex.: Sebrae). Não precisa de login para entrar na sala. |
| **Consultor** | Analista que preenche a **Parte 3** (notas e análises do consultor), acompanha salas e pode visualizar/editar diagnósticos. | Requer **login** (perfil Consultor ou Admin). |
| **Admin** | Mesmas permissões do Consultor + gestão de usuários, clientes e configurações. | Requer **login** (perfil Admin). |

---

## 1. Participante (Município) — Fazer o diagnóstico

### Opção A: Entrando por uma sala (recomendado em turma)

1. **Receber do consultor**
   - Link da página de entrada: **/sala/entrar** (ou `/sala/entrar?code=XXXX` com o código já preenchido).
   - **Código da sala** (ex.: `AB12CD`).
   - **Token** (fornecidos pelo consultor; guarde o token, pois não é exibido de novo).

2. **Entrar na sala**
   - Acesse **/sala/entrar**.
   - Informe **código** e **token**.
   - Preencha **nome**, e-mail (opcional), órgão/unidade e função (opcional).
   - Clique em **“Entrar e iniciar diagnóstico”**.

3. **Preencher o diagnóstico**
   - O sistema redireciona para o diagnóstico já vinculado à sala (e, se a sala tiver município definido, o contexto pode vir preenchido).
   - Na **Etapa 1**: escolha o **estado** no mapa (ex.: PE).
   - Na lista de **municípios**, localize o seu município (pode usar busca e filtros por status).
   - Clique em **“Avaliar →”** (ou **“Editar”** se já existir diagnóstico) no município desejado.
   - Na **Etapa 2**: preencha **identificação** (nome do responsável, e-mail, telefone, data, CNPJ, município).
   - Clique em **“Salvar rascunho”** e depois **“Iniciar diagnóstico”**.
   - Nas **etapas seguintes**: preencha os **eixos** (positivo, negativo, solução) e as **perguntas-chave**.
   - Use **“Salvar rascunho”** sempre que quiser guardar o progresso (autosave também ajuda).

4. **Submeter**
   - Ao terminar, clique em **“Submeter diagnóstico”**.
   - O status passa a **Submetido**; o consultor poderá analisar e preencher a Parte 3.

### Opção B: Pelo portal do cliente (Sem sala)

1. Acesse o portal do cliente (ex.: **/clientes/sebrae**).
2. Em **“Operar diagnóstico”**, clique em **“Abrir diagnóstico”** (ou em **“Produtos em destaque”** → **“Acessar produto”** no card do Diagnóstico de Maturidade).
3. Siga a partir do **passo 3** da Opção A (escolher estado → município → Avaliar/Editar → identificação → eixos → submeter).

---

## 2. Participante (Município) — Editar o diagnóstico

- **Antes de submeter**  
  - Continua na mesma sessão: avance/volte pelas etapas, altere respostas e use **“Salvar rascunho”**.  
  - Se abrir outro município por engano, volte na **Etapa 1** (mapa), escolha de novo o estado e o município correto e clique em **“Editar”** (ou **“Avaliar”** se for o primeiro preenchimento).

- **Depois de submeter**  
  - Se o consultor **devolver** o diagnóstico (status **Devolvido para ajustes**), o município pode editar de novo:  
    - Acesse o diagnóstico (pelo mesmo link da sala ou pelo cliente), entre no fluxo e altere o que for necessário.  
    - Use **“Salvar rascunho”** e, quando estiver pronto, pode submeter novamente (conforme regras da tela).

- **Limpar rascunho local**  
  - No topo da página do diagnóstico, use **“Limpar rascunho”** para descartar o rascunho salvo no navegador e começar do zero (só afeta o que está no navegador).

---

## 3. Participante (Município) — Imprimir o diagnóstico

- O participante **não** tem na tela um botão direto “Imprimir” para o próprio diagnóstico após submeter.
- Para imprimir:
  1. O **consultor** pode enviar o **link do relatório** ou o **ID** do diagnóstico.
  2. Link do relatório: **/diagnostico/imprimir?id=ID_DO_DIAGNOSTICO**  
     (substitua `ID_DO_DIAGNOSTICO` pelo id que o consultor informar).
  3. Abra esse link no navegador e use **Imprimir** (Ctrl+P / Cmd+P) ou **Salvar como PDF**.

---

## 4. Consultor — Fazer / acompanhar o diagnóstico (Parte 3)

1. **Login**  
   - Faça login com perfil **Consultor** (ou Admin).

2. **Acessar o diagnóstico**
   - **Opção 1**: Em **/clientes/sebrae** → **Operar diagnóstico** → **Abrir diagnóstico**.  
   - **Opção 2**: Acesse diretamente **/diagnostico** com parâmetros do cliente (ex.: `?client=sebrae&unit=sebrae-nacional`).

3. **Trocar perfil para Consultor**  
   - No topo da página do diagnóstico, no seletor **“Perfil ativo”**, escolha **Consultor**.

4. **Escolher estado e município**  
   - Na **Etapa 1**, selecione o **estado** no mapa.  
   - Na lista (ou na **Área administrativa**), localize o município e clique em **“Editar”** (ou **“Notas consultor”** se já existir diagnóstico).

5. **Preencher a Parte 3 (notas do consultor)**  
   - Avance até as etapas dos eixos. No modo **Consultor**, as Partes 1 e 2 ficam bloqueadas; apenas a **Parte 3** (análises e notas do consultor) é editável.  
   - Preencha notas e textos da Parte 3 e use **“Salvar rascunho”** ou o botão de salvar do consultor.  
   - Alternativa: use o link **“Notas do consultor →”** na lista do município para ir direto à tela **/diagnostico/municipio/[ibgeId]**, focada em notas e devolutiva.

6. **Status e devolutiva**  
   - O consultor pode alterar status (ex.: **Em análise**, **Devolvido para ajustes**, **Finalizado**) conforme o fluxo de trabalho da organização.

---

## 5. Consultor — Editar o diagnóstico

- **Notas e Parte 3**  
  - No diagnóstico: perfil **Consultor** → escolher estado/município → **Editar** ou **Notas consultor** → editar Parte 3 e salvar.  
  - Ou acessar **/diagnostico/municipio/[ibgeId]** para a visão só de notas do consultor.

- **Lista por estado**  
  - Na **Etapa 1**, na **Área administrativa** (abaixo da lista de municípios), a tabela mostra **Estado**, **Município**, **Status (T0–T4)** e ações: **Criar/Editar**, **Relatório**, **Notas consultor**. Use **Editar** ou **Notas consultor** conforme o caso.

- **Salas**  
  - Em **/sala**, abra a sala desejada; na lista de diagnósticos vinculados há links para **Relatório (HTML)** e, no diagnóstico, para edição/notas.

---

## 6. Consultor — Imprimir o diagnóstico

1. **Pelo diagnóstico**  
   - No fluxo do diagnóstico, se já houver um diagnóstico carregado (rascunho ou submetido), pode aparecer um link **“Relatório (HTML)”** no cabeçalho ou nas ações, que leva a **/diagnostico/imprimir?id=ID**.

2. **Pela lista de municípios (Etapa 1)**  
   - Na **Área administrativa**, na linha do município, clique em **“Relatório”** → abre **/diagnostico/imprimir?id=ID**.

3. **Pela tela de notas do consultor**  
   - Em **/diagnostico/municipio/[ibgeId]** há link para **Relatório** (imprimir).

4. **Pelo painel da sala**  
   - Em **/sala/[id]**, na lista “Diagnósticos vinculados”, clique em **“Relatório (HTML)”** para o diagnóstico desejado.

5. **Imprimir no navegador**  
   - Na página **/diagnostico/imprimir?id=ID**, use **Imprimir** (Ctrl+P / Cmd+P) ou **Salvar como PDF**.

---

## 7. Consultor — Criar sala e preparar para o diagnóstico

1. Acesse **/sala/criar** (ou **Operar diagnóstico** → **Gerenciar salas** → **Criar sala**).
2. Preencha **título** e **descrição**.
3. (Opcional) Em **Município do diagnóstico**, selecione o **estado (UF)** e busque pelo **nome do município** (ex.: Aliança); ao selecionar, o sistema preenche título/descrição e associa a sala ao município para o diagnóstico.
4. (Opcional) Defina **ciclo de gestão** (início/fim) e **expira em**.
5. Clique em **“Criar sala”**.
6. **Guarde o código e o token** (o token só aparece uma vez).
7. Em **/sala**, ative a sala (**Ativar**) e compartilhe com os participantes: link **/sala/entrar** + **código** + **token**.

---

## 8. Admin

- O **Admin** segue os mesmos passos do **Consultor** para fazer, editar e imprimir diagnósticos, criar salas e usar a Área administrativa.
- Além disso, o Admin pode:
  - Gerenciar usuários e perfis (**/admin**).
  - Acessar todas as salas e diagnósticos conforme permissões do sistema.

---

## Resumo rápido por objetivo

| Objetivo | Participante (Município) | Consultor / Admin |
|----------|---------------------------|--------------------|
| **Fazer o diagnóstico** | Entrar por sala ou cliente → Etapa 1: estado + município → Avaliar/Editar → Identificação → Eixos → Submeter. | Login → Abrir diagnóstico → Perfil Consultor → Estado + município → Editar/Notas consultor → Preencher Parte 3. |
| **Editar** | Antes de submeter: editar e “Salvar rascunho”. Devolvido: reabrir e editar. | Consultor: Editar ou Notas consultor → alterar Parte 3 e salvar. |
| **Imprimir** | Abrir link **/diagnostico/imprimir?id=ID** (ID fornecido pelo consultor) e imprimir/salvar PDF. | Na lista, Área administrativa, sala ou tela de notas: clicar em “Relatório” / “Relatório (HTML)” → /diagnostico/imprimir?id=ID → Imprimir no navegador. |

---

*Documento alinhado ao MVP do Diagnóstico (Cidade Empreendedora — Eixo 5 Compras) e ao manual de Sala (`MANUAL_SALA.md`).*
