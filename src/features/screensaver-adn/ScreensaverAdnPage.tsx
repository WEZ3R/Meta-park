import { VideoPlayer } from '../../shared/components/VideoPlayer'
import './ScreensaverAdnPage.css'

export function ScreensaverAdnPage() {
  return (
    <div className="screensaver-adn">
      <VideoPlayer src="/videos/Signal 1.mp4" active />
    </div>
  )
}
