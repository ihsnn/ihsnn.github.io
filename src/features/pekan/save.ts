import {
  MAPS,
  START,
  TEAMS,
  type Dir,
  type MapId,
  type SportId,
  type TeamId,
} from '../../content/pekan/island'
import { SPORT_BY_ID } from '../../content/pekan/island'
import type { CompanionLook, PekanSave } from './types'

export const SAVE_KEY = 'ihsnn:pekan:save'
export const MUTED_KEY = 'ihsnn:pekan:muted'

const DIRECTIONS: readonly Dir[] = ['up', 'down', 'left', 'right']
const MAP_IDS: readonly MapId[] = ['kampung', 'sawah']

const DEFAULT_COMPANION: CompanionLook = {
  color: 2,
  ear: 1,
  acc: 0,
  name: 'BULU',
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

function readTeam(value: unknown): TeamId {
  return TEAMS.some((team) => team.id === value) ? (value as TeamId) : 'merah'
}

function readMap(value: unknown): MapId {
  return MAP_IDS.includes(value as MapId) ? (value as MapId) : START.map
}

function readCompanion(value: unknown): CompanionLook {
  if (!value || typeof value !== 'object') return { ...DEFAULT_COMPANION }
  const record = value as Record<string, unknown>
  const rawName = typeof record.name === 'string' ? record.name.trim() : ''
  return {
    color: clampInt(record.color, DEFAULT_COMPANION.color, 0, 7),
    ear: clampInt(record.ear, DEFAULT_COMPANION.ear, 0, 3),
    acc: clampInt(record.acc, DEFAULT_COMPANION.acc, 0, 3),
    name: rawName.slice(0, 10) || DEFAULT_COMPANION.name,
  }
}

function readScrolls(value: unknown): SportId[] {
  if (!Array.isArray(value)) return []
  const found = new Set<SportId>()
  for (const entry of value) {
    if (typeof entry === 'string' && SPORT_BY_ID.has(entry as SportId)) {
      found.add(entry as SportId)
    }
  }
  return [...found]
}

function readFlags(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== 'object') return {}
  const flags: Record<string, boolean> = {}
  for (const [key, flag] of Object.entries(value)) {
    if (flag === true) flags[key] = true
  }
  return flags
}

export function defaultSave(): PekanSave {
  return {
    version: 1,
    team: 'merah',
    companion: { ...DEFAULT_COMPANION },
    scrolls: [],
    coins: 0,
    map: START.map,
    x: START.x,
    y: START.y,
    dir: START.dir,
    flags: {},
    updatedAt: Date.now(),
  }
}

/**
 * Every field falls back on its own, so a save written by an older or partial
 * build still loads instead of throwing the run away.
 */
export function readSave(): PekanSave | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const record = parsed as Record<string, unknown>
    if (record.version !== 1) return null

    const fallback = defaultSave()
    const map = readMap(record.map)
    const def = MAPS[map]

    return {
      version: 1,
      team: readTeam(record.team),
      companion: readCompanion(record.companion),
      scrolls: readScrolls(record.scrolls),
      coins: clampInt(record.coins, 0, 0, 9999),
      map,
      x: clampInt(record.x, fallback.x, 0, def.width - 1),
      y: clampInt(record.y, fallback.y, 0, def.height - 1),
      dir: DIRECTIONS.includes(record.dir as Dir) ? (record.dir as Dir) : fallback.dir,
      flags: readFlags(record.flags),
      updatedAt:
        typeof record.updatedAt === 'number' ? record.updatedAt : Date.now(),
    }
  } catch {
    return null
  }
}

export function writeSave(save: PekanSave): void {
  try {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...save, updatedAt: Date.now() }),
    )
  } catch {
    /* private mode: the visit still works, it just forgets */
  }
}

export function clearSave(): void {
  try {
    window.localStorage.removeItem(SAVE_KEY)
  } catch {
    /* ignore */
  }
}

export function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTED_KEY) === '1'
  } catch {
    return false
  }
}

export function writeMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTED_KEY, muted ? '1' : '0')
  } catch {
    /* ignore */
  }
}
