#!/usr/bin/env bash
set -euo pipefail

AKENEO_DIR="${AKENEO_DIR:-.local/akeneo/pim}"
AKENEO_WEBHOOK_CONNECTION_CODE="${AKENEO_WEBHOOK_CONNECTION_CODE:-context_lab}"
AKENEO_WEBHOOK_CONNECTION_LABEL="${AKENEO_WEBHOOK_CONNECTION_LABEL:-Context Lab n8n}"
AKENEO_WEBHOOK_SECRET="${AKENEO_WEBHOOK_SECRET:-local-dev-webhook-secret}"
AKENEO_EVENT_BRIDGE_PORT="${AKENEO_EVENT_BRIDGE_PORT:-8090}"

if [ ! -f "${AKENEO_DIR}/docker-compose.yml" ]; then
  echo "No Akeneo project found at ${AKENEO_DIR}. Run npm run akeneo:setup first." >&2
  exit 1
fi

akeneo_compose() {
  (cd "${AKENEO_DIR}" && docker compose "$@")
}

gateway="$(
  akeneo_compose run --rm php php -r '
    foreach (file("/proc/net/route") as $line) {
      $columns = preg_split("/\s+/", trim($line));
      if (($columns[1] ?? "") === "00000000") {
        $bytes = str_split($columns[2], 2);
        echo hexdec($bytes[3]).".".hexdec($bytes[2]).".".hexdec($bytes[1]).".".hexdec($bytes[0]);
        exit(0);
      }
    }
    exit(1);
  '
)"

webhook_url="${AKENEO_WEBHOOK_URL:-http://${gateway}:${AKENEO_EVENT_BRIDGE_PORT}/akeneo/events}"

connection_count="$(
  akeneo_compose exec -T mysql mysql -uroot -proot akeneo_pim -Nse \
    "SELECT COUNT(*) FROM akeneo_connectivity_connection WHERE code='${AKENEO_WEBHOOK_CONNECTION_CODE}';"
)"

if [ "${connection_count}" = "0" ]; then
  akeneo_compose run --rm php bin/console akeneo:connectivity-connection:create \
    "${AKENEO_WEBHOOK_CONNECTION_CODE}" \
    --flow-type=data_destination \
    --label="${AKENEO_WEBHOOK_CONNECTION_LABEL}" \
    --auditable=true \
    --no-interaction >/dev/null
fi

akeneo_compose exec -T mysql mysql -uroot -proot akeneo_pim -e "
  UPDATE akeneo_connectivity_connection
  SET webhook_url='${webhook_url}',
      webhook_secret='${AKENEO_WEBHOOK_SECRET}',
      webhook_enabled=1,
      webhook_is_using_uuid=0
  WHERE code='${AKENEO_WEBHOOK_CONNECTION_CODE}';
"

echo "Configured Akeneo connection ${AKENEO_WEBHOOK_CONNECTION_CODE} webhook:"
echo "${webhook_url}"
