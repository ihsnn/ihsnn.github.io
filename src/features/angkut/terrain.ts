import type { TerrainSpec } from './types'

/**
 * The road, as a height field.
 *
 * Three layers make a level:
 *  1. a constant grade plus two octaves of seeded value noise — the rolling hills;
 *  2. a slope limiter that bakes the whole thing into a table, so no level can
 *     ever produce a wall the heaviest truck cannot climb;
 *  3. kicker ramps, added on top afterwards — the only place the road is allowed
 *     to be steep, because that is what throws the truck into the air.
 *
 * The table is built once per level and sampled with Catmull-Rom, so wheels,
 * collision points and the renderer all see exactly the same surface.
 */

/** Design px per metre. 12 keeps the speedometer in believable km/h. */
export const PX_PER_METER = 12

/** Where the truck starts, and the flat pad it starts on. */
export const START_X = 120
const LAUNCH_FLAT = 300
const LAUNCH_BLEND = 620

/** The finish is levelled off over this much road before the line. */
const FINISH_BLEND = 620

/** Table resolution and the steepest climb the road may hold (28°). */
const TABLE_STEP = 4
const MAX_CLIMB = 0.53
const MAX_DROP = 0.95
const TABLE_MARGIN = 900

const KICKER_START = 1_050
const KICKER_END_PAD = 620

const BASE_Y = 0

function hash(value: number, seed: number): number {
  let h = Math.imul((value | 0) ^ seed, 0x27d4eb2d)
  h ^= h >>> 15
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  return (h >>> 0) / 4_294_967_296
}

