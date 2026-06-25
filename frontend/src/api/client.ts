import type { Platform, PostResult, RefineResult } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
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
