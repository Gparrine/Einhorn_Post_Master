import { config, hasCredentials } from '../config.js'
import { extractDates, formatDateLong, inferEinhornSessionHint, stripHtml } from '../utils/dates.js'

export interface GymdeskPostResult {
  postId: string
  postUrl: string
  mode: 'manual'
  copyText: string
  instructions: string
  matchedDate?: string
  sessionHint?: string
}

export async function postToGymdesk(content: string, plainText: string): Promise<GymdeskPostResult> {
  const classDate = extractDates(plainText)[0] ?? extractDates(content)[0]

  if (!classDate) {
    throw new Error(
      'No class date found in your post. Include a date (e.g. "June 28, 2026" or "6/28/2026") so Gymdesk knows which session to update.',
    )
  }

  const copyText = formatForGymdeskDescription(content, plainText)
  const openUrl = config.gymdesk.openUrl
  const dateLabel = formatDateLong(classDate)
  const sessionHint = inferEinhornSessionHint(classDate)

  if (!openUrl) {
    throw new Error(
      'Gymdesk URL is not configured. Set GYMDESK_OPEN_URL on the backend (Render environment).',
    )
  }

  const instructions =
    `Post copied. In Gymdesk go to Gym → Schedule, open ${dateLabel} (${sessionHint}), ` +
    'Edit Session → Description tab, paste, and save.'

  if (config.demoMode && !hasCredentials('gymdesk')) {
    await delay(900)
    return {
      postId: `demo-gymdesk-${Date.now()}`,
      postUrl: openUrl,
      mode: 'manual',
      copyText,
      instructions: `Demo mode: ${instructions}`,
      matchedDate: dateLabel,
      sessionHint,
    }
  }

  return {
    postId: `manual-gymdesk-${Date.now()}`,
    postUrl: openUrl,
    mode: 'manual',
    copyText,
    instructions,
    matchedDate: dateLabel,
    sessionHint,
  }
}

export async function verifyGymdeskPost(postId: string): Promise<{ verified: boolean; error?: string }> {
  if (postId.startsWith('demo-') || postId.startsWith('manual-')) {
    return config.gymdesk.openUrl
      ? { verified: true }
      : { verified: false, error: 'Gymdesk URL is not configured.' }
  }

  return { verified: false, error: 'Unknown Gymdesk post reference.' }
}

function formatForGymdeskDescription(html: string, plainText: string): string {
  return (plainText.trim() || stripHtml(html)).slice(0, 10000)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
