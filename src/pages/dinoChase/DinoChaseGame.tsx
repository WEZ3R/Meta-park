import { useState, useEffect, useRef, useCallback } from 'react'
import './DinoChaseGame.css'

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface Position { x: number; y: number }

interface ChoiceOption {
  label: string
  description: string
  casualties: number
  casualtyType: string
  isWorst: boolean
  nodePos: Position
}

interface ChoiceZone {
  junction: Position
  left: ChoiceOption
  right: ChoiceOption
  timerDuration: number
}

interface ChaseSegment {
  fromY: number
  toY: number
  duration: number
  audioSrc?: string
}

type StepType = 'locate' | 'chase' | 'choice' | 'result' | 'finale'

interface GameStep {
  type: StepType
  index?: number
  duration?: number
}

// ═══════════════════════════════════════════════════════════
// GAME DATA
// ═══════════════════════════════════════════════════════════

const MX = 512
const INITIAL_VISITORS = 486

const CHOICE_ZONES: ChoiceZone[] = [
  {
    junction: { x: MX, y: 560 },
    left: {
      label: 'ENCLOS CARNIVORES',
      description: 'Zone haute securite — Personnel arme present',
      casualties: 18, casualtyType: 'gardes', isWorst: true,
      nodePos: { x: 210, y: 530 },
    },
    right: {
      label: 'ENCLOS HERBIVORES',
      description: 'Zone ouverte — Faible presence humaine',
      casualties: 7, casualtyType: 'employes', isWorst: false,
      nodePos: { x: 814, y: 530 },
    },
    timerDuration: 15,
  },
  {
    junction: { x: MX, y: 390 },
    left: {
      label: 'ZONE SAFARI',
      description: 'Vehicules civils en circulation',
      casualties: 32, casualtyType: 'civils', isWorst: true,
      nodePos: { x: 210, y: 360 },
    },
    right: {
      label: 'ENCLOS SOIGNEURS',
      description: 'Equipe veterinaire en intervention',
      casualties: 9, casualtyType: 'soigneurs', isWorst: false,
      nodePos: { x: 814, y: 360 },
    },
    timerDuration: 15,
  },
  {
    junction: { x: MX, y: 220 },
    left: {
      label: 'ENCLOS CARNIVORES',
      description: 'Risque de breche secondaire — Gardes mobilises',
      casualties: 23, casualtyType: 'gardes & civils', isWorst: true,
      nodePos: { x: 210, y: 190 },
    },
    right: {
      label: 'NURSERIE',
      description: 'Aucun humain present — Jeunes dinosaures uniquement',
      casualties: 0, casualtyType: '', isWorst: false,
      nodePos: { x: 814, y: 190 },
    },
    timerDuration: 15,
  },
]

const SEGMENTS: ChaseSegment[] = [
  { fromY: 700, toY: 560, duration: 4500 },
  { fromY: 560, toY: 390, duration: 5500, audioSrc: '/audio/chase-narration-1.mp3' },
  { fromY: 390, toY: 220, duration: 5500, audioSrc: '/audio/chase-narration-2.mp3' },
  { fromY: 220, toY: -60, duration: 5000 },
]

const STEPS: GameStep[] = [
  { type: 'locate' },
  { type: 'chase', index: 0 },
  { type: 'choice', index: 0 },
  { type: 'result', index: 0, duration: 2500 },
  { type: 'chase', index: 1 },
  { type: 'choice', index: 1 },
  { type: 'result', index: 1, duration: 2500 },
  { type: 'chase', index: 2 },
  { type: 'choice', index: 2 },
  { type: 'result', index: 2, duration: 2500 },
  { type: 'chase', index: 3 },
  { type: 'finale' },
]

const START_Y = 700
const ANTENNA: Position = { x: MX, y: 65 }

