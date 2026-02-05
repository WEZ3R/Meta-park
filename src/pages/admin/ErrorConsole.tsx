import { useState, useEffect } from 'react'
import { api } from '../../shared/api/client'
import { ClientError } from '../../shared/types'
import './ErrorConsole.css'

export function ErrorConsole() {
  const [errors, setErrors] = useState<ClientError[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchErrors = async () => {
    try {
      const { errors } = await api.getErrors()
      setErrors(errors)
    } catch (e) {
      // Silently fail
    }
  }

  const clearErrors = async () => {
    setLoading(true)
    try {
      await api.clearErrors()
      setErrors([])
    } catch (e) {
      // Silently fail
    }
    setLoading(false)
  }

  // Polling every 2 seconds
  useEffect(() => {
    fetchErrors()
    const interval = setInterval(fetchErrors, 2000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTypeClass = (type: ClientError['type']) => {
    switch (type) {
      case 'error':
        return 'error-type-error'
      case 'unhandledrejection':
        return 'error-type-rejection'
      case 'console.error':
        return 'error-type-console'
      default:
        return ''
    }
  }

  return (
    <div className="error-console">
      <div className="error-console-header">
        <div className="error-console-title">
          <span className="error-console-icon">!</span>
          <span>Console d'erreurs</span>
          <span className="error-console-count">({errors.length})</span>
        </div>
        <div className="error-console-actions">
          <button
            className="error-console-btn error-console-btn-refresh"
            onClick={fetchErrors}
          >
            Rafraichir
          </button>
          <button
            className="error-console-btn error-console-btn-clear"
            onClick={clearErrors}
            disabled={loading || errors.length === 0}
          >
            Vider
          </button>
        </div>
      </div>

      <div className="error-console-body">
        {errors.length === 0 ? (
          <div className="error-console-empty">Aucune erreur</div>
        ) : (
          <table className="error-console-table">
            <thead>
              <tr>
                <th className="error-th error-th-time">Heure</th>
                <th className="error-th error-th-type">Type</th>
                <th className="error-th error-th-source">Source</th>
                <th className="error-th error-th-message">Message</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((error) => (
                <>
                  <tr
                    key={error.id}
                    className="error-row"
                    onClick={() => setExpandedId(expandedId === error.id ? null : error.id)}
                  >
                    <td className="error-td error-td-time">{formatTime(error.timestamp)}</td>
                    <td className={`error-td error-td-type ${getTypeClass(error.type)}`}>
                      {error.type}
                    </td>
                    <td className="error-td error-td-source">{error.source}</td>
                    <td className="error-td error-td-message">{error.message}</td>
                  </tr>
                  {expandedId === error.id && error.stack && (
                    <tr key={`${error.id}-stack`} className="error-row-stack">
                      <td colSpan={4}>
                        <pre className="error-stack">{error.stack}</pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
