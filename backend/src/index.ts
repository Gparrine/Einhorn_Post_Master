import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import refineRouter from './routes/refine.js'
import postRouter from './routes/post.js'
import { config } from './config.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:5173', 'https://gparrine.github.io']

app.disable('x-powered-by')
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
)
app.use(cors({ origin: allowedOrigins, credentials: false }))
app.use(express.json({ limit: '1mb' }))

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'einhorn-postmaster', health: '/api/health' })
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'einhorn-postmaster' })
})

app.use('/api/refine', refineRouter)
app.use('/api/post', postRouter)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Einhorn Postmaster API running on port ${PORT}`)
})
