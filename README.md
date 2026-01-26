# Maurício Zanin Hub - ERP de Consultoria

Sistema de gestão para consultoria em Governança e Compras Públicas.

## Tecnologias

- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma (Neon PostgreSQL)
- Framer Motion
- Lucide React

## Setup

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Configure o banco de dados:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

- `/src/app` - Rotas e páginas
- `/src/components` - Componentes React
- `/src/hooks` - Custom hooks
- `/src/lib` - Utilitários
- `/prisma` - Schema do banco de dados

## Funcionalidades

- Homepage com Hero Section e Pilar Triplo
- Rota `/compartilhe` para download de recursos
- Módulo de Relatórios com Status de Conformidade
- Hooks para integrações futuras (Zoom, D4Sign)
