#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Arquivo .env.local não encontrado em $ENV_FILE"
  exit 1
fi

DATABASE_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | sed 's/^DATABASE_URL=\"//; s/\"$//')

if [[ -z "${DATABASE_URL}" ]]; then
  echo "DATABASE_URL vazio em .env.local"
  exit 1
fi

BACKUP_DIR="$ROOT_DIR/data/backups"
mkdir -p "$BACKUP_DIR"

STAMP=$(date +"%Y%m%d_%H%M%S")
OUT_FILE="$BACKUP_DIR/backup_${STAMP}.sql"

echo "Gerando backup em $OUT_FILE"
pg_dump "$DATABASE_URL" > "$OUT_FILE"
echo "Backup concluido."
