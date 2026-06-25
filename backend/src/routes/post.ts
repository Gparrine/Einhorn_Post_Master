import { Router } from 'express'
import { postToDiscord, verifyDiscordPost } from '../services/discord.js'
import { postToFacebook, verifyFacebookPost } from '../services/facebook.js'
import { postToMeetup, verifyMeetupPost } from '../services/meetup.js'
import { postToGymdesk, verifyGymdeskPost } from '../services/gymdesk.js'
import { canUseService } from '../config.js'

type Platform = 'discord' | 'facebook' | 'meetup' | 'gymdesk'

interface PostHandlerResult {
  postId: string
  postUrl?: string
  mode?: 'manual'
  copyText?: string
  instructions?: string
}

const router = Router()

const postHandlers: Record<
  Platform,
  (content: string, plainText: string) => Promise<PostHandlerResult>
> = {
  discord: postToDiscord,
  facebook: postToFacebook,
  meetup: postToMeetup,
  gymdesk: postToGymdesk,
}

const verifyHandlers: Record<
  Platform,
  (postId: string) => Promise<{ verified: boolean; error?: string }>
> = {
  discord: verifyDiscordPost,
  facebook: verifyFacebookPost,
  meetup: verifyMeetupPost,
  gymdesk: verifyGymdeskPost,
}

router.post('/:platform', async (req, res, next) => {
  try {
    const platform = req.params.platform as Platform
    const { content, plainText } = req.body

    if (!['discord', 'facebook', 'meetup', 'gymdesk'].includes(platform)) {
      res.status(400).json({ error: `Unknown platform: ${platform}` })
      return
    }

    if (!plainText?.trim()) {
      res.status(400).json({ error: 'Post text is required.' })
      return
    }

    if (!canUseService(platform)) {
      res.status(503).json({
        success: false,
        platform,
        error: `${platform} is not configured. Check backend environment variables.`,
      })
      return
    }

    const handler = postHandlers[platform]
    const result = await handler(content || plainText, plainText)

    const verification = await verifyHandlers[platform](result.postId)

    if (!verification.verified) {
      res.json({
        success: false,
        platform,
        error: verification.error || 'Post could not be verified after submission.',
      })
      return
    }

    const payload: Record<string, unknown> = {
      success: true,
      platform,
      postId: result.postId,
      postUrl: result.postUrl,
    }

    if (result.mode === 'manual') {
      payload.mode = result.mode
      payload.copyText = result.copyText
      payload.instructions = result.instructions
    }

    res.json(payload)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Post failed'
    res.json({
      success: false,
      platform: req.params.platform,
      error: message,
    })
  }
})

router.get('/verify/:platform/:postId', async (req, res, next) => {
  try {
    const platform = req.params.platform as Platform
    const { postId } = req.params

    if (!verifyHandlers[platform]) {
      res.status(400).json({ error: `Unknown platform: ${platform}` })
      return
    }

    const result = await verifyHandlers[platform](postId)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router
