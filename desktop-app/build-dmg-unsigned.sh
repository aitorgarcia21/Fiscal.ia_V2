#!/usr/bin/env bash
# Build Francis Desktop DMG (version non signée pour test)
# Usage: ./build-dmg-unsigned.sh [version]

set -euo pipefail

VERSION=${1:-1.0.0}
APP_NAME="Francis"
APP_PATH="$(pwd)/dist/mac/${APP_NAME}.app"
DMG_NAME="${APP_NAME}-${VERSION}-unsigned.dmg"
DMG_OUT_DIR="$(pwd)/dist"

echo "🔨 Construction du DMG non signé pour Francis Desktop..."

# Vérifier que l'app existe
if [[ ! -d "$APP_PATH" ]]; then
  echo "❌ App bundle non trouvée à $APP_PATH"
  echo "🔧 Construction de l'application d'abord..."
  npm run build:mac
fi

# Supprimer l'ancien DMG s'il existe
rm -f "$DMG_OUT_DIR/$DMG_NAME"

# Créer le DMG avec create-dmg (version simplifiée)
echo "📦 Création du DMG..."
npx create-dmg \
  --overwrite \
  --volname="Francis" \
  --window-size 600 400 \
  --app-drop-link 400 200 \
  "$DMG_OUT_DIR/$DMG_NAME" \
  "$APP_PATH"

echo ""
echo "✅ DMG créé avec succès: $DMG_OUT_DIR/$DMG_NAME"
echo ""
echo "⚠️  IMPORTANT - Instructions pour l'utilisateur:"
echo "1. Télécharger le DMG"
echo "2. Double-cliquer pour l'ouvrir"
echo "3. Si macOS bloque: Clic droit → Ouvrir"
echo "4. Aller dans Préférences Système → Sécurité"
echo "5. Cliquer 'Ouvrir quand même' pour Francis"
echo ""
echo "🔐 Pour éliminer ces étapes: obtenir un certificat Developer ID Apple"
