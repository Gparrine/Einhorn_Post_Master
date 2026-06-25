import type { Platform } from '../types'

interface ConfirmDialogProps {
  target: Platform | 'all'
  onConfirm: () => void
  onCancel: () => void
}

const LABELS: Record<Platform, string> = {
  facebook: 'Facebook group',
  discord: 'Discord channel',
  meetup: 'Meetup event',
  gymdesk: 'Gymdesk class entry',
}

export default function ConfirmDialog({ target, onConfirm, onCancel }: ConfirmDialogProps) {
  const destination =
    target === 'all'
      ? 'all four platforms (Facebook, Discord, Meetup, and Gymdesk)'
      : LABELS[target]

  const facebookNote =
    target === 'facebook' || target === 'all'
      ? ' Facebook posts are copied to your clipboard and your group opens in a new tab — you paste and publish there (Meta no longer allows automated group posting).'
      : ''

  const gymdeskNote =
    target === 'gymdesk' || target === 'all'
      ? ' Gymdesk copies the description and opens your schedule — find the session for the date in your post, Edit Session → Description tab, paste and save.'
      : ''

  const meetupNote =
    target === 'meetup' || target === 'all'
      ? ' Meetup copies the description and opens your group events page — find the event for the date in your post, Edit, and paste into the Description field.'
      : ''

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="dialog-title">Confirm Send</h2>
        <p className="dialog-body">
          Are you sure you want to send this post to{' '}
          <strong>{destination}</strong>?
          {facebookNote}
          {gymdeskNote}
          {meetupNote}
        </p>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="dialog-btn confirm" onClick={onConfirm}>
            Yes, Send
          </button>
        </div>
      </div>
    </div>
  )
}
