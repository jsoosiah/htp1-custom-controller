'use strict';
/ * global __static * /;

import { app, protocol, ipcMain, Menu, Tray, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import AutoLaunch from 'auto-launch';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

let mainWindow = null;
let tray = null;

const baseTitle = `HTP-1 Custom UI ${app.getVersion()}`;

let autoLaunch = new AutoLaunch({
  name: baseTitle,
  path: app.getPath('exe'),
});

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: baseTitle,
    width: 1280,
    height: 720,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    // eslint-disable-next-line no-undef
    icon: path.join(__static, 'htp1-remote-disconnected.ico'),
  });

  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }

    return false;
  });

  mainWindow.removeMenu();

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html');
    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.on('update-downloaded', (updateInfo) => {
      mainWindow.webContents.send('readyToInstall', updateInfo);
    });
    ipcMain.on('installUpdateRequested', () => {
      autoUpdater.quitAndInstall();
    });
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }

  // eslint-disable-next-line no-undef
  tray = new Tray(path.join(__static, 'htp1-remote-disconnected.ico'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: function () {
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click: function () {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
  });

  ipcMain.on('connected', (e, isConnected) => {
    if (isConnected) {
      setTrayStatusConnected();
    } else {
      setTrayStatusDisconnected();
    }
  });

  ipcMain.on('runOnSystemStartupChanged', async (e, enableAutoLaunch) => {
    const currentlyEnabled = await autoLaunch.isEnabled();
    try {
      if (enableAutoLaunch) {
        if (!currentlyEnabled) {
          await autoLaunch.enable();
        }
      } else {
        if (currentlyEnabled) {
          await autoLaunch.disable();
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

function setTrayStatusConnected() {
  // eslint-disable-next-line no-undef
  tray.setImage(path.join(__static, 'htp1-remote-connected.ico'));
  // eslint-disable-next-line no-undef
  mainWindow.setIcon(path.join(__static, 'htp1-remote-connected.ico'));
  const title = `${baseTitle} - Connected`;
  mainWindow.setTitle(title);
  tray.setToolTip(title);
}

function setTrayStatusDisconnected() {
  // eslint-disable-next-line no-undef
  tray.setImage(path.join(__static, 'htp1-remote-disconnected.ico'));
  // eslint-disable-next-line no-undef
  mainWindow.setIcon(path.join(__static, 'htp1-remote-disconnected.ico'));
  const title = `${baseTitle} - Disconnected`;
  mainWindow.setTitle(title);
  tray.setToolTip(title);
}
