import fetch from 'node-fetch'
import { config, hasCredentials } from '../config.js'

interface PostResult {
  postId: string
  postUrl?: string
}

export async function postToGymdesk(content: string, plainText: string): Promise<PostResult> {
  if (config.demoMode && !hasCredentials('gymdesk')) {
    await delay(1300)
    return { postId: `demo-gymdesk-${Date.now()}`, postUrl: 'https://gymdesk.com/demo' }
  }

  const { apiKey, apiUrl, locationId } = config.gymdesk
  const classDate = extractClassDate(plainText)

  const response = await fetch(`${apiUrl}/v1/locations/${locationId}/announcements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: extractTitle(plainText),
      body: plainText,
      html_body: content,
      class_date: classDate?.toISOString().split('T')[0],
      type: 'class_entry',
    }),
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { message?: string; error?: string }
    throw new Error(err.message || err.error || `Gymdesk API error (${response.status})`)
  }

  const data = (await response.json()) as { id: string | number }
  return {
    postId: String(data.id),
    postUrl: `${apiUrl.replace('api.', '')}/classes/${data.id}`,
  }
}

export async function verifyGymdeskPost(postId: string): Promise<{ verified: boolean; error?: string }> {
  if (postId.startsWith('demo-')) return { verified: true }

  const { apiKey, apiUrl, locationId } = config.gymdesk

  const response = await fetch(`${apiUrl}/v1/locations/${locationId}/announcements/${postId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (response.ok) return { verified: true }
  return { verified: false, error: 'Could not verify Gymdesk class entry was created.' }
}

function extractTitle(text: string): string {
  const firstLine = text.split('\n').find((l) => l.trim())
  return firstLine?.slice(0, 100) || 'Club Announcement'
}

function extractClassDate(text: string): Date | null {
  const match = text.match(
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})\b/i,
  )
  if (!match) return null
  const parsed = new Date(match[0])
  return isNaN(parsed.getTime()) ? null : parsed
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
