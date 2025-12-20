import React, { createContext, useContext, useState, useEffect } from 'react'

export interface FileItem {
  id: string
  name: string
  content: string
  path?: string
  modified: Date
  isDirectory?: boolean
}

type FileContextType = {
  currentFile: FileItem | null
  content: string
  isDirty: boolean
  recentFiles: FileItem[]
  setCurrentFile: (file: FileItem | null) => void
  setContent: (content: string) => void
  updateContent: (content: string) => void
  saveFile: () => Promise<void>
  loadFile: (path: string) => Promise<void>
  openFile: (file: FileItem) => Promise<void>
  newFile: () => void
  deleteRecentFile: (fileId: string) => void
}

const FileContext = createContext<FileContextType | undefined>(undefined)

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null)
  const [content, setContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([])

  // Load recent files from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('texteditor-files')
    if (saved) {
      const files = JSON.parse(saved)
      setRecentFiles(files.map((f: FileItem) => ({ ...f, modified: new Date(f.modified) })))
    }
  }, [])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!currentFile || !isDirty) return

    const interval = setInterval(() => {
      saveFile()
    }, 30000)

    return () => clearInterval(interval)
  }, [currentFile, isDirty, content])

  const saveToRecent = (file: FileItem) => {
    const updated = [file, ...recentFiles.filter((f) => f.id !== file.id)].slice(0, 10)
    setRecentFiles(updated)
    localStorage.setItem('texteditor-files', JSON.stringify(updated))
  }

  const updateContent = (newContent: string) => {
    setContent(newContent)
    setIsDirty(true)
  }

  const saveFile = async () => {
    if (!window.electron) return

    if (!currentFile?.path) {
      alert('Keine Datei zum Speichern ausgewählt')
      return
    }

    const result = await window.electron.writeFile(currentFile.path, content)
    if (result.success) {
      const savedFile: FileItem = {
        id: currentFile?.id || Date.now().toString(),
        name: currentFile.name,
        path: currentFile.path,
        content,
        modified: new Date()
      }
      setCurrentFile(savedFile)
      saveToRecent(savedFile)
      setIsDirty(false)
    } else {
      alert('Fehler beim Speichern: ' + result.error)
    }
  }

  const loadFile = async (path: string) => {
    if (!window.electron) return

    const result = await window.electron.readFile(path)
    if (result.success && result.content !== undefined) {
      setContent(result.content)
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: path.split('/').pop() || 'Untitled',
        path,
        content: result.content,
        modified: new Date()
      }
      setCurrentFile(newFile)
      saveToRecent(newFile)
      setIsDirty(false)
    }
  }

  const openFile = async (file: FileItem) => {
    if (isDirty && !confirm('You have unsaved changes. Continue?')) return

    if (file.path && window.electron) {
      const result = await window.electron.readFile(file.path)
      if (result.success && result.content) {
        setContent(result.content)
        setCurrentFile({ ...file, content: result.content })
        setIsDirty(false)
        return
      }
    }

    setContent(file.content)
    setCurrentFile(file)
    setIsDirty(false)
  }

  const newFile = () => {
    if (isDirty && !confirm('You have unsaved changes. Continue?')) return
    setContent('')
    setCurrentFile(null)
    setIsDirty(false)
  }

  const deleteRecentFile = (fileId: string) => {
    const updated = recentFiles.filter((f) => f.id !== fileId)
    setRecentFiles(updated)
    localStorage.setItem('texteditor-files', JSON.stringify(updated))
  }

  return (
    <FileContext.Provider
      value={{
        currentFile,
        content,
        isDirty,
        recentFiles,
        setCurrentFile,
        setContent,
        updateContent,
        saveFile,
        loadFile,
        openFile,
        newFile,
        deleteRecentFile
      }}
    >
      {children}
    </FileContext.Provider>
  )
}

export function useFile() {
  const context = useContext(FileContext)
  if (!context) {
    throw new Error('useFile must be used within FileProvider')
  }
  return context
}