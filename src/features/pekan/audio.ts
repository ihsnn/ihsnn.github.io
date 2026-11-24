/**
 * PEKAN RAYA — the cartridge's own little speaker.
 *
 * Short synthetic cues only: no audio files, no music (the soundtrack is a later
 * milestone). The context is created on the first gesture, as browsers require.
 */

export type SoundName =
  | 'blip'
  | 'confirm'
  | 'back'
  | 'talk'
  | 'step'
  | 'bump'
  | 'warp'
  | 'bow'
  | 'hit'
  | 'win'
  | 'lose'
  | 'scroll'
  | 'go'

export class PekanSound {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private muted: boolean

  constructor(muted: boolean) {
    this.muted = muted
  }

  unlock(): void {
    if (this.context) {
      if (this.context.state === 'suspended') void this.context.resume()
      return
    }
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return
      const context = new Ctor()
      const master = context.createGain()
      master.gain.value = 0.5
      master.connect(context.destination)
      this.context = context
      this.master = master
    } catch {
      this.context = null
      this.master = null
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted
  }

  dispose(): void {
    if (this.context) {
      void this.context.close().catch(() => undefined)
    }
    this.context = null
    this.master = null
  }

  play(name: SoundName): void {
    if (this.muted) return
    if (!this.context) this.unlock()
    if (!this.context || !this.master) return

    switch (name) {
      case 'blip':
        this.tone(660, 0.05, 'square', 0.035)
        break
      case 'confirm':
        this.tone(520, 0.06, 'square', 0.04)
        this.tone(780, 0.08, 'square', 0.035, 0.06)
        break
      case 'back':
        this.tone(420, 0.07, 'square', 0.035)
        this.tone(300, 0.09, 'square', 0.03, 0.06)
        break
      case 'talk':
        this.tone(440 + Math.random() * 60, 0.035, 'triangle', 0.035)
        break
      case 'step':
        this.tone(180, 0.02, 'square', 0.01)
        break
      case 'bump':
        this.tone(120, 0.06, 'square', 0.03)
        break
      case 'warp':
        this.tone(320, 0.18, 'triangle', 0.05, 0, 720)
        break
      case 'bow':
        this.tone(900, 0.12, 'sawtooth', 0.035, 0, 220)
        break
      case 'hit':
        this.tone(880, 0.06, 'square', 0.045)
        this.tone(1320, 0.09, 'square', 0.03, 0.04)
        break
      case 'win':
        this.tone(523, 0.09, 'square', 0.045)
        this.tone(659, 0.09, 'square', 0.045, 0.09)
        this.tone(784, 0.09, 'square', 0.045, 0.18)
        this.tone(1046, 0.16, 'square', 0.045, 0.27)
        break
      case 'lose':
        this.tone(392, 0.12, 'triangle', 0.04)
        this.tone(330, 0.12, 'triangle', 0.04, 0.12)
        this.tone(262, 0.2, 'triangle', 0.04, 0.24)
        break
      case 'scroll':
        this.tone(1046, 0.07, 'square', 0.04)
        this.tone(1318, 0.07, 'square', 0.04, 0.07)
        this.tone(1568, 0.14, 'square', 0.04, 0.14)
        break
      case 'go':
        this.tone(660, 0.08, 'square', 0.045)
        this.tone(990, 0.14, 'square', 0.045, 0.08)
        break
    }
  }

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    gain: number,
    delay = 0,
    slideTo?: number,
  ): void {
    const context = this.context
    const master = this.master
    if (!context || !master) return

    const start = context.currentTime + delay
    const oscillator = context.createOscillator()
    const envelope = context.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, start)
    if (slideTo !== undefined) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(40, slideTo),
        start + duration,
      )
    }

    envelope.gain.setValueAtTime(0.0001, start)
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.012)
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    oscillator.connect(envelope)
    envelope.connect(master)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.05)
  }
}
