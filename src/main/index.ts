import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

let mainWindow: BrowserWindow | null = null

function readDirRecursive(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  return entries
    .filter((e) => e.isDirectory() || e.name.endsWith('.txt'))
    .map((e) => {
      const fullPath = path.join(dir, e.name)

      if (e.isDirectory()) {
        return {
          type: 'folder',
          name: e.name,
          path: fullPath,
          children: readDirRecursive(fullPath)
        }
      }

      return {
        type: 'file',
        name: e.name,
        path: fullPath
      }
    })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    icon: path.join(__dirname, '../renderer/src/assets/editor-logo.png'),
    title: 'Text Editor',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  // In Produktion: mainWindow.loadFile('index.html')
  // In Entwicklung: mainWindow.loadURL('http://localhost:3000')
  mainWindow.loadURL('http://localhost:5173')

  // Menü erstellen
  createMenu()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createMenu() {
  const template: any = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-file')
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu-open-file')
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu-save-file')
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC Handlers
// ==================== WINDOW CONTROLS ====================
ipcMain.handle('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('window-close', () => {
  mainWindow?.close()
})

// ==================== FILE OPERATIONS ====================

// Hauptordner öffnen (Dialog)
ipcMain.handle('open-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (result.canceled || result.filePaths.length === 0) {
    return []
  }
  const folderPath = result.filePaths[0]
  const files = fs.readdirSync(folderPath).map((file) => ({
    name: file,
    path: path.join(folderPath, file),
    isDirectory: fs.statSync(path.join(folderPath, file)).isDirectory()
  }))
  return files
})

// Unterordner lesen (für expandierbare Ordnerstruktur)
ipcMain.handle('read-directory', async (event, dirPath: string) => {
  try {
    const files = fs.readdirSync(dirPath).map((file) => {
      const fullPath = path.join(dirPath, file)
      const stats = fs.statSync(fullPath)
      return {
        name: file,
        path: fullPath,
        isDirectory: stats.isDirectory()
      }
    })
    return files
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
})

// Dateibaum rekursiv lesen
ipcMain.handle('read-tree', async (event, dirPath: string) => {
  try {
    const readDirRecursive = (dir: string): any[] => {
      const items = fs.readdirSync(dir)
      const result: any[] = []

      items.forEach((item) => {
        const fullPath = path.join(dir, item)
        const stats = fs.statSync(fullPath)

        const fileItem = {
          name: item,
          path: fullPath,
          isDirectory: stats.isDirectory()
        }

        result.push(fileItem)
      })

      return result
    }

    return readDirRecursive(dirPath)
  } catch (error) {
    console.error('Error reading tree:', error)
    return []
  }
})

// Textdatei lesen
ipcMain.handle('read-file', async (event, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { success: true, content }
  } catch (error: any) {
    console.error('Error reading file:', error)
    return { success: false, error: error.message }
  }
})

// Textdatei schreiben
ipcMain.handle('write-file', async (event, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  } catch (error: any) {
    console.error('Error writing file:', error)
    return { success: false, error: error.message }
  }
})

// Datei direkt öffnen (gibt Pfad zurück)
ipcMain.handle('open-file', async (event, filePath: string) => {
  try {
    return filePath
  } catch (error) {
    console.error('Error opening file:', error)
    return ''
  }
})

// ==================== WORKSPACE MANAGEMENT ====================

// Workspace-Ordner hinzufügen
ipcMain.handle('add-workspace-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  return result.filePaths[0]
})

// Ordner aus Workspace entfernen
ipcMain.handle('remove-folder', async (event, folderPath: string) => {
  try {
    // Hier könntest du z.B. eine Liste von Workspace-Ordnern in einer Config speichern
    return { success: true, path: folderPath }
  } catch (error: any) {
    console.error('Error removing folder:', error)
    return { success: false, error: error.message }
  }
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('window:minimize', () => {
  BrowserWindow.getFocusedWindow()?.minimize()
})

ipcMain.on('window:maximize', () => {
  const win = BrowserWindow.getFocusedWindow()
  if (!win) return
  win.isMaximized() ? win.unmaximize() : win.maximize()
})

ipcMain.on('window:close', () => {
  BrowserWindow.getFocusedWindow()?.close()
})
