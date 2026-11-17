import { ROUTES } from '../app/routes'

/**
 * Copy and machine labels for the arcade cartridge.
 *
 * Kept apart from the engine and the cabinet so the game can be re-worded
 * without touching collision code, and so every string a player reads has one
 * home. Stage names travel through the snapshot; wall patterns feed the engine.
 */

export interface ArcadeControlRow {
  action: string
  keys: string
}

export interface ArcadeScoreRow {
  label: string
  value: string
}

export const ARCADE_COPY = {
  eyebrow: 'Cartridge 03 · Arcade',
  titleTop: 'NEON',
  titleBottom: 'BREAKER',
  marqueeTop: 'NEON',
  marqueeBottom: 'BREAKER',
  marqueeSub: 'BRICK BUSTER · MODEL NB-03',
  cabinetPlate: 'IHSNN AMUSEMENTS',
  cabinetModel: 'NB-03 · 1 PLAYER',
  bezelStatus: 'CRT · 60 HZ · LIVE',
  deckMove: 'MOVE',
  deckAction: 'ACTION',
  credit: 'CREDIT 01',
  hud: {
    score: 'SCORE',
    high: 'HI-SCORE',
    stage: 'STAGE',
    lives: 'LIVES',
    combo: 'COMBO',
  },
  menu: {
    kicker: '1 PLAYER · 3 LIVES',
    heading: 'READY, PLAYER ONE?',
    blurb: 'Clear every brick. Keep the ball alive. Beat the number at the top.',
    cta: 'INSERT COIN · START',
    hint: 'or press space',
  },
  readyHint: 'MOVE TO AIM · SPACE OR TAP TO LAUNCH',
  paused: {
    kicker: 'COIN-OP ETIQUETTE',
    heading: 'PAUSED',
    blurb: 'The cabinet is holding your place. No one is watching.',
    cta: 'RESUME',
    hint: 'P / ESC or the pause key',
  },
  levelClear: {
    kicker: 'WALL CLEARED',
    bonus: 'CLEAR BONUS',
  },
  nextStage: 'UP NEXT',
  gameOver: {
    kicker: 'CREDITS EXHAUSTED',
    heading: 'GAME OVER',
    blurb: 'The wall wins this round. The high score is patient.',
    cta: 'PLAY AGAIN',
    record: 'NEW HIGH SCORE',
    finalScore: 'FINAL SCORE',
  },
  controlsTitle: 'How to play',
  controlsLead: 'One paddle, one ball, a wall that deserves it.',
  scoringTitle: 'Scoring',
  notesTitle: 'Cabinet notes',
  notes: [
    'Every brick smashed in a single rally raises the combo, up to ×8. It resets the moment the ball touches your paddle.',
    'Silver bricks take two hits. Aim for the cracks.',
    'Wide paddle, slow ball and multiball drop from the wreckage. Catch them with the paddle.',
    'Capsules: W widens the paddle, S slows the ball, M splits it, + is an extra life.',
    'Your high score is kept in this browser. The cabinet remembers.',
  ],
  scoring: [
    { label: 'Brick', value: '10 × stage × combo' },
    { label: 'Chip a tough brick', value: '5 × combo' },
    { label: 'Stage clear', value: '+100 × stage' },
    { label: 'Every 3 stages', value: '1 extra life' },
  ] as ArcadeScoreRow[],
  controls: [
    { action: 'Move', keys: '← → / A D / drag' },
    { action: 'Launch', keys: 'SPACE / click' },
    { action: 'Pause', keys: 'P / ESC' },
    { action: 'Mute', keys: 'M' },
  ] as ArcadeControlRow[],
  soundOn: 'Sound on',
  soundOff: 'Sound muted',
  pauseAction: 'Pause',
  resumeAction: 'Resume',
  actionStart: 'START',
  actionLaunch: 'LAUNCH',
  actionResume: 'RESUME',
  actionWait: 'IN PLAY',
  flashingNote: 'Contains flashing neon and a little chiptune noise.',
  footer: 'A hand-built cabinet · canvas, WebAudio and no quarters',
  backToShelf: ROUTES.home,
} as const

/** Six hand-drawn walls, repeated forever with a faster ball. */
export const STAGE_NAMES: readonly string[] = [
  'FIRST CONTACT',
  'CHECKERBOARD',
  'THE ARCH',
  'HEARTBREAKER',
  'PILLARS',
  'FINAL WALL',
]

/**
 * Wall patterns, one string per row, eight columns.
 *   `#` brick   `=` tough brick   `.` empty
 */
export const STAGE_PATTERNS: readonly (readonly string[])[] = [
  [
    '########',
    '########',
    '########',
    '########',
    '########',
  ],
  [
    '########',
    '#.#.#.#.',
    '########',
    '.#.#.#.#',
    '########',
  ],
  [
    '########',
    '##....##',
    '#......#',
    '#......#',
    '##....##',
  ],
  [
    '.##..##.',
    '########',
    '########',
    '.######.',
    '..####..',
    '...##...',
  ],
  [
    '#.#..#.#',
    '#.#..#.#',
    '########',
    '#......#',
    '#.#..#.#',
  ],
  [
    '##=##=##',
    '########',
    '==....==',
    '########',
    '##=##=##',
    '########',
  ],
]
