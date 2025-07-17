# Francis Desktop App

Application desktop Francis pour les conseillers en gestion de patrimoine et fiscalistes.

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation des dépendances
```bash
cd desktop-app
npm install
```

## 🛠️ Développement

### Lancer en mode développement
```bash
npm run dev
```

### Lancer en mode production
```bash
npm start
```

## 📦 Build

### Build pour toutes les plateformes
```bash
npm run build
```

### Build spécifique
```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

## 🎯 Fonctionnalités

### ✅ Fonctionnalités implémentées
- **Connexion directe** : L'app se connecte automatiquement si l'utilisateur est déjà connecté
- **Dashboard Pro** : Accès direct au dashboard professionnel pour les utilisateurs Pro
- **Dashboard Particulier** : Accès au dashboard standard pour les particuliers
- **Navigation sécurisée** : Blocage des pages de landing pour rester dans l'application
- **Menu natif** : Menu système avec raccourcis clavier
- **Stockage local** : Sauvegarde de l'état de connexion localement

### 🔒 Sécurité
- **Context isolation** : Séparation entre le processus principal et le renderer
- **Navigation contrôlée** : Empêche l'accès aux pages de landing
- **Liens externes** : Ouverture dans le navigateur par défaut

## 📱 Interface

### Taille de fenêtre
- **Largeur** : 1400px (minimum 1200px)
- **Hauteur** : 900px (minimum 800px)
- **Couleur de fond** : #162238 (cohérent avec le thème Francis)

### Menu système
- **Francis** : À propos, préférences, quitter
- **Édition** : Copier, coller, sélectionner
- **Affichage** : Zoom, outils de développement
- **Fenêtre** : Minimiser, fermer

## 🔧 Configuration

### Variables d'environnement
- `NODE_ENV=development` : Mode développement
- `NODE_ENV=production` : Mode production

### URLs
- **Développement** : `http://localhost:3000`
- **Production** : `https://fiscal-ia.net`

## 📋 Roadmap

### Prochaines fonctionnalités
- [ ] Notifications système
- [ ] Raccourcis clavier globaux
- [ ] Mode hors ligne
- [ ] Synchronisation automatique
- [ ] Thème sombre/clair
- [ ] Mise à jour automatique

## 🐛 Dépannage

### Problèmes courants
1. **L'app ne se lance pas** : Vérifiez que Node.js est installé
2. **Erreur de connexion** : Vérifiez votre connexion internet
3. **Fenêtre vide** : Redémarrez l'application

### Logs
Les logs sont disponibles dans :
- **macOS** : `~/Library/Logs/francis-desktop/`
- **Windows** : `%APPDATA%/francis-desktop/logs/`
- **Linux** : `~/.config/francis-desktop/logs/`

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails. 