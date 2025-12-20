import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

let mainWindow: BrowserWindow | null = null

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
    return null
  }

  const folderPath = result.filePaths[0]

  const files = fs.readdirSync(folderPath).map((file) => ({
    name: file,
    path: path.join(folderPath, file),
    isDirectory: fs.statSync(path.join(folderPath, file)).isDirectory()
  }))

  return {
    folderPath,
    files
  }
})

ipcMain.handle('refresh-folder', async (event, folderPath: string) => {
  try {
    const files = fs.readdirSync(folderPath).map((file) => ({
      name: file,
      path: path.join(folderPath, file),
      isDirectory: fs.statSync(path.join(folderPath, file)).isDirectory()
    }))
    return { folderPath, files }
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
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
// Neue Datei erstellen
ipcMain.handle('create-file', async (event, dirPath: string, fileName: string) => {
  try {
    const filePath = path.join(dirPath, fileName)

    // Prüfen ob Datei bereits existiert
    if (fs.existsSync(filePath)) {
      return { success: false, error: 'Datei existiert bereits' }
    }

    // Leere Datei erstellen
    fs.writeFileSync(filePath, '', 'utf-8')
    return { success: true, path: filePath }
  } catch (error: any) {
    console.error('Error creating file:', error)
    return { success: false, error: error.message }
  }
})

// Neuen Ordner erstellen
ipcMain.handle('create-folder', async (event, dirPath: string, folderName: string) => {
  try {
    const folderPath = path.join(dirPath, folderName)

    // Prüfen ob Ordner bereits existiert
    if (fs.existsSync(folderPath)) {
      return { success: false, error: 'Ordner existiert bereits' }
    }

    // Ordner erstellen
    fs.mkdirSync(folderPath, { recursive: true })
    return { success: true, path: folderPath }
  } catch (error: any) {
    console.error('Error creating folder:', error)
    return { success: false, error: error.message }
  }
})
// Datei löschen
ipcMain.handle('delete-file', async (event, filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'Datei existiert nicht' }
    }

    fs.unlinkSync(filePath)
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting file:', error)
    return { success: false, error: error.message }
  }
})

// Ordner löschen (rekursiv)
ipcMain.handle('delete-folder', async (event, folderPath: string) => {
  try {
    if (!fs.existsSync(folderPath)) {
      return { success: false, error: 'Ordner existiert nicht' }
    }

    // Rekursiv löschen
    fs.rmSync(folderPath, { recursive: true, force: true })
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting folder:', error)
    return { success: false, error: error.message }
  }
})

// Datei/Ordner umbenennen
ipcMain.handle('rename-file', async (event, oldPath: string, newName: string) => {
  try {
    const dir = path.dirname(oldPath)
    const newPath = path.join(dir, newName)

    if (fs.existsSync(newPath)) {
      return { success: false, error: 'Eine Datei/Ordner mit diesem Namen existiert bereits' }
    }

    fs.renameSync(oldPath, newPath)
    return { success: true, path: newPath }
  } catch (error: any) {
    console.error('Error renaming:', error)
    return { success: false, error: error.message }
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
