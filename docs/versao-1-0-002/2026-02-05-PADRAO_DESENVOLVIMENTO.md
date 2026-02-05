# 🚀 Padrão de Desenvolvimento - Maurício Zanin Hub

## 📋 Visão Geral

Este documento define o padrão de desenvolvimento, versionamento e deploy do projeto.

## 🔢 Sistema de Versionamento

### Formato
```
V{MAJOR}.{MINOR}.{PATCH}
Exemplo: V1.0.000
```

### Regras
1. **Cada deploy incrementa o PATCH** (último número)
2. **Versão é "queimada"** - não pode ser revertida
3. **Build number único** - gerado automaticamente (timestamp)
4. **Data de deploy** - registrada automaticamente

### Exibição no Rodapé
- **Versão:** V1.0.000
- **Build:** 123456 (6 dígitos)
- **Deploy:** 26/01/2026 14:30
- **Ambiente:** DEV / PREVIEW / PROD

## 🌍 Ambientes

### 1. DEV (Desenvolvimento)
- **Local:** `npm run dev`
- **Build:** `npm run deploy:dev`
- **Versão:** Não incrementa
- **Uso:** Desenvolvimento e testes locais

### 2. PREVIEW (Integrity Test)
- **Deploy:** `npm run deploy:preview`
- **Versão:** Incrementa automaticamente
- **Uso:** Testes completos antes de produção
- **URL:** Vercel Preview (gerada automaticamente)

### 3. PRODUCTION (Produção)
- **Deploy:** `npm run deploy:prod`
- **Versão:** Incrementa automaticamente
- **Uso:** Site em produção
- **URL:** https://mauriciozanin.com.br

## 🔄 Fluxo de Deploy

```
┌─────────┐
│   DEV   │ → Testes básicos, build local
└────┬────┘
     │ ✅ Aprovado
     ▼
┌──────────┐
│ PREVIEW  │ → Integrity Test completo
└────┬─────┘
     │ ✅ Aprovado
     ▼
┌─────────────┐
│ PRODUCTION  │ → Deploy final
└─────────────┘
```

## 📝 Processo de Deploy

### Passo 1: DEV
```bash
npm run deploy:dev
```

**Validações:**
- ✅ Build sem erros
- ✅ Testes passam
- ✅ Lint passa
- ✅ Aplicação inicia

### Passo 2: PREVIEW (Integrity Test)
```bash
npm run deploy:preview
```

**Validações:**
- ✅ Todas as validações do DEV
- ✅ Navegação completa
- ✅ Funcionalidades testadas
- ✅ Performance OK
- ✅ SEO validado

**⚠️ OBRIGATÓRIO:** Não pule esta etapa!

### Passo 3: PRODUCTION
```bash
npm run deploy:prod
```

**Validações:**
- ✅ Todas as validações do PREVIEW
- ✅ Confirmação manual
- ✅ Site em produção funcionando

## 🧪 Roteiro de Testes

Consulte `ROTEIRO_TESTES.md` para checklist completo de testes em cada ambiente.

## 📊 Comandos Úteis

```bash
# Ver versão atual
npm run version:get

# Ver informações completas
npm run version:info

# Incrementar versão manualmente (não recomendado)
npm run version:increment [major|minor|patch]

# Deploy DEV
npm run deploy:dev

# Deploy PREVIEW
npm run deploy:preview

# Deploy PRODUCTION
npm run deploy:prod
```

## 🚨 Regras Importantes

1. **Sempre seguir o fluxo:** DEV → PREVIEW → PRODUCTION
2. **Nunca pular PREVIEW:** Integrity Test é obrigatório
3. **Versão é automática:** Não mexa manualmente
4. **Documentar problemas:** Anote issues encontrados
5. **Testar tudo:** Use o roteiro de testes

## 📁 Arquivos do Sistema

- `.version` - Versão atual (V1.0.000)
- `scripts/version-manager.js` - Gerenciador de versão
- `scripts/pre-build.js` - Script pré-build
- `scripts/deploy-*.sh` - Scripts de deploy
- `ROTEIRO_TESTES.md` - Checklist de testes
- `src/lib/version.ts` - Utilitários de versão
- `src/components/layout/VersionFooter.tsx` - Componente de versão

## 🔒 Segurança

- Versões são commitadas no Git
- Build numbers são únicos
- Datas são registradas
- Ambiente é identificado no rodapé

---

**Última atualização:** 26/01/2026
**Versão do sistema:** V1.0.000
