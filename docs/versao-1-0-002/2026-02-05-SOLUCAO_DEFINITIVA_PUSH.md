# 🔧 Solução Definitiva - Push no GitHub

## ❌ Problema

Você está recebendo: `Invalid username or token`

Isso acontece porque:
1. Credenciais antigas podem estar no keychain
2. Token pode estar incorreto ou sem permissões
3. HTTPS pode estar bloqueado

## ✅ Solução: Usar SSH (Mais Confiável)

SSH é mais seguro e não depende de tokens. Vamos configurar:

### Passo 1: Gerar Chave SSH

Execute no terminal:

```bash
cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB

# Gerar chave SSH (substitua pelo seu email)
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Pressione Enter para aceitar local padrão
# Pressione Enter para senha vazia (ou defina uma)
```

### Passo 2: Copiar Chave Pública

```bash
cat ~/.ssh/id_ed25519.pub
```

**Copie toda a saída** (começa com `ssh-ed25519` e termina com seu email)

### Passo 3: Adicionar Chave no GitHub

1. **Acesse:** https://github.com/settings/keys
2. **Clique em:** "New SSH key"
3. **Preencha:**
   - **Title**: `MacBook Pro - Mauricio Zanin Hub`
   - **Key**: Cole a chave que copiou
4. **Clique em:** "Add SSH key"

### Passo 4: Alterar Remote para SSH

```bash
cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB

# Alterar remote para SSH
git remote set-url origin git@github.com:rwv8gscs8g-blip/MAURICIOZANIN-HUB.git

# Verificar
git remote -v
```

### Passo 5: Testar Conexão

```bash
ssh -T git@github.com
```

Deve aparecer: `Hi rwv8gscs8g-blip! You've successfully authenticated...`

### Passo 6: Fazer Push

```bash
git push -u origin main
```

**Agora não pedirá senha!** 🎉

## 🚀 Script Automático

Execute:

```bash
cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB
bash CONFIGURAR_SSH_GITHUB.sh
```

O script faz tudo automaticamente!

## 🔄 Alternativa: Limpar e Tentar Token Novamente

Se preferir continuar com HTTPS:

### 1. Limpar Credenciais Antigas

```bash
# Remover credenciais do keychain
git credential-osxkeychain erase <<EOF
host=github.com
protocol=https
EOF
```

### 2. Criar Token NOVO

1. Acesse: https://github.com/settings/tokens
2. **Revogue tokens antigos** (se houver)
3. Crie um **novo token**:
   - **Note**: `Mauricio Zanin Hub - Novo`
   - **Scopes**: **`repo`** (marque tudo em repo)
   - **Expiration**: "No expiration"
4. **COPIE o token** imediatamente

### 3. Fazer Push

```bash
cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB
git push -u origin main
```

- Username: `rwv8gscs8g-blip`
- Password: **Cole o token NOVO** (não sua senha!)

## ✅ Recomendação

**Use SSH** - é mais confiável e não precisa de tokens!

Execute:
```bash
bash CONFIGURAR_SSH_GITHUB.sh
```

---

**Após configurar SSH, o push funcionará sem problemas!**
