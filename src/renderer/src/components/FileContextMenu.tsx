import { Trash2, Edit2 } from 'lucide-react'

export interface FileContextMenuProps {
  x: number
  y: number
  filePath: string
  isDirectory: boolean
  onClose?: () => void
  onRefresh?: () => void
}

export default function FileContextMenu({
  x,
  y,
  filePath,
  isDirectory,
  onClose,
  onRefresh
}: FileContextMenuProps) {
  const handleDelete = async () => {
    if (!window.electron) return

    const confirmed = confirm(
      `Möchten Sie ${isDirectory ? 'den Ordner' : 'die Datei'} ${filePath.split('\\').pop()} wirklich löschen?`
    )
    if (!confirmed) {
      onClose!()
      return
    }

    const result = isDirectory
      ? await window.electron.deleteFolder(filePath)
      : await window.electron.deleteFile(filePath)

    if (result.success) {
      onRefresh!()
    } else {
      alert('Fehler beim Löschen: ' + result.error)
    }
    onClose!()
  }

  const handleRename = async () => {
    const currentName = filePath.split('/').pop() || ''
    const newName = prompt('Neuer Name:', currentName)

    if (!newName || newName === currentName || !window.electron) {
      onClose!()
      return
    }

    const result = await window.electron.renameFile(filePath, newName)
    if (result.success) {
      onRefresh!()
    } else {
      alert('Fehler beim Umbenennen: ' + result.error)
    }
    onClose!()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Context Menu */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl py-1 min-w-[180px]"
        style={{ left: x, top: y }}
      >
        <button
          onClick={handleRename}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-900 dark:text-gray-100"
        >
          <Edit2 size={14} />
          Umbenennen
        </button>
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
        >
          <Trash2 size={14} />
          Löschen
        </button>
      </div>
    </>
  )
}
