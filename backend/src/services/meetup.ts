import fetch from 'node-fetch'
import { config, hasCredentials } from '../config.js'

interface PostResult {
  postId: string
  postUrl?: string
}

export async function postToMeetup(content: string, plainText: string): Promise<PostResult> {
  if (config.demoMode && !hasCredentials('meetup')) {
    await delay(1600)
    return { postId: `demo-meetup-${Date.now()}`, postUrl: 'https://meetup.com/demo/events' }
  }

  const eventId = await findEventByDate(plainText)

  if (!eventId) {
    throw new Error(
      'No Meetup event found matching a date in your post. Include a date (e.g. "June 24, 2026") that matches an upcoming event.',
    )
  }

  const { apiKey } = config.meetup

  const response = await fetch(`https://api.meetup.com/${config.meetup.groupUrlname}/events/${eventId}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment: plainText.slice(0, 65535) }),
  })

  if (!response.ok) {
    const err = (await response.text().catch(() => '')) || `Meetup API error (${response.status})`
    throw new Error(typeof err === 'string' ? err : 'Meetup post failed')
  }

  const data = (await response.json()) as { id?: number; comment_id?: number }
  const commentId = String(data.id || data.comment_id || Date.now())

  return {
    postId: `${eventId}-${commentId}`,
    postUrl: `https://www.meetup.com/${config.meetup.groupUrlname}/events/${eventId}/`,
  }
}

export async function verifyMeetupPost(postId: string): Promise<{ verified: boolean; error?: string }> {
  if (postId.startsWith('demo-')) return { verified: true }

  const [eventId] = postId.split('-')
  const { apiKey, groupUrlname } = config.meetup

  const response = await fetch(
    `https://api.meetup.com/${groupUrlname}/events/${eventId}`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  )

  if (response.ok) return { verified: true }
  return { verified: false, error: 'Could not verify Meetup event post.' }
}

async function findEventByDate(text: string): Promise<string | null> {
  const dates = extractDates(text)
  if (dates.length === 0) return null

  const { apiKey, groupUrlname } = config.meetup

  const response = await fetch(
    `https://api.meetup.com/${groupUrlname}/events?status=upcoming`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  )

  if (!response.ok) return null

  const events = (await response.json()) as Array<{ id: number; time: number; name: string }>

  for (const date of dates) {
    const match = events.find((event) => {
      const eventDate = new Date(event.time)
      return sameDay(eventDate, date)
    })
    if (match) return String(match.id)
  }

  return events[0] ? String(events[0].id) : null
}

function extractDates(text: string): Date[] {
  const dates: Date[] = []

  const patterns = [
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{4}-\d{2}-\d{2}\b/g,
  ]

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const parsed = new Date(match[0])
      if (!isNaN(parsed.getTime())) dates.push(parsed)
    }
  }

  return dates
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
