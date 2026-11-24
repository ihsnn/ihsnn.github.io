import type { SoundId } from '../../content/suara'
import { SUARA_SOUNDS } from '../../lib/assets'

/**
 * TELINGA EMAS's speaker.
 *
 * Every sound is synthesised on the spot — there is not a single audio file in
 * this cartridge. The recipes below lean on three cheap tricks that carry most
 * of the recognition:
 *
 *  - a pitched oscillator with a glide (engines, horns, sirens, moos),
 *  - a band-passed noise burst (water, rain, wind, thunder, footsteps),
 *  - amplitude modulation at 15–30 Hz, which is what makes a buzz sound nasal
 *    and animal-like (ducks, frogs, alarm clocks, bells).
 *
 * One context, one master bus, one playing sound at a time. `play()` returns
 * the length in seconds so the UI can keep the button lit for exactly as long
 * as it takes.
 */

interface Bag {
  ctx: AudioContext
  master: GainNode
  noise: AudioBuffer
}

type Point = readonly [number, number]

interface FilterSpec {
  type?: BiquadFilterType
  freq: number
  to?: number
  q?: number
}

interface ToneSpec {
  type?: OscillatorType
  gain?: number
  attack?: number
  release?: number
  to?: number
  points?: readonly Point[]
  filter?: FilterSpec
  vibrato?: { rate: number; depth: number; delay?: number }
  am?: { rate: number; depth: number }
  detune?: number
  pan?: number
}

interface NoiseSpec {
  gain?: number
  attack?: number
  release?: number
  type?: BiquadFilterType
  freq: number
  to?: number
  q?: number
  pan?: number
}

const MASTER_GAIN = 0.85

let bag: Bag | null = null
let out: GainNode | null = null
let muted = false

function buildNoise(ctx: AudioContext): AudioBuffer {
  const seconds = 2
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let seed = 0x2f6e2b1
  for (let i = 0; i < data.length; i += 1) {
    // xorshift keeps the noise identical on every visit — no Math.random
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    data[i] = ((seed >>> 0) / 0xffffffff) * 2 - 1
  }
  return buffer
}

function ensure(): Bag {
  if (bag) {
    if (bag.ctx.state === 'suspended') void bag.ctx.resume()
    return bag
  }

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  const ctx = new Ctor()
  const master = ctx.createGain()
  master.gain.value = muted ? 0 : MASTER_GAIN

  const limiter = ctx.createDynamicsCompressor()
  limiter.threshold.value = -16
  limiter.knee.value = 20
  limiter.ratio.value = 8
  limiter.attack.value = 0.004
  limiter.release.value = 0.2

  master.connect(limiter)
  limiter.connect(ctx.destination)

  bag = { ctx, master, noise: buildNoise(ctx) }
  return bag
}

function destination(): AudioNode {
  return out ?? ensure().master
}

function tone(start: number, freq: number, duration: number, spec: ToneSpec = {}) {
  const ctx = ensure().ctx
  const osc = ctx.createOscillator()
  osc.type = spec.type ?? 'sine'
  osc.frequency.setValueAtTime(Math.max(1, freq), start)
  if (spec.detune) osc.detune.value = spec.detune

  const glideEnd = start + duration * 0.92
  if (spec.points) {
    for (const [offset, value] of spec.points) {
      // A ramp to `start` would land on the initial setValueAtTime; skip it.
      if (offset <= 0) continue
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, value),
        start + Math.min(offset, duration),
      )
    }
  } else if (spec.to) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.to), glideEnd)
  }

  let node: AudioNode = osc

  if (spec.filter) {
    const filter = ctx.createBiquadFilter()
    filter.type = spec.filter.type ?? 'lowpass'
    filter.Q.value = spec.filter.q ?? 1
    filter.frequency.setValueAtTime(spec.filter.freq, start)
    if (spec.filter.to) {
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(40, spec.filter.to),
        glideEnd,
      )
    }
    node.connect(filter)
    node = filter
  }

  if (spec.am) {
    const trim = ctx.createGain()
    trim.gain.value = 1 - spec.am.depth / 2
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = spec.am.rate
    const depth = ctx.createGain()
    depth.gain.value = spec.am.depth / 2
    lfo.connect(depth)
    depth.connect(trim.gain)
    node.connect(trim)
    node = trim
    lfo.start(start)
    lfo.stop(start + duration + 0.05)
  }

  const envelope = ctx.createGain()
  envelope.gain.value = 0.0001
  node.connect(envelope)
  node = envelope

  if (spec.pan !== undefined) {
    const panner = ctx.createStereoPanner()
    panner.pan.value = spec.pan
    node.connect(panner)
    node = panner
  }

  node.connect(destination())

  const attack = Math.max(0.002, spec.attack ?? 0.012)
  const release = Math.max(0.01, spec.release ?? duration * 0.45)
  const hold = Math.max(0.001, duration - attack - release)
  const peak = Math.max(0.0003, spec.gain ?? 0.2)

  envelope.gain.setValueAtTime(0.0001, start)
  envelope.gain.exponentialRampToValueAtTime(peak, start + attack)
  envelope.gain.setValueAtTime(peak, start + attack + hold)
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  if (spec.vibrato) {
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = spec.vibrato.rate
    const depth = ctx.createGain()
    depth.gain.setValueAtTime(0, start)
    depth.gain.linearRampToValueAtTime(
      spec.vibrato.depth,
      start + (spec.vibrato.delay ?? 0.08),
    )
    lfo.connect(depth)
    depth.connect(osc.frequency)
    lfo.start(start)
    lfo.stop(start + duration + 0.05)
  }

  osc.start(start)
  osc.stop(start + duration + 0.05)
}

