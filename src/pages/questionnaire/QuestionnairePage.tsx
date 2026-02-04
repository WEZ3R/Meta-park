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
  {
    id: 1,
    type: 'time',
    text: "À quelle heure le centre de controle a-t-il été initialisé le jour de l'incident ?",
    answer: '17:30',
  },
  {
    id: 2,
    type: 'text-multi',
    text: "De qui était constituée l'équipe terrain ?",
    count: 3,
    answers: ['julia', 'fabio', 'rico'],
  },
  {
    id: 3,
    type: 'date',
    text: 'Quel jour a eu lieu l\'incident?',
    answer: '03/06',
  },
  {
    id: 4,
    type: 'select',
    text: 'Quel est le signe astrologique de Rico ?',
    options: [
      'Bélier', 'Taureau', 'Gémeaux', 'Cancer',
      'Lion', 'Vierge', 'Balance', 'Scorpion',
      'Sagittaire', 'Capricorne', 'Verseau', 'Poissons',
    ],
    answer: 'Lion',
  },
  {
    id: 5,
    type: 'select',
    text: "Quel est l'événement spécial du jour de l'incident ?",
    options: [
      'Présentation du T-REX au grand public',
      "Réouverture de l'aile nord après des travaux de 6 mois",
      "Réouverture après une semaine à cause d'un ouragan",
      'Inauguration du parc',
      "Réouverture du parc après une semaine de fermeture due à l'ouragan",
    ],
    answer: "Réouverture du parc après une semaine de fermeture due à l'ouragan",
  },
  {
    id: 6,
    type: 'select-multi',
    text: 'Quelles caméras ont détecté une anomalie avant la coupure réseau ?',
    count: 2,
    options: [
      'Caméra 1', 'Caméra 2', 'Caméra 3', 'Caméra 4', 'Caméra 5',
      'Caméra 6', 'Caméra 7', 'Caméra 8', 'Caméra 9', 'Caméra 10',
    ],
    answers: ['Caméra 4', 'Caméra 8'],
  },
  {
    id: 7,
    type: 'number',
    text: "Combien d'œufs ont éclos ?",
    answer: 5,
  },
  {
    id: 8,
    type: 'select',
    text: 'Quel dinosaure s\'est échappé ?',
    options: [
      'T-Rex', 'Vélociraptor', 'Brachiosaure', 'Ptéranodon',
      'Stégosaure', 'Spinosaure', 'Dilophosaure', 'Ankylosaure',
    ],
    answer: 'T-Rex',
  },
  {
    id: 9,
    type: 'select',
    text: "À quelle référence cinématographique fait référence le code d’accès du centre de contrôle ?",
    options: [
      "Date de naissance d'un agent de maintenance",
      'Nombre de dinosaures dans le parc',
      'La date de sortie du premier Jurassic Park',
      'Date de clonage du premier dinosaure du parc',
    ],
    answer: 'La date de sortie du premier Jurassic Park',
  },
  {
    id: 10,
    type: 'select',
    text: "Dans quel secteur le sujet est partis ?",
    options: ['Zone nord', 'Zone sud', 'Zone est', 'Zone ouest'],
    answer: 'Zone nord',
  },
  {
    id: 11,
    type: 'select',
    text: "Comment l'enclos a été endommagé ?",
    options: [
      "Ouragan qui a fragilisé l'enclos",
      "Tremblement de terre",
      "Inondation",
      "Foudre",
      "Éruption volcanique",
      "Glissement de terrain",
    ],
    answer: "Ouragan qui a fragilisé l'enclos",
  },
  {
    id: 12,
    type: 'number',
    text: "Combien de minutes se sont écoulées entre la détection de l'anomalie et la perte totale du signal réseau ?",
    answer: 41,
  },
  {
    id: 13,
    type: 'time',
    text: 'À quelle heure est morte Julia ?',
    answer: '18:21',
  },
  {
    id: 14,
    type: 'time',
    text: 'À quelle heure la coupure réseau a-t-elle eu lieu ?',
    answer: '18:22',
  },
  {
    id: 15,
    type: 'select',
    text: 'Quelle est la cause de la coupure réseau ?',
    options: [
      'Percussion de la tour réseau par le T-Rex',
      'Percussion de la tour réseau par un véhicule',
      'Tempête',
      'Tremblement de terre',
    ],
    answer: 'Percussion de la tour réseau par le T-Rex',
  },
  {
    id: 16,
    type: 'select',
    text: 'Quel enclos a été ouvert pour ralentir le sujet lors de la poursuite ?',
    options: [
      'Raptors', 'T-Rex', 'Ptéranodons', 'Brachiosaures',
      'Dilophosaures', 'Stégosaures',
    ],
    answer: 'Raptors',
  },
  {
    id: 17,
    type: 'select',
    text: "Quel dinosaure a été classifié comme carnivore alors qu'il est herbivore ?",
    options: [
      'Triceratops', 'Brachiosaure', 'Stégosaure',
      'Parasaurolophus', 'Ankylosaure', 'Pachycéphalosaure',
    ],
    answer: 'Triceratops',
  },
  {
    id: 18,
    type: 'number',
    text: 'Nombre de victimes au total lors de l\'incident ?',
    answer: 8136,
  },
  {
    id: 19,
    type: 'time',
    text: 'À quelle heure le sujet a-t-il été neutralisé ?',
    answer: '19:27',
  },
  {
    id: 20,
    type: 'select',
    text: 'Quelle est la molécule qui a été choisie pour créer le gaz qui a neutralisé le dinosaure ?',
    options: [
      'Éthanol', 'Oméga-Soufre', 'Krypton', 'Séquenceur-Z',
      'Xénotrium', 'Cryo-Génon', 'Lithium', 'Quartz-Liquide',
      'Nitro-Phosphore', 'Gaz-Somnus', 'Acide-Borique', 'Sério-Végétal',
    ],
    answer: 'Gaz-Somnus',
  },
  {
    id: 21,
    type: 'select',
    text: 'Dans quelle serre Fabio envoie-t-il le sujet ?',
    options: ['S-01', 'S-03', 'N-05', 'D-02', 'W-04'],
    answer: 'S-03',
  },
  {
    id: 22,
    type: 'select',
    text: 'Est ce que fabio à tiré sur le sujet ?',
    options: [
      'Fabio à manqué la cible',
      'Fabio à tiré mais il a raté',
      'Fabio n/a pas tiré sur le sujet',
      'Fabio à tiré et à touché le sujet',
    ],
    answer: 'Fabio à tiré et à touché le sujet',
  },
  {
    id: 23,
    type: 'select',
    text: "Qu'est-ce qui arrive à Fabio après les évènements ?",
    options: [
      'Il décède sur place',
      'Il est à l\'hopital',
      'Il est transféré dans un autre parc',
      'Il démissionne après l\'incident',
    ],
    answer: 'Il est à l\'hopital',
  },
]

