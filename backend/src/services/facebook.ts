import { config, hasCredentials } from '../config.js'

export interface FacebookPostResult {
  postId: string
  postUrl: string
  mode: 'manual'
  copyText: string
  instructions: string
}

export async function postToFacebook(content: string, plainText: string): Promise<FacebookPostResult> {
  const copyText = formatForFacebook(content, plainText)
  const groupUrl = config.facebook.groupUrl

  if (!groupUrl) {
    throw new Error(
      'Facebook group URL is not configured. Set FACEBOOK_GROUP_URL on the backend (Render environment).',
    )
  }

  if (config.demoMode && !hasCredentials('facebook')) {
    await delay(900)
    return {
      postId: `demo-facebook-${Date.now()}`,
      postUrl: 'https://www.facebook.com/groups/demo',
      mode: 'manual',
      copyText,
      instructions: 'Demo mode: copy the post and paste it into your Facebook group manually.',
    }
  }

  return {
    postId: `manual-facebook-${Date.now()}`,
    postUrl: groupUrl,
    mode: 'manual',
    copyText,
    instructions:
      'Post text copied to clipboard. Paste into the Facebook group composer and click Post.',
  }
}

export async function verifyFacebookPost(postId: string): Promise<{ verified: boolean; error?: string }> {
  if (postId.startsWith('demo-') || postId.startsWith('manual-')) {
    return config.facebook.groupUrl
      ? { verified: true }
      : { verified: false, error: 'Facebook group URL is not configured.' }
  }

  return { verified: false, error: 'Unknown Facebook post reference.' }
}

function formatForFacebook(html: string, plainText: string): string {
  const text = plainText.trim() || stripHtml(html)
  return text.slice(0, 63206)
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
