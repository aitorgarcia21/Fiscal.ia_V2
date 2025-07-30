#!/bin/bash
set -e

# Variables à personnaliser - OBLIGATOIRE DE REMPLIR !
CERT_ID="Developer ID Application: À REMPLACER PAR TON NOM (TEAMID)"
APPLE_ID="tonmail@icloud.com"
APPLE_ID_PASS="motdepasse-app-specific"
BUNDLE_ID="com.francis.desktop"

# Vérification configuration
if [[ "$CERT_ID" == *"À REMPLACER"* ]] || [[ "$APPLE_ID" == "tonmail@icloud.com" ]]; then
  echo "❌ ERREUR: Vous devez configurer CERT_ID et APPLE_ID dans ce script !"
  echo "1. Inscrivez-vous au Apple Developer Program (99€/an)"
  echo "2. Remplacez CERT_ID par votre vraie identité Developer ID"
  echo "3. Remplacez APPLE_ID par votre Apple ID"
  echo "4. Générez un mot de passe spécifique app dans votre compte Apple"
  exit 1
fi

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