function noise(start: number, duration: number, spec: NoiseSpec) {
  const ctx = ensure().ctx
  const source = ctx.createBufferSource()
  source.buffer = ensure().noise
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = spec.type ?? 'bandpass'
  filter.Q.value = spec.q ?? 1
  filter.frequency.setValueAtTime(spec.freq, start)
  if (spec.to) {
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(40, spec.to),
      start + duration * 0.95,
    )
  }

  const envelope = ctx.createGain()
  envelope.gain.value = 0.0001
  source.connect(filter)
  filter.connect(envelope)

  let node: AudioNode = envelope
  if (spec.pan !== undefined) {
    const panner = ctx.createStereoPanner()
    panner.pan.value = spec.pan
    node.connect(panner)
    node = panner
  }
  node.connect(destination())

  const attack = Math.max(0.002, spec.attack ?? 0.01)
  const release = Math.max(0.010, spec.release ?? duration * 0.5)
  const hold = Math.max(0.001, duration - attack - release)
  const peak = Math.max(0.0003, spec.gain ?? 0.12)

  envelope.gain.setValueAtTime(0.0001, start)
  envelope.gain.exponentialRampToValueAtTime(peak, start + attack)
  envelope.gain.setValueAtTime(peak, start + attack + hold)
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  source.start(start)
  source.stop(start + duration + 0.05)
}


// ------------------------------------------------------------- fallbacks
//
// Short synth sketches for the twenty new animals. They only play when the
// recording cannot be fetched or decoded, so they are deliberately simple —
// just enough for the cartridge to stay playable offline.

const bleat = (t: number, base: number, tremolo: number) => {
  tone(t, base, 0.75, {
    type: 'sawtooth',
    gain: 0.22,
    attack: 0.03,
    release: 0.3,
    to: base * 0.78,
    filter: { type: 'bandpass', freq: 1050, q: 3 },
    am: { rate: tremolo, depth: 0.55 },
    vibrato: { rate: 8, depth: 7 },
  })
  tone(t, base * 2, 0.6, { type: 'sine', gain: 0.05, to: base * 1.5, attack: 0.04 })
  return 0.9
}

const neigh = (t: number) => {
  tone(t, 720, 1.1, {
    type: 'sawtooth',
    gain: 0.18,
    attack: 0.03,
    release: 0.5,
    to: 380,
    filter: { type: 'bandpass', freq: 1100, q: 2.5 },
    vibrato: { rate: 12, depth: 55, delay: 0.05 },
  })
  tone(t + 0.15, 560, 0.9, { type: 'sine', gain: 0.07, to: 320, attack: 0.05 })
  return 1.3
}

const bray = (t: number) => {
  tone(t, 620, 0.28, {
    type: 'sawtooth', gain: 0.16, attack: 0.01, release: 0.16, to: 420,
    filter: { type: 'bandpass', freq: 900, q: 3 },
  })
  tone(t + 0.3, 560, 0.3, {
    type: 'sawtooth', gain: 0.14, attack: 0.01, release: 0.2, to: 380,
    filter: { type: 'bandpass', freq: 900, q: 3 },
  })
  tone(t + 0.65, 420, 0.5, {
    type: 'sawtooth', gain: 0.14, attack: 0.02, release: 0.35, to: 240,
    filter: { type: 'lowpass', freq: 1200, q: 1 },
    vibrato: { rate: 9, depth: 12 },
  })
  return 1.3
}

