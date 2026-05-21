#!/usr/bin/env bash

akeneo_prepare_cache_env() {
  local repo_root="$1"
  local cache_root="${AKENEO_CACHE_DIR:-${repo_root}/.local/akeneo/cache}"

  mkdir -p \
    "${cache_root}/composer" \
    "${cache_root}/yarn" \
    "${cache_root}/cypress"

  chmod 0777 \
    "${cache_root}/composer" \
    "${cache_root}/yarn" \
    "${cache_root}/cypress"

  export HOST_COMPOSER_HOME="${HOST_COMPOSER_HOME:-${cache_root}/composer}"
  export HOST_YARN_CACHE_FOLDER="${HOST_YARN_CACHE_FOLDER:-${cache_root}/yarn}"
  export HOST_CYPRESS_CACHE_FOLDER="${HOST_CYPRESS_CACHE_FOLDER:-${cache_root}/cypress}"
}

akeneo_run_make() {
  local akeneo_dir="$1"
  shift

  if command -v docker-compose >/dev/null 2>&1; then
    (
      cd "${akeneo_dir}"
      make "$@"
    )
    return
  fi

  if docker compose version >/dev/null 2>&1; then
    local shim_dir
    shim_dir="$(mktemp -d)"

    printf '%s\n' '#!/usr/bin/env sh' 'exec docker compose "$@"' >"${shim_dir}/docker-compose"
    chmod +x "${shim_dir}/docker-compose"

    (
      cd "${akeneo_dir}"
      PATH="${shim_dir}:${PATH}" make "$@"
    )
    local status=$?
    rm -rf "${shim_dir}"
    return "${status}"
  fi

  echo "Akeneo setup requires Docker Compose. Install docker-compose or Docker Compose v2." >&2
  return 1
}
