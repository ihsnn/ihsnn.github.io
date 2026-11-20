/**
 * Shared vocabulary for the ANGKUT cartridge.
 *
 * The engine owns the numbers; this module only names the shapes that cross
 * between the level catalogue, the engine, the canvas renderer and React.
 */

export type Phase = 'idle' | 'driving' | 'ended'

/** Why a run stopped. `finish` means the load actually reached the depot. */
export type EndReason = 'fuel' | 'flip' | 'finish'

export const LEVEL_IDS = [
  'pasir',
  'kayu',
  'batu',
  'gas',
  'ternak',
  'semen',
] as const

export type LevelId = (typeof LEVEL_IDS)[number]

/** How the renderer paints a load. */
export type CargoShape =
  | 'sand'
  | 'logs'
  | 'rocks'
  | 'cylinders'
  | 'livestock'
  | 'bags'

/**
 * One load. Mass and height are what make every level play differently:
 * mass slows the truck down, height lifts the centre of gravity, and `slide`
 * decides how much a hard landing throws the load around.
 */
export interface Cargo {
  /** Printed on the load card and the canvas plate. */
  label: string
  /** Which painter the renderer uses. */
  shape: CargoShape
  /** Short word for the HUD chip. */
  short: string
  /** Mass relative to the empty truck (1 = as heavy as the chassis). */
  mass: number
  /** Load size in the bed, design px. */
  height: number
  width: number
  /** Centre of the load in the bed, relative to the bed middle. */
  offset: number
  /** 0–1: how far the load walks when the truck lands hard. */
  slide: number
  /** One line about how the load changes the drive. */
  trait: string
  color: string
  colorDark: string
  accent: string
}

export interface TerrainSpec {
  seed: number
  /** Long hills: height and spacing in design px. */
  amp: number
  wave: number
  /** Small chop on top of the hills. */
  chop: number
  chopWave: number
  /** Average climb as a fraction (0.06 = a 6% grade). */
  grade: number
  /** Kicker ramps along the route, and how tall they are. */
  jumps: number
  jump: number
}

export interface LevelPalette {
  skyTop: string
  skyLow: string
  sun: string
  haze: string
  ridgeFar: string
  ridgeNear: string
  soil: string
  soilDeep: string
  surface: string
  surfaceAlt: string
  /** Ink for floating text drawn on the canvas. */
  ink: string
  /** Headlights and a dark sky. */
  night?: boolean
  /** Falling sleet, drawn by the renderer. */
  rain?: boolean
}

export interface Level {
  id: LevelId
  /** "01" … printed in the level list and on the road sign. */
  no: string
  name: string
  cargo: Cargo
  /** Distance that closes the run, in metres. */
  targetM: number
  terrain: TerrainSpec
  palette: LevelPalette
  /** Surface grip, 1 = dry tarmac, 0.7 = wet mud. */
  grip: number
  /** One line on the level card. */
  tip: string
}

/** Garage levels, 0–3 per part. */
export interface Upgrades {
  engine: number
  tires: number
  tank: number
}

export interface LevelRecord {
  bestM: number
  bestCoins: number
  cleared: boolean
}

export interface Progress {
  coins: number
  upgrades: Upgrades
  levels: Partial<Record<LevelId, LevelRecord>>
}

/** Numbers React needs at ~10 Hz. */
export interface AngkutSnapshot {
  phase: Phase
  levelId: LevelId
  distance: number
  target: number
  bestM: number
  /** km/h, rounded. */
  speed: number
  /** 0–1 of the tank left. */
  fuel: number
  coins: number
  /** Set once the run is over. */
  endReason: EndReason | null
  /** Coins banked by this run, distance bonus included. */
  earned: number
  /** 0–1: how far the load has slid from centre. */
  load: number
  loadShifted: boolean
  airTime: number
  cleared: boolean
  newRecord: boolean
}

/** Text that floats up from the road (coins, landings, warnings). */
export interface FloatFx {
  id: number
  kind: 'coin' | 'fuel' | 'land' | 'slide' | 'air' | 'finish'
  x: number
  y: number
  age: number
  text: string
}

/** Dust and exhaust, simulated so the renderer stays stateless. */
export interface DustFx {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  size: number
  /** Dust is brown, tyre smoke is pale. */
  smoke: boolean
}

export type PickupKind = 'coin' | 'fuel'

export interface Pickup {
  id: number
  kind: PickupKind
  x: number
  y: number
  taken: boolean
}

export interface TruckView {
  x: number
  y: number
  /** Radians, positive = nose down (screen y grows downwards). */
  angle: number
  /** Design px per second along x, signed. */
  speed: number
  rearSpin: number
  frontSpin: number
  /** Suspension compression, design px. */
  rearTravel: number
  frontTravel: number
  rearContact: boolean
  frontContact: boolean
  /** 0–1, used for wheel smoke and engine pitch. */
  throttle: number
  brake: number
}

export interface AngkutView {
  phase: Phase
  level: Level
  /** The road itself, so the renderer draws exactly what the wheels touch. */
  terrain: { heightAt(x: number): number }
  truck: TruckView
  camera: { x: number; y: number }
  pickups: readonly Pickup[]
  effects: readonly FloatFx[]
  dust: readonly DustFx[]
  /** 0–1 fuel, for the gauge drawn on the canvas HUD strip. */
  fuel: number
  /** Metres driven, for the roadside markers. */
  distance: number
  /** Direction of the load slide, -1..1. */
  load: number
  levelCleared: boolean
}

export type AngkutEvent =
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



