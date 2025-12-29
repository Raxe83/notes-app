import {
  Save,
  Moon,
  Sun,
  Minus,
  Plus,
  Maximize2,
  Minimize2,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Highlighter
} from 'lucide-react'
import Button from './ui/Button'
import { Separator } from './ui/Seperator'
import { Switch } from './ui/Switch'
import { useEditor } from '@renderer/context/EditorContext'
import { useFile } from '@renderer/context/FileContext'

export default function Toolbar() {
  const { saveFile, newFile } = useFile()
  const {
    isDarkMode,
    fontSize,
    isFullscreen,
    isSidebarOpen,
    toggleDarkMode,
    increaseFontSize,
    decreaseFontSize,
    toggleFullscreen,
    toggleSidebar
  } = useEditor()

  const handleElectronOpen = async () => {
    if (!window.electron) return

    const result = await window.electron.openFolder()
    if (result && result.files.length > 0) {
      // Wenn ein Ordner geöffnet wurde, wird das von der FolderViewer Komponente behandelt
      console.log('Ordner geöffnet:', result)
    }
  }

  return (
    <div className="border-b bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <ChevronRight
              className={`h-4 w-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
            />
          </Button>
          <Button variant="ghost" size="icon" onClick={saveFile}>
            <Save className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={newFile}>
            <Bold className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleElectronOpen}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleElectronOpen}>
            <Underline className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleElectronOpen}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleElectronOpen}>
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleElectronOpen}>
            <Highlighter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={decreaseFontSize}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-10 text-center dark:text-gray-100">
              {fontSize}px
            </span>
            <Button variant="ghost" size="icon" onClick={increaseFontSize}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-muted-foreground dark:text-gray-100" />
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            <Moon className="h-4 w-4 text-muted-foreground dark:text-gray-100" />
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
