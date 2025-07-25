const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

function createWindow() {
  // Créer la fenêtre du navigateur
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#162238'
  });

  // Charger l'URL de l'application
  // Toujours utiliser l'URL de production pour éviter ERR_CONNECTION_REFUSED
  const baseUrl = 'https://fiscal-ia-v2-production.up.railway.app';
  
  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = store.get('isAuthenticated', false);
  const userType = store.get('userType', 'particulier');
  
  let targetUrl;
  if (isAuthenticated && userType === 'professionnel') {
    targetUrl = `${baseUrl}/pro/dashboard`;
  } else if (isAuthenticated) {
    targetUrl = `${baseUrl}/dashboard`;
  } else {
    targetUrl = `${baseUrl}/login`;
  }

  mainWindow.loadURL(targetUrl);

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
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
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