import type {
  Dir,
  MapId,
  NpcDef,
  SportId,
  SportMeta,
  TeamId,
} from '../../content/pekan/island'

/** Which screen the cartridge is showing. Everything else is data. */
export type Mode =
  | 'title'
  | 'world'
  | 'dialogue'
  | 'versus'
  | 'sport'
  | 'result'
  | 'debug'

/** A companion is cosmetic, but it is the player's own. */
export interface CompanionLook {
  color: number
  ear: number
  acc: number
  name: string
}

export interface PekanSave {
  version: 1
  team: TeamId
  companion: CompanionLook
  scrolls: SportId[]
  coins: number
  map: MapId
  x: number
  y: number
  dir: Dir
  flags: Record<string, boolean>
  updatedAt: number
}

export interface PlayerState {
  /** Map pixel of the player's tile top-left. */
  x: number
  y: number
  dir: Dir
  fromX: number
  fromY: number
  moving: boolean
  /** 0 → 1 across one tile step. */
  t: number
  frame: number
  walkTime: number
}

export interface WorldState {
  map: MapId
  player: PlayerState
  companion: { x: number; y: number }
  time: number
}

export interface DialogueState {
  npc: NpcDef
  index: number
}

export interface VersusState {
  meta: SportMeta
  timer: number
}

export interface ResultState {
  meta: SportMeta
  won: boolean
  playerScore: number
  rivalScore: number
  firstScroll: boolean
  timer: number
}

export interface TitleState {
  index: number
  hasSave: boolean
  confirmingErase: boolean
  /** A short status line under the menu; the renderer owns the wording. */
  message: 'erased' | null
  timer: number
}

export interface DebugState {
  index: number
}

export interface PointerAim {
  /** Design-space coordinates (0–320, 0–240). */
  x: number
  y: number
}

export interface InputFrame {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  /** True only on the frame the direction went down — menus need this. */
  upPressed: boolean
  downPressed: boolean
  leftPressed: boolean
  rightPressed: boolean
  a: boolean
  b: boolean
  /** True only on the frame the button went down. */
  aPressed: boolean
  bPressed: boolean
  /** Last pointer aim while the canvas is being touched/dragged. */
  pointer: PointerAim | null
}

/** What the sport modules receive. Kept small on purpose. */
export interface SportInput {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  aPressed: boolean
  pointer: PointerAim | null
}
