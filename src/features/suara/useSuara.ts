import { useCallback, useEffect, useRef, useState } from 'react'
import type { SoundId } from '../../content/suara'
import {
  isMuted,
  playSound,
  playUi,
  primeAudio,
  setMuted,
  stopSound,
  type UiSound,
} from './audio'
import {
  readArtMode,
  readBest,
  readMuted,
  runRatio,
  writeArtMode,
  writeBest,
  writeMuted,
  type ArtMode,
  type BestRun,
} from './storage'

/**
 * The cartridge's controller: speaker, mute flag, picture mode and the best
 * quiz run. Everything that touches `localStorage` or the AudioContext lives
 * here so the page below stays a view.
 */
export function useSuara() {
  const [muted, setMutedState] = useState(readMuted)
  const [art, setArtState] = useState<ArtMode>(readArtMode)
  const [playing, setPlaying] = useState<SoundId | null>(null)
  const [best, setBest] = useState<BestRun | null>(readBest)
  const timer = useRef<number | null>(null)
  const playToken = useRef(0)

  // Apply a stored mute flag before the first sound exists; this does not
  // create an AudioContext (browsers would refuse to start it anyway).
  useEffect(() => {
    setMuted(muted)
  }, [muted])

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
      stopSound()
    },
    [],
  )

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const play = useCallback(
    async (id: SoundId, force = true) => {
      // A silent sound game is a broken sound game: a deliberate press of a
      // speaker wins over the mute flag, and the header icon follows. Quiz
      // auto-play passes `force = false` so it stays quiet when muted.
      if (isMuted()) {
        if (!force) return
        setMuted(false)
        setMutedState(false)
        writeMuted(false)
      }

      const token = playToken.current + 1
      playToken.current = token
      clearTimer()
      // Light the button immediately: decoding a recording can take a frame
      // or two, and the press should feel instant.
      setPlaying(id)

      try {
        const duration = await playSound(id)
        if (token !== playToken.current || duration <= 0) return
        timer.current = window.setTimeout(
          () => {
            setPlaying(null)
            timer.current = null
          },
          duration * 1000 + 80,
        )
      } catch {
        if (token === playToken.current) setPlaying(null)
      }
    },
    [clearTimer],
  )

  const stop = useCallback(() => {
    // Bump the token first so a recording that is still decoding cannot
    // light the button back up after this stop.
    playToken.current += 1
    clearTimer()
    stopSound()
    setPlaying(null)
  }, [clearTimer])

  const toggleMuted = useCallback(() => {
    const next = !isMuted()
    setMuted(next)
    writeMuted(next)
    setMutedState(next)
    if (next) stop()
  }, [stop])

  const setArt = useCallback((mode: ArtMode) => {
    setArtState(mode)
    writeArtMode(mode)
  }, [])

  const blip = useCallback((kind: UiSound) => {
    if (!isMuted()) playUi(kind)
  }, [])

  /** Records a finished run; only a strictly better ratio becomes the record. */
  const recordRun = useCallback(
    (score: number, total: number) => {
      const run = { score, total }
      const previous = readBest()
      // A blank first run is not worth printing "Rekor baru!" for.
      const beats = previous
        ? runRatio(run) > runRatio(previous)
        : run.score > 0
      if (beats) {
        writeBest(run)
        setBest(run)
      }
      return beats
    },
    [],
  )

  const prime = useCallback(() => {
    primeAudio()
  }, [])

  return {
    muted,
    art,
    playing,
    best,
    play,
    stop,
    toggleMuted,
    setArt,
    blip,
    recordRun,
    prime,
  }
}
