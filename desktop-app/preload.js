const { contextBridge, ipcRenderer } = require('electron');

// Exposer les APIs de manière sécurisée
contextBridge.exposeInMainWorld('electronAPI', {
  // Gestion de l'authentification
  getAuthStatus: () => ipcRenderer.invoke('get-auth-status'),
  setAuthStatus: (data) => ipcRenderer.invoke('set-auth-status', data),
  clearAuth: () => ipcRenderer.invoke('clear-auth'),
  
  // Informations sur l'environnement
  isDesktop: true,
  platform: process.platform,
  
  // Utilitaires
  openExternal: (url) => {
    // Cette fonction sera gérée par le main process
    window.open(url, '_blank');
  }
});

// Intercepter les événements de navigation pour bloquer les pages de landing
window.addEventListener('beforeunload', (event) => {
  const currentUrl = window.location.href;
  if (currentUrl.includes('/') && !currentUrl.includes('/login') && !currentUrl.includes('/dashboard')) {
    event.preventDefault();
    window.location.href = 'https://fiscal-ia.net/login';
  }
}); 