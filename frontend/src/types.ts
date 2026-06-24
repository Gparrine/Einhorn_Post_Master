export type Platform = 'discord' | 'facebook' | 'meetup' | 'gymdesk'

export type PostStatus = 'idle' | 'loading' | 'success' | 'error'

export interface PlatformState {
  status: PostStatus
  error?: string
  postUrl?: string
}

export type PlatformStates = Record<Platform, PlatformState>

export interface PostResult {
  platform: Platform
  success: boolean
  postUrl?: string
  error?: string
}

export interface RefineResult {
  content: string
}
