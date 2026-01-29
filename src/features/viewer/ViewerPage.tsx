import { useRef, useState, useEffect, useMemo } from 'react'
import { VideoPlayer } from '../../shared/components/VideoPlayer'
import { ErrorOverlay } from '../../shared/components/ErrorOverlay'
import { useApp } from '../../shared/context/AppContext'
import { useVideoSync } from '../../shared/hooks/useVideoSync'
import { useKeyboardControls } from '../../shared/hooks/useKeyboardControls'
import './ViewerPage.css'

export function ViewerPage() {
  const { status } = useApp()
  const [localCamera, setLocalCamera] = useState(1)
  const [showIndicator, setShowIndicator] = useState(true)

  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const video3Ref = useRef<HTMLVideoElement>(null)
  const video4Ref = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const videoRefs = useMemo(() => [video1Ref, video2Ref, video3Ref, video4Ref], [])
  useVideoSync(videoRefs)

  const handleCameraChange = (camera: number) => {
    if (camera === localCamera) return

    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }

    setLocalCamera(camera)
    setShowIndicator(true)
    setTimeout(() => setShowIndicator(false), 1500)
  }

  useKeyboardControls(handleCameraChange)

  useEffect(() => {
    const timer = setTimeout(() => setShowIndicator(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="viewer-page">
      <div className="video-container">
        <VideoPlayer ref={video1Ref} src="/videos/camera-1.mp4" active={localCamera === 1} />
        <VideoPlayer ref={video2Ref} src="/videos/camera-2.mp4" active={localCamera === 2} />
        <VideoPlayer ref={video3Ref} src="/videos/camera-3.mp4" active={localCamera === 3} />
        <VideoPlayer ref={video4Ref} src="/videos/camera-4.mp4" active={localCamera === 4} />
      </div>

      <div className={`camera-indicator ${showIndicator ? 'show' : ''}`}>
        Camera {localCamera}
      </div>

      <audio ref={audioRef} src="/audio/FNAF_cam.mp3" preload="auto" />

      <ErrorOverlay visible={status?.isShutdown ?? false} />
    </div>
  )
}
