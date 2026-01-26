# 📦 Instalar Vercel CLI

## Opção 1: Usando npx (Recomendado - Sem Instalação Global)

Não precisa instalar! O projeto já tem um script que usa `npx`:

```bash
# Testar autenticação
bash scripts/vercel-com-token.sh whoami

# Fazer deploy
bash scripts/vercel-com-token.sh deploy

# Listar projetos
bash scripts/vercel-com-token.sh project ls
```

## Opção 2: Instalação Global (Opcional)

Se preferir instalar globalmente:

```bash
# Com sudo (pode pedir senha)
sudo npm install -g vercel

# Ou usando Homebrew (macOS)
brew install vercel-cli

# Depois autenticar
source scripts/carregar-env.sh
echo "$VERCEL_TOKEN" | vercel login --token
```

## Opção 3: Instalação Local no Projeto

```bash
npm install --save-dev vercel

# Depois usar com npx
npx vercel --token="$VERCEL_TOKEN" whoami
```

## ✅ Verificar Instalação

```bash
# Com npx (sempre funciona)
npx vercel --version

# Se instalado globalmente
vercel --version
```

---

**Recomendação:** Use a Opção 1 (script com npx) - não precisa instalar nada!
