/**
 * TASK-9's speaker: a tiny two-oscillator synth, no audio files.
 *
 * The organizer answers like a piece of 1999 plastic — a square blip for a
 * key, a short triangle arpeggio for a finished task, a low buzz for a refusal.
 * The AudioContext is created on the first real gesture, which is also the
 * first moment the toy needs to speak.
 */

export type TodoSoundName =
  | 'add'
  | 'tick'
  | 'untick'
  | 'remove'
  | 'undo'
  | 'level'
  | 'mission'
  | 'clear'
  | 'move'
  | 'refuse'
  | 'ui'

interface ToneOptions {
  type?: OscillatorType
  end?: number
  volume?: number
  delay?: number
}

const MASTER_VOLUME = 0.32

export class TodoSound {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private muted: boolean

  constructor(muted: boolean) {
    this.muted = muted
  }

  /**
   * `pitch` lets the completion blip climb with the combo counter, so a run
   * of quick ticks sounds like a run instead of the same click again.
   */
  play(name: TodoSoundName, pitch = 1) {
    if (this.muted) return
    if (!this.ensure()) return

    const step = Math.min(1.6, Math.max(0.6, pitch))

    switch (name) {
      case 'add':
        this.tone(660, 0.05, { type: 'square', volume: 0.05 })
        this.tone(880, 0.06, { type: 'square', volume: 0.045, delay: 0.055 })
        break
      case 'tick':
        this.arp([784 * step, 1046 * step], 0.06, 'triangle', 0.075)
        break
      case 'untick':
        this.tone(520, 0.07, { type: 'triangle', end: 392, volume: 0.06 })
        break
      case 'remove':
        this.tone(190, 0.1, { type: 'square', end: 96, volume: 0.06 })
        break
      case 'undo':
        this.tone(330, 0.06, { type: 'triangle', volume: 0.05 })
        this.tone(520, 0.08, { type: 'triangle', volume: 0.05, delay: 0.06 })
        break
      case 'level':
        this.arp([523, 659, 784, 1046, 1318], 0.09, 'square', 0.055)
        break
      case 'mission':
        this.arp([659, 784, 988, 1318], 0.1, 'triangle', 0.07)
        break
      case 'clear':
        this.tone(740, 0.07, { type: 'triangle', volume: 0.05 })
        this.tone(560, 0.07, { type: 'triangle', volume: 0.05, delay: 0.07 })
        this.tone(420, 0.1, { type: 'triangle', volume: 0.05, delay: 0.14 })
        break
      case 'move':
        this.tone(900, 0.02, { type: 'square', volume: 0.022 })
        break
      case 'refuse':
        this.tone(160, 0.12, { type: 'sawtooth', end: 110, volume: 0.055 })
        break
      case 'ui':
        this.tone(720, 0.03, { type: 'square', volume: 0.035 })
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
      this.tone(note, gap * 1.3, {
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
