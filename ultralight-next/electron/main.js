'use strict'

const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const { startServer } = require('./server')

let mainWindow = null
let server = null

async function createWindow() {
  const outDir = path.join(__dirname, '..', 'out')
  server = await startServer(outDir)
  const port = server.address().port

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 620,
    backgroundColor: '#f3f4f6',
    icon: path.join(__dirname, '..', 'public', 'icon-512.png'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  Menu.setApplicationMenu(null)
  mainWindow.loadURL(`http://127.0.0.1:${port}`)

  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (server) server.close()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
