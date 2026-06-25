/**
 * Extract Meetup group urlname from a slug or pasted group URL.
 * Accepts: einhorn-la-medieval-martial-arts
 *          https://www.meetup.com/einhorn-la-medieval-martial-arts/
 */
export function normalizeMeetupGroupUrlname(raw: string): string {
  let value = raw.trim()
  if (!value) return ''

  if (/meetup\.com/i.test(value)) {
    try {
      const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
      const url = new URL(withProtocol)
      const slug = url.pathname.split('/').filter(Boolean)[0]
      if (slug) return slug
    } catch {
      /* fall through */
    }

    value = value.replace(/^https?:\/\/?(www\.)?meetup\.com\/?/i, '')
  }

  value = value.replace(/^\/+|\/+$/g, '')
  return value.split('/').filter(Boolean)[0] ?? ''
}

export function meetupGroupEventsUrl(groupUrlname: string): string {
  const slug = normalizeMeetupGroupUrlname(groupUrlname)
  return `https://www.meetup.com/${slug}/events/`
}

export function meetupEventUrl(groupUrlname: string, eventId: string): string {
  const slug = normalizeMeetupGroupUrlname(groupUrlname)
  return `https://www.meetup.com/${slug}/events/${eventId}/`
}
