import { timingSafeEqual } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import { config } from '../config.js'

function keysMatch(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

export function requireApiAccessKey(req: Request, res: Response, next: NextFunction): void {
  const expected = config.apiAccessKey
  if (!expected) {
    next()
    return
  }

  const provided = req.get('X-API-Key') ?? ''
  if (!provided || !keysMatch(provided, expected)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  next()
}
