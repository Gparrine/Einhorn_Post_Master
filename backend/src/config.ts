import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const backendRoot = path.join(moduleDir, '..')

function loadPromptFromFile(): string | null {
  const promptFile =
    process.env.GEMINI_PROMPT_FILE ||
    path.join(backendRoot, 'prompts', 'einhorn-gem.prompt.md')

  try {
    if (fs.existsSync(promptFile)) {
      return fs.readFileSync(promptFile, 'utf-8').trim()
    }
  } catch {
    /* ignore */
  }
  return null
}

function defaultGemPrompt(): string {
  return `You are the Einhorn martial arts club post editor. Refine draft announcements to be clear, friendly, and professional for martial arts club members.

Preserve all dates, times, locations, and important details.
Return only refined HTML using <p>, <strong>, <em>, <ul>, <li> tags. No markdown fences or explanations.`
}

function resolveSystemPrompt(): string {
  if (process.env.GEMINI_SYSTEM_PROMPT?.trim()) {
    return process.env.GEMINI_SYSTEM_PROMPT.trim()
  }
  return loadPromptFromFile() || defaultGemPrompt()
}

export const config = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    systemPrompt: resolveSystemPrompt(),
    temperature: Number(process.env.GEMINI_TEMPERATURE ?? '0.7'),
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
