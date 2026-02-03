#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL nao encontrado. Defina em .env.local ou exporte no shell."
  exit 1
fi

if command -v pg_isready >/dev/null 2>&1; then
  echo "Checando conexao com o banco..."
  if ! pg_isready -d "$DATABASE_URL"; then
    echo "Banco indisponivel. Verifique rede/VPN ou status do Neon."
    exit 1
  fi
else
  echo "pg_isready nao encontrado. Prosseguindo sem checagem rapida."
fi

node "$ROOT_DIR/scripts/import-ibge-pe7.js"
