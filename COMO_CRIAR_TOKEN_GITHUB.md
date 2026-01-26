# Como Criar Personal Access Token no GitHub

## 🔐 Por que Precisa de Token?

O GitHub não aceita mais senhas para autenticação via HTTPS. Você precisa usar um **Personal Access Token (PAT)**.

## 📋 Passo a Passo

### 1. Acessar Configurações

1. **Acesse:** https://github.com/settings/tokens
2. Ou vá em: **GitHub** → **Seu perfil** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**

### 2. Criar Novo Token

1. **Clique em:** "Generate new token" → "Generate new token (classic)"
2. **Preencha:**
   - **Note**: `Mauricio Zanin Hub - Vercel Deploy`
   - **Expiration**: Escolha (recomendo 90 dias ou "No expiration" para produção)
   - **Select scopes**: Marque **`repo`** (acesso completo a repositórios)
     - Isso dá acesso a:
       - ✅ Ler e escrever código
       - ✅ Fazer push e pull
       - ✅ Gerenciar repositórios

3. **Clique em:** "Generate token"

### 3. Copiar Token

⚠️ **IMPORTANTE:** Copie o token imediatamente! Você não poderá vê-lo novamente.

O token será algo como:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Usar o Token

Quando fizer push, use:
- **Username**: `rwv8gscs8g-blip` (seu usuário)
- **Password**: Cole o **token** (não sua senha!)

## 🔄 Configurar Git para Usar Token

### Opção 1: Usar Token no Push (Temporário)

```bash
git push -u origin main
# Username: rwv8gscs8g-blip
# Password: [cole o token aqui]
```

### Opção 2: Salvar Credenciais (Recomendado)

```bash
# Configurar Git Credential Helper
git config --global credential.helper osxkeychain

# No primeiro push, digite o token
# Ele será salvo no keychain do macOS
```

### Opção 3: Usar SSH (Mais Seguro)

1. **Gerar SSH Key:**
```bash
ssh-keygen -t ed25519 -C "seu-email@example.com"
```

2. **Adicionar ao GitHub:**
   - Copie a chave pública: `cat ~/.ssh/id_ed25519.pub`
   - Vá em: https://github.com/settings/keys
   - Clique em "New SSH key"
   - Cole a chave

3. **Usar URL SSH:**
```bash
git remote set-url origin git@github.com:rwv8gscs8g-blip/MAURICIOZANIN-HUB.git
git push -u origin main
```

## ✅ Verificar

Após configurar, teste:

```bash
git push -u origin main
```

Se funcionar, você verá:
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/rwv8gscs8g-blip/MAURICIOZANIN-HUB.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## ⚠️ Segurança

- ✅ **Nunca commite tokens** no código
- ✅ **Use tokens com escopo mínimo** necessário
- ✅ **Revogue tokens** antigos regularmente
- ✅ **Use SSH** para maior segurança (recomendado)

## 🔗 Links Úteis

- **Criar Token**: https://github.com/settings/tokens
- **SSH Keys**: https://github.com/settings/keys
- **Documentação**: https://docs.github.com/en/authentication

---

**Após criar o token, use-o como senha no push!**
