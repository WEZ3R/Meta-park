import { forwardRef } from 'react'
import './VideoPlayer.css'

interface VideoPlayerProps {
  src: string
  active?: boolean
  muted?: boolean
  className?: string
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, active = true, muted = true, className = '' }, ref) => {
    return (
      <video
        ref={ref}
        src={src}
        autoPlay
        muted={muted}
        loop
        playsInline
        className={`video-player ${active ? 'active' : 'inactive'} ${className}`}
      />
    )
  }
)

VideoPlayer.displayName = 'VideoPlayer'
