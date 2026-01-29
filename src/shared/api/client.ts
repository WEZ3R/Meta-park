import { ServerStatus } from '../types'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : ''

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

  login: async (password: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    return res.json()
  }
}
