#!/usr/bin/env bash
set -euo pipefail

EXPORT_DIR="${N8N_EXPORT_DIR:-.local/n8n-export/workflows}"

if ! docker compose ps --status running --services | grep -qx "n8n"; then
  echo "n8n is not running. Start it with: docker compose up -d n8n" >&2
  exit 1
fi

docker compose exec -T n8n sh -lc '
  rm -rf /tmp/context-workflows-export &&
  mkdir -p /tmp/context-workflows-export &&
  n8n export:workflow --backup --output=/tmp/context-workflows-export
'

rm -rf "${EXPORT_DIR}"
mkdir -p "${EXPORT_DIR}"
docker compose cp n8n:/tmp/context-workflows-export/. "${EXPORT_DIR}/"

echo "Exported workflows to ${EXPORT_DIR}."
echo "Review exported JSON before copying anything into n8n/workflows."
