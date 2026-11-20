/**
 * Shapes shared by the to-do cartridge.
 *
 * Kept apart from `quest.ts` (rules) and `content/todo.ts` (words) so neither
 * has to import the other just to name a task.
 */

export type TaskPriority = 'ringan' | 'biasa' | 'penting'

export type TodoFilter = 'all' | 'open' | 'done'

export interface Task {
  id: string
  text: string
  priority: TaskPriority
  done: boolean
  createdAt: number
  doneAt: number | null
  /** XP actually banked when this task was last ticked — combo included. */
  awarded: number
}

/** One slot, one version. `updatedAt` is written but never read back. */
export interface TodoSave {
  version: 1
  tasks: Task[]
  xp: number
  streak: number
  /** Local day (`YYYY-MM-DD`) of the last completion, '' before the first. */
  lastDoneDay: string
}

export type MessageTone = 'info' | 'good' | 'warn' | 'level'

export interface StatusMessage {
  /** Bumps on every message so the live region re-announces repeats. */
  id: number
  text: string
  tone: MessageTone
}
