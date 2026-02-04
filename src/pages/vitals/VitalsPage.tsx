import { useState, useRef, useEffect, useCallback } from 'react'
import { useApp } from '../../shared/context/AppContext'
import './VitalsPage.css'

const VIDEO_SRC = '/external-videos/Vitals - FINAL.mp4'

// Fictional time range: 17:30 → 19:27 (117 minutes)
const START_MINUTES = 17 * 60 + 30 // 1050
const END_MINUTES = 19 * 60 + 27   // 1167
const RANGE_MINUTES = END_MINUTES - START_MINUTES // 117

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = Math.floor(totalMinutes % 60)
  return `${h}:${m.toString().padStart(2, '0')}`
}

export function VitalsPage() {
  const { status } = useApp()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [seeking, setSeeking] = useState(false)

  if (status?.isBlackScreen) {
    return <div style={{ width: '100vw', height: '100vh', background: '#000' }} />
  }

  const displayTime = formatTime(START_MINUTES + progress * RANGE_MINUTES)
  const endTime = formatTime(END_MINUTES)

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }, [])

  const rewind = useCallback((seconds: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, v.currentTime - seconds)
  }, [])

  const goToStart = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
  }, [])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = ratio * v.duration
  }, [])

  const handleProgressMouseDown = useCallback(() => {
    setSeeking(true)
  }, [])

  const handleProgressMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!seeking) return
    const v = videoRef.current
    if (!v || !v.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = ratio * v.duration
  }, [seeking])

  const handleProgressMouseUp = useCallback(() => {
    setSeeking(false)
  }, [])

  // Update progress from video timeupdate
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => {
      if (v.duration) {
        setProgress(v.currentTime / v.duration)
      }
    }
    v.addEventListener('timeupdate', onTime)
    return () => v.removeEventListener('timeupdate', onTime)
  }, [])

  // Sync play state if video ends or gets paused externally
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    return () => {
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [])


  return (
    <div className="vitals-page">
      <video
        ref={videoRef}
        className="vitals-video"
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="vitals-controls">
        <div
          className="vitals-progress-bar"
          onClick={handleProgressClick}
          onMouseDown={handleProgressMouseDown}
          onMouseMove={handleProgressMouseMove}
          onMouseUp={handleProgressMouseUp}
          onMouseLeave={handleProgressMouseUp}
        >
          <div className="vitals-progress-fill" style={{ width: `${progress * 100}%` }} />
          <div className="vitals-progress-handle" style={{ left: `${progress * 100}%` }} />
        </div>

        <div className="vitals-controls-row">
          <div className="vitals-controls-left">
            <button className="vitals-ctrl-btn" onClick={goToStart} title="Retour au debut">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button className="vitals-ctrl-btn" onClick={() => rewind(10)} title="Reculer 10s">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                <text x="12" y="15.5" textAnchor="middle" fontSize="7" fontWeight="bold">10</text>
              </svg>
            </button>
            <button className="vitals-ctrl-btn vitals-ctrl-play" onClick={togglePlay} title={playing ? 'Pause' : 'Lecture'}>
              {playing ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button className="vitals-ctrl-btn" onClick={() => rewind(-10)} title="Avancer 10s">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                <text x="12" y="15.5" textAnchor="middle" fontSize="7" fontWeight="bold">10</text>
              </svg>
            </button>
          </div>

          <div className="vitals-time">
            <span className="vitals-time-current">{displayTime}</span>
            <span className="vitals-time-sep">/</span>
            <span className="vitals-time-end">{endTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
