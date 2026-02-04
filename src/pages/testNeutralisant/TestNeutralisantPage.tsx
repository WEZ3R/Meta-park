import { useState, useEffect } from 'react'
import { ScreensaverVideo } from '../../components/ScreensaverVideo/ScreensaverVideo'
import { useApp } from '../../shared/context/AppContext'
import './TestNeutralisantPage.css'

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

const CORRECT_SEQUENCE = ['Na²', 'HY', 'Ky', 'N²', 'O', 'Xe']

const compounds_BASE = [
  'Na²', 'HY', 'Ky', 'N²', 'O', 'Xe',
  'H', 'Mn', 'QP', 'R⁸c', 'V', 'K⁶y',
  'Os', 'Na', 'Ag', 'R⁸', 'Vos', 'Cg',
  'Ax', 'Q', 'O⁴', 'HO', 'Np', 'S',
  'H³', 'B', 'O³', 'Se',
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SLOT_COUNT = 6

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

type ResultState = 'idle' | 'loading' | 'error' | 'success'

export function TestNeutralisantPage() {
  const { status } = useApp()
  const phase = status?.phase ?? 0
  const isShutdown = status?.isShutdown ?? false

  const [compounds] = useState(() => shuffle(compounds_BASE))
  const [sequence, setSequence] = useState<(string | null)[]>(Array(SLOT_COUNT).fill(null))
  const [resultState, setResultState] = useState<ResultState>('idle')
  const [dots, setDots] = useState(1)
  const [percentage, setPercentage] = useState<number | null>(null)
  const [slotFeedback, setSlotFeedback] = useState<('correct' | 'misplaced' | 'wrong' | null)[]>(Array(SLOT_COUNT).fill(null))

  // Animated dots during loading
  useEffect(() => {
    if (resultState !== 'loading') return
    const interval = setInterval(() => {
      setDots(prev => (prev >= 3 ? 1 : prev + 1))
    }, 500)
    return () => clearInterval(interval)
  }, [resultState])

  const usedCompounds = new Set(sequence.filter(Boolean))
  const isFull = sequence.every(s => s !== null)
  const isLocked = resultState === 'loading' || resultState === 'success'

  const addToSequence = (compound: string) => {
    if (isLocked) return
    const firstEmpty = sequence.indexOf(null)
    if (firstEmpty === -1) return
    setSequence(prev => {
      const next = [...prev]
      next[firstEmpty] = compound
      return next
    })
    // Reset to idle if coming back from error
    if (resultState === 'error') {
      setResultState('idle')
      setPercentage(null)
      setSlotFeedback(Array(SLOT_COUNT).fill(null))
    }
  }

  const removeFromSequence = (index: number) => {
    if (isLocked) return
    if (sequence[index] === null) return
    setSequence(prev => {
      const next = [...prev]
      next[index] = null
      return next
    })
    if (resultState === 'error') {
      setResultState('idle')
      setPercentage(null)
      setSlotFeedback(Array(SLOT_COUNT).fill(null))
    }
  }

  const handleValidate = () => {
    if (!isFull || isLocked) return
    setResultState('loading')
    setDots(1)

    const isCorrect = sequence.every((s, i) => s === CORRECT_SEQUENCE[i])

    setTimeout(() => {
      // Compute per-slot feedback
      const feedback: ('correct' | 'misplaced' | 'wrong')[] = sequence.map((s, i) => {
        if (s === CORRECT_SEQUENCE[i]) return 'correct'
        if (CORRECT_SEQUENCE.includes(s!)) return 'misplaced'
        return 'wrong'
      })
      setSlotFeedback(feedback)

      if (isCorrect) {
        setPercentage(100)
        setResultState('success')
      } else {
        setPercentage(Math.floor(Math.random() * (75 - 30 + 1)) + 30)
        setResultState('error')
      }
    }, 2000)
  }

  const handleReset = () => {
    if (resultState === 'loading') return
    setSequence(Array(SLOT_COUNT).fill(null))
    setResultState('idle')
    setPercentage(null)
    setSlotFeedback(Array(SLOT_COUNT).fill(null))
  }

  // ── Guards ──────────────────────────────────────────────

  if (status?.isBlackScreen) {
    return <div style={{ width: '100vw', height: '100vh', background: '#000' }} />
  }

  if (phase === 1 || isShutdown) {
    return <ScreensaverVideo videoSrc="/videos/ERRORSIGNAL.mp4" />
  }

  // ── Derived ─────────────────────────────────────────────

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

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="test-neutralisant-page">
      <h1 className="tn-page-title">SYNTHÉTISATION DE NEUTRALISANT</h1>

      {/* Left side – Sequence assembly */}
      <div className="tn-left">
        <div className="tn-legend">
          <span className="tn-legend-item tn-legend--correct">Correct &amp; bien placé</span>
          <span className="tn-legend-item tn-legend--misplaced">Correct mais mal placé</span>
          <span className="tn-legend-item tn-legend--wrong">Incorrect</span>
        </div>

        <h2 className="tn-input-title">SÉQUENCE GÉNÉTIQUE EN COURS</h2>

        {/* Slots */}
        <div className="tn-slots">
          {sequence.map((compound, i) => {
            const fb = slotFeedback[i]
            const fbClass = fb ? `tn-slot--${fb}` : ''
            return (
              <button
                key={i}
                className={`tn-slot ${compound ? 'tn-slot--filled' : 'tn-slot--empty'} ${fbClass}`}
                onClick={() => removeFromSequence(i)}
                disabled={!compound || isLocked}
              >
                {compound && <span className="tn-slot-label">{compound}</span>}
                {!compound && <span className="tn-slot-index">{i + 1}</span>}
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="tn-actions">
          <button
            className="tn-btn tn-btn-reset"
            onClick={handleReset}
            disabled={resultState === 'loading'}
          >
            RÉINITIALISER
          </button>
          <button
            className="tn-btn tn-btn-validate"
            onClick={handleValidate}
            disabled={!isFull || isLocked}
          >
            VALIDER
          </button>
        </div>

        <p className="tn-input-subtitle">Sélectionnez les composés chimiques</p>

        {/* Compound cards */}
        <div className="tn-compounds">
          {compounds.map(compound => {
            const used = usedCompounds.has(compound)
            return (
              <button
                key={compound}
                className={`tn-compound ${used ? 'tn-compound--used' : ''}`}
                onClick={() => addToSequence(compound)}
                disabled={used || isLocked}
              >
                {compound}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right side – Result */}
      <div className="tn-right">
        <p className={`tn-correspondence ${resultState === 'error' ? 'tn-correspondence--error' : resultState === 'success' ? 'tn-correspondence--success' : ''}`}>{correspondanceText}</p>
        <div className="tn-result-frame">
          <img key={frameImage} src={frameImage} alt="" className="tn-result-bg" />
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
