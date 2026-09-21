#!/usr/bin/env bash
# Deploy AntiCode landing to anticode-vps (217.13.105.235)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${VPS_HOST:-anticode-vps}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/anticode}"
APP_PORT="${APP_PORT:-3000}"

echo ">>> Local build check"
cd "$ROOT"
npm run build

echo ">>> Ensure remote dirs"
ssh "$HOST" "mkdir -p '$REMOTE_DIR' /etc/nginx/sites-available /etc/nginx/sites-enabled"

echo ">>> Rsync app (no node_modules / .git / out)"
rsync -az --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .next \
  --exclude out \
  --exclude .vercel \
  --exclude .env.local \
  --exclude .env.production.local \
  --exclude data \
  --exclude '_booking-repo-check' \
  --exclude 'segítségek' \
  --exclude '*.log' \
  "$ROOT/" "$HOST:$REMOTE_DIR/"

echo ">>> Remote install + build + pm2"
# Quoted heredoc: nginx $host / $scheme must not expand locally under set -u
ssh "$HOST" "REMOTE_DIR='$REMOTE_DIR' APP_PORT='$APP_PORT' bash -s" <<'REMOTE'
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
cd "$REMOTE_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo ">>> Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo ">>> Installing nginx"
  apt-get update -y
  apt-get install -y nginx
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

# Avoid serving a half-built .next (500 + old error chrome)
pm2 stop anticode >/dev/null 2>&1 || true
rm -rf .next
npm ci
npm run build

# Prefer production env file if present; otherwise empty placeholder
if [ ! -f .env.production.local ] && [ ! -f .env.local ]; then
  touch .env.local
fi

if pm2 describe anticode >/dev/null 2>&1; then
  pm2 restart anticode --update-env
else
  PORT=$APP_PORT pm2 start npm --name anticode -- start
fi
pm2 save
pm2 startup systemd -u root --hp /root >/tmp/pm2-startup.txt 2>&1 || true
# Try to execute the suggested systemd line if printed
grep -o 'sudo .*' /tmp/pm2-startup.txt | head -1 | bash || true

# Preserve HTTPS if Let's Encrypt certs exist; otherwise HTTP-only for bootstrap
if [ -f /etc/letsencrypt/live/anticode.hu/fullchain.pem ]; then
cat > /etc/nginx/sites-available/anticode <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name anticode.hu www.anticode.hu 217.13.105.235;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    http2 on;
    server_name anticode.hu www.anticode.hu;

    ssl_certificate /etc/letsencrypt/live/anticode.hu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/anticode.hu/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_connect_timeout 60s;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX
else
cat > /etc/nginx/sites-available/anticode <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name anticode.hu www.anticode.hu 217.13.105.235;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_connect_timeout 60s;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX
fi

ln -sfn /etc/nginx/sites-available/anticode /etc/nginx/sites-enabled/anticode
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

echo ">>> Deployed. Public: https://anticode.hu/"
pm2 status

# Daily SEO Monitor cron (06:00) — requires SEO_CRON_SECRET in .env.local / .env.production.local
if [ -f .env.production.local ] || [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  [ -f .env.production.local ] && . ./.env.production.local
  [ -f .env.local ] && . ./.env.local
  set +a
fi
if [ -n "${SEO_CRON_SECRET:-}" ]; then
  CRON_LINE="0 6 * * * curl -fsS -H \"Authorization: Bearer ${SEO_CRON_SECRET}\" \"http://127.0.0.1:${APP_PORT}/api/cron/seo-check\" >/tmp/anticode-seo-cron.log 2>&1"
  (crontab -l 2>/dev/null | grep -v 'api/cron/seo-check' || true; echo "$CRON_LINE") | crontab -
  echo ">>> SEO daily cron installed (06:00)"
else
  echo ">>> SEO cron skipped (set SEO_CRON_SECRET on the VPS to enable daily checks)"
fi
REMOTE

echo ">>> Done."
