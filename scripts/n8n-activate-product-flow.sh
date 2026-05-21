#!/usr/bin/env bash
set -euo pipefail

PRODUCT_WORKFLOW_ID="${N8N_PRODUCT_WORKFLOW_ID:-LEoPHXss7xgnaoPq}"

if ! docker compose ps --status running --services | grep -qx "n8n"; then
  echo "n8n is not running. Start it with: docker compose up -d n8n" >&2
  exit 1
fi

npm run n8n:import

docker compose exec -T n8n n8n update:workflow --all --active=false >/dev/null
docker compose exec -T n8n n8n update:workflow --id="${PRODUCT_WORKFLOW_ID}" --active=true >/dev/null

docker compose restart n8n >/dev/null
for _ in $(seq 1 30); do
  if curl -fsS "http://localhost:${N8N_PORT:-5678}/healthz" >/dev/null 2>&1; then
    sleep 5
    break
  fi
  sleep 2
done

echo "Activated n8n product projection workflow ${PRODUCT_WORKFLOW_ID}."
