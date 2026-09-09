#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing frontend dependencies and building React app"
npm --prefix "$ROOT_DIR/frontend" ci
npm --prefix "$ROOT_DIR/frontend" run build

echo "Copying frontend build into backend/dist"
rm -rf "$ROOT_DIR/backend/dist"
cp -R "$ROOT_DIR/frontend/dist" "$ROOT_DIR/backend/dist"

echo "Installing backend production dependencies"
npm --prefix "$ROOT_DIR/backend" ci --omit=dev