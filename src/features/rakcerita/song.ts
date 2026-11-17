/**
 * The AIUEO song from the tooth-brushing book.
 *
 * Audio comes from the YouTube copy when the page is served over http(s): a
 * hidden player supplies the sound while the sheet animates. Opening the file
 * straight from disk can never work — YouTube rejects embeds without a
 * referrer (player error 153) — and the network may simply be down, so the
 * same melody is also synthesised locally as a fallback. Nothing about the
 * sheet depends on which one is playing.
 */

import { audioContext, masterBus, tone } from './audio'
import { SONG_COPY } from '../../content/rakcerita'

export const VOWELS = ['A', 'I', 'U', 'E', 'O'] as const
export const VOWEL_FREQUENCIES = [523.25, 587.33, 659.25, 698.46, 783.99] as const

export const SONG_BEAT = 0.52
export const SONG_MELODY: ReadonlyArray<{ t: number; d: number; f: number; v: string }> = [
  { t: 0, d: 1, f: 523.25, v: 'A' },
  { t: 1, d: 1, f: 659.25, v: 'A' },
  { t: 2, d: 1, f: 783.99, v: 'A' },
  { t: 3, d: 1, f: 659.25, v: 'A' },
  { t: 4, d: 1, f: 880, v: 'I' },
  { t: 5, d: 1, f: 783.99, v: 'I' },
  { t: 6, d: 1, f: 659.25, v: 'I' },
  { t: 7, d: 1, f: 523.25, v: 'I' },
  { t: 8, d: 1, f: 698.46, v: 'U' },
  { t: 9, d: 1, f: 880, v: 'U' },
  { t: 10, d: 1, f: 1046.5, v: 'U' },
  { t: 11, d: 1, f: 880, v: 'U' },
  { t: 12, d: 1, f: 783.99, v: 'E' },
  { t: 13, d: 1, f: 659.25, v: 'E' },
  { t: 14, d: 2, f: 523.25, v: 'E' },
  { t: 16, d: 0.5, f: 523.25, v: 'O' },
  { t: 16.5, d: 0.5, f: 659.25, v: 'O' },
  { t: 17, d: 0.5, f: 783.99, v: 'O' },
  { t: 17.5, d: 0.5, f: 1046.5, v: 'O' },
  { t: 18, d: 1, f: 783.99, v: 'O' },
  { t: 19, d: 1, f: 659.25, v: 'O' },
  { t: 20, d: 0.5, f: 880, v: 'A' },
  { t: 20.5, d: 0.5, f: 783.99, v: 'I' },
  { t: 21, d: 0.5, f: 659.25, v: 'U' },
  { t: 21.5, d: 0.5, f: 587.33, v: 'E' },
  { t: 22, d: 1, f: 523.25, v: 'O' },
  { t: 23, d: 1, f: 523.25, v: 'O' },
  { t: 24, d: 1, f: 523.25, v: 'A' },
  { t: 25, d: 1, f: 659.25, v: 'I' },
  { t: 26, d: 1, f: 783.99, v: 'U' },
  { t: 27, d: 1, f: 1046.5, v: 'O' },
]
export const SONG_BASS: ReadonlyArray<{ t: number; d: number; f: number }> = [
  { t: 0, d: 3.5, f: 130.81 },
  { t: 4, d: 3.5, f: 110 },
  { t: 8, d: 3.5, f: 87.31 },
  { t: 12, d: 3.5, f: 98 },
  { t: 16, d: 3.5, f: 130.81 },
  { t: 20, d: 3.5, f: 110 },
  { t: 24, d: 3.5, f: 87.31 },
  { t: 28, d: 3.5, f: 130.81 },
]
export const SONG_CUES: ReadonlyArray<{ t: number; v: string }> = [
  { t: 0, v: 'A' },
  { t: 4, v: 'I' },
  { t: 8, v: 'U' },
  { t: 12, v: 'E' },
  { t: 16, v: 'O' },
  { t: 20, v: 'A' },
  { t: 24, v: 'O' },
]

const SONG_TOTAL = 32 * SONG_BEAT

export type SongSource = 'loading' | 'youtube' | 'local'

export interface SongTick {
  source: SongSource
  vowel: string
  progress: number
}

interface YouTubePlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setVolume: (v: number) => void
  mute: () => void
  unMute: () => void
  getPlayerState: () => number
  getCurrentTime: () => number
  getDuration: () => number
  destroy: () => void
}

interface YouTubeNamespace {
  Player: new (target: string | HTMLElement, options: unknown) => YouTubePlayer
}

type YouTubeHost = Window & {
  YT?: YouTubeNamespace
  onYouTubeIframeAPIReady?: () => void
}

const PLAYING = 1
const ENDED = 0

let apiPromise: Promise<void> | null = null

function loadApi(): Promise<void> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise<void>((resolve, reject) => {
    const w = window as unknown as YouTubeHost
    if (w.YT?.Player) {
      resolve()
      return
    }
    const previous = w.onYouTubeIframeAPIReady
    const timer = window.setTimeout(() => reject(new Error('api-timeout')), 9000)
    w.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timer)
      try {
        previous?.()
      } catch {
        /* the API callbacks are global; never let one break the page */
      }
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error('api-blocked'))
    }
    document.head.appendChild(script)
  }).catch((error: unknown) => {
    apiPromise = null
    throw error
  })
  return apiPromise
}

/**
 * Owns exactly one play-through of the song and the state the sheet renders.
 * `start()` is safe to call twice; `stop()` is idempotent.
 */
