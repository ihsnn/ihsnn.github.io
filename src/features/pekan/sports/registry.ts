import type { SportId } from '../../../content/pekan/island'
import { createArchery } from './archery'
import type { SportFactory, SportRun } from './types'

/**
 * The only place a branch id becomes playable code. Adding a branch is one
 * factory here plus one entry in `content/pekan/island.ts`.
 */
const FACTORIES: Partial<Record<SportId, SportFactory>> = {
  panahan: createArchery,
}

export function isSportPlayable(id: SportId): boolean {
  return Boolean(FACTORIES[id])
}

export function createSport(id: SportId, seed: number): SportRun | null {
  const factory = FACTORIES[id]
  return factory ? factory(seed) : null
}

export function playableSports(): SportId[] {
  return Object.keys(FACTORIES) as SportId[]
}
