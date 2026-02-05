export interface ServerStatus {
  isShutdown: boolean
  blackScreenOpacity: number // 0-100
  currentCamera: number
  startTime: number
  serverTime: number
  vitals: boolean[]
  phase: number
}

export interface AppState {
  status: ServerStatus | null
  loading: boolean
  error: string | null
}

export interface AuthState {
  isAuthenticated: boolean
  loading: boolean
}

export interface ClientError {
  id: string
  message: string
  stack?: string
  source: string // page où l'erreur s'est produite
  timestamp: number
  type: 'error' | 'unhandledrejection' | 'console.error'
}
