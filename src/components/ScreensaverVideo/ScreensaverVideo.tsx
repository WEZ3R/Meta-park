import { VideoPlayer } from '../VideoPlayer/VideoPlayer'
import './ScreensaverVideo.css'

interface ScreensaverVideoProps {
  videoSrc: string
  className?: string
}

export function ScreensaverVideo({ videoSrc, className = '' }: ScreensaverVideoProps) {
  return (
    <div className={`screensaver-video ${className}`}>
      <VideoPlayer src={videoSrc} active />
    </div>
  )
}
