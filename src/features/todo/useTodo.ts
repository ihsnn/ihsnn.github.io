import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { COMBO, FILTERS, FILTER_ORDER, PRIORITIES, TOAST } from '../../content/todo'
import { TodoSound, type TodoSoundName } from './audio'
import {
  advanceStreak,
  baseXp,
  comboBonus,
  counts,
  COMBO_WINDOW_MS,
  createTask,
  dayKey,
  filterTasks,
  levelInfo,
  liveStreak,
  MAX_TASKS,
  MISSION_TARGET,
  nextPriority,
  normaliseText,
  orderedTasks,
  seedState,
  xpAward,
} from './quest'
import {
  clearTodo,
  readMutedFlag,
  readTodo,
  writeMutedFlag,
  writeTodo,
} from './save'
import type {
  StatusMessage,
  Task,
  TodoFilter,
  TodoSave,
} from './types'

interface UndoEntry {
  tasks: Task[]
  at: number
}

interface LevelUpNotice {
  id: number
  level: number
  title: string
}

const UNDO_DEPTH = 10

function boot(): TodoSave {
  return readTodo() ?? seedState(Date.now())
}

/**
 * React glue for TASK-9: owns the list, the XP, the streak, the selection, the
 * undo stack, the speaker and the save. The rules live in `quest.ts`, the
 * words in `content/todo.ts`; this hook only connects them to the browser.
 */