// ═══════════════════════════════════════════════════════════
// SCORING
// ═══════════════════════════════════════════════════════════

const POINTS: Record<number, number> = {
  1: 3, 2: 3, 3: 3, 6: 3, 7: 3, 8: 3, 10: 3, 11: 3, 14: 3, 18: 3, 22: 3,
  5: 5, 13: 5, 16: 5, 19: 5,
  4: 7, 9: 7, 15: 7, 21: 7,
  12: 10, 17: 10, 20: 10, 23: 10,
}

const MAX_SCORE = QUESTIONS.reduce((sum, q) => sum + (POINTS[q.id] ?? 3), 0)

const SECTIONS = [
  { label: 'FACILE', slug: 'facile', ids: [1, 2, 3, 6, 7, 8, 10, 11, 14, 18, 22] },
  { label: 'MOYEN', slug: 'moyen', ids: [5, 13, 16, 19] },
  { label: 'DIFFICILE', slug: 'difficile', ids: [4, 9, 15, 21] },
  { label: 'TRÈS DIFFICILE', slug: 'tres-difficile', ids: [12, 17, 20, 23] },
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
    try {
      const res = await api.submitQuestionnaire(results)
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

  return (
    <div className="questionnaire-page">
      <div className="q-container">
        <h1 className="q-title">RAPPORT D'INCIDENT</h1>
        <p className="q-subtitle">Complétez le rapport en répondant à toutes les questions</p>

        {validated && (
          <div className={`q-score ${score === MAX_SCORE ? 'q-score--perfect' : ''}`}>
            {score} / {MAX_SCORE} points
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
