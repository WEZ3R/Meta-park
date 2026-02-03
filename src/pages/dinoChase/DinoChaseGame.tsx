import { useState, useEffect, useRef, useCallback } from 'react'
import './DinoChaseGame.css'

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface Position { x: number; y: number }

interface ForkOption {
  label: string
  description: string
  casualties: number
  isWorst: boolean
}

interface Fork {
  forkPt: Position
  mergePt: Position
  leftApex: Position
  rightApex: Position
  left: ForkOption
  right: ForkOption
  timerDuration: number
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
const START_POS: Position = { x: MX, y: 700 }
const ANTENNA: Position = { x: MX, y: 65 }

const FORKS: Fork[] = [
  {
    forkPt: { x: MX, y: 595 },
    mergePt: { x: MX, y: 485 },
    leftApex: { x: 250, y: 540 },
    rightApex: { x: 774, y: 540 },
    left: {
      label: 'ENCLOS CARNIVORES',
      description: 'Zone haute securite — Personnel arme',
      casualties: 18, isWorst: true,
    },
    right: {
      label: 'ENCLOS HERBIVORES',
      description: 'Zone ouverte — Faible presence humaine',
      casualties: 7, isWorst: false,
    },
    timerDuration: 15,
  },
  {
    forkPt: { x: MX, y: 395 },
    mergePt: { x: MX, y: 285 },
    leftApex: { x: 225, y: 340 },
    rightApex: { x: 799, y: 340 },
    left: {
      label: 'ZONE SAFARI',
      description: 'Vehicules civils en circulation',
      casualties: 32, isWorst: true,
    },
    right: {
      label: 'ENCLOS SOIGNEURS',
      description: 'Equipe veterinaire en intervention',
      casualties: 9, isWorst: false,
    },
    timerDuration: 15,
  },
  {
    forkPt: { x: MX, y: 205 },
    mergePt: { x: MX, y: 100 },
    leftApex: { x: 265, y: 150 },
    rightApex: { x: 759, y: 150 },
    left: {
      label: 'ENCLOS CARNIVORES',
      description: 'Risque de breche secondaire — Gardes mobilises',
      casualties: 23, isWorst: true,
    },
    right: {
      label: 'NURSERIE',
      description: 'Aucun humain present — Jeunes dinosaures',
      casualties: 0, isWorst: false,
    },
    timerDuration: 15,
  },
]

const CHASE_DURATIONS = [4500, 5500, 5500, 5000]

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

// Straight connectors between forks
const CONNECTORS: [Position, Position][] = [
  [START_POS, FORKS[0].forkPt],
  [FORKS[0].mergePt, FORKS[1].forkPt],
  [FORKS[1].mergePt, FORKS[2].forkPt],
  [FORKS[2].mergePt, ANTENNA],
]

// Step index thresholds for connector completion
const CONNECTOR_DONE_AFTER = [1, 4, 7, 10]

// ═══════════════════════════════════════════════════════════
// PATH HELPERS
// ═══════════════════════════════════════════════════════════

function quadBezier(p0: Position, ctrl: Position, p2: Position, t: number): Position {
  const mt = 1 - t
  return {
    x: mt * mt * p0.x + 2 * mt * t * ctrl.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * ctrl.y + t * t * p2.y,
  }
}

function interpolatePath(pts: Position[], t: number): Position {
  if (t <= 0 || pts.length < 2) return pts[0]
  if (t >= 1) return pts[pts.length - 1]
  let totalLen = 0
  const lens: number[] = []
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x
    const dy = pts[i].y - pts[i - 1].y
    const len = Math.sqrt(dx * dx + dy * dy)
    lens.push(len)
    totalLen += len
  }
  let target = t * totalLen
  for (let i = 0; i < lens.length; i++) {
    if (target <= lens[i] || i === lens.length - 1) {
      const lt = lens[i] > 0 ? target / lens[i] : 0
      return {
        x: pts[i].x + (pts[i + 1].x - pts[i].x) * lt,
        y: pts[i].y + (pts[i + 1].y - pts[i].y) * lt,
      }
    }
    target -= lens[i]
  }
  return pts[pts.length - 1]
}

