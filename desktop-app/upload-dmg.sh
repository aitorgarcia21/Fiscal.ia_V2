#!/bin/bash
# Upload des nouveaux .dmg Francis Desktop corrigés
echo "🚀 Upload des .dmg corrigés..."
scp "dist/Francis-Desktop-macOS.dmg" aitorgarcia21@francis-ia.net:/var/www/html/downloads/
scp "dist/Francis-Desktop-macOS-ARM64.dmg" aitorgarcia21@francis-ia.net:/var/www/html/downloads/
echo "✅ Upload terminé !"

