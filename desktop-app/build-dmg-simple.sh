#!/usr/bin/env bash
# Build Francis Desktop DMG avec hdiutil (méthode native macOS)
# Usage: ./build-dmg-simple.sh [version]

set -euo pipefail

VERSION=${1:-1.0.0}
APP_NAME="Francis"
APP_PATH="$(pwd)/dist/mac/${APP_NAME}.app"
DMG_NAME="${APP_NAME}-${VERSION}-functional.dmg"
DMG_OUT_DIR="$(pwd)/dist"
TEMP_DMG_DIR="$(pwd)/temp_dmg"

echo "🔨 Construction du DMG fonctionnel pour Francis Desktop..."

# Vérifier que l'app existe
if [[ ! -d "$APP_PATH" ]]; then
  echo "❌ App bundle non trouvée à $APP_PATH"
  echo "🔧 Construction de l'application d'abord..."
  npm run build:mac
fi

# Nettoyer les anciens fichiers
rm -f "$DMG_OUT_DIR/$DMG_NAME"
rm -rf "$TEMP_DMG_DIR"

# Créer un dossier temporaire pour le DMG
mkdir -p "$TEMP_DMG_DIR"

# Copier l'application dans le dossier temporaire
echo "📋 Copie de l'application..."
cp -R "$APP_PATH" "$TEMP_DMG_DIR/"

# Créer un lien vers Applications pour faciliter l'installation
echo "🔗 Création du lien Applications..."
ln -sf "/Applications" "$TEMP_DMG_DIR/Applications"

# Créer le DMG avec hdiutil
echo "📦 Création du DMG avec hdiutil..."
hdiutil create -volname "Francis Desktop" \
    -srcfolder "$TEMP_DMG_DIR" \
    -ov -format UDZO \
    "$DMG_OUT_DIR/$DMG_NAME"

# Nettoyer
rm -rf "$TEMP_DMG_DIR"

echo ""
echo "✅ DMG créé avec succès: $DMG_OUT_DIR/$DMG_NAME"
echo ""
echo "🚀 INSTRUCTIONS POUR L'UTILISATEUR:"
echo "1. Télécharger et double-cliquer le DMG"
echo "2. Glisser Francis vers Applications"
echo "3. Si macOS bloque l'ouverture:"
echo "   - Clic droit sur Francis → Ouvrir"
echo "   - Ou: Préférences Système → Confidentialité → Cliquer 'Ouvrir quand même'"
echo ""
echo "🔐 Pour éviter ces étapes: signature Developer ID Apple requise"

# Afficher la taille du DMG
DMG_SIZE=$(du -h "$DMG_OUT_DIR/$DMG_NAME" | cut -f1)
echo "📊 Taille du DMG: $DMG_SIZE"
