#!/bin/bash
set -e

# Variables à personnaliser
CERT_ID="Developer ID Application: À REMPLACER PAR TON NOM (TEAMID)"
APPLE_ID="tonmail@icloud.com"
APPLE_ID_PASS="motdepasse-app-specific"
BUNDLE_ID="com.francis.desktop"

# Nettoyage
rm -rf dist/ out/ build/

# Build Electron (renderer + app)
npm install
npm run build:mac

# Vérification signature (optionnel)
APP_PATH=$(find dist -name '*.app' | head -n 1)
codesign --verify --deep --strict --verbose=2 "$APP_PATH"

# Notarisation .dmg
DMG_PATH=$(find dist -name '*.dmg' | head -n 1)
UUID=$(xcrun altool --notarize-app --primary-bundle-id "$BUNDLE_ID" --username "$APPLE_ID" --password "$APPLE_ID_PASS" --file "$DMG_PATH" | grep RequestUUID | awk '{print $3}')

# Attente notarisation
while true; do
  STATUS=$(xcrun altool --notarization-info "$UUID" --username "$APPLE_ID" --password "$APPLE_ID_PASS" | grep Status | awk '{print $2}')
  echo "Statut notarisation : $STATUS"
  if [[ "$STATUS" == "success" ]]; then
    break
  elif [[ "$STATUS" == "in"* ]]; then
    sleep 30
  else
    echo "Erreur notarisation."
    exit 1
  fi
done

# Staple (attache ticket Apple)
xcrun stapler staple "$DMG_PATH"
echo "✅ Build, signature, notarisation et staple terminés : $DMG_PATH"
