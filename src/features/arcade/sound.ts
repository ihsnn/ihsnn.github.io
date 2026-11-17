/**
 * Tiny WebAudio arcade board.
 *
 * No audio files: every blip is an oscillator with a short envelope, so the
 * cartridge stays a few kilobytes and can retune a brick by combo without
 * shipping a sample per note. The AudioContext is created on the first gesture
 * (starting a game) to satisfy autoplay policy.
 */

export type ArcadeSoundName =
  | 'start'
  | 'serve'
  | 'paddle'
  | 'brick'
  | 'tough'
  | 'lose'
  | 'power'
  | 'level'
  | 'gameover'
  | 'pause'
  | 'ui'

interface ToneOptions {
  type?: OscillatorType
  end?: number
  volume?: number
  delay?: number
}

const MASTER_VOLUME = 0.55

export class ArcadeSound {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private muted: boolean

  constructor(muted: boolean) {
    this.muted = muted
  }

  play(name: ArcadeSoundName, pitch = 0) {
    if (this.muted) return
    const context = this.ensure()
    if (!context) return

    switch (name) {
      case 'start':
        this.arp([262, 330, 392, 523], 0.075, 'square', 0.1)
        break
      case 'serve':
        this.tone(220, 0.16, { end: 470, type: 'square', volume: 0.12 })
        break
      case 'paddle':
        this.tone(170, 0.055, { end: 250, type: 'square', volume: 0.12 })
        break
      case 'brick': {
        const base = 380 + Math.min(pitch, 8) * 48
        this.tone(base, 0.055, { end: base * 1.12, type: 'square', volume: 0.09 })
        break
      }
      case 'tough':
        this.tone(150 + Math.min(pitch, 8) * 18, 0.08, {
          end: 110,
          type: 'sawtooth',
          volume: 0.1,
        })
        break
      case 'lose':
        this.tone(280, 0.46, { end: 65, type: 'sawtooth', volume: 0.12 })
        this.tone(140, 0.46, { end: 48, type: 'square', volume: 0.06, delay: 0.04 })
        break
      case 'power':
        this.arp([523, 659, 784, 1046], 0.055, 'triangle', 0.11)
        break
      case 'level':
        this.arp([392, 523, 659, 784, 1046], 0.085, 'square', 0.09)
        break
      case 'gameover':
        this.arp([392, 330, 262, 196, 131], 0.17, 'sawtooth', 0.085)
        break
      case 'pause':
        this.tone(330, 0.08, { end: 220, type: 'square', volume: 0.08 })
        break
      case 'ui':
        this.tone(760, 0.04, { type: 'square', volume: 0.06 })
        break
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted
    const context = this.ensure()
    if (context && this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : MASTER_VOLUME, context.currentTime, 0.02)
    }
    if (!muted) this.play('ui')
  }

  dispose() {
    const context = this.context
    this.context = null
    this.master = null
    if (context) void context.close().catch(() => undefined)
  }

  private arp(notes: number[], gap: number, type: OscillatorType, volume: number) {
    notes.forEach((note, index) => {
      this.tone(note, gap * 1.15, {
        type,
        volume,
        delay: index * gap,
        end: note * 1.01,
      })
    })
  }

  private tone(frequency: number, duration: number, options: ToneOptions = {}) {
    const context = this.ensure()
    if (!context || !this.master) return
    const {
      type = 'square',
      end = frequency,
      volume = 0.1,
      delay = 0,
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
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    oscillator.connect(gain)
    gain.connect(this.master)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.03)
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
