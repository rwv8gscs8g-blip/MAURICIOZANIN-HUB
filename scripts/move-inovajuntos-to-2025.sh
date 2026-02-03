#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"
SRC_DIR="$ROOT_DIR/public/resources/2024/inovajuntos"
DEST_DIR="$ROOT_DIR/public/resources/2025/inovajuntos"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Arquivo .env.local nao encontrado em $ENV_FILE"
  exit 1
fi

DATABASE_URL="$(grep '^DATABASE_URL=' "$ENV_FILE" | sed 's/^DATABASE_URL=\"//; s/\"$//')"

if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL nao encontrado no .env.local"
  exit 1
fi

if [[ -d "$SRC_DIR" ]]; then
  mkdir -p "$DEST_DIR"
  rsync -a "$SRC_DIR/" "$DEST_DIR/"
  rm -rf "$SRC_DIR"
fi

echo "Atualizando URLs no banco..."
psql "$DATABASE_URL" <<'SQL'
UPDATE "Product"
SET "fileUrl" = REPLACE("fileUrl", '/resources/2024/inovajuntos/', '/resources/2025/inovajuntos/')
WHERE "fileUrl" LIKE '/resources/2024/inovajuntos/%';
SQL

echo "Arquivos movidos para 2025 e URLs atualizadas."
