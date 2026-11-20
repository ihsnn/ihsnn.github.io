import { MAX_TASKS, SAVE_VERSION, baseXp, normaliseText } from './quest'
import type { Task, TaskPriority, TodoSave } from './types'

/**
 * One list, one slot, one localStorage key.
 *
 * The save is plain JSON with per-field fallbacks: a partial write or a
 * hand-edited object should still load the tasks it can understand instead of
 * dumping the visitor back to the four examples.
 */

const SAVE_KEY = 'ihsnn:todo:save'
const MUTED_KEY = 'ihsnn:todo:muted'

const PRIORITY_IDS: readonly TaskPriority[] = ['ringan', 'biasa', 'penting']
const MAX_XP = 1_000_000
const MAX_TIME = 8_640_000_000_000_000

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const numberOr = (
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? clamp(value, min, max)
    : fallback

function readTask(
  value: unknown,
  index: number,
  now: number,
  usedIds: Set<string>,
): Task | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Record<string, unknown>

  const text = typeof data.text === 'string' ? normaliseText(data.text) : ''
  if (!text) return null

  const priority = PRIORITY_IDS.includes(data.priority as TaskPriority)
    ? (data.priority as TaskPriority)
    : 'biasa'

  let id =
    typeof data.id === 'string' && data.id.length > 0 && data.id.length <= 64
      ? data.id
      : `restored-${index}`
  if (usedIds.has(id)) id = `restored-${index}-${usedIds.size}`
  usedIds.add(id)

  const done = data.done === true
  const createdAt = numberOr(data.createdAt, now, 0, MAX_TIME)
  const doneAt = done ? numberOr(data.doneAt, now, 0, MAX_TIME) : null
  const awarded = numberOr(data.awarded, baseXp(priority), 0, 1_000)

  return {
    id,
    text,
    priority,
    done,
    createdAt,
    doneAt,
    awarded: done ? awarded : 0,
  }
}

export function readTodo(): TodoSave | null {
  try {
    const stored = window.localStorage.getItem(SAVE_KEY)
    if (!stored) return null

    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object') return null
    const data = parsed as Record<string, unknown>
    if (data.version !== SAVE_VERSION) return null

    const now = Date.now()
    const usedIds = new Set<string>()
    const tasks: Task[] = []

    if (Array.isArray(data.tasks)) {
      const source = data.tasks.slice(0, MAX_TASKS)
      for (let index = 0; index < source.length; index += 1) {
        const task = readTask(source[index], index, now, usedIds)
        if (task) tasks.push(task)
      }
    }

    return {
      version: SAVE_VERSION,
      tasks,
      xp: numberOr(data.xp, 0, 0, MAX_XP),
      streak: Math.round(numberOr(data.streak, 0, 0, 3_650)),
      lastDoneDay:
        typeof data.lastDoneDay === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(data.lastDoneDay)
          ? data.lastDoneDay
          : '',
    }
  } catch {
    return null
  }
}

export function writeTodo(save: TodoSave) {
  try {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...save, updatedAt: Date.now() }),
    )
  } catch {
    /* private mode: the list still lives for this visit */
  }
}

export function clearTodo() {
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
