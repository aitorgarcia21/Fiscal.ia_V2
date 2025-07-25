const { app, BrowserWindow, Menu, shell, ipcMain, Tray, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let tray = null;

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
app.whenReady().then(createWindow);

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