function branchPath(jx: number, jy: number, nx: number, ny: number): string {
  const cpx = jx + (nx - jx) * 0.4
  return `M ${jx} ${jy} C ${cpx} ${jy}, ${nx + (jx > nx ? 40 : -40)} ${ny}, ${nx} ${ny}`
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function DinoChaseGame() {
  const [stepIdx, setStepIdx] = useState(0)
  const [dinoY, setDinoY] = useState(START_Y)
  const [choices, setChoices] = useState<('left' | 'right' | null)[]>([null, null, null])
  const [totalCasualties, setTotalCasualties] = useState(0)
  const [timer, setTimer] = useState(15)
  const [visitorFlash, setVisitorFlash] = useState(false)

  // Locate phase: 'waiting' → 'scanning' → 'found' → null (game running)
  const [locatePhase, setLocatePhase] = useState<'waiting' | 'scanning' | 'found' | null>('waiting')

  const audioRef = useRef<HTMLAudioElement>(null)
  const rafRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const chosenRef = useRef(false)
  const stepIdxRef = useRef(0)

  useEffect(() => { stepIdxRef.current = stepIdx }, [stepIdx])

  const step = STEPS[stepIdx]
  const visitors = INITIAL_VISITORS - totalCasualties

  const advance = useCallback(() => {
    setStepIdx(prev => Math.min(prev + 1, STEPS.length - 1))
  }, [])

  // Flash visitor counter on casualty change
  useEffect(() => {
    if (totalCasualties > 0) {
      setVisitorFlash(true)
      const t = setTimeout(() => setVisitorFlash(false), 700)
      return () => clearTimeout(t)
    }
  }, [totalCasualties])

  // ── LOCATE: scanning → found ─────────────────────────
  useEffect(() => {
    if (step.type !== 'locate' || locatePhase !== 'scanning') return
    const t = setTimeout(() => setLocatePhase('found'), 2500)
    return () => clearTimeout(t)
  }, [step.type, locatePhase])

  // ── LOCATE: found → advance ─────────────────────────
  useEffect(() => {
    if (step.type !== 'locate' || locatePhase !== 'found') return
    const t = setTimeout(() => {
      setLocatePhase(null)
      advance()
    }, 1500)
    return () => clearTimeout(t)
  }, [step.type, locatePhase, advance])

  // ── CHASE ──────────────────────────────────────────────
  useEffect(() => {
    if (step.type !== 'chase') return
    const seg = SEGMENTS[step.index!]
    const t0 = performance.now()

    if (seg.audioSrc && audioRef.current) {
      audioRef.current.src = seg.audioSrc
      audioRef.current.play().catch(() => {})
    }

    const tick = (now: number) => {
      const p = Math.min((now - t0) / seg.duration, 1)
      setDinoY(seg.fromY + (seg.toY - seg.fromY) * p)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
      else advance()
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [stepIdx]) // eslint-disable-line

  // ── CHOICE TIMER ───────────────────────────────────────
  useEffect(() => {
    if (step.type !== 'choice') return
    chosenRef.current = false
    const zone = CHOICE_ZONES[step.index!]
    setTimer(zone.timerDuration)

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        const next = Math.max(prev - 0.1, 0)
        if (next <= 0.05 && !chosenRef.current) {
          const worst: 'left' | 'right' = zone.left.isWorst ? 'left' : 'right'
          makeChoice(worst)
        }
        return next
      })
    }, 100)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [stepIdx]) // eslint-disable-line

  // ── RESULT TIMEOUT ─────────────────────────────────────
  useEffect(() => {
    if (step.type !== 'result') return
    const t = setTimeout(advance, step.duration!)
    return () => clearTimeout(t)
  }, [stepIdx]) // eslint-disable-line

  // ── MAKE CHOICE ────────────────────────────────────────
  const makeChoice = useCallback((side: 'left' | 'right') => {
    if (chosenRef.current) return
    chosenRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)

    const ci = STEPS[stepIdxRef.current].index!
    const zone = CHOICE_ZONES[ci]
    const opt = side === 'left' ? zone.left : zone.right

    setChoices(prev => {
      const n = [...prev]
      n[ci] = side
      return n
    })
    setTotalCasualties(prev => prev + opt.casualties)
    setTimeout(() => setStepIdx(stepIdxRef.current + 1), 350)
  }, [])

  // ── RESTART ────────────────────────────────────────────
  const restart = useCallback(() => {
    setStepIdx(0)
    setDinoY(START_Y)
    setChoices([null, null, null])
    setTotalCasualties(0)
    setTimer(15)
    setLocatePhase('waiting')
    chosenRef.current = false
  }, [])

  // ── DERIVED ────────────────────────────────────────────
  const isChoice = step.type === 'choice'
  const isResult = step.type === 'result'
  const activeZone = (isChoice || isResult) ? CHOICE_ZONES[step.index!] : null
  const timerFrac = isChoice && activeZone ? timer / activeZone.timerDuration : 1
  const urgency = isChoice ? Math.max(0, 1 - timerFrac) : 0
  const gameStarted = locatePhase === null
  const dinoVisible = gameStarted && step.type !== 'finale'

  // ═════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════
  return (
    <div className="dc-game">
      {/* ── Urgency border ── */}
      {isChoice && (
        <div
          className="dc-urgency"
          style={{
            boxShadow: urgency > 0.2
              ? `inset 0 0 ${40 + urgency * 80}px rgba(239,68,68,${urgency * 0.5})`
              : 'none',
            animationDuration: `${Math.max(0.15, 1.2 - urgency * 1.1)}s`,
          }}
        />
      )}

      {/* ── Header ── */}
      <header className="dc-header">
        <div className="dc-header-title">ALERTE PARC</div>
        {gameStarted && (
          <div className="dc-visitors">
            <span className="dc-visitors-label">VISITEURS DANS LE PARC</span>
            <span className={`dc-visitors-num ${visitorFlash ? 'dc-visitors-flash' : ''}`}>
              {visitors}
            </span>
          </div>
        )}
      </header>

      {/* ── SVG Map ── */}
      <svg className="dc-map" viewBox="0 0 1024 768" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="gl-green">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="gl-red">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="gl-amber">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="bgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(100,116,139,0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect width="1024" height="768" fill="url(#bgGrid)" />

        <text x="512" y="740" textAnchor="middle" fill="#475569" fontSize="13"
          fontFamily="'Handjet',monospace" letterSpacing="3">ZONE SUD</text>
        <text x="512" y="38" textAnchor="middle" fill="#475569" fontSize="13"
          fontFamily="'Handjet',monospace" letterSpacing="3">ZONE NORD</text>

        {/* Main path background */}
        <line x1={MX} y1={START_Y} x2={MX} y2={ANTENNA.y}
          stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />

        {/* Main path active trail */}
        {gameStarted && dinoY < START_Y && (
          <line x1={MX} y1={START_Y} x2={MX} y2={Math.max(dinoY, ANTENNA.y)}
            stroke="#22c55e" strokeWidth="5" strokeLinecap="round" filter="url(#gl-green)" />
        )}

        {/* Distance markers */}
        {Array.from({ length: 20 }, (_, i) => {
          const y = START_Y - ((START_Y - ANTENNA.y) / 20) * i
          return <circle key={`dm${i}`} cx={MX} cy={y} r="1.2" fill="#334155" />
        })}

        {/* Branches */}
        {CHOICE_ZONES.map((zone, i) => {
          const chosen = choices[i]
          const active = isChoice && step.index === i
          return (
            <g key={`br${i}`}>
              {(['left', 'right'] as const).map(side => {
                const opt = zone[side]
                const isChosen = chosen === side
                return (
                  <path key={side}
                    d={branchPath(zone.junction.x, zone.junction.y, opt.nodePos.x, opt.nodePos.y)}
                    fill="none"
                    stroke={isChosen ? '#f59e0b' : active ? '#475569' : '#1e293b'}
                    strokeWidth={isChosen ? 4 : active ? 3 : 2}
                    strokeDasharray={isChosen ? 'none' : '8 4'}
                    filter={isChosen ? 'url(#gl-amber)' : 'none'}
                    opacity={active || chosen !== null ? 1 : 0.35}
                  />
                )
              })}
            </g>
          )
        })}

        {/* Junction nodes */}
        {CHOICE_ZONES.map((zone, i) => {
          const active = isChoice && step.index === i
          const passed = choices[i] !== null
          return (
            <g key={`jn${i}`}>
              <circle cx={zone.junction.x} cy={zone.junction.y} r={active ? 10 : 7}
                fill={passed ? '#0f172a' : '#0a0f1a'}
                stroke={active ? '#ef4444' : passed ? '#22c55e' : '#334155'}
                strokeWidth={active ? 3 : 2}
                filter={active ? 'url(#gl-red)' : 'none'} />
              {active && (
                <circle cx={zone.junction.x} cy={zone.junction.y} r="18"
                  fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4"
                  className="dc-pulse-ring" />
              )}
              <text x={zone.junction.x + 20} y={zone.junction.y + 4}
                textAnchor="start" fill={active ? '#94a3b8' : '#334155'} fontSize="11"
                fontFamily="'Handjet',monospace">
                ZONE {i + 1}
              </text>
            </g>
          )
        })}

        {/* Branch endpoint nodes + labels */}
        {CHOICE_ZONES.map((zone, i) => {
          const chosen = choices[i]
          const active = isChoice && step.index === i
          return (['left', 'right'] as const).map(side => {
            const opt = zone[side]
            const isChosen = chosen === side
            const p = opt.nodePos
            return (
              <g key={`nd${i}${side}`}>
                <circle cx={p.x} cy={p.y} r={active ? 11 : 9}
                  fill={isChosen ? 'rgba(245,158,11,0.12)' : '#0a0f1a'}
                  stroke={isChosen ? '#f59e0b' : active ? '#64748b' : '#1e293b'}
                  strokeWidth={isChosen ? 3 : 2}
                  filter={isChosen ? 'url(#gl-amber)' : 'none'} />
                <text x={p.x} y={p.y + 26} textAnchor="middle"
                  fill={isChosen ? '#f59e0b' : active ? '#cbd5e1' : '#475569'}
                  fontSize={active ? 13 : 11} fontWeight={active ? 'bold' : 'normal'}
                  fontFamily="'Handjet',monospace">
                  {opt.label}
                </text>
                <text x={p.x} y={p.y + 40} textAnchor="middle"
                  fill={active ? '#94a3b8' : '#334155'} fontSize="10"
                  fontFamily="'Handjet',monospace">
                  {opt.description}
                </text>
              </g>
            )
          })
        })}

        {/* Start node */}
        <circle cx={MX} cy={START_Y} r="10" fill="rgba(239,68,68,0.12)"
          stroke="#ef4444" strokeWidth="2" />
        <text x={MX} y={START_Y + 26} textAnchor="middle" fill="#ef4444"
          fontSize="13" fontWeight="bold" fontFamily="'Handjet',monospace">
          BRECHE DETECTEE
        </text>

        {/* Antenna node */}
        <g>
          <circle cx={ANTENNA.x} cy={ANTENNA.y} r="22" fill="none"
            stroke="#f59e0b" strokeWidth="1" opacity="0.15" className="dc-ant-ring1" />
          <circle cx={ANTENNA.x} cy={ANTENNA.y} r="14" fill="none"
            stroke="#f59e0b" strokeWidth="1.5" opacity="0.3" className="dc-ant-ring2" />
          <circle cx={ANTENNA.x} cy={ANTENNA.y} r="8"
            fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="2" />
          <line x1={ANTENNA.x} y1={ANTENNA.y - 5} x2={ANTENNA.x} y2={ANTENNA.y + 5}
            stroke="#f59e0b" strokeWidth="2" />
          <line x1={ANTENNA.x - 4} y1={ANTENNA.y + 3} x2={ANTENNA.x + 4} y2={ANTENNA.y + 3}
            stroke="#f59e0b" strokeWidth="1.5" />
          <text x={ANTENNA.x} y={ANTENNA.y - 30} textAnchor="middle" fill="#f59e0b"
            fontSize="13" fontWeight="bold" fontFamily="'Handjet',monospace">
            ANTENNE CENTRALE
          </text>
        </g>

        {/* Direction labels during choice */}
        {isChoice && activeZone && (
          <g className="dc-blink">
            <text x={MX - 55} y={activeZone.junction.y + 4} textAnchor="end"
              fill="#94a3b8" fontSize="16" fontFamily="'Handjet',monospace">{'\u25C0'} GAUCHE</text>
            <text x={MX + 55} y={activeZone.junction.y + 4} textAnchor="start"
              fill="#94a3b8" fontSize="16" fontFamily="'Handjet',monospace">DROITE {'\u25B6'}</text>
          </g>
        )}

        {/* Scanning rings during locate phase */}
        {locatePhase === 'scanning' && (
          <g>
            <circle cx={MX} cy={START_Y} r="10" fill="none" stroke="#ef4444"
              strokeWidth="2" opacity="0.6" className="dc-scan-ring dc-scan-ring-1" />
            <circle cx={MX} cy={START_Y} r="10" fill="none" stroke="#ef4444"
              strokeWidth="1.5" opacity="0.4" className="dc-scan-ring dc-scan-ring-2" />
            <circle cx={MX} cy={START_Y} r="10" fill="none" stroke="#ef4444"
              strokeWidth="1" opacity="0.3" className="dc-scan-ring dc-scan-ring-3" />
          </g>
        )}

        {/* Dino marker */}
        {dinoVisible && (
          <g transform={`translate(${MX}, ${dinoY})`}>
            <circle r="18" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.2"
              className="dc-dino-ring1" />
            <circle r="12" fill="none" stroke="#ef4444" strokeWidth="1.2" opacity="0.35"
              className="dc-dino-ring2" />
            <polygon points="0,-9 6,5 -6,5" fill="#ef4444" filter="url(#gl-red)" />
            <circle r="3" cy="-2" fill="#fff" opacity="0.9" />
          </g>
        )}
      </svg>

      {/* ── Timer bar ── */}
      {isChoice && (
        <div className="dc-timer">
          <div className="dc-timer-track">
            <div className="dc-timer-fill" style={{
              width: `${timerFrac * 100}%`,
              backgroundColor: timerFrac > 0.5 ? '#22c55e' : timerFrac > 0.25 ? '#f59e0b' : '#ef4444',
            }} />
          </div>
          <div className={`dc-timer-text ${timerFrac < 0.25 ? 'dc-timer-crit' : ''}`}>
            {Math.ceil(timer)}s
          </div>
        </div>
      )}

      {/* ── Choice buttons ── */}
      {isChoice && activeZone && (
        <div className="dc-choices">
          <button className="dc-choice-btn dc-choice-left"
            onClick={() => makeChoice('left')}
            onTouchEnd={(e) => { e.preventDefault(); makeChoice('left') }}>
            <span className="dc-choice-arrow">{'\u25C0'}</span>
            <span className="dc-choice-label">{activeZone.left.label}</span>
            <span className="dc-choice-desc">{activeZone.left.description}</span>
          </button>
          <button className="dc-choice-btn dc-choice-right"
            onClick={() => makeChoice('right')}
            onTouchEnd={(e) => { e.preventDefault(); makeChoice('right') }}>
            <span className="dc-choice-arrow">{'\u25B6'}</span>
            <span className="dc-choice-label">{activeZone.right.label}</span>
            <span className="dc-choice-desc">{activeZone.right.description}</span>
          </button>
        </div>
      )}

      {/* ── Choice result banner ── */}
      {isResult && activeZone && (() => {
        const side = choices[step.index!]
        const opt = side === 'left' ? activeZone.left : activeZone.right
        return (
          <div className="dc-result">
            <div className="dc-result-loc">{opt.label}</div>
          </div>
        )
      })()}

      {/* ── Locate overlay ── */}
      {step.type === 'locate' && (
        <div className={`dc-locate ${locatePhase === 'found' ? 'dc-locate-found' : ''}`}>
          {locatePhase === 'waiting' && (
            <>
              <div className="dc-locate-icon">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                  <circle cx="40" cy="40" r="18" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                  <circle cx="40" cy="40" r="4" fill="#ef4444" />
                  <line x1="40" y1="6" x2="40" y2="20" stroke="#ef4444" strokeWidth="1.5" />
                  <line x1="40" y1="60" x2="40" y2="74" stroke="#ef4444" strokeWidth="1.5" />
                  <line x1="6" y1="40" x2="20" y2="40" stroke="#ef4444" strokeWidth="1.5" />
                  <line x1="60" y1="40" x2="74" y2="40" stroke="#ef4444" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="dc-locate-title">SYSTEME DE SUIVI GPS</div>
              <div className="dc-locate-sub">Puce sous-cutanee T-REX #044</div>
              <button className="dc-locate-btn"
                onClick={() => setLocatePhase('scanning')}
                onTouchEnd={(e) => { e.preventDefault(); setLocatePhase('scanning') }}>
                LOCALISER LA PUCE
              </button>
            </>
          )}

          {locatePhase === 'scanning' && (
            <>
              <div className="dc-locate-icon dc-locate-scanning">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.4" className="dc-spin" />
                  <circle cx="40" cy="40" r="18" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                  <circle cx="40" cy="40" r="4" fill="#ef4444" />
                  <line x1="40" y1="6" x2="40" y2="20" stroke="#ef4444" strokeWidth="1.5" />
                  <line x1="40" y1="60" x2="40" y2="74" stroke="#ef4444" strokeWidth="1.5" />
                  <line x1="6" y1="40" x2="20" y2="40" stroke="#ef4444" strokeWidth="1.5" />
                  <line x1="60" y1="40" x2="74" y2="40" stroke="#ef4444" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="dc-locate-status">RECHERCHE DU SIGNAL<span className="dc-dots" /></div>
            </>
          )}

          {locatePhase === 'found' && (
            <>
              <div className="dc-locate-icon">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
                  <circle cx="40" cy="40" r="18" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                  <circle cx="40" cy="40" r="6" fill="#ef4444" />
                </svg>
              </div>
              <div className="dc-locate-found-text">SIGNAL DETECTE</div>
              <div className="dc-locate-found-zone">ZONE SUD — ENCLOS PRIMAIRE</div>
            </>
          )}
        </div>
      )}

      {/* ── Finale: signal lost ── */}
      {step.type === 'finale' && (
        <div className="dc-signal-lost">
          <div className="dc-static-overlay" />
          <div className="dc-signal-content">
            <div className="dc-signal-icon">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="24" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 6" opacity="0.5" />
                <line x1="18" y1="18" x2="46" y2="46" stroke="#ef4444" strokeWidth="3" />
                <line x1="46" y1="18" x2="18" y2="46" stroke="#ef4444" strokeWidth="3" />
              </svg>
            </div>
            <div className="dc-signal-title">PERTE DE SIGNAL</div>
            <div className="dc-signal-sub">Derniere position connue : ANTENNE CENTRALE</div>
            <div className="dc-signal-visitors">
              <span className="dc-signal-visitors-label">Visiteurs restants</span>
              <span className="dc-signal-visitors-num">{visitors}</span>
            </div>
            <button className="dc-restart" onClick={restart}>REJOUER</button>
          </div>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  )
}
