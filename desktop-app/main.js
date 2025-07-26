const { app, BrowserWindow, ipcMain, globalShortcut, Menu, Tray, shell, nativeImage } = require('electron');
const path = require('path');
const { execSync } = require('child_process');
const Store = require('electron-store');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// === CONSTANTES FRANCIS ===
const FRANCIS_API_BASE = 'https://fiscal-ia-v2.railway.app';

const store = new Store();
const francisStore = new Store({ name: 'francis-settings' });

// Configuration Francis
const FRANCIS_CONFIG = {
  apiUrl: FRANCIS_API_BASE,
  recordingsPath: path.join(app.getPath('userData'), 'recordings'),
  sessionFile: path.join(app.getPath('userData'), 'francis-session.json')
};

// Créer le dossier d'enregistrements
if (!fs.existsSync(FRANCIS_CONFIG.recordingsPath)) {
  fs.mkdirSync(FRANCIS_CONFIG.recordingsPath, { recursive: true });
}

let mainWindow;
let tray = null;
let currentContext = { app: null, windowTitle: null, forms: [] };
let isListening = false;

function createWindow() {
  // Créer la fenêtre overlay
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 300,
    minHeight: 500,
    frame: false, // Supprimer la barre de titre
    transparent: true, // Fond transparent
    alwaysOnTop: true, // Toujours au premier plan
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: true,
    backgroundColor: '#00000000', // Fond transparent
    skipTaskbar: true, // Ne pas afficher dans la barre des tâches
    movable: true,
    fullscreenable: false,
    titleBarStyle: 'custom',
    titleBarOverlay: {
      color: '#162238',
      symbolColor: '#c5a572',
      height: 40
    }
  });

  // Positionner dans le coin supérieur droit
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  mainWindow.setPosition(width - 450, 50);

  // Charger l'application React locale en développement ou la version construite en production
  if (process.env.NODE_ENV === 'development') {
    // En développement, charger depuis le serveur webpack-dev-server
    mainWindow.loadURL('http://localhost:3001');
    // Ouvrir les outils de développement
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // En production, charger le fichier local
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  }

  // Afficher la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Ouvrir les liens externes dans le navigateur par défaut
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  });

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Créer le menu de l'application
  createMenu();
  
  // Créer l'icône dans la barre de menu (Mac) ou la zone de notification (Windows/Linux)
  createTray();
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets/icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Afficher Francis',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Quitter',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Francis - Assistant Fiscal');
  tray.setContextMenu(contextMenu);
  
  // Clic sur l'icône pour afficher/masquer la fenêtre
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  
  // Afficher l'overlay dès le démarrage
  mainWindow.show();
}

