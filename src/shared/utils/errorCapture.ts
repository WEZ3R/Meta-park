import { ClientError } from '../types'

type ErrorCallback = (error: Omit<ClientError, 'id' | 'timestamp'>) => void

let originalConsoleError: typeof console.error | null = null
let errorHandler: ((event: ErrorEvent) => void) | null = null
let rejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null

export function initErrorCapture(callback: ErrorCallback): void {
  // Capture window.onerror
  errorHandler = (event: ErrorEvent) => {
    callback({
      message: event.message || 'Unknown error',
      stack: event.error?.stack,
      source: window.location.pathname, // Lecture dynamique à chaque erreur
      type: 'error'
    })
  }
  window.addEventListener('error', errorHandler)

  // Capture unhandled promise rejections
  rejectionHandler = (event: PromiseRejectionEvent) => {
    const reason = event.reason
    callback({
      message: reason?.message || String(reason) || 'Unhandled promise rejection',
      stack: reason?.stack,
      source: window.location.pathname, // Lecture dynamique à chaque erreur
      type: 'unhandledrejection'
    })
  }
  window.addEventListener('unhandledrejection', rejectionHandler)

  // Intercept console.error
  originalConsoleError = console.error
  console.error = (...args: unknown[]) => {
    // Call original first
    originalConsoleError!.apply(console, args)

    // Build message from args
    const message = args
      .map(arg => {
        if (arg instanceof Error) return arg.message
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg)
          } catch {
            return String(arg)
          }
        }
        return String(arg)
      })
      .join(' ')

    // Get stack from Error arg if present
    const errorArg = args.find(arg => arg instanceof Error) as Error | undefined

    callback({
      message,
      stack: errorArg?.stack,
      source: window.location.pathname, // Lecture dynamique à chaque erreur
      type: 'console.error'
    })
  }
}

export function cleanupErrorCapture(): void {
  if (errorHandler) {
    window.removeEventListener('error', errorHandler)
    errorHandler = null
  }

  if (rejectionHandler) {
    window.removeEventListener('unhandledrejection', rejectionHandler)
    rejectionHandler = null
  }

  if (originalConsoleError) {
    console.error = originalConsoleError
    originalConsoleError = null
  }
}
