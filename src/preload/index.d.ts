export interface IElectronAPI {
  ipcRenderer: any
  minimize: () => void
  maximize: () => void
  close: () => void
  addWorkspaceFolder: () => Promise<any>
  readTree: (path: string) => Promise<any>
  removeFolder: (path: string) => Promise<any>
  openFolder: () => Promise<{
    folderPath: string
    files: {
      name: string
      path: string
      isDirectory: boolean
    }[]
  } | null>
  openFile: (path: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  readDirectory: (dirPath: string) => Promise<FileItem[]>
  createFile: (
    dirPath: string,
    fileName: string
  ) => Promise<{ success: boolean; path?: string; error?: string }>
  createFolder: (
    dirPath: string,
    folderName: string
  ) => Promise<{ success: boolean; path?: string; error?: string }>
  deleteFile: (filePath: string) => Promise<{ success: boolean; error?: string }>
  deleteFolder: (folderPath: string) => Promise<{ success: boolean; error?: string }>
  moveFile: (source: string, target: string) => Promise<any>
  pathExists: (p: string) => Promise<any>
  refreshFolder: (folderPath: string) => Promise<{
    folderPath: string
    files: {
      name: string
      path: string
      isDirectory: boolean
    }[]
  } | null>
  renameFile: (
    oldPath: string,
    newName: string
  ) => Promise<{ success: boolean; path?: string; error?: string }>
  onMenuNewFile: (callback: () => void) => void
  onMenuOpenFile: (callback: () => void) => void
  onMenuSaveFile: (callback: () => void) => void
  showContextMenu: (file: any) => void
  onContextOpen: (cb: (file: any) => void) => void
  onContextRename: (cb: (file: any) => void) => void
  onContextDelete: (cb: (file: any) => void) => void
}

export type FileItem = {
  name: string
  path: string
  isDirectory: boolean
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
}
