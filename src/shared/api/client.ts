import { ServerStatus, ClientError, QuestionnaireSession } from '../types'

let ip = '10.14.73.183' // Replace with your desired IP address

const API_BASE = import.meta.env.DEV ? 'http://'+ip+':8080' : ''

export const api = {
  getStatus: async (): Promise<ServerStatus> => {
    const res = await fetch(`${API_BASE}/api/status`)
    return res.json()
  },

  updateState: async (shutdown: boolean): Promise<{ success: boolean; isShutdown: boolean }> => {
    const res = await fetch(`${API_BASE}/api/updateState`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shutdown })
    })
    return res.json()
  },

  setCamera: async (camera: number): Promise<{ success: boolean; currentCamera: number }> => {
    const res = await fetch(`${API_BASE}/api/setCamera`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ camera })
    })
    return res.json()
  },

  setPhase: async (phase: number): Promise<{ success: boolean; phase: number }> => {
    const res = await fetch(`${API_BASE}/api/setPhase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase })
    })
    return res.json()
  },

  setVitals: async (vitals: boolean[]): Promise<{ success: boolean; vitals: boolean[] }> => {
    const res = await fetch(`${API_BASE}/api/setVitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vitals })
    })
    return res.json()
  },

  setBlackScreenOpacity: async (opacity: number): Promise<{ success: boolean; blackScreenOpacity: number }> => {
    const res = await fetch(`${API_BASE}/api/setBlackScreenOpacity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opacity })
    })
    return res.json()
  },

  submitQuestionnaire: async (results: Record<number, boolean>, teamName: string, score: number): Promise<{ success: boolean; stats: Record<number, { total: number; correct: number }> }> => {
    const res = await fetch(`${API_BASE}/api/questionnaire/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results, teamName, score })
    })
    return res.json()
  },

  getScores: async (): Promise<{ scores: { teamName: string; score: number; timestamp: number }[] }> => {
    const res = await fetch(`${API_BASE}/api/scores`)
    return res.json()
  },

  resetAll: async (): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/api/reset-all`, { method: 'POST' })
    return res.json()
  },

  login: async (password: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    return res.json()
  },

  logError: async (error: Omit<ClientError, 'id' | 'timestamp'>): Promise<{ success: boolean; error: ClientError }> => {
    const res = await fetch(`${API_BASE}/api/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    })
    return res.json()
  },

  getErrors: async (): Promise<{ errors: ClientError[] }> => {
    const res = await fetch(`${API_BASE}/api/errors`)
    return res.json()
  },

  clearErrors: async (): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/api/errors`, { method: 'DELETE' })
    return res.json()
  },

  // Questionnaire session sync
  getSession: async (): Promise<QuestionnaireSession> => {
    const res = await fetch(`${API_BASE}/api/questionnaire/session`)
    return res.json()
  },

  setSessionTeam: async (teamName: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/api/questionnaire/session/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName })
    })
    return res.json()
  },

  startSession: async (): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/api/questionnaire/session/start`, { method: 'POST' })
    return res.json()
  },

  setSessionAnswer: async (questionId: number, value: string | string[]): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/api/questionnaire/session/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, value })
    })
    return res.json()
  },

  validateSession: async (score: number, stats: Record<number, { total: number; correct: number }> | null): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/api/questionnaire/session/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, stats })
    })
    return res.json()
  },

  resetSession: async (): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/api/questionnaire/session/reset`, { method: 'POST' })
    return res.json()
  }
}
