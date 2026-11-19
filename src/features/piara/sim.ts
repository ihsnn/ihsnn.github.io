import type {
  ActionId,
  GrowthInfo,
  MoodId,
  PetState,
  RefusalReason,
  StageId,
} from './types'

/**
 * The rules of the pocket pet, with no React and no canvas in sight.
 *
 * Time is real: one `advance()` call walks the state forward by however long
 * the player was away (capped), so a closed tab keeps costing food and joy and
 * a saved pet does not need a background loop to exist. Tuning lives here; the
 * words live in `src/content/piara.ts`.
 */

const HOUR = 3_600_000

/** Long absences stop at a day and a half instead of draining into nothing. */
const MAX_CATCHUP = 36 * HOUR

/** Needs per hour, awake. A full bar lasts roughly five hours. */
const FOOD_PER_HOUR = 18
const JOY_PER_HOUR = 14
const REST_PER_HOUR = 12

/** Sleep trades hunger for energy, so it is always a real choice. */
const ASLEEP_FOOD_PER_HOUR = 7
const ASLEEP_JOY_PER_HOUR = 3
const REST_GAIN_PER_HOUR = 36

/** Droppings and an empty stomach make the day worse. */
const MESS_PER_HOUR = 2
const HUNGRY_JOY_PER_HOUR = 6
const MESS_INTERVAL = 3 * HOUR
const MAX_MESS = 3

export const TAPS_TO_HATCH = 5

const STAGE_START: Partial<Record<StageId, number>> = {
  bayi: 0,
  anak: 0.25 * HOUR,
  remaja: 1.5 * HOUR,
  dewasa: 4 * HOUR,
}

/**
 * Evolution needs time *and* a pet that is currently in decent shape. A player
 * who leaves for a week comes back to a hungry creature, not a free adult.
 */
const EVOLVE_MIN_NEED = 45

const STAGE_GROWTH: Partial<
  Record<StageId, { atMs: number; next: StageId }>
