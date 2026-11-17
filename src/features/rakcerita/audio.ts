/**
 * The cartridge's own synth: every sound is a couple of oscillators or a
 * noise burst, so the books ship without audio files. One AudioContext for
 * the whole feature; it is created on the first user gesture and resumed if
 * the browser parked it.
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null

export function audioContext(): AudioContext | null {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
  return ctx
}

export const masterBus = () => master

export function tone(
  f1: number,
  f2: number,
  dur = 0.18,
  type: OscillatorType = 'sine',
  vol = 0.16,
  when = 0,
) {
  const a = audioContext()
  if (!a || !master) return
  try {
    const t0 = a.currentTime + when
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = type
    o.frequency.setValueAtTime(f1, t0)
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t0 + dur)
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    o.connect(g)
    g.connect(master)
    o.start(t0)
    o.stop(t0 + dur + 0.03)
  } catch {
    /* audio is decoration: a blocked context must never break a page */
  }
}

export function noiseBurst(dur = 0.25, vol = 0.18, freq = 900) {
  const a = audioContext()
  if (!a || !master) return
  try {
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
    const src = a.createBufferSource()
    src.buffer = buf
    const f = a.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = freq
    f.Q.value = 0.8
    const g = a.createGain()
    g.gain.value = vol
    src.connect(f)
    f.connect(g)
    g.connect(master)
    src.start()
  } catch {
    /* see tone() */
  }
}

export type SfxName =
  | 'pop'
  | 'chime'
  | 'sparkle'
  | 'star'
  | 'click'
  | 'door'
  | 'print'
  | 'heart'
  | 'cuss'
  | 'giggle'
  | 'roar'
  | 'drive'
  | 'wrong'
  | 'twinkle'
  | 'lamp'
  | 'honk'
  | 'water'
  | 'pour'
  | 'engine'
  | 'open'
  | 'page'
  | `ding${number}`

export function playSfx(name: SfxName, enabled = true) {
  if (!enabled) return
  try {
    if (name.startsWith('ding')) {
      const n = Number(name.slice(4)) || 1
      tone(640 + n * 110, 0, 0.28, 'sine', 0.14)
      setTimeout(() => tone(960 + n * 110, 0, 0.35, 'sine', 0.1), 90)
      return
    }
    switch (name) {
      case 'pop':
        tone(420, 720, 0.12, 'sine', 0.2)
        break
      case 'chime':
        tone(784, 0, 0.35, 'sine', 0.13)
        tone(1046, 0, 0.5, 'sine', 0.1, 0.1)
        break
      case 'sparkle':
        ;[880, 1174, 1396, 1760].forEach((f, i) => tone(f, 0, 0.22, 'triangle', 0.08, i * 0.055))
        break
      case 'star':
        tone(1318, 0, 0.4, 'sine', 0.1)
        break
      case 'click':
        tone(1600, 900, 0.05, 'square', 0.06)
        break
      case 'door':
        noiseBurst(0.35, 0.1, 500)
        tone(320, 210, 0.45, 'sine', 0.09)
        break
      case 'print':
        ;[0, 0.09, 0.18].forEach((t) => tone(240, 200, 0.06, 'square', 0.05, t))
        break
      case 'heart':
        tone(74, 58, 0.18, 'sine', 0.35)
        tone(70, 54, 0.22, 'sine', 0.3, 0.28)
        break
      case 'cuss':
        tone(1400, 520, 0.16, 'triangle', 0.1)
        noiseBurst(0.08, 0.06, 2400)
        break
      case 'giggle':
        ;[740, 980, 860].forEach((f, i) => tone(f, f * 1.1, 0.1, 'sine', 0.09, i * 0.11))
        break
      case 'roar':
        tone(150, 90, 0.4, 'sawtooth', 0.12)
        break
      case 'drive':
        tone(90, 70, 0.5, 'sawtooth', 0.06)
        break
      case 'wrong':
        tone(240, 200, 0.16, 'square', 0.07)
        tone(200, 170, 0.22, 'square', 0.06, 0.12)
        break
      case 'twinkle':
        tone(1568, 0, 0.3, 'sine', 0.07)
        tone(2093, 0, 0.35, 'sine', 0.05, 0.08)
        break
      case 'lamp':
        tone(520, 260, 0.18, 'sine', 0.09)
        break
      case 'honk':
        tone(392, 0, 0.16, 'square', 0.07)
        tone(523, 0, 0.16, 'square', 0.06)
        break
      case 'water':
        noiseBurst(0.5, 0.09, 1500)
        tone(640, 900, 0.4, 'sine', 0.05)
        break
      case 'pour':
        tone(500, 720, 0.5, 'sine', 0.07)
        noiseBurst(0.4, 0.04, 1800)
        break
      case 'engine':
        tone(92, 150, 0.7, 'sawtooth', 0.1)
        tone(180, 240, 0.5, 'square', 0.04, 0.1)
        break
      case 'open':
        tone(520, 780, 0.18, 'sine', 0.12)
        break
      case 'page':
        noiseBurst(0.18, 0.05, 1200)
        break
      default:
        tone(600, 700, 0.1, 'sine', 0.09)
    }
  } catch {
    /* see tone() */
  }
}

export function sunSfx(enabled = true) {
  if (!enabled) return
  tone(660, 990, 0.5, 'sine', 0.08)
  tone(1320, 0, 0.6, 'sine', 0.05, 0.2)
}
