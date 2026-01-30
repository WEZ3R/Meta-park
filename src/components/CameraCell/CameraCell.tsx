import { ReactNode } from 'react'
import './CameraCell.css'

interface CameraCellProps {
  cameraNumber: number
  isActive: boolean
  children: ReactNode
}

export function CameraCell({ cameraNumber, isActive, children }: CameraCellProps) {
  return (
    <div className={`camera-cell ${isActive ? 'active' : ''}`}>
      {children}
      <div className="camera-label">CAM {cameraNumber}</div>
      {isActive && <div className="active-indicator">LIVE</div>}
    </div>
  )
}
