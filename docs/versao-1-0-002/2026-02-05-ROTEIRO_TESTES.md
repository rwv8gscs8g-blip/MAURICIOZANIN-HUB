# 📋 Roteiro de Testes - Sistema de Versionamento

## 🎯 Objetivo

Garantir qualidade e evitar regressões através de testes sistemáticos em cada ambiente antes de promover para produção.

## 🔄 Fluxo de Deploy

```
DEV → PREVIEW (Integrity Test) → PRODUCTION
```

### 1️⃣ DEV (Desenvolvimento Local)

**Objetivo:** Validar funcionalidades básicas antes de fazer deploy

**Comando:**
```bash
bash scripts/deploy-dev.sh
```

**Testes Obrigatórios:**
- [ ] Build executa sem erros
- [ ] Testes unitários passam (`npm run test:ci`)
- [ ] Lint passa (`npm run lint`)
- [ ] Aplicação inicia localmente (`npm run start`)
- [ ] Versão exibida no rodapé (sem incremento)

**Checklist Visual:**
- [ ] Homepage carrega corretamente
- [ ] Navegação funciona
- [ ] Rodapé exibe versão, build e data
- [ ] Sem erros no console do navegador

**Critério de Aprovação:** ✅ Todos os testes passam e build bem-sucedido

---

### 2️⃣ PREVIEW (Integrity Test)

**Objetivo:** Teste completo de integridade antes de produção

**Comando:**
```bash
bash scripts/deploy-preview.sh
```

**Testes Obrigatórios:**
- [ ] Build executa sem erros
- [ ] Testes unitários passam
- [ ] Lint passa
- [ ] Versão incrementada automaticamente
- [ ] Deploy no Vercel Preview bem-sucedido

**Checklist de Integridade:**
- [ ] **Navegação Completa:**
  - [ ] Homepage (`/`)
  - [ ] Sobre (`/sobre`)
  - [ ] Trajetória (`/trajetoria`)
  - [ ] Projetos (`/projetos`)
  - [ ] Publicações (`/publicacoes`)
  - [ ] Na Mídia (`/midia`)
  - [ ] Compartilhe (`/compartilhe`)
  - [ ] Relatórios (`/relatorios`)
  - [ ] Agenda (`/agenda`)

- [ ] **Funcionalidades:**
  - [ ] Galeria de fotos funciona
  - [ ] Downloads de arquivos funcionam
  - [ ] Timeline carrega eventos
  - [ ] Vídeos do YouTube carregam
  - [ ] Formulários funcionam (se houver)

- [ ] **Performance:**
  - [ ] Páginas carregam em < 3s
  - [ ] Imagens otimizadas
  - [ ] Sem erros 404

- [ ] **SEO:**
  - [ ] Meta tags presentes
  - [ ] JSON-LD válido
  - [ ] Sitemap acessível

- [ ] **Rodapé:**
  - [ ] Versão exibida (formato: V1.0.XXX)
  - [ ] Build number exibido
  - [ ] Data de deploy exibida
  - [ ] Ambiente: PREVIEW

**Critério de Aprovação:** ✅ Todos os testes passam e site funcional no Preview

---

### 3️⃣ PRODUCTION (Produção)

**Objetivo:** Deploy final em produção após validação completa

**Comando:**
```bash
bash scripts/deploy-production.sh
```

**Pré-requisitos:**
- [ ] ✅ DEV aprovado
- [ ] ✅ PREVIEW aprovado (Integrity Test completo)
- [ ] ✅ Confirmação manual do usuário

**Testes Obrigatórios:**
- [ ] Build executa sem erros
- [ ] Testes unitários passam
- [ ] Versão incrementada automaticamente
- [ ] Deploy no Vercel Production bem-sucedido

**Checklist Pós-Deploy:**
- [ ] Site acessível em produção
- [ ] Domínio customizado funcionando
- [ ] HTTPS ativo
- [ ] Variáveis de ambiente configuradas
- [ ] Database conectado
- [ ] Rodapé exibe ambiente: PROD

**Validação Final:**
- [ ] Testar URL principal: https://mauriciozanin.com.br
- [ ] Verificar versão no rodapé
- [ ] Confirmar que build number é único
- [ ] Validar data de deploy

**Critério de Aprovação:** ✅ Site funcionando perfeitamente em produção

---

## 📊 Versionamento

### Formato
```
V{MAJOR}.{MINOR}.{PATCH}
Exemplo: V1.0.000
```

### Incremento
- **MAJOR:** Mudanças incompatíveis (ex: V2.0.000)
- **MINOR:** Novas funcionalidades compatíveis (ex: V1.1.000)
- **PATCH:** Correções e melhorias (ex: V1.0.001) ← **Padrão em cada deploy**

### Build Number
- Gerado automaticamente (últimos 6 dígitos do timestamp)
- Único para cada build
- Exibido no rodapé

### Data de Deploy
- Timestamp ISO do momento do build
- Formatada para exibição: DD/MM/YYYY HH:MM

---

## 🚨 Regras Importantes

1. **Nunca pule etapas:** Sempre DEV → PREVIEW → PRODUCTION
2. **Sempre teste no Preview:** Integrity Test é obrigatório
3. **Versão é "queimada":** Cada deploy incrementa automaticamente
4. **Não reverta versão:** Use novo deploy para corrigir
5. **Documente problemas:** Anote qualquer issue encontrado

---

## 📝 Template de Relatório de Teste

```markdown
## Teste: [DEV/PREVIEW/PRODUCTION] - V[X.X.XXX]

**Data:** DD/MM/YYYY HH:MM
**Build:** XXXXXX
**Ambiente:** [DEV/PREVIEW/PRODUCTION]

### Resultados:
- [ ] Build: ✅/❌
- [ ] Testes: ✅/❌
- [ ] Lint: ✅/❌
- [ ] Deploy: ✅/❌

### Observações:
[Anotar problemas encontrados]

### Aprovação:
- [ ] Aprovado para próximo ambiente
- [ ] Requer correções
```

---

**Última atualização:** Sistema implementado em 26/01/2026
