import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api } from '../api/client'
import { ServerStatus } from '../types'

interface AppContextValue {
  status: ServerStatus | null
  loading: boolean
  error: string | null
  updateShutdown: (shutdown: boolean) => Promise<void>
  setCamera: (camera: number) => Promise<void>
  refetchStatus: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getStatus()
      setStatus(data)
      setLoading(false)
      setError(null)
    } catch {
      setError('Failed to connect to server')
    }
  }, [])

  const updateShutdown = useCallback(async (shutdown: boolean) => {
    const result = await api.updateState(shutdown)
    if (result.success) {
      setStatus(prev => prev ? { ...prev, isShutdown: result.isShutdown } : null)
    }
  }, [])

  const setCameraState = useCallback(async (camera: number) => {
    const result = await api.setCamera(camera)
    if (result.success) {
      setStatus(prev => prev ? { ...prev, currentCamera: result.currentCamera } : null)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 500)
    return () => clearInterval(interval)
  }, [fetchStatus])

  return (
    <AppContext.Provider value={{ status, loading, error, updateShutdown, setCamera: setCameraState, refetchStatus: fetchStatus }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
