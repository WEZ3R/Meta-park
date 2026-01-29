import { useEffect, useRef, RefObject } from 'react'
import { useApp } from '../context/AppContext'

export function useVideoSync(videoRefs: RefObject<HTMLVideoElement | null>[]) {
  const { status } = useApp()
  const syncTimeoutRef = useRef<number>()

  useEffect(() => {
    const syncVideos = () => {
      if (!status) return

      const elapsed = (status.serverTime - status.startTime) / 1000

      videoRefs.forEach(ref => {
        const video = ref.current
        if (video && video.duration > 0) {
          const targetTime = elapsed % video.duration
          if (Math.abs(video.currentTime - targetTime) > 0.3) {
            video.currentTime = targetTime
          }
        }
      })
    }

    syncTimeoutRef.current = window.setTimeout(syncVideos, 1000)
    const interval = setInterval(syncVideos, 3000)

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      clearInterval(interval)
    }
  }, [status, videoRefs])
}
