#!/bin/bash

echo "🚀 Upload des DMG Francis vers Railway..."

# Vérifier que les DMG existent
if [ ! -f "desktop-app/dist/Francis-1.0.0.dmg" ]; then
    echo "❌ Francis-1.0.0.dmg introuvable dans desktop-app/dist/"
    exit 1
fi

if [ ! -f "desktop-app/dist/Francis-1.0.0-arm64.dmg" ]; then
    echo "❌ Francis-1.0.0-arm64.dmg introuvable dans desktop-app/dist/"
    exit 1
fi

echo "✅ DMG trouvés - Tailles:"
ls -lh desktop-app/dist/*.dmg

echo "📤 Upload Francis-1.0.0.dmg (Intel)..."
railway run "mkdir -p /app/downloads" && \
base64 desktop-app/dist/Francis-1.0.0.dmg | railway run "base64 -d > /app/downloads/Francis-1.0.0.dmg"

if [ $? -eq 0 ]; then
    echo "✅ Francis-1.0.0.dmg uploadé avec succès"
else
    echo "❌ Erreur upload Francis-1.0.0.dmg"
    exit 1
fi

echo "📤 Upload Francis-1.0.0-arm64.dmg (Apple Silicon)..."
base64 desktop-app/dist/Francis-1.0.0-arm64.dmg | railway run "base64 -d > /app/downloads/Francis-1.0.0-arm64.dmg"

if [ $? -eq 0 ]; then
    echo "✅ Francis-1.0.0-arm64.dmg uploadé avec succès"
else
    echo "❌ Erreur upload Francis-1.0.0-arm64.dmg"
    exit 1
fi

echo "🎉 Upload terminé ! Les DMG sont maintenant disponibles sur :"
echo "   https://normal-trade-production.up.railway.app/downloads/Francis-1.0.0.dmg"
echo "   https://normal-trade-production.up.railway.app/downloads/Francis-1.0.0-arm64.dmg"

echo "🧪 Test de téléchargement..."
curl -I https://normal-trade-production.up.railway.app/downloads/Francis-1.0.0.dmg
