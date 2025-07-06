#!/bin/bash

# Francis Teams Assistant - Build Script
# Génère un fichier .crx pour installation directe

echo "🎯 Construction de Francis Teams Assistant..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "manifest.json" ]; then
    echo "❌ Erreur: manifest.json non trouvé. Exécutez ce script depuis le dossier chrome_extension/"
    exit 1
fi

# Créer un dossier temporaire pour la construction
BUILD_DIR="francis-teams-build"
rm -rf $BUILD_DIR
mkdir $BUILD_DIR

# Copier tous les fichiers nécessaires
echo "📦 Copie des fichiers..."
cp manifest.json $BUILD_DIR/
cp popup.html $BUILD_DIR/
cp popup.js $BUILD_DIR/
cp teamsListener.js $BUILD_DIR/
cp background.js $BUILD_DIR/
cp contentScript.js $BUILD_DIR/
cp README.md $BUILD_DIR/

# Créer les icônes si elles n'existent pas
echo "🎨 Génération des icônes..."
mkdir -p $BUILD_DIR/icons

# Créer une icône simple en SVG
cat > $BUILD_DIR/icons/icon.svg << 'EOF'
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#c5a572;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e8cfa0;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="20" fill="url(#grad)"/>
  <text x="64" y="80" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="#162238">F</text>
</svg>
EOF

# Convertir SVG en PNG (si ImageMagick est disponible)
if command -v convert &> /dev/null; then
    echo "🖼️ Conversion des icônes..."
    convert $BUILD_DIR/icons/icon.svg -resize 16x16 $BUILD_DIR/icons/icon16.png
    convert $BUILD_DIR/icons/icon.svg -resize 32x32 $BUILD_DIR/icons/icon32.png
    convert $BUILD_DIR/icons/icon.svg -resize 48x48 $BUILD_DIR/icons/icon48.png
    convert $BUILD_DIR/icons/icon.svg -resize 128x128 $BUILD_DIR/icons/icon128.png
else
    echo "⚠️ ImageMagick non trouvé. Création d'icônes SVG..."
    cp $BUILD_DIR/icons/icon.svg $BUILD_DIR/icons/icon16.png
    cp $BUILD_DIR/icons/icon.svg $BUILD_DIR/icons/icon32.png
    cp $BUILD_DIR/icons/icon.svg $BUILD_DIR/icons/icon48.png
    cp $BUILD_DIR/icons/icon.svg $BUILD_DIR/icons/icon128.png
fi

# Créer un fichier ZIP pour l'extension
echo "📦 Création du package..."
cd $BUILD_DIR
zip -r ../francis-teams-extension.zip . > /dev/null
cd ..

# Créer un script d'installation automatique
cat > install-francis.js << 'EOF'
// Francis Teams Assistant - Installer automatique
console.log('🎯 Installation automatique de Francis Teams Assistant...');

// Fonction pour installer l'extension
function installExtension() {
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = 'francis-teams-extension.zip';
    link.download = 'francis-teams-extension.zip';
    link.click();
    
    // Instructions d'installation
    setTimeout(() => {
        alert('📦 Francis téléchargé !\n\nPour installer :\n1. Ouvrez chrome://extensions/\n2. Glissez le fichier ZIP dans la fenêtre\n3. Confirmez l\'installation\n\nC\'est tout ! 🎉');
    }, 1000);
}

// Démarrer l'installation
installExtension();
EOF

# Créer un fichier HTML d'installation
cat > install-francis.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Installation Francis Teams</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #162238, #1E3253);
            color: white;
            margin: 0;
            padding: 40px;
            text-align: center;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 40px;
            backdrop-filter: blur(15px);
        }
        .btn {
            background: linear-gradient(135deg, #c5a572, #e8cfa0);
            color: #162238;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            margin: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Francis Teams Assistant</h1>
        <p>Installation automatique en 1 clic</p>
        <button class="btn" onclick="install()">📦 Installer Francis</button>
    </div>
    
    <script>
        function install() {
            // Télécharger l'extension
            const link = document.createElement('a');
            link.href = 'francis-teams-extension.zip';
            link.download = 'francis-teams-extension.zip';
            link.click();
            
            // Instructions
            setTimeout(() => {
                alert('📦 Francis téléchargé !\n\nPour installer :\n1. Ouvrez chrome://extensions/\n2. Glissez le fichier ZIP dans la fenêtre\n3. Confirmez l\'installation\n\nC\'est tout ! 🎉');
            }, 1000);
        }
    </script>
</body>
</html>
EOF

echo "✅ Construction terminée !"
echo ""
echo "📁 Fichiers générés :"
echo "  - francis-teams-extension.zip (extension packagée)"
echo "  - install-francis.html (page d'installation)"
echo "  - install-francis.js (script d'installation)"
echo ""
echo "🚀 Pour installer :"
echo "  1. Ouvrez install-francis.html dans Chrome"
echo "  2. Cliquez sur 'Installer Francis'"
echo "  3. Glissez le fichier ZIP dans chrome://extensions/"
echo "  4. C'est tout ! 🎉"
echo ""
echo "💡 Alternative : Publiez sur le Chrome Web Store pour une installation en 1 clic !"

# Nettoyer
rm -rf $BUILD_DIR 