import { useEffect, useRef, type MutableRefObject } from 'react'
import { RoomEngine, VIEW_HEIGHT, VIEW_WIDTH } from './game'
import type {
  CharacterState,
  Direction,
  PlayerPosition,
  RoomObject,
} from './types'

export interface RoomHandle {
  getFacingObject: () => RoomObject | null
  getPlayer: () => PlayerPosition
  setDirection: (direction: Direction | null) => void
}

interface RoomViewProps {
  character: CharacterState
  paused: boolean
  initialPlayer: PlayerPosition | null
  onNearby: (object: RoomObject | null) => void
  handleRef: MutableRefObject<RoomHandle | null>
}

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
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

/**
 * Owns the room canvas, the movement loop and the physical keyboard. The page
 * owns dialogue and progression, and calls into this component through the
 * small `RoomHandle` API.
 */
export default function RoomView({
  character,
  paused,
  initialPlayer,
  onNearby,
  handleRef,
}: RoomViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<RoomEngine | null>(null)
  const pausedRef = useRef(paused)
  const characterRef = useRef(character)
  const nearbyRef = useRef(onNearby)
  const initialPlayerRef = useRef(initialPlayer)
  const clearInputRef = useRef<() => void>(() => undefined)

  pausedRef.current = paused
  characterRef.current = character
  nearbyRef.current = onNearby

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const engine = new RoomEngine(initialPlayerRef.current)
    engineRef.current = engine
    handleRef.current = {
      getFacingObject: () => engine.getFacingObject(),
      getPlayer: () => engine.getPlayer(),
      setDirection: (direction) => engine.setDirection(direction),
    }

    let raf = 0
    let previous = performance.now()
    let lastNearby: string | null = null

    const frame = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05)
      previous = now

      if (!pausedRef.current) engine.update(dt)
      engine.draw(context, characterRef.current)

      const nearby = engine.getFacingObject()
      const nearbyId = nearby?.id ?? null
      if (nearbyId !== lastNearby) {
        lastNearby = nearbyId
        nearbyRef.current(nearby)
      }

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      engineRef.current = null
      handleRef.current = null
      nearbyRef.current(null)
    }
  }, [handleRef])

  useEffect(() => {
    const held: Direction[] = []

    const apply = () => {
      engineRef.current?.setDirection(held[held.length - 1] ?? null)
    }

    const press = (direction: Direction) => {
      const index = held.indexOf(direction)
      if (index >= 0) held.splice(index, 1)
      held.push(direction)
      apply()
    }

    const release = (direction: Direction) => {
      const index = held.indexOf(direction)
      if (index >= 0) held.splice(index, 1)
      apply()
    }

    const releaseAll = () => {
      held.length = 0
      apply()
    }

    clearInputRef.current = releaseAll

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      const direction = KEY_DIRECTIONS[event.code]
      if (!direction) return
      event.preventDefault()
      if (pausedRef.current) return
      press(direction)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[event.code]
      if (!direction) return
      release(direction)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseAll)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', releaseAll)
      clearInputRef.current = () => undefined
    }
  }, [])

  useEffect(() => {
    if (paused) clearInputRef.current()
  }, [paused])

  return (
    <canvas
      ref={canvasRef}
      className="kgb-room"
      width={VIEW_WIDTH}
      height={VIEW_HEIGHT}
      aria-hidden="true"
    />
  )
}
