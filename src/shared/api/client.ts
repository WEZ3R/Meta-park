import { ServerStatus } from '../types'

let ip = '10.137.128.252' // Replace with your desired IP address

const API_BASE = import.meta.env.DEV ? 'http://'+ip+':3001' : ''

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

  login: async (password: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    return res.json()
  }
}
