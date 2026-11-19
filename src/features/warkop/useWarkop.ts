import { useCallback, useEffect, useRef, useState } from 'react'
import { MENU_ITEMS } from '../../content/warkop'
import { WarkopSound, type WarkopSoundName } from './audio'
import { DAY_MS, WarkopGame } from './engine'
import {
  PLAYFIELD_HEIGHT,
  PLAYFIELD_WIDTH,
  renderWarkop,
} from './render'
import type { ItemId, WarkopEvent, WarkopSnapshot } from './types'

const BEST_KEY = 'ihsnn:warkop:best'
const MUTED_KEY = 'ihsnn:warkop:muted'
/** The cartridge shipped as "warung" for a day; keep the record it earned. */
const LEGACY_BEST_KEY = 'ihsnn:warung:best'
const LEGACY_MUTED_KEY = 'ihsnn:warung:muted'

const EVENT_SOUND: Record<WarkopEvent, WarkopSoundName> = {
  open: 'open',
  cook: 'cook',
  ready: 'ready',
  serve: 'serve',
  miss: 'miss',
  busy: 'busy',
  close: 'close',
  record: 'record',
  ui: 'ui',
}

function readNumber(key: string): number {
  try {
    const raw = window.localStorage.getItem(key)
    const value = raw ? Number.parseInt(raw, 10) : 0
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

function readBest(): number {
  return readNumber(BEST_KEY) || readNumber(LEGACY_BEST_KEY)
}

function readMuted(): boolean {
  try {
    return (
      window.localStorage.getItem(MUTED_KEY) === '1' ||
      window.localStorage.getItem(LEGACY_MUTED_KEY) === '1'
    )
  } catch {
    return false
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* private mode: the day still runs, it just forgets */
  }
}

function emptySnapshot(best: number): WarkopSnapshot {
  return {
    phase: 'closed',
    coins: 0,
    best,
    served: 0,
    missed: 0,
    remainingMs: DAY_MS,
    newRecord: false,
    inventory: { kopi: 0, teh: 0, mie: 0, nasi: 0, gorengan: 0 },
    cooking: { kopi: 0, teh: 0, mie: 0, nasi: 0, gorengan: 0 },
    customerCount: 0,
    burners: 0,
    burnerLimit: 2,
  }
}

/**
 * React glue for WARKOP: owns the canvas loop, the 10 Hz snapshot used by the
 * register keys, the keyboard shortcuts, the speaker and the persisted best.
 * Rules live in `engine.ts`, drawing in `render.ts`.
 */
export function useWarkop() {
  const [snapshot, setSnapshot] = useState<WarkopSnapshot>(() =>
    emptySnapshot(readBest()),
  )
  const [muted, setMuted] = useState(readMuted)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<WarkopGame | null>(null)
  const soundRef = useRef<WarkopSound | null>(null)
  const mutedRef = useRef(muted)
  const savedRef = useRef(false)

  const update = useCallback((next: WarkopSnapshot) => {
    setSnapshot(next)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    // Render at the display's real pixel density instead of upscaling a
    // 320 × 240 bitmap: text stays sharp on phones and retina screens.
    const fitCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round((rect.width || PLAYFIELD_WIDTH) * dpr))
      const height = Math.max(1, Math.round((rect.height || PLAYFIELD_HEIGHT) * dpr))
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

    const sound = new WarkopSound(mutedRef.current)
    soundRef.current = sound

    const game = new WarkopGame({
      best: readBest(),
      onEvent: (event) => sound.play(EVENT_SOUND[event]),
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
      renderWarkop(context, game.view(), now, reducedMotion)

      if (now - lastUi > 90) {
        lastUi = now
        const next = game.snapshot()
        update(next)

        if (next.phase === 'summary' && !savedRef.current) {
          savedRef.current = true
          write(BEST_KEY, String(next.best))
        }
        if (next.phase === 'open') savedRef.current = false
      }

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)

    const saveBest = () => {
      const current = gameRef.current
      if (!current) return
      write(BEST_KEY, String(current.snapshot().best))
    }
    window.addEventListener('pagehide', saveBest)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', fitCanvas)
      window.removeEventListener('pagehide', saveBest)
      saveBest()
      sound.dispose()
      soundRef.current = null
      gameRef.current = null
    }
  }, [update])

  const start = useCallback(() => {
    const game = gameRef.current
    if (!game) return
    game.start()
    savedRef.current = false
    setSnapshot(game.snapshot())
  }, [])

  const cook = useCallback((item: ItemId) => {
    gameRef.current?.cook(item)
  }, [])

  const closeEarly = useCallback(() => {
    gameRef.current?.closeEarly()
  }, [])

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next
    setMuted(next)
    write(MUTED_KEY, next ? '1' : '0')
    soundRef.current?.setMuted(next)
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

      if (event.key >= '1' && event.key <= '5') {
        const item = MENU_ITEMS[Number(event.key) - 1]
        if (!item) return
        event.preventDefault()
        cook(item.id)
        return
      }

      if (event.key === 'Enter') {
        const game = gameRef.current
        if (!game || game.snapshot().phase === 'open') return
        event.preventDefault()
        start()
        return
      }

      if (event.key.toLowerCase() === 'm') {
        event.preventDefault()
        toggleMuted()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cook, start, toggleMuted])

  return {
    snapshot,
    muted,
    canvasRef,
    start,
    cook,
    closeEarly,
    toggleMuted,
  }
}
