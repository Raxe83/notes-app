import { useFile } from '@renderer/context/FileContext'

export default function FileBodyViewer() {
  const { currentFile } = useFile()

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Wähle eine Datei zum Anzeigen
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          {currentFile.path!.split('/').pop()}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-neutral-800">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100 leading-relaxed">
            {currentFile.content}
          </pre>
        </div>
      </div>
    </div>
  )
}
