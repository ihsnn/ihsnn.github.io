import type { SoundName } from '../audio'
import type { SportInput } from '../types'

export type SportStatus = 'playing' | 'won' | 'lost'

/**
 * One branch of the Pekan. A run is created per attempt, steps deterministically
 * from (input, seed) and draws itself at 320 × 240. The versus shell, the scroll
 * and the save live in `game.ts` — a sport only knows how to be played and how
 * to ask for a sound.
 */
export interface SportRun {
  status: SportStatus
  playerScore: number
  rivalScore: number
  step(dt: number, input: SportInput): void
  draw(ctx: CanvasRenderingContext2D, time: number): void
  /** Returns (and clears) one cue for this frame, if the branch wants one. */
  sound?: () => SoundName | null
}

export type SportFactory = (seed: number) => SportRun
