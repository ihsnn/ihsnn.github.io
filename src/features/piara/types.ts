/**
 * Shared vocabulary for the PIARA cartridge.
 *
 * The pet is one small state object: three needs, a care score, an age and a
 * stage. Everything else (mood, growth bar, speech) is derived, so the save
 * file stays tiny and a future cosmetic change cannot corrupt it.
 */

export type StageId = 'telur' | 'bayi' | 'anak' | 'remaja' | 'dewasa'

export type ActionId = 'feed' | 'play' | 'sleep' | 'clean'

export type MoodId = 'tidur' | 'lapar' | 'lesu' | 'sedih' | 'senang' | 'biasa'

/** One-shot animation queued by an action; the renderer clears it by age. */
export type FxKind =
  | 'tap'
  | 'hatch'
  | 'feed'
  | 'play'
  | 'sleep'
  | 'wake'
  | 'clean'
  | 'evolve'

export interface PetState {
  version: 1
  /** Empty until the egg hatches and the player names it. */
  name: string
  stage: StageId
  /** Cracks on the egg, 0–5. Only meaningful while `stage === 'telur'`. */
  taps: number
  bornAt: number | null
  /** Real milliseconds since hatching; drives evolution. */
  ageMs: number
  food: number
  joy: number
  rest: number
  /** Slowly drifts toward the average need, so neglect sticks. */
  care: number
  /** Droppings on the floor, 0–3. */
  mess: number
  lastMessAt: number
  asleep: boolean
  sleepStartedAt: number | null
  /** Epoch ms of the last simulated frame; the save file's clock. */
  lastTick: number
  updatedAt: number
}

export interface GrowthInfo {
  next: StageId
  /** 0–1 toward the next stage by age. */
  progress: number
  remainingMs: number
  /** False while the pet is too hungry/tired to evolve. */
  careReady: boolean
  minNeed: number
}

export type RefusalReason = 'full' | 'tired' | 'asleep' | 'clean' | 'unready'
