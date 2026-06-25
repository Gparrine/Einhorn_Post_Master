import './App.css'
import { useCallback, useState } from 'react'
import Header from './components/Header'
import PostInstructions from './components/PostInstructions'
import RichTextEditor from './components/RichTextEditor'
import PlatformButton from './components/PlatformButton'
import ConfirmDialog from './components/ConfirmDialog'
import StatusBar from './components/StatusBar'
import SharePanel from './components/SharePanel'
import { postToPlatform, refineWithAI } from './api/client'
import { copyToClipboard } from './utils/clipboard'
import { navigateTab, openTabPlaceholder, openUrlInNewTab } from './utils/openTab'
import type { Platform, PlatformState, PlatformStates } from './types'

const PLATFORMS: Platform[] = ['facebook', 'discord', 'meetup', 'gymdesk']
const MANUAL_PLATFORMS: Platform[] = ['facebook', 'meetup', 'gymdesk']

const INITIAL_STATES: PlatformStates = {
  discord: { status: 'idle' },
  facebook: { status: 'idle' },
  meetup: { status: 'idle' },
  gymdesk: { status: 'idle' },
}

function App() {
  const [htmlContent, setHtmlContent] = useState('')
  const [plainText, setPlainText] = useState('')
  const [platformStates, setPlatformStates] = useState<PlatformStates>(INITIAL_STATES)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info')
  const [isRefining, setIsRefining] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<Platform | 'all' | null>(null)
  const [isSending, setIsSending] = useState(false)

  const updatePlatform = useCallback((platform: Platform, update: Partial<PlatformState>) => {
    setPlatformStates((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], ...update },
    }))
  }, [])

  const handleRefine = async () => {
    if (!plainText.trim()) {
      setStatusType('error')
      setStatusMessage('Please enter some text before refining with AI.')
      return
    }

    setIsRefining(true)
    setStatusType('info')
    setStatusMessage('Refining with AI…')

    try {
      const result = await refineWithAI(htmlContent, plainText)
      setHtmlContent(result.content)
      setStatusType('success')
      setStatusMessage('Text refined successfully. Review and edit as needed.')
    } catch (err) {
      setStatusType('error')
      setStatusMessage(err instanceof Error ? err.message : 'AI refinement failed.')
    } finally {
      setIsRefining(false)
    }
  }

  const sendToPlatform = async (platform: Platform, preOpenedTab?: Window | null) => {
    if (!plainText.trim()) {
      setStatusType('error')
      setStatusMessage('Please enter post text before sending.')
      return
    }

    updatePlatform(platform, { status: 'loading', error: undefined })
    setStatusType('info')
    setStatusMessage(`Sending to ${platformLabel(platform)}…`)

    try {
      const result = await postToPlatform(platform, htmlContent, plainText)

      if (result.success) {
        if (result.mode === 'manual' && result.copyText) {
          try {
            await copyToClipboard(result.copyText)
            if (result.postUrl) {
              const opened = navigateTab(preOpenedTab, result.postUrl)
              if (!opened) {
                openUrlInNewTab(result.postUrl)
              }
            }
          } catch {
            updatePlatform(platform, {
              status: 'error',
              error: 'Could not copy text to clipboard. Copy manually from the editor.',
            })
            setStatusType('error')
            setStatusMessage('Could not copy post text to clipboard.')
            return
          }
        }

        updatePlatform(platform, { status: 'success', postUrl: result.postUrl })
        setStatusType('success')
        setStatusMessage(
          result.instructions ||
            (result.mode === 'manual'
              ? `Copied for ${platformLabel(platform)}. Paste and publish manually.`
              : `Posted successfully to ${platformLabel(platform)}.`),
        )
      } else {
        if (preOpenedTab && !preOpenedTab.closed) {
          preOpenedTab.close()
        }
        updatePlatform(platform, { status: 'error', error: result.error })
        setStatusType('error')
        setStatusMessage(result.error || `Failed to post to ${platformLabel(platform)}.`)
      }
    } catch (err) {
      if (preOpenedTab && !preOpenedTab.closed) {
        preOpenedTab.close()
      }
      const message = err instanceof Error ? err.message : 'Unknown error'
      updatePlatform(platform, { status: 'error', error: message })
      setStatusType('error')
      setStatusMessage(message)
    }
  }

  const handleConfirmSend = () => {
    if (!confirmTarget) return

    const target = confirmTarget
    setIsSending(true)
    setConfirmTarget(null)

    const platformsToSend: Platform[] = target === 'all' ? PLATFORMS : [target]
    const manualTabs: Partial<Record<Platform, Window | null>> = {}

    for (const platform of platformsToSend) {
      if (MANUAL_PLATFORMS.includes(platform)) {
        manualTabs[platform] = openTabPlaceholder()
      }
    }

    void (async () => {
      try {
        if (target === 'all') {
          setStatusType('info')
          setStatusMessage('Sending to all platforms…')

          for (const platform of PLATFORMS) {
            await sendToPlatform(platform, manualTabs[platform])
          }

          setStatusType('success')
          setStatusMessage(
            'Sent to all platforms. Paste on Facebook, Meetup, and Gymdesk in the tabs that opened.',
          )
        } else {
          await sendToPlatform(target, manualTabs[target])
        }
      } finally {
        setIsSending(false)
      }
    })()
  }

  const requestSend = (target: Platform | 'all') => {
    if (!plainText.trim()) {
      setStatusType('error')
      setStatusMessage('Please enter post text before sending.')
      return
    }
    setConfirmTarget(target)
  }

  const resetPlatform = (platform: Platform) => {
    updatePlatform(platform, { status: 'idle', error: undefined, postUrl: undefined })
  }

  return (
    <div className="app">
      <div className="app-container">
        <Header />

        <main className="main-content">
          <PostInstructions />

          <RichTextEditor
            content={htmlContent}
            onChange={(html, text) => {
              setHtmlContent(html)
              setPlainText(text)
            }}
            onRefine={handleRefine}
            isRefining={isRefining}
          />

          <div className="platform-row">
            {PLATFORMS.map((platform) => (
              <PlatformButton
                key={platform}
                platform={platform}
                state={platformStates[platform]}
                disabled={isSending}
                onSend={() => requestSend(platform)}
                onReset={() => resetPlatform(platform)}
              />
            ))}
          </div>

          <div className="send-all-row">
            <button
              className="send-all-btn"
              onClick={() => requestSend('all')}
              disabled={isSending}
              type="button"
            >
              <span className="send-all-icon">✦</span>
              Send to All
            </button>
          </div>
        </main>

        <StatusBar message={statusMessage} type={statusType} />
        <SharePanel />
      </div>

      {confirmTarget && (
        <ConfirmDialog
          target={confirmTarget}
          onConfirm={handleConfirmSend}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  )
}

function platformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    facebook: 'Facebook',
    discord: 'Discord',
    meetup: 'Meetup',
    gymdesk: 'Gymdesk',
  }
  return labels[platform]
}

export default App
