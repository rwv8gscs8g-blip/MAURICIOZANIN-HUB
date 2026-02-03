# Maurício Zanin Hub - ERP de Consultoria

Sistema de gestão e hub de autoridade para consultoria em Governança e Compras Públicas.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização utility-first
- **Prisma** - ORM para PostgreSQL (Neon)
- **Framer Motion** - Animações
- **Lucide React** - Ícones
- **Jest** - Testes automatizados
- **GitHub Actions** - CI/CD

## 📋 Funcionalidades

### Páginas Principais
- **Homepage** - Hero section, pilares e feed do LinkedIn
- **Sobre** - Biografia completa, mini currículo e galeria de fotos
- **Trajetória** - Timeline multimídia com vídeos, documentos e eventos
- **Projetos** - Documentação de projetos como Inovajuntos
- **Diagnóstico** - Wizard de maturidade em compras públicas (piloto PE)
- **Publicações** - Artigos e publicações acadêmicas
- **Na Mídia** - Menções na mídia e monitoramento de marca
- **Compartilhe** - Kit Compras Zanin (Sebrae) com recursos para download

### Recursos Técnicos
- ✅ SEO otimizado (JSON-LD Schema.org)
- ✅ Sistema de citações acadêmicas (ABNT, APA, BibTeX)
- ✅ Integração LinkedIn (aguardando aprovação API)
- ✅ Galeria de fotos profissionais com download
- ✅ Timeline multimídia com lazy loading
- ✅ Testes automatizados
- ✅ CI/CD com GitHub Actions

## 🧭 Arquitetura do Diagnóstico (Cidade Empreendedora)

- Referência das IAs consultadas: `ARQUITETURA_IA_REFERENCIAS.md`
- Decisões do MVP: `ARQUITETURA_DIAGNOSTICO_MVP.md`
- MVP aprovado:
  - Formulários hardcoded (TypeScript) para o Eixo 5 (Compras).
  - Token mágico e código de sala para uso em sala de aula.
  - Auditoria append-only básica (expandir na fase 2).
  - Relatórios HTML print-friendly (PDF server-side na fase 2).

## 🏫 Sala de Aula (MVP)

### Rotas (API)
- **Criar sala**: `POST /api/classrooms` (roles: `ADMIN|SUPERCONSULTOR|CONSULTOR`)
- **Listar salas**: `GET /api/classrooms` (roles: `ADMIN|SUPERCONSULTOR|CONSULTOR`)
- **Entrar com código + token**: `POST /api/classrooms/join` (público; valida token por hash)
- **Criar participante (consultor)**: `POST /api/classrooms/participants` (roles: `ADMIN|SUPERCONSULTOR|CONSULTOR`)
- **Detalhes/atualizar sala**: `GET|PATCH /api/classrooms/[id]` (roles: `ADMIN|SUPERCONSULTOR|CONSULTOR`)
- **Polling (sem WebSockets)**: `GET /api/classrooms/[id]/poll` (roles: `ADMIN|SUPERCONSULTOR|CONSULTOR`)
- **Resolver conflito (registro)**: `POST /api/classrooms/[id]/resolve-conflict` (roles: `ADMIN|SUPERCONSULTOR|CONSULTOR`)

### Telas (UI)
- **Lista/gestão (consultor)**: `/sala`
- **Criar sala (consultor)**: `/sala/criar`
- **Detalhe/polling (consultor)**: `/sala/[id]`
- **Entrar (participante)**: `/sala/entrar` (público)

### Manual e Ajuda
- Manual completo (Markdown): `MANUAL_SALA.md`
- Ajuda em HTML (público): `/ajuda/sala`

### Integração com Diagnóstico
- O wizard (`/diagnostico`) aceita o query param `classroomCode` e, ao salvar, envia `classroomCode + classroomToken` (token armazenado no browser pelo fluxo de entrada).
- O backend valida o token (hash) e salva:
  - `Diagnostico.classroomSessionId`
  - `Diagnostico.cicloGestaoInicio` / `Diagnostico.cicloGestaoFim` (quando informados na sala)
- Conflitos (MVP): last-write-wins com aviso via `baseVersionNumber` + `snapshot.conflict` em `DiagnosticoVersion`.
- **Visão simplificada (consultor)**: `/diagnostico/municipio/[ibgeId]` (foco em notas e textos do consultor; reduz dependência do wizard para devolutiva).
- **Hardening (Etapa 6)**:
  - `GET /api/diagnosticos/[id]/versions` exige **sessão consultor/admin** ou `classroomCode+classroomToken` (query string).
  - `POST /api/diagnosticos/[id]/submit` exige **sessão consultor/admin** ou `classroomCode+classroomToken` (body JSON).
  - `PATCH /api/diagnosticos/[id]/consultor` exige **sessão consultor/admin**.
  - Tentativas bloqueadas (401/403) passam a gerar eventos em `AuditLog` (ex.: `ACCESS_DENIED`).

## 🛠️ Setup Local

