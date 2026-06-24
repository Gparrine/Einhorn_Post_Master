import { useState } from 'react'

export default function SharePanel() {
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null)

  const appUrl = window.location.href.split('?')[0]
  const embedCode = `<iframe src="${appUrl}" width="480" height="720" frameborder="0" style="border-radius:12px;border:1px solid #355E3B;" title="Einhorn Postmaster"></iframe>`

  const copy = async (text: string, type: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="share-panel">
      <button
        type="button"
        className="share-btn"
        onClick={() => copy(appUrl, 'link')}
        title="Copy direct link"
      >
        {copied === 'link' ? '✓ Copied' : '🔗 Link'}
      </button>
      <button
        type="button"
        className="share-btn"
        onClick={() => copy(embedCode, 'embed')}
        title="Copy embed code"
      >
        {copied === 'embed' ? '✓ Copied' : '⬚ Embed'}
      </button>
    </div>
  )
}
