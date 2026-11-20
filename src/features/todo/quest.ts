import {
  LEVEL_TITLES,
  PRIORITIES,
  PRIORITY_ORDER,
  SEED_TASKS,
} from '../../content/todo'
import type { Task, TaskPriority, TodoFilter, TodoSave } from './types'

/**
 * The rulebook: task hygiene, XP, levels, streaks, combo and ordering.
 *
 * No React, no DOM, no localStorage — `useTodo` owns the browser seam, so the
 * numbers here can be reasoned about (and later tested) on their own.
 */

export const SAVE_VERSION = 1

/** Hard list cap. It shows in the hero copy, so keep them in sync. */
export const MAX_TASKS = 60
/** Longest task text the LCD can hold without turning into a wall. */
export const MAX_TEXT = 90

/** Tasks per day that count as the daily mission. */
export const MISSION_TARGET = 3

/** Completions closer together than this feed the combo counter. */
export const COMBO_WINDOW_MS = 7_000
/** XP per extra step of combo, and how many steps pay out. */
export const COMBO_BONUS = 5
export const COMBO_MAX = 3

/** XP needed to walk from `level` to the next one. */
export function levelNeed(level: number): number {
  return 100 + (level - 1) * 60
}

export interface LevelInfo {
  level: number
  title: string
  /** XP banked inside the current level. */
  into: number
  /** XP the current level needs in total. */
  need: number
  /** 0–1, for the segmented bar. */
  progress: number
  total: number
}

export function levelInfo(xp: number): LevelInfo {
  let level = 1
  let remaining = Math.max(0, Math.floor(xp))

  // 99 exists only as a guard against a hand-edited save; the curve tops out
  // long before it, and LEGENDA stays the title past the last name.
  while (level < 99) {
    const need = levelNeed(level)
    if (remaining < need) break
    remaining -= need
    level += 1
  }

  const need = levelNeed(level)
  return {
    level,
    title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1] ?? 'LEGENDA',
    into: remaining,
    need,
    progress: Math.min(1, remaining / need),
    total: Math.max(0, Math.floor(xp)),
  }
}

const pad = (value: number) => String(value).padStart(2, '0')

/** Local calendar day, not UTC: a streak follows the device clock. */
export function dayKey(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function previousDayKey(timestamp: number): string {
  const date = new Date(timestamp)
  const previous = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - 1,
  )
  return dayKey(previous.getTime())
}

/**
 * A completion either keeps the streak (same day), extends it (yesterday), or
 * starts a new one. Un-ticking a task never takes a streak away.
 */
export function advanceStreak(
  lastDoneDay: string,
  streak: number,
  now: number,
): number {
  const today = dayKey(now)
  if (lastDoneDay === today) return streak
  if (lastDoneDay === previousDayKey(now)) return streak + 1
  return 1
}

/**
 * The streak as it should be displayed right now. A stored streak whose last
 * completion is older than yesterday is already broken: it reads as zero
 * until the next task is ticked, which is when `advanceStreak` restarts it.
 */
export function liveStreak(
  lastDoneDay: string,
  streak: number,
  now: number,
): number {
  if (streak <= 0) return 0
  const today = dayKey(now)
  if (lastDoneDay === today || lastDoneDay === previousDayKey(now)) return streak
  return 0
}

export function doneToday(tasks: readonly Task[], now: number): number {
  const today = dayKey(now)
  return tasks.filter(
    (task) => task.done && task.doneAt !== null && dayKey(task.doneAt) === today,
  ).length
}

export interface TaskCounts {
  open: number
  done: number
  today: number
}

export function counts(tasks: readonly Task[], now: number): TaskCounts {
  const done = tasks.reduce((total, task) => total + (task.done ? 1 : 0), 0)
  return {
    open: tasks.length - done,
    done,
    today: doneToday(tasks, now),
  }
}

/**
 * Display order: open tasks in the order they were written, finished ones
 * after them, oldest completion first. The list "sinks" completed work to the
 * bottom without ever reordering the things still to do.
 */
export function orderedTasks(tasks: readonly Task[]): Task[] {
  const open: Task[] = []
  const done: Task[] = []
  for (const task of tasks) (task.done ? done : open).push(task)
  done.sort((a, b) => (a.doneAt ?? 0) - (b.doneAt ?? 0))
  return [...open, ...done]
}

export function filterTasks(tasks: readonly Task[], filter: TodoFilter): Task[] {
  if (filter === 'open') return tasks.filter((task) => !task.done)
  if (filter === 'done') return tasks.filter((task) => task.done)
  return [...tasks]
}

let idFallback = 0

export function makeId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }
  idFallback += 1
  return `t-${Date.now().toString(36)}-${idFallback}`
}

/** Collapse whitespace, drop control characters, cap at the LCD width. */
export function normaliseText(raw: string): string {
  let clean = ''
  for (const character of raw) {
    const code = character.codePointAt(0) ?? 0
    clean += code < 0x20 || code === 0x7f ? ' ' : character
  }
  const collapsed = clean.replace(/\s+/g, ' ').trim()
  // Slice by code point so an emoji is never left as half a surrogate pair.
  return Array.from(collapsed).slice(0, MAX_TEXT).join('').trim()
}

export function createTask(
  text: string,
  priority: TaskPriority,
  now: number,
): Task {
  return {
    id: makeId(),
    text,
    priority,
    done: false,
    createdAt: now,
    doneAt: null,
    awarded: 0,
  }
}

export function baseXp(priority: TaskPriority): number {
  return PRIORITIES[priority].xp
}

/** Combo steps pay `COMBO_BONUS` each, up to `COMBO_MAX` steps. */
export function comboBonus(combo: number): number {
  const steps = Math.min(Math.max(combo, 1), COMBO_MAX + 1) - 1
  return steps * COMBO_BONUS
}

export function xpAward(priority: TaskPriority, combo: number): number {
  return baseXp(priority) + comboBonus(combo)
}

export function nextPriority(current: TaskPriority): TaskPriority {
  const index = PRIORITY_ORDER.indexOf(current)
  return PRIORITY_ORDER[(index + 1) % PRIORITY_ORDER.length]
}

/** A brand-new visitor gets a short list to poke at, not an empty void. */
export function seedState(now: number): TodoSave {
  return {
    version: SAVE_VERSION,
    tasks: SEED_TASKS.map((seed, index) =>
      createTask(seed.text, seed.priority, now + index),
    ),
    xp: 0,
    streak: 0,
    lastDoneDay: '',
  }
}
