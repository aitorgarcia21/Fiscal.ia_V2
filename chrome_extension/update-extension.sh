#!/bin/bash

# Script pour mettre à jour l'extension Francis et la déployer
# Ce script :
# 1. Reconstruit l'extension
# 2. Copie les fichiers dans le frontend
# 3. Met à jour la page d'installation

set -e

echo "🔄 Mise à jour de l'extension Francis..."

# 1. Reconstruire l'extension
echo "📦 Reconstruction de l'extension..."
./build.sh

# 2. Copier les fichiers dans le frontend
echo "📁 Copie des fichiers dans le frontend..."
cp francis-teams-extension.zip ../frontend/public/
cp install-extension.html ../frontend/public/

# 3. Vérifier que les fichiers ont été copiés
echo "✅ Vérification des fichiers copiés..."
if [ -f "../frontend/public/francis-teams-extension.zip" ]; then
    echo "✅ Extension copiée dans le frontend"
else
    echo "❌ Erreur: Extension non copiée"
    exit 1
fi

if [ -f "../frontend/public/install-extension.html" ]; then
    echo "✅ Page d'installation copiée dans le frontend"
else
    echo "❌ Erreur: Page d'installation non copiée"
    exit 1
fi

echo ""
echo "🎉 Mise à jour terminée !"
echo "📁 Fichiers disponibles :"
echo "   - https://fiscal.ia/install-extension.html (page d'installation)"
echo "   - https://fiscal.ia/francis-teams-extension.zip (extension)"
echo ""
echo "🔗 Liens dans le dashboard :"
echo "   - Bouton principal : /install-extension.html"
echo "   - Téléchargement direct : /francis-teams-extension.zip" 