import fetch from 'node-fetch'
import { config, hasCredentials } from '../config.js'

interface PostResult {
  postId: string
  postUrl?: string
}

export async function postToFacebook(content: string, plainText: string): Promise<PostResult> {
  if (config.demoMode && !hasCredentials('facebook')) {
    await delay(1400)
    return { postId: `demo-facebook-${Date.now()}`, postUrl: 'https://facebook.com/groups/demo' }
  }

  const { accessToken, groupId } = config.facebook
  const message = plainText.slice(0, 63206)

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${groupId}/feed`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: accessToken }),
    },
  )

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: { message?: string } }
    throw new Error(err.error?.message || `Facebook API error (${response.status})`)
  }

  const data = (await response.json()) as { id: string }
  return {
    postId: data.id,
    postUrl: `https://facebook.com/${data.id}`,
  }
}

export async function verifyFacebookPost(postId: string): Promise<{ verified: boolean; error?: string }> {
  if (postId.startsWith('demo-')) return { verified: true }

  const { accessToken } = config.facebook

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${postId}?fields=id&access_token=${accessToken}`,
  )

  if (response.ok) return { verified: true }
  return { verified: false, error: 'Could not verify Facebook post was published.' }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
