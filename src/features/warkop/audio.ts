/**
 * WARKOP's tiny kitchen band: a triangle-wave bell, a filtered-noise sizzle
 * and a cash-register cha-ching, all synthesised on the first gesture.
 */

export type WarkopSoundName =
  | 'open'
  | 'cook'
  | 'ready'
  | 'serve'
  | 'miss'
  | 'busy'
  | 'close'
  | 'record'
  | 'ui'

interface ToneOptions {
  type?: OscillatorType
  end?: number
  volume?: number
  delay?: number
}

const MASTER_VOLUME = 0.42

export class WarkopSound {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private muted: boolean

  constructor(muted: boolean) {
    this.muted = muted
  }

  play(name: WarkopSoundName) {
    if (this.muted) return
    if (!this.ensure()) return

    switch (name) {
      case 'open':
        this.tone(784, 0.12, { type: 'triangle', volume: 0.1 })
        this.tone(1046, 0.22, { type: 'triangle', volume: 0.09, delay: 0.13 })
        break
      case 'cook':
        this.noise(0.14, 0.07)
        this.tone(180, 0.06, { type: 'square', volume: 0.04 })
        break
      case 'ready':
        this.tone(1046, 0.06, { type: 'triangle', volume: 0.07 })
        this.tone(1318, 0.1, { type: 'triangle', volume: 0.07, delay: 0.07 })
        break
      case 'serve':
        this.tone(1568, 0.05, { type: 'square', volume: 0.05 })
        this.tone(2093, 0.08, { type: 'square', volume: 0.04, delay: 0.05 })
        this.tone(392, 0.12, { type: 'triangle', volume: 0.06, delay: 0.05 })
        break
      case 'miss':
        this.tone(220, 0.24, { type: 'sawtooth', end: 110, volume: 0.07 })
        break
      case 'busy':
        this.tone(150, 0.09, { type: 'square', end: 110, volume: 0.05 })
        break
      case 'close':
        this.tone(392, 0.5, { type: 'triangle', end: 196, volume: 0.1 })
        this.tone(196, 0.55, { type: 'sine', end: 98, volume: 0.06, delay: 0.05 })
        break
      case 'record':
        this.arp([523, 659, 784, 1046, 1318], 0.09, 'triangle', 0.08)
        break
      case 'ui':
        this.tone(640, 0.04, { type: 'square', volume: 0.04 })
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

  private noise(duration: number, volume: number) {
    const context = this.ensure()
    if (!context || !this.master) return

    const frames = Math.floor(context.sampleRate * duration)
    const buffer = context.createBuffer(1, frames, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let index = 0; index < frames; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / frames)
    }

    const source = context.createBufferSource()
    source.buffer = buffer

    const filter = context.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2_200
    filter.Q.value = 0.8

    const gain = context.createGain()
    gain.gain.value = volume

    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.master)
    source.start()
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
