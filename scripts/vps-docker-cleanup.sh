#!/usr/bin/env sh
set -eu

RETENTION_IMAGES="${RETENTION_IMAGES:-168h}"
RETENTION_BUILDER="${RETENTION_BUILDER:-24h}"

echo "Docker disk before cleanup:"
docker system df || true

echo "Pruning stopped containers..."
docker container prune -f || true

echo "Pruning unused images older than ${RETENTION_IMAGES}..."
docker image prune -af --filter "until=${RETENTION_IMAGES}" || true

echo "Pruning build cache older than ${RETENTION_BUILDER}..."
docker builder prune -af --filter "until=${RETENTION_BUILDER}" || true

echo "Docker disk after cleanup:"
docker system df || true
