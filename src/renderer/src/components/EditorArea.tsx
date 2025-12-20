import { useEditor } from '@renderer/context/EditorContext'
import { useFile } from '@renderer/context/FileContext'

export default function EditorArea() {
  const { content, updateContent } = useFile()
  const { fontSize } = useEditor()

  return (
    <div className="flex-1 overflow-auto">
      <textarea
        value={content}
        onChange={(e) => updateContent(e.target.value)}
        className="w-full h-full p-8 resize-none outline-none font-mono leading-relaxed bg-white text-black dark:bg-neutral-900 dark:text-neutral-100"
        style={{ fontSize: `${fontSize}px` }}
      />
    </div>
  )
}
