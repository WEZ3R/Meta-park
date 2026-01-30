import { useRef, useMemo } from 'react'
import { VideoPlayer } from '../VideoPlayer/VideoPlayer'
import { CameraCell } from '../CameraCell/CameraCell'
import { useVideoSync } from '../../shared/hooks/useVideoSync'
import './CameraGrid.css'

interface CameraGridProps {
  activeCamera?: number
  className?: string
}

export function CameraGrid({ activeCamera = 0, className = '' }: CameraGridProps) {
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const video3Ref = useRef<HTMLVideoElement>(null)
  const video4Ref = useRef<HTMLVideoElement>(null)

  const videoRefs = useMemo(() => [video1Ref, video2Ref, video3Ref, video4Ref], [])
  useVideoSync(videoRefs)

  return (
    <div className={`camera-grid ${className}`}>
      <CameraCell cameraNumber={1} isActive={activeCamera === 1}>
        <VideoPlayer ref={video1Ref} src="/videos/camera-1.mp4" />
      </CameraCell>
      <CameraCell cameraNumber={2} isActive={activeCamera === 2}>
        <VideoPlayer ref={video2Ref} src="/videos/camera-2.mp4" />
      </CameraCell>
      <CameraCell cameraNumber={3} isActive={activeCamera === 3}>
        <VideoPlayer ref={video3Ref} src="/videos/camera-3.mp4" />
      </CameraCell>
      <CameraCell cameraNumber={4} isActive={activeCamera === 4}>
        <VideoPlayer ref={video4Ref} src="/videos/camera-4.mp4" />
      </CameraCell>
    </div>
  )
}
