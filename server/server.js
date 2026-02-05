import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Global state
let state = {
  isShutdown: false,
  blackScreenOpacity: 0, // 0-100
  currentCamera: 1,
  startTime: Date.now(),
  phase: 0,
  vitals: [true, true, true],
  batteryLevel: 100 // 0-100
}

const PASSWORD = '1234'

// Questionnaire stats: { [questionId]: { total, correct } }
const DATA_DIR = path.join(__dirname, 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const STATS_FILE = path.join(DATA_DIR, 'questionnaire-stats.json')
const SCORES_FILE = path.join(DATA_DIR, 'questionnaire-scores.json')

function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'))
    }
  } catch (e) {
    console.error('Failed to load questionnaire stats:', e)
  }
  return {}
}

function saveStats() {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(questionnaireStats, null, 2))
  } catch (e) {
    console.error('Failed to save questionnaire stats:', e)
  }
}

// Scores: array of { teamName, score, timestamp }
function loadScores() {
  try {
    if (fs.existsSync(SCORES_FILE)) {
      return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf-8'))
    }
  } catch (e) {
    console.error('Failed to load scores:', e)
  }
  return []
}

function saveScores() {
  try {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(questionnaireScores, null, 2))
  } catch (e) {
    console.error('Failed to save scores:', e)
  }
}

let questionnaireStats = loadStats()
let questionnaireScores = loadScores()

// Questionnaire live session (sync between tablets)
let questionnaireSession = {
  teamName: '',
  answers: {},    // { [questionId]: value }
  started: false,
  validated: false,
  score: null,
  stats: null
}

// Client errors storage (in-memory, limited to 100)
let clientErrors = []
const MAX_ERRORS = 100

// Middleware
app.use(cors())
app.use(express.json())

// Static files
app.use('/videos', express.static(path.join(__dirname, '../public/videos')))
app.use('/audio', express.static(path.join(__dirname, '../public/audio')))
app.use('/images', express.static(path.join(__dirname, '../public/images')))
app.use('/external-videos', express.static('/Volumes/ESD-ESP_1'))

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    isShutdown: state.isShutdown,
    blackScreenOpacity: state.blackScreenOpacity,
    currentCamera: state.currentCamera,
    startTime: state.startTime,
    serverTime: Date.now(),
    phase: state.phase,
    vitals: state.vitals,
    batteryLevel: state.batteryLevel
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

app.post('/api/setPhase', (req, res) => {
  const { phase } = req.body
  if (typeof phase === 'number' && phase >= 0) {
    state.phase = phase
    res.json({ success: true, phase: state.phase })
  } else {
    res.status(400).json({ error: 'phase must be a non-negative number' })
  }
})

app.post('/api/setVitals', (req, res) => {
  const { vitals } = req.body
  if (Array.isArray(vitals) && vitals.every(v => typeof v === 'boolean')) {
    state.vitals = vitals
    res.json({ success: true, vitals: state.vitals })
  } else {
    res.status(400).json({ error: 'vitals must be an array of booleans' })
  }
})

app.post('/api/setBlackScreenOpacity', (req, res) => {
  const { opacity } = req.body
  if (typeof opacity === 'number' && opacity >= 0 && opacity <= 100) {
    state.blackScreenOpacity = opacity
    res.json({ success: true, blackScreenOpacity: state.blackScreenOpacity })
  } else {
    res.status(400).json({ error: 'opacity must be a number between 0 and 100' })
  }
})

app.post('/api/setBatteryLevel', (req, res) => {
  const { level } = req.body
  if (typeof level === 'number' && level >= 0 && level <= 100) {
    state.batteryLevel = level
    res.json({ success: true, batteryLevel: state.batteryLevel })
  } else {
    res.status(400).json({ error: 'level must be a number between 0 and 100' })
  }
})

