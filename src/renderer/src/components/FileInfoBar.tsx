import React from 'react'
import { useEditor } from '@renderer/context/EditorContext'
import { useFile } from '@renderer/context/FileContext'

export default function FileInfoBar() {
  const { currentFile, isDirty } = useFile()
  const { wordCount, lineCount, charCount } = useEditor()

  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs bg-neutral-100 text-neutral-600 border-t border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
      <div className="flex items-center gap-4">
        <span className="font-mono">{currentFile?.name || 'Untitled'}</span>
        {isDirty && <span className="text-destructive">• Unsaved changes</span>}
      </div>
      <div className="flex items-center gap-4">
        <span>Words: {wordCount}</span>
        <span>Lines: {lineCount}</span>
        <span>Characters: {charCount}</span>
      </div>
    </div>
  )
}