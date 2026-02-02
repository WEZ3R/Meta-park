import { useState, useEffect, useRef } from 'react'
import { ScreensaverVideo } from '../../components/ScreensaverVideo/ScreensaverVideo'
import { useApp } from '../../shared/context/AppContext'
import './TestNeutralisantPage.css'

type ResultState = 'idle' | 'loading' | 'error' | 'success'

export function TestNeutralisantPage() {
  const { status } = useApp()
  const phase = status?.phase ?? 0
  const isShutdown = status?.isShutdown ?? false

  const [inputValue, setInputValue] = useState('')
  const [attemptCount, setAttemptCount] = useState(0)
  const [resultState, setResultState] = useState<ResultState>('idle')
  const [dots, setDots] = useState(1)
  const [percentage, setPercentage] = useState<number | null>(null)
  const prevPhaseRef = useRef(phase)

  // Reset state when transitioning into phase 2 (post-error)
  useEffect(() => {
    if (phase === 2 && prevPhaseRef.current !== 2) {
      setInputValue('')
      setAttemptCount(0)
      setResultState('idle')
      setDots(1)
      setPercentage(null)
    }
    prevPhaseRef.current = phase
  }, [phase])

  // Animated dots during loading
  useEffect(() => {
    if (resultState !== 'loading') return
    const interval = setInterval(() => {
      setDots(prev => (prev >= 3 ? 1 : prev + 1))
    }, 500)
    return () => clearInterval(interval)
  }, [resultState])

  const handleSubmit = () => {
    if (!inputValue.trim() || resultState === 'loading' || resultState === 'success') return

    setResultState('loading')
    setDots(1)

    const nextAttempt = attemptCount + 1
    setAttemptCount(nextAttempt)

    setTimeout(() => {
      if (nextAttempt >= 3) {
        setPercentage(100)
        setResultState('success')
      } else {
        setPercentage(Math.floor(Math.random() * (75 - 30 + 1)) + 30)
        setResultState('error')
      }
      setInputValue('')
    }, 2000)
  }

  if (phase === 1 || isShutdown) {
    return <ScreensaverVideo videoSrc="/videos/ERRORSIGNAL.mp4" />
  }

  if (phase === 2) {
    const frameImage =
      resultState === 'error'
        ? '/images/erreurLabo.png'
        : resultState === 'success'
          ? '/images/valideLabo.png'
          : '/images/attenteLabo.png'

    const correspondanceText =
      resultState === 'success'
        ? 'TAUX DE CORRESPONDANCE : 100%'
        : resultState === 'error' && percentage !== null
          ? `TAUX DE CORRESPONDANCE : ${percentage}%`
          : 'TAUX DE CORRESPONDANCE : ...'

    return (
      <div className="test-neutralisant-page">
        {/* Left side – Input */}
        <div className="tn-left">
          <h1 className="tn-input-title">SÉQUENCE GÉNÉTIQUE EN COURS</h1>
          <div className="tn-input-wrapper">
            <img src="/images/inputLabo.png" alt="" className="tn-input-bg" />
            <input
              className="tn-input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              disabled={resultState === 'loading' || resultState === 'success'}
            />
          </div>
          <p className="tn-input-subtitle">Vérification de la compatibilité</p>
        </div>

        {/* Right side – Result */}
        <div className="tn-right">
          <p className={`tn-correspondence ${resultState === 'error' ? 'tn-correspondence--error' : resultState === 'success' ? 'tn-correspondence--success' : ''}`}>{correspondanceText}</p>
          <div className="tn-result-frame">
            <img src={frameImage} alt="" className="tn-result-bg" />
            <div className="tn-result-text">
              {resultState === 'idle' && (
                <span>EN ATTENTE</span>
              )}
              {resultState === 'loading' && (
                <span>EN ATTENTE{'.'.repeat(dots)}</span>
              )}
              {resultState === 'error' && (
                <>SÉQUENCE<br />INSTABLE</>
              )}
              {resultState === 'success' && (
                <>SÉQUENCE<br />VALIDE</>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <ScreensaverVideo videoSrc="/videos/Signal 1.mp4" />
}
