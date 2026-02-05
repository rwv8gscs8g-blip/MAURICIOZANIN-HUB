#!/bin/bash

# 1. Forçar remoção do arquivo de bloqueio do Next.js
echo "🔓 Removendo trava do Next.js (.next/dev/lock)..."
rm -f .next/dev/lock

# 2. Executar o teste
echo "🚀 Iniciando teste de Magic Link..."
# Definimos a porta aqui também por segurança, embora esteja no config
PORT=3070 npx playwright test tests/auth-magic-link.spec.ts
