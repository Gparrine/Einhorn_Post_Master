export const config = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    systemPrompt: process.env.GEMINI_SYSTEM_PROMPT || defaultGemPrompt(),
  },
  discord: {
    botToken: process.env.DISCORD_BOT_TOKEN || '',
    channelId: process.env.DISCORD_CHANNEL_ID || '',
  },
  facebook: {
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
    groupId: process.env.FACEBOOK_GROUP_ID || '',
  },
  meetup: {
    apiKey: process.env.MEETUP_API_KEY || '',
    groupUrlname: process.env.MEETUP_GROUP_URLNAME || '',
  },
  gymdesk: {
    apiKey: process.env.GYMDESK_API_KEY || '',
    apiUrl: process.env.GYMDESK_API_URL || 'https://api.gymdesk.com',
    locationId: process.env.GYMDESK_LOCATION_ID || '',
  },
  demoMode: process.env.DEMO_MODE === 'true',
}

function defaultGemPrompt(): string {
  return `You are the Einhorn martial arts club post editor. Refine the user's draft announcement to be:
- Clear, friendly, and professional
- Appropriate for martial arts club members
- Well-formatted with proper paragraphs
- Concise but complete

Preserve any dates, times, locations, and important details mentioned.
Return only the refined post text in HTML format (using <p>, <strong>, <ul>, <li> tags as appropriate).
Do not add markdown fences or explanations.`
}

export function hasCredentials(service: 'discord' | 'facebook' | 'meetup' | 'gymdesk' | 'gemini'): boolean {
  switch (service) {
    case 'gemini':
      return !!config.gemini.apiKey
    case 'discord':
      return !!config.discord.botToken && !!config.discord.channelId
    case 'facebook':
      return !!config.facebook.accessToken && !!config.facebook.groupId
    case 'meetup':
      return !!config.meetup.apiKey && !!config.meetup.groupUrlname
    case 'gymdesk':
      return !!config.gymdesk.apiKey && !!config.gymdesk.locationId
    default:
      return false
  }
}

export function canUseService(service: 'discord' | 'facebook' | 'meetup' | 'gymdesk' | 'gemini'): boolean {
  return hasCredentials(service) || config.demoMode
}
