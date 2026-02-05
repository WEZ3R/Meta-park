import { useState } from 'react'
import { ScreensaverVideo } from '../../components/ScreensaverVideo/ScreensaverVideo'
import { useApp } from '../../shared/context/AppContext'
import { api } from '../../shared/api/client'
import './QuestionnairePage.css'

// ═══════════════════════════════════════════════════════════
// QUESTIONS DATA
// ═══════════════════════════════════════════════════════════

interface TimeQuestion {
  type: 'time'
  text: string
  answer: string
}

interface TextMultiQuestion {
  type: 'text-multi'
  text: string
  count: number
  answers: string[]
}

interface DateQuestion {
  type: 'date'
  text: string
  answer: string
}

interface SelectQuestion {
  type: 'select'
  text: string
  options: string[]
  answer: string
}

interface NumberQuestion {
  type: 'number'
  text: string
  answer: number
}

interface SelectMultiQuestion {
  type: 'select-multi'
  text: string
  count: number
  options: string[]
  answers: string[]
}

type Question = (TimeQuestion | TextMultiQuestion | DateQuestion | SelectQuestion | NumberQuestion | SelectMultiQuestion) & { id: number }

const QUESTIONS: Question[] = [
  // ── FACILE (1-6) ──
  {
    id: 1,
    type: 'time',
    text: "À quelle heure le centre de controle a-t-il été initialisé le jour de l'incident ? (zone log)",
    answer: '17:30',
  },
  {
    id: 2,
    type: 'text-multi',
    text: "De qui était constituée l'équipe terrain ? (zone log)",
    count: 3,
    answers: ['julia', 'fabio', 'rico'],
  },
  {
    id: 3,
    type: 'date',
    text: 'Quel jour a eu lieu l\'incident? (zone control)',
    answer: '03/06',
  },
  {
    id: 4,
    type: 'number',
    text: "Combien d'œufs ont éclos dans le labo ? (zone labo)",
    answer: 7,
  },
  {
    id: 5,
    type: 'select',
    text: 'Quel dinosaure s\'est échappé ? (zone control)',
    options: [
      'T-Rex', 'Vélociraptor', 'Brachiosaure', 'Ptéranodon',
      'Stégosaure', 'Spinosaure', 'Dilophosaure', 'Ankylosaure',
    ],
    answer: 'T-Rex',
  },
  {
    id: 6,
    type: 'time',
    text: 'À quelle heure la coupure réseau a-t-elle eu lieu ? (zone log)',
    answer: '18:22',
  },
  // ── MOYEN (7-11) ──
  {
    id: 7,
    type: 'select-multi',
    text: 'Quelles caméras ont détecté une anomalie avant la coupure réseau ? (zone control)',
    count: 2,
    options: [
      'Caméra 1', 'Caméra 2', 'Caméra 3', 'Caméra 4', 'Caméra 5',
      'Caméra 6', 'Caméra 7', 'Caméra 8', 'Caméra 9', 'Caméra 10',
    ],
    answers: ['Caméra 4', 'Caméra 8'],
  },
  {
    id: 8,
    type: 'select',
    text: 'Quel est le signe astrologique de Rico ? (décor)',
    options: [
      'Bélier', 'Taureau', 'Gémeaux', 'Cancer',
      'Lion', 'Vierge', 'Balance', 'Scorpion',
      'Sagittaire', 'Capricorne', 'Verseau', 'Poissons',
    ],
    answer: 'Lion',
  },
  {
    id: 9,
    type: 'select',
    text: 'Est ce que fabio à tiré sur le sujet ? (zone control)',
    options: [
      'Fabio à manqué la cible',
      'Fabio à tiré mais il a raté',
      'Fabio n/a pas tiré sur le sujet',
      'Fabio à tiré et à touché le sujet',
    ],
    answer: 'Fabio à tiré et à touché le sujet',
  },
  {
    id: 10,
    type: 'time',
    text: 'À quelle heure est morte Julia ? (zone log)',
    answer: '18:21',
  },
  {
    id: 11,
    type: 'time',
    text: 'À quelle heure le dino a-t-il été neutralisé ? (zone log)',
    answer: '19:29',
  },
  // ── DIFFICILE (12-14) ──
  {
    id: 12,
    type: 'select',
    text: "À quel évènement ciné fait référence le code d'accès du centre de contrôle ?",
    options: [
      "La date de sortie de Jurassic World",
      'La date de sortie de Star Wars épisode IV',
      'La date de sortie du premier Jurassic Park',
      'La date de sortie du premier Indiana Jones',
    ],
    answer: 'La date de sortie du premier Jurassic Park',
  },
  {
    id: 13,
    type: 'select',
    text: 'Quel enclos a été ouvert pour ralentir le dino lors de la poursuite ?',
    options: [
      'Raptors', 'T-Rex', 'Ptéranodons', 'Brachiosaures',
      'Dilophosaures', 'Stégosaures',
    ],
    answer: 'Raptors',
  },
  {
    id: 14,
    type: 'select',
    text: "Quel dinosaure a été classifié comme carnivore sur les affiches alors qu'il est herbivore ?",
    options: [
      'Triceratops', 'Brachiosaure', 'Stégosaure',
      'Parasaurolophus', 'Ankylosaure', 'Pachycéphalosaure',
    ],
    answer: 'Triceratops',
  },
  // ── EXTRÊME (15-16) ──
  {
    id: 15,
    type: 'select',
    text: 'Quelle est la molécule qui a été utilisée pour créer le gaz qui a neutralisé le dinosaure ?',
    options: [
      'Éthanol', 'Oméga-Soufre', 'Krypton', 'Séquenceur-Z',
      'Xénotrium', 'Cryo-Génon', 'Lithium', 'Quartz-Liquide',
      'Nitro-Phosphore', 'Gaz-Somnus', 'Acide-Borique', 'Sério-Végétal',
    ],
    answer: 'Gaz-Somnus',
  },
  {
    id: 16,
    type: 'number',
    text: 'Nombre de victimes au total lors de l\'incident ?',
    answer: 8134,
  },
]

