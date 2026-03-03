#!/usr/bin/env bash
# Booking Appointment (Project 2) – VPS telepítés
# Futtasd a VPS-en: bash deploy-booking-to-vps.sh
# A booking repóban legyen benne a base path módosítás (/projects/project-2).

set -e
BOOKING_DIR="${BOOKING_DIR:-/var/www/project-2-booking}"
REPO_URL="${REPO_URL:-https://github.com/GhostDragonRaider/bookingappointment.git}"
NODE_PORT="${NODE_PORT:-3001}"
API_PORT="${API_PORT:-8000}"

echo ">>> Booking app: $BOOKING_DIR (Node: $NODE_PORT, FastAPI: $API_PORT)"

if [ ! -d "$BOOKING_DIR" ]; then
  echo ">>> Klónozás..."
  mkdir -p "$(dirname "$BOOKING_DIR")"
  git clone "$REPO_URL" "$BOOKING_DIR"
else
  echo ">>> Már létezik, pull..."
  (cd "$BOOKING_DIR" && git pull origin main || git pull origin master || true)
fi

cd "$BOOKING_DIR"

echo ">>> npm ci..."
npm ci

echo ">>> Python venv..."
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
# shellcheck source=/dev/null
. venv/bin/activate
pip install -q -r requirements.txt

echo ">>> Build BASE_PATH=/projects/project-2..."
BASE_PATH=/projects/project-2 npm run build

PYTHON_CMD="$BOOKING_DIR/venv/bin/python"

if pm2 describe booking-api &>/dev/null; then
  pm2 restart booking-api
else
  pm2 start "$PYTHON_CMD" --name booking-api --cwd "$BOOKING_DIR" -- -m uvicorn server:app --host 0.0.0.0 --port "$API_PORT"
fi

if pm2 describe booking-web &>/dev/null; then
  pm2 restart booking-web --update-env
else
  cd "$BOOKING_DIR"
  API_BACKEND="http://127.0.0.1:$API_PORT" PORT="$NODE_PORT" pm2 start node --name booking-web -- scripts/serve.js
fi

pm2 save
echo ""
echo ">>> Kész. Következő lépés – Nginx:"
echo "    sudo nano /etc/nginx/sites-enabled/default"
echo "    A 'location /projects/' ELÉ illeszd be:"
echo ""
cat << 'NGINX_BLOCK'

        location /projects/project-2/ {
            proxy_pass http://127.0.0.1:3001/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

NGINX_BLOCK
echo "    Majd: sudo nginx -t && sudo systemctl reload nginx"
