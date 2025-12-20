export interface IElectronAPI {
  ipcRenderer: any
  minimize: () => void
  maximize: () => void
  close: () => void
  addWorkspaceFolder: () => Promise<any>
  readTree: (path: string) => Promise<any>
  removeFolder: (path: string) => Promise<any>
  openFolder: () => Promise<FileItem[]>
  openFile: (path: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  readDirectory: (dirPath: string) => Promise<FileItem[]>
  onMenuNewFile: (callback: () => void) => void
  onMenuOpenFile: (callback: () => void) => void
  onMenuSaveFile: (callback: () => void) => void
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