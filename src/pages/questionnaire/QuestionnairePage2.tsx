import { useState, useEffect, useRef, useCallback } from 'react'
import { ScreensaverVideo } from '../../components/ScreensaverVideo/ScreensaverVideo'
import { useApp } from '../../shared/context/AppContext'
import { api } from '../../shared/api/client'
import { QUESTIONS, POINTS, MAX_SCORE, SECTIONS, QUESTIONS_BY_ID, checkAnswer, getDefaultValue } from './questionnaireData'
import './QuestionnairePage.css'

type Stats = Record<number, { total: number; correct: number }>

export function QuestionnairePage2() {
  const { status } = useApp()
  const phase = status?.phase ?? 0
  const isShutdown = status?.isShutdown ?? false

  const [teamName, setTeamName] = useState('')
  const [teamNameConfirmed, setTeamNameConfirmed] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [validated, setValidated] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [sessionScore, setSessionScore] = useState<number | null>(null)
  const lastSyncRef = useRef<Record<number, number>>({})

  // Once team name confirmed, send it to server
  useEffect(() => {
    if (teamNameConfirmed && teamName.trim()) {
      api.setSessionTeam(teamName.trim()).catch(() => {})
    }
  }, [teamNameConfirmed, teamName])

  // Poll session for sync
  useEffect(() => {
    if (!teamNameConfirmed) return

    const poll = async () => {
      try {
        const session = await api.getSession()
        if (session.started) setSessionStarted(true)
        if (session.validated) {
          setValidated(true)
          setSessionScore(session.score)
          if (session.stats) setStats(session.stats)
        }
        // Merge server answers
        const now = Date.now()
        setAnswers(prev => {
          const merged = { ...prev }
          for (const [idStr, value] of Object.entries(session.answers)) {
            const id = Number(idStr)
            const lastLocal = lastSyncRef.current[id] ?? 0
            if (now - lastLocal > 1500) {
              merged[id] = value
            }
          }
          return merged
        })
      } catch { /* ignore */ }
    }
    poll()
    const id = setInterval(poll, 800)
    return () => clearInterval(id)
  }, [teamNameConfirmed])

  const updateAnswer = useCallback((id: number, value: string | string[]) => {
    lastSyncRef.current[id] = Date.now()
    setAnswers(prev => ({ ...prev, [id]: value }))
    api.setSessionAnswer(id, value).catch(() => {})
  }, [])

  const updateMultiAnswer = useCallback((id: number, index: number, value: string) => {
    lastSyncRef.current[id] = Date.now()
    setAnswers(prev => {
      const current = (prev[id] as string[]) || []
      const next = [...current]
      next[index] = value
      api.setSessionAnswer(id, next).catch(() => {})
      return { ...prev, [id]: next }
    })
  }, [])

  const score = validated
    ? (sessionScore ?? QUESTIONS.reduce((sum, q) => {
        const correct = checkAnswer(q, answers[q.id] ?? getDefaultValue(q))
        return sum + (correct ? (POINTS[q.id] ?? 3) : 0)
      }, 0))
    : 0

  // ── Guards ──────────────────────────────────────────────

  if (phase === 1 || isShutdown) {
    return <ScreensaverVideo videoSrc="/videos/ERRORSIGNAL.mp4" />
  }

  // ── Team name popup ──────────────────────────────────────

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

  // ── Waiting for questionnaire1 to start ──────────────────

  if (!sessionStarted) {
    return (
      <div className="questionnaire-page">
        <div className="q-team-overlay">
          <div className="q-team-popup">
            <h2 className="q-team-title">EN ATTENTE</h2>
            <p className="q-team-wait">Le questionnaire va bientôt commencer...</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Render questions (no validate button) ─────────────────

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
      </div>
    </div>
  )
}
