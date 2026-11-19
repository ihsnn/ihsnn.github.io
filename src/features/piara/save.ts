import type { PetState, StageId } from './types'

/**
 * One pet, one slot, one localStorage key. The save is deliberately a plain
 * JSON object: a version guard plus per-field fallbacks means a partial write
 * or an old shape still loads instead of hatching a second pet.
 */

const SAVE_KEY = 'ihsnn:piara:save'
const MUTED_KEY = 'ihsnn:piara:muted'

const STAGES: StageId[] = ['telur', 'bayi', 'anak', 'remaja', 'dewasa']

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const numberOr = (
  value: unknown,
  fallback: number,
  min = 0,
  max = 100,
): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? clamp(value, min, max)
    : fallback

const timeOr = (value: unknown, fallback: number | null): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback

export function readPet(): PetState | null {
  try {
    const stored = window.localStorage.getItem(SAVE_KEY)
    if (!stored) return null

    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object') return null
    const data = parsed as Record<string, unknown>

    if (data.version !== 1) return null
    if (
      typeof data.stage !== 'string' ||
      !STAGES.includes(data.stage as StageId)
    ) {
      return null
    }

    const now = Date.now()
    return {
      version: 1,
      name: typeof data.name === 'string' ? data.name.slice(0, 12) : '',
      stage: data.stage as StageId,
      taps: numberOr(data.taps, 0, 0, 5),
      bornAt: timeOr(data.bornAt, null),
      ageMs: numberOr(data.ageMs, 0, 0, 365 * 24 * 3_600_000),
      food: numberOr(data.food, 70),
      joy: numberOr(data.joy, 70),
      rest: numberOr(data.rest, 70),
      care: numberOr(data.care, 60),
      mess: numberOr(data.mess, 0, 0, 3),
      lastMessAt: timeOr(data.lastMessAt, now) ?? now,
      asleep: data.asleep === true,
      sleepStartedAt: timeOr(data.sleepStartedAt, null),
      lastTick: timeOr(data.lastTick, now) ?? now,
      updatedAt: timeOr(data.updatedAt, now) ?? now,
    }
  } catch {
    return null
  }
}

export function writePet(pet: PetState) {
  try {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...pet, updatedAt: Date.now() }),
    )
  } catch {
    /* private mode: the pet still lives for this visit */
  }
}

export function clearPet() {
  try {
    window.localStorage.removeItem(SAVE_KEY)
  } catch {
    /* ignore */
  }
}

export function readMutedFlag(): boolean {
  try {
    return window.localStorage.getItem(MUTED_KEY) === '1'
  } catch {
    return false
  }
}

export function writeMutedFlag(muted: boolean) {
  try {
    window.localStorage.setItem(MUTED_KEY, muted ? '1' : '0')
  } catch {
    /* ignore */
  }
}
