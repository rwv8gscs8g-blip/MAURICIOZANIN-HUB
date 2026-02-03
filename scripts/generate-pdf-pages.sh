#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-public/resources}"
if ! command -v pdftoppm >/dev/null 2>&1; then
  echo "pdftoppm not found. Install with: brew install poppler"
  exit 1
fi

find "$ROOT_DIR" -type f -name "*.pdf" | while read -r pdf; do
  dir="$(dirname "$pdf")"
  base="$(basename "$pdf" .pdf)"
  outdir="$dir/$base"
  mkdir -p "$outdir"
  if ls "$outdir"/*.jpg >/dev/null 2>&1; then
    continue
  fi
  pdftoppm -jpeg -r 150 "$pdf" "$outdir/page"
  i=1
  for f in "$outdir"/page-*.jpg; do
    num=$(printf "%03d" "$i")
    mv "$f" "$outdir/page-$num.jpg"
    i=$((i+1))
  done
  echo "Geradas páginas: $pdf"
done
