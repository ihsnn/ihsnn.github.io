import type { LayoutSound, SoundTexture } from '../../content/photobooth'

/**
 * The photobooth's WebAudio board.
 *
 * No audio files: shutter, countdown, flashes and every layout signature are
 * oscillators and filtered noise, so twenty-five strips cost a few kilobytes.
 * The context is created on the first gesture (starting the camera, picking a
 * card) to satisfy autoplay policies.
 */

export const BOOTH_MUTED_KEY = 'ihsnn:photobooth:muted'

const MASTER_VOLUME = 0.5

interface ToneOptions {
  type?: OscillatorType
  end?: number
  volume?: number
  delay?: number
  attack?: number
}

interface NoiseOptions {
  volume?: number
  delay?: number
  duration?: number
  filter?: BiquadFilterType
  frequency?: number
  q?: number
}

export class BoothSound {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private noiseBuffer: AudioBuffer | null = null
  private muted: boolean

  constructor(muted: boolean) {
    this.muted = muted
  }

  /** The click-whirr of a photobooth shutter. */
  playShutter() {
    this.noise(0.09, {
      volume: 0.24,
      filter: 'bandpass',
      frequency: 2400,
      q: 0.7,
    })
    this.tone(1200, 0.035, { end: 320, type: 'square', volume: 0.11 })
    this.tone(140, 0.07, { end: 70, type: 'triangle', volume: 0.12 })
    this.noise(0.05, {
      volume: 0.16,
      delay: 0.085,
      filter: 'highpass',
      frequency: 1800,
    })
  }

  /** The little flash chirp after the frame is safely in the slot. */
  playFlash() {
    this.tone(1760, 0.14, { end: 2640, type: 'triangle', volume: 0.07 })
    this.tone(2640, 0.18, {
      end: 3520,
      type: 'sine',
      volume: 0.04,
      delay: 0.02,
    })
  }

  /** Countdown tick; `step` goes 3 → 1. */
  playTick(step: number) {
    const frequency = 520 + (3 - Math.min(3, step)) * 120
    this.tone(frequency, 0.07, { type: 'square', volume: 0.07 })
  }

  playUi() {
    this.tone(880, 0.035, { type: 'square', volume: 0.05 })
  }

  /** The selected layout's two-note signature. */
  playLayout(sound: LayoutSound, stage: 'select' | 'done') {
    const notes = stage === 'select' ? sound.select : sound.done
    const gap = stage === 'select' ? 0.085 : 0.105
    this.texture(sound.texture, stage === 'select' ? 0 : 0.05)
    notes.forEach((note, index) => {
      this.tone(note, gap * 1.35, {
        type: sound.wave,
        volume: stage === 'select' ? 0.08 : 0.1,
        delay: index * gap,
        end: note * 1.005,
      })
      if (stage === 'done' && index === notes.length - 1) {
        this.tone(note / 2, 0.36, {
          type: 'triangle',
          volume: 0.05,
          delay: index * gap,
        })
      }
    })
    if (stage === 'done') {
      this.tone(notes[notes.length - 1] * 2, 0.4, {
        type: 'sine',
        volume: 0.035,
        delay: notes.length * gap,
        end: notes[notes.length - 1] * 2.02,
      })
    }
  }

  playDownload(sound: LayoutSound) {
    this.noise(0.12, { volume: 0.08, filter: 'highpass', frequency: 1400 })
    this.playLayout(sound, 'done')
  }

  setMuted(muted: boolean) {
    this.muted = muted
    const context = this.ensure()
    if (context && this.master) {
      this.master.gain.setTargetAtTime(
        muted ? 0 : MASTER_VOLUME,
        context.currentTime,
        0.02,
      )
    }
    if (!muted) this.playUi()
  }

  dispose() {
    const context = this.context
    this.context = null
    this.master = null
    this.noiseBuffer = null
    if (context) void context.close().catch(() => undefined)
  }

  private texture(texture: SoundTexture | undefined, delay: number) {
    if (!texture) return
    switch (texture) {
      case 'sparkle':
        for (let i = 0; i < 4; i += 1) {
          this.tone(2200 + i * 420, 0.09, {
            type: 'sine',
            volume: 0.035,
            delay: delay + i * 0.035,
            end: 2300 + i * 460,
          })
        }
        break
      case 'tape':
        this.noise(0.3, {
          volume: 0.05,
          delay,
          filter: 'lowpass',
          frequency: 1800,
        })
        this.tone(70, 0.18, {
          type: 'sine',
          volume: 0.04,
          delay,
          end: 55,
        })
        break
      case 'noise':
        this.noise(0.16, {
          volume: 0.1,
          delay,
          filter: 'bandpass',
          frequency: 700,
          q: 1.4,
        })
        break
      case 'coin':
        this.tone(1568, 0.06, { type: 'square', volume: 0.06, delay })
        this.tone(2093, 0.09, {
          type: 'square',
          volume: 0.05,
          delay: delay + 0.06,
        })
        break
      case 'click':
        this.noise(0.035, {
          volume: 0.1,
          delay,
          filter: 'highpass',
          frequency: 2600,
        })
        break
      case 'stamp':
        this.tone(96, 0.18, {
          type: 'sine',
          volume: 0.16,
          delay,
          end: 44,
        })
        this.noise(0.08, {
          volume: 0.08,
          delay,
          filter: 'lowpass',
          frequency: 500,
        })
        break
      case 'projector':
        for (let i = 0; i < 5; i += 1) {
          this.noise(0.028, {
            volume: 0.04,
            delay: delay + i * 0.045,
            filter: 'bandpass',
            frequency: 1200,
            q: 2,
          })
        }
        break
    }
  }

  private tone(frequency: number, duration: number, options: ToneOptions = {}) {
    if (this.muted) return
    const context = this.ensure()
    if (!context || !this.master) return
    const {
      type = 'square',
      end = frequency,
      volume = 0.08,
      delay = 0,
      attack = 0.008,
    } = options

    const start = context.currentTime + delay
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), start)
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, end),
      start + duration,
    )
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    oscillator.connect(gain)
    gain.connect(this.master)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.03)
  }

  private noise(duration: number, options: NoiseOptions = {}) {
    if (this.muted) return
    const context = this.ensure()
    if (!context || !this.master) return
    const {
      volume = 0.08,
      delay = 0,
      filter = 'highpass',
      frequency = 1000,
      q = 1,
    } = options

    const start = context.currentTime + delay
    const source = context.createBufferSource()
    source.buffer = this.ensureNoise(context)
    const biquad = context.createBiquadFilter()
    biquad.type = filter
    biquad.frequency.value = frequency
    biquad.Q.value = q
    const gain = context.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    source.connect(biquad)
    biquad.connect(gain)
    gain.connect(this.master)
    source.start(start)
    source.stop(start + duration + 0.02)
  }

  private ensureNoise(context: AudioContext): AudioBuffer {
    if (this.noiseBuffer) return this.noiseBuffer
    const length = Math.floor(context.sampleRate * 0.5)
    const buffer = context.createBuffer(1, length, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1
    }
    this.noiseBuffer = buffer
    return buffer
  }

  private ensure(): AudioContext | null {
    if (this.context) {
      if (this.context.state === 'suspended' && !this.muted) {
        void this.context.resume().catch(() => undefined)
      }
      return this.context
    }
    if (this.muted) return null
    try {
      const context = new AudioContext()
      const master = context.createGain()
      master.gain.value = MASTER_VOLUME
      master.connect(context.destination)
      this.context = context
      this.master = master
      return context
    } catch {
      return null
    }
  }
}
