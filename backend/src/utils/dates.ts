const MONTH_NAMES: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
}

export function extractDates(text: string, referenceYear = new Date().getFullYear()): Date[] {
  const dates: Date[] = []
  const seen = new Set<string>()

  const addDate = (date: Date) => {
    if (isNaN(date.getTime())) return
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    if (seen.has(key)) return
    seen.add(key)
    dates.push(date)
  }

  const patternsWithYear = [
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{4}-\d{2}-\d{2}\b/g,
  ]

  for (const pattern of patternsWithYear) {
    for (const match of text.matchAll(pattern)) {
      addDate(new Date(match[0]))
    }
  }

  const monthDayPattern =
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+(\d{1,2})(?!\s*,?\s*\d{4})\b/gi

  for (const match of text.matchAll(monthDayPattern)) {
    const month = MONTH_NAMES[match[1].toLowerCase().replace('.', '')]
    const day = Number(match[2])
    if (month !== undefined) {
      addDate(new Date(referenceYear, month, day))
    }
  }

  const slashPattern = /\b(\d{1,2})\/(\d{1,2})(?!\/\d)\b/g
  for (const match of text.matchAll(slashPattern)) {
    const month = Number(match[1])
    const day = Number(match[2])
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      addDate(new Date(referenceYear, month - 1, day))
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