function createMenu() {
  const template = [
    {
      label: 'Francis',
      submenu: [
        {
          label: 'À propos de Francis',
          click: () => {
            shell.openExternal('https://fiscal-ia.net');
          }
        },
        { type: 'separator' },
        {
          label: 'Préférences...',
          accelerator: 'Cmd+,',
          click: () => {
            // Ouvrir les préférences
          }
        },
        { type: 'separator' },
        {
          label: 'Quitter Francis',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Fenêtre',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Gestion des événements de l'application
app.whenReady().then(() => {
  createWindow();
  registerFrancisGlobalHotkeys();
  startContextDetection();
});

// Gestion des événements de l'overlay
ipcMain.on('overlay:close', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.on('overlay:minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('overlay:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('overlay:is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.on('overlay:drag-start', () => {
  if (mainWindow) {
    mainWindow.webContents.send('window-state-changed', { isMaximized: mainWindow.isMaximized() });
  }
});

ipcMain.on('overlay:drag-move', (event, { x, y }) => {
  if (mainWindow) {
    mainWindow.setPosition(x, y);
  }
});

ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});

// Gestion de la fermeture de l'application
app.on('window-all-closed', (event) => {
  if (process.platform !== 'darwin') {
    if (tray) {
      event.preventDefault();
      mainWindow.hide();
    } else {
      app.quit();
    }
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Nettoyer les hotkeys globaux
  globalShortcut.unregisterAll();
  francisLog('info', 'Application Francis fermée, hotkeys nettoyés');
});

// Gestion des messages IPC
ipcMain.handle('get-auth-status', () => {
  return {
    isAuthenticated: store.get('isAuthenticated', false),
    userType: store.get('userType', 'particulier')
  };
});

ipcMain.handle('set-auth-status', (event, { isAuthenticated, userType }) => {
  store.set('isAuthenticated', isAuthenticated);
  store.set('userType', userType);
  return true;
});

ipcMain.handle('clear-auth', () => {
  store.delete('isAuthenticated');
  store.delete('userType');
  return true;
});

// === FRANCIS SPECIFIC IPC HANDLERS ===

// IPC: Obtenir la liste des fenêtres ouvertes
ipcMain.handle('francis:get-open-windows', async () => {
  try {
    const windows = await getOpenWindows();
    francisLog('info', `${windows.length} fenêtres trouvées`);
    return { success: true, windows };
  } catch (error) {
    francisLog('error', 'Erreur récupération fenêtres', error.message);
    return { success: false, error: error.message };
  }
});

// IPC: Injection de données dans une fenêtre spécifique
ipcMain.handle('francis:inject-to-window', async (event, windowInfo, data) => {
  francisLog('info', 'Injection ciblée', { window: windowInfo, data });
  const result = await injectDataToWindow(windowInfo, data);
  return result;
});

// IPC: Injection de données de formulaire (rétrocompatibilité)
ipcMain.handle('francis:inject-form-data', async (event, data) => {
  francisLog('info', 'Demande injection données', data);
  injectDataToActiveApp(data);
  return { success: true };
});

// === IPC HANDLERS ENREGISTREMENT AUDIO ===

// IPC: Démarrer l'enregistrement audio
ipcMain.handle('francis:start-recording', async () => {
  try {
    const result = startAudioRecording();
    francisLog('info', 'Démarrage enregistrement demandé');
    return result;
  } catch (error) {
    francisLog('error', 'Erreur démarrage enregistrement', error.message);
    return { success: false, error: error.message };
  }
});

// IPC: Arrêter l'enregistrement audio
ipcMain.handle('francis:stop-recording', async () => {
  try {
    const result = stopAudioRecording();
    francisLog('info', 'Arrêt enregistrement demandé');
    return result;
  } catch (error) {
    francisLog('error', 'Erreur arrêt enregistrement', error.message);
    return { success: false, error: error.message };
  }
});

// IPC: Obtenir l'historique des enregistrements
ipcMain.handle('francis:get-recordings', async () => {
  try {
    const recordings = francisStore.get('recordings', []);
    return { success: true, recordings };
  } catch (error) {
    francisLog('error', 'Erreur récupération enregistrements', error.message);
    return { success: false, error: error.message };
  }
});


// IPC: Obtenir la session Francis
ipcMain.handle('francis:get-session', async () => {
  try {
    // Récupération session Francis depuis le site (optionnel)
    try {
      const response = await axios.get(`${FRANCIS_API_BASE}/api/user/session`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Francis-Desktop/1.0.0'
        }
      });
      
      const session = response.data;
      console.log('[FRANCIS SESSION]', session);
      return session;
    } catch (apiError) {
      // Mode hors ligne - Francis fonctionne quand même
      console.log('[FRANCIS OFFLINE]', 'Session locale activée');
      return {
        success: true,
        offline: true,
        user: { name: 'Francis User' },
        message: 'Francis prêt en mode hors ligne'
      };
    }
  } catch (error) {
    console.error('[FRANCIS ERROR]', new Date().toISOString(), '- Erreur récupération session', error.message);
    return { success: false, error: error.message };
  }
});

// IPC: Synchroniser vers le site Francis
ipcMain.handle('francis:sync-website', async (event, data) => {
  try {
    const result = await syncToFrancisWebsite(data);
    francisLog('info', 'Synchronisation website demandée');
    return result;
  } catch (error) {
    francisLog('error', 'Erreur synchronisation website', error.message);
    return { success: false, error: error.message };
  }
});

// IPC: Upload audio vers Francis
ipcMain.handle('francis:upload-audio', async (event, recordingPath) => {
  try {
    const result = await uploadAudioToFrancis(recordingPath);
    francisLog('info', 'Upload audio demandé');
    return result;
  } catch (error) {
    francisLog('error', 'Erreur upload audio', error.message);
    return { success: false, error: error.message };
  }
});

// Détection de l'application active
ipcMain.handle('francis:get-active-app', async () => {
  try {
    if (process.platform === 'darwin') {
      const result = execSync(`osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`, { encoding: 'utf8' });
      return result.trim();
    } else if (process.platform === 'win32') {
      // Windows implementation
      return 'Unknown';
    }
  } catch (error) {
    francisLog('debug', 'Erreur détection app active', error.message);
    return null;
  }
});

// Scan des formulaires (simulation)
ipcMain.handle('francis:scan-forms', async () => {
  // Cette fonctionnalité nécessiterait une intégration plus poussée
  // Pour l'instant, on retourne des champs génériques
  return [
    { id: 'nom', name: 'nom', type: 'text', placeholder: 'Nom' },
    { id: 'prenom', name: 'prenom', type: 'text', placeholder: 'Prénom' },
    { id: 'age', name: 'age', type: 'number', placeholder: 'Âge' },
    { id: 'revenus', name: 'revenus', type: 'number', placeholder: 'Revenus' },
    { id: 'situation', name: 'situation', type: 'select', placeholder: 'Situation' }
  ];
});

// Gestion des hotkeys globaux
ipcMain.on('francis:register-hotkey', (event, shortcut) => {
  francisLog('info', `Enregistrement hotkey: ${shortcut}`);
});

// Détection du contexte
ipcMain.handle('francis:detect-context', async () => {
  return currentContext;
});

// Paramètres Francis
ipcMain.handle('francis:get-settings', () => {
  return {
    voiceLanguage: francisStore.get('voiceLanguage', 'fr-FR'),
    autoStart: francisStore.get('autoStart', true),
    hotkeys: francisStore.get('hotkeys', {
      toggle: 'F8',
      minimize: 'CommandOrControl+Shift+F'
    }),
    theme: francisStore.get('theme', 'dark'),
    opacity: francisStore.get('opacity', 0.95)
  };
});

ipcMain.handle('francis:set-settings', (event, settings) => {
  Object.keys(settings).forEach(key => {
    francisStore.set(key, settings[key]);
  });
  francisLog('info', 'Paramètres Francis mis à jour', settings);
  return true;
});

// Système de logs
ipcMain.on('francis:log', (event, { level, message, data }) => {
  francisLog(level, message, data);
});

// === FONCTIONS FRANCIS ===

function registerFrancisGlobalHotkeys() {
  // Hotkey principal : F8 pour activer/désactiver Francis
  globalShortcut.register('F8', () => {
    francisLog('info', 'Hotkey F8 activé');
    if (mainWindow) {
      mainWindow.webContents.send('francis:global-hotkey', 'toggle-francis');
      
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
  
  // Hotkey secondaire : Cmd+Shift+F pour minimiser/restaurer
  globalShortcut.register('CommandOrControl+Shift+F', () => {
    francisLog('info', 'Hotkey Cmd+Shift+F activé');
    if (mainWindow) {
      mainWindow.webContents.send('francis:global-hotkey', 'minimize-francis');
    }
  });
  
  francisLog('info', 'Hotkeys globaux Francis enregistrés');
}

function startContextDetection() {
  // Détecter le contexte toutes les 2 secondes
  setInterval(async () => {
    try {
      const activeApp = await getActiveApplication();
      if (activeApp && activeApp !== currentContext.app) {
        currentContext.app = activeApp;
        currentContext.windowTitle = await getActiveWindowTitle();
        
        if (mainWindow) {
          mainWindow.webContents.send('francis:context-changed', currentContext);
        }
        
        francisLog('debug', 'Contexte changé', currentContext);
      }
    } catch (error) {
      francisLog('error', 'Erreur détection contexte', error.message);
    }
  }, 2000);
}

async function getActiveApplication() {
  try {
    if (process.platform === 'darwin') {
      const result = execSync(`osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`, { encoding: 'utf8' });
      return result.trim();
    }
  } catch (error) {
    francisLog('debug', 'Erreur détection app active', error.message);
    return null;
  }
}

async function getActiveWindowTitle() {
  try {
    if (process.platform === 'darwin') {
      const result = execSync(`osascript -e 'tell application "System Events" to get title of front window of first application process whose frontmost is true'`, { encoding: 'utf8' });
      return result.trim();
    }
    return null;
  } catch (error) {
    francisLog('debug', 'Erreur détection titre fenêtre', error.message);
    return null;
  }
}

function francisLog(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    data
  };
  
  console.log(`[FRANCIS ${level.toUpperCase()}] ${timestamp} - ${message}`, data || '');
  
  // Sauvegarder les logs dans le store si nécessaire
  if (['error', 'warn'].includes(level)) {
    const logs = francisStore.get('logs', []);
    logs.push(logEntry);
    // Garder seulement les 100 derniers logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    francisStore.set('logs', logs);
  }
}

// Empêcher la navigation vers les pages de landing
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // Bloquer la navigation vers les pages de landing
    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/pro') {
      event.preventDefault();
      contents.loadURL('https://fiscal-ia.net/login');
    }
  });
}); 