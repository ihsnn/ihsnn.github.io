import { FIXED_CHARACTER } from '../../content/keluarga'
import type { Direction, PlayerPosition, StorySave } from './types'

const SAVE_KEY = 'ihsnn:keluarga:save'
const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right']

function isPlayer(value: unknown): value is PlayerPosition {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<PlayerPosition>
  return (
    typeof candidate.x === 'number' &&
    typeof candidate.y === 'number' &&
    typeof candidate.dir === 'string' &&
    DIRECTIONS.includes(candidate.dir as Direction)
  )
}

export function readSave(): StorySave | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StorySave>
    if (parsed.version !== 1) return null

    return {
      version: 1,
      character: FIXED_CHARACTER,
      examined: Array.isArray(parsed.examined)
        ? parsed.examined.filter((id): id is string => typeof id === 'string')
        : [],
      thought: typeof parsed.thought === 'string' ? parsed.thought : null,
      chapterComplete: parsed.chapterComplete === true,
      player: isPlayer(parsed.player) ? parsed.player : null,
      updatedAt:
        typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    }
  } catch {
    return null
  }
}

export function writeSave(save: StorySave) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  } catch {
    /* private mode: the story still runs for this visit */
  }
}

export function clearSave() {
  try {
    window.localStorage.removeItem(SAVE_KEY)
  } catch {
    /* ignore */
  }
}
