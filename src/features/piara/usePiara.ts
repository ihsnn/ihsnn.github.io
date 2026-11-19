import { useCallback, useEffect, useRef, useState } from 'react'
import {
  EVOLVE_LINE,
  HATCH,
  LINES,
  REFUSALS,
  WAKE_LINES,
  awayLine,
} from '../../content/piara'
import { PiaraSound } from './audio'
import {
  clearPet,
  readMutedFlag,
  readPet,
  writeMutedFlag,
  writePet,
} from './save'
import {
  advance,
  applyAction,
  createPet,
  deriveMood,
  tapEgg,
} from './sim'
import { FX_MS, LCD_HEIGHT, LCD_WIDTH, renderLcd } from './sprite'
import type { ActionId, FxKind, PetState } from './types'

function pick(lines: readonly string[]): string {
  return lines[Math.floor(Math.random() * lines.length)] ?? ''
}

interface Booted {
  pet: PetState
  away: number
}

/** Read the save and walk it to the present before the first paint. */
function boot(): Booted {
  const now = Date.now()
  const saved = readPet()
  if (!saved) return { pet: createPet(now), away: 0 }
  const away = Math.max(0, now - saved.lastTick)
  return { pet: advance(saved, now).pet, away }
}

interface Bubble {
  text: string
  /** Forces the bubble animation to restart even for repeated lines. */
  id: number
}

/**
 * React glue for PIARA: owns the pet, the clock, the canvas loop, the save and
 * the speaker. Rules live in `sim.ts`, drawing in `sprite.ts`, words in
 * `content/piara.ts`; this hook only connects them to the browser.
 */
