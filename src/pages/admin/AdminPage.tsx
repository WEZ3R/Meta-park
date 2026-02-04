import { useState, useRef } from 'react'
import { useApp } from '../../shared/context/AppContext'
import './AdminPage.css'

const PHASE_LABELS: Record<number, string> = {
  0: 'Normal',
  1: 'Signal Erreur',
}

const AUDIO_TRACKS = [
  { label: '1. Premier contact', src: '/audio/1. Premier contact (violet).mp3' },
  { label: '2. Demande de vérification', src: '/audio/2. Demande de vérification (violet).mp3' },
  { label: '3. Détection de l\'anomalie', src: '/audio/3. Détéction de l_anomalie (violet).mp3' },
  { label: '4. Réception coordonnées (1)', src: '/audio/4. Réception des coordonnées (violet 1).mp3' },
  { label: '4. Réception coordonnées (2)', src: '/audio/4. Réception des coordonnées (violet 2).mp3' },
  { label: '5. Résolution appât', src: '/audio/5. Résolution appât (violet).mp3' },
  { label: '7. Retour du signal', src: '/audio/7. Retour du signal.mp3' },
  { label: '8. Entrée dans la serre', src: '/audio/8. Entrée dans la serre.mp3' },
  { label: '10. Diffusion du gaz', src: '/audio/10. Diffusion du gaz.mp3' },
  { label: 'DJI_0417_D', src: '/audio/DJI_20260202111340_0417_D.mp3' },
]

export function AdminPage() {
  const { status, updateShutdown, setBlackScreenOpacity, setPhase, setVitals } = useApp()
  const currentPhase = status?.phase ?? 0
  const vitals = status?.vitals ?? [true, true, true]
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggleVital = (index: number) => {
    const updated = [...vitals]
    updated[index] = !updated[index]
    setVitals(updated)
  }

  const playAudio = (index: number) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (playingIndex === index) {
      setPlayingIndex(null)
      return
    }
    const audio = new Audio(AUDIO_TRACKS[index].src)
    audio.play()
    audio.onended = () => setPlayingIndex(null)
    audioRef.current = audio
    setPlayingIndex(index)
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
          <h3 className="section-title">Sons</h3>
          <div className="audio-buttons">
            {AUDIO_TRACKS.map((track, i) => (
              <button
                key={i}
                className={`btn btn-audio ${playingIndex === i ? 'playing' : ''}`}
                onClick={() => playAudio(i)}
              >
                {playingIndex === i ? '■ ' : '▶ '}{track.label}
              </button>
            ))}
          </div>
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
            <button
              className={`btn ${(status?.blackScreenOpacity ?? 0) > 0 ? 'btn-error' : 'btn-phase'} ${(status?.blackScreenOpacity ?? 0) > 0 ? 'active' : ''}`}
              onClick={() => setBlackScreenOpacity((status?.blackScreenOpacity ?? 0) > 0 ? 0 : 100)}
            >
              Ecran Noir ({status?.blackScreenOpacity ?? 0}%)
            </button>
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
      </div>
    </div>
  )
}
