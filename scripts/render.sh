#!/usr/bin/env bash
# Convert a CV .docx to PDF and make page preview images.
# Usage: bash render.sh <cv.docx> [outdir]   (default outdir: /tmp/cv-preview)
set -euo pipefail

DOCX="${1:?Usage: render.sh <cv.docx> [outdir]}"
OUT="${2:-/tmp/cv-preview}"
mkdir -p "$OUT"

# soffice.py ships with the docx skill; it handles sandbox quirks for LibreOffice.
SOFFICE=/mnt/skills/public/docx/scripts/office/soffice.py
cp "$DOCX" "$OUT/"
(cd "$OUT" && python "$SOFFICE" --headless --convert-to pdf "$(basename "$DOCX")" >/dev/null)

PDF="$OUT/$(basename "${DOCX%.docx}").pdf"
echo "PDF: $PDF"
pdfinfo "$PDF" | grep -E "^Pages"
pdftoppm -jpeg -r 80 "$PDF" "$OUT/preview"
ls "$OUT"/preview-*.jpg