// ═══════════════════════════════════════════════════════════
// SCORING
// ═══════════════════════════════════════════════════════════

const POINTS: Record<number, number> = {
  1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3,
  7: 5, 8: 5, 9: 5, 10: 5, 11: 5,
  12: 7, 13: 7, 14: 7,
  15: 10, 16: 10,
}

const MAX_SCORE = QUESTIONS.reduce((sum, q) => sum + (POINTS[q.id] ?? 3), 0)

const SECTIONS = [
  { label: 'FACILE', slug: 'facile', ids: [1, 2, 3, 4, 5, 6] },
  { label: 'MOYEN', slug: 'moyen', ids: [7, 8, 9, 10, 11] },
  { label: 'DIFFICILE', slug: 'difficile', ids: [12, 13, 14] },
  { label: 'EXTRÊME', slug: 'extreme', ids: [15, 16] },
]

const QUESTIONS_BY_ID = new Map(QUESTIONS.map(q => [q.id, q]))

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function checkAnswer(q: Question, value: string | string[]): boolean {
  switch (q.type) {
    case 'time':
      return (value as string).replace('h', ':') === q.answer
    case 'date':
      return (value as string) === q.answer
    case 'number':
      return Number(value) === q.answer
    case 'select':
      return value === q.answer
    case 'text-multi': {
      const vals = (value as string[]).map(normalize).filter(Boolean)
      const expected = q.answers.map(normalize)
      if (vals.length !== expected.length) return false
      return expected.every(e => vals.includes(e)) && new Set(vals).size === vals.length
    }
    case 'select-multi': {
      const vals = value as string[]
      const expected = q.answers
      if (vals.length !== expected.length) return false
      return expected.every(e => vals.includes(e))
    }
    default:
      return false
  }
}