export class VowelSong {
  private player: YouTubePlayer | null = null
  private timers: number[] = []
  private interval = 0
  private stopped = false
  private source: SongSource = 'loading'

  constructor(
    private readonly onTick: (tick: SongTick) => void,
    private readonly onEnd: () => void,
    private readonly soundOn: () => boolean,
  ) {}

  async start() {
    this.stopTimers()
    this.stopped = false
    this.source = 'loading'
    this.emit(0, '')

    if (!this.soundOn()) {
      this.source = 'local'
      this.runLocal(true)
      return
    }
    // A file:// page has no referrer, so YouTube always refuses it.
    if (window.location.protocol === 'file:') {
      this.source = 'local'
      this.runLocal(false)
      return
    }

    const fallback = () => {
      if (this.stopped || this.source === 'local') return
      this.source = 'local'
      this.runLocal(false)
    }
    const watchdog = window.setTimeout(fallback, 3600)
    this.timers.push(watchdog)

    try {
      const player = await this.ensurePlayer()
      if (this.stopped) return
      player.seekTo(0, true)
      player.setVolume(80)
      player.unMute()
      player.playVideo()
      window.clearTimeout(watchdog)
      this.timers.push(
        window.setInterval(() => {
          if (this.stopped || !this.player) return
          let state = -1
          let time = 0
          let duration = 0
          try {
            state = this.player.getPlayerState()
            time = this.player.getCurrentTime()
            duration = this.player.getDuration()
          } catch {
            return
          }
          if (state === PLAYING && this.source !== 'youtube') {
            this.source = 'youtube'
            this.startClock(duration)
          }
          if (state === ENDED) this.finish()
          if (this.source === 'youtube' && duration > 0) this.emit(time / duration, this.vowelAt(time))
        }, 220),
      )
    } catch {
      fallback()
    }
  }

  stop() {
    this.stopped = true
    this.stopTimers()
    this.silence()
    try {
      this.player?.pauseVideo()
    } catch {
      /* the player may already be gone */
    }
  }

  /** Stops and drops the hidden player (the modal is being unmounted). */
  destroy() {
    this.stop()
    try {
      this.player?.destroy()
    } catch {
      /* nothing to destroy */
    }
    this.player = null
  }

  private stopTimers() {
    this.timers.forEach((t) => {
      window.clearTimeout(t)
      window.clearInterval(t)
    })
    this.timers = []
    if (this.interval) window.clearInterval(this.interval)
    this.interval = 0
  }

  private ensurePlayer(): Promise<YouTubePlayer> {
    if (this.player) return Promise.resolve(this.player)
    return loadApi().then(
      () =>
        new Promise<YouTubePlayer>((resolve, reject) => {
          const w = window as unknown as YouTubeHost
          const host = document.getElementById('rak-yt')
          if (!host || !w.YT?.Player) {
            reject(new Error('no-host'))
            return
          }
          host.innerHTML = '<div id="rak-yt-frame"></div>'
          const timer = window.setTimeout(() => reject(new Error('player-timeout')), 12000)
          this.player = new w.YT.Player('rak-yt-frame', {
            width: 320,
            height: 180,
            videoId: SONG_COPY.videoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              playsinline: 1,
              rel: 0,
              modestbranding: 1,
            },
            events: {
              onReady: (event: { target: YouTubePlayer }) => {
                window.clearTimeout(timer)
                try {
                  event.target.setVolume(80)
                } catch {
                  /* volume is cosmetic */
                }
                resolve(event.target)
              },
              onError: () => {
                window.clearTimeout(timer)
                reject(new Error('yt-error'))
              },
            },
          })
        }),
    )
  }

  /** Silent sheet: the animation still runs so the page feels alive. */
  private runLocal(silent: boolean) {
    if (!silent) this.playSynth()
    this.startClock(SONG_TOTAL)
  }

  private playSynth() {
    const bus = audioContext() && masterBus()
    if (!bus) return
    SONG_MELODY.forEach((n) => {
      tone(n.f, n.t * SONG_BEAT, n.d * SONG_BEAT * 0.95, 'triangle', 0.032)
    })
    SONG_BASS.forEach((n) => {
      tone(n.f, n.t * SONG_BEAT, n.d * SONG_BEAT, 'sine', 0.05)
    })
  }

  private startClock(duration: number) {
    window.clearInterval(this.interval)
    const startedAt = performance.now()
    this.interval = window.setInterval(() => {
      if (this.stopped) return
      const elapsed = (performance.now() - startedAt) / 1000
      if (duration > 0 && elapsed >= duration) {
        this.emit(1, '')
        this.finish()
        return
      }
      this.emit(duration > 0 ? elapsed / duration : 0, this.vowelAt(elapsed))
    }, 200)
  }

  private vowelAt(seconds: number) {
    const cycle = SONG_TOTAL
    const phase = seconds % cycle
    let vowel = ''
    for (const cue of SONG_CUES) if (phase >= cue.t * SONG_BEAT) vowel = cue.v
    return vowel
  }

  private emit(progress: number, vowel: string) {
    this.onTick({ source: this.source, vowel, progress: Math.max(0, Math.min(1, progress)) })
  }

  private silence() {
    try {
      this.player?.pauseVideo()
      this.player?.seekTo(0, true)
    } catch {
      /* see stop() */
    }
  }

  private finish() {
    if (this.stopped) return
    this.stop()
    this.onEnd()
  }
}
