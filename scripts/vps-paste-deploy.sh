#!/bin/bash
# Ezt a blokkot másold be SSH-n a VPS-en (root@h105-9), egyben. Létrehozza a deploy scriptet.

cat > /root/deploy-booking-to-vps.sh << 'SCRIPT'
#!/usr/bin/env bash
set -e
BOOKING_DIR="${BOOKING_DIR:-/var/www/project-2-booking}"
REPO_URL="${REPO_URL:-git@github.com:GhostDragonRaider/bookingappointment.git}"
NODE_PORT="${NODE_PORT:-3001}"
API_PORT="${API_PORT:-8000}"

echo ">>> Booking app: $BOOKING_DIR (Node: $NODE_PORT, FastAPI: $API_PORT)"

if [ ! -d "$BOOKING_DIR" ]; then
  echo ">>> Klónozás..."
  mkdir -p "$(dirname "$BOOKING_DIR")"
  git clone "$REPO_URL" "$BOOKING_DIR"
else
  echo ">>> Pull..."
  (cd "$BOOKING_DIR" && git pull)
fi

cd "$BOOKING_DIR"
echo ">>> npm ci..."
npm ci
echo ">>> Python venv..."
if [ ! -d "venv" ]; then python3 -m venv venv; fi
. venv/bin/activate
pip install -r requirements.txt
echo ">>> Build BASE_PATH=/projects/project-2..."
BASE_PATH=/projects/project-2 npm run build

PYTHON_CMD="$BOOKING_DIR/venv/bin/python"
if pm2 describe booking-api &>/dev/null; then pm2 restart booking-api; else
  pm2 start "$PYTHON_CMD" --name booking-api --cwd "$BOOKING_DIR" -- -m uvicorn server:app --host 0.0.0.0 --port "$API_PORT"
fi
if pm2 describe booking-web &>/dev/null; then pm2 restart booking-web --update-env; else
  cd "$BOOKING_DIR"
  API_BACKEND="http://127.0.0.1:$API_PORT" PORT="$NODE_PORT" pm2 start node --name booking-web -- scripts/serve.js
fi
pm2 save
echo ">>> Kész. Nginx: add location /projects/project-2/ proxy (port $NODE_PORT), majd nginx -t && systemctl reload nginx"
SCRIPT

chmod +x /root/deploy-booking-to-vps.sh
echo "Script létrehozva: /root/deploy-booking-to-vps.sh"
echo "Futtatás: /root/deploy-booking-to-vps.sh"
