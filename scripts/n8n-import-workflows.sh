#!/usr/bin/env bash
set -euo pipefail

if ! docker compose ps --status running --services | grep -qx "n8n"; then
  echo "n8n is not running. Start it with: docker compose up -d n8n" >&2
  exit 1
fi

if ! find n8n/workflows -maxdepth 1 -name '*.json' -type f | grep -q .; then
  echo "No workflow JSON files found in n8n/workflows." >&2
  exit 1
fi

N8N_HEALTH_URL="${N8N_HEALTH_URL:-http://localhost:${N8N_PORT:-5678}/healthz}"

for _ in $(seq 1 30); do
  if curl -fsS "${N8N_HEALTH_URL}" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

if ! curl -fsS "${N8N_HEALTH_URL}" >/dev/null 2>&1; then
  echo "n8n did not become healthy at ${N8N_HEALTH_URL}." >&2
  exit 1
fi

docker compose exec -T n8n sh -lc '
  rm -rf /tmp/context-workflows &&
  mkdir -p /tmp/context-workflows &&
  cp /repo-workflows/*.json /tmp/context-workflows/ &&
  n8n import:workflow --separate --input=/tmp/context-workflows
'

echo "Imported workflow JSON files from n8n/workflows into the local n8n instance."
