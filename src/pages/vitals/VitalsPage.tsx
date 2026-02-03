import { VitalsCard } from '../../components/VitalsCard/VitalsCard'
import { VideoPlayer } from '../../components/VideoPlayer/VideoPlayer'
import { useApp } from '../../shared/context/AppContext'
import './VitalsPage.css'

export function VitalsPage() {
  const { status } = useApp()
  const phase = status?.phase ?? 0
  const isShutdown = status?.isShutdown ?? false
  const vitals = status?.vitals ?? [true, true, true]

  if (status?.isBlackScreen) {
    return <div style={{ width: '100vw', height: '100vh', background: '#000' }} />
  }

  if (phase === 1 || isShutdown) {
    return (
      <div className="vitals-page vitals-page-error">
        <VideoPlayer src="/videos/errorsignal.mp4" active />
      </div>
    )
  }

  return (
    <div className="vitals-page">
      <div className="vitals-header">
        <h1 className="vitals-title">SUIVI DES CONSTANTES VITALES</h1>
        <h2 className="vitals-subtitle">ÉQUIPE TERRAIN</h2>
      </div>
      <div className="vitals-cards">
        <VitalsCard imageSrc="/images/cartes constantes vitales.png" active={vitals[0]} alt="Constantes vitales 1" />
        <VitalsCard imageSrc="/images/cartes constantes vitales.png" active={vitals[1]} alt="Constantes vitales 2" />
        <VitalsCard imageSrc="/images/cartes constantes vitales.png" active={vitals[2]} alt="Constantes vitales 3" />
      </div>
    </div>
  )
}
