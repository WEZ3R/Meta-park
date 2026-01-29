import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Global state
let state = {
  isShutdown: false,
  currentCamera: 1,
  startTime: Date.now()
}

const PASSWORD = '1234'

// Middleware
app.use(cors())
app.use(express.json())

// Static files
app.use('/videos', express.static(path.join(__dirname, '../public/videos')))
app.use('/audio', express.static(path.join(__dirname, '../public/audio')))
app.use('/images', express.static(path.join(__dirname, '../public/images')))

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    isShutdown: state.isShutdown,
    currentCamera: state.currentCamera,
    startTime: state.startTime,
    serverTime: Date.now()
  })
})

app.post('/api/updateState', (req, res) => {
  const { shutdown } = req.body
  if (typeof shutdown === 'boolean') {
    state.isShutdown = shutdown
    res.json({ success: true, isShutdown: state.isShutdown })
  } else {
    res.status(400).json({ error: 'shutdown must be a boolean' })
  }
})

app.post('/api/setCamera', (req, res) => {
  const { camera } = req.body
  if (camera >= 1 && camera <= 4) {
    state.currentCamera = camera
    res.json({ success: true, currentCamera: state.currentCamera })
  } else {
    res.status(400).json({ error: 'camera must be 1-4' })
  }
})

app.post('/api/login', (req, res) => {
  const { password } = req.body
  if (password === PASSWORD) {
    res.json({ success: true })
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' })
  }
})

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
