#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if [ -z "${1:-}" ] || [ -z "${2:-}" ]; then
  echo "Usage: $0 <feature-slug> <iterations>"
  exit 1
fi

node "./ralph-opencode/afk.mjs" "$@"
