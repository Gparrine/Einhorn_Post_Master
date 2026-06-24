import type { CSSProperties } from 'react'
import type { Platform, PlatformState } from '../types'

interface PlatformButtonProps {
  platform: Platform
  state: PlatformState
  disabled: boolean
  onSend: () => void
  onReset: () => void
}

const PLATFORM_CONFIG: Record<
  Platform,
  { label: string; icon: string; color: string }
> = {
  facebook: { label: 'Facebook', icon: 'f', color: '#1877F2' },
  discord: { label: 'Discord', icon: '◆', color: '#5865F2' },
  meetup: { label: 'Meetup', icon: 'M', color: '#ED1C40' },
  gymdesk: { label: 'Gymdesk', icon: 'G', color: '#4CAF50' },
}

export default function PlatformButton({
  platform,
  state,
  disabled,
  onSend,
  onReset,
}: PlatformButtonProps) {
  const config = PLATFORM_CONFIG[platform]
  const { status } = state

  return (
    <div className="platform-btn-wrapper">
      <button
        type="button"
        className={`platform-btn status-${status}`}
        onClick={status === 'success' || status === 'error' ? onReset : onSend}
        disabled={disabled || status === 'loading'}
        title={
          status === 'success'
            ? 'Posted! Click to reset'
            : status === 'error'
              ? state.error || 'Error — click to retry'
              : `Send to ${config.label}`
        }
      >
        <span className="platform-icon" style={{ '--platform-accent': config.color } as CSSProperties}>
          {config.icon}
        </span>

        {status === 'loading' && (
          <span className="platform-overlay loading">
            <span className="spinner" />
          </span>
        )}

        {status === 'success' && (
          <span className="platform-overlay success">
            <span className="checkmark">✓</span>
          </span>
        )}

        {status === 'error' && (
          <span className="platform-overlay error">
            <span className="cross">✕</span>
          </span>
        )}
      </button>

      <span className="platform-label">{config.label}</span>

      {status === 'loading' && (
        <span className="platform-status-text">Awaiting confirmation</span>
      )}
    </div>
  )
}
