import { useEditor } from '@renderer/context/EditorContext'
import { useFile } from '@renderer/context/FileContext'
import { useEffect, useRef, useState } from 'react'
import Toolbar from './Toolbar'
import FileInfoBar from './FileInfoBar'
import {
  deleteCurrentLine,
  getFormatState,
  htmlToMarkdown,
  isCursorInNonEmptyLi,
  markdownToHtml,
  moveCaretToEnd
} from '@renderer/lib/utils'

export default function EditorArea() {
  const { content, updateContent } = useFile()
  const { fontSize } = useEditor()
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalUpdate = useRef(false)
  const [localHtml, setLocalHtml] = useState('')
  const [format, setFormat] = useState(getFormatState())

  useEffect(() => {
    const update = () => setFormat(getFormatState())
    document.addEventListener('selectionchange', update)
    return () => document.removeEventListener('selectionchange', update)
  }, [])

  // Initiales Laden: Markdown -> HTML
  useEffect(() => {
    if (!editorRef.current) return
    editorRef.current.innerHTML = markdownToHtml(content)
  }, [])

  // Externe Updates
  useEffect(() => {
    if (isInternalUpdate.current || !editorRef.current) return

    const newHtml = markdownToHtml(content)

    if (newHtml !== localHtml) {
      setLocalHtml(newHtml)
      editorRef.current.innerHTML = newHtml
      moveCaretToEnd(editorRef.current)
    }
  }, [content, localHtml])

  const syncState = () => {
    if (!editorRef.current) return

    const html = editorRef.current.innerHTML
    const markdown = htmlToMarkdown(html)

    isInternalUpdate.current = true
    setLocalHtml(html)
    updateContent(markdown)

    setTimeout(() => {
      isInternalUpdate.current = false
    }, 50)
  }

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleHeading = (level: number) => {
    const selection = window.getSelection()
    if (!selection || !editorRef.current) return

    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const parentElement =
      container.nodeType === 3 ? container.parentElement : (container as HTMLElement)

    // Remove existing heading
    if (parentElement!.tagName.match(/^H[1-6]$/)) {
      const textContent = parentElement!.textContent || ''
      const textNode = document.createTextNode(textContent)
      parentElement!.replaceWith(textNode)
      return
    }

    // Apply new heading
    document.execCommand('formatBlock', false, `h${level}`)
    editorRef.current.focus()
  }

  // const handleColorChange = (color: string) => {
  //   handleFormat('foreColor', color)
  // }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !format.li) {
      e.preventDefault()
      document.execCommand('insertLineBreak')
      return
    }

    // TAB → Tabulator
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '\t')
      return
    }
    // LISTEN: ENTER in Listenelement → neues Listenelement. Leeres Listenelement → Einrückung entfernen
    if (e.key === 'Enter' && format.li) {
      e.preventDefault()
      if (isCursorInNonEmptyLi()) {
        document.execCommand('insertHTML', false, '<br><li><br>')
      } else {
        document.execCommand('outdent')
      }
      return
    }

    // Shortcuts
    switch (e.ctrlKey && e.key.toUpperCase()) {
      case 'B':
        handleFormat('bold')
        break
      case 'I':
        handleFormat('italic')
        break
      case 'U':
        handleFormat('underline')
        break
      case 'L':
        handleFormat('insertUnorderedList')
        break
      case 'K':
        handleFormat('insertOrderedList')
        break
      case 'D':
        deleteCurrentLine()
        document.execCommand('delete')
        break
      case '1':
        handleHeading(1)
        break
      case '2':
        handleHeading(2)
        break
      case '3':
        handleHeading(3)
        break
      case 'e':
        insertInlineCode()
        break
      case 'k':
        insertCodeBlock()
        break
    }
  }

  const insertInlineCode = () => {
    if (!editorRef.current) return
    editorRef.current.focus()

    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)
    const selectedText = range.toString()

    const code = document.createElement('code')
    code.className = 'inline-code'
    code.textContent = selectedText || '\u200B'

    range.deleteContents()
    range.insertNode(code)

    const textNode = document.createTextNode(' ')
    code.parentNode!.insertBefore(textNode, code.nextSibling)

    const newRange = document.createRange()
    newRange.setStart(textNode, 0)
    newRange.collapse(true)

    sel.removeAllRanges()
    sel.addRange(newRange)
  }

  const insertCodeBlock = () => {
    if (!editorRef.current) return
    editorRef.current.focus()

    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)
    const selectedText = range.toString()

    const pre = document.createElement('pre')
    pre.className = 'code-block'

    const code = document.createElement('code')
    code.textContent = selectedText || '\n'
    pre.appendChild(code)

    range.deleteContents()
    range.insertNode(pre)

    const paragraph = document.createElement('div')
    paragraph.appendChild(document.createElement('br'))

    pre.parentNode!.insertBefore(paragraph, pre.nextSibling)

    const newRange = document.createRange()
    newRange.setStart(code, 0)
    newRange.collapse(true)

    sel.removeAllRanges()
    sel.addRange(newRange)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Toolbar
        boldFunction={() => handleFormat('bold')}
        italicFunction={() => handleFormat('italic')}
        underlineFunction={() => handleFormat('underline')}
        headerFunction={() => handleHeading(1)}
        unorderedListFunction={() => handleFormat('insertUnorderedList')}
        orderedListFunction={() => handleFormat('insertOrderedList')}
        codeFunction={insertInlineCode}
        codeBlockFunction={insertCodeBlock}
      />
      <FileInfoBar />
      <div className="flex-1 overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          spellCheck={false}
          suppressContentEditableWarning
          className={`
      w-full min-h-full p-8 outline-none
      bg-white text-black dark:bg-neutral-900 dark:text-neutral-100
      focus:ring-0
      prose prose-sm dark:prose-invert
      [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:my-2 [&>h1]:leading-tight
      [&>h2]:text-xl [&>h2]:font-bold [&>h2]:my-3 [&>h2]:leading-snug
      [&>h3]:text-lg [&>h3]:font-bold [&>h3]:my-3 [&>h3]:leading-snug
      [&>ul]:list-disc [&>ul]:pl-8 [&>ul]:my-2
      [&>ol]:list-decimal [&>ol]:pl-8 [&>ol]:my-2
      [&>p]:my-2
      [&>li]:my-1
      [&>code]:bg-gray-200 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-pink-600
      dark:[&>code]:bg-neutral-800 dark:[&>code]:text-pink-400
      [&>pre]:bg-gray-100 [&>pre]:p-4 [&>pre]:rounded [&>pre]:overflow-x-auto [&>pre]:my-4 [&>pre]:border [&>pre]:border-gray-300
      dark:[&>pre]:bg-neutral-800 dark:[&>pre]:border-neutral-700
      [&>pre>code]:bg-transparent [&>pre>code]:p-0 [&>pre>code]:text-sm [&>pre>code]:leading-relaxed
    `}
          style={{
            fontSize,
            lineHeight: '1.6',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
          onInput={syncState}
          onKeyDown={handleKeyDown}
          onClick={() => editorRef.current?.focus()}
        />
      </div>
    </div>
  )
}
