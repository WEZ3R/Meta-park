import { createContext, useContext, useEffect, ReactNode } from 'react'
import { api } from '../api/client'
import { initErrorCapture, cleanupErrorCapture } from '../utils/errorCapture'

const ErrorLoggerContext = createContext<null>(null)

interface ErrorLoggerProviderProps {
  children: ReactNode
}

export function ErrorLoggerProvider({ children }: ErrorLoggerProviderProps) {
  useEffect(() => {
    // Skip on admin page to avoid capturing admin's own errors in the console
    if (window.location.pathname === '/admin') {
      return
    }

    initErrorCapture((error) => {
      // Send error to server (fire and forget)
      api.logError(error).catch(() => {
        // Silently fail to avoid infinite loops
      })
    })

    return () => {
      cleanupErrorCapture()
    }
  }, [])

  return (
    <ErrorLoggerContext.Provider value={null}>
      {children}
    </ErrorLoggerContext.Provider>
  )
}

export function useErrorLogger() {
  return useContext(ErrorLoggerContext)
}
