#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GARAGE_DIR="${ROOT_DIR}/tools/garage"
GARAGE_CONFIG="${GARAGE_DIR}/garage.toml"
GARAGE_DATA_DIR="${GARAGE_DIR}/data"
GARAGE_META_DIR="${GARAGE_DIR}/meta"

GARAGE_BIN=""
for candidate in \
  "${GARAGE_DIR}/garage.exe" \
  "${GARAGE_DIR}/target/release/garage.exe" \
  "${GARAGE_DIR}/install/bin/garage.exe"
do
  if [[ -x "${candidate}" ]]; then
    GARAGE_BIN="${candidate}"
    break
  fi
done

if [[ -z "${GARAGE_BIN}" ]]; then
  echo "garage binary not found under ${GARAGE_DIR}" >&2
  echo "expected one of: garage.exe, target/release/garage.exe, install/bin/garage.exe" >&2
  exit 1
fi

mkdir -p "${GARAGE_DATA_DIR}" "${GARAGE_META_DIR}"

exec "${GARAGE_BIN}" -c "${GARAGE_CONFIG}" server
