export interface ServerStatus {
  isShutdown: boolean
  isBlackScreen: boolean
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
