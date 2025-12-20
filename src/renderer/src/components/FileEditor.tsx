import React from 'react'
import { Save } from 'lucide-react'
import { useFile } from '@renderer/context/FileContext'

export default function FileEditor() {
  const { currentFile, isDirty, updateContent, saveFile } = useFile()

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Wähle eine Datei zum Bearbeiten
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-100 dark:bg-gray-800">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {currentFile.path.split('/').pop()}
          {isDirty && <span className="text-orange-400 ml-2">●</span>}
        </span>
        <button
          onClick={saveFile}
          disabled={!isDirty}
          className={`flex items-center gap-2 px-4 py-1 rounded text-sm font-medium transition-colors ${
            isDirty
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Save size={16} />
          Speichern
        </button>
      </div>
      <textarea
        value={currentFile.content}
        onChange={(e) => updateContent(e.target.value)}
        className="flex-1 p-4 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-200 font-mono text-sm resize-none focus:outline-none"
        spellCheck={false}
      />
    </div>
  )
}
