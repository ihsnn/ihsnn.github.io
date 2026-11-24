import type { Dir } from '../../content/pekan/island'

/** Keyboard only. Touch buttons feed the same tracker through `press`. */

const DIR_KEYS: Record<string, Dir> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
}

const A_KEYS = new Set(['KeyZ', 'Enter', 'NumpadEnter', 'Space'])
const B_KEYS = new Set(['KeyX', 'Escape', 'Backspace'])

export function dirForKey(code: string): Dir | null {
  return DIR_KEYS[code] ?? null
}

export function isAKey(code: string): boolean {
  return A_KEYS.has(code)
}

export function isBKey(code: string): boolean {
  return B_KEYS.has(code)
}

/** Keys the game owns; the page should not scroll or submit on them. */
export function shouldPreventDefault(code: string): boolean {
  return (
    code.startsWith('Arrow') ||
    code === 'Space' ||
    code === 'Backspace' ||
    code === 'KeyW' ||
    code === 'KeyA' ||
    code === 'KeyS' ||
    code === 'KeyD'
  )
}

/** A minimal held-key tracker shared by the keyboard and the touch pad. */
export class KeyTracker {
  private readonly held = new Set<string>()

  press(code: string): void {
    this.held.add(code)
  }

  release(code: string): void {
    this.held.delete(code)
  }

  clear(): void {
    this.held.clear()
  }

  has(code: string): boolean {
    return this.held.has(code)
  }

  any(codes: readonly string[]): boolean {
    return codes.some((code) => this.held.has(code))
  }
}
