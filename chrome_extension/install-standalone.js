// Francis Teams Assistant - Installer automatique (Version Indépendante)
console.log('🚀 Installation automatique de Francis Teams Assistant (Indépendant)...');

// Fonction pour installer l'extension
function installExtension() {
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = 'francis-teams-standalone.zip';
    link.download = 'francis-teams-standalone.zip';
    link.click();
    
    // Instructions d'installation
    setTimeout(() => {
        alert('📦 Francis téléchargé !\n\nPour installer :\n1. Ouvrez chrome://extensions/\n2. Glissez le fichier ZIP dans la fenêtre\n3. Confirmez l\'installation\n\nC\'est tout ! 🎉\n\n🚀 100% INDÉPENDANT - SANS CHROME WEB STORE');
    }, 1000);
}

// Démarrer l'installation
installExtension();
