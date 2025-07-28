#!/usr/bin/env bash
# Build a professional drag-and-drop DMG for Francis Desktop
# Requirements: npm install -g create-dmg (already in CI)
# Usage: ./build-dmg.sh [version]
# If version is not supplied, defaults to 1.0.0

set -euo pipefail

VERSION=${1:-1.0.0}
APP_NAME="Francis"
APP_PATH="$(pwd)/dist/mac/${APP_NAME}.app"
DMG_NAME="${APP_NAME}-${VERSION}.dmg"
DMG_OUT_DIR="$(pwd)/dist"

if [[ ! -d "$APP_PATH" ]]; then
  echo "❌ App bundle not found at $APP_PATH. Build the Electron app first."
  exit 1
fi

# Create DMG
create-dmg \
  --overwrite \
  --dmg-title="${APP_NAME}" \
  --volname="${APP_NAME}" \
  --window-pos 200 120 \
  --window-size 500 300 \
  --icon-size 120 \
  --icon "${APP_NAME}.app" 125 150 \
  --icon "/Applications" 375 150 \
  --hide-extension "${APP_NAME}.app" \
  --app-drop-link 375 150 \
  "$APP_PATH" \
  "$DMG_OUT_DIR/$DMG_NAME"

echo "✅ DMG created at $DMG_OUT_DIR/$DMG_NAME"