const oink = (t: number) => {
  for (let i = 0; i < 2; i += 1) {
    tone(t + i * 0.24, 190, 0.16, {
      type: 'sawtooth', gain: 0.2, attack: 0.01, release: 0.1, to: 120,
      filter: { type: 'lowpass', freq: 900, q: 2 },
      am: { rate: 34, depth: 0.6 },
    })
    noise(t + i * 0.24, 0.08, { gain: 0.05, freq: 900, q: 1.5 })
  }
  return 0.6
}

const squeak = (t: number) => {
  for (let i = 0; i < 3; i += 1) {
    tone(t + i * 0.12, 3200, 0.08, {
      type: 'sine', gain: 0.06, attack: 0.004, release: 0.06, to: 3900,
    })
  }
  return 0.55
}

const trumpet = (t: number) => {
  tone(t, 320, 1.0, {
    type: 'sawtooth',
    gain: 0.22,
    attack: 0.06,
    release: 0.4,
    points: [[0, 320], [0.3, 540], [0.6, 470], [0.95, 360]],
    filter: { type: 'bandpass', freq: 900, q: 2 },
    vibrato: { rate: 7, depth: 6 },
  })
  noise(t, 0.9, { gain: 0.05, freq: 1200, q: 1 })
  return 1.3
}

const roar = (t: number, base: number) => {
  tone(t, base, 1.3, {
    type: 'sawtooth', gain: 0.24, attack: 0.08, release: 0.6, to: base * 0.7,
    filter: { type: 'lowpass', freq: 420, q: 2 },
    vibrato: { rate: 6, depth: 5 },
  })
  noise(t, 1.2, { gain: 0.12, type: 'lowpass', freq: 300, q: 1, attack: 0.1 })
  return 1.6
}

const howl = (t: number) => {
  tone(t, 380, 1.5, {
    type: 'sine', gain: 0.14, attack: 0.2, release: 0.6,
    points: [[0, 360], [0.35, 560], [0.8, 520], [1.4, 340]],
    vibrato: { rate: 4.5, depth: 6 },
  })
  tone(t + 0.1, 760, 1.3, { type: 'triangle', gain: 0.05, to: 620, attack: 0.25 })
  return 1.8
}

const chatter = (t: number) => {
  for (let i = 0; i < 5; i += 1) {
    tone(t + i * 0.12, 520 + (i % 2) * 90, 0.09, {
      type: 'sawtooth', gain: 0.12, attack: 0.006, release: 0.07, to: 420,
      filter: { type: 'bandpass', freq: 1200, q: 3 },
    })
  }
  return 0.8
}

const hoot = (t: number) => {
  for (let i = 0; i < 2; i += 1) {
    tone(t + i * 0.45, 380, 0.32, {
      type: 'sine', gain: 0.16, attack: 0.06, release: 0.22, to: 340,
      filter: { type: 'lowpass', freq: 900, q: 1 },
    })
  }
  return 1.0
}

const squawk = (t: number, base: number, am?: number) => {
  tone(t, base, 0.38, {
    type: 'sawtooth', gain: 0.18, attack: 0.01, release: 0.22, to: base * 0.7,
    filter: { type: 'bandpass', freq: 1500, q: 2 },
    am: am ? { rate: am, depth: 0.6 } : undefined,
  })
  noise(t, 0.2, { gain: 0.06, freq: 2000, q: 2 })
  return 0.55
}

const penguinCall = (t: number) => {
  for (let i = 0; i < 3; i += 1) {
    tone(t + i * 0.22, 700, 0.16, {
      type: 'sawtooth', gain: 0.14, attack: 0.008, release: 0.12, to: 950,
      filter: { type: 'bandpass', freq: 1400, q: 3 },
    })
  }
  return 0.8
}

const dolphin = (t: number) => {
  for (let i = 0; i < 6; i += 1) {
    tone(t + i * 0.09, 3800 + (i % 3) * 300, 0.04, {
      type: 'sine', gain: 0.05, attack: 0.003, release: 0.03,
    })
  }
  tone(t + 0.15, 1800, 0.5, {
    type: 'sine', gain: 0.06, attack: 0.03, release: 0.3, to: 2800,
    vibrato: { rate: 12, depth: 120 },
  })
  return 0.9
}

