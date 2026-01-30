import './ErrorOverlay.css'

interface ErrorOverlayProps {
  visible: boolean
}

export function ErrorOverlay({ visible }: ErrorOverlayProps) {
  if (!visible) return null

  return (
    <div className="error-overlay">
      <div className="error-text">SYSTEM ERROR</div>
    </div>
  )
}
