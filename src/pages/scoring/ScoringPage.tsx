import { useState, useEffect } from 'react'
import { api } from '../../shared/api/client'
import './ScoringPage.css'

type ScoreEntry = { teamName: string; score: number; timestamp: number }

export function ScoringPage() {
  const [scores, setScores] = useState<ScoreEntry[]>([])

  useEffect(() => {
    const fetch = () => api.getScores().then(r => setScores(r.scores)).catch(() => {})
    fetch()
    const id = setInterval(fetch, 3000)
    return () => clearInterval(id)
  }, [])

  // Sort by score descending, then by timestamp ascending (earlier = higher rank)
  const sorted = [...scores].sort((a, b) => b.score - a.score || a.timestamp - b.timestamp)
  const top10 = sorted.slice(0, 10)

  // Last submitted entry
  const lastEntry = scores.length > 0 ? scores[scores.length - 1] : null
  const lastIsInTop10 = lastEntry && top10.some(e => e.timestamp === lastEntry.timestamp)

  return (
    <div className="scoring-page">
      <div className="scoring-header">
        <h1 className="scoring-title">CLASSEMENT</h1>
        <img src="/images/Jurassic_Park_logo.svg" alt="Jurassic Park" className="scoring-logo" />
      </div>

      <div className="scoring-table-wrapper">
        <table className="scoring-table">
          <thead>
            <tr>
              <th className="scoring-th scoring-th-rank">#</th>
              <th className="scoring-th scoring-th-team">ENQUÊTEURS</th>
              <th className="scoring-th scoring-th-score">SCORE</th>
            </tr>
          </thead>
          <tbody>
            {top10.map((entry, i) => (
              <tr key={entry.timestamp} className={`scoring-row ${lastEntry && entry.timestamp === lastEntry.timestamp ? 'scoring-row--last' : ''}`}>
                <td className="scoring-td scoring-td-rank">{i + 1}</td>
                <td className="scoring-td scoring-td-team">{entry.teamName}</td>
                <td className="scoring-td scoring-td-score">{entry.score}</td>
              </tr>
            ))}
            {top10.length === 0 && (
              <tr>
                <td className="scoring-td scoring-empty" colSpan={3}>Aucun score enregistré</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {lastEntry && !lastIsInTop10 && (
        <div className="scoring-last">
          <div className="scoring-last-label">DERNIER PASSAGE</div>
          <div className="scoring-last-entry">
            <span className="scoring-last-team">{lastEntry.teamName}</span>
            <span className="scoring-last-score">{lastEntry.score}</span>
          </div>
        </div>
      )}
    </div>
  )
}
