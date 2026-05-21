#!/usr/bin/env bash
set -euo pipefail

AKENEO_DIR="${AKENEO_DIR:-.local/akeneo/pim}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# shellcheck source=lib/akeneo-compose.sh
source "${SCRIPT_DIR}/lib/akeneo-compose.sh"
akeneo_prepare_cache_env "${REPO_ROOT}"

if [ ! -f "${AKENEO_DIR}/Makefile" ]; then
  echo "No Akeneo project found at ${AKENEO_DIR}. Nothing to stop." >&2
  exit 0
fi

akeneo_run_make "${AKENEO_DIR}" down
