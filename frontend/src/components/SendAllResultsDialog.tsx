import type { Platform } from '../types'

export interface ManualPlatformLink {
  platform: Platform
  label: string
  url: string
}

interface SendAllResultsDialogProps {
  copied: boolean
  manualLinks: ManualPlatformLink[]
  onClose: () => void
}

export default function SendAllResultsDialog({
  copied,
  manualLinks,
  onClose,
}: SendAllResultsDialogProps) {
  const openAll = () => {
    for (const link of manualLinks) {
      window.open(link.url, '_blank')
    }
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog send-all-results" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="dialog-title">Send to All — next steps</h2>
        <p className="dialog-body">
          {copied
            ? 'Post text is copied to your clipboard.'
            : 'Copy your post from the editor before pasting on each site.'}
          {' '}Discord was posted automatically. Open each link below, paste, and save.
        </p>

        <div className="send-all-links">
          {manualLinks.map((link) => (
            <a
              key={link.platform}
              className="send-all-link-btn"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open {link.label}
            </a>
          ))}
        </div>

        {manualLinks.length > 1 && (
          <button type="button" className="send-all-open-all" onClick={openAll}>
            Try opening all pages
          </button>
        )}

        <div className="dialog-actions">
          <button type="button" className="dialog-btn confirm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
