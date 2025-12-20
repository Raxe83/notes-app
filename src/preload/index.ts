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
  },

  // IPC Renderer (falls direkt benötigt)
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    on: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    },
    once: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.once(channel, (event, ...args) => func(...args))
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, func)
    }
  }
})