/** Smooth value noise in -1…1, one control point every `spacing` px. */
function noiseAt(x: number, spacing: number, seed: number): number {
  const scaled = x / spacing
  const index = Math.floor(scaled)
  const t = scaled - index
  const smooth = t * t * (3 - 2 * t)
  const a = hash(index, seed) * 2 - 1
  const b = hash(index + 1, seed) * 2 - 1
  return a + (b - a) * smooth
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export class Terrain {
  private readonly spec: TerrainSpec
  private readonly finishX: number
  private readonly origin: number
  private readonly samples: Float64Array
  private readonly kickers: ReadonlyArray<{
    start: number
    length: number
    height: number
  }>

  constructor(spec: TerrainSpec, targetM: number) {
    this.spec = spec
    this.finishX = START_X + targetM * PX_PER_METER
    this.origin = -600
    const last = this.finishX + TABLE_MARGIN
    const count = Math.ceil((last - this.origin) / TABLE_STEP) + 3
    const raw = new Float64Array(count)

    for (let index = 0; index < count; index += 1) {
      raw[index] = this.baseHeight(this.origin + index * TABLE_STEP)
    }

    // Forward pass: never climb faster than MAX_CLIMB…
    for (let index = 1; index < count; index += 1) {
      const ceiling = raw[index - 1] - MAX_CLIMB * TABLE_STEP
      if (raw[index] < ceiling) raw[index] = ceiling
    }
    // …and back again, so a clamped crest does not turn into a cliff.
    for (let index = count - 2; index >= 0; index -= 1) {
      const ceiling = raw[index + 1] - MAX_CLIMB * TABLE_STEP
      if (raw[index] < ceiling) raw[index] = ceiling
    }
    // Descending is allowed to be steeper, but not a vertical drop.
    for (let index = 1; index < count; index += 1) {
      const floor = raw[index - 1] + MAX_DROP * TABLE_STEP
      if (raw[index] > floor) raw[index] = floor
    }
    for (let index = count - 2; index >= 0; index -= 1) {
      const floor = raw[index + 1] + MAX_DROP * TABLE_STEP
      if (raw[index] > floor) raw[index] = floor
    }

    this.samples = raw
    this.kickers = this.buildKickers(spec.jumps, spec.jump)
  }

  /** World y of the road surface at world x. */
  heightAt(x: number): number {
    return this.baseAt(x) + this.kickerAt(x)
  }

  /** dy/dx at world x. Negative means the road climbs to the right. */
  slopeAt(x: number): number {
    return (this.heightAt(x + 2) - this.heightAt(x - 2)) / 4
  }

  /** Unit normal pointing out of the road (upwards on screen). */
  normalAt(x: number): { x: number; y: number } {
    const slope = this.slopeAt(x)
    const length = Math.hypot(slope, 1)
    return { x: slope / length, y: -1 / length }
  }

  /** Where the finish line stands in world px. */
  get finishLineX(): number {
    return this.finishX
  }

  /** The road without the kickers — what the hills would be on their own. */
  baseAt(x: number): number {
    const local = (x - this.origin) / TABLE_STEP
    const index = Math.floor(local)
    const t = local - index
    const i0 = clamp(index - 1, 0, this.samples.length - 1)
    const i1 = clamp(index, 0, this.samples.length - 1)
    const i2 = clamp(index + 1, 0, this.samples.length - 1)
    const i3 = clamp(index + 2, 0, this.samples.length - 1)
    const y0 = this.samples[i0]
    const y1 = this.samples[i1]
    const y2 = this.samples[i2]
    const y3 = this.samples[i3]
    const t2 = t * t
    const t3 = t2 * t
    return (
      0.5 *
      (2 * y1 +
        (-y0 + y2) * t +
        (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 +
        (-y0 + 3 * y1 - 3 * y2 + y3) * t3)
    )
  }

  /** How many kickers this level put on the road (for the renderer's signs). */
  get kickerCount(): number {
    return this.kickers.length
  }

  private kickerAt(x: number): number {
    for (const kicker of this.kickers) {
      if (x <= kicker.start || x >= kicker.start + kicker.length) continue
      const t = (x - kicker.start) / kicker.length
      // Gentle climb, a short lip, then the ground falls away. The lip is what
      // launches the truck: past it there is simply nothing holding the wheels.
      if (t < 0.86) return kicker.height * smoothstep(0, 0.86, t)
      if (t < 0.93) return kicker.height
      return kicker.height * (1 - smoothstep(0.93, 1, t))
    }
    return 0
  }

  /**
   * Kicker humps, placed one per slot on the flattest stretch available and
   * shortened where the hill underneath is already steep. A ramp stacked on a
   * steep grade used to be a wall the heavy loads could never climb.
   */
  private buildKickers(count: number, height: number) {
    if (count <= 0 || height <= 0) return []
    const random = mulberry32(this.spec.seed ^ 0x1b3c)
    const usableEnd = this.finishX - KICKER_END_PAD
    const span = usableEnd - KICKER_START
    const slot = span / count
    const kickers = []

    for (let index = 0; index < count; index += 1) {
      const length = 170 + random() * 55
      const origin = KICKER_START + slot * index
      let bestStart = origin + 20
      let bestSlope = Number.POSITIVE_INFINITY

      for (let offset = 0; offset + length < slot - 40; offset += 18) {
        const start = origin + offset
        let worst = 0
        for (let x = start; x < start + length; x += 10) {
          const slope = (this.baseAt(x + 8) - this.baseAt(x - 8)) / 16
          worst = Math.max(worst, Math.abs(slope))
        }
        if (worst < bestSlope) {
          bestSlope = worst
          bestStart = start
        }
      }

      kickers.push({
        start: bestStart,
        length,
        height:
          height *
          (0.82 + random() * 0.36) *
          clamp(1 - bestSlope * 0.8, 0.5, 1),
      })
    }
    return kickers
  }

  private baseHeight(x: number): number {
    const spec = this.spec
    const launch = smoothstep(LAUNCH_FLAT, LAUNCH_BLEND + LAUNCH_FLAT, x)
    const finish = 1 - smoothstep(this.finishX - FINISH_BLEND, this.finishX + 40, x)
    const shape = launch * finish

    const grade = -spec.grade * Math.max(0, x - LAUNCH_FLAT)
    const hills =
      noiseAt(x, spec.wave, spec.seed) * spec.amp +
      noiseAt(x, spec.wave * 0.36, spec.seed + 11) * spec.amp * 0.4
    const chop = noiseAt(x, spec.chopWave, spec.seed + 29) * spec.chop

    return BASE_Y + grade + (hills + chop) * shape
  }
}

/** Small deterministic PRNG so a level's pickups are always in the same spot. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}
