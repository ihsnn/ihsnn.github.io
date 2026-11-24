import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { SPORTS, type Dir, type TeamId } from '../../content/pekan/island'
import { PekanSound } from './audio'
import { PekanGame } from './game'
import { dirForKey, isAKey, isBKey, shouldPreventDefault } from './input'
import { renderPekan } from './render'
import { DESIGN_H, DESIGN_W } from './render/ui'
import { readMuted, readSave, writeMuted } from './save'
import type { InputFrame, Mode, PointerAim } from './types'

export interface PekanHud {
  mode: Mode
  scrolls: number
  total: number
  team: TeamId
}

const EMPTY_HUD: PekanHud = { mode: 'title', scrolls: 0, total: SPORTS.length, team: 'merah' }

function designPoint(event: ReactPointerEvent<HTMLCanvasElement>): PointerAim {
  const rect = event.currentTarget.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * DESIGN_W,
    y: ((event.clientY - rect.top) / Math.max(1, rect.height)) * DESIGN_H,
  }
}

/**
 * React glue for PEKAN RAYA: the canvas, the frame loop, the keyboard, the
 * touch pad and the save. The island itself lives in `world.ts` / `game.ts`.
 */
export function usePekan() {
  const [hud, setHud] = useState<PekanHud>(EMPTY_HUD)
  const [muted, setMuted] = useState(readMuted)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<PekanGame | null>(null)
  const soundRef = useRef<PekanSound | null>(null)
  const mutedRef = useRef(muted)

  const dirs = useRef<Record<Dir, number>>({ up: 0, down: 0, left: 0, right: 0 })
  const prevDirs = useRef({ up: false, down: false, left: false, right: false })
  const edgeA = useRef(false)
  const edgeB = useRef(false)
  const pointer = useRef<PointerAim | null>(null)
  const pointerHeld = useRef(false)
  const pointerFlush = useRef(false)

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next
    soundRef.current?.setMuted(next)
    writeMuted(next)
    setMuted(next)
    if (!next) soundRef.current?.unlock()
  }, [])

  const toggleMutedRef = useRef(toggleMuted)
  toggleMutedRef.current = toggleMuted

  const pressDir = useCallback((dir: Dir) => {
    dirs.current[dir] += 1
    soundRef.current?.unlock()
  }, [])

  const releaseDir = useCallback((dir: Dir) => {
    dirs.current[dir] = Math.max(0, dirs.current[dir] - 1)
  }, [])

  const tapA = useCallback(() => {
    edgeA.current = true
    soundRef.current?.unlock()
  }, [])

  const tapB = useCallback(() => {
    edgeB.current = true
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const fitCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round((rect.width || DESIGN_W) * dpr))
      const height = Math.max(1, Math.round((rect.height || DESIGN_H) * dpr))
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

    const sound = new PekanSound(mutedRef.current)
    soundRef.current = sound

    const game = new PekanGame(readSave(), (name) => sound.play(name))
    gameRef.current = game

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    let frame = 0
    let previous = performance.now()
    let lastHud = 0
    let lastSnapshot = ''

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - previous) / 1000)
      previous = now

      const aim = pointer.current
      const held = {
        up: dirs.current.up > 0,
        down: dirs.current.down > 0,
        left: dirs.current.left > 0,
        right: dirs.current.right > 0,
      }
      const input: InputFrame = {
        ...held,
        upPressed: held.up && !prevDirs.current.up,
        downPressed: held.down && !prevDirs.current.down,
        leftPressed: held.left && !prevDirs.current.left,
        rightPressed: held.right && !prevDirs.current.right,
        a: edgeA.current,
        b: edgeB.current,
        aPressed: edgeA.current,
        bPressed: edgeB.current,
        pointer: aim,
      }
      prevDirs.current = held
      edgeA.current = false
      edgeB.current = false

      game.update(dt, input)

      // A finger that has lifted stops steering: otherwise a stale pointer
      // would fight the keyboard on every later shot.
      if (pointerFlush.current) {
        pointerFlush.current = false
        pointer.current = null
      }

      const scaleX = canvas.width / DESIGN_W
      const scaleY = canvas.height / DESIGN_H
      context.setTransform(scaleX, 0, 0, scaleY, 0, 0)
      context.imageSmoothingEnabled = false
      renderPekan(context, game, now, reducedMotion)

      if (now - lastHud > 160) {
        lastHud = now
        const next: PekanHud = {
          mode: game.mode,
          scrolls: game.save.scrolls.length,
          total: SPORTS.length,
          team: game.save.team,
        }
        const key = `${next.mode}|${next.scrolls}|${next.team}`
        if (key !== lastSnapshot) {
          lastSnapshot = key
          setHud(next)
        }
      }

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)

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
      if (shouldPreventDefault(event.code)) event.preventDefault()

      sound.unlock()
      if (event.repeat) return

      if (event.code === 'Backquote') {
        game.toggleDebug()
        return
      }
      if (event.code === 'KeyM') {
        toggleMutedRef.current()
        return
      }

      const dir = dirForKey(event.code)
      if (dir) {
        dirs.current[dir] += 1
        return
      }
      if (isAKey(event.code)) edgeA.current = true
      if (isBKey(event.code)) edgeB.current = true
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const dir = dirForKey(event.code)
      if (dir) dirs.current[dir] = Math.max(0, dirs.current[dir] - 1)
    }

    const onBlur = () => {
      dirs.current = { up: 0, down: 0, left: 0, right: 0 }
      prevDirs.current = { up: false, down: false, left: false, right: false }
      pointerHeld.current = false
    }

    const persist = () => game.saveNow()
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') persist()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', persist)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', fitCanvas)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', persist)
      persist()
      sound.dispose()
      soundRef.current = null
      gameRef.current = null
    }
  }, [setHud])

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pointer.current = designPoint(event)
    pointerHeld.current = true
    soundRef.current?.unlock()
  }, [])

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!pointerHeld.current) return
    pointer.current = designPoint(event)
  }, [])

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    pointer.current = designPoint(event)
    pointerHeld.current = false
    pointerFlush.current = true
    edgeA.current = true
  }, [])

  const onPointerLeave = useCallback(() => {
    pointerHeld.current = false
  }, [])

  return {
    canvasRef,
    hud,
    muted,
    toggleMuted,
    pressDir,
    releaseDir,
    tapA,
    tapB,
    canvasPointer: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerLeave,
      onPointerLeave,
    },
  }
}
