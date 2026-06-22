const { app, BrowserWindow, Menu, Tray, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 750,
    minWidth: 600,
    minHeight: 500,
    title: 'Awakure Alarm',
    icon: path.join(__dirname, '../public/vite.svg'), // Fallback icon
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
    },
  });

  // Load the built app index.html
  const indexPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(indexPath).catch((e) => {
    console.error('Failed to load local HTML file:', e);
    // If build dist folder does not exist, let user know
    mainWindow.loadURL('data:text/html,<h1>Error loading dashboard</h1><p>Please run <code>npm run build</code> first to generate the frontend assets.</p>');
  });

  // Remove default menu bar for clean premium app feel
  Menu.setApplicationMenu(null);

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/vite.svg');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Awakure', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('Awakure Alarm (Running in background)');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

ipcMain.on('alarm-triggered', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(true);
    setTimeout(() => mainWindow.setAlwaysOnTop(false), 2000);
  }
});

ipcMain.on('create-desktop-shortcut', (event) => {
  try {
    const desktopPath = app.getPath('desktop');
    const shortcutPath = path.join(desktopPath, 'Awakure.lnk');
    const targetPath = process.execPath;
    
    const success = shell.writeShortcutLink(shortcutPath, 'create', {
      target: targetPath,
      description: 'Awakure Alarm',
      appUserModelId: 'com.awakure.app'
    });
    
    event.reply('create-desktop-shortcut-reply', success);
  } catch (error) {
    console.error('Shortcut error:', error);
    event.reply('create-desktop-shortcut-reply', false);
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Overriding default behavior: don't quit when window closes.
});
