#!/usr/bin/env bash
# Project 2–5 buildjeit a portfólió public/ mappájába másolja.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BOOKING_DIR="${BOOKING_DIR:-/media/sancii5427/D:/Webkészítés/project1}"
KATALOGUS_DIR="${KATALOGUS_DIR:-/media/sancii5427/D:/Webkészítés/novadrive-katalogus}"
COCKPIT_DIR="${COCKPIT_DIR:-/media/sancii5427/D:/Webkészítés/virtualcockpit}"
KEPESKARTYAK_DIR="${KEPESKARTYAK_DIR:-/media/sancii5427/D:/Webkészítés/kepeskartyak}"
SKIP_PROJECT2="${SKIP_PROJECT2:-0}"
SKIP_PROJECT3="${SKIP_PROJECT3:-0}"
SKIP_PROJECT4="${SKIP_PROJECT4:-0}"
SKIP_PROJECT5="${SKIP_PROJECT5:-0}"

if [[ "$SKIP_PROJECT2" != "1" ]]; then
  echo ">>> Project 2 build (BASE_PATH=/projects/project-2)"
  (cd "$BOOKING_DIR" && BASE_PATH=/projects/project-2 npm run build)
  mkdir -p "$ROOT/public/projects/project-2"
  cp "$BOOKING_DIR/dist/index.html" "$BOOKING_DIR/dist/main.js" "$ROOT/public/projects/project-2/"
  sed -i 's|src="main.js"|src="/projects/project-2/main.js"|' "$ROOT/public/projects/project-2/index.html"
else
  echo ">>> Project 2 kihagyva (SKIP_PROJECT2=1)"
fi

if [[ "$SKIP_PROJECT3" != "1" ]]; then
  echo ">>> Project 3 build (NovaDrive portfolio static → /projects/project-3)"
  (cd "$KATALOGUS_DIR" && CI=false GENERATE_SOURCEMAP=false npm run build:portfolio)
  mkdir -p "$ROOT/public/projects/project-3"
  find "$ROOT/public/projects/project-3" -mindepth 1 -maxdepth 1 ! -name 'preview.png' -exec rm -rf {} +
  rsync -a --exclude 'preview.png' --exclude '*.map' \
    --exclude 'admin' --exclude 'api' --exclude 'includes' --exclude 'config' \
    --exclude 'uploads' --exclude 'database' --exclude '.htaccess' --exclude 'FELTOLTES.txt' \
    "$KATALOGUS_DIR/build/" "$ROOT/public/projects/project-3/"
  echo ">>> Kész: public/projects/project-3 (NovaDrive)"
else
  echo ">>> Project 3 kihagyva (SKIP_PROJECT3=1)"
fi

if [[ "$SKIP_PROJECT4" != "1" ]]; then
  echo ">>> Project 4 build (Virtual Cockpit → /projects/project-4)"
  if [[ ! -x "$COCKPIT_DIR/node_modules/.bin/vite" ]]; then
    (cd "$COCKPIT_DIR" && npm ci)
  fi
  (cd "$COCKPIT_DIR" && VITE_BASE=/projects/project-4/ ./node_modules/.bin/vite build)
  mkdir -p "$ROOT/public/projects/project-4"
  find "$ROOT/public/projects/project-4" -mindepth 1 -maxdepth 1 ! -name 'preview.png' -exec rm -rf {} +
  rsync -a --exclude 'preview.png' "$COCKPIT_DIR/dist/" "$ROOT/public/projects/project-4/"
  if [[ ! -f "$ROOT/public/projects/project-4/preview.png" ]]; then
    cp "$COCKPIT_DIR/public/skins/audi-vc-preview.png" "$ROOT/public/projects/project-4/preview.png"
  fi
  echo ">>> Kész: public/projects/project-4 (Virtual Cockpit)"
else
  echo ">>> Project 4 kihagyva (SKIP_PROJECT4=1)"
fi

if [[ "$SKIP_PROJECT5" != "1" ]]; then
  echo ">>> Project 5 build (Képeskártyák → /projects/project-5)"
  if [[ ! -x "$KEPESKARTYAK_DIR/node_modules/.bin/vite" ]]; then
    (cd "$KEPESKARTYAK_DIR" && npm ci)
  fi
  (cd "$KEPESKARTYAK_DIR" && VITE_BASE=/projects/project-5/ ./node_modules/.bin/vite build)
  mkdir -p "$ROOT/public/projects/project-5"
  find "$ROOT/public/projects/project-5" -mindepth 1 -maxdepth 1 ! -name 'preview.png' -exec rm -rf {} +
  rsync -a --exclude 'preview.png' "$KEPESKARTYAK_DIR/dist/" "$ROOT/public/projects/project-5/"
  echo ">>> Kész: public/projects/project-5 (Képeskártyák)"
else
  echo ">>> Project 5 kihagyva (SKIP_PROJECT5=1)"
fi

if [[ "$SKIP_PROJECT2" != "1" ]]; then
  echo ">>> Kész: public/projects/project-2"
fi