const whale = (t: number) => {
  tone(t, 120, 1.9, {
    type: 'sine', gain: 0.2, attack: 0.2, release: 0.8,
    points: [[0, 120], [0.6, 160], [1.2, 110], [1.8, 90]],
    vibrato: { rate: 3, depth: 4 },
  })
  tone(t, 240, 1.7, { type: 'triangle', gain: 0.06, attack: 0.3, release: 0.7, to: 200 })
  return 2.2
}

const cricket = (t: number) => {
  tone(t, 4200, 0.9, {
    type: 'sine', gain: 0.05, attack: 0.02, release: 0.2, am: { rate: 26, depth: 1 },
  })
  tone(t, 3600, 0.8, {
    type: 'sine', gain: 0.03, attack: 0.02, release: 0.2, am: { rate: 26, depth: 1 },
  })
  return 1.1
}

const buzz = (t: number) => {
  tone(t, 190, 1.1, {
    type: 'sawtooth', gain: 0.16, attack: 0.05, release: 0.3,
    filter: { type: 'bandpass', freq: 600, q: 1.2 },
    am: { rate: 55, depth: 0.5 },
    vibrato: { rate: 9, depth: 6 },
  })
  tone(t, 380, 1.0, { type: 'square', gain: 0.04, filter: { type: 'lowpass', freq: 1200, q: 1 } })
  return 1.3
}

type Recipe = (t: number) => number

