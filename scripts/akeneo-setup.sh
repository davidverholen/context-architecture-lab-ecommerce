#!/usr/bin/env bash
set -euo pipefail

AKENEO_VERSION="${AKENEO_VERSION:-v2026.3}"
AKENEO_DIR="${AKENEO_DIR:-.local/akeneo/pim}"
AKENEO_IMAGE="${AKENEO_IMAGE:-akeneo/pim-php-dev:8.3}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# shellcheck source=lib/akeneo-compose.sh
source "${SCRIPT_DIR}/lib/akeneo-compose.sh"
akeneo_prepare_cache_env "${REPO_ROOT}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for Akeneo setup." >&2
  exit 1
fi

mkdir -p "${AKENEO_DIR}"

if [ -f "${AKENEO_DIR}/Makefile" ]; then
  echo "Akeneo project already exists at ${AKENEO_DIR}."
else
  if [ -n "$(find "${AKENEO_DIR}" -mindepth 1 -maxdepth 1 -print -quit)" ]; then
    echo "${AKENEO_DIR} must be empty before creating the Akeneo project." >&2
    exit 1
  fi

  echo "Creating Akeneo PIM Community Standard ${AKENEO_VERSION} in ${AKENEO_DIR}..."
  docker run \
    -u www-data \
    -v "$(pwd)/${AKENEO_DIR}:/srv/pim" \
    -w /srv/pim \
    --rm \
    "${AKENEO_IMAGE}" \
    php /usr/local/bin/composer create-project --prefer-dist \
    akeneo/pim-community-standard /srv/pim "${AKENEO_VERSION}"
fi

echo "Starting Akeneo through its generated Makefile..."
akeneo_run_make "${AKENEO_DIR}"

echo "Akeneo should be available at http://localhost:8080/ after startup completes."
