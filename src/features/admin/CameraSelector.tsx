import { useApp } from '../../shared/context/AppContext'
import './CameraSelector.css'

export function CameraSelector() {
  const { status, setCamera } = useApp()
  const currentCamera = status?.currentCamera ?? 1

  return (
    <div className="camera-selector">
      <h3 className="selector-title">Camera Selection</h3>
      <div className="selector-buttons">
        {[1, 2, 3, 4].map(num => (
          <button
            key={num}
            className={`selector-btn ${currentCamera === num ? 'active' : ''}`}
            onClick={() => setCamera(num)}
          >
            CAM {num}
          </button>
        ))}
      </div>
    </div>
  )
}
