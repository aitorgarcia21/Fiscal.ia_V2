#!/bin/bash

# Script pour créer un zip contenant uniquement l'extension Chrome Francis
# Ce script ne doit inclure que les fichiers nécessaires pour l'extension

set -e

echo "🔧 Construction de l'extension Chrome Francis (fichiers uniquement)..."

# Définir les variables
EXTENSION_NAME="francis-teams-extension"
BUILD_DIR="build-extension"
ZIP_NAME="${EXTENSION_NAME}.zip"

# Nettoyer le répertoire de build précédent
if [ -d "$BUILD_DIR" ]; then
    echo "🧹 Nettoyage du répertoire de build précédent..."
    rm -rf "$BUILD_DIR"
fi

# Créer le répertoire de build
mkdir -p "$BUILD_DIR"

# Copier uniquement les fichiers de l'extension
echo "📁 Copie des fichiers de l'extension..."

# Fichiers principaux de l'extension
cp manifest.json "$BUILD_DIR/"
cp background.js "$BUILD_DIR/"
cp contentScript.js "$BUILD_DIR/"
cp popup.html "$BUILD_DIR/"
cp popup.js "$BUILD_DIR/"
cp popup.css "$BUILD_DIR/"

# Créer le zip
echo "📦 Création du zip de l'extension..."
cd "$BUILD_DIR"
zip -r "../$ZIP_NAME" . -x "*.DS_Store" "*.git*"
cd ..

# Vérifier que le zip a été créé
if [ -f "$ZIP_NAME" ]; then
    echo "✅ Extension créée avec succès: $ZIP_NAME"
    echo "📊 Taille du fichier: $(du -h "$ZIP_NAME" | cut -f1)"
    echo "📋 Contenu du zip:"
    unzip -l "$ZIP_NAME" | head -10
else
    echo "❌ Erreur: Le fichier zip n'a pas été créé"
    exit 1
fi

# Nettoyer le répertoire de build temporaire
echo "🧹 Nettoyage du répertoire de build temporaire..."
rm -rf "$BUILD_DIR"

echo ""
echo "🎉 Extension Chrome Francis prête !"
echo "📁 Fichier: $ZIP_NAME"
echo ""
echo "📋 Pour installer l'extension:"
echo "   1. Ouvrir Chrome"
echo "   2. Aller à chrome://extensions/"
echo "   3. Activer le 'Mode développeur'"
echo "   4. Cliquer sur 'Charger l'extension non empaquetée'"
echo "   5. Sélectionner le dossier décompressé de $ZIP_NAME"
echo ""
echo "🔗 Ou utiliser la page d'installation automatique:"
echo "   https://fiscal.ia/install-extension" 