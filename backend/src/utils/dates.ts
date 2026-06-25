export function extractDates(text: string): Date[] {
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

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function inferEinhornSessionHint(date: Date): string {
  const weekday = date.getDay()

  if (weekday === 3) {
    return 'Wednesday class at Elevate Fitness Complex (8:15–10:15 PM, Physical Therapy area)'
  }

  if (weekday === 0) {
    return 'Sunday class at Verdugo Woodlands Dad\'s Club (10:00 AM–1:00 PM)'
  }

  if (weekday === 1) {
    const weekOfMonth = Math.ceil(date.getDate() / 7)
    if (weekOfMonth === 1) {
      return 'First Monday class at Elevate Fitness Complex (8:30–10:30 PM, rear basketball court)'
    }
    if (weekOfMonth === 3) {
      return 'Third Monday class at Elevate Fitness Complex (8:30–10:30 PM, advanced/open sparring)'
    }
    return 'Monday class at Elevate — confirm whether this is the first or third Monday session'
  }

  return 'Find the scheduled session that matches this date'
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
