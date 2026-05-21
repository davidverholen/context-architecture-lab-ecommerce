#!/usr/bin/env bash
set -euo pipefail

AKENEO_DIR="${AKENEO_DIR:-.local/akeneo/pim}"
AKENEO_WEBHOOK_WORKER_NAME="${AKENEO_WEBHOOK_WORKER_NAME:-pim-webhook-worker}"
AKENEO_WEBHOOK_WORKER_TIME_LIMIT="${AKENEO_WEBHOOK_WORKER_TIME_LIMIT:-7200}"

if [ ! -f "${AKENEO_DIR}/docker-compose.yml" ]; then
  echo "No Akeneo project found at ${AKENEO_DIR}. Run npm run akeneo:setup first." >&2
  exit 1
fi

if docker ps --format '{{.Names}}' | grep -qx "${AKENEO_WEBHOOK_WORKER_NAME}"; then
  echo "Akeneo webhook worker ${AKENEO_WEBHOOK_WORKER_NAME} is already running."
  exit 0
fi

if docker ps -a --format '{{.Names}}' | grep -qx "${AKENEO_WEBHOOK_WORKER_NAME}"; then
  docker rm "${AKENEO_WEBHOOK_WORKER_NAME}" >/dev/null
fi

(
  cd "${AKENEO_DIR}"
  docker compose run -d \
    --name "${AKENEO_WEBHOOK_WORKER_NAME}" \
    php bin/console messenger:consume webhook \
      --time-limit="${AKENEO_WEBHOOK_WORKER_TIME_LIMIT}" \
      --memory-limit=256M \
      -vv >/dev/null
)

echo "Started Akeneo webhook worker ${AKENEO_WEBHOOK_WORKER_NAME}."