// Questionnaire submit
app.post('/api/questionnaire/submit', (req, res) => {
  const { results, teamName, score } = req.body
  if (!results || typeof results !== 'object') {
    return res.status(400).json({ error: 'results must be an object' })
  }
  for (const [id, correct] of Object.entries(results)) {
    if (!questionnaireStats[id]) {
      questionnaireStats[id] = { total: 0, correct: 0 }
    }
    questionnaireStats[id].total++
    if (correct) questionnaireStats[id].correct++
  }
  saveStats()

  // Save team score
  if (teamName && typeof score === 'number') {
    questionnaireScores.push({ teamName, score, timestamp: Date.now() })
    saveScores()
  }

  res.json({ success: true, stats: questionnaireStats })
})

app.get('/api/questionnaire/stats', (req, res) => {
  res.json({ stats: questionnaireStats })
})

app.post('/api/questionnaire/reset', (req, res) => {
  questionnaireStats = {}
  saveStats()
  res.json({ success: true })
})

// Scoring endpoints
app.get('/api/scores', (req, res) => {
  res.json({ scores: questionnaireScores })
})

app.post('/api/scores/reset', (req, res) => {
  questionnaireScores = []
  saveScores()
  res.json({ success: true })
})

// Reset all
app.post('/api/reset-all', (req, res) => {
  state = {
    isShutdown: false,
    blackScreenOpacity: 0,
    currentCamera: 1,
    startTime: Date.now(),
    phase: 0,
    vitals: [true, true, true],
    batteryLevel: 100
  }
  questionnaireStats = {}
  saveStats()
  questionnaireSession = {
    teamName: '',
    answers: {},
    started: false,
    validated: false,
    score: null,
    stats: null
  }
  res.json({ success: true })
})

app.post('/api/login', (req, res) => {
  const { password } = req.body
  if (password === PASSWORD) {
    res.json({ success: true })
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' })
  }
})

// Questionnaire session endpoints (sync between tablets)
app.get('/api/questionnaire/session', (req, res) => {
  res.json(questionnaireSession)
})

app.post('/api/questionnaire/session/team', (req, res) => {
  const { teamName } = req.body
  if (typeof teamName === 'string') {
    questionnaireSession.teamName = teamName
    res.json({ success: true, teamName })
  } else {
    res.status(400).json({ error: 'teamName must be a string' })
  }
})

app.post('/api/questionnaire/session/start', (req, res) => {
  questionnaireSession.started = true
  res.json({ success: true })
})

app.post('/api/questionnaire/session/answer', (req, res) => {
  const { questionId, value } = req.body
  if (questionId === undefined) {
    return res.status(400).json({ error: 'questionId is required' })
  }
  questionnaireSession.answers[questionId] = value
  res.json({ success: true })
})

app.post('/api/questionnaire/session/validate', (req, res) => {
  const { score, stats } = req.body
  questionnaireSession.validated = true
  questionnaireSession.score = score ?? null
  questionnaireSession.stats = stats ?? null
  res.json({ success: true })
})

app.post('/api/questionnaire/session/reset', (req, res) => {
  questionnaireSession = {
    teamName: '',
    answers: {},
    started: false,
    validated: false,
    score: null,
    stats: null
  }
  res.json({ success: true })
})

// Client errors endpoints
app.post('/api/errors', (req, res) => {
  const { message, stack, source, type } = req.body
  if (!message || !source || !type) {
    return res.status(400).json({ error: 'message, source and type are required' })
  }
  const error = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    message,
    stack: stack || null,
    source,
    timestamp: Date.now(),
    type
  }
  clientErrors.unshift(error)
  if (clientErrors.length > MAX_ERRORS) {
    clientErrors = clientErrors.slice(0, MAX_ERRORS)
  }
  res.json({ success: true, error })
})

app.get('/api/errors', (req, res) => {
  res.json({ errors: clientErrors })
})

app.delete('/api/errors', (req, res) => {
  clientErrors = []
  res.json({ success: true })
})

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
