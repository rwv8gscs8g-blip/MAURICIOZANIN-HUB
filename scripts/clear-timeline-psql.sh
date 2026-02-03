#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Arquivo .env.local nao encontrado em $ENV_FILE"
  exit 1
fi

DATABASE_URL="$(grep '^DATABASE_URL=' "$ENV_FILE" | sed 's/^DATABASE_URL=\"//; s/\"$//')"

if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL nao encontrado no .env.local"
  exit 1
fi

echo "Limpando vinculos do canal timeline..."
psql "$DATABASE_URL" <<'SQL'
DELETE FROM "ContentItemChannel"
WHERE "channelId" IN (
  SELECT "id" FROM "ContentChannel" WHERE "key" = 'timeline'
);
SQL
echo "Timeline limpa."
