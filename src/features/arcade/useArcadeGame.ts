import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { STAGE_NAMES } from '../../content/arcade'
import {
  ArcadeGame,
  PLAYFIELD_HEIGHT,
  PLAYFIELD_WIDTH,
  type ArcadeSnapshot,
} from './game'
import { ArcadeSound } from './sound'

const HIGH_SCORE_KEY = 'ihsnn:arcade:high-score'
const MUTED_KEY = 'ihsnn:arcade:muted'

function readHighScore(): number {
  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_KEY)
    const value = raw ? Number.parseInt(raw, 10) : 0
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
  } catch {
    return 0
  }
}

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTED_KEY) === '1'
  } catch {
    return false
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* private mode: the game still runs, it just forgets */
  }
}

function initialSnapshot(): ArcadeSnapshot {
  return {
    phase: 'menu',
    score: 0,
    highScore: readHighScore(),
    level: 1,
    lives: 3,
    combo: 0,
    stageName: STAGE_NAMES[0],
    newRecord: false,
  }
}

const pointerToPlayfieldX = (
  event: ReactPointerEvent<HTMLCanvasElement>,
): number => {
  const rect = event.currentTarget.getBoundingClientRect()
  return ((event.clientX - rect.left) / rect.width) * PLAYFIELD_WIDTH
}

/**
 * React glue for the arcade cartridge: owns the canvas loop, the input
 * bindings, the persisted high score and the mute flag. All game rules live in
 * `game.ts`; this hook only translates browser events into engine calls.
 */
export function useArcadeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<ArcadeGame | null>(null)
  const soundRef = useRef<ArcadeSound | null>(null)

  const [snapshot, setSnapshot] = useState<ArcadeSnapshot>(initialSnapshot)
  const [muted, setMuted] = useState(readMuted)
  const mutedRef = useRef(muted)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const sound = new ArcadeSound(mutedRef.current)
    soundRef.current = sound

    const game = new ArcadeGame({
      highScore: readHighScore(),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      onSnapshot: setSnapshot,
      onHighScore: (score) => write(HIGH_SCORE_KEY, String(score)),
      onSound: (name, pitch) => sound.play(name, pitch),
    })
    gameRef.current = game
    setSnapshot(game.snapshot())

    let frame = 0
    let previous = performance.now()

    const render = (now: number) => {
      const delta = (now - previous) / 1000
      previous = now
      game.update(delta)
      game.draw(context)
      frame = requestAnimationFrame(render)
    }

    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      gameRef.current = null
      soundRef.current = null
      sound.dispose()
    }
  }, [])

  const primary = useCallback(() => {
    const game = gameRef.current
    if (!game) return
    const phase = game.snapshot().phase
    if (phase === 'menu' || phase === 'gameover') game.start()
    else if (phase === 'ready') game.serve()
    else if (phase === 'paused') game.resume()
  }, [])

  const togglePause = useCallback(() => {
    gameRef.current?.togglePause()
  }, [])

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next
    setMuted(next)
    write(MUTED_KEY, next ? '1' : '0')
    soundRef.current?.setMuted(next)
  }, [])

  const setDirection = useCallback((direction: -1 | 0 | 1) => {
    gameRef.current?.setDirection(direction)
  }, [])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const game = gameRef.current
      if (!game) return
      if (event.pointerType !== 'mouse') {
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      game.movePaddleTo(pointerToPlayfieldX(event))
      if (game.snapshot().phase === 'ready') game.serve()
    },
    [],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const game = gameRef.current
      if (!game) return
      const dragging =
        event.pointerType === 'mouse' ||
        event.currentTarget.hasPointerCapture(event.pointerId)
      if (dragging) game.movePaddleTo(pointerToPlayfieldX(event))
    },
    [],
  )

  useEffect(() => {
    const held = { left: false, right: false }

    const applyDirection = () => {
      const direction = (held.right ? 1 : 0) - (held.left ? 1 : 0)
      gameRef.current?.setDirection(direction as -1 | 0 | 1)
    }

    const isTypingTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null
      if (!element) return false
      return (
        element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        element.tagName === 'SELECT' ||
        element.isContentEditable
      )
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return

      if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        event.preventDefault()
        held.left = true
        applyDirection()
        return
      }
      if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        event.preventDefault()
        held.right = true
        applyDirection()
        return
      }
      if (event.code === 'Space' || event.code === 'Enter') {
        const target = event.target as HTMLElement | null
        if (target?.closest('button, a, input, textarea, select, summary')) return
        event.preventDefault()
        primary()
        return
      }
      if (event.code === 'KeyP' || event.code === 'Escape') {
        event.preventDefault()
        togglePause()
        return
      }
      if (event.code === 'KeyM') {
        event.preventDefault()
        toggleMuted()
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        held.left = false
        applyDirection()
      } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        held.right = false
        applyDirection()
      }
    }

    const releaseKeys = () => {
      held.left = false
      held.right = false
      gameRef.current?.setDirection(0)
    }

    const onVisibilityChange = () => {
      if (document.hidden) gameRef.current?.pause()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseKeys)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', releaseKeys)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      gameRef.current?.setDirection(0)
    }
  }, [primary, togglePause, toggleMuted])

  return {
    canvasRef,
    snapshot,
    muted,
    primary,
    togglePause,
    toggleMuted,
    setDirection,
    canvasHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
    },
    playfieldWidth: PLAYFIELD_WIDTH,
    playfieldHeight: PLAYFIELD_HEIGHT,
  }
}