const RECIPES: Record<SoundId, Recipe> = {
  sapi(t) {
    tone(t, 122, 1.25, {
      type: 'sawtooth',
      gain: 0.4,
      attack: 0.16,
      release: 0.5,
      to: 94,
      filter: { freq: 540, q: 3 },
      vibrato: { rate: 5.2, depth: 3.4 },
    })
    tone(t, 61, 1.2, {
      type: 'sine',
      gain: 0.16,
      attack: 0.2,
      release: 0.5,
      to: 46,
    })
    noise(t, 0.6, { gain: 0.05, freq: 700, q: 1.2, attack: 0.12 })
    return 1.6
  },

  kucing(t) {
    tone(t, 480, 0.72, {
      type: 'sawtooth',
      gain: 0.26,
      attack: 0.05,
      release: 0.3,
      points: [
        [0, 480],
        [0.12, 700],
        [0.3, 640],
        [0.5, 420],
        [0.68, 360],
      ],
      filter: { type: 'bandpass', freq: 1150, to: 760, q: 5 },
      vibrato: { rate: 6, depth: 4, delay: 0.12 },
    })
    tone(t, 1200, 0.5, {
      type: 'triangle',
      gain: 0.07,
      attack: 0.06,
      release: 0.26,
      to: 760,
      filter: { type: 'bandpass', freq: 2400, q: 6 },
    })
    return 0.95
  },

  anjing(t) {
    for (let i = 0; i < 2; i += 1) {
      const at = t + i * 0.28
      tone(at, 255 + i * 35, 0.17, {
        type: 'sawtooth',
        gain: 0.46,
        attack: 0.004,
        release: 0.13,
        to: 115,
        filter: { freq: 1700, q: 1.2 },
      })
      tone(at, 128, 0.2, {
        type: 'triangle',
        gain: 0.28,
        attack: 0.004,
        release: 0.17,
        to: 72,
      })
      noise(at, 0.14, { gain: 0.24, freq: 1250, q: 0.8 })
    }
    return 0.66
  },

  ayam(t) {
    const saw = {
      type: 'sawtooth' as const,
      gain: 0.24,
      filter: { type: 'bandpass' as const, freq: 1150, q: 3 },
      vibrato: { rate: 7, depth: 6, delay: 0.04 },
    }
    tone(t, 330, 0.15, { ...saw, attack: 0.02, release: 0.12 })
    tone(t + 0.17, 305, 0.14, { ...saw, attack: 0.02, release: 0.11 })
    tone(t + 0.33, 350, 0.2, {
      ...saw,
      attack: 0.02,
      release: 0.16,
      to: 430,
    })
    tone(t + 0.55, 560, 0.66, {
      ...saw,
      gain: 0.28,
      attack: 0.04,
      release: 0.34,
      points: [
        [0, 540],
        [0.07, 700],
        [0.22, 680],
        [0.44, 470],
        [0.6, 360],
      ],
    })
    noise(t + 0.55, 0.6, { gain: 0.05, freq: 1800, q: 2, attack: 0.05 })
    return 1.3
  },

  bebek(t) {
    for (let i = 0; i < 2; i += 1) {
      const at = t + i * 0.3
      tone(at, 215, 0.22, {
        type: 'sawtooth',
        gain: 0.3,
        attack: 0.015,
        release: 0.12,
        to: 178,
        filter: { type: 'bandpass', freq: 1350, q: 4 },
        am: { rate: 33, depth: 0.85 },
      })
      noise(at, 0.16, { gain: 0.05, freq: 2600, q: 2 })
    }
    return 0.72
  },

  burung(t) {
    const notes: readonly Point[] = [
      [0, 2600],
      [0.1, 3400],
      [0.19, 2900],
      [0.27, 3700],
      [0.36, 2450],
      [0.45, 3300],
      [0.54, 2900],
    ]
    notes.forEach(([offset, freq], index) => {
      tone(t + offset, freq, 0.09, {
        type: 'sine',
        gain: 0.14,
        attack: 0.006,
        release: 0.07,
        to: freq * 0.72,
        pan: index % 2 === 0 ? -0.35 : 0.35,
      })
    })
    return 0.7
  },

  katak(t) {
    for (let i = 0; i < 2; i += 1) {
      const at = t + i * 0.42
      tone(at, 128, 0.3, {
        type: 'sawtooth',
        gain: 0.26,
        attack: 0.02,
        release: 0.14,
        to: 104,
        filter: { type: 'bandpass', freq: 520, q: 3 },
        am: { rate: 18, depth: 0.92 },
      })
      tone(at, 64, 0.28, { type: 'sine', gain: 0.1, to: 52, attack: 0.02 })
      noise(at, 0.12, { gain: 0.05, freq: 900, q: 2 })
    }
    return 1.1
  },

  motor(t) {
    tone(t, 58, 1.4, {
      type: 'sawtooth',
      gain: 0.28,
      attack: 0.09,
      release: 0.42,
      points: [
        [0, 54],
        [0.55, 74],
        [1.15, 66],
        [1.4, 62],
      ],
      filter: { freq: 520, q: 2 },
      am: { rate: 9, depth: 0.45 },
      vibrato: { rate: 3.2, depth: 1.4 },
    })
    tone(t, 116, 1.3, {
      type: 'square',
      gain: 0.07,
      attack: 0.1,
      release: 0.4,
      filter: { freq: 760, q: 1 },
    })
    tone(t + 0.05, 92, 1.2, {
      type: 'sawtooth',
      gain: 0.12,
      attack: 0.1,
      release: 0.4,
      to: 138,
      filter: { type: 'bandpass', freq: 900, q: 1.4 },
    })
    noise(t, 0.9, { gain: 0.04, freq: 1200, q: 0.7, attack: 0.1 })
    return 1.6
  },

  mobil(t) {
    tone(t, 415, 0.62, {
      type: 'square',
      gain: 0.16,
      attack: 0.02,
      release: 0.16,
      filter: { freq: 2800, q: 1 },
    })
    tone(t, 523, 0.62, {
      type: 'square',
      gain: 0.14,
      attack: 0.02,
      release: 0.16,
      filter: { freq: 3000, q: 1 },
    })
    tone(t, 830, 0.5, {
      type: 'sine',
      gain: 0.04,
      attack: 0.03,
      release: 0.2,
    })
    return 0.85
  },

  kereta(t) {
    tone(t, 233, 1.7, {
      type: 'sawtooth',
      gain: 0.18,
      attack: 0.14,
      release: 0.45,
      filter: { freq: 1200, q: 1.2 },
      vibrato: { rate: 4.2, depth: 1.8, delay: 0.3 },
    })
    tone(t, 311, 1.6, {
      type: 'sawtooth',
      gain: 0.12,
      attack: 0.16,
      release: 0.5,
      to: 296,
      filter: { freq: 1400, q: 1 },
    })
    tone(t, 466, 1.4, {
      type: 'sine',
      gain: 0.05,
      attack: 0.2,
      release: 0.5,
      to: 452,
    })
    for (let i = 0; i < 9; i += 1) {
      noise(t + 0.12 + i * 0.18, 0.09, {
        gain: 0.07,
        type: 'lowpass',
        freq: 320,
        q: 1,
        release: 0.07,
      })
    }
    return 2.0
  },

  ambulans(t) {
    for (let i = 0; i < 2; i += 1) {
      const at = t + i * 1.2
      tone(at, 720, 0.62, {
        type: 'triangle',
        gain: 0.15,
        attack: 0.03,
        release: 0.1,
        to: 1080,
        filter: { freq: 3200, q: 1 },
      })
      tone(at + 0.6, 1080, 0.62, {
        type: 'triangle',
        gain: 0.15,
        attack: 0.02,
        release: 0.12,
        to: 720,
        filter: { freq: 3200, q: 1 },
      })
    }
    return 2.45
  },

  sepeda(t) {
    for (let i = 0; i < 2; i += 1) {
      const at = t + i * 0.24
      tone(at, 2600, 0.8, {
        type: 'sine',
        gain: 0.13,
        attack: 0.002,
        release: 0.75,
        vibrato: { rate: 44, depth: 120, delay: 0.01 },
      })
      tone(at, 3900, 0.55, {
        type: 'sine',
        gain: 0.05,
        attack: 0.002,
        release: 0.5,
      })
      tone(at, 1730, 0.6, {
        type: 'sine',
        gain: 0.04,
        attack: 0.002,
        release: 0.55,
      })
    }
    return 1.15
  },

  bel(t) {
    tone(t, 659, 1.2, {
      type: 'sine',
      gain: 0.19,
      attack: 0.004,
      release: 1.15,
    })
    tone(t, 1318, 0.9, { type: 'sine', gain: 0.06, attack: 0.004, release: 0.86 })
    tone(t, 1977, 0.55, { type: 'sine', gain: 0.03, attack: 0.004, release: 0.5 })
    tone(t + 0.42, 523, 1.4, {
      type: 'sine',
      gain: 0.18,
      attack: 0.004,
      release: 1.34,
    })
    tone(t + 0.42, 1046, 1.0, {
      type: 'sine',
      gain: 0.05,
      attack: 0.004,
      release: 0.96,
    })
    tone(t + 0.42, 1569, 0.6, {
      type: 'sine',
      gain: 0.025,
      attack: 0.004,
      release: 0.56,
    })
    return 2.0
  },

  weker(t) {
    for (let i = 0; i < 3; i += 1) {
      const at = t + i * 0.5
      tone(at, 2050, 0.42, {
        type: 'square',
        gain: 0.09,
        attack: 0.004,
        release: 0.34,
        filter: { type: 'bandpass', freq: 2400, q: 2 },
        am: { rate: 25, depth: 0.75 },
      })
      tone(at, 2760, 0.4, {
        type: 'square',
        gain: 0.05,
        attack: 0.004,
        release: 0.33,
        am: { rate: 25, depth: 0.75 },
      })
      noise(at, 0.05, { gain: 0.08, freq: 3200, q: 1 })
    }
    return 1.6
  },

  telepon(t) {
    for (let i = 0; i < 2; i += 1) {
      const at = t + i * 1.25
      tone(at, 440, 0.95, {
        type: 'sine',
        gain: 0.1,
        attack: 0.01,
        release: 0.07,
      })
      tone(at, 480, 0.95, {
        type: 'sine',
        gain: 0.1,
        attack: 0.01,
        release: 0.07,
      })
    }
    return 2.35
  },

  keran(t) {
    noise(t, 1.9, {
      gain: 0.1,
      type: 'bandpass',
      freq: 2300,
      to: 3100,
      q: 0.8,
      attack: 0.12,
      release: 0.5,
    })
    noise(t, 1.9, {
      gain: 0.035,
      type: 'highpass',
      freq: 5200,
      q: 0.6,
      attack: 0.1,
      release: 0.5,
    })
    for (let i = 0; i < 7; i += 1) {
      const at = t + 0.2 + i * 0.24
      noise(at, 0.1, { gain: 0.07, freq: 1100 + i * 90, q: 5, release: 0.08 })
      tone(at, 880 + i * 40, 0.11, {
        type: 'sine',
        gain: 0.05,
        attack: 0.004,
        release: 0.1,
        to: 520 + i * 30,
      })
    }
    return 2.1
  },

  hujan(t) {
    noise(t, 2.6, {
      gain: 0.09,
      type: 'bandpass',
      freq: 4200,
      q: 0.6,
      attack: 0.18,
      release: 0.7,
    })
    noise(t, 2.6, {
      gain: 0.035,
      type: 'lowpass',
      freq: 420,
      q: 1,
      attack: 0.3,
      release: 0.6,
    })
    for (let i = 0; i < 16; i += 1) {
      const at = t + 0.08 + i * 0.155
      noise(at, 0.06, {
        gain: 0.045,
        freq: 2900 + ((i * 7) % 5) * 430,
        q: 3.5,
        release: 0.05,
        pan: ((i % 5) - 2) * 0.22,
      })
    }
    return 2.8
  },

  guntur(t) {
    noise(t, 0.2, {
      gain: 0.26,
      type: 'highpass',
      freq: 900,
      q: 0.7,
      release: 0.16,
    })
    noise(t + 0.02, 2.2, {
      gain: 0.2,
      type: 'lowpass',
      freq: 220,
      to: 80,
      q: 1.2,
      attack: 0.06,
      release: 1.8,
    })
    tone(t + 0.08, 48, 1.9, {
      type: 'sine',
      gain: 0.18,
      attack: 0.1,
      release: 1.6,
      to: 31,
    })
    return 2.4
  },

  angin(t) {
    noise(t, 2.4, {
      gain: 0.14,
      type: 'bandpass',
      freq: 480,
      to: 1100,
      q: 2.2,
      attack: 0.55,
      release: 0.8,
    })
    noise(t, 2.3, {
      gain: 0.07,
      type: 'bandpass',
      freq: 950,
      to: 430,
      q: 3,
      attack: 0.7,
      release: 0.9,
    })
    return 2.6
  },

  ombak(t) {
    for (let i = 0; i < 2; i += 1) {
      const at = t + i * 1.4
      noise(at, 1.5, {
        gain: 0.18,
        type: 'lowpass',
        freq: 520,
        to: 1500,
        q: 0.9,
        attack: 0.5,
        release: 0.8,
      })
      noise(at + 0.35, 0.85, {
        gain: 0.06,
        type: 'highpass',
        freq: 4200,
        q: 0.7,
        attack: 0.2,
        release: 0.5,
      })
    }
    return 3.0
  },

  kambing(t) { return bleat(t, 300, 22) },
  domba(t) { return bleat(t, 360, 18) },
  kuda(t) { return neigh(t) },
  keledai(t) { return bray(t) },
  babi(t) { return oink(t) },
  tikus(t) { return squeak(t) },
  gajah(t) { return trumpet(t) },
  singa(t) { return roar(t, 95) },
  harimau(t) { return roar(t, 120) },
  serigala(t) { return howl(t) },
  monyet(t) { return chatter(t) },
  'burung-hantu'(t) { return hoot(t) },
  merak(t) { return squawk(t, 620) },
  angsa(t) { return squawk(t, 420, 18) },
  kalkun(t) { return squawk(t, 330, 24) },
  penguin(t) { return penguinCall(t) },
  'lumba-lumba'(t) { return dolphin(t) },
  paus(t) { return whale(t) },
  jangkrik(t) { return cricket(t) },
  lebah(t) { return buzz(t) },
}

