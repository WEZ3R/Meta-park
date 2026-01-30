import { VideoPlayer } from '../../shared/components/VideoPlayer'
import './ScreensaverSciencePage.css'

export function ScreensaverSciencePage() {
  return (
    <div className="screensaver-science">
      <VideoPlayer src="/videos/Signal 1.mp4" active />
    </div>
  )
}
