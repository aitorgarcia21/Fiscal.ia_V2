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