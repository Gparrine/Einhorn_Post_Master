import { timingSafeEqual } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import { config } from '../config.js'

function keysMatch(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

export function requireApiAccessKey(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'OPTIONS') {
    next()
    return
  }

  const expected = config.apiAccessKey
  if (!expected) {
    next()
    return
  }

  const provided = (req.get('X-API-Key') ?? '').trim()
  if (!provided || !keysMatch(provided, expected)) {
    res.status(401).json({
      error:
        'Unauthorized — API access key missing or invalid. Set matching API_ACCESS_KEY on Render and VITE_API_ACCESS_KEY on GitHub, then redeploy Pages.',
    })
    return
  }

  next()
}
