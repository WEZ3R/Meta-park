import { ScreensaverVideo } from '../../components/ScreensaverVideo/ScreensaverVideo'
import { useApp } from '../../shared/context/AppContext'

export function AdnTrexPage() {
  const { status } = useApp()
  const phase = status?.phase ?? 0
  const isShutdown = status?.isShutdown ?? false

  if (isShutdown || phase === 1) {
    return <ScreensaverVideo videoSrc="/videos/ERRORSIGNAL.mp4" />
  }

  return <ScreensaverVideo videoSrc="/videos/AfficheT-rex.mp4" />
}
