# Francis Desktop - Guide de Build et Distribution

## 🚀 Build Automatique (Recommandé)

### GitHub Actions (CI/CD)
- **Push sur `main`** → Build automatique Windows + macOS + Linux
- **Artifacts** uploadés sur le serveur et GitHub Releases
- **Signature/Notarisation** automatique si certificats configurés

### Configuration des Secrets GitHub
```
MAC_CSC_LINK=<certificat-p12-base64>
MAC_CSC_KEY_PASSWORD=<mot-de-passe-certificat>
WIN_CSC_LINK=<certificat-windows-p12-base64>
WIN_CSC_KEY_PASSWORD=<mot-de-passe-certificat>
APPLE_ID=<votre-apple-id>
APPLE_ID_PASS=<mot-de-passe-app-specific>
SERVER_HOST=<ip-serveur>
SERVER_USER=<nom-utilisateur>
SERVER_SSH_KEY=<clé-ssh-privée>
```

## 🛠️ Build Local

### Toutes plateformes (macOS uniquement)
```bash
./build-all-platforms.sh
```

### macOS avec signature/notarisation
```bash
# 1. Éditer les variables dans le script
nano build-sign-notarize-mac.sh

# 2. Lancer le build complet
./build-sign-notarize-mac.sh
```

### Build par plateforme
```bash
npm run build:mac    # macOS (.dmg, .pkg, .zip)
npm run build:win    # Windows (.exe)
npm run build:linux  # Linux (.AppImage)
```

## 📱 Formats Générés

| Plateforme | Formats | Description |
|------------|---------|-------------|
| **macOS** | `.dmg` | Image disque pour installation drag & drop |
| | `.pkg` | Package installeur macOS natif |
| | `.zip` | Archive pour tests rapides |
| **Windows** | `.exe` | Installeur NSIS avec raccourcis |
| **Linux** | `.AppImage` | Exécutable portable universel |

## 🔐 Signature et Sécurité

### macOS
- **Certificat requis**: Developer ID Application
- **Notarisation**: Automatique via `altool`
- **Entitlements**: `entitlements.mac.plist`

### Windows
- **Certificat requis**: Code Signing Certificate
- **Format**: P12 ou PFX
- **Tool**: `electron-builder` + `signtool`

## 📦 Distribution

### Automatique (CI/CD)
Les fichiers sont automatiquement uploadés vers :
- `https://votre-site.com/downloads/FrancisSetup.exe`
- `https://votre-site.com/downloads/FrancisSetup.dmg`
- `https://votre-site.com/downloads/FrancisSetup.pkg`
- `https://votre-site.com/downloads/francis-desktop.tar.gz`

### Manuelle
1. Build local : `./build-all-platforms.sh`
2. Upload vers `/var/www/html/downloads/` :
   ```bash
   scp dist/*.{exe,dmg,pkg,AppImage} user@server:/var/www/html/downloads/
   ```

## 🧪 Tests

### Vérification signature macOS
```bash
codesign --verify --deep --strict --verbose=2 dist/*.app
spctl --assess --verbose dist/*.app
```

### Vérification notarisation
```bash
spctl --assess --type open --context context:primary-signature dist/*.dmg
```

### Test installation
- **macOS**: Télécharger .dmg depuis le site, ouvrir normalement
- **Windows**: Télécharger .exe, lancer, vérifier Windows Defender
- **Linux**: Télécharger .AppImage, `chmod +x`, lancer

## 🔧 Dépannage

### "Image disque endommagée" (macOS)
- ✅ Vérifier signature : `codesign --verify`
- ✅ Vérifier notarisation : `spctl --assess`
- ✅ Rebuilder avec : `./build-sign-notarize-mac.sh`

### "Windows a protégé votre PC"
- ✅ Signer avec certificat : voir `WIN_CSC_LINK`
- ✅ Uploader sur VirusTotal pour réputation

### Build fails
- ✅ Vider cache : `rm -rf node_modules dist && npm install`
- ✅ Vérifier certificats : `security find-identity -v`
- ✅ Logs détaillés : `DEBUG=electron-builder npm run build`

## 📋 Checklist Release

- [ ] Version bump dans `package.json`
- [ ] Test build local : `./build-all-platforms.sh`
- [ ] Push sur `main` → CI/CD automatique
- [ ] Vérifier artifacts sur GitHub Releases
- [ ] Tester téléchargement depuis le site
- [ ] Vérifier installation sur machine propre
- [ ] Mettre à jour documentation utilisateur

---

💡 **Besoin d'aide ?** Consulter les logs GitHub Actions ou lancer en mode debug.
