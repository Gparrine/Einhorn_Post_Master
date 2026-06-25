import fetch from 'node-fetch'
import { config, hasCredentials, hasMeetupApiAccess } from '../config.js'
import { extractDates, formatDateLong, stripHtml } from '../utils/dates.js'

const MEETUP_GQL_URL = 'https://api.meetup.com/gql-ext'
const UPCOMING_EVENTS_LIMIT = 50

export interface MeetupPostResult {
  postId: string
  postUrl: string
  mode?: 'manual'
  copyText?: string
  instructions?: string
  matchedDate?: string
  eventTitle?: string
}

interface MeetupEventSummary {
  id: string
  title: string
  dateTime: string
  eventUrl: string
}

export async function postToMeetup(content: string, plainText: string): Promise<MeetupPostResult> {
  const classDate = extractDates(plainText)[0] ?? extractDates(content)[0]

  if (!classDate) {
    throw new Error(
      'No event date found in your post. Include a month and day (e.g. "June 28" or "6/28") — the current year is assumed.',
    )
  }

  const { groupUrlname } = config.meetup
  if (!groupUrlname) {
    throw new Error(
      'Meetup group is not configured. Set MEETUP_GROUP_URLNAME on the backend (Render environment).',
    )
  }

  const copyText = formatForMeetupDescription(content, plainText)
  const dateLabel = formatDateLong(classDate)

  if (config.demoMode && !hasCredentials('meetup')) {
    await delay(900)
    return {
      postId: `demo-meetup-${Date.now()}`,
      postUrl: `https://www.meetup.com/${groupUrlname}/events/`,
      mode: 'manual',
      copyText,
      instructions: `Demo mode: copy the post and paste it into the Meetup event description for ${dateLabel}.`,
      matchedDate: dateLabel,
    }
  }

  if (hasMeetupApiAccess()) {
    return postToMeetupViaApi(classDate, dateLabel, copyText, groupUrlname)
  }

  return {
    postId: `manual-meetup-${Date.now()}`,
    postUrl: `https://www.meetup.com/${groupUrlname}/events/`,
    mode: 'manual',
    copyText,
    instructions:
      `Post copied. On Meetup, find the event for ${dateLabel}, open Edit, and paste into the Description field.`,
    matchedDate: dateLabel,
  }
}

export async function verifyMeetupPost(postId: string): Promise<{ verified: boolean; error?: string }> {
  if (postId.startsWith('demo-') || postId.startsWith('manual-')) {
    return config.meetup.groupUrlname
      ? { verified: true }
      : { verified: false, error: 'Meetup group URL name is not configured.' }
  }

  if (postId.startsWith('api-meetup-')) {
    const eventId = postId.replace(/^api-meetup-/, '')
    if (!hasMeetupApiAccess()) {
      return { verified: false, error: 'Meetup API credentials are not configured.' }
    }

    try {
      const event = await fetchEventById(eventId, config.meetup.apiKey)
      return event ? { verified: true } : { verified: false, error: 'Could not verify Meetup event update.' }
    } catch {
      return { verified: false, error: 'Could not verify Meetup event update.' }
    }
  }

  return { verified: false, error: 'Unknown Meetup post reference.' }
}

async function postToMeetupViaApi(
  classDate: Date,
  dateLabel: string,
  copyText: string,
  groupUrlname: string,
): Promise<MeetupPostResult> {
  const { apiKey } = config.meetup
  const match = await findEventByDate(groupUrlname, apiKey, classDate)

  if (!match) {
    throw new Error(
      `No upcoming Meetup event found for ${dateLabel}. Create the event on Meetup first, or check the date in your post.`,
    )
  }

  await updateEventDescription(match.id, copyText, apiKey)

  return {
    postId: `api-meetup-${match.id}`,
    postUrl: match.eventUrl || `https://www.meetup.com/${groupUrlname}/events/${match.id}/`,
    matchedDate: dateLabel,
    eventTitle: match.title,
  }
}

async function findEventByDate(
  groupUrlname: string,
  accessToken: string,
  targetDate: Date,
): Promise<MeetupEventSummary | null> {
  const data = await meetupGraphql<{
    groupByUrlname: {
      upcomingEvents: {
        edges: Array<{ node: MeetupEventSummary }>
      }
    } | null
  }>(
    `
      query GetUpcomingEvents($urlname: String!, $first: Int!) {
        groupByUrlname(urlname: $urlname) {
          upcomingEvents(input: { first: $first }) {
            edges {
              node {
                id
                title
                dateTime
                eventUrl
              }
            }
          }
        }
      }
    `,
    { urlname: groupUrlname, first: UPCOMING_EVENTS_LIMIT },
    accessToken,
  )

  const events = data.groupByUrlname?.upcomingEvents.edges.map((edge) => edge.node) ?? []

  return (
    events.find((event) => {
      const eventDate = new Date(event.dateTime)
      return sameDay(eventDate, targetDate)
    }) ?? null
  )
}

async function updateEventDescription(
  eventId: string,
  description: string,
  accessToken: string,
): Promise<void> {
  const data = await meetupGraphql<{
    editEvent: {
      event: { id: string } | null
      errors: Array<{ message: string }>
    }
  }>(
    `
      mutation EditEventDescription($input: EditEventInput!) {
        editEvent(input: $input) {
          event {
            id
          }
          errors {
            message
          }
        }
      }
    `,
    {
      input: {
        eventId,
        description: description.slice(0, 50000),
      },
    },
    accessToken,
  )

  const errors = data.editEvent.errors?.map((entry) => entry.message).filter(Boolean) ?? []
  if (errors.length > 0) {
    throw new Error(errors.join('; '))
  }

  if (!data.editEvent.event?.id) {
    throw new Error('Meetup did not confirm the event description update.')
  }
}

async function fetchEventById(eventId: string, accessToken: string): Promise<{ id: string } | null> {
  const data = await meetupGraphql<{
    event: { id: string } | null
  }>(
    `
      query GetEvent($eventId: ID!) {
        event(id: $eventId) {
          id
        }
      }
    `,
    { eventId },
    accessToken,
  )

  return data.event
}

async function meetupGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
  accessToken: string,
): Promise<T> {
  const response = await fetch(MEETUP_GQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    const err = (await response.text().catch(() => '')) || `Meetup API error (${response.status})`
    throw new Error(typeof err === 'string' ? err : 'Meetup request failed')
  }

  const json = (await response.json()) as {
    data?: T
    errors?: Array<{ message: string }>
  }

  if (json.errors?.length) {
    throw new Error(json.errors.map((entry) => entry.message).join('; '))
  }

  if (!json.data) {
    throw new Error('Meetup API returned no data.')
  }

  return json.data
}

function formatForMeetupDescription(html: string, plainText: string): string {
  return (plainText.trim() || stripHtml(html)).slice(0, 50000)
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
