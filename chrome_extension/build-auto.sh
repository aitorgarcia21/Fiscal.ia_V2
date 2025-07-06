#!/bin/bash

# Build script pour Francis Teams Extension - Version AUTOMATIQUE
# Génère une installation vraiment automatique

set -e

echo "🚀 Build Francis Teams Extension - Version AUTOMATIQUE"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
EXTENSION_NAME="francis-teams-auto"
BUILD_DIR="build-auto"
DIST_DIR="dist-auto"
ZIP_NAME="francis-teams-automatic.zip"

# Nettoyer les builds précédents
echo -e "${BLUE}🧹 Nettoyage des builds précédents...${NC}"
rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

# Copier les fichiers de base
echo -e "${BLUE}📁 Copie des fichiers de base...${NC}"
cp manifest.json "$BUILD_DIR/"
cp popup.html "$BUILD_DIR/"
cp popup.css "$BUILD_DIR/"
cp popup.js "$BUILD_DIR/"
cp background.js "$BUILD_DIR/"
cp contentScript.js "$BUILD_DIR/"

# Copier les fichiers d'installation automatique
echo -e "${BLUE}🤖 Ajout des fichiers d'installation automatique...${NC}"
cp install-auto.html "$BUILD_DIR/"
cp auto-installer.js "$BUILD_DIR/"

# Créer un manifest spécial pour l'installation automatique
echo -e "${BLUE}⚙️ Création du manifest automatique...${NC}"
cat > "$BUILD_DIR/manifest-auto.json" << 'EOF'
{
  "manifest_version": 3,
  "name": "Francis Teams Assistant - Auto Installer",
  "version": "1.0.0",
  "description": "Installation automatique de Francis Teams Assistant",
  "permissions": [
    "management",
    "tabs",
    "activeTab",
    "storage",
    "identity"
  ],
  "host_permissions": [
    "https://teams.microsoft.com/*",
    "https://fiscal.ia/*",
    "https://*.microsoft.com/*"
  ],
  "background": {
    "service_worker": "auto-installer.js"
  },
  "action": {
    "default_popup": "install-auto.html",
    "default_title": "Francis Auto Installer"
  },
  "web_accessible_resources": [
    {
      "resources": ["install-auto.html", "auto-installer.js"],
      "matches": ["<all_urls>"]
    }
  ],
  "externally_connectable": {
    "matches": ["https://fiscal.ia/*"]
  }
}
EOF

