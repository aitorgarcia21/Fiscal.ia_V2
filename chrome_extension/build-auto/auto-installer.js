// Auto-installer pour Francis Teams Extension
// Utilise l'API Chrome pour installer l'extension automatiquement

class FrancisAutoInstaller {
    constructor() {
        this.extensionId = null;
        this.manifestUrl = chrome.runtime.getURL('manifest.json');
        this.installUrl = 'https://fiscal.ia/francis-extension.zip';
    }

    async startAutoInstall() {
        try {
            console.log('🤖 Démarrage installation automatique Francis...');
            
            // Vérifier si on est sur Chrome
            if (!this.isChrome()) {
                throw new Error('Chrome requis pour l\'installation automatique');
            }

            // Vérifier les permissions
            if (!this.hasRequiredPermissions()) {
                await this.requestPermissions();
            }

            // Télécharger l'extension
            const extensionData = await this.downloadExtension();
            
            // Installer l'extension
            await this.installExtension(extensionData);
            
            // Configurer l'extension
            await this.configureExtension();
            
            console.log('✅ Francis installé automatiquement !');
            return true;
            
        } catch (error) {
            console.error('❌ Erreur installation automatique:', error);
            this.fallbackToManual();
            return false;
        }
    }

    isChrome() {
        return navigator.userAgent.includes('Chrome') && 
               typeof chrome !== 'undefined' && 
               chrome.runtime;
    }

    hasRequiredPermissions() {
        return new Promise((resolve) => {
            chrome.permissions.contains({
                permissions: [
                    'tabs',
                    'activeTab',
                    'storage',
                    'identity'
                ],
                origins: [
                    'https://teams.microsoft.com/*',
                    'https://fiscal.ia/*'
                ]
            }, (result) => {
                resolve(result);
            });
        });
    }

    async requestPermissions() {
        return new Promise((resolve, reject) => {
            chrome.permissions.request({
                permissions: [
                    'tabs',
                    'activeTab',
                    'storage',
                    'identity'
                ],
                origins: [
                    'https://teams.microsoft.com/*',
                    'https://fiscal.ia/*'
                ]
            }, (granted) => {
                if (granted) {
                    resolve();
                } else {
                    reject(new Error('Permissions refusées'));
                }
            });
        });
    }

    async downloadExtension() {
        console.log('📥 Téléchargement de Francis...');
        
        const response = await fetch(this.installUrl);
        if (!response.ok) {
            throw new Error('Impossible de télécharger l\'extension');
        }
        
        const blob = await response.blob();
        return blob;
    }

    async installExtension(extensionData) {
        console.log('🔧 Installation de Francis...');
        
        return new Promise((resolve, reject) => {
            chrome.management.installExtension({
                url: URL.createObjectURL(extensionData),
                installType: 'development'
            }, (extensionId) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    this.extensionId = extensionId;
                    resolve(extensionId);
                }
            });
        });
    }

    async configureExtension() {
        console.log('⚙️ Configuration de Francis...');
        
        // Activer l'extension
        await this.enableExtension();
        
        // Configurer les paramètres par défaut
        await this.setDefaultSettings();
        
        // Tester l'extension
        await this.testExtension();
    }

    async enableExtension() {
        return new Promise((resolve, reject) => {
            chrome.management.setEnabled(this.extensionId, true, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
    }

    async setDefaultSettings() {
        const defaultSettings = {
            autoListen: true,
            showSuggestions: true,
            language: 'fr',
            country: 'france',
            notifications: true
        };

        return new Promise((resolve) => {
            chrome.storage.sync.set(defaultSettings, () => {
                resolve();
            });
        });
    }

    async testExtension() {
        // Vérifier que l'extension fonctionne
        return new Promise((resolve) => {
            chrome.management.get(this.extensionId, (extension) => {
                if (extension && extension.enabled) {
                    console.log('✅ Extension Francis activée et fonctionnelle');
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    fallbackToManual() {
        console.log('⚠️ Fallback vers installation manuelle');
        
        // Ouvrir la page d'installation manuelle
        chrome.tabs.create({
            url: chrome.runtime.getURL('install-standalone.html')
        });
    }

    // Méthode pour vérifier si Francis est déjà installé
    async isFrancisInstalled() {
        return new Promise((resolve) => {
            chrome.management.getAll((extensions) => {
                const francis = extensions.find(ext => 
                    ext.name === 'Francis Teams Assistant' ||
                    ext.id === this.extensionId
                );
                resolve(!!francis);
            });
        });
    }

    // Méthode pour désinstaller Francis (si nécessaire)
    async uninstallFrancis() {
        if (this.extensionId) {
            return new Promise((resolve, reject) => {
                chrome.management.uninstall(this.extensionId, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve();
                    }
                });
            });
        }
    }
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrancisAutoInstaller;
}

// Auto-démarrage si le script est chargé directement
if (typeof window !== 'undefined') {
    window.FrancisAutoInstaller = FrancisAutoInstaller;
    
    // Démarrer automatiquement si on est sur la page d'installation
    if (window.location.pathname.includes('install-auto.html')) {
        const installer = new FrancisAutoInstaller();
        
        // Démarrer l'installation après 2 secondes
        setTimeout(() => {
            installer.startAutoInstall();
        }, 2000);
    }
} 