### Pré-requisitos
- Node.js 20.x
- npm ou yarn
- PostgreSQL (Neon recomendado)

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/MAURICIOZANIN-HUB.git
cd MAURICIOZANIN-HUB
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
AUTH_SECRET="gere_uma_chave_segura"
APP_BASE_URL="http://localhost:3000"
RESEND_API_KEY="sua_api_key"
MAIL_FROM="no-reply@mauriciozanin.com"
ADMIN_EMAIL="admin@mauriciozanin.com"
ADMIN_PASSWORD="senha_forte"
ADMIN_NAME="Administrador"
```

4. **Configure o banco de dados:**
```bash
npm run prisma:generate

# MVP: use db push (schema evolui sem migrations nesta fase)
npm run prisma:dbpush
```

5. **Crie o usuário admin:**
```bash
npm run admin:create
```

6. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

Acesse: http://localhost:3000 (ou porta alternativa informada no terminal)

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Com coverage
npm run test:coverage

# Para CI/CD
npm run test:ci
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte o repositório no Vercel
2. Configure variáveis de ambiente
3. Adicione domínio customizado
4. Deploy automático a cada push

Veja `DEPLOY_GUIDE.md` para instruções detalhadas.
Para o fluxo **Dev → Preview → Produção** com bancos separados e gate de testes, veja `docs/ETAPA7_VERCEL_DEV_PREVIEW_PROD.md` e `docs/QA_FUNCIONAL_CHECKLIST.md`.

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/              # Rotas e páginas (App Router)
│   ├── components/       # Componentes React
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilitários
│   ├── data/             # Dados estáticos
│   └── __tests__/        # Testes
├── prisma/               # Schema do banco de dados
├── public/               # Arquivos estáticos
│   ├── images/           # Imagens
│   └── resources/        # Recursos para download
├── .github/              # GitHub Actions workflows
└── docs/                 # Documentação
```

## 🔗 Links Úteis

- **Documentação de Deploy**: `DEPLOY_GUIDE.md`
- **Configuração Vercel**: `VERCEL_CONFIGURACAO_COMPLETA.md`
- **Integração LinkedIn**: `LINKEDIN_INTEGRATION.md`
- **Validação de Textos**: `VALIDACAO_TEXTOS.md`

## 📝 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm start` - Servidor de produção
- `npm run lint` - Executar ESLint
- `npm test` - Executar testes
- `npm run test:watch` - Testes em modo watch
- `npm run test:coverage` - Testes com coverage

## 🔒 Variáveis de Ambiente

Veja `.env.example` para lista completa de variáveis necessárias.

## 📄 Licença

Este projeto é privado e proprietário.

## 👤 Autor

**Luís Maurício Junqueira Zanin**
- Site: https://mauriciozanin.com.br
- LinkedIn: [Perfil LinkedIn]

---

## 🧾 Diagnóstico de Maturidade (MVP)

### Limitações atuais
- **Mapeamento CNPJ → Município**: sem base pública universal. O wizard consulta (`GET`) mas não faz persistência pública automática; o `POST /api/diagnosticos/lookup-cnpj` é restrito a consultor/admin.
- **RBAC/ACL**: deny-by-default aplicado nas rotas sensíveis do diagnóstico e sala; próximas fases podem expandir RBAC para cobrir todas as rotas legadas.
- **Dados faltantes**: quando IBGE não retorna um dado, exibimos “Não informado na fonte consultada”.

### Fontes de dados
- **IBGE (oficial)**: municípios, área territorial e projeção populacional.
- **Wikipedia (complementar)**: resumo exibido com aviso de não-oficialidade.

### Regras de edição
- Município edita **Partes 1 e 2** e notas dos blocos.
- Consultor edita **Parte 3** após submissão e pode finalizar devolutiva.
- Auditoria mínima: status, timestamps e usuário (ver modelos Prisma).

### Como rodar o wizard
- Acesse `/diagnostico`
- Selecione o perfil no topo (Município ou Consultor) para testar o fluxo.

### Como testar o fluxo de Sala (manual)
- Como consultor (logado), crie uma sala em `/sala/criar` e guarde **código + token**.
- Como participante (sem login), acesse `/sala/entrar`, informe **código + token**, e prossiga para o wizard.
- Para relatório: use `/diagnostico/imprimir?id=<diagnosticoId>` e imprima pelo navegador (`@media print`).

### Prisma (MVP)
```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:dbpush
```

**Última atualização:** 2 de Fevereiro de 2026

---

## 🔐 Autenticação e RBAC

### Fluxos disponíveis
- Login por senha (`/auth/login`)
- Magic link (`/auth/magic`)
- Redefinição de senha (`/auth/request` → `/auth/reset`)
- Login por certificado (via header `x-cert-thumbprint` ou `x-ssl-client-sha1`)

### Regras
- Rotas `/dashboard` e `/admin` são exclusivas para `ADMIN`.
- Usuários com `certificateOnly = true` não podem logar por senha.
- Logs mínimos em `AuditLog` para login, logout, reset e criação/edição.

### Upload de avatar
- Endpoint `POST /api/uploads/avatar` (multipart/form-data, campo `file`).
- Armazena em `public/uploads/avatars` (MVP local).

### Observações
- Para produção, configure `AUTH_SECRET`, `APP_BASE_URL` e `RESEND_API_KEY`.
- O envio de e-mails é simulado quando `RESEND_API_KEY` não está presente.