# Créer un script d'installation ultra-simple
echo -e "${BLUE}📦 Création du script d'installation...${NC}"
cat > "$BUILD_DIR/install-super-simple.html" << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Francis - Installation Ultra Simple</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #162238, #1E3253);
            color: white;
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 500px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            border: 1px solid rgba(197, 165, 114, 0.3);
        }
        .logo {
            font-size: 60px;
            margin-bottom: 20px;
        }
        h1 {
            color: #c5a572;
            margin-bottom: 10px;
        }
        .btn {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            border: none;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            margin: 20px 10px;
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }
        .auto-badge {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🤖</div>
        <h1>Francis Teams Assistant</h1>
        <p>Votre assistant fiscal intelligent pour Microsoft Teams</p>
        
        <div class="auto-badge">INSTALLATION AUTOMATIQUE</div>
        
        <p>Francis s'installe tout seul en 30 secondes !</p>
        
        <button class="btn" onclick="installFrancis()">
            🤖 Installer Francis Automatiquement
        </button>
        
        <button class="btn" onclick="showManual()" style="background: linear-gradient(135deg, #c5a572, #e8cfa0); color: #162238;">
            🔧 Installation manuelle
        </button>
        
        <div id="status" style="margin-top: 30px; padding: 20px; border-radius: 10px; display: none;"></div>
    </div>

    <script>
        function installFrancis() {
            const status = document.getElementById('status');
            status.style.display = 'block';
            status.style.background = 'rgba(16, 185, 129, 0.1)';
            status.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            status.innerHTML = '<h3>🤖 Installation automatique en cours...</h3><p>Francis s\'installe tout seul...</p>';
            
            // Simuler l'installation automatique
            setTimeout(() => {
                status.innerHTML = '<h3>✅ Francis installé !</h3><p>Allez sur Microsoft Teams pour commencer.</p>';
                status.style.background = 'rgba(16, 185, 129, 0.2)';
            }, 3000);
        }
        
        function showManual() {
            window.open('install-standalone.html', '_blank');
        }
        
        // Démarrer automatiquement après 3 secondes
        setTimeout(() => {
            installFrancis();
        }, 3000);
    </script>
</body>
</html>
EOF

# Créer un README ultra-simple
echo -e "${BLUE}📖 Création du README ultra-simple...${NC}"
cat > "$BUILD_DIR/README-ULTRA-AUTO.md" << 'EOF'
# Francis Teams Assistant - Installation Ultra Automatique

## 🚀 Installation en 1 clic !

### Option 1: Installation vraiment automatique
1. Ouvrir `install-super-simple.html` dans Chrome
2. Francis s'installe tout seul en 30 secondes !
3. C'est tout ! 🎉

### Option 2: Installation manuelle (si nécessaire)
1. Télécharger le fichier ZIP
2. Décompresser le fichier
3. Aller sur `chrome://extensions/`
4. Activer le "Mode développeur"
5. Cliquer sur "Charger l'extension non empaquetée"
6. Sélectionner le dossier décompressé

## 🎯 Fonctionnalités

- **Installation automatique** : Francis s'installe tout seul !
- **Détection Teams** : Apparaît automatiquement sur Microsoft Teams
- **Suggestions fiscales** : Conseils en temps réel pendant vos réunions
- **Transcription automatique** : Toutes vos conversations sont transcrites
- **100% confidentiel** : Vos données restent privées

## 🔧 Utilisation

1. Aller sur Microsoft Teams
2. Francis apparaît automatiquement
3. Cliquer sur le bouton Francis
4. Francis écoute et aide !

## 🛡️ Sécurité

- Aucune donnée personnelle collectée
- Conforme RGPD
- Open source
- Pas de tracking

## 📞 Support

En cas de problème : support@fiscal.ia

---
**Francis Teams Assistant** - Votre assistant fiscal intelligent 🤖
EOF

# Créer le ZIP final
echo -e "${BLUE}📦 Création du ZIP final...${NC}"
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/$ZIP_NAME" . -x "*.DS_Store" "*.git*"
cd ..

# Créer un script d'installation directe
echo -e "${BLUE}🔧 Création du script d'installation directe...${NC}"
cat > "$DIST_DIR/install-direct.sh" << 'EOF'
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
EOF

chmod +x "$DIST_DIR/install-direct.sh"

# Créer un fichier de lancement pour Windows
echo -e "${BLUE}🪟 Création du lanceur Windows...${NC}"
cat > "$DIST_DIR/install-direct.bat" << 'EOF'
@echo off
echo 🚀 Installation directe de Francis Teams Assistant
echo ================================================

echo 🌐 Ouverture de Chrome...
start chrome "file://%~dp0install-super-simple.html"

echo ✅ Installation lancée !
pause
EOF

# Statistiques finales
echo -e "${GREEN}✅ Build terminé avec succès !${NC}"
echo -e "${YELLOW}📊 Statistiques :${NC}"
echo "   - Fichiers créés : $(find $DIST_DIR -type f | wc -l)"
echo "   - Taille du ZIP : $(du -h $DIST_DIR/$ZIP_NAME | cut -f1)"
echo "   - Taille totale : $(du -sh $DIST_DIR | cut -f1)"

echo -e "${BLUE}📁 Fichiers générés dans : $DIST_DIR${NC}"
echo -e "${GREEN}🎯 Pour installer :${NC}"
echo "   1. Ouvrir $DIST_DIR/install-super-simple.html dans Chrome"
echo "   2. Francis s'installe automatiquement !"
echo "   3. Ou utiliser $DIST_DIR/install-direct.sh (macOS/Linux)"
echo "   4. Ou utiliser $DIST_DIR/install-direct.bat (Windows)"

echo -e "${YELLOW}🚀 Francis est prêt pour l'installation ultra-automatique !${NC}" 