export type UiSound = 'tap' | 'right' | 'wrong' | 'win'

/** Short feedback blips: the speaker's own voice, not a sound to guess. */
export function playUi(kind: UiSound) {
  const ctx = ensure().ctx
  const t = ctx.currentTime + 0.01
  if (kind === 'tap') {
    tone(t, 880, 0.09, { type: 'triangle', gain: 0.07, attack: 0.004, release: 0.07 })
    return
  }
  if (kind === 'right') {
    ;[660, 880, 1320].forEach((freq, index) => {
      tone(t + index * 0.075, freq, 0.2, {
        type: 'triangle',
        gain: 0.09,
        attack: 0.005,
        release: 0.17,
      })
    })
    return
  }
  if (kind === 'wrong') {
    tone(t, 220, 0.28, {
      type: 'sawtooth',
      gain: 0.12,
      attack: 0.01,
      release: 0.24,
      to: 150,
      filter: { freq: 900, q: 2 },
    })
    return
  }
  ;[523, 659, 784, 1046, 1318].forEach((freq, index) => {
    tone(t + index * 0.09, freq, 0.3, {
      type: 'triangle',
      gain: 0.08,
      attack: 0.005,
      release: 0.26,
    })
  })
}

/** Unlocks audio on a user gesture; safe to call repeatedly. */
export function primeAudio() {
  ensure()
  void preloadSoundFiles()
}