> = {
  bayi: { atMs: 0.25 * HOUR, next: 'anak' },
  anak: { atMs: 1.5 * HOUR, next: 'remaja' },
  remaja: { atMs: 4 * HOUR, next: 'dewasa' },
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export interface AdvanceResult {
  pet: PetState
  /** True on the tick the pet finished a sleep and stood back up. */
  woke: boolean
  /** The stage it just reached, or null. */
  evolved: StageId | null
}

export function createPet(now: number): PetState {
  return {
    version: 1,
    name: '',
    stage: 'telur',
    taps: 0,
    bornAt: null,
    ageMs: 0,
    food: 76,
    joy: 80,
    rest: 86,
    care: 60,
    mess: 0,
    lastMessAt: now,
    asleep: false,
    sleepStartedAt: null,
    lastTick: now,
    updatedAt: now,
  }
}

/** One tap on the egg. The fifth one hatches it into a hungry baby. */
export function tapEgg(pet: PetState, now: number): PetState {
  if (pet.stage !== 'telur') return pet
  const taps = Math.min(pet.taps + 1, TAPS_TO_HATCH)
  if (taps < TAPS_TO_HATCH) {
    return { ...pet, taps, lastTick: now, updatedAt: now }
  }
  return {
    ...pet,
    taps,
    stage: 'bayi',
    bornAt: now,
    ageMs: 0,
    food: 84,
    joy: 80,
    rest: 90,
    care: 60,
    mess: 0,
    lastMessAt: now,
    asleep: false,
    sleepStartedAt: null,
    lastTick: now,
    updatedAt: now,
  }
}

/**
 * Walk the pet forward to `now`. Returns a new object only when something
 * actually changed, which lets the tick loop skip re-renders.
 */
export function advance(pet: PetState, now: number): AdvanceResult {
  const still = { pet, woke: false, evolved: null }

  // An egg (or an unnamed newcomer) does not age; it is waiting for a player.
  if (pet.stage === 'telur' || pet.name === '') {
    if (now - pet.lastTick < 5_000) return still
    return { pet: { ...pet, lastTick: now }, woke: false, evolved: null }
  }

  const gap = now - pet.lastTick
  // The device clock can jump backwards (timezone tools, daylight-saving apps).
  // Re-anchor instead of freezing every later tick behind a future timestamp.
  if (gap < 0) {
    return { pet: { ...pet, lastTick: now }, woke: false, evolved: null }
  }
  if (gap < 500) return still

  const elapsed = Math.min(gap, MAX_CATCHUP)
  const hours = elapsed / HOUR

  let food = pet.food
  let joy = pet.joy
  let rest = pet.rest
  let mess = pet.mess
  let asleep = pet.asleep
  let sleepStartedAt = pet.sleepStartedAt
  let lastMessAt = pet.lastMessAt
  let woke = false

  if (asleep) {
    rest += REST_GAIN_PER_HOUR * hours
    food -= ASLEEP_FOOD_PER_HOUR * hours
    joy -= ASLEEP_JOY_PER_HOUR * hours
    if (rest >= 100) {
      rest = 100
      asleep = false
      sleepStartedAt = null
      woke = true
    }
  } else {
    food -= FOOD_PER_HOUR * hours
    joy -= JOY_PER_HOUR * hours
    rest -= REST_PER_HOUR * hours
    joy -= mess * MESS_PER_HOUR * hours
    if (food <= 0) joy -= HUNGRY_JOY_PER_HOUR * hours
  }

  food = clamp(food, 0, 100)
  joy = clamp(joy, 0, 100)
  rest = clamp(rest, 0, 100)

  // Droppings accumulate on real time, awake only, and never while a baby is
  // still finding its feet.
  if (!asleep && pet.stage !== 'bayi') {
    const due = Math.floor((now - lastMessAt) / MESS_INTERVAL)
    if (due > 0) {
      mess = Math.min(MAX_MESS, mess + due)
      lastMessAt += due * MESS_INTERVAL
    }
  }

  const ageMs = pet.ageMs + elapsed
  const average = (food + joy + rest) / 3
  const care = clamp(
    pet.care + (average - pet.care) * Math.min(1, hours * 0.1),
    0,
    100,
  )

  let stage: StageId = pet.stage
  let evolved: StageId | null = null
  const rule = STAGE_GROWTH[stage]
  if (rule && ageMs >= rule.atMs && average >= EVOLVE_MIN_NEED) {
    stage = rule.next
    evolved = stage
  }

  return {
    pet: {
      ...pet,
      stage,
      ageMs,
      food,
      joy,
      rest,
      care,
      mess,
      lastMessAt,
      asleep,
      sleepStartedAt,
      lastTick: now,
      updatedAt: now,
    },
    woke,
    evolved,
  }
}

export interface ActionOutcome {
  pet: PetState
  ok: boolean
  reason: RefusalReason | null
  /** Only meaningful for `sleep`: true when the pet was woken instead. */
  woke: boolean
}

const refuse = (pet: PetState, reason: RefusalReason): ActionOutcome => ({
  pet,
  ok: false,
  reason,
  woke: false,
})

export function applyAction(
  pet: PetState,
  action: ActionId,
  now: number,
): ActionOutcome {
  if (pet.stage === 'telur' || pet.name === '') {
    return refuse(pet, 'unready')
  }

  const patch = (changes: Partial<PetState>): ActionOutcome => ({
    pet: { ...pet, ...changes, updatedAt: now },
    ok: true,
    reason: null,
    woke: false,
  })

  switch (action) {
    case 'feed': {
      if (pet.asleep) return refuse(pet, 'asleep')
      if (pet.food >= 92) return refuse(pet, 'full')
      return patch({
        food: clamp(pet.food + 22, 0, 100),
        joy: clamp(pet.joy + 3, 0, 100),
        care: clamp(pet.care + 2, 0, 100),
      })
    }
    case 'play': {
      if (pet.asleep) return refuse(pet, 'asleep')
      if (pet.rest < 12) return refuse(pet, 'tired')
      return patch({
        joy: clamp(pet.joy + 18, 0, 100),
        rest: clamp(pet.rest - 10, 0, 100),
        food: clamp(pet.food - 5, 0, 100),
      })
    }
    case 'sleep': {
      if (pet.asleep) {
        return {
          pet: {
            ...pet,
            asleep: false,
            sleepStartedAt: null,
            updatedAt: now,
          },
          ok: true,
          reason: null,
          woke: true,
        }
      }
      return patch({ asleep: true, sleepStartedAt: now })
    }
    case 'clean': {
      if (pet.asleep) return refuse(pet, 'asleep')
      if (pet.mess === 0) return refuse(pet, 'clean')
      return patch({
        mess: 0,
        joy: clamp(pet.joy + 4, 0, 100),
        care: clamp(pet.care + 1, 0, 100),
      })
    }
  }
}

export function deriveMood(pet: PetState): MoodId {
  if (pet.stage === 'telur') return 'biasa'
  if (pet.asleep) return 'tidur'
  if (pet.food < 25) return 'lapar'
  if (pet.rest < 20) return 'lesu'
  if (pet.joy < 25) return 'sedih'
  if (pet.food > 75 && pet.joy > 75 && pet.rest > 60) return 'senang'
  return 'biasa'
}

export function nextGrowth(pet: PetState): GrowthInfo | null {
  const rule = STAGE_GROWTH[pet.stage]
  if (!rule) return null
  const start = STAGE_START[pet.stage] ?? 0
  const span = Math.max(1, rule.atMs - start)
  const average = (pet.food + pet.joy + pet.rest) / 3
  return {
    next: rule.next,
    progress: clamp((pet.ageMs - start) / span, 0, 1),
    remainingMs: Math.max(0, rule.atMs - pet.ageMs),
    careReady: average >= EVOLVE_MIN_NEED,
    minNeed: EVOLVE_MIN_NEED,
  }
}

export function ageLabel(ms: number): string {
  if (ms < 60_000) return 'baru menetas'
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 60) return `${minutes} menit`
  const hours = Math.floor(minutes / 60)
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const restHours = hours % 24
    return restHours === 0 ? `${days} hari` : `${days} hari ${restHours} jam`
  }
  const restMinutes = minutes % 60
  return restMinutes === 0
    ? `${hours} jam`
    : `${hours} jam ${restMinutes} menit`
}

export function durationLabel(ms: number): string {
  if (ms <= 0) return 'sebentar'
  const minutes = Math.ceil(ms / 60_000)
  if (minutes < 60) return `${minutes} menit`
  const hours = Math.floor(minutes / 60)
  const restMinutes = minutes % 60
  return restMinutes === 0
    ? `${hours} jam`
    : `${hours} jam ${restMinutes} menit`
}
