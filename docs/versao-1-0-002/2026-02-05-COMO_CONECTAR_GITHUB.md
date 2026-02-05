# Como Conectar o Repositório ao GitHub

## 📋 Passo a Passo

### Opção 1: Criar Repositório Novo no GitHub

1. **Acesse GitHub:**
   - Vá para: https://github.com/new
   - Faça login na sua conta

2. **Criar Novo Repositório:**
   - **Repository name**: `MAURICIOZANIN-HUB` (ou `mauriciozanin-hub`)
   - **Description**: "Hub de Autoridade - Consultoria em Governança e Compras Públicas"
   - **Visibility**: Private (recomendado) ou Public
   - **NÃO marque** "Add a README file" (já temos)
   - **NÃO marque** "Add .gitignore" (já temos)
   - Clique em **"Create repository"**

3. **Copiar URL do Repositório:**
   - GitHub mostrará instruções
   - Copie a URL, será algo como:
     ```
     https://github.com/seu-usuario/MAURICIOZANIN-HUB.git
     ```
     ou
     ```
     git@github.com:seu-usuario/MAURICIOZANIN-HUB.git
     ```

4. **Conectar Repositório Local:**
   ```bash
   cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB
   git remote add origin https://github.com/seu-usuario/MAURICIOZANIN-HUB.git
   git push -u origin main
   ```

### Opção 2: Usar Repositório Existente

Se você já tem um repositório no GitHub:

1. **Copie a URL do repositório**
2. **Conecte:**
   ```bash
   cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB
   git remote add origin https://github.com/seu-usuario/MAURICIOZANIN-HUB.git
   git push -u origin main
   ```

## 🔐 Autenticação

### Se usar HTTPS:
- GitHub pode pedir credenciais
- Use Personal Access Token (não senha)
- Crie em: https://github.com/settings/tokens

### Se usar SSH:
- Configure SSH key no GitHub
- Use URL: `git@github.com:usuario/repo.git`

## ✅ Verificar Conexão

```bash
# Verificar remote configurado
git remote -v

# Deve mostrar:
# origin  https://github.com/seu-usuario/MAURICIOZANIN-HUB.git (fetch)
# origin  https://github.com/seu-usuario/MAURICIOZANIN-HUB.git (push)
```

## 🚀 Após Conectar

1. **Push inicial:**
   ```bash
   git push -u origin main
   ```

2. **Verificar no GitHub:**
   - Acesse: https://github.com/seu-usuario/MAURICIOZANIN-HUB
   - Deve ver todos os arquivos

3. **Conectar no Vercel:**
   - Vercel detectará automaticamente
   - Ou importe manualmente no dashboard

## ⚠️ Problemas Comuns

### Erro: "remote origin already exists"
```bash
# Remover remote existente
git remote remove origin

# Adicionar novamente
git remote add origin https://github.com/seu-usuario/MAURICIOZANIN-HUB.git
```

### Erro de autenticação
- Use Personal Access Token em vez de senha
- Ou configure SSH key

### Erro: "failed to push"
```bash
# Verificar se está na branch main
git branch

# Se não estiver:
git checkout -b main
git push -u origin main
```

---

**Próximo passo:** Após conectar, vá para o Vercel e importe o repositório!
