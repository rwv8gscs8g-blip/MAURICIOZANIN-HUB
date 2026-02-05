#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_LOCAL="$ROOT_DIR/.env.local"
ENV_BASE="$ROOT_DIR/.env"

# Priorizar .env.local, mas fazer fallback para .env
if [[ -f "$ENV_LOCAL" ]]; then
  ENV_FILE="$ENV_LOCAL"
elif [[ -f "$ENV_BASE" ]]; then
  ENV_FILE="$ENV_BASE"
else
  echo "Nenhum arquivo .env.local ou .env encontrado em $ROOT_DIR"
  exit 1
fi

DATABASE_URL="$(python3 -c "import re, pathlib; text=pathlib.Path('$ENV_FILE').read_text(); m=re.search(r'DATABASE_URL=\"([^\"]+)\"', text); print(m.group(1) if m else '')")"

if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL nao encontrado em $ENV_FILE"
  exit 1
fi

echo "Testando conexao com o Neon usando DATABASE_URL de $ENV_FILE..."
psql "$DATABASE_URL" -c "select 1;"
