import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { release } from 'os'
import { join } from 'path'
import rulocale from './rulocale'
import enlocale from './enlocale'
import trlocale from './trlocale'
import eslocale from './eslocale'
const Store = require('electron-store');
const store = new Store();

const init = async () => {
  //if (!(store.get('lngs'))) {
    const locales = [{ locale: 'en', translation: enlocale }, { locale: 'es', translation: eslocale }, { locale: 'ru', translation: rulocale }, { locale: 'tr', translation: trlocale }];

    let mobj, obj, lngs
    let locale
    mobj = {}
    lngs = []
    for (let row of locales) {
      obj = {}
      for (let prop in row) {
        if (prop == 'locale') {
          locale = row[prop]
          lngs.push(row[prop])
          mobj = Object.assign(mobj, { [locale]: {} })
        }
        else if (prop == 'translation') {
          obj = Object.assign(obj, { [prop]: row[prop] })
        }
      }
      mobj[locale] = obj
    }
    store.set('lngs', lngs);
    store.set('locales', mobj);
    store.set('lng', 'ru');
  //}
  if (!(store.get('groups'))) store.set('groups', [{ id: 1, name: 'Группа 1' }]);
  if (!(store.get('machines'))) store.set('machines', [{ id: 1, name: 'Станок 1', ip: '192.168.1.2', groupId: 1 }]);

}
init();
// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, '../..'),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`
const indexHtml = join(ROOT_PATH.dist, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'BloomConn',
    icon: join(ROOT_PATH.public, 'icon.ico'),
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  })
  win.setBackgroundColor('#282c34');
  if (app.isPackaged) {
    win.loadFile(indexHtml)
  } else {
    win.loadURL(url)
    //win.webContents.openDevTools()
  }
  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
process.on("uncaughtException", (err) => {
  console.log(err);
});

ipcMain.on('minimize', () => {
  win?.minimize()
})

ipcMain.on('close', () => {
  win?.close()
})
// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    },
  })

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg })
  } else {
    childWindow.loadURL(`${url}#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})