function getDefaultValue(q: Question): string | string[] {
  return q.type === 'text-multi' || q.type === 'select-multi' ? [] : ''
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

type Stats = Record<number, { total: number; correct: number }>

export function QuestionnairePage() {
  const { status } = useApp()
  const phase = status?.phase ?? 0
  const isShutdown = status?.isShutdown ?? false

  const [teamName, setTeamName] = useState('')
  const [teamNameConfirmed, setTeamNameConfirmed] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [validated, setValidated] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const updateAnswer = (id: number, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
    if (validated) {
      setValidated(false)
      setStats(null)
    }
  }

  const updateMultiAnswer = (id: number, index: number, value: string) => {
    setAnswers(prev => {
      const current = (prev[id] as string[]) || []
      const next = [...current]
      next[index] = value
      return { ...prev, [id]: next }
    })
    if (validated) {
      setValidated(false)
      setStats(null)
    }
  }

  const handleValidate = async () => {
    setSubmitting(true)
    const results: Record<number, boolean> = {}
    for (const q of QUESTIONS) {
      results[q.id] = checkAnswer(q, answers[q.id] ?? getDefaultValue(q))
    }
    const finalScore = QUESTIONS.reduce((sum, q) => {
      const correct = checkAnswer(q, answers[q.id] ?? getDefaultValue(q))
      return sum + (correct ? (POINTS[q.id] ?? 3) : 0)
    }, 0)
    try {
      const res = await api.submitQuestionnaire(results, teamName, finalScore)
      setStats(res.stats)
    } catch {
      // Stats won't show but validation still works
    }
    setValidated(true)
    setSubmitting(false)
  }

  const handleReset = () => {
    setAnswers({})
    setValidated(false)
    setStats(null)
  }

  const score = validated
    ? QUESTIONS.reduce((sum, q) => {
        const correct = checkAnswer(q, answers[q.id] ?? getDefaultValue(q))
        return sum + (correct ? (POINTS[q.id] ?? 3) : 0)
      }, 0)
    : 0

  // ── Guards ──────────────────────────────────────────────

  if (phase === 1 || isShutdown) {
    return <ScreensaverVideo videoSrc="/videos/ERRORSIGNAL.mp4" />
  }

  // ── Render ──────────────────────────────────────────────

  if (!teamNameConfirmed) {
    return (
      <div className="questionnaire-page">
        <div className="q-team-overlay">
          <div className="q-team-popup">
            <h2 className="q-team-title">NOM D'ÉQUIPE</h2>
            <input
              type="text"
              className="q-input q-team-input"
              placeholder="Entrez le nom de votre équipe"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && teamName.trim()) setTeamNameConfirmed(true) }}
              autoFocus
            />
            <button
              className="q-btn q-btn-validate"
              onClick={() => setTeamNameConfirmed(true)}
              disabled={!teamName.trim()}
            >
              COMMENCER
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="questionnaire-page">
      <div className="q-container">
        <h1 className="q-title">RAPPORT D'INCIDENT</h1>
        <p className="q-subtitle">Complétez le rapport en répondant à toutes les questions</p>

        {validated && (
          <div className={`q-score ${score === MAX_SCORE ? 'q-score--perfect' : ''}`}>
            {score} points
          </div>
        )}

        <div className="q-list">
          {SECTIONS.map((section, si) => (
            <div key={section.label}>
              <div className={`q-section-header q-section--${section.slug}`}>
                <span className="q-section-label">{section.label}</span>
              </div>

              {section.ids.map((id, qi) => {
                const q = QUESTIONS_BY_ID.get(id)!
                const globalIdx = SECTIONS.slice(0, si).reduce((s, sec) => s + sec.ids.length, 0) + qi + 1
                const answer = answers[q.id]
                const isCorrect = validated ? checkAnswer(q, answer ?? getDefaultValue(q)) : null
                const stat = stats?.[q.id]
                const pct = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null

                return (
                  <div
                    key={q.id}
                    className={`q-item ${validated ? (isCorrect ? 'q-item--correct' : 'q-item--wrong') : ''}`}
                  >
                    <div className="q-item-header">
                      <span className="q-item-number">{globalIdx}.</span>
                      <span className="q-item-text">{q.text}</span>
                      {validated && (
                        <span className={`q-item-icon ${isCorrect ? 'correct' : 'wrong'}`}>
                          {isCorrect ? '✓' : '✕'}
                        </span>
                      )}
                    </div>

                    <div className="q-item-input">
                      {q.type === 'time' && (
                        <input
                          type="time"
                          className="q-input q-input-time"
                          value={(answer as string) ?? ''}
                          onChange={e => updateAnswer(q.id, e.target.value)}
                          disabled={validated}
                        />
                      )}

                      {q.type === 'date' && (
                        <div className="q-date-inputs">
                          <input
                            type="text"
                            className="q-input q-input-date-part"
                            placeholder="JJ"
                            maxLength={2}
                            value={((answer as string) ?? '').split('/')[0] ?? ''}
                            onChange={e => {
                              const day = e.target.value.replace(/\D/g, '').slice(0, 2)
                              const month = ((answer as string) ?? '').split('/')[1] ?? ''
                              updateAnswer(q.id, `${day}/${month}`)
                            }}
                            disabled={validated}
                          />
                          <span className="q-date-sep">/</span>
                          <input
                            type="text"
                            className="q-input q-input-date-part"
                            placeholder="MM"
                            maxLength={2}
                            value={((answer as string) ?? '').split('/')[1] ?? ''}
                            onChange={e => {
                              const month = e.target.value.replace(/\D/g, '').slice(0, 2)
                              const day = ((answer as string) ?? '').split('/')[0] ?? ''
                              updateAnswer(q.id, `${day}/${month}`)
                            }}
                            disabled={validated}
                          />
                        </div>
                      )}

                      {q.type === 'number' && (
                        <input
                          type="number"
                          className="q-input q-input-number"
                          value={(answer as string) ?? ''}
                          onChange={e => updateAnswer(q.id, e.target.value)}
                          disabled={validated}
                        />
                      )}

                      {q.type === 'select' && (
                        <select
                          className="q-input q-select"
                          value={(answer as string) ?? ''}
                          onChange={e => updateAnswer(q.id, e.target.value)}
                          disabled={validated}
                        >
                          <option value="">-- Sélectionner --</option>
                          {q.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {q.type === 'text-multi' && (
                        <div className="q-multi-inputs">
                          {Array.from({ length: q.count }).map((_, i) => (
                            <input
                              key={i}
                              type="text"
                              className="q-input q-input-text"
                              placeholder={`Prénom ${i + 1}`}
                              value={((answer as string[]) ?? [])[i] ?? ''}
                              onChange={e => updateMultiAnswer(q.id, i, e.target.value)}
                              disabled={validated}
                            />
                          ))}
                        </div>
                      )}

                      {q.type === 'select-multi' && (
                        <div className="q-multi-inputs">
                          {Array.from({ length: q.count }).map((_, i) => (
                            <select
                              key={i}
                              className="q-input q-select"
                              value={((answer as string[]) ?? [])[i] ?? ''}
                              onChange={e => updateMultiAnswer(q.id, i, e.target.value)}
                              disabled={validated}
                            >
                              <option value="">-- Sélectionner --</option>
                              {q.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ))}
                        </div>
                      )}

                      {validated && pct !== null && (
                        <span className="q-item-pct">{pct}% des joueurs ont trouvé</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="q-actions">
          <button className="q-btn q-btn-reset" onClick={handleReset}>
            RÉINITIALISER
          </button>
          <button
            className="q-btn q-btn-validate"
            onClick={handleValidate}
            disabled={validated || submitting}
          >
            {submitting ? 'ENVOI...' : 'VALIDER LE RAPPORT'}
          </button>
        </div>
      </div>
    </div>
  )
}
