interface StatusBarProps {
  message: string | null
  type: 'info' | 'error' | 'success'
}

export default function StatusBar({ message, type }: StatusBarProps) {
  if (!message) return <div className="status-bar empty" />

  return (
    <div className={`status-bar status-${type}`} role="status" aria-live="polite">
      {type === 'error' && <span className="status-icon">✕</span>}
      {type === 'success' && <span className="status-icon">✓</span>}
      {type === 'info' && <span className="spinner small" />}
      <span>{message}</span>
    </div>
  )
}
