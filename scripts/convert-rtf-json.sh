#!/usr/bin/env bash
set -euo pipefail

INPUT_DIR="${1:-/Users/macbookpro/Projetos/MAURICIOZANIN-HUB/data/timeline-import/raw}"
OUTPUT_DIR="${2:-/Users/macbookpro/Projetos/MAURICIOZANIN-HUB/data/timeline-import}"

mkdir -p "$OUTPUT_DIR"

convert_one() {
  local file="$1"
  local base
  base="$(basename "$file" .rtf)"
  local tmp="$OUTPUT_DIR/${base}.txt"
  local out="$OUTPUT_DIR/${base}.json"

  textutil -convert txt -stdout "$file" > "$tmp"
  node /Users/macbookpro/Projetos/MAURICIOZANIN-HUB/scripts/extract-json-from-text.js "$tmp" "$out"
  echo "Gerado $out"
}

for file in "$INPUT_DIR"/*.rtf; do
  convert_one "$file"
done
