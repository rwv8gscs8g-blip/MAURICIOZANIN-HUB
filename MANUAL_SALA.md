# Manual — Sistema de Sala (MVP)

Este manual descreve **como usar a sistemática de Sala** no MVP do Diagnóstico (Cidade Empreendedora — Compras).

> Versão do MVP: formulários hardcoded (TypeScript), **sem Form Builder**, **sem PDF server-side** (somente relatório HTML print-friendly).

## Links rápidos (UI)

- **Lista/Gestão (Consultor)**: `/sala`
- **Criar Sala (Consultor)**: `/sala/criar`
- **Detalhe da Sala (Consultor)**: `/sala/[id]`
- **Entrar na Sala (Participante — público)**: `/sala/entrar`
- **Ajuda HTML (manual em página)**: `/ajuda/sala`

## Conceito (o que é “Sala”)

Uma **Sala** é uma sessão de sala de aula para coletar diagnósticos em grupo.

- O consultor cria a sala e recebe um **código curto** + **token mágico**.
- O participante entra com **código + token** e preenche o diagnóstico **sem login**.
- O diagnóstico fica **vinculado à sala** (tracking) e suporta **detecção de conflitos** via polling (sem WebSockets).

## Segurança (MVP)

- **Token mágico não é salvo em texto puro**: no banco fica apenas **hash**.
- O token é exibido **uma única vez** na tela de criação (consultor deve guardar).
- Rotas sensíveis (consultor/admin) são protegidas por **RBAC** (deny-by-default).
- O sistema registra eventos mínimos em `AuditLog` (append-only), incluindo `ipAddress`, `userAgent`, `requestId`.

## Status da Sala (ciclo de vida)

O consultor controla o status da sala:

- `PREPARACAO`: sala criada, ajustes finais.
- `ATIVA`: sala disponível para participantes entrarem e responderem.
- `ENCERRADA`: sala finalizada (não aceita novas entradas).
- `CANCELADA`: sala cancelada (não aceita entradas).

Regra prática (MVP):
- Participantes só devem entrar quando a sala estiver **ATIVA** (ou quando o backend permitir entrada conforme regra atual de `canJoinSession`).

## Fluxo do Consultor (passo a passo)

### 1) Criar a Sala

1. Acesse `/sala/criar` (requer login consultor/admin).
2. Preencha título/descrição, município (opcional), ciclo de gestão (opcional) e expiração (opcional).
3. Ao criar, o sistema exibe:
   - **Código** (ex.: `AB12CD`)
   - **Token mágico** (guarde em local seguro; não será exibido novamente)

### 2) Ativar e compartilhar

1. Acesse `/sala` e abra a sala criada.
2. Mude status para **ATIVA**.
3. Compartilhe com a turma:
   - Link público: `/sala/entrar`
   - **Código** + **Token** (para digitação na tela de entrada)

### 3) Acompanhar preenchimento (polling)

1. Abra `/sala/[id]`.
2. A tela faz polling para atualizar:
   - participantes
   - diagnósticos vinculados
   - alertas de conflito

### 4) Conflitos (last-write-wins + aviso)

Sem WebSockets (MVP): o sistema aplica **last-write-wins** e marca um “aviso de conflito” quando:

- um participante salva com `baseVersionNumber` defasado, e
- a versão no servidor já mudou.

O consultor:
- vê o alerta no painel da sala, e
- pode registrar uma “resolução” (append-only) pelo botão de resolução.

### 5) Encerrar sala

Quando o preenchimento terminar:
- mude status para **ENCERRADA** (ou **CANCELADA**, se for o caso).

## Fluxo do Participante (passo a passo)

### 1) Entrar na Sala (sem login)

1. Acesse `/sala/entrar`.
2. Informe:
   - **Código** da sala
   - **Token mágico**
   - dados básicos do participante (nome/e-mail, se solicitado)
3. O sistema guarda credenciais no navegador (sessão do participante) e redireciona para o diagnóstico.

### 2) Preencher diagnóstico com autosave

No wizard do diagnóstico:
- existe **autosalvamento** para reduzir perda por:
  - sessão expirada
  - fechamento de aba
  - perda de foco
- em caso de aviso de conflito, o preenchimento foi salvo, mas houve edição concorrente (consultor decide como consolidar).

### 3) Submeter

Ao final, use “Submeter diagnóstico”.

Regras (MVP):
- Sem login, a submissão é autorizada quando a requisição inclui **código + token** válidos e vinculados à sala do diagnóstico.

## Relatório (HTML print-friendly)

Para gerar o relatório:

- Use `/diagnostico/imprimir?id=<diagnosticoId>`
- Imprima pelo navegador (CSS `@media print` já preparado)

## Troubleshooting (rápido)

- **Token inválido / sala não encontrada**: confirme se o consultor copiou corretamente código e token.
- **Sala expirada**: verifique `expiresAt` na sala; crie uma sala nova se necessário.
- **Perdi o token**: (MVP) gere uma sala nova; o token é exibido uma vez por segurança.
- **Aviso de conflito**: continue salvando; o consultor deve consolidar e registrar resolução.

## Ajuda por página (botão “Ajuda”)

As telas do fluxo de Sala e Diagnóstico têm um botão “Ajuda” com instruções detalhadas.

- Manual HTML: `/ajuda/sala`
- Ajuda do diagnóstico: `/ajuda/diagnostico`