/** Stops whatever is playing and cancels a recording that is still loading. */
export function stopSound() {
  soundToken += 1
  stopCurrentSound()
}

function stopCurrentSound() {
  if (!bag || !out) return
  const dying = out
  const now = bag.ctx.currentTime
  dying.gain.cancelScheduledValues(now)
  dying.gain.setTargetAtTime(0, now, 0.02)
  out = null
  window.setTimeout(() => dying.disconnect(), 160)
}

export function setMuted(next: boolean) {
  muted = next
  if (!bag) return
  bag.master.gain.setTargetAtTime(next ? 0 : MASTER_GAIN, bag.ctx.currentTime, 0.02)
  if (next) stopSound()
}

export function isMuted() {
  return muted
}

// ------------------------------------------------------------- recordings
//
// The catalogue ships twenty short MP3s. They are fetched once, decoded once,
// and played through the same master bus as the synth fallback. If a file is
// missing, still downloading when the user presses play, or undecodable, the
// recipe for that id takes over — the cartridge always makes a sound.

const encoded = new Map<SoundId, ArrayBuffer>()
const decoded = new Map<SoundId, AudioBuffer>()
const decoding = new Map<SoundId, Promise<AudioBuffer>>()
let prefetching = false
let soundToken = 0

async function fetchSound(id: SoundId): Promise<ArrayBuffer> {
  const cached = encoded.get(id)
  if (cached) return cached
  const response = await fetch(SUARA_SOUNDS[id].src)
  if (!response.ok) throw new Error(`cannot fetch ${id}: ${response.status}`)
  const raw = await response.arrayBuffer()
  encoded.set(id, raw)
  return raw
}

