import type { Platform, PostResult, RefineResult } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || ''
const API_ACCESS_KEY = (import.meta.env.VITE_API_ACCESS_KEY || '').trim()

function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (API_ACCESS_KEY) {
    headers['X-API-Key'] = API_ACCESS_KEY
  }
  return headers
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...apiHeaders(),
      ...options?.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        data.error ||
          'Unauthorized — set VITE_API_ACCESS_KEY on GitHub (same value as Render API_ACCESS_KEY) and redeploy Pages.',
      )
    }
    throw new Error(data.error || data.message || `Request failed (${response.status})`)
  }

  return data as T
}

export async function refineWithAI(content: string, plainText: string): Promise<RefineResult> {
  return request<RefineResult>('/api/refine', {
    method: 'POST',
    body: JSON.stringify({ content, plainText }),
  })
}

export async function postToPlatform(platform: Platform, content: string, plainText: string): Promise<PostResult> {
  return request<PostResult>(`/api/post/${platform}`, {
    method: 'POST',
    body: JSON.stringify({ content, plainText }),
  })
}

export async function verifyPost(platform: Platform, postId: string): Promise<{ verified: boolean; error?: string }> {
  return request(`/api/post/verify/${platform}/${encodeURIComponent(postId)}`)
}