function getChaseWaypoints(segIdx: number, chs: ('left' | 'right' | null)[]): Position[] {
  if (segIdx === 0) {
    return [START_POS, FORKS[0].forkPt]
  }
  const fi = segIdx - 1
  const fork = FORKS[fi]
  const side = chs[fi] || 'left'
  const apex = side === 'left' ? fork.leftApex : fork.rightApex

  // Sample quadratic bezier through the chosen branch
  const pts: Position[] = []
  const N = 24
  for (let i = 0; i <= N; i++) {
    pts.push(quadBezier(fork.forkPt, apex, fork.mergePt, i / N))
  }

  // Straight connector to next fork or off-screen
  if (fi < FORKS.length - 1) {
    pts.push(FORKS[fi + 1].forkPt)
  } else {
    pts.push({ x: MX, y: -60 })
  }
  return pts
}

function branchD(fork: Fork, side: 'left' | 'right'): string {
  const apex = side === 'left' ? fork.leftApex : fork.rightApex
  return `M ${fork.forkPt.x} ${fork.forkPt.y} Q ${apex.x} ${apex.y} ${fork.mergePt.x} ${fork.mergePt.y}`
}

// ═══════════════════════════════════════════════════════════
// MAP DECORATION
// ═══════════════════════════════════════════════════════════

const ENCLOSURE_COLORS = [
  { fill: 'rgba(239,68,68,0.04)', stroke: 'rgba(239,68,68,0.13)' },
  { fill: 'rgba(34,197,94,0.04)', stroke: 'rgba(34,197,94,0.13)' },
  { fill: 'rgba(245,158,11,0.04)', stroke: 'rgba(245,158,11,0.13)' },
  { fill: 'rgba(59,130,246,0.04)', stroke: 'rgba(59,130,246,0.13)' },
  { fill: 'rgba(239,68,68,0.04)', stroke: 'rgba(239,68,68,0.13)' },
  { fill: 'rgba(168,85,247,0.04)', stroke: 'rgba(168,85,247,0.13)' },
]

const TREES: Position[] = [
  { x: 120, y: 680 }, { x: 300, y: 715 }, { x: 650, y: 695 },
  { x: 860, y: 720 }, { x: 955, y: 680 },
  { x: 70, y: 565 }, { x: 960, y: 555 }, { x: 65, y: 520 },
  { x: 80, y: 440 }, { x: 948, y: 430 }, { x: 400, y: 460 }, { x: 628, y: 452 },
  { x: 75, y: 260 }, { x: 950, y: 255 }, { x: 415, y: 252 }, { x: 618, y: 248 },
  { x: 68, y: 380 }, { x: 958, y: 370 }, { x: 68, y: 172 }, { x: 958, y: 168 },
  { x: 85, y: 90 }, { x: 940, y: 88 }, { x: 380, y: 78 }, { x: 650, y: 82 },
]