export function usePiara() {
  const [booted] = useState(boot)
  const [pet, setPet] = useState<PetState>(booted.pet)
  const [bubble, setBubble] = useState<Bubble | null>(() => {
    if (!booted.pet.name || booted.away < 10 * 60_000) return null
    return { text: awayLine(booted.away), id: 0 }
  })
  const [busy, setBusy] = useState(false)
  const [muted, setMuted] = useState(readMutedFlag)
  const [naming, setNaming] = useState(
    () => booted.pet.stage !== 'telur' && booted.pet.name === '',
  )

  const petRef = useRef(booted.pet)
  const mutedRef = useRef(muted)
  const fxRef = useRef<{ kind: FxKind; at: number } | null>(null)
  const soundRef = useRef<PiaraSound | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef(0)
  const bubbleId = useRef(0)
  const busyTimer = useRef<number | null>(null)
  const namingTimer = useRef<number | null>(null)
  const lastAction = useRef(0)

  const update = useCallback((next: PetState) => {
    petRef.current = next
    setPet(next)
  }, [])

  const showBubble = useCallback((text: string) => {
    bubbleId.current += 1
    setBubble({ text, id: bubbleId.current })
  }, [])

  const flashBusy = useCallback(() => {
    setBusy(true)
    if (busyTimer.current !== null) window.clearTimeout(busyTimer.current)
    busyTimer.current = window.setTimeout(() => setBusy(false), 560)
  }, [])

  // Speaker: created once, disposed with the cartridge.
  useEffect(() => {
    const sound = new PiaraSound(mutedRef.current)
    soundRef.current = sound
    return () => {
      sound.dispose()
      soundRef.current = null
    }
  }, [])

  // The LCD loop. It reads refs rather than state so a new need value never
  // restarts the animation or drops a frame mid-blink.
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    canvas.width = LCD_WIDTH
    canvas.height = LCD_HEIGHT
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    let frame = 0
    let last = performance.now()

    const draw = (now: number) => {
      const delta = Math.min(100, now - last)
      last = now
      timeRef.current += delta

      const active = fxRef.current
      if (active && now - active.at > FX_MS[active.kind]) {
        fxRef.current = null
      }
      const fx = fxRef.current

      renderLcd(context, {
        pet: petRef.current,
        mood: deriveMood(petRef.current),
        fx: fx ? { kind: fx.kind, age: now - fx.at } : null,
        time: timeRef.current,
        reducedMotion,
      })
      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Real time. A tick also runs when the tab comes back, which is the only
  // moment a backgrounded page can be trusted to measure the gap.
  useEffect(() => {
    const tick = () => {
      const current = petRef.current
      const result = advance(current, Date.now())
      if (result.pet === current) return
      update(result.pet)

      if (result.evolved) {
        soundRef.current?.play('evolve')
        fxRef.current = { kind: 'evolve', at: performance.now() }
        showBubble(EVOLVE_LINE)
      } else if (result.woke) {
        soundRef.current?.play('wake')
        fxRef.current = { kind: 'wake', at: performance.now() }
        showBubble(pick(WAKE_LINES))
      }
    }

    const interval = window.setInterval(tick, 1_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [showBubble, update])

  // Autosave. Losing a visit costs at most the last few seconds of decay.
  useEffect(() => {
    const save = () => writePet(petRef.current)
    const interval = window.setInterval(save, 4_000)
    window.addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', save)

    return () => {
      save()
      window.clearInterval(interval)
      window.removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', save)
    }
  }, [])

  // Bubbles clear themselves, but a repeated line still restarts the pop.
  useEffect(() => {
    if (!bubble) return
    const timeout = window.setTimeout(() => setBubble(null), 3_800)
    return () => window.clearTimeout(timeout)
  }, [bubble])

  useEffect(
    () => () => {
      if (busyTimer.current !== null) window.clearTimeout(busyTimer.current)
      if (namingTimer.current !== null) window.clearTimeout(namingTimer.current)
    },
    [],
  )

  const act = useCallback(
    (action: ActionId) => {
      const now = Date.now()
      // Buttons already lock for half a second; the keyboard path needs the
      // same guard so a held key cannot empty the bowl in one frame.
      if (now - lastAction.current < 450) return
      lastAction.current = now

      const current = petRef.current
      const outcome = applyAction(current, action, now)

      if (!outcome.ok) {
        soundRef.current?.play('refuse')
        showBubble(outcome.reason ? REFUSALS[outcome.reason] : REFUSALS.unready)
        return
      }

      update(outcome.pet)

      const fx: FxKind =
        action === 'sleep' ? (outcome.pet.asleep ? 'sleep' : 'wake') : action
      fxRef.current = { kind: fx, at: performance.now() }
      soundRef.current?.play(fx)

      showBubble(
        action === 'sleep' && outcome.woke
          ? pick(WAKE_LINES)
          : pick(LINES[action]),
      )
      flashBusy()
    },
    [flashBusy, showBubble, update],
  )

  const onTapEgg = useCallback(() => {
    const current = petRef.current
    if (current.stage !== 'telur') return

    const next = tapEgg(current, Date.now())
    update(next)

    if (next.stage !== 'telur') {
      soundRef.current?.play('hatch')
      fxRef.current = { kind: 'hatch', at: performance.now() }
      if (namingTimer.current !== null) window.clearTimeout(namingTimer.current)
      namingTimer.current = window.setTimeout(() => setNaming(true), 1_050)
    } else {
      soundRef.current?.play('tap')
      fxRef.current = { kind: 'tap', at: performance.now() }
    }
  }, [update])

  const submitName = useCallback(
    (value: string) => {
      const name = value.trim().slice(0, HATCH.maxLength)
      if (!name) return

      const now = Date.now()
      update({ ...petRef.current, name, lastTick: now, updatedAt: now })
      setNaming(false)
      soundRef.current?.play('name')
      showBubble(`Halo, aku ${name}.`)
    },
    [showBubble, update],
  )

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next
    setMuted(next)
    writeMutedFlag(next)
    soundRef.current?.setMuted(next)
  }, [])

  const reset = useCallback(() => {
    const now = Date.now()
    clearPet()
    update(createPet(now))
    fxRef.current = null
    setBubble(null)
    setNaming(false)
    setBusy(false)
    soundRef.current?.play('ui')
  }, [update])

  return {
    pet,
    mood: deriveMood(pet),
    bubble,
    busy,
    muted,
    naming,
    canvasRef,
    act,
    tapEgg: onTapEgg,
    submitName,
    toggleMuted,
    reset,
  }
}

export type PiaraController = ReturnType<typeof usePiara>
