import { useApp } from '../../shared/context/AppContext'
import { api } from '../../shared/api/client'
import './AdminPage.css'

const PHASE_LABELS: Record<number, string> = {
  0: 'Normal',
  1: 'Signal Erreur',
}

export function AdminPage() {
  const { status, updateShutdown, setPhase, setVitals } = useApp()
  const currentPhase = status?.phase ?? 0
  const vitals = status?.vitals ?? [true, true, true]

  const toggleVital = (index: number) => {
    const updated = [...vitals]
    updated[index] = !updated[index]
    setVitals(updated)
  }

  return (
    <div className="admin-page">
      <div className="admin-panel">
        <h1 className="admin-title">Admin Panel</h1>

        <div className="admin-status">
          <span className="status-label">Status:</span>
          <span className={`status-value ${status?.isShutdown ? 'error' : 'ok'}`}>
            {status?.isShutdown ? 'SHUTDOWN' : 'OPERATIONAL'}
          </span>
        </div>

        <div className="admin-buttons">
          <button
            className="btn btn-error"
            onClick={() => updateShutdown(true)}
          >
            Error ON
          </button>
          <button
            className="btn btn-reset"
            onClick={() => updateShutdown(false)}
          >
            Error OFF
          </button>
        </div>

        <div className="admin-section">
          <h3 className="section-title">Phase globale</h3>
          <div className="admin-phase-info">
            <span className="phase-label">Phase actuelle:</span>
            <span className={`phase-value phase-${currentPhase}`}>
              {PHASE_LABELS[currentPhase] ?? `Phase ${currentPhase}`}
            </span>
          </div>
          <div className="phase-buttons">
            {[0, 1].map(p => (
              <button
                key={p}
                className={`btn btn-phase ${currentPhase === p ? 'active' : ''}`}
                onClick={() => setPhase(p)}
              >
                {PHASE_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <h3 className="section-title">Constantes vitales</h3>
          <div className="vitals-toggles">
            {vitals.map((active, i) => (
              <button
                key={i}
                className={`btn btn-vital ${active ? 'vital-active' : 'vital-inactive'}`}
                onClick={() => toggleVital(i)}
              >
                Vital {i + 1}: {active ? 'ON' : 'OFF'}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <button
            className="btn btn-reset-all"
            onClick={() => { if (confirm('Réinitialiser toutes les pages ?')) api.resetAll() }}
          >
            RÉINITIALISER TOUT
          </button>
        </div>
      </div>
    </div>
  )
}
