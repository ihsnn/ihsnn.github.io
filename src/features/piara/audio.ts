/**
 * PIARA's voice: a two-oscillator toy speaker, no audio files.
 *
 * The creature is small, so it gets short triangle chirps rather than the
 * arcade's square-wave stabs. The context is created on the first gesture
 * (a button press), which is also when the toy first needs to make a sound.
 */

export type PiaraSoundName =
  | 'tap'
  | 'hatch'
  | 'name'
  | 'feed'
  | 'play'
  | 'sleep'
  | 'wake'
  | 'clean'
  | 'evolve'
  | 'refuse'
  | 'ui'

interface ToneOptions {
  type?: OscillatorType
  end?: number
  volume?: number
  delay?: number
}

const MASTER_VOLUME = 0.4

export class PiaraSound {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private muted: boolean

  constructor(muted: boolean) {
    this.muted = muted
  }

  play(name: PiaraSoundName) {
    if (this.muted) return
    if (!this.ensure()) return

    switch (name) {
      case 'tap':
        this.tone(620, 0.04, { volume: 0.06 })
        break
      case 'hatch':
        this.arp([330, 415, 523, 659], 0.1, 'triangle', 0.09)
        break
      case 'name':
        this.arp([523, 659, 784], 0.1, 'triangle', 0.08)
        break
      case 'feed':
        this.tone(220, 0.08, { type: 'triangle', volume: 0.1 })
        this.tone(262, 0.08, { type: 'triangle', volume: 0.1, delay: 0.1 })
        this.tone(196, 0.12, { type: 'triangle', volume: 0.09, delay: 0.2 })
        break
      case 'play':
        this.arp([523, 659, 784], 0.07, 'square', 0.06)
        break
      case 'sleep':
        this.tone(440, 0.2, { type: 'sine', end: 330, volume: 0.09 })
        this.tone(330, 0.26, { type: 'sine', end: 220, volume: 0.08, delay: 0.18 })
        break
      case 'wake':
        this.arp([392, 523, 659], 0.08, 'triangle', 0.08)
        break
      case 'clean':
        this.tone(900, 0.2, { type: 'triangle', end: 300, volume: 0.07 })
        this.tone(784, 0.05, { type: 'triangle', volume: 0.06, delay: 0.14 })
        this.tone(1046, 0.05, { type: 'triangle', volume: 0.06, delay: 0.2 })
        break
      case 'evolve':
        this.arp([523, 659, 784, 1046, 1318], 0.09, 'square', 0.07)
        break
      case 'refuse':
        this.tone(160, 0.12, { type: 'sawtooth', end: 110, volume: 0.07 })
        break
      case 'ui':
        this.tone(720, 0.03, { volume: 0.04 })
        break
    }
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
    if (!muted) this.play('ui')
  }

  dispose() {
    const context = this.context
    this.context = null
    this.master = null
    if (context) void context.close().catch(() => undefined)
  }

  private arp(
    notes: number[],
    gap: number,
    type: OscillatorType,
    volume: number,
  ) {
    notes.forEach((note, index) => {
      this.tone(note, gap * 1.2, {
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
      volume = 0.08,
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
