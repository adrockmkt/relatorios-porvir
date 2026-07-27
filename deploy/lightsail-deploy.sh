#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/var/www/relatorios_porvir}
ARCHIVE_PATH=${ARCHIVE_PATH:-/tmp/relatorios-porvir-deploy.tar.gz}
DB_NAME=${DB_NAME:-relatorios_porvir}
DB_USER=${DB_USER:-relatorios_porvir_app}
APP_PORT=${APP_PORT:-5102}
APP_DOMAIN=${APP_DOMAIN:-https://relatorios.porvir.org}
BACKUP_DIR=${BACKUP_DIR:-/var/backups/relatorios_porvir}
UPLOAD_DIR=${UPLOAD_DIR:-/var/www/relatorios_porvir/uploads}

sudo mkdir -p "$APP_DIR"
sudo tar -xzf "$ARCHIVE_PATH" -C "$APP_DIR"
sudo chown -R ubuntu:www-data "$APP_DIR"
sudo chmod -R g+rX "$APP_DIR"

DB_PASS="$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 32)"
JWT_SECRET="$(openssl rand -hex 48)"

if ! sudo -u postgres psql -tAc "select 1 from pg_roles where rolname = '$DB_USER'" | grep -q 1; then
  sudo -u postgres createuser "$DB_USER"
fi

sudo -u postgres psql -c "alter role \"$DB_USER\" with login password '$DB_PASS';"

if ! sudo -u postgres psql -tAc "select 1 from pg_database where datname = '$DB_NAME'" | grep -q 1; then
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
fi

cat > /tmp/relatorios-server.env <<ENV
NODE_ENV=production
PORT=$APP_PORT
APP_BASE_URL=$APP_DOMAIN
CORS_ORIGIN=$APP_DOMAIN
DATABASE_URL=postgres://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME
DATABASE_ALLOW_LOCAL=true
DATABASE_SSL=false
JWT_SECRET=$JWT_SECRET
SESSION_TTL_HOURS=24
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
BACKUP_DIR=$BACKUP_DIR
UPLOAD_DIR=$UPLOAD_DIR
ENV

cat > /tmp/relatorios-vite.env <<ENV
VITE_APP_BASE_PATH=/
VITE_API_BASE_PATH=/api
ENV

sudo mv /tmp/relatorios-server.env "$APP_DIR/server/.env"
sudo mv /tmp/relatorios-vite.env "$APP_DIR/.env.production"
sudo chown ubuntu:www-data "$APP_DIR/server/.env" "$APP_DIR/.env.production"
sudo chmod 640 "$APP_DIR/server/.env" "$APP_DIR/.env.production"

cd "$APP_DIR"
npm ci
npm --prefix server ci
npm run build
npm --prefix server run migrate

sudo mkdir -p "$BACKUP_DIR"
sudo chown www-data:www-data "$BACKUP_DIR"
sudo chmod 2750 "$BACKUP_DIR"
sudo mkdir -p "$UPLOAD_DIR"
sudo chown www-data:www-data "$UPLOAD_DIR"
sudo chmod 2750 "$UPLOAD_DIR"
sudo chown -R www-data:www-data "$APP_DIR"
