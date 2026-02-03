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

echo "Atualizando ano dos produtos Inovajuntos para 2024..."
psql "$DATABASE_URL" <<'SQL'
UPDATE "Product"
SET "year" = 2024
FROM "ClientOrganization"
WHERE "Product"."clientId" = "ClientOrganization"."id"
  AND "ClientOrganization"."slug" = 'inovajuntos';
SQL
echo "Produtos Inovajuntos atualizados."