function loadSound(id: SoundId): Promise<AudioBuffer> {
  const ready = decoded.get(id)
  if (ready) return Promise.resolve(ready)
  const running = decoding.get(id)
  if (running) return running

  const job = (async () => {
    const ctx = ensure().ctx
    const raw = await fetchSound(id)
    // `decodeAudioData` detaches its input; hand it a copy so the raw buffer
    // stays available for a retry.
    const buffer = await ctx.decodeAudioData(raw.slice(0))
    decoded.set(id, buffer)
    decoding.delete(id)
    return buffer
  })().catch((error: unknown) => {
    decoding.delete(id)
    throw error
  })
  decoding.set(id, job)
  return job
}

/** Warms every recording in the background after the first gesture. */
export function preloadSoundFiles() {
  if (prefetching) return
  prefetching = true
  const ids = Object.keys(SUARA_SOUNDS) as SoundId[]
  let index = 0
  const next = () => {
    if (index >= ids.length) return
    const id = ids[index]
    index += 1
    void fetchSound(id)
      .catch(() => {})
      .finally(() => {
        if (index < ids.length) window.setTimeout(next, 60)
      })
  }
  next()
}

function startBus(): GainNode {
  const current = ensure()
  stopCurrentSound()
  const bus = current.ctx.createGain()
  bus.gain.value = 1
  bus.connect(current.master)
  out = bus
  return bus
}

/** Plays a decoded recording with a tiny fade in/out to avoid clicks. */
function playBuffer(buffer: AudioBuffer): number {
  const ctx = ensure().ctx
  const bus = startBus()
  const now = ctx.currentTime + 0.02
  const fade = ctx.createGain()
  fade.gain.setValueAtTime(0.0001, now)
  fade.gain.linearRampToValueAtTime(1, now + 0.018)
  fade.gain.setValueAtTime(1, now + Math.max(0.03, buffer.duration - 0.06))
  fade.gain.linearRampToValueAtTime(0.0001, now + buffer.duration)

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(fade)
  fade.connect(bus)
  source.start(now)
  source.stop(now + buffer.duration + 0.02)

  window.setTimeout(
    () => {
      if (out === bus) out = null
      bus.disconnect()
    },
    (buffer.duration + 0.4) * 1000,
  )
  return buffer.duration
}

function playSynth(id: SoundId): number {
  const current = ensure()
  const bus = startBus()
  const start = current.ctx.currentTime + 0.03
  const duration = RECIPES[id](start)
  window.setTimeout(
    () => {
      if (out === bus) out = null
      bus.disconnect()
    },
    (duration + 0.5) * 1000,
  )
  return duration
}

/**
 * Plays one catalogue sound and resolves with its length in seconds (0 when a
 * newer press superseded this one). Starting a new sound always cuts the
 * previous one, so mashing the big button never stacks.
 */
export async function playSound(id: SoundId): Promise<number> {
  ensure()
  const token = ++soundToken
  stopCurrentSound()

  try {
    const buffer = await loadSound(id)
    if (token !== soundToken) return 0
    const duration = playBuffer(buffer)
    preloadSoundFiles()
    return duration
  } catch {
    if (token !== soundToken) return 0
    return playSynth(id)
  }
}
