import React from 'react'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  File,
  FolderSearch,
  FolderPlus,
  FilePlusIcon,
  RefreshCcw,
  MoreVertical
} from 'lucide-react'
import { useFile } from '@renderer/context/FileContext'
import FileManagerActions from './FileManagerActions'
import FileContextMenu from './FileContextMenu'

type FileItem = {
  name: string
  path: string
  isDirectory: boolean
}

export default function FolderViewer() {
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [selected, setSelected] = React.useState<FileItem | null>(null)
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const [fileContents, setFileContents] = React.useState<{ [path: string]: FileItem[] }>({})
  const [currentFolderPath, setCurrentFolderPath] = React.useState<string>(
    window.localStorage.getItem('texteditor-lastfolder') || ''
  )
  const [contextMenu, setContextMenu] = React.useState<{
    x: number
    y: number
    filePath: string
    isDirectory: boolean
  } | null>(null)

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      filePath: file.path,
      isDirectory: file.isDirectory
    })
  }

  React.useEffect(() => {
    refreshFolder()
  }, [])

  const refreshFolder = async () => {
    const result = await window.electron.refreshFolder(currentFolderPath)
    setFiles(result?.files || [])
    setCurrentFolderPath(result?.folderPath || '')
    setExpanded(new Set())
    setFileContents({})
    setSelected(null)
  }

  const { loadFile } = useFile()

  const openFolder = async () => {
    const result = await window.electron.openFolder()
    window.localStorage.setItem('texteditor-lastfolder', result?.folderPath || '')
    setFiles(result?.files || [])
    setSelected(null)
    setExpanded(new Set())
    setFileContents({})
    setCurrentFolderPath(result?.folderPath || '')
  }

  const loadDirectory = async (dirPath: string) => {
    if (fileContents[dirPath]) return

    const contents = await window.electron.readDirectory(dirPath)
    setFileContents((prev) => ({ ...prev, [dirPath]: contents }))
  }

  const toggleExpand = async (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation()

    const isExpanded = expanded.has(file.path)

    setExpanded((prev) => {
      const next = new Set(prev)
      if (isExpanded) {
        next.delete(file.path)
      } else {
        next.add(file.path)
      }
      return next
    })

    if (!isExpanded && file.isDirectory) {
      await loadDirectory(file.path)
    }
  }

  const onFileClick = async (file: FileItem) => {
    setSelected(file)

    if (!file.isDirectory) {
      await loadFile(file.path)
    }
  }

  const renderFiles = (items: FileItem[], level = 0): React.ReactNode => {
    return items.map((file) => {
      const isExpanded = expanded.has(file.path)
      const isSelected = selected?.path === file.path
      const children = fileContents[file.path] || []

      return (
        <div key={file.path}>
          <div
            onClick={(e) => {
              onFileClick(file)
              file.isDirectory && toggleExpand(file, e)
            }}
            className={`flex items-center text-gray-900 dark:text-gray-100 gap-1 px-2 py-0.5 cursor-pointer ${
              isSelected
                ? 'bg-neutral-300 text-black dark:bg-neutral-600 dark:text-gray-100'
                : 'text-gray-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            {file.isDirectory ? (
              isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )
            ) : (
              <div style={{ width: 14, height: 14 }} />
            )}
            {file.isDirectory ? (
              <Folder size={16} className="text-blue-600 dark:text-blue-400" />
            ) : (
              <File size={16} className="text-gray-600 dark:text-gray-400" />
            )}
            <span className="text-sm truncate text-gray-600 dark:text-gray-100">{file.name}</span>
          </div>
          {isExpanded && children.length > 0 && <div>{renderFiles(children, level + 1)}</div>}
        </div>
      )
    })
  }

  return (
    <div className="w-64 flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-end">
          <FileManagerActions currentPath={currentFolderPath} onRefresh={refreshFolder} />
          <button
            onClick={openFolder}
            className="px-2 py-2 hover:bg-blue-700/30 rounded-full text-sm font-medium transition-colors"
          >
            <FolderSearch size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {files.length > 0 ? (
          <div className="py-1">{renderFiles(files)}</div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Kein Ordner geöffnet
          </div>
        )}
      </div>
    </div>
  )
}