export function useTodo() {
  const [state, setState] = useState<TodoSave>(boot)
  const [filter, setFilterState] = useState<TodoFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(
    () => state.tasks.find((task) => !task.done)?.id ?? state.tasks[0]?.id ?? null,
  )
  const [message, setMessage] = useState<StatusMessage | null>(null)
  const [levelUp, setLevelUp] = useState<LevelUpNotice | null>(null)
  const [combo, setCombo] = useState(0)
  const [muted, setMuted] = useState(readMutedFlag)
  const [now, setNow] = useState(() => Date.now())

  const stateRef = useRef(state)
  const filterRef = useRef<TodoFilter>('all')
  const mutedRef = useRef(muted)
  const soundRef = useRef<TodoSound | null>(null)
  const undoRef = useRef<UndoEntry[]>([])
  const messageId = useRef(0)
  const levelId = useRef(0)
  const comboRef = useRef(0)
  const lastDoneAt = useRef(0)

  const ordered = useMemo(() => orderedTasks(state.tasks), [state.tasks])
  const visibleTasks = useMemo(
    () => filterTasks(ordered, filter),
    [ordered, filter],
  )
  const visibleRef = useRef(visibleTasks)

  const level = levelInfo(state.xp)
  const stats = counts(state.tasks, now)

  // ---------- plumbing ----------

  const commit = useCallback((next: TodoSave) => {
    stateRef.current = next
    setState(next)
  }, [])

  const play = useCallback((name: TodoSoundName, pitch = 1) => {
    soundRef.current?.play(name, pitch)
  }, [])

  const say = useCallback(
    (text: string, tone: StatusMessage['tone'] = 'info') => {
      messageId.current += 1
      setMessage({ id: messageId.current, text, tone })
    },
    [],
  )

  const showFilter = useCallback((next: TodoFilter) => {
    filterRef.current = next
    setFilterState(next)
  }, [])

  const pushUndo = useCallback((tasks: Task[]) => {
    undoRef.current = [{ tasks, at: Date.now() }, ...undoRef.current].slice(
      0,
      UNDO_DEPTH,
    )
  }, [])

  // ---------- effects ----------

  useEffect(() => {
    visibleRef.current = visibleTasks
  }, [visibleTasks])

  // Keep a selection that always points at something on screen.
  useEffect(() => {
    if (visibleTasks.length === 0) {
      if (selectedId !== null) setSelectedId(null)
      return
    }
    if (selectedId === null || !visibleTasks.some((task) => task.id === selectedId)) {
      setSelectedId(visibleTasks[0].id)
    }
  }, [visibleTasks, selectedId])

  // Speaker: created once, disposed with the cartridge.
  useEffect(() => {
    const sound = new TodoSound(mutedRef.current)
    soundRef.current = sound
    return () => {
      sound.dispose()
      soundRef.current = null
    }
  }, [])

  // Autosave on every change, plus one last write on the way out.
  useEffect(() => {
    writeTodo(state)
  }, [state])

  useEffect(() => {
    const save = () => writeTodo(stateRef.current)
    window.addEventListener('pagehide', save)
    return () => {
      window.removeEventListener('pagehide', save)
      save()
    }
  }, [])

  // A fresh clock keeps "today" honest and lets the LCD date roll over.
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(() => setMessage(null), 3_200)
    return () => window.clearTimeout(timeout)
  }, [message])

  useEffect(() => {
    if (!levelUp) return
    const timeout = window.setTimeout(() => setLevelUp(null), 2_000)
    return () => window.clearTimeout(timeout)
  }, [levelUp])

  // Combo is a window, not a counter that lives forever.
  useEffect(() => {
    if (combo === 0) return
    const timeout = window.setTimeout(() => {
      comboRef.current = 0
      setCombo(0)
    }, COMBO_WINDOW_MS)
    return () => window.clearTimeout(timeout)
  }, [combo])

  // ---------- list actions ----------

  const addTask = useCallback(
    (raw: string): boolean => {
      const current = stateRef.current
      const text = normaliseText(raw)

      if (!text) {
        say(TOAST.emptyText, 'warn')
        play('refuse')
        return false
      }
      if (current.tasks.length >= MAX_TASKS) {
        say(TOAST.full(MAX_TASKS), 'warn')
        play('refuse')
        return false
      }
      const lower = text.toLowerCase()
      if (
        current.tasks.some(
          (task) => !task.done && task.text.toLowerCase() === lower,
        )
      ) {
        say(TOAST.duplicate, 'warn')
        play('refuse')
        return false
      }

      const nowMs = Date.now()
      const task = createTask(text, 'biasa', nowMs)
      commit({ ...current, tasks: [...current.tasks, task] })
      if (filterRef.current === 'done') showFilter('open')
      setSelectedId(task.id)
      setNow(nowMs)
      say(TOAST.added, 'good')
      play('add')
      return true
    },
    [commit, play, say, showFilter],
  )

  const toggleTask = useCallback(
    (id: string) => {
      const current = stateRef.current
      const task = current.tasks.find((entry) => entry.id === id)
      if (!task) return

      const nowMs = Date.now()
      setNow(nowMs)

      if (task.done) {
        const lost = task.awarded || baseXp(task.priority)
        commit({
          ...current,
          xp: Math.max(0, current.xp - lost),
          tasks: current.tasks.map((entry) =>
            entry.id === id
              ? { ...entry, done: false, doneAt: null, awarded: 0 }
              : entry,
          ),
        })
        comboRef.current = 0
        setCombo(0)
        say(TOAST.lostXp(lost), 'info')
        play('untick')
        return
      }

      const nextCombo =
        nowMs - lastDoneAt.current <= COMBO_WINDOW_MS
          ? comboRef.current + 1
          : 1
      const bonus = comboBonus(nextCombo)
      const award = xpAward(task.priority, nextCombo)
      const nextXp = current.xp + award
      const previousLevel = levelInfo(current.xp).level
      const nextLevel = levelInfo(nextXp)

      const next: TodoSave = {
        ...current,
        xp: nextXp,
        streak: advanceStreak(current.lastDoneDay, current.streak, nowMs),
        lastDoneDay: dayKey(nowMs),
        tasks: current.tasks.map((entry) =>
          entry.id === id
            ? { ...entry, done: true, doneAt: nowMs, awarded: award }
            : entry,
        ),
      }

      lastDoneAt.current = nowMs
      comboRef.current = nextCombo
      setCombo(nextCombo)
      commit(next)

      const todayDone = counts(next.tasks, nowMs).today
      const xpText = TOAST.xp(award)

      if (nextLevel.level > previousLevel) {
        levelId.current += 1
        setLevelUp({
          id: levelId.current,
          level: nextLevel.level,
          title: nextLevel.title,
        })
        say(`${TOAST.levelUp(nextLevel.level, nextLevel.title)} · ${xpText}`, 'level')
        play('level')
      } else if (todayDone === MISSION_TARGET) {
        say(`${TOAST.mission} · ${xpText}`, 'good')
        play('mission')
      } else if (bonus > 0) {
        say(`${COMBO.label} x${nextCombo} · ${xpText}`, 'good')
        play('tick', 1 + Math.min(nextCombo - 1, 3) * 0.12)
      } else {
        say(xpText, 'good')
        play('tick', 1)
      }
    },
    [commit, play, say],
  )

  const deleteTask = useCallback(
    (id: string) => {
      const current = stateRef.current
      const task = current.tasks.find((entry) => entry.id === id)
      if (!task) return

      const list = visibleRef.current
      const index = list.findIndex((entry) => entry.id === id)
      const neighbour = list[index + 1]?.id ?? list[index - 1]?.id ?? null

      pushUndo([task])
      commit({ ...current, tasks: current.tasks.filter((entry) => entry.id !== id) })
      setSelectedId(neighbour)
      say(TOAST.removed, 'warn')
      play('remove')
    },
    [commit, play, pushUndo, say],
  )

  const undoLast = useCallback(() => {
    const entry = undoRef.current[0]
    if (!entry) {
      say(TOAST.nothingToUndo, 'warn')
      play('refuse')
      return
    }

    const current = stateRef.current
    if (current.tasks.length + entry.tasks.length > MAX_TASKS) {
      say(TOAST.full(MAX_TASKS), 'warn')
      play('refuse')
      return
    }

    undoRef.current = undoRef.current.slice(1)
    commit({ ...current, tasks: [...current.tasks, ...entry.tasks] })
    setSelectedId(entry.tasks[0]?.id ?? null)
    say(TOAST.restored, 'good')
    play('undo')
  }, [commit, play, say])

  const clearDone = useCallback(() => {
    const current = stateRef.current
    const done = current.tasks.filter((task) => task.done)
    if (done.length === 0) {
      say(TOAST.nothingDone, 'warn')
      play('refuse')
      return
    }

    pushUndo(done)
    commit({
      ...current,
      tasks: current.tasks.filter((task) => !task.done),
    })
    say(TOAST.clearedDone(done.length), 'good')
    play('clear')
  }, [commit, play, pushUndo, say])

  const clearAll = useCallback(() => {
    const current = stateRef.current
    if (current.tasks.length === 0) {
      say(TOAST.alreadyEmpty, 'warn')
      play('refuse')
      return
    }

    pushUndo(current.tasks)
    commit({ ...current, tasks: [] })
    showFilter('all')
    setSelectedId(null)
    say(TOAST.clearedAll, 'good')
    play('clear')
  }, [commit, play, pushUndo, say, showFilter])

  const resetAll = useCallback(() => {
    const nowMs = Date.now()
    const fresh = seedState(nowMs)
    clearTodo()
    undoRef.current = []
    comboRef.current = 0
    lastDoneAt.current = 0
    commit(fresh)
    showFilter('all')
    setSelectedId(fresh.tasks[0]?.id ?? null)
    setCombo(0)
    setLevelUp(null)
    setNow(nowMs)
    say(TOAST.resetAll, 'good')
    play('clear')
  }, [commit, play, say, showFilter])

  // ---------- selection + filters ----------

  const selectId = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const moveSelection = useCallback(
    (delta: number) => {
      const list = visibleRef.current
      if (list.length === 0) return
      setSelectedId((current) => {
        const index = list.findIndex((task) => task.id === current)
        const next = index < 0 ? 0 : (index + delta + list.length) % list.length
        return list[next].id
      })
      play('move')
    },
    [play],
  )

  const setFilter = useCallback(
    (next: TodoFilter) => {
      if (filterRef.current === next) return
      showFilter(next)
      say(TOAST.filter(FILTERS[next].label), 'info')
      play('ui')
    },
    [play, say, showFilter],
  )

  const cycleFilter = useCallback(
    (direction: number) => {
      const index = FILTER_ORDER.indexOf(filterRef.current)
      const next =
        FILTER_ORDER[
          (index + direction + FILTER_ORDER.length) % FILTER_ORDER.length
        ]
      setFilter(next)
    },
    [setFilter],
  )

  const cyclePriority = useCallback(
    (id: string) => {
      const current = stateRef.current
      const task = current.tasks.find((entry) => entry.id === id)
      if (!task) return
      if (task.done) {
        say(TOAST.locked, 'warn')
        play('refuse')
        return
      }

      const priority = nextPriority(task.priority)
      commit({
        ...current,
        tasks: current.tasks.map((entry) =>
          entry.id === id ? { ...entry, priority } : entry,
        ),
      })
      say(TOAST.priority(PRIORITIES[priority].label, PRIORITIES[priority].xp), 'info')
      play('ui')
    },
    [commit, play, say],
  )

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next
    setMuted(next)
    writeMutedFlag(next)
    soundRef.current?.setMuted(next)
    say(TOAST.muted(next), 'info')
  }, [say])

  return {
    now,
    level,
    streak: liveStreak(state.lastDoneDay, state.streak, now),
    tasks: state.tasks,
    visibleTasks,
    stats,
    filter,
    selectedId,
    message,
    levelUp,
    combo,
    muted,
    addTask,
    toggleTask,
    deleteTask,
    undoLast,
    clearDone,
    clearAll,
    resetAll,
    selectId,
    moveSelection,
    setFilter,
    cycleFilter,
    cyclePriority,
    toggleMuted,
  }
}

export type TodoController = ReturnType<typeof useTodo>
