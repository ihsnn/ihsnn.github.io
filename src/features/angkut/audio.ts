/**
 * ANGKUT's diesel band: two detuned oscillators behind a low-pass for the
 * engine, plus a handful of synthesised thumps, coins and bells. No audio files.
 */

export type AngkutSoundName =
  | 'start'
  | 'coin'
  | 'fuel'
  | 'land'
  | 'slide'
  | 'air'
  | 'stall'
  | 'flip'
  | 'finish'
  | 'record'
  | 'ui'

interface ToneOptions {
  type?: OscillatorType
  end?: number
  volume?: number
  delay?: number
}

const MASTER_VOLUME = 0.5
const IDLE_FREQUENCY = 48

interface EngineNodes {
  growl: OscillatorNode
  sub: OscillatorNode
  filter: BiquadFilterNode
  gain: GainNode
}

export class AngkutSound {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private engine: EngineNodes | null = null
  private muted: boolean

  constructor(muted: boolean) {
    this.muted = muted
  }

  play(name: AngkutSoundName) {
    if (this.muted) return
    if (!this.ensure()) return

    switch (name) {
      case 'start':
        this.noise(0.32, 0.06, 700)
        this.tone(70, 0.4, { type: 'sawtooth', end: 120, volume: 0.1 })
        this.tone(140, 0.3, { type: 'square', end: 210, volume: 0.05, delay: 0.12 })
        break
      case 'coin':
        this.tone(1_320, 0.06, { type: 'square', volume: 0.06 })
        this.tone(1_760, 0.12, { type: 'square', volume: 0.05, delay: 0.06 })
        break
      case 'fuel':
        this.tone(300, 0.1, { type: 'sine', end: 420, volume: 0.08 })
        this.tone(520, 0.14, { type: 'sine', end: 640, volume: 0.05, delay: 0.08 })
        break
      case 'land':
        this.noise(0.16, 0.1, 240)
        this.tone(90, 0.16, { type: 'triangle', end: 48, volume: 0.1 })
        break
      case 'slide':
        this.noise(0.3, 0.05, 900)
        this.tone(160, 0.22, { type: 'sawtooth', end: 90, volume: 0.05 })
        break
      case 'air':
        this.noise(0.3, 0.035, 2_400)
        break
      case 'stall':
        this.tone(120, 0.35, { type: 'sawtooth', end: 44, volume: 0.09 })
        this.noise(0.2, 0.05, 400)
        break
      case 'flip':
        this.noise(0.5, 0.13, 180)
        this.tone(110, 0.5, { type: 'square', end: 38, volume: 0.09 })
        break
      case 'finish':
        this.arp([523, 659, 784, 1046], 0.11, 'triangle', 0.09)
        this.tone(1_308, 0.4, { type: 'triangle', volume: 0.07, delay: 0.44 })
        break
      case 'record':
        this.arp([659, 784, 988, 1318, 1568], 0.08, 'square', 0.05)
        break
      case 'ui':
        this.tone(520, 0.04, { type: 'square', volume: 0.035 })
        break
    }
  }

  /**
   * Called every frame while the cartridge is on screen. `rpm` and `load` are
   * 0–1; `running` turns the idle rumble off when the run is over.
   */
  engineSound(rpm: number, load: number, running: boolean) {
    if (this.muted) return
    const context = this.ensure()
    if (!context || !this.engine) return
    const now = context.currentTime
    const speed = Math.min(1, Math.max(0, rpm))
    const weight = Math.min(1, Math.max(0, load))
    const target = running ? 0.035 + speed * 0.05 + weight * 0.09 : 0
    this.engine.gain.gain.setTargetAtTime(target, now, 0.08)
    const frequency = IDLE_FREQUENCY + speed * 72 + weight * 8
    this.engine.growl.frequency.setTargetAtTime(frequency, now, 0.09)
    this.engine.sub.frequency.setTargetAtTime(frequency * 0.5, now, 0.09)
    this.engine.filter.frequency.setTargetAtTime(
      300 + speed * 900 + weight * 260,
      now,
      0.12,
    )
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
    this.engine = null
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

  private noise(duration: number, volume: number, cutoff: number) {
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
    filter.type = 'lowpass'
    filter.frequency.value = cutoff

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
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
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

      const growl = context.createOscillator()
      growl.type = 'sawtooth'
      growl.frequency.value = IDLE_FREQUENCY
      const sub = context.createOscillator()
      sub.type = 'square'
      sub.frequency.value = IDLE_FREQUENCY * 0.5

      const filter = context.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 340
      filter.Q.value = 5

      const gain = context.createGain()
      gain.gain.value = 0

      growl.connect(filter)
      sub.connect(filter)
      filter.connect(gain)
      gain.connect(master)
      growl.start()
      sub.start()

      this.engine = { growl, sub, filter, gain }
      return context
    } catch {
      return null
    }
  }
}
