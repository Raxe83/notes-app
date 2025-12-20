import { useState } from 'react'
import { FilePlus, FolderPlus, RefreshCcw } from 'lucide-react'

interface FileManagerActionsProps {
  currentPath: string
  onRefresh: () => void
}

export default function FileManagerActions({ currentPath, onRefresh }: FileManagerActionsProps) {
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFolderName, setNewFolderName] = useState('')

  const handleCreateFile = async () => {
    if (!newFileName.trim() || !window.electron) return

    const result = await window.electron.createFile(currentPath, newFileName)
    if (result.success) {
      //   alert('Datei erstellt: ' + result.path)
      setNewFileName('')
      setShowNewFileDialog(false)
      onRefresh()
    } else {
      alert('Fehler: ' + result.error)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !window.electron) return

    const result = await window.electron.createFolder(currentPath, newFolderName)
    if (result.success) {
      //   alert('Ordner erstellt: ' + result.path)
      setNewFolderName('')
      setShowNewFolderDialog(false)
      onRefresh()
    } else {
      alert('Fehler: ' + result.error)
    }
  }

  return (
    <div className="flex gap-2 border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setShowNewFileDialog(true)}
        className="px-2 py-2 hover:bg-blue-700/30 rounded-full text-sm font-medium transition-colors"
      >
        <FilePlus size={20} className="text-gray-600 dark:text-gray-400" />
      </button>
      <button
        onClick={() => setShowNewFolderDialog(true)}
        className={
          'px-2 py-2 hover:bg-blue-700/30 rounded-full text-sm font-medium transition-colors'
        }
      >
        <FolderPlus size={20} className="text-gray-600 dark:text-gray-400" />
      </button>
      <button
        onClick={() => onRefresh()}
        className="px-2 py-2 hover:bg-blue-700/30 rounded-full text-sm font-medium transition-colors"
      >
        <RefreshCcw size={20} className="text-gray-600 dark:text-gray-400" />
      </button>

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Neue Datei erstellen
            </h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Dateiname.txt"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewFileDialog(false)
                  setNewFileName('')
                }}
                className="px-4 py-2 text-sm bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateFile}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Neuen Ordner erstellen
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Ordnername"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false)
                  setNewFolderName('')
                }}
                className="px-4 py-2 text-sm bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
