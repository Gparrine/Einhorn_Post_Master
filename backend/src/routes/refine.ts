import { Router } from 'express'
import { refineText } from '../services/gemini.js'
import { canUseService } from '../config.js'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const { content, plainText } = req.body

    if (!plainText?.trim()) {
      res.status(400).json({ error: 'No text provided to refine.' })
      return
    }

    if (!canUseService('gemini')) {
      res.status(503).json({
        error: 'Gemini API is not configured. Set GEMINI_API_KEY in backend environment.',
      })
      return
    }

    const refined = await refineText(content || plainText, plainText)
    res.json({ content: refined })
  } catch (err) {
    next(err)
  }
})

export default router
