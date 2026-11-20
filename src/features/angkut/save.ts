import { LEVELS } from '../../content/angkut'
import type { LevelId, LevelRecord, Progress, Upgrades } from './types'

/**
 * One save slot for ANGKUT: coins, garage steps and the best run per route.
 *
 * Everything is validated on load and clamped per field, so a hand-edited or
 * half-written localStorage entry can never inject a negative balance or a
 * garage level that does not exist.
 */

const SAVE_KEY = 'ihsnn:angkut:progress'
const MUTED_KEY = 'ihsnn:angkut:muted'
const VERSION = 1
const MAX_UPGRADE = 3

function clampInt(value: unknown, min: number, max: number): number {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return min
  return Math.min(max, Math.max(min, Math.round(number)))
}

function readUpgrade(value: unknown): number {
  return clampInt(value, 0, MAX_UPGRADE)
}

function readRecord(value: unknown): LevelRecord | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Partial<LevelRecord>
  return {
    bestM: clampInt(record.bestM, 0, 100_000),
    bestCoins: clampInt(record.bestCoins, 0, 1_000_000),
    cleared: record.cleared === true,
  }
}

export function emptyProgress(): Progress {
  return {
    coins: 0,
    upgrades: { engine: 0, tires: 0, tank: 0 },
    levels: {},
  }
}

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as {
      version?: number
      coins?: number
      upgrades?: Partial<Upgrades>
      levels?: Record<string, unknown>
    }
    if (!parsed || parsed.version !== VERSION) return emptyProgress()

    const levels: Progress['levels'] = {}
    for (const level of LEVELS) {
      const record = readRecord(parsed.levels?.[level.id])
      if (record) levels[level.id] = record
    }

    return {
      coins: clampInt(parsed.coins, 0, 10_000_000),
      upgrades: {
        engine: readUpgrade(parsed.upgrades?.engine),
        tires: readUpgrade(parsed.upgrades?.tires),
        tank: readUpgrade(parsed.upgrades?.tank),
      },
      levels,
    }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: Progress) {
  try {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: VERSION, ...progress }),
    )
  } catch {
    /* private mode: the run still counts until the tab closes */
  }
}

export function loadMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTED_KEY) === '1'
  } catch {
    return false
  }
}

export function saveMuted(muted: boolean) {
  try {
    window.localStorage.setItem(MUTED_KEY, muted ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function recordOf(
  progress: Progress,
  id: LevelId,
): LevelRecord | undefined {
  return progress.levels[id]
}

/** A route opens once the one before it has been finished. */
export function isUnlocked(progress: Progress, id: LevelId): boolean {
  const index = LEVELS.findIndex((level) => level.id === id)
  if (index <= 0) return true
  const previous = LEVELS[index - 1]
  return progress.levels[previous.id]?.cleared === true
}

/** The furthest route the player can pick right now. */
export function furthestUnlocked(progress: Progress): LevelId {
  let current: LevelId = LEVELS[0].id
  for (const level of LEVELS) {
    if (isUnlocked(progress, level.id)) current = level.id
  }
  return current
}
