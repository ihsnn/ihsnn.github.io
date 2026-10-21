import { useSyncExternalStore } from 'react'
import { SOUNDS } from '../../lib/assets'

/**
 * One tiny audio owner for the whole console.
 *
 * Replaces five separate `use-sound` instances that could not stop each other:
 * there is exactly one ambient loop at a time, it survives route changes, and
 * it is released on unmount. Muting is persisted so a returning visitor is not
 * ambushed by music.
 */

const MUTE_KEY = 'ihsnn:muted'
const AMBIENT_VOLUME = 0.3
const SFX_VOLUME = 0.5

const listeners = new Set<() => void>()

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

let muted = readMuted()
/** What the current scene wants to play, even while muted. */
let desiredTrack: string | null = null
let ambient: HTMLAudioElement | null = null

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function isMuted(): boolean {
  return muted
}

/** React binding for the sound toggle. */
export function useSoundMuted(): boolean {
  return useSyncExternalStore(subscribe, isMuted, () => false)
}

function releaseAmbient() {
  if (!ambient) return
  ambient.pause()
  ambient.removeAttribute('src')
  ambient = null
}

/** Starts (or keeps) the ambient loop for the current scene. `null` = silence. */
export function playAmbient(src: string | null) {
  desiredTrack = src

  if (muted || !src) {
    releaseAmbient()
    return
  }
  if (ambient && ambient.dataset.track === src && !ambient.paused) return

  releaseAmbient()
  const element = new Audio(src)
  element.loop = true
  element.volume = AMBIENT_VOLUME
  element.preload = 'auto'
  element.dataset.track = src
  ambient = element
  // Autoplay can still be blocked before the first user gesture; the power
  // switch is a click, so by the time a scene asks for music it is allowed.
  void element.play().catch(() => undefined)
}

export function stopAmbient() {
  desiredTrack = null
  releaseAmbient()
}

export function setMuted(next: boolean) {
  if (muted === next) return
  muted = next
  try {
    window.localStorage.setItem(MUTE_KEY, next ? '1' : '0')
  } catch {
    /* storage can be unavailable (private mode) — muting still works */
  }

  if (muted) {
    releaseAmbient()
  } else if (desiredTrack) {
    playAmbient(desiredTrack)
  }
  emit()
}

export function toggleMuted() {
  setMuted(!muted)
}

const sfx = new Map<'move' | 'confirm', HTMLAudioElement>()

/** Plays a UI blip. Never throws, never queues up. */
export function playUiSound(kind: 'move' | 'confirm') {
  if (muted) return

  let element = sfx.get(kind)
  if (!element) {
    element = new Audio(SOUNDS[kind])
    element.volume = SFX_VOLUME
    element.preload = 'auto'
    sfx.set(kind, element)
  }

  try {
    element.currentTime = 0
    void element.play().catch(() => undefined)
  } catch {
    /* ignore — a missed blip must never break navigation */
  }
}
