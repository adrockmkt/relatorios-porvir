#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=${ENV_FILE:-/var/www/relatorios_porvir/server/.env}

set -a
source "$ENV_FILE"
set +a

mkdir -p "$BACKUP_DIR"

timestamp="$(date -u +%Y%m%d-%H%M%S)"
backup_file="$BACKUP_DIR/relatorios_porvir-$timestamp.dump"

pg_dump --format=custom --file="$backup_file" "$DATABASE_URL"
chmod 600 "$backup_file"

find "$BACKUP_DIR" -type f -name 'relatorios_porvir-*.dump' -mtime +30 -delete
