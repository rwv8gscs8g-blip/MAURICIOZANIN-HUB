# Checklist de Testes Funcionais (Dev → Preview → Produção)

Objetivo: garantir que **o mesmo commit** validado em Dev e Preview seja o que vai para Produção.

> MVP: sem PDF server-side; relatório é HTML print-friendly.

## Regras de ouro

- Execute **os mesmos testes** em **Dev** e em **Preview** antes de promover para **Produção**.
- Registre o commit/versão exibidos (ou `git rev-parse --short HEAD`) no final da validação.

## 1) Smoke test (site / rotas públicas)

- [ ] Home carrega (`/`)
- [ ] `/sobre` abre sem erros
- [ ] `/produtos` lista
- [ ] `/clientes` lista conforme flags/visibilidade

## 2) Autenticação e RBAC (mínimo)

- [ ] Login admin/consultor (`/auth/login`)
- [ ] Acessar `/dashboard` (deve funcionar logado)
- [ ] Acessar `/sala` (apenas consultor/admin)
- [ ] Acessar `/ajuda/sala` e `/ajuda/diagnostico` (públicos)

## 3) Sala (MVP)

- [ ] Criar sala em `/sala/criar`
  - [ ] copiar **código** e **token** (token exibido uma vez)
- [ ] Ativar sala (`PREPARACAO` → `ATIVA`)
- [ ] Entrar como participante (sem login) em `/sala/entrar` usando código+token
- [ ] Verificar redirecionamento para `/diagnostico` em modo sala

## 4) Diagnóstico (wizard + autosave)

- [ ] Preencher Parte 1/2 em pelo menos 1 eixo
- [ ] Confirmar “Autosave: salvo …” após editar campos
- [ ] Trocar de aba / minimizar navegador / voltar e confirmar que o rascunho se mantém
- [ ] Submeter diagnóstico

## 5) Consultor (devolutiva)

- [ ] Em `/sala/[id]`, ver diagnóstico vinculado e status
- [ ] Abrir “Notas do consultor” (`/diagnostico/municipio/[ibgeId]`)
- [ ] Preencher notas/textos (Parte 3) e salvar
- [ ] Finalizar devolutiva (status `FINALIZED`)

## 6) Relatório HTML print-friendly

- [ ] Abrir `/diagnostico/imprimir?id=<diagnosticoId>`
- [ ] Abrir print preview do navegador e confirmar layout

## 7) Conflitos (MVP, sem WebSockets)

Opcional (se tiver 2 pessoas/abas):
- [ ] Abrir o mesmo diagnóstico em duas abas
- [ ] Salvar em uma aba e depois salvar na outra (gerar conflito)
- [ ] Ver aviso de conflito e registrar resolução no painel da sala

## Registro final (obrigatório)

- **Ambiente**: Dev / Preview / Produção
- **Commit (git SHA)**: `____`
- **Data/hora**: `____`
- **Aprovado por**: `____`

