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
```

4. **Configure o banco de dados:**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

Acesse: http://localhost:3000

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

**Última atualização:** 26 de Janeiro de 2026
