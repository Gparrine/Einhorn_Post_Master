import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import refineRouter from './routes/refine.js'
import postRouter from './routes/post.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'https://gparrine.github.io']

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'einhorn-postmaster' })
})

app.use('/api/refine', refineRouter)
app.use('/api/post', postRouter)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Einhorn Postmaster API running on port ${PORT}`)
})
