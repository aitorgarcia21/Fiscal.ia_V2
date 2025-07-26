#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class FrancisInstaller {
  constructor() {
    this.extensionPath = path.join(__dirname, 'francis-extension');
    this.userDataDir = this.getUserDataDir();
    this.browser = null;
  }

  getUserDataDir() {
    const platform = os.platform();
    const homeDir = os.homedir();
    
    switch (platform) {
      case 'win32':
        return path.join(homeDir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
      case 'darwin':
        return path.join(homeDir, 'Library', 'Application Support', 'Google', 'Chrome');
      case 'linux':
        return path.join(homeDir, '.config', 'google-chrome');
      default:
        throw new Error('Unsupported platform');
    }
  }

  async detectChrome() {
    const possiblePaths = [];
    const platform = os.platform();
    
    if (platform === 'win32') {
      possiblePaths.push(
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe')
      );
    } else if (platform === 'darwin') {
      possiblePaths.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
    } else {
      possiblePaths.push('/usr/bin/google-chrome', '/usr/bin/chromium-browser');
    }

    for (const chromePath of possiblePaths) {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    }
    
    throw new Error('Chrome not found. Please install Google Chrome first.');
  }

  async prepareExtension() {
    console.log('📦 Preparing Francis extension...');
    
    // Créer le dossier d'installation
    const installDir = path.join(os.homedir(), 'Francis');
    await fs.ensureDir(installDir);
    
    const targetPath = path.join(installDir, 'francis-extension');
    
    try {
      // Utiliser l'extension locale
      const localExtensionPath = path.join(__dirname, 'francis-extension');
      
      console.log('📋 Using local extension from:', localExtensionPath);
      
      // Copier l'extension locale vers le dossier d'installation
      await fs.copy(localExtensionPath, targetPath);
      
      console.log('✅ Extension prepared at:', targetPath);
      return targetPath;
      
    } catch (error) {
      console.error('❌ Preparation failed:', error.message);
      throw new Error('Failed to prepare Francis extension. Installation files may be corrupted.');
    }
  }
  
  downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const file = fs.createWriteStream(filePath);
      
      https.get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      }).on('error', reject);
    });
  }

  async installExtension() {
    try {
      console.log('🚀 Starting Francis installation...');
      
      // Détecter Chrome
      const chromePath = await this.detectChrome();
      console.log('✅ Chrome found at:', chromePath);
      
      // Préparer l'extension
      const extensionPath = await this.prepareExtension();
      
      // Lancer Chrome avec l'extension
      console.log('🌐 Launching Chrome with Francis extension...');
      
      this.browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: false,
        args: [
          `--load-extension=${extensionPath}`,
          `--disable-extensions-except=${extensionPath}`,
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-default-apps'
        ]
      });

      console.log('✅ Francis extension installed successfully!');
      console.log('🎯 Francis is now active on all your web pages!');
      console.log('🔍 Look for the Francis button on any website you visit.');
      
      // Attendre quelques secondes puis fermer le navigateur d'installation
      setTimeout(async () => {
        if (this.browser) {
          await this.browser.close();
          console.log('✅ Installation complete! You can now use Chrome normally.');
          console.log('🎉 Francis will appear on all websites you visit!');
        }
      }, 5000);

    } catch (error) {
      console.error('❌ Installation failed:', error.message);
      console.log('📞 Please contact support at fiscal-ia.net');
      process.exit(1);
    }
  }
}

// Lancer l'installation
const installer = new FrancisInstaller();
installer.installExtension().catch(console.error);