const BUILDINGS: { x: number; y: number; w: number; h: number; label: string }[] = [
  { x: 470, y: 714, w: 84, h: 22, label: 'ACCUEIL' },
  { x: 150, y: 700, w: 70, h: 26, label: 'PARKING' },
  { x: 440, y: 50, w: 50, h: 18, label: 'COM.' },
]

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function DinoChaseGame() {
  const [stepIdx, setStepIdx] = useState(0)
  const [dinoPos, setDinoPos] = useState<Position>(START_POS)
  const [pursuerPos, setPursuerPos] = useState<Position>({ x: MX, y: 760 })
  const [choices, setChoices] = useState<('left' | 'right' | null)[]>([null, null, null])
  const [totalCasualties, setTotalCasualties] = useState(0)
  const [timer, setTimer] = useState(15)
  const [visitorFlash, setVisitorFlash] = useState(false)
  const [locatePhase, setLocatePhase] = useState<'waiting' | 'scanning' | 'found' | null>('waiting')

  const audioRef = useRef<HTMLAudioElement>(null)
  const rafRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const chosenRef = useRef(false)
  const stepIdxRef = useRef(0)
  const waypointsRef = useRef<Position[]>([])
  const chaseProgressRef = useRef(0)

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
    const waypoints = getChaseWaypoints(step.index!, choices)
    waypointsRef.current = waypoints
    chaseProgressRef.current = 0
    const duration = CHASE_DURATIONS[step.index!]
    const t0 = performance.now()

    // Audio
    if (step.index === 1 && audioRef.current) {
      audioRef.current.src = '/audio/chase-narration-1.mp3'
      audioRef.current.play().catch(() => {})
    } else if (step.index === 2 && audioRef.current) {
      audioRef.current.src = '/audio/chase-narration-2.mp3'
      audioRef.current.play().catch(() => {})
    }

    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      chaseProgressRef.current = p
      setDinoPos(interpolatePath(waypoints, p))
      setPursuerPos(interpolatePath(waypoints, Math.max(0, p - 0.13)))
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
    const fork = FORKS[step.index!]
    setTimer(fork.timerDuration)

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        const next = Math.max(prev - 0.1, 0)
        if (next <= 0.05 && !chosenRef.current) {
          const worst: 'left' | 'right' = fork.left.isWorst ? 'left' : 'right'
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
    const fork = FORKS[ci]
    const opt = side === 'left' ? fork.left : fork.right

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
    setDinoPos(START_POS)
    setPursuerPos({ x: MX, y: 760 })
    setChoices([null, null, null])
    setTotalCasualties(0)
    setTimer(15)
    setLocatePhase('waiting')
    chosenRef.current = false
    chaseProgressRef.current = 0
    waypointsRef.current = []
  }, [])

  // ── DERIVED ────────────────────────────────────────────
  const isChoice = step.type === 'choice'
  const isResult = step.type === 'result'
  const activeFork = (isChoice || isResult) ? FORKS[step.index!] : null
  const timerFrac = isChoice && activeFork ? timer / activeFork.timerDuration : 1
  const urgency = isChoice ? Math.max(0, 1 - timerFrac) : 0
  const gameStarted = locatePhase === null
  const dinoVisible = gameStarted && step.type !== 'finale'
  const pursuerVisible = gameStarted && step.type !== 'finale' && pursuerPos.y < 750

  // Trail during active chase
  const chaseTrailD = (() => {
    if (step.type !== 'chase' || !gameStarted) return ''
    const wp = waypointsRef.current
    if (wp.length < 2) return ''
    const prog = chaseProgressRef.current
    const endIdx = Math.min(Math.ceil(prog * (wp.length - 1)), wp.length - 1)
    const pts = wp.slice(0, endIdx + 1)
    if (pts.length < 2) return ''
    return 'M ' + pts.map(p => `${p.x} ${p.y}`).join(' L ')
  })()

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
          <filter id="gl-blue">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="bgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(100,116,139,0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect width="1024" height="768" fill="url(#bgGrid)" />

        {/* ── Park perimeter ── */}
        <rect x="45" y="42" width="934" height="700" rx="18"
          fill="none" stroke="rgba(100,116,139,0.1)" strokeWidth="1.5" strokeDasharray="14 8" />

        <text x="512" y="758" textAnchor="middle" fill="#475569" fontSize="13"
          fontFamily="'Handjet',monospace" letterSpacing="3">ZONE SUD — ENTREE</text>
        <text x="512" y="38" textAnchor="middle" fill="#475569" fontSize="13"
          fontFamily="'Handjet',monospace" letterSpacing="3">ZONE NORD — COMMUNICATIONS</text>

        {/* ── Enclosures around branch apexes ── */}
        {FORKS.map((fork, fi) =>
          (['left', 'right'] as const).map((side, si) => {
            const apex = side === 'left' ? fork.leftApex : fork.rightApex
            const col = ENCLOSURE_COLORS[fi * 2 + si]
            return (
              <rect key={`enc${fi}${side}`}
                x={apex.x - 95} y={apex.y - 35} width={190} height={70} rx="12"
                fill={col.fill} stroke={col.stroke} strokeWidth="1.5" strokeDasharray="8 5" />
            )
          })
        )}

        {/* ── Water ── */}
        <path d="M 825,635 Q 860,610 895,630 Q 912,652 888,672 Q 855,686 828,665 Q 808,650 825,635 Z"
          fill="rgba(56,189,248,0.05)" stroke="rgba(56,189,248,0.1)" strokeWidth="1" />
        <text x="860" y="655" textAnchor="middle" fill="rgba(56,189,248,0.18)" fontSize="10"
          fontFamily="'Handjet',monospace">LAC</text>

        {/* ── Trees ── */}
        {TREES.map((t, i) => (
          <circle key={`tr${i}`} cx={t.x} cy={t.y} r={3.5 + (i % 3) * 1.5}
            fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.1)" strokeWidth="0.7" />
        ))}

        {/* ── Buildings ── */}
        {BUILDINGS.map((b, i) => (
          <g key={`bld${i}`}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="3"
              fill="rgba(148,163,184,0.04)" stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 3} textAnchor="middle"
              fill="#334155" fontSize="9" fontFamily="'Handjet',monospace">{b.label}</text>
          </g>
        ))}

        {/* ── Straight connectors between forks ── */}
        {CONNECTORS.map(([from, to], i) => {
          const done = stepIdx > CONNECTOR_DONE_AFTER[i]
          return (
            <line key={`conn${i}`}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={done ? '#22c55e' : '#1e293b'}
              strokeWidth={done ? 5 : 6}
              strokeLinecap="round"
              filter={done ? 'url(#gl-green)' : 'none'} />
          )
        })}

        {/* ── Fork branches (bezier curves) ── */}
        {FORKS.map((fork, fi) => (
          <g key={`fork-br${fi}`}>
            {(['left', 'right'] as const).map(side => {
              const d = branchD(fork, side)
              const isChosen = choices[fi] === side
              const isOther = choices[fi] !== null && !isChosen
              const active = isChoice && step.index === fi
              return (
                <path key={side} d={d}
                  fill="none"
                  stroke={isChosen ? '#f59e0b' : active ? '#64748b' : '#1e293b'}
                  strokeWidth={isChosen ? 5 : active ? 3.5 : 2.5}
                  strokeDasharray={isChosen ? 'none' : active ? '10 6' : '8 5'}
                  filter={isChosen ? 'url(#gl-amber)' : 'none'}
                  opacity={isOther ? 0.15 : active || isChosen ? 1 : 0.35}
                />
              )
            })}
          </g>
        ))}

        {/* ── Active chase trail ── */}
        {chaseTrailD && (
          <path d={chaseTrailD} fill="none" stroke="#22c55e" strokeWidth="4"
            strokeLinecap="round" strokeLinejoin="round" filter="url(#gl-green)" opacity="0.6" />
        )}

        {/* ── Fork junction markers ── */}
        {FORKS.map((fork, fi) => {
          const active = isChoice && step.index === fi
          const chosen = choices[fi] !== null
          return (
            <g key={`jn${fi}`}>
              {/* Fork point */}
              <circle cx={fork.forkPt.x} cy={fork.forkPt.y}
                r={active ? 10 : 7}
                fill={chosen ? '#0f172a' : '#0a0f1a'}
                stroke={active ? '#ef4444' : chosen ? '#22c55e' : '#334155'}
                strokeWidth={active ? 3 : 2}
                filter={active ? 'url(#gl-red)' : 'none'} />
              {active && (
                <circle cx={fork.forkPt.x} cy={fork.forkPt.y} r="18"
                  fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4"
                  className="dc-pulse-ring" />
              )}
              <text x={fork.forkPt.x + 22} y={fork.forkPt.y + 4}
                textAnchor="start" fill={active ? '#94a3b8' : '#334155'} fontSize="11"
                fontFamily="'Handjet',monospace">
                EMBRANCHEMENT {fi + 1}
              </text>
              {/* Merge point */}
              <circle cx={fork.mergePt.x} cy={fork.mergePt.y} r="4"
                fill={chosen ? '#0f172a' : '#0a0f1a'}
                stroke={chosen ? '#22c55e' : '#1e293b'} strokeWidth="1.5" />
            </g>
          )
        })}

        {/* ── Branch labels at apexes ── */}
        {FORKS.map((fork, fi) =>
          (['left', 'right'] as const).map(side => {
            const opt = fork[side]
            const apex = side === 'left' ? fork.leftApex : fork.rightApex
            const isChosen = choices[fi] === side
            const active = isChoice && step.index === fi
            return (
              <g key={`lbl${fi}${side}`}>
                <text x={apex.x} y={apex.y - 14} textAnchor="middle"
                  fill={isChosen ? '#f59e0b' : active ? '#cbd5e1' : '#475569'}
                  fontSize={active ? 13 : 11}
                  fontWeight={active ? 'bold' : 'normal'}
                  fontFamily="'Handjet',monospace">
                  {opt.label}
                </text>
                <text x={apex.x} y={apex.y + 2} textAnchor="middle"
                  fill={active ? '#94a3b8' : '#334155'} fontSize="10"
                  fontFamily="'Handjet',monospace">
                  {opt.description}
                </text>
              </g>
            )
          })
        )}

        {/* ── Start node ── */}
        <circle cx={START_POS.x} cy={START_POS.y} r="10" fill="rgba(239,68,68,0.12)"
          stroke="#ef4444" strokeWidth="2" />
        <text x={START_POS.x} y={START_POS.y + 26} textAnchor="middle" fill="#ef4444"
          fontSize="13" fontWeight="bold" fontFamily="'Handjet',monospace">
          BRECHE DETECTEE
        </text>

        {/* ── Antenna node ── */}
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

        {/* ── Direction labels during choice ── */}
        {isChoice && activeFork && (
          <g className="dc-blink">
            <text x={activeFork.forkPt.x - 55} y={activeFork.forkPt.y + 4} textAnchor="end"
              fill="#94a3b8" fontSize="16" fontFamily="'Handjet',monospace">{'\u25C0'} GAUCHE</text>
            <text x={activeFork.forkPt.x + 55} y={activeFork.forkPt.y + 4} textAnchor="start"
              fill="#94a3b8" fontSize="16" fontFamily="'Handjet',monospace">DROITE {'\u25B6'}</text>
          </g>
        )}

        {/* ── Scanning rings ── */}
        {locatePhase === 'scanning' && (
          <g>
            <circle cx={MX} cy={START_POS.y} r="10" fill="none" stroke="#ef4444"
              strokeWidth="2" opacity="0.6" className="dc-scan-ring dc-scan-ring-1" />
            <circle cx={MX} cy={START_POS.y} r="10" fill="none" stroke="#ef4444"
              strokeWidth="1.5" opacity="0.4" className="dc-scan-ring dc-scan-ring-2" />
            <circle cx={MX} cy={START_POS.y} r="10" fill="none" stroke="#ef4444"
              strokeWidth="1" opacity="0.3" className="dc-scan-ring dc-scan-ring-3" />
          </g>
        )}

        {/* ── Pursuer marker ── */}
        {pursuerVisible && (
          <g transform={`translate(${pursuerPos.x}, ${pursuerPos.y})`}>
            <circle r="16" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.15"
              className="dc-pursuer-ring1" />
            <circle r="10" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.25"
              className="dc-pursuer-ring2" />
            <circle r="6" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="2"
              filter="url(#gl-blue)" />
            <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="0" y="20" textAnchor="middle" fill="#38bdf8" fontSize="9"
              fontFamily="'Handjet',monospace" letterSpacing="1" opacity="0.7">EQUIPE</text>
          </g>
        )}

        {/* ── Dino marker ── */}
        {dinoVisible && (
          <g transform={`translate(${dinoPos.x}, ${dinoPos.y})`}>
            <circle r="18" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.2"
              className="dc-dino-ring1" />
            <circle r="12" fill="none" stroke="#ef4444" strokeWidth="1.2" opacity="0.35"
              className="dc-dino-ring2" />
            <polygon points="0,-9 6,5 -6,5" fill="#ef4444" filter="url(#gl-red)" />
            <circle r="3" cy="-2" fill="#fff" opacity="0.9" />
          </g>
        )}

        {/* ── Legend ── */}
        {gameStarted && (
          <g transform="translate(860, 50)">
            <rect x="-8" y="-12" width="150" height="50" rx="6"
              fill="rgba(7,11,20,0.85)" stroke="rgba(100,116,139,0.12)" strokeWidth="1" />
            <polygon points="6,-2 10,4 2,4" fill="#ef4444" />
            <text x="18" y="3" fill="#94a3b8" fontSize="10" fontFamily="'Handjet',monospace"
              letterSpacing="1">T-REX #044</text>
            <circle cx="6" cy="22" r="4" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="3" y1="22" x2="9" y2="22" stroke="#38bdf8" strokeWidth="1" />
            <line x1="6" y1="19" x2="6" y2="25" stroke="#38bdf8" strokeWidth="1" />
            <text x="18" y="25" fill="#94a3b8" fontSize="10" fontFamily="'Handjet',monospace"
              letterSpacing="1">EQUIPE INTERV.</text>
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
      {isChoice && activeFork && (
        <div className="dc-choices">
          <button className="dc-choice-btn dc-choice-left"
            onClick={() => makeChoice('left')}
            onTouchEnd={(e) => { e.preventDefault(); makeChoice('left') }}>
            <span className="dc-choice-arrow">{'\u25C0'}</span>
            <span className="dc-choice-label">{activeFork.left.label}</span>
            <span className="dc-choice-desc">{activeFork.left.description}</span>
          </button>
          <button className="dc-choice-btn dc-choice-right"
            onClick={() => makeChoice('right')}
            onTouchEnd={(e) => { e.preventDefault(); makeChoice('right') }}>
            <span className="dc-choice-arrow">{'\u25B6'}</span>
            <span className="dc-choice-label">{activeFork.right.label}</span>
            <span className="dc-choice-desc">{activeFork.right.description}</span>
          </button>
        </div>
      )}

      {/* ── Choice result banner ── */}
      {isResult && activeFork && (() => {
        const side = choices[step.index!]
        const opt = side === 'left' ? activeFork.left : activeFork.right
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
