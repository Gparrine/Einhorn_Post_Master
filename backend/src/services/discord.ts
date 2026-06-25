import fetch from 'node-fetch'
import { config, hasCredentials } from '../config.js'

interface PostResult {
  postId: string
  postUrl?: string
}

export async function postToDiscord(content: string, plainText: string): Promise<PostResult> {
  if (config.demoMode && !hasCredentials('discord')) {
    await delay(1200)
    return { postId: `demo-discord-${Date.now()}`, postUrl: 'https://discord.com/channels/demo' }
  }

  const { botToken, channelId } = config.discord

  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: plainText.slice(0, 2000),
      embeds: content.includes('<')
        ? [{ description: stripHtml(content).slice(0, 4096), color: 0x355e3b }]
        : undefined,
    }),
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { message?: string }
    throw new Error(err.message || `Discord API error (${response.status})`)
  }

  const data = (await response.json()) as { id: string }
  return {
    postId: data.id,
    postUrl: `https://discord.com/channels/@me/${channelId}/${data.id}`,
  }
}

export async function verifyDiscordPost(postId: string): Promise<{ verified: boolean; error?: string }> {
  if (postId.startsWith('demo-')) return { verified: true }

  const { botToken, channelId } = config.discord

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages/${encodeURIComponent(postId)}`,
    { headers: { Authorization: `Bot ${botToken}` } },
  )

  if (response.ok) return { verified: true }
  return { verified: false, error: 'Could not verify Discord message was posted.' }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
