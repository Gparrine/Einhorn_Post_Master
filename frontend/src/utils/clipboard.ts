export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  if (copyToClipboardSync(text)) return

  throw new Error('Clipboard copy failed')
}

/** Synchronous copy — use during a click handler before any await. */
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
