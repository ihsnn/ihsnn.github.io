/**
 * Console input vocabulary: the eight things a Game Boy can be told to do,
 * how physical keys map onto them, and how they are labelled on screen.
 */

export const GAMEBOY_ACTIONS = [
  'up',
  'down',
  'left',
  'right',
  'a',
  'b',
  'start',
  'select',
] as const

export type GameboyAction = (typeof GAMEBOY_ACTIONS)[number]

/**
 * Keyboard mirror of the hardware. WASD/arrows drive the D-pad, J/K are
 * B/A (the classic emulator layout), and the `button-key-*` classes already
 * in `gameboy.css` hint at exactly these keys.
 */
export const KEY_BINDINGS: Readonly<Record<string, GameboyAction>> = {
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
  k: 'a',
  x: 'a',
  j: 'b',
  z: 'b',
  enter: 'start',
  m: 'start',
  shift: 'select',
  n: 'select',
}

/** Human-readable key hint per control, used in `aria-label`s and the legend. */
export const ACTION_KEY_HINTS: Record<GameboyAction, string> = {
  up: 'W',
  down: 'S',
  left: 'A',
  right: 'D',
  a: 'K',
  b: 'J',
  start: 'M',
  select: 'N',
}

export const CONTROL_LEGEND = 'WASD or arrows · J = B · K = A · M = start · N = select'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

/**
 * Translates a keydown into a console action, ignoring modifier combos,
 * auto-repeat and keystrokes aimed at a text field (the OCR correction input
 * lives in the same app).
 */
export function actionFromKeyboardEvent(event: KeyboardEvent): GameboyAction | null {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return null
  if (isTypingTarget(event.target)) return null
  return KEY_BINDINGS[event.key.toLowerCase()] ?? null
}
