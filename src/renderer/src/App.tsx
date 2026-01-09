'use client'

import { useEffect } from 'react'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import EditorArea from './components/EditorArea'
import { EditorProvider } from '@renderer/context/EditorContext'
import { FileProvider, useFile } from '@renderer/context/FileContext'

function AppContent() {
  const { newFile, saveFile, content, isDirty, currentFile } = useFile()

  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if ((e.ctrlKey) && e.key.toLowerCase() === 's') {
  //       e.preventDefault()
  //       saveFile()
  //     }
  //   }

  //   window.addEventListener('keydown', handleKeyDown)
  //   return () => window.removeEventListener('keydown', handleKeyDown)
  // }, [])

  // Setup Electron menu listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.onMenuNewFile(() => newFile())
      window.electron.onMenuOpenFile(async () => {
        const result = await window.electron.openFolder()
        if (result) {
          // Handled by FolderViewer component
        }
      })
      window.electron.onMenuSaveFile(() => saveFile())
    }
  }, [content, currentFile, isDirty])

  return (
    <EditorProvider content={content}>
      <div className="flex flex-col h-screen w-screen">
        <TopBar />
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
          <Sidebar />

          <div className="flex flex-col flex-1 overflow-hidden">
            <EditorArea />
          </div>
        </div>
      </div>
    </EditorProvider>
  )
}

export default function App() {
  return (
    <FileProvider>
      <AppContent />
    </FileProvider>
  )
}
