#!/bin/bash
# Deploy / update API on EC2
set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "=== Pulling latest code ==="
git pull origin main

echo "=== Building Docker image ==="
docker compose -f docker-compose.prod.yml build

echo "=== Restarting API ==="
docker compose -f docker-compose.prod.yml up -d

echo "=== Logs (last 20 lines) ==="
docker compose -f docker-compose.prod.yml logs --tail=20

echo "=== Done! API running on port 4000 ==="
