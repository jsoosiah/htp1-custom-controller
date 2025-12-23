import { app, ipcMain, Menu, Tray, BrowserWindow, nativeImage } from 'electron'
import updaterPkg from 'electron-updater'
import AutoLaunch from 'auto-launch'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { autoUpdater } = updaterPkg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = !!process.env.VITE_DEV_SERVER_URL || !app.isPackaged

let mainWindow = null
let tray = null

const baseTitle = `HTP-1 Custom UI ${app.getVersion()}`

function resourcePath(filename) {
  // packaged: <install>/resources/...
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'resources', filename)
  }
  // dev: <project>/resources/...
  return path.join(process.cwd(), 'resources', filename)
}

const iconConnectedPath = resourcePath('htp1-remote-connected.ico')
const iconDisconnectedPath = resourcePath('htp1-remote-disconnected.ico')

function makeIcon(p) {
  return nativeImage.createFromPath(p)
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    title: baseTitle,
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, '../preload/index.mjs'),
    },
    icon: iconDisconnectedPath,
  })

  mainWindow.on('minimize', (event) => {
    event.preventDefault()
    mainWindow?.hide()
  })

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault()
      mainWindow?.hide()
      return
    }
  })

  mainWindow.removeMenu()

  const devUrl = process.env.ELECTRON_RENDERER_URL

  if (devUrl) {
    await mainWindow.loadURL(devUrl)
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))

    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify()

      autoUpdater.on('update-downloaded', (updateInfo) => {
        mainWindow?.webContents.send('readyToInstall', updateInfo)
      })

      ipcMain.on('installUpdateRequested', () => {
        autoUpdater.quitAndInstall()
      })
    }
  }
}

function setTrayStatusConnected() {
  tray?.setImage(makeIcon(iconConnectedPath))
  mainWindow?.setIcon(iconConnectedPath)
  const title = `${baseTitle} - Connected`
  mainWindow?.setTitle(title)
  tray?.setToolTip(title)
}

function setTrayStatusDisconnected() {
  tray?.setImage(makeIcon(iconDisconnectedPath))
  mainWindow?.setIcon(iconDisconnectedPath)
  const title = `${baseTitle} - Disconnected`
  mainWindow?.setTitle(title)
  tray?.setToolTip(title)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) void createWindow()
})

app.whenReady().then(async () => {
  tray = new Tray(makeIcon(iconDisconnectedPath))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        mainWindow?.show()
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    mainWindow?.show()
  })

  ipcMain.on('connected', (_e, isConnected) => {
    if (isConnected) setTrayStatusConnected()
    else setTrayStatusDisconnected()
  })

  if (app.isPackaged) {
    const autoLaunch = new AutoLaunch({
      name: baseTitle,
      path: app.getPath('exe'),
    })

    ipcMain.on('runOnSystemStartupChanged', async (_e, enableAutoLaunch) => {
      try {
        const currentlyEnabled = await autoLaunch.isEnabled()
        if (enableAutoLaunch && !currentlyEnabled) await autoLaunch.enable()
        if (!enableAutoLaunch && currentlyEnabled) await autoLaunch.disable()
      } catch (e) {
        console.error(e)
      }
    })
  }

  await createWindow()
})

if (isDev) {
  process.on('SIGTERM', () => app.quit())
  process.on('SIGINT', () => app.quit())
}
