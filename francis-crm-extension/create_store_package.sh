#!/bin/bash

# 🚀 Script de création du package Francis pour Chrome Web Store

echo "🎯 CRÉATION DU PACKAGE FRANCIS POUR CHROME WEB STORE..."

# Supprimer l'ancien package s'il existe
if [ -f "francis-chrome-extension-v1.0.0.zip" ]; then
    rm francis-chrome-extension-v1.0.0.zip
    echo "✅ Ancien package supprimé"
fi

# Créer le package ZIP optimisé pour Chrome Web Store
echo "📦 Création du package ZIP..."

zip -r francis-chrome-extension-v1.0.0.zip . \
    -x "*.md" \
    -x "*.py" \
    -x "*.sh" \
    -x ".DS_Store" \
    -x "node_modules/*" \
    -x ".git/*" \
    -x "*.log" \
    -x "*.tmp"

echo "✅ Package créé : francis-chrome-extension-v1.0.0.zip"

# Vérifier le contenu du package
echo ""
echo "📋 CONTENU DU PACKAGE :"
unzip -l francis-chrome-extension-v1.0.0.zip

echo ""
echo "🎯 PACKAGE PRÊT POUR PUBLICATION !"
echo "📁 Fichier : francis-chrome-extension-v1.0.0.zip"
echo "🔗 Upload sur : https://chrome.google.com/webstore/devconsole/"
echo ""
echo "🚀 Une fois publié, les CGP pourront installer Francis en 1 clic !"
