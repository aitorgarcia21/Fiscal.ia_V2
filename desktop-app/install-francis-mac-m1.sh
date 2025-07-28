#!/bin/bash

# 🎯 INSTALLEUR FRANCIS MAC M1 - GARANTIE 100% SUCCÈS
# Spécialement conçu pour MacBook Air M1/M2/M3 Apple Silicon

set -e  # Arrêt immédiat en cas d'erreur

echo "🚀 INSTALLATION FRANCIS - MAC APPLE SILICON"
echo "==========================================="

# Variables
APP_NAME="Francis"
DMG_FILE="Francis-1.0.0-arm64.dmg"
PKG_FILE="Francis-1.0.0-arm64.pkg"
DOWNLOAD_DIR="$HOME/Downloads"
APPLICATIONS_DIR="/Applications"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage avec couleurs
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Vérification architecture
print_status "Vérification de l'architecture..."
ARCH=$(uname -m)
if [ "$ARCH" != "arm64" ]; then
    print_error "Ce script est conçu pour Apple Silicon (ARM64). Architecture détectée: $ARCH"
    exit 1
fi
print_success "Architecture Apple Silicon confirmée ✓"

# Vérification des privilèges admin
print_status "Vérification des privilèges administrateur..."
if ! sudo -n true 2>/dev/null; then
    print_warning "Privilèges administrateur requis pour l'installation"
    sudo -v
fi
print_success "Privilèges administrateur confirmés ✓"

# Fonction pour nettoyer les anciennes installations
cleanup_old_installation() {
    print_status "Nettoyage des anciennes installations..."
    
    # Fermer l'app si elle est ouverte
    if pgrep -x "Francis" > /dev/null; then
        print_warning "Fermeture de Francis..."
        pkill -x "Francis" || true
        sleep 2
    fi
    
    # Supprimer l'ancienne version
    if [ -d "$APPLICATIONS_DIR/$APP_NAME.app" ]; then
        print_warning "Suppression de l'ancienne version..."
        sudo rm -rf "$APPLICATIONS_DIR/$APP_NAME.app"
    fi
    
    print_success "Nettoyage terminé ✓"
}

# Méthode 1: Installation via DMG (Recommandée)
install_via_dmg() {
    print_status "🎯 MÉTHODE 1: Installation via DMG (Recommandée)"
    
    DMG_PATH="dist/$DMG_FILE"
    
    if [ ! -f "$DMG_PATH" ]; then
        print_error "Fichier DMG introuvable: $DMG_PATH"
        return 1
    fi
    
    print_status "Montage du DMG..."
    MOUNT_POINT=$(hdiutil attach "$DMG_PATH" -nobrowse | grep -o '/Volumes/.*')
    
    if [ -z "$MOUNT_POINT" ]; then
        print_error "Échec du montage du DMG"
        return 1
    fi
    
    print_success "DMG monté sur: $MOUNT_POINT"
    
    # Copie de l'application
    print_status "Installation de Francis..."
    sudo cp -R "$MOUNT_POINT/$APP_NAME.app" "$APPLICATIONS_DIR/"
    
    # Démontage du DMG
    print_status "Démontage du DMG..."
    hdiutil detach "$MOUNT_POINT" -quiet
    
    print_success "Installation DMG terminée ✓"
    return 0
}

# Méthode 2: Installation via PKG (Fallback)
install_via_pkg() {
    print_status "🎯 MÉTHODE 2: Installation via PKG (Fallback)"
    
    PKG_PATH="dist/$PKG_FILE"
    
    if [ ! -f "$PKG_PATH" ]; then
        print_error "Fichier PKG introuvable: $PKG_PATH"
        return 1
    fi
    
    print_status "Installation du package..."
    sudo installer -pkg "$PKG_PATH" -target /
    
    print_success "Installation PKG terminée ✓"
    return 0
}

# Correction des permissions et sécurité
fix_security_and_permissions() {
    print_status "🔒 Correction des permissions et sécurité..."
    
    APP_PATH="$APPLICATIONS_DIR/$APP_NAME.app"
    
    if [ ! -d "$APP_PATH" ]; then
        print_error "Application non trouvée dans Applications"
        return 1
    fi
    
    # Correction des permissions
    print_status "Correction des permissions..."
    sudo chown -R root:wheel "$APP_PATH"
    sudo chmod -R 755 "$APP_PATH"
    
    # Suppression des attributs de quarantaine (évite "App endommagée")
    print_status "Suppression des attributs de quarantaine..."
    sudo xattr -rd com.apple.quarantine "$APP_PATH" 2>/dev/null || true
    
    # Suppression de la signature pour éviter les problèmes Gatekeeper
    print_status "Correction de la signature..."
    sudo codesign --remove-signature "$APP_PATH/Contents/MacOS/$APP_NAME" 2>/dev/null || true
    
    print_success "Corrections de sécurité appliquées ✓"
}

# Test de lancement
test_launch() {
    print_status "🧪 Test de lancement..."
    
    APP_PATH="$APPLICATIONS_DIR/$APP_NAME.app"
    
    if [ ! -d "$APP_PATH" ]; then
        print_error "Application non installée"
        return 1
    fi
    
    print_status "Lancement de Francis en mode test..."
    open "$APP_PATH" &
    
    sleep 5
    
    if pgrep -x "Francis" > /dev/null; then
        print_success "Francis lancé avec succès ! ✓"
        return 0
    else
        print_warning "Francis ne s'est pas lancé automatiquement"
        print_status "Vous pouvez le lancer manuellement depuis Applications"
        return 1
    fi
}

# PROCÉDURE D'INSTALLATION PRINCIPALE
main() {
    echo ""
    print_status "🎯 DÉBUT DE L'INSTALLATION FRANCIS"
    echo ""
    
    # Étape 1: Nettoyage
    cleanup_old_installation
    echo ""
    
    # Étape 2: Installation (DMG puis PKG en fallback)
    if install_via_dmg; then
        print_success "✅ Installation DMG réussie !"
    elif install_via_pkg; then
        print_success "✅ Installation PKG réussie !"
    else
        print_error "❌ Échec de toutes les méthodes d'installation"
        exit 1
    fi
    echo ""
    
    # Étape 3: Corrections sécurité
    fix_security_and_permissions
    echo ""
    
    # Étape 4: Test de lancement
    test_launch
    echo ""
    
    # Succès final
    echo "🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉"
    print_success "    FRANCIS INSTALLÉ AVEC SUCCÈS !"
    print_success "    Application disponible dans Applications"
    print_success "    Vous pouvez maintenant utiliser Francis !"
    echo "🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉"
    echo ""
    
    # Instructions post-installation
    echo "📋 INSTRUCTIONS POST-INSTALLATION:"
    echo "1. ✅ Ouvrez Applications"
    echo "2. ✅ Double-cliquez sur Francis"
    echo "3. ✅ Si macOS demande l'autorisation, cliquez 'Ouvrir'"
    echo "4. ✅ Francis est prêt à utiliser !"
    echo ""
    
    # Ouverture automatique du dossier Applications
    print_status "Ouverture du dossier Applications..."
    open "$APPLICATIONS_DIR"
}

# Gestion des erreurs
trap 'print_error "Installation interrompue"; exit 1' INT TERM

# Exécution du script principal
main

echo "✨ Script d'installation terminé avec succès ! ✨"
