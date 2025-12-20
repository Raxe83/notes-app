import React, { createContext, useContext, useState, useEffect } from 'react'

type EditorContextType = {
  isDarkMode: boolean
  fontSize: number
  isFullscreen: boolean
  isSidebarOpen: boolean
  wordCount: number
  lineCount: number
  charCount: number
  setIsDarkMode: (value: boolean) => void
  toggleDarkMode: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  toggleFullscreen: () => void
  toggleSidebar: () => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({
  children,
  content
}: {
  children: React.ReactNode
  content: string
}) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('texteditor-darkmode') === 'true'
  })

  const [fontSize, setFontSize] = useState(16)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [wordCount, setWordCount] = useState(0)
  const [lineCount, setLineCount] = useState(1)
  const [charCount, setCharCount] = useState(0)

  // Load dark mode from localStorage
  // useEffect(() => {
  //   const darkMode = window.localStorage.getItem('texteditor-darkmode')
  //   console.log('Loaded dark mode from localStorage:', darkMode)
  //   if (darkMode === 'true') {
  //     setIsDarkMode(true)
  //   } else {
  //     setIsDarkMode(false)
  //   }
  // }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev
      localStorage.setItem('texteditor-darkmode', next.toString())
      return next
    })
    console.log('Toggled dark mode to', !isDarkMode)
  }

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('texteditor-darkmode', isDarkMode.toString())
  }, [isDarkMode])

  // Update word and line count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length
    const lines = content.split('\n').length
    setWordCount(words)
    setLineCount(lines)
    setCharCount(content.length)
  }, [content])

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 32))
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 10))

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  return (
    <EditorContext.Provider
      value={{
        isDarkMode,
        fontSize,
        isFullscreen,
        isSidebarOpen,
        wordCount,
        lineCount,
        charCount,
        setIsDarkMode,
        toggleDarkMode,
        increaseFontSize,
        decreaseFontSize,
        toggleFullscreen,
        toggleSidebar
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider')
  }
  return context
}
