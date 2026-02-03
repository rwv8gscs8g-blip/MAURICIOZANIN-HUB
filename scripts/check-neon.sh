#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Arquivo .env.local nao encontrado em $ENV_FILE"
  exit 1
fi

DATABASE_URL="$(python3 -c "import re, pathlib; text=pathlib.Path('$ENV_FILE').read_text(); m=re.search(r'DATABASE_URL=\"([^\"]+)\"', text); print(m.group(1) if m else '')")"

if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL nao encontrado no .env.local"
  exit 1
fi

echo "Testando conexao com o Neon..."
psql "$DATABASE_URL" -c "select 1;"
