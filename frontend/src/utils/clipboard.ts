function stripHtmlForPlain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function prepareHtmlForClipboard(html: string, plainText: string): string {
  const trimmedHtml = html.trim()
  if (trimmedHtml) {
    return `<meta charset="utf-8">${trimmedHtml}`
  }

  const plain = plainText.trim()
  if (!plain) return '<meta charset="utf-8"><p></p>'

  const escaped = plain
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  return `<meta charset="utf-8"><p>${escaped}</p>`
}

function copyHtmlWithExecCommand(html: string): boolean {
  const container = document.createElement('div')
  container.contentEditable = 'true'
  container.innerHTML = html
  container.setAttribute('aria-hidden', 'true')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.opacity = '0'
  container.style.pointerEvents = 'none'
  document.body.appendChild(container)

  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(container)
  selection?.removeAllRanges()
  selection?.addRange(range)

  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }

  selection?.removeAllRanges()
  document.body.removeChild(container)
  return copied
}

export async function copyRichTextToClipboard(html: string, plainText: string): Promise<void> {
  const plain = plainText.trim() || stripHtmlForPlain(html)
  const htmlPayload = prepareHtmlForClipboard(html, plain)

  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([plain], { type: 'text/plain' }),
          'text/html': new Blob([htmlPayload], { type: 'text/html' }),
        }),
      ])
      return
    } catch {
      /* fall through to execCommand / plain text */
    }
  }

  if (copyRichTextToClipboardSync(html, plainText)) return

  await copyToClipboard(plain)
}

/** Synchronous rich copy — use during a click handler before any await. */
export function copyRichTextToClipboardSync(html: string, plainText: string): boolean {
  const plain = plainText.trim() || stripHtmlForPlain(html)
  const htmlPayload = prepareHtmlForClipboard(html, plain)

  if (copyHtmlWithExecCommand(htmlPayload)) return true

  return copyToClipboardSync(plain)
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  if (copyToClipboardSync(text)) return

  throw new Error('Clipboard copy failed')
}

/** Synchronous plain copy — use during a click handler before any await. */
export function copyToClipboardSync(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }

  document.body.removeChild(textarea)

  if (copied) return true

  if (navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(text)
    return true
  }

  return false
}
