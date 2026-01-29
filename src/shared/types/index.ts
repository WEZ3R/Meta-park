export interface ServerStatus {
  isShutdown: boolean
  currentCamera: number
  startTime: number
  serverTime: number
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
