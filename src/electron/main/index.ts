import { app, BrowserWindow, shell, ipcMain, session } from "electron"
import windowStateKeeper from 'electron-window-state'
import { join } from 'path'
import https from 'https'
import fs from 'fs'

process.env.DIST = join(__dirname, '../..')
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : join(process.env.DIST, '../public')

// // Disable GPU Acceleration for Windows 7
// if (release().startsWith("6.1")) app.disableHardwareAcceleration()
// Disable GPU Acceleration for all, to reduce VRAM usage.
// app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') {
  app.setAppUserModelId(app.getName())
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

process.on('unhandledRejection', (error) => {
  console.error(error)
})

/* ------------ window management ------------ */

let win: BrowserWindow | null = null
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL as string
const indexHtml = join(process.env.DIST, 'index.html')

const onAppReady = () => {
}

const exitApp = () => {
}

const createWindow = async () => {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  })

  win = new BrowserWindow({
    title: 'SDFX',
    titleBarStyle: process.platform === 'win32' ? 'hidden' : null,
    transparent: process.platform === 'win32' ? true : false,

    //icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },

    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,

    minWidth: 780,
    minHeight: 512
  })

  win.show()

  mainWindowState.manage(win)

  if (app.isPackaged) {
    win.loadFile(indexHtml)
  } else {
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools({ mode: "undocked", activate: true })
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  // remember to include target="_blank" in anchor link to ensure this happen
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("http:")) {
      shell.openExternal(url)
    }

    return { action: "deny" }
  })
}

function makeSingleInstance () {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}

makeSingleInstance()
app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  win = null
  if (process.platform !== "drawin") {
    app.quit()
  }
})

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

app.on("ready", onAppReady)
app.on("will-quit", exitApp)

/* --------------- */

ipcMain.on('loadJSON', (e, filename) => {
  const pathToFile = filename.replace("file:\\\\",'').replace(/\\/,'\\\\')

  fs.readFile(pathToFile, 'utf8', (error, data) => {
    win.webContents.send("loadedJSON", data)
  })
})

ipcMain.on('saveJSON', (e, filename, txt) => {
  fs.writeFile(filename, txt, (err) => {
    if (err) throw err
    win.webContents.send("savedJSON", txt)
    console.log('JSON file written to drive')
  })
})

ipcMain.on('setAlwaysOnTop', (flag) => {
  win.setAlwaysOnTop(flag)
})

ipcMain.on('setFullScreen', (flag) => {
  win.setFullScreen(flag)
})

ipcMain.on('setAspectRatio', (ar) => {
  win.setAspectRatio(ar)
})

ipcMain.on('minimize', () => {
  win.isMinimized() ? win.restore() : win.minimize()
})

ipcMain.on('maximize', () => {
  win.isMaximized() ? win.restore() : win.maximize()
})


// new window example arg: new windows url
/*
ipcMain.handle("open-win", (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    }
  })

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg })
  } else {
    childWindow.loadURL(`${url}/#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})
*/