#!/usr/bin/env bash
# A Project 2 (booking) és Project 3 (NovaDrive Motors / novadrive-katalogus) buildjét
# a portfólió public/ mappájába másolja.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BOOKING_DIR="${BOOKING_DIR:-/media/sancii5427/D:/Webkészítés/project1}"
KATALOGUS_DIR="${KATALOGUS_DIR:-/media/sancii5427/D:/Webkészítés/novadrive-katalogus}"
SKIP_PROJECT2="${SKIP_PROJECT2:-0}"

if [[ "$SKIP_PROJECT2" != "1" ]]; then
  echo ">>> Project 2 build (BASE_PATH=/projects/project-2)"
  (cd "$BOOKING_DIR" && BASE_PATH=/projects/project-2 npm run build)
  mkdir -p "$ROOT/public/projects/project-2"
  cp "$BOOKING_DIR/dist/index.html" "$BOOKING_DIR/dist/main.js" "$ROOT/public/projects/project-2/"
  # Relatív main.js /projects/project-2 (nincs perjel) URL-en /main.js-re oldódna fel.
  sed -i 's|src="main.js"|src="/projects/project-2/main.js"|' "$ROOT/public/projects/project-2/index.html"
else
  echo ">>> Project 2 kihagyva (SKIP_PROJECT2=1)"
fi

echo ">>> Project 3 build (NovaDrive portfolio static → /projects/project-3)"
(cd "$KATALOGUS_DIR" && CI=false GENERATE_SOURCEMAP=false npm run build:portfolio)
mkdir -p "$ROOT/public/projects/project-3"
# preview.png megmarad; minden más a friss webpack buildből jön
find "$ROOT/public/projects/project-3" -mindepth 1 -maxdepth 1 ! -name 'preview.png' -exec rm -rf {} +
rsync -a --exclude 'preview.png' --exclude '*.map' \
  --exclude 'admin' --exclude 'api' --exclude 'includes' --exclude 'config' \
  --exclude 'uploads' --exclude 'database' --exclude '.htaccess' --exclude 'FELTOLTES.txt' \
  "$KATALOGUS_DIR/build/" "$ROOT/public/projects/project-3/"

echo ">>> Kész: public/projects/project-3 (NovaDrive)"
if [[ "$SKIP_PROJECT2" != "1" ]]; then
  echo ">>> Kész: public/projects/project-2"
fi
