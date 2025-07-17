# Configuration PWA Francis

## Icônes générées

Ce dossier contient tous les fichiers nécessaires pour faire de Francis une Progressive Web App (PWA) complète.

### Fichiers PWA

- `manifest.json` - Manifest PWA avec toutes les configurations
- `favicon.svg` - Favicon vectoriel moderne
- `favicon.ico` - Favicon traditionnel pour compatibilité
- `sw.js` - Service Worker pour fonctionnement hors ligne
- `icon-*x*.png` - Icônes dans toutes les tailles requises

### Génération des icônes

Pour générer toutes les icônes PNG à partir du SVG :

1. Installer Sharp :
```bash
cd frontend/public
npm install sharp
```

2. Exécuter le script de génération :
```bash
node generate-icons.js
```

### Tailles d'icônes générées

- 72x72 - Android Chrome
- 96x96 - Android Chrome
- 128x128 - Chrome Web Store
- 144x144 - Windows Metro
- 152x152 - iOS Safari
- 192x192 - Android Chrome (standard)
- 384x384 - Android Chrome
- 512x512 - Android Chrome (haute résolution)

### Fonctionnalités PWA

✅ **Installable** - L'app peut être installée sur mobile et desktop
✅ **Hors ligne** - Fonctionne sans connexion grâce au Service Worker
✅ **Responsive** - S'adapte à tous les écrans
✅ **Icônes** - Icônes optimisées pour tous les appareils
✅ **Raccourcis** - Accès rapide au chat et dashboard
✅ **Thème** - Couleurs cohérentes avec l'identité Francis

### Test PWA

Pour tester le PWA :

1. Ouvrir l'app dans Chrome/Edge
2. Aller dans DevTools > Application > Manifest
3. Vérifier que toutes les icônes se chargent
4. Tester l'installation via le bouton "Install"

### Notes importantes

- Le favicon.ico doit être converti depuis le PNG 48x48 généré
- Les screenshots pour le manifest peuvent être ajoutés plus tard
- Le Service Worker met en cache les pages principales pour l'usage hors ligne
