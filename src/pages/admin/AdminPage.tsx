import { useApp } from '../../shared/context/AppContext'
import { CameraSelector } from './CameraSelector'
import './AdminPage.css'

export function AdminPage() {
  const { status, updateShutdown } = useApp()

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

        <div className="admin-camera-info">
          <span className="camera-label">Active Camera:</span>
          <span className="camera-value">CAM {status?.currentCamera ?? 1}</span>
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

        <CameraSelector />
      </div>
    </div>
  )
}
