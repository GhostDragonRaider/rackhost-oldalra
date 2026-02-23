#!/usr/bin/env bash
# Booking Appointment (Project 2) – VPS telepítés
# Futtasd a VPS-en (pl. ssh user@te-vps).
# Előtte a booking repóban legyen benne a base path módosítás (/projects/project-2).

set -e
BOOKING_DIR="${BOOKING_DIR:-/var/www/project-2-booking}"
REPO_URL="${REPO_URL:-git@github.com:GhostDragonRaider/bookingappointment.git}"
NODE_PORT="${NODE_PORT:-3001}"
API_PORT="${API_PORT:-8000}"

echo ">>> Booking app telepítése: $BOOKING_DIR (Node: $NODE_PORT, FastAPI: $API_PORT)"

if [ ! -d "$BOOKING_DIR" ]; then
  echo ">>> Klónozás..."
  sudo mkdir -p "$(dirname "$BOOKING_DIR")"
  sudo git clone "$REPO_URL" "$BOOKING_DIR"
  sudo chown -R "$USER:$USER" "$BOOKING_DIR"
else
  echo ">>> Már létezik, pull..."
  (cd "$BOOKING_DIR" && git pull)
fi

cd "$BOOKING_DIR"

echo ">>> Node függőségek..."
npm ci

echo ">>> Python venv + függőségek..."
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
. venv/bin/activate
pip install -r requirements.txt

echo ">>> Build (BASE_PATH=/projects/project-2)..."
BASE_PATH=/projects/project-2 npm run build

echo ">>> PM2: FastAPI (port $API_PORT) + Node (port $NODE_PORT)..."
PYTHON_CMD="$BOOKING_DIR/venv/bin/python"

# FastAPI
if pm2 describe booking-api &>/dev/null; then
  pm2 restart booking-api
else
  pm2 start "$PYTHON_CMD" --name booking-api --cwd "$BOOKING_DIR" -- -m uvicorn server:app --host 0.0.0.0 --port "$API_PORT"
fi

# Node (frontend + /api proxy)
if pm2 describe booking-web &>/dev/null; then
  pm2 restart booking-web --update-env
else
  cd "$BOOKING_DIR"
  API_BACKEND="http://127.0.0.1:$API_PORT" PORT="$NODE_PORT" pm2 start node --name booking-web -- scripts/serve.js
fi

pm2 save
echo ">>> Kész. Nginx: helyezd be a location /projects/project-2/ blokkot (port $NODE_PORT), majd: sudo nginx -t && sudo systemctl reload nginx"
