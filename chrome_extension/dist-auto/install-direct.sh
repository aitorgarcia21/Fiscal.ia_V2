#!/bin/bash

echo "🚀 Installation directe de Francis Teams Assistant"
echo "================================================"

# Vérifier si on est sur macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Détection macOS"
    
    # Ouvrir Chrome automatiquement
    if command -v "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" &> /dev/null; then
        echo "🌐 Ouverture de Chrome..."
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "file://$(pwd)/install-super-simple.html"
    else
        echo "⚠️ Chrome non trouvé. Veuillez ouvrir manuellement install-super-simple.html"
    fi
else
    echo "💻 Système non macOS détecté"
    echo "Veuillez ouvrir install-super-simple.html dans Chrome"
fi

echo "✅ Installation lancée !"
