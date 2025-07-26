const { contextBridge, ipcRenderer } = require('electron');

// Exposer les APIs de manière sécurisée pour l'overlay
contextBridge.exposeInMainWorld('electronAPI', {
  // Gestion de l'overlay
  closeWindow: () => ipcRenderer.send('overlay:close'),
  minimizeWindow: () => ipcRenderer.send('overlay:minimize'),
  isMaximized: () => ipcRenderer.invoke('overlay:is-maximized'),
  maximizeWindow: () => ipcRenderer.send('overlay:maximize'),
  unmaximizeWindow: () => ipcRenderer.send('overlay:unmaximize'),
  
  // Gestion de l'authentification
  getAuthStatus: () => ipcRenderer.invoke('get-auth-status'),
  setAuthStatus: (data) => ipcRenderer.invoke('set-auth-status', data),
  clearAuth: () => ipcRenderer.invoke('clear-auth'),
  
  // Informations sur l'environnement
  isDesktop: true,
  platform: process.platform,
  
  // Gestion du drag de la fenêtre
  startDrag: () => ipcRenderer.send('overlay:drag-start'),
  
  // Utilitaires
  openExternal: (url) => ipcRenderer.send('open-external', url),
  
  // Francis - APIs spécifiques
  // Reconnaissance vocale et extraction de données
  injectFormData: (data) => ipcRenderer.send('francis:inject-form-data', data),
  getActiveApplication: () => ipcRenderer.invoke('francis:get-active-app'),
  scanForForms: () => ipcRenderer.invoke('francis:scan-forms'),
  
  // Gestion des hotkeys globaux
  registerGlobalHotkey: (shortcut, callback) => {
    ipcRenderer.send('francis:register-hotkey', shortcut);
    ipcRenderer.on(`francis:hotkey-${shortcut}`, callback);
  },
  onGlobalHotkey: (callback) => {
    ipcRenderer.on('francis:global-hotkey', (event, action) => {
      callback(action);
    });
  },
  
  // === GESTION FENÊTRES ET INJECTION ===
  
  // Obtenir la liste des fenêtres ouvertes
  getOpenWindows: () => {
    return ipcRenderer.invoke('francis:get-open-windows');
  },
  
  // Injection de données dans une fenêtre spécifique
  injectToWindow: (windowInfo, data) => {
    return ipcRenderer.invoke('francis:inject-to-window', windowInfo, data);
  },
  
  // Injection de données dans les formulaires (rétrocompatibilité)
  injectFormData: (data) => {
    return ipcRenderer.invoke('francis:inject-form-data', data);
  },
  
  // === ENREGISTREMENT AUDIO ===
  
  // Démarrer l'enregistrement audio
  startRecording: () => {
    return ipcRenderer.invoke('francis:start-recording');
  },
  
  // Arrêter l'enregistrement audio
  stopRecording: () => {
    return ipcRenderer.invoke('francis:stop-recording');
  },
  
  // Obtenir l'historique des enregistrements
  getRecordings: () => {
    return ipcRenderer.invoke('francis:get-recordings');
  },
  
  // === SESSION ET SYNCHRONISATION ===
  
  // Obtenir la session Francis
  getFrancisSession: () => {
    return ipcRenderer.invoke('francis:get-session');
  },
  
  // Synchroniser vers le site Francis
  syncToWebsite: (data) => {
    return ipcRenderer.invoke('francis:sync-website', data);
  },
  
  // Upload audio vers Francis
  uploadAudio: (recordingPath) => {
    return ipcRenderer.invoke('francis:upload-audio', recordingPath);
  },
  
  // Détection du contexte actuel
  detectContext: () => ipcRenderer.invoke('francis:detect-context'),
  onContextChange: (callback) => {
    ipcRenderer.on('francis:context-changed', (event, context) => {
      callback(context);
    });
  },
  
  // Gestion des paramètres Francis
  getFrancisSettings: () => {
    return ipcRenderer.invoke('francis:get-settings');
  },
  
  setFrancisSettings: (settings) => {
    return ipcRenderer.invoke('francis:set-settings', settings);
  },
  
  // Logging Francis
  logFrancis: (level, message, data) => {
    return ipcRenderer.invoke('francis:log', level, message, data);
  },
  
  // Événements de l'overlay
  onWindowState: (callback) => ipcRenderer.on('window-state-changed', (_, state) => callback(state))
});

// Désactiver le menu contextuel par défaut
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Gestion du drag pour la fenêtre
let isDragging = false;
let offsetX, offsetY;

window.addEventListener('mousedown', (e) => {
  // Vérifier si le clic est sur un élément draggable (ajouter la classe 'draggable' aux éléments concernés)
  if (e.target.closest('.draggable') || e.target === document.documentElement) {
    isDragging = true;
    offsetX = e.clientX;
    offsetY = e.clientY;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }
});

window.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const { screenX, screenY } = e;
    ipcRenderer.send('overlay:drag-move', { x: screenX - offsetX, y: screenY - offsetY });
  }
});

window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
});