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
  Type,
  Code,
  CodeXml
} from 'lucide-react'
import Button from './ui/Button'
import { Separator } from './ui/Seperator'
import { Switch } from './ui/Switch'
import { useEditor } from '@renderer/context/EditorContext'
import { useFile } from '@renderer/context/FileContext'

interface ToolbarProps {
  boldFunction: () => void
  italicFunction: () => void
  underlineFunction: () => void
  headerFunction: () => void
  unorderedListFunction: () => void
  orderedListFunction: () => void
  codeFunction: () => void
  codeBlockFunction: () => void
}

export function getActiveFormats() {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) {
    return { bold: false, italic: false, underline: false }
  }

  let node: Node | null = sel.anchorNode
  if (!node) return { bold: false, italic: false, underline: false }

  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode
  }

  let bold = false
  let italic = false
  let underline = false
  let header = false
  let ul = false
  let ol = false
  let code = false
  let pre = false

  while (node && node instanceof HTMLElement) {
    const tag = node.tagName
    if (tag === 'STRONG' || tag === 'B') bold = true
    if (tag === 'EM' || tag === 'I') italic = true
    if (tag === 'U') underline = true
    if (tag === 'H1' || tag === 'H2' || tag === 'H3') header = true
    if (tag === 'UL') ul = true
    if (tag === 'OL') ol = true
    if (tag === 'CODE') code = true
    if (tag === 'PRE') pre = true
    node = node.parentElement
  }

  return { bold, italic, underline, header, ul, ol, code, pre }
}

export default function Toolbar({
  boldFunction,
  italicFunction,
  underlineFunction,
  headerFunction,
  unorderedListFunction,
  orderedListFunction,
  codeFunction,
  codeBlockFunction
}: ToolbarProps) {
  const { saveFile } = useFile()
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

  const formats = getActiveFormats()

  return (
    <div className="border-b bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          {/* Toggle Sidebar */}
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <ChevronRight
              className={`h-4 w-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
            />
          </Button>
          {/* Save */}
          <Button variant="ghost" size="icon" onClick={saveFile}>
            <Save className="h-4 w-4" />
          </Button>
          {/* Bold */}
          <Button isActive={formats.bold} variant="ghost" size="icon" onClick={boldFunction}>
            <Bold className="h-4 w-4" />
          </Button>
          {/* Italic */}
          <Button isActive={formats.italic} variant="ghost" size="icon" onClick={italicFunction}>
            <Italic className="h-4 w-4" />
          </Button>
          {/* Underline */}
          <Button
            isActive={formats.underline}
            variant="ghost"
            size="icon"
            onClick={underlineFunction}
          >
            <Underline className="h-4 w-4" />
          </Button>
          {/* Heading */}
          <Button isActive={formats.header} variant="ghost" size="icon" onClick={headerFunction}>
            <Type className="h-4 w-4" />
            <span className="text-xs">H</span>
          </Button>
          {/* Unordered List */}
          <Button isActive={formats.ul} variant="ghost" size="icon" onClick={unorderedListFunction}>
            <List className="h-4 w-4" />
          </Button>
          {/* Ordered List */}
          <Button isActive={formats.ol} variant="ghost" size="icon" onClick={orderedListFunction}>
            <ListOrdered className="h-4 w-4" />
          </Button>
          {/* Highlighter */}
          {/* <Button variant="ghost" size="icon" onClick={handleElectronOpen}>
            <Highlighter className="h-4 w-4" />
          </Button> */}

          {/* Inline Code */}
          <Button isActive={formats.code} variant="ghost" size="icon" onClick={codeFunction}>
            <Code className="h-5 w-5" />
          </Button>
          {/* Block Code */}
          <Button isActive={formats.pre} variant="ghost" size="icon" onClick={codeBlockFunction}>
            <CodeXml className="h-5 w-5" />
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
