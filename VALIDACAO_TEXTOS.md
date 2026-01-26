# Guia de Validação de Textos

## 📝 Checklist de Validação

Antes do deploy, valide todos os textos do site:

### Página Inicial (`/`)

- [ ] Título do Hero está correto
- [ ] Descrição está clara e sem erros
- [ ] Links funcionam corretamente
- [ ] Textos dos pilares estão corretos

### Página Sobre (`/sobre`)

- [ ] Nome completo está correto: **Luís Maurício Junqueira Zanin**
- [ ] Título profissional está correto: **Estrategista de Compras Públicas**
- [ ] Mini currículo está completo e correto:
  - [ ] Formação: Administração Pública - Unesp
  - [ ] Pós-graduação: MBA Políticas Públicas - FGV
  - [ ] Atuação no Sebrae Nacional
  - [ ] Consultoria no Ministério da Gestão
  - [ ] Portais: Compras.gov.br e PNCP
  - [ ] Órgãos de controle mencionados
- [ ] Biografia completa está revisada
- [ ] Citações estão corretas (ABNT, APA, BibTeX)

### Página Trajetória (`/trajetoria`)

- [ ] Datas dos eventos estão corretas
- [ ] Descrições dos eventos estão claras
- [ ] Links para documentos funcionam
- [ ] Vídeos do YouTube carregam corretamente

### Página Compartilhe (`/compartilhe`)

- [ ] Nomes dos recursos estão corretos
- [ ] Descrições estão claras
- [ ] Links de download funcionam
- [ ] Categorias estão corretas

### Página Publicações (`/publicacoes`)

- [ ] Títulos das publicações estão corretos
- [ ] Autores estão corretos
- [ ] Datas de publicação estão corretas
- [ ] Links para publicações funcionam

### Página Projetos (`/projetos`)

- [ ] Descrições dos projetos estão corretas
- [ ] Links para documentos funcionam
- [ ] Informações sobre Inovajuntos estão atualizadas

## ✅ Validação de Conteúdo Específico

### Mini Currículo

Verifique se contém:

1. **Formação Acadêmica:**
   - ✅ Administração Pública - Unesp
   - ✅ MBA Políticas Públicas - FGV

2. **Atuação Profissional:**
   - ✅ Autor da estratégia e conteúdos de compras governamentais do Sebrae Nacional
   - ✅ Consultor de Compras Governamentais junto ao Sebrae
   - ✅ Atuação no Ministério da Gestão, Inovação e Governo Digital
   - ✅ Elaboração e evolução dos portais Compras.gov.br e PNCP

3. **Órgãos de Controle:**
   - ✅ Tribunais de Contas
   - ✅ Atricon
   - ✅ Ministério Público
   - ✅ AGU
   - ✅ Procuradorias

## 🔍 Verificação de Qualidade

### Ortografia e Gramática

- [ ] Sem erros de ortografia
- [ ] Pontuação correta
- [ ] Acentos corretos
- [ ] Concordância verbal e nominal

### Consistência

- [ ] Nomes próprios consistentes em todas as páginas
- [ ] Datas no formato correto
- [ ] Links funcionam
- [ ] Imagens têm alt text descritivo

### SEO

- [ ] Meta descriptions estão preenchidas
- [ ] Títulos H1, H2, H3 estão corretos
- [ ] Keywords relevantes presentes
- [ ] Schema.org markup correto

## 🧪 Testes de Validação

### Teste Manual

1. Acesse cada página do site
2. Leia todos os textos em voz alta
3. Verifique links clicando neles
4. Teste em diferentes navegadores
5. Teste em dispositivos móveis

### Teste Automatizado

```bash
# Executar testes
npm test

# Verificar build
npm run build
```

## 📋 Checklist Final Antes do Deploy

- [ ] Todos os textos revisados
- [ ] Sem erros de ortografia
- [ ] Links funcionam
- [ ] Imagens carregam
- [ ] Formulários funcionam (se houver)
- [ ] SEO configurado
- [ ] Performance OK
- [ ] Mobile responsivo

## 🔄 Processo de Revisão

1. **Revisão Interna**: Revisar todos os textos
2. **Revisão Externa**: Pedir para outra pessoa revisar
3. **Validação Técnica**: Executar testes automatizados
4. **Validação Visual**: Verificar em diferentes dispositivos
5. **Aprovação Final**: Aprovar antes do deploy

---

**Última atualização:** 26 de Janeiro de 2026
