import { app, BrowserWindow, ipcMain, Menu, dialog, shell } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    title: 'DiagnoConnect Reception',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
    titleBarStyle: 'hidden',
    backgroundColor: '#f8fafc',
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5175');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'New Patient Registration', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('navigate', '/register-patient') },
        { label: 'New Visit', accelerator: 'CmdOrCtrl+Shift+N', click: () => mainWindow?.webContents.send('navigate', '/visits') },
        { type: 'separator' },
        { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Dashboard', accelerator: 'CmdOrCtrl+D', click: () => mainWindow?.webContents.send('navigate', '/') },
        { label: 'Queue Display', accelerator: 'CmdOrCtrl+Q', click: () => mainWindow?.webContents.send('navigate', '/queue') },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', click: () => { const zoom = mainWindow?.webContents.getZoomLevel() ?? 0; mainWindow?.webContents.setZoomLevel(zoom + 0.5); } },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => { const zoom = mainWindow?.webContents.getZoomLevel() ?? 0; mainWindow?.webContents.setZoomLevel(zoom - 0.5); } },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => mainWindow?.webContents.setZoomLevel(0) },
        { type: 'separator' },
        { label: 'Toggle Fullscreen', accelerator: 'F11', click: () => mainWindow?.setFullScreen(!mainWindow?.isFullScreen()) },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About DiagnoConnect', click: () => dialog.showMessageBox(mainWindow!, { type: 'info', title: 'DiagnoConnect', message: 'DiagnoConnect Reception Desktop v1.0.0', detail: 'Healthcare Management Platform' }) },
        { label: 'Documentation', click: () => shell.openExternal('https://docs.diagnosconnect.com') },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

// IPC Handlers
ipcMain.handle('get-system-info', () => ({
  platform: process.platform,
  arch: process.arch,
  version: app.getVersion(),
  electronVersion: process.versions.electron,
}));

ipcMain.handle('scan-barcode', async () => {
  return { success: true, data: null, message: 'Barcode scanner integration - connect USB scanner' };
});

ipcMain.handle('print-receipt', async (_event, data: { content: string; copies?: number }) => {
  try {
    if (mainWindow) {
      const printWindow = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
      printWindow.loadURL(`data:text/html,${encodeURIComponent(data.content)}`);
      await new Promise<void>((resolve) => {
        printWindow.webContents.on('did-finish-load', resolve);
      });
      printWindow.webContents.print({ silent: true, copies: data.copies || 1 });
      printWindow.close();
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('save-offline-data', async (_event, key: string, value: unknown) => {
  const Store = (await import('electron-store')).default;
  const store = new Store({ name: 'offline-data' });
  store.set(key, value);
  return { success: true };
});

ipcMain.handle('get-offline-data', async (_event, key: string) => {
  const Store = (await import('electron-store')).default;
  const store = new Store({ name: 'offline-data' });
  return store.get(key);
});

ipcMain.handle('get-offline-data-keys', async () => {
  const Store = (await import('electron-store')).default;
  const store = new Store({ name: 'offline-data' });
  return store.keys;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
