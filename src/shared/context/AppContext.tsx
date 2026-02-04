import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { api } from '../api/client'
import { ServerStatus } from '../types'

interface AppContextValue {
  status: ServerStatus | null
  loading: boolean
  error: string | null
  updateShutdown: (shutdown: boolean) => Promise<void>
  setBlackScreenOpacity: (opacity: number) => Promise<void>
  setCamera: (camera: number) => Promise<void>
  setPhase: (phase: number) => Promise<void>
  setVitals: (vitals: boolean[]) => Promise<void>
  refetchStatus: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastLocalUpdate = useRef(0)

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getStatus()
      const localPhase = localStorage.getItem('metapark_phase')
      const localVitals = localStorage.getItem('metapark_vitals')
      const localShutdown = localStorage.getItem('metapark_shutdown')
      if (data.phase === undefined && localPhase !== null) {
        data.phase = Number(localPhase)
      }
      if (data.vitals === undefined && localVitals !== null) {
        data.vitals = JSON.parse(localVitals)
      }
      if (data.isShutdown === undefined && localShutdown !== null) {
        data.isShutdown = localShutdown === 'true'
      }
      if (Date.now() - lastLocalUpdate.current < 2000) {
        setStatus(prev => prev ? { ...prev, ...data, phase: prev.phase, vitals: prev.vitals, isShutdown: prev.isShutdown } : data)
      } else {
        setStatus(data)
      }
      setLoading(false)
      setError(null)
    } catch {
      const localPhase = localStorage.getItem('metapark_phase')
      const localVitals = localStorage.getItem('metapark_vitals')
      const localShutdown = localStorage.getItem('metapark_shutdown')
      setStatus(prev => ({
        isShutdown: localShutdown !== null ? localShutdown === 'true' : false,
        blackScreenOpacity: 0,
        currentCamera: 1,
        startTime: 0,
        serverTime: 0,
        phase: localPhase !== null ? Number(localPhase) : 0,
        vitals: localVitals !== null ? JSON.parse(localVitals) : [true, true, true],
        ...prev,
        ...(localShutdown !== null ? { isShutdown: localShutdown === 'true' } : {}),
        ...(localPhase !== null ? { phase: Number(localPhase) } : {}),
        ...(localVitals !== null ? { vitals: JSON.parse(localVitals) } : {}),
      }))
      setLoading(false)
      setError('Failed to connect to server')
    }
  }, [])

  const updateShutdown = useCallback(async (shutdown: boolean) => {
    lastLocalUpdate.current = Date.now()
    localStorage.setItem('metapark_shutdown', String(shutdown))
    setStatus(prev => prev ? { ...prev, isShutdown: shutdown } : null)
    try {
      const result = await api.updateState(shutdown)
      if (result.success) {
        setStatus(prev => prev ? { ...prev, isShutdown: result.isShutdown } : null)
      }
    } catch { /* server will sync via polling */ }
  }, [])

  const setBlackScreenOpacityState = useCallback(async (opacity: number) => {
    setStatus(prev => prev ? { ...prev, blackScreenOpacity: opacity } : null)
    try {
      const result = await api.setBlackScreenOpacity(opacity)
      if (result.success) {
        setStatus(prev => prev ? { ...prev, blackScreenOpacity: result.blackScreenOpacity } : null)
      }
    } catch { /* server will sync via polling */ }
  }, [])

  const setCameraState = useCallback(async (camera: number) => {
    const result = await api.setCamera(camera)
    if (result.success) {
      setStatus(prev => prev ? { ...prev, currentCamera: result.currentCamera } : null)
    }
  }, [])

  const setPhaseState = useCallback(async (phase: number) => {
    lastLocalUpdate.current = Date.now()
    localStorage.setItem('metapark_phase', String(phase))
    setStatus(prev => prev ? { ...prev, phase } : null)
    try {
      const result = await api.setPhase(phase)
      if (result.success) {
        setStatus(prev => prev ? { ...prev, phase: result.phase } : null)
      }
    } catch { /* server will sync via polling */ }
  }, [])

  const setVitalsState = useCallback(async (vitals: boolean[]) => {
    lastLocalUpdate.current = Date.now()
    localStorage.setItem('metapark_vitals', JSON.stringify(vitals))
    setStatus(prev => prev ? { ...prev, vitals } : null)
    try {
      const result = await api.setVitals(vitals)
      if (result.success) {
        setStatus(prev => prev ? { ...prev, vitals: result.vitals } : null)
      }
    } catch { /* server will sync via polling */ }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 500)
    return () => clearInterval(interval)
  }, [fetchStatus])

  return (
    <AppContext.Provider value={{ status, loading, error, updateShutdown, setBlackScreenOpacity: setBlackScreenOpacityState, setCamera: setCameraState, setPhase: setPhaseState, setVitals: setVitalsState, refetchStatus: fetchStatus }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
