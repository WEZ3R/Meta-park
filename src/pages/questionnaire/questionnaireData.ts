// ═══════════════════════════════════════════════════════════
// QUESTIONS DATA (shared between questionnaire1 and questionnaire2)
// ═══════════════════════════════════════════════════════════

export interface TimeQuestion {
  type: 'time'
  text: string
  answer: string
}

export interface TextMultiQuestion {
  type: 'text-multi'
  text: string
  count: number
  answers: string[]
}

export interface DateQuestion {
  type: 'date'
  text: string
  answer: string
}

export interface SelectQuestion {
  type: 'select'
  text: string
  options: string[]
  answer: string
}

export interface NumberQuestion {
  type: 'number'
  text: string
  answer: number
}

export interface SelectMultiQuestion {
  type: 'select-multi'
  text: string
  count: number
  options: string[]
  answers: string[]
}

export type Question = (TimeQuestion | TextMultiQuestion | DateQuestion | SelectQuestion | NumberQuestion | SelectMultiQuestion) & { id: number }

export const QUESTIONS: Question[] = [
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
    answer: '18:16',
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
    text: 'À quelle heure le dinosaure a-t-il été neutralisé ? (zone log)',
    answer: '18:29',
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

export const POINTS: Record<number, number> = {
  1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3,
  7: 5, 8: 5, 9: 5, 10: 5, 11: 5,
  12: 7, 13: 7, 14: 7,
  15: 10, 16: 10,
}

export const MAX_SCORE = QUESTIONS.reduce((sum, q) => sum + (POINTS[q.id] ?? 3), 0)

export const SECTIONS = [
  { label: 'FACILE', slug: 'facile', ids: [1, 2, 3, 4, 5, 6] },
  { label: 'MOYEN', slug: 'moyen', ids: [7, 8, 9, 10, 11] },
  { label: 'DIFFICILE', slug: 'difficile', ids: [12, 13, 14] },
  { label: 'EXTRÊME', slug: 'extreme', ids: [15, 16] },
]

export const QUESTIONS_BY_ID = new Map(QUESTIONS.map(q => [q.id, q]))

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function checkAnswer(q: Question, value: string | string[]): boolean {
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

export function getDefaultValue(q: Question): string | string[] {
  return q.type === 'text-multi' || q.type === 'select-multi' ? [] : ''
}
