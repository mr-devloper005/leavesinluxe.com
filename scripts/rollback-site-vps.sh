#!/usr/bin/env sh
set -eu

if [ -z "${DEPLOY_IMAGE:-}" ]; then
  echo "Rollback failed: DEPLOY_IMAGE is required."
  echo "Example: DEPLOY_IMAGE=ghcr.io/owner/repo:previous-sha ./scripts/rollback-site-vps.sh"
  exit 1
fi

if [ ! -f docker-compose.vps.yml ]; then
  echo "Rollback failed: docker-compose.vps.yml not found. Run this from the site directory on VPS."
  exit 1
fi

if [ -f .env ]; then
  tmp="$(mktemp)"
  grep -v '^DEPLOY_IMAGE=' .env > "$tmp" || true
  cat "$tmp" > .env
  rm -f "$tmp"
else
  touch .env
fi
printf '\nDEPLOY_IMAGE=%s\n' "$DEPLOY_IMAGE" >> .env
chmod 600 .env

docker compose -f docker-compose.vps.yml pull
docker compose -f docker-compose.vps.yml up -d --remove-orphans
docker compose -f docker-compose.vps.yml ps
