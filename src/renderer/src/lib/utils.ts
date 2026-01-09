import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function markdownToHtml(markdown: string): string {
  let html = markdown

  // Code blocks zuerst
  html = html.replace(
    /```([\s\S]*?)```/g,
    (_, code) => `<pre>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
  )

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Unordered list BLOCK
  html = html.replace(
    /(?:^|\n)((?:- .+(?:\n|$))+)/g,
    (_, block) =>
      `<ul>${block
        .trim()
        .split('\n')
        .map((l) => `<li>${l.slice(2)}</li>`)
        .join('')}</ul>`
  )

  // Ordered list BLOCK
  html = html.replace(
    /(?:^|\n)((?:\d+\. .+(?:\n|$))+)/g,
    (_, block) =>
      `<ol>${block
        .trim()
        .split('\n')
        .map((l) => `<li>${l.replace(/^\d+\. /, '')}</li>`)
        .join('')}</ol>`
  )

  // Inline styles
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/__(.*?)__/g, '<u>$1</u>')

  // Linebreaks NUR außerhalb von Blöcken
  html = html.replace(/\n(?![^<]*(<\/ul>|<\/ol>|<\/pre>))/g, '<br>')

  return html
}

export function htmlToMarkdown(html: string): string {
  const temp = document.createElement('div')
  temp.innerHTML = html

  const processNode = (node: Node, index: number, siblings: Node[]): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      const tagName = element.tagName.toLowerCase()
      const childContent = Array.from(element.childNodes)
        .map((child, i, arr) => processNode(child, i, arr))
        .join('')

      // Check if there's a next sibling that's not just whitespace
      const hasNextSibling =
        index < siblings.length - 1 &&
        siblings[index + 1] &&
        (siblings[index + 1].nodeType !== Node.TEXT_NODE ||
          (siblings[index + 1].textContent?.trim().length ?? 0) > 0)

      switch (tagName) {
        case 'h1':
          return `# ${childContent}${hasNextSibling ? '\n' : ''}`
        case 'h2':
          return `## ${childContent}${hasNextSibling ? '\n' : ''}`
        case 'h3':
          return `### ${childContent}${hasNextSibling ? '\n' : ''}`
        case 'strong':
        case 'b':
          return `**${childContent}**`
        case 'em':
        case 'i':
          return `*${childContent}*`
        case 'u':
          return `__${childContent}__`
        case 'pre':
          return `\`\`\`\n${childContent}\n\`\`\``
        case 'code':
          return `\`${childContent}\``
        case 'br':
          return '\n'
        case 'ul':
          return `${childContent}${hasNextSibling ? '\n' : ''}`
        case 'ol':
          return `${childContent}${hasNextSibling ? '\n' : ''}`
        case 'li':
          // Determine if parent is ol or ul
          const parentTag = element.parentElement?.tagName.toLowerCase()
          return `\n${parentTag === 'ol' ? `${index + 1}. ` : '- '} ${childContent}`
        case 'div':
        case 'p':
          return childContent
        case 'font': {
          const color = element.getAttribute('color')
          if (color) {
            return `{color:${color}}${childContent}{/color}`
          }
          return childContent
        }
        case 'span': {
          const color = element.style.color
          if (color) {
            return `{color:${color}}${childContent}{/color}`
          }
          return childContent
        }
        default:
          return childContent
      }
    }

    return ''
  }

  const childNodes = Array.from(temp.childNodes)
  let markdown = childNodes.map((node, i) => processNode(node, i, childNodes)).join('')

  // Clean up excessive newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim()

  return markdown
}

export function deleteCurrentLine() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  const startContainer = range.startContainer
  const endContainer = range.endContainer

  if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
    const textNode = startContainer as Text
    const text = textNode.textContent || ''
    const lineStart = text.lastIndexOf('\n', range.startOffset)
    const lineEnd = text.indexOf('\n', range.startOffset)
    const newStartOffset = lineStart + 1
    const newEndOffset = lineEnd === -1 ? text.length : lineEnd

    if (newStartOffset < newEndOffset) {
      range.setStart(textNode, newStartOffset)
      range.setEnd(textNode, newEndOffset)
      selection.removeAllRanges()
      selection.addRange(range)
      document.execCommand('outdent')
      document.execCommand('delete')
    }
  }
}

export function getFormatState() {
  const selection = window.getSelection()
  const node = selection?.anchorNode as HTMLElement | null
  const element = node?.nodeType === 3 ? node.parentElement : node

  const inside = (tag: string) => element?.closest(tag) !== null

  return {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    ol: inside('ol'),
    ul: inside('ul'),
    li: inside('li'),
    h1: inside('h1'),
    h2: inside('h2'),
    h3: inside('h3'),
    code: inside('code'),
    pre: inside('pre')
  }
}

export function moveCaretToEnd(el) {
  el.focus()

  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)

  const sel = window.getSelection()
  sel!.removeAllRanges()
  sel!.addRange(range)
}

export function isCursorInNonEmptyLi(): boolean {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return false

  let node: Node | null = sel.anchorNode
  if (!node) return false

  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode
  }

  if (!(node instanceof HTMLElement)) return false

  const li = node.closest('li')
  if (!li) return false

  const text = li.textContent?.replace(/\u200B/g, '').trim()

  return Boolean(text && text.length > 0)
}
