import { useState } from 'react'
import { ScreensaverVideo } from '../../components/ScreensaverVideo/ScreensaverVideo'
import { useApp } from '../../shared/context/AppContext'
import './LogsPage.css'

// ═══════════════════════════════════════════════════════════
// LOG DATA
// ═══════════════════════════════════════════════════════════

interface LogEntry {
  event: string
  date: string
  time: string
  author: string
}

const LOGS: LogEntry[] = [
  { event: 'INITIALISATION DU SYSTÈME T-73', date: '03/06/2025', time: '17:30', author: 'SYSTÈME' },
  { event: 'CHARGEMENT DES PROTOCOLES DE MAINTENANCE', date: '03/06/2025', time: '17:30', author: 'SYSTÈME' },
  { event: 'CONNEXION AU RÉSEAU LOCAL', date: '03/06/2025', time: '17:31', author: 'SYSTÈME' },
  { event: 'ANTENNE PRINCIPALE : STATUT DÉGRADÉ', date: '03/06/2025', time: '17:31', author: 'SYSTÈME' },
  { event: 'PASSAGE EN COMMUNICATION TEXTE UNIQUEMENT', date: '03/06/2025', time: '17:32', author: 'SYSTÈME' },
  { event: 'DIAGNOSTIC DES CAPTEURS PÉRIMÉTRIQUES', date: '03/06/2025', time: '17:32', author: 'SYSTÈME' },
  { event: 'SYNCHRONISATION DE L\'HORLOGE INTERNE TERMINÉE', date: '03/06/2025', time: '17:33', author: 'SYSTÈME' },
  { event: 'VÉRIFICATION DU RÉSEAU ÉLECTRIQUE : OK', date: '03/06/2025', time: '17:34', author: 'SYSTÈME' },

  { event: 'MISE À JOUR DU COMPTEUR VISITEURS : 20 910', date: '03/06/2025', time: '17:35', author: 'SYSTÈME' },
  { event: 'STATUT DU PARC : OUVERT AU PUBLIC', date: '03/06/2025', time: '17:35', author: 'SYSTÈME' },
  { event: 'ÉVÉNEMENT SPÉCIAL DÉTECTÉ : JOUR DE RÉOUVERTURE', date: '03/06/2025', time: '17:36', author: 'SYSTÈME' },
  { event: 'SCAN THERMIQUE DES ENCLOS : EN COURS', date: '03/06/2025', time: '17:37', author: 'SYSTÈME' },
  { event: 'TEMPÉRATURE ENCLOS T-90 : 28.4°C – NORMAL', date: '03/06/2025', time: '17:38', author: 'SYSTÈME' },
  { event: 'ACTIVITÉ BIOLOGIQUE SECTEUR T : DANS LES NORMES', date: '03/06/2025', time: '17:40', author: 'SYSTÈME' },
  { event: 'ROTATION DES ÉQUIPES DE SURVEILLANCE ENREGISTRÉE', date: '03/06/2025', time: '17:42', author: 'SYSTÈME' },
  { event: 'DIAGNOSTIC RÉSEAU INTERNE : 14 NŒUDS ACTIFS', date: '03/06/2025', time: '17:44', author: 'SYSTÈME' },
  { event: 'MISE À JOUR FIRMWARE CAPTEURS SECTEUR NORD', date: '03/06/2025', time: '17:46', author: 'SYSTÈME' },

  { event: 'VÉRIFICATION DES CAMÉRAS SECTEUR T', date: '03/06/2025', time: '17:48', author: 'SYSTÈME' },
  { event: 'CAMÉRA OUEST : SIGNAL INSTABLE', date: '03/06/2025', time: '17:49', author: 'SYSTÈME' },
  { event: 'TENTATIVE DE STABILISATION SIGNAL CAMÉRA OUEST', date: '03/06/2025', time: '17:49', author: 'SYSTÈME' },
  { event: 'ANOMALIE VISUELLE DÉTECTÉE SUR CLÔTURE T-90', date: '03/06/2025', time: '17:50', author: 'SYSTÈME' },
  { event: 'INTÉGRITÉ DE L\'ENCLOS T-90 : COMPROMISE', date: '03/06/2025', time: '17:50', author: 'SYSTÈME' },

  { event: 'ALERTE SÉCURITÉ : RISQUE DE RUPTURE', date: '03/06/2025', time: '17:51', author: 'SYSTÈME' },
  { event: 'PROTOCOLE DE SURVEILLANCE RENFORCÉ ACTIVÉ', date: '03/06/2025', time: '17:51', author: 'SYSTÈME' },
  { event: 'ENVOI RAPPORT SÉCURITÉ AU POSTE CENTRAL', date: '03/06/2025', time: '17:52', author: 'SYSTÈME' },
  { event: 'DÉPLOIEMENT DRONES DE SURVEILLANCE SECTEUR T', date: '03/06/2025', time: '17:55', author: 'SYSTÈME' },

  { event: 'MOUVEMENT INHABITUEL DÉTECTÉ – SECTEUR NORD', date: '03/06/2025', time: '18:05', author: 'SYSTÈME' },
  { event: 'OUVERTURE ENCLOS HERBIVORES', date: '03/06/2025', time: '18:09', author: 'SYSTÈME' },
  { event: 'ANALYSE SONORE : FRÉQUENCES BASSES ANORMALES', date: '03/06/2025', time: '18:10', author: 'SYSTÈME' },
  { event: 'OUVERTURE ENCLOS SOIGNEURS', date: '03/06/2025', time: '18:14', author: 'SYSTÈME' },
  { event: 'TENTATIVE DE CONTACT RADIO EXTÉRIEUR : ÉCHEC', date: '03/06/2025', time: '18:15', author: 'SYSTÈME' },
  { event: 'ERREUR CRITIQUE : PERTE DU RÉSEAU', date: '03/06/2025', time: '18:16', author: 'SYSTÈME' },
  { event: 'PERTE SIGNAL NURSERIE', date: '03/06/2025', time: '18:16', author: 'SYSTÈME' },
  { event: 'OUVERTURE ENCLOS CARNIVORES', date: '03/06/2025', time: '18:19', author: 'SYSTÈME' },

  { event: 'SUIVI DES CONSTANTES VITALES – JULIA', date: '03/06/2025', time: '18:20', author: 'SYSTÈME' },
  { event: 'CHUTE BRUTALE DU RYTHME CARDIAQUE – JULIA', date: '03/06/2025', time: '18:21', author: 'SYSTÈME' },
  { event: 'STATUT VITAL MODIFIÉ : DÉCÈS CONFIRMÉ – JULIA', date: '03/06/2025', time: '18:21', author: 'SYSTÈME' },

  { event: 'TOUTES LES COMMUNICATIONS EXTERNES COUPÉES', date: '03/06/2025', time: '18:22', author: 'SYSTÈME' },
  { event: 'BASCULE AUTOMATIQUE EN MODE ISOLÉ', date: '03/06/2025', time: '18:23', author: 'SYSTÈME' },

  { event: 'RUPTURE DE CONFINEMENT CONFIRMÉE', date: '03/06/2025', time: '18:24', author: 'SYSTÈME' },
  { event: 'LOCALISATION INITIALE : SECTEUR NORD', date: '03/06/2025', time: '18:25', author: 'SYSTÈME' },

  { event: 'ACTIVATION DU PROTOCOLE D\'URGENCE AMBRE-LOCK', date: '03/06/2025', time: '18:26', author: 'SYSTÈME' },
  { event: 'LIMITATION DES ACCÈS SYSTÈME', date: '03/06/2025', time: '18:26', author: 'SYSTÈME' },
  { event: 'VERROUILLAGE AUTOMATIQUE DES PORTES SECTEUR EST', date: '03/06/2025', time: '18:27', author: 'SYSTÈME' },
  { event: 'SUJET HOSTILE : STATUT MODIFIÉ', date: '03/06/2025', time: '18:27', author: 'SYSTÈME' },
  { event: 'ÉTAT DU SUJET : NEUTRALISÉ', date: '03/06/2025', time: '18:29', author: 'SYSTÈME' },
  { event: 'ACTIVATION DES SIRÈNES D\'ÉVACUATION', date: '03/06/2025', time: '18:30', author: 'SYSTÈME' },
  { event: 'COUPURE ALIMENTATION SECTEUR SUD', date: '03/06/2025', time: '18:45', author: 'SYSTÈME' },
  { event: 'TENTATIVE DE REBOOT DU SERVEUR PRINCIPAL', date: '03/06/2025', time: '18:55', author: 'SYSTÈME' },

  { event: 'RESTAURATION PARTIELLE DU WIFI LOCAL', date: '03/06/2025', time: '19:04', author: 'SYSTÈME' },
  { event: 'REPRISE DES FLUX DE DONNÉES INTERNES', date: '03/06/2025', time: '19:05', author: 'SYSTÈME' },
  { event: 'SCAN DES ZONES SÉCURISÉES EN COURS', date: '03/06/2025', time: '19:10', author: 'SYSTÈME' },

  { event: 'ARCHIVAGE DES LOGS D\'INCIDENT', date: '03/06/2025', time: '19:29', author: 'SYSTÈME' },
  { event: 'DOSSIER MARQUÉ POUR AUDIT INTERNE', date: '03/06/2025', time: '19:29', author: 'SYSTÈME' },
]

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function LogsPage() {
  const { status } = useApp()
  const phase = status?.phase ?? 0
  const isShutdown = status?.isShutdown ?? false

  const [search, setSearch] = useState('')

  // ── Guards ──────────────────────────────────────────────

  if (phase === 1 || isShutdown) {
    return <ScreensaverVideo videoSrc="/videos/ERRORSIGNAL.mp4" />
  }

  // ── Filter ─────────────────────────────────────────────

  const query = search.toLowerCase()
  const filtered = query
    ? LOGS.filter(l =>
        l.event.toLowerCase().includes(query) ||
        l.date.includes(query) ||
        l.time.includes(query) ||
        l.author.toLowerCase().includes(query)
      )
    : LOGS

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="logs-page">
      <div className="logs-container">
        {/* Header */}
        <div className="logs-header">
          <div className="logs-header-left">
            <span className="logs-prompt">&gt;_</span>
            <h1 className="logs-title">JOURNAL SYSTÈME T-73</h1>
          </div>
          <div className="logs-header-right">
            <span className="logs-count">{filtered.length}/{LOGS.length} ENTRÉES</span>
          </div>
        </div>

        {/* Search */}
        <div className="logs-search-bar">
          <span className="logs-search-icon">&#9906;</span>
          <input
            type="text"
            className="logs-search-input"
            placeholder="Rechercher dans les logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="logs-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Table */}
        <div className="logs-table-wrap">
          <table className="logs-table">
            <thead>
              <tr>
                <th className="logs-th logs-th-idx">#</th>
                <th className="logs-th logs-th-event">ÉVÉNEMENT</th>
                <th className="logs-th logs-th-date">DATE</th>
                <th className="logs-th logs-th-time">HEURE</th>
                <th className="logs-th logs-th-author">AUTEUR</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const isAlert = log.event.includes('ALERTE') || log.event.includes('ERREUR CRITIQUE') || log.event.includes('RUPTURE')
                const isDeath = log.event.includes('DÉCÈS')
                const isNeutralized = log.event.includes('NEUTRALISÉ')
                const rowClass = isDeath ? 'logs-row--death'
                  : isAlert ? 'logs-row--alert'
                  : isNeutralized ? 'logs-row--success'
                  : ''
                return (
                  <tr key={i} className={`logs-row ${rowClass}`}>
                    <td className="logs-td logs-td-idx">{String(i + 1).padStart(3, '0')}</td>
                    <td className="logs-td logs-td-event">{log.event}</td>
                    <td className="logs-td logs-td-date">{log.date}</td>
                    <td className="logs-td logs-td-time">{log.time}</td>
                    <td className="logs-td logs-td-author">{log.author}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="logs-empty">AUCUN RÉSULTAT POUR « {search} »</div>
          )}
        </div>

        {/* Footer */}
        <div className="logs-footer">
          <span>FIN DU JOURNAL — ARCHIVÉ LE 03/06/2025 À 19:29</span>
        </div>
      </div>
    </div>
  )
}
