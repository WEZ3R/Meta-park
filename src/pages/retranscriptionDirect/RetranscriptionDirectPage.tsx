import { VideoPlayer } from '../../components/VideoPlayer/VideoPlayer'
import { useApp } from '../../shared/context/AppContext'
import './RetranscriptionDirectPage.css'

export function RetranscriptionDirectPage() {
  const { status } = useApp()
  const phase = status?.phase ?? 0
  const isShutdown = status?.isShutdown ?? false

  if (phase === 1 || isShutdown) {
    return (
      <div className="retranscription-direct-page retranscription-error">
        <VideoPlayer src="/videos/errorsignal.mp4" active />
      </div>
    )
  }

  return (
    <div className="retranscription-direct-page">
      <h1 className="retranscription-title">Retranscription Direct</h1>
    </div>
  )
}
