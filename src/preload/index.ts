import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),

  // File operations
  openFolder: () => ipcRenderer.invoke('open-folder'),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
  readTree: (path: string) => ipcRenderer.invoke('read-tree', path),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('write-file', filePath, content),
  openFile: (path: string) => ipcRenderer.invoke('open-file', path),
   // Create/Delete operations
  createFile: (dirPath: string, fileName: string) => 
    ipcRenderer.invoke('create-file', dirPath, fileName),
  createFolder: (dirPath: string, folderName: string) => 
    ipcRenderer.invoke('create-folder', dirPath, folderName),
  deleteFile: (filePath: string) => 
    ipcRenderer.invoke('delete-file', filePath),
  deleteFolder: (folderPath: string) => 
    ipcRenderer.invoke('delete-folder', folderPath),
  refreshFolder: (folderPath: string) => 
    ipcRenderer.invoke('refresh-folder', folderPath),
  renameFile: (oldPath: string, newName: string) => 
    ipcRenderer.invoke('rename-file', oldPath, newName),
  
  // Workspace management
  addWorkspaceFolder: () => ipcRenderer.invoke('add-workspace-folder'),
  removeFolder: (path: string) => ipcRenderer.invoke('remove-folder', path),

  // Menu listeners
  onMenuNewFile: (callback: () => void) => {
    ipcRenderer.on('menu-new-file', callback)
  },
  onMenuOpenFile: (callback: () => void) => {
    ipcRenderer.on('menu-open-file', callback)
  },
  onMenuSaveFile: (callback: () => void) => {
    ipcRenderer.on('menu-save-file', callback)
  }
})
