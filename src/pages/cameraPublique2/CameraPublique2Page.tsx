import { CameraGrid } from '../../components/CameraGrid/CameraGrid'
import { ScreensaverVideo } from '../../components/ScreensaverVideo/ScreensaverVideo'
import { useApp } from '../../shared/context/AppContext'
import './CameraPublique2Page.css'

export function CameraPublique2Page() {
  const { status } = useApp()
  const phase = status?.phase ?? 0
  const isShutdown = status?.isShutdown ?? false

  if (phase === 1 || isShutdown) {
    return <ScreensaverVideo videoSrc="/videos/errorsignal.mp4" />
  }

  return (
    <div className="camera-publique-2-page">
      <CameraGrid />
    </div>
  )
}
