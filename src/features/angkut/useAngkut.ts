import { useCallback, useEffect, useRef, useState } from 'react'
import { GARAGE, LEVELS, levelById } from '../../content/angkut'
import { AngkutSound, type AngkutSoundName } from './audio'
import {
  AngkutGame,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  idleSnapshot,
} from './engine'
import { renderAngkut } from './render'
import {
  furthestUnlocked,
  isUnlocked,
  loadMuted,
  loadProgress,
  saveMuted,
  saveProgress,
} from './save'
import type {
  AngkutEvent,
  AngkutSnapshot,
  LevelId,
  Progress,
  Upgrades,
} from './types'

const EVENT_SOUND: Record<AngkutEvent, AngkutSoundName> = {
  start: 'start',
  coin: 'coin',
  fuel: 'fuel',
  land: 'land',
  slide: 'slide',
  air: 'air',
  stall: 'stall',
  flip: 'flip',
  finish: 'finish',
  record: 'record',
  ui: 'ui',
}

/**
 * React glue for ANGKUT: owns the canvas loop, the 10 Hz snapshot the HUD
 * reads, the pedals, the garage and the save slot. The rules live in
 * `engine.ts`, the drawing in `render.ts`.
 */
export function useAngkut() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [selected, setSelected] = useState<LevelId>(() =>
    furthestUnlocked(progress),
  )
  const [snapshot, setSnapshot] = useState<AngkutSnapshot>(() =>
    idleSnapshot(levelById(selected), progress.levels[selected]),
  )
  const [muted, setMuted] = useState(loadMuted)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<AngkutGame | null>(null)
  const soundRef = useRef<AngkutSound | null>(null)
  const progressRef = useRef(progress)
  const mutedRef = useRef(muted)
  const selectedRef = useRef(selected)
  const gasRef = useRef(false)
  const brakeRef = useRef(false)
  const committedRef = useRef(false)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  const update = useCallback((next: AngkutSnapshot) => {
    setSnapshot(next)
  }, [])

  /** Bank a finished run exactly once. */
  const commit = useCallback((next: AngkutSnapshot) => {
    if (next.phase !== 'ended') {
      committedRef.current = false
      return
    }
    if (committedRef.current) return
    committedRef.current = true

    const current = progressRef.current
    const record = current.levels[next.levelId]
    const distance = Math.round(next.distance)
    const cleared =
      record?.cleared === true || next.endReason === 'finish'

    const updated: Progress = {
      coins: current.coins + next.earned,
      upgrades: current.upgrades,
      levels: {
        ...current.levels,
        [next.levelId]: {
          bestM: Math.max(record?.bestM ?? 0, distance),
          bestCoins: Math.max(record?.bestCoins ?? 0, next.earned),
          cleared,
        },
      },
    }

    progressRef.current = updated
    setProgress(updated)
    saveProgress(updated)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const fitCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(
        1,
        Math.round((rect.width || VIEW_WIDTH) * dpr),
      )
      const height = Math.max(
        1,
        Math.round((rect.height || VIEW_HEIGHT) * dpr),
      )
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
    }
    fitCanvas()

    const resizeObserver =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => fitCanvas())
        : null
    resizeObserver?.observe(canvas)
    window.addEventListener('resize', fitCanvas)

    const sound = new AngkutSound(mutedRef.current)
    soundRef.current = sound

    const game = new AngkutGame({
      level: levelById(selectedRef.current),
      onEvent: (event) => sound.play(EVENT_SOUND[event]),
      upgrades: () => progressRef.current.upgrades,
      recordFor: (id) => progressRef.current.levels[id],
    })
    gameRef.current = game
    update(game.snapshot())

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    let frame = 0
    let previous = performance.now()
    let lastUi = 0

    const draw = (now: number) => {
      const delta = Math.min(100, now - previous)
      previous = now
      game.update(delta)

      const view = game.view()
      renderAngkut(context, view, now, reducedMotion)
      sound.engineSound(
        Math.min(1, Math.abs(view.truck.speed) / 320),
        view.truck.throttle,
        view.phase === 'driving',
      )

      if (now - lastUi > 90) {
        lastUi = now
        const next = game.snapshot()
        update(next)
        commit(next)
      }

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', fitCanvas)
      const last = game.snapshot()
      if (last.phase === 'ended') commit(last)
      sound.dispose()
      soundRef.current = null
      gameRef.current = null
    }
  }, [commit, update])

  // Swap the route (and park the truck) whenever the picker changes.
  useEffect(() => {
    const game = gameRef.current
    if (!game) return
    if (game.levelId() === selected) return
    game.selectLevel(levelById(selected))
    update(game.snapshot())
  }, [selected, update])

  const applyInput = useCallback(() => {
    gameRef.current?.setInput(
      gasRef.current ? 1 : 0,
      brakeRef.current ? 1 : 0,
    )
  }, [])

  const setGas = useCallback(
    (held: boolean) => {
      gasRef.current = held
      applyInput()
    },
    [applyInput],
  )

  const setBrake = useCallback(
    (held: boolean) => {
      brakeRef.current = held
      applyInput()
    },
    [applyInput],
  )

  const start = useCallback(() => {
    const game = gameRef.current
    if (!game) return
    committedRef.current = false
    game.start()
    setSnapshot(game.snapshot())
  }, [])

  const selectLevel = useCallback((id: LevelId) => {
    if (!isUnlocked(progressRef.current, id)) return
    gasRef.current = false
    brakeRef.current = false
    gameRef.current?.setInput(0, 0)
    setSelected(id)
  }, [])

  const next = useCallback(() => {
    const game = gameRef.current
    if (!game) return
    const index = LEVELS.findIndex((level) => level.id === game.levelId())
    const following = LEVELS[index + 1]
    if (!following) {
      committedRef.current = false
      game.start()
      setSnapshot(game.snapshot())
      return
    }
    selectedRef.current = following.id
    setSelected(following.id)
    game.selectLevel(following)
    committedRef.current = false
    game.start()
    setSnapshot(game.snapshot())
  }, [])

  const buy = useCallback((part: keyof Upgrades) => {
    const current = progressRef.current
    const step = current.upgrades[part]
    const item = GARAGE.find((entry) => entry.id === part)
    if (!item || step >= 3) return
    const price = item.prices[step]
    if (current.coins < price) return

    const updated: Progress = {
      coins: current.coins - price,
      upgrades: { ...current.upgrades, [part]: step + 1 },
      levels: current.levels,
    }
    progressRef.current = updated
    setProgress(updated)
    saveProgress(updated)
    soundRef.current?.play('record')
  }, [])

  const toggleMuted = useCallback(() => {
    const nextMuted = !mutedRef.current
    mutedRef.current = nextMuted
    setMuted(nextMuted)
    saveMuted(nextMuted)
    soundRef.current?.setMuted(nextMuted)
    soundRef.current?.engineSound(0, 0, false)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      const key = event.key.toLowerCase()
      if (key === 'arrowright' || key === 'd' || key === ' ') {
        event.preventDefault()
        if (!gasRef.current) setGas(true)
        return
      }
      if (key === 'arrowleft' || key === 'a') {
        event.preventDefault()
        if (!brakeRef.current) setBrake(true)
        return
      }
      if (key === 'enter') {
        const game = gameRef.current
        if (!game || game.snapshot().phase === 'driving') return
        event.preventDefault()
        if (game.snapshot().phase === 'ended') next()
        else start()
        return
      }
      if (key === 'r') {
        event.preventDefault()
        start()
        return
      }
      if (key === 'm') {
        event.preventDefault()
        toggleMuted()
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === 'arrowright' || key === 'd' || key === ' ') {
        setGas(false)
      }
      if (key === 'arrowleft' || key === 'a') setBrake(false)
    }

    const release = () => {
      setGas(false)
      setBrake(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', release)
    }
  }, [next, setBrake, setGas, start, toggleMuted])

  return {
    canvasRef,
    snapshot,
    progress,
    selected,
    muted,
    start,
    next,
    selectLevel,
    buy,
    toggleMuted,
    setGas,
    setBrake,
  }
}
