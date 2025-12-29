import React from 'react'
import { ChevronRight, ChevronDown, Folder, File, FolderSearch } from 'lucide-react'
import { useFile } from '@renderer/context/FileContext'
import FileManagerActions from './FileManagerActions'
// import FileContextMenu, { FileContextMenuProps } from './FileContextMenu'

export type FileItem = {
  name: string
  path: string
  isDirectory: boolean
}

export default function FolderViewer() {
  const rootPath = localStorage.getItem('texteditor-lastfolder') || ''
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [selected, setSelected] = React.useState<FileItem | null>(null)
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    const raw = localStorage.getItem('editor-expanded-folders')
    if (!raw) return new Set()
    try {
      return new Set(JSON.parse(raw))
    } catch {
      return new Set()
    }
  })
  const [fileContents, setFileContents] = React.useState<{ [path: string]: FileItem[] }>({})
  const [currentFolderPath, setCurrentFolderPath] = React.useState<string>(
    window.localStorage.getItem('texteditor-lastfolder') || ''
  )
  const [draggedFile, setDraggedFile] = React.useState<FileItem | null>(null)
  const [hoveredDropTarget, setHoveredDropTarget] = React.useState<string | null>(null)

  // const [contextMenu, setContextMenu] = React.useState<FileContextMenuProps | null>(null)

  const parentFolder = currentFolderPath
    ? currentFolderPath.substring(currentFolderPath.lastIndexOf('\\') + 1)
    : ''

  const { loadFile } = useFile()

  React.useEffect(() => {
    refreshFolder()
  }, [])

  React.useEffect(() => {
    expanded.forEach((path) => {
      loadDirectory(path)
    })
  }, [expanded])

  const refreshFolder = async () => {
    const expandedBefore = new Set(expanded)
    setSelected(null)
    setFileContents({})

    const result = await window.electron.refreshFolder(
      localStorage.getItem('texteditor-lastfolder') || ''
    )

    setFiles(result?.files || [])
    setCurrentFolderPath(result?.folderPath || '')

    setExpanded(expandedBefore)

    expandedBefore.forEach((path) => {
      loadDirectory(path)
    })
  }

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
    const exists = await window.electron.pathExists(dirPath)
    if (!exists) return

    const contents = await window.electron.readDirectory(dirPath)
    setFileContents((prev) => ({
      ...prev,
      [dirPath]: contents
    }))
  }

  const toggleExpand = (file: FileItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(file.path) ? next.delete(file.path) : next.add(file.path)
      localStorage.setItem('editor-expanded-folders', JSON.stringify([...next]))
      return next
    })
  }

  const onFileClick = async (file: FileItem) => {
    setSelected(file)
    if (file.isDirectory) {
      setCurrentFolderPath(file.path)
    }
    if (!file.isDirectory) {
      await loadFile(file.path)
      const folderPath = file.path.substring(0, file.path.lastIndexOf('\\'))
      setCurrentFolderPath(folderPath || '')
    }
  }

  React.useEffect(() => {
    if (!draggedFile) {
      setHoveredDropTarget(null)
    }
  }, [draggedFile])

  const renderFiles = (items: FileItem[], level = 0): React.ReactNode => {
    return items.map((file) => {
      const isExpanded = expanded.has(file.path)
      const children = fileContents[file.path] || []
      const isHovered = hoveredDropTarget === file.path

      return (
        <div
          key={file.path}
          className="relative"
          onDragOver={(e) => {
            if (file.isDirectory) {
              e.preventDefault()
              e.stopPropagation()
              if (hoveredDropTarget !== file.path) setHoveredDropTarget(file.path)
            }
          }}
          onDragLeave={() => {
            if (file.isDirectory && hoveredDropTarget === file.path) {
              setHoveredDropTarget(null)
            }
          }}
          onDrop={async (e) => {
            if (!file.isDirectory) return

            e.preventDefault()
            e.stopPropagation()

            if (!draggedFile) return
            if (draggedFile.path === file.path) return

            const result = await window.electron.moveFile(draggedFile.path, file.path)

            if (result.success) {
              await refreshFolder()
            }

            setDraggedFile(null)
            setHoveredDropTarget(null)
          }}
        >
          {/* ORDNER DROPZONE - nur visuell */}
          {file.isDirectory && draggedFile && isHovered && (
            <div className="absolute inset-0 rounded z-30 bg-blue-500/20 pointer-events-none" />
          )}

          {/* VISUELLER ORDNER / DATEI */}
          <div
            draggable
            onDragStart={() => {
              setDraggedFile(file)
            }}
            onClick={(e) => {
              onFileClick(file)
              file.isDirectory && toggleExpand(file, e)
            }}
            className={`relative z-20 flex items-center gap-1 px-2 py-0.5 cursor-pointer select-none hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
              selected?.path === file.path
                ? 'bg-neutral-300 text-black dark:bg-neutral-600 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-100'
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            {/* Icons */}
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
            <span className="text-sm truncate">{file.name}</span>
          </div>
          {/* Child files rekursiv */}
          {isExpanded && children.length > 0 && renderFiles(children, level + 1)}
        </div>
      )
    })
  }

  return (
    <div className="w-64 flex flex-col border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-end items-center">
        <h2 className="mt-1 mr-2 font-semibold text-gray-700 dark:text-gray-200">{parentFolder}</h2>
        <FileManagerActions
          currentPath={currentFolderPath}
          onRefresh={refreshFolder}
          setSelected={setSelected}
        />
        <button
          onClick={openFolder}
          className="px-2 py-2 hover:bg-blue-700/30 rounded-full text-sm font-medium transition-colors"
        >
          <FolderSearch size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Root Dropzone + File Tree */}
      <div
        className="relative flex-1 overflow-y-auto max-h-[calc(100vh-13rem)] border-b border-gray-200 dark:border-gray-700"
        onDragOver={(e) => {
          e.preventDefault()
        }}
        onDrop={async (e) => {
          e.preventDefault()
          if (!draggedFile) return

          if (hoveredDropTarget !== null) return

          const result = await window.electron.moveFile(draggedFile.path, rootPath)

          if (result.success) refreshFolder()
          setDraggedFile(null)
        }}
      >
        {/* Root Dropzone Visual Feedback */}
        {draggedFile && hoveredDropTarget === null && (
          <div className="absolute inset-0 z-20 bg-blue-500/10 pointer-events-none" />
        )}
        {/* File Tree oder "kein Ordner geoeffnet" */}
        {files.length > 0 ? (
          <div className="py-1 relative z-10">
            {renderFiles(
              files.sort((a, b) => {
                if (a.isDirectory === b.isDirectory) {
                  return a.name.localeCompare(b.name)
                }
                return a.isDirectory ? -1 : 1
              })
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Kein Ordner geöffnet
          </div>
        )}
      </div>
    </div>
  )
}
