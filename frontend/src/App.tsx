import './App.css'
import { useCallback, useState } from 'react'
import Header from './components/Header'
import PostInstructions from './components/PostInstructions'
import RichTextEditor from './components/RichTextEditor'
import PlatformButton from './components/PlatformButton'
import ConfirmDialog from './components/ConfirmDialog'
import SendAllResultsDialog, { type ManualPlatformLink } from './components/SendAllResultsDialog'
import StatusBar from './components/StatusBar'
import SharePanel from './components/SharePanel'
import { postToPlatform, refineWithAI } from './api/client'
import { copyRichTextToClipboard, copyRichTextToClipboardSync } from './utils/clipboard'
import { openUrlInNewTab } from './utils/openTab'
import type { Platform, PlatformState, PlatformStates, PostResult } from './types'

const PLATFORMS: Platform[] = ['facebook', 'discord', 'meetup', 'gymdesk']

const INITIAL_STATES: PlatformStates = {
  discord: { status: 'idle' },
  facebook: { status: 'idle' },
  meetup: { status: 'idle' },
  gymdesk: { status: 'idle' },
}

interface SendAllResults {
  copied: boolean
  manualLinks: ManualPlatformLink[]
}

interface SendOptions {
  skipManualActions?: boolean
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
  const [sendAllResults, setSendAllResults] = useState<SendAllResults | null>(null)

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

  const sendToPlatform = async (
    platform: Platform,
    options: SendOptions = {},
  ): Promise<PostResult> => {
    if (!plainText.trim()) {
      setStatusType('error')
      setStatusMessage('Please enter post text before sending.')
      return { platform, success: false, error: 'Post text is required.' }
    }

    updatePlatform(platform, { status: 'loading', error: undefined })
    setStatusType('info')
    setStatusMessage(`Sending to ${platformLabel(platform)}…`)

    try {
      const result = await postToPlatform(platform, htmlContent, plainText)

      if (result.success) {
        if (result.mode === 'manual' && !options.skipManualActions) {
          try {
            await copyRichTextToClipboard(htmlContent, plainText)
            if (result.postUrl) {
              openUrlInNewTab(result.postUrl)
            }
          } catch {
            updatePlatform(platform, {
              status: 'error',
              error: 'Could not copy text to clipboard. Copy manually from the editor.',
              postUrl: result.postUrl,
            })
            setStatusType('error')
            setStatusMessage('Could not copy post text to clipboard.')
            return result
          }
        }

        updatePlatform(platform, { status: 'success', postUrl: result.postUrl })
        if (!options.skipManualActions) {
          setStatusType('success')
          setStatusMessage(
            result.instructions ||
              (result.mode === 'manual'
                ? `Copied for ${platformLabel(platform)}. Paste and publish manually.`
                : `Posted successfully to ${platformLabel(platform)}.`),
          )
        }
        return result
      }

      updatePlatform(platform, { status: 'error', error: result.error })
      if (!options.skipManualActions) {
        setStatusType('error')
        setStatusMessage(result.error || `Failed to post to ${platformLabel(platform)}.`)
      }
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      updatePlatform(platform, { status: 'error', error: message })
      if (!options.skipManualActions) {
        setStatusType('error')
        setStatusMessage(message)
      }
      return { platform, success: false, error: message }
    }
  }

  const handleConfirmSend = () => {
    if (!confirmTarget) return

    const target = confirmTarget
    setIsSending(true)
    setConfirmTarget(null)

    if (target === 'all') {
      const copied = copyRichTextToClipboardSync(htmlContent, plainText)

      void (async () => {
        try {
          setStatusType('info')
          setStatusMessage('Sending to all platforms…')

          const manualLinks: ManualPlatformLink[] = []
          let failureCount = 0

          for (const platform of PLATFORMS) {
            const result = await sendToPlatform(platform, { skipManualActions: true })

            if (!result.success) {
              failureCount += 1
            } else if (result.mode === 'manual' && result.postUrl) {
              manualLinks.push({
                platform,
                label: platformLabel(platform),
                url: result.postUrl,
              })
            }
          }

          setSendAllResults({ copied, manualLinks })

          if (failureCount > 0) {
            setStatusType('error')
            setStatusMessage('Some platforms failed. Check the buttons above for details.')
          } else {
            setStatusType('success')
            setStatusMessage('All platforms ready. Use the dialog to open Facebook, Meetup, and Gymdesk.')
          }
        } finally {
          setIsSending(false)
        }
      })()

      return
    }

    void (async () => {
      try {
        await sendToPlatform(target)
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

      {sendAllResults && (
        <SendAllResultsDialog
          copied={sendAllResults.copied}
          manualLinks={sendAllResults.manualLinks}
          onClose={() => setSendAllResults(null)}
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
