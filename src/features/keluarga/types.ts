export type Direction = 'up' | 'down' | 'left' | 'right'

export type SkinId = 'light' | 'warm' | 'tan' | 'deep'
export type HairStyleId = 'short' | 'side' | 'curly' | 'buzz'
export type HairColorId = 'black' | 'darkBrown' | 'brown' | 'ash'
export type ShirtId = 'charcoal' | 'teal' | 'cream' | 'coral' | 'olive'
export type AccessoryId = 'none' | 'glasses' | 'cap'

export interface Appearance {
  skin: SkinId
  hairStyle: HairStyleId
  hairColor: HairColorId
  shirt: ShirtId
  accessory: AccessoryId
}

export interface CharacterState {
  name: string
  appearance: Appearance
}

export interface PlayerPosition {
  x: number
  y: number
  dir: Direction
}

export interface StorySave {
  version: 1
  character: CharacterState
  examined: string[]
  thought: string | null
  chapterComplete: boolean
  player: PlayerPosition | null
  updatedAt: number
}

export type FurnitureKind =
  | 'bed'
  | 'shelf'
  | 'desk'
  | 'wardrobe'
  | 'fan'
  | 'windowNorth'
  | 'windowEast'
  | 'ac'
  | 'door'
  | 'rug'

export interface RoomObject {
  id: string
  label: string
  kind: FurnitureKind
  x: number
  y: number
  w: number
  h: number
  solid: boolean
  wall: boolean
  memory: boolean
  lines: string[]
}

export interface RoomObjectCopy {
  label: string
  memory: boolean
  lines: string[]
}

export interface DialogueState {
  speaker: string
  lines: string[]
  index: number
  next: 'choice' | null
}

export interface ThoughtOption {
  id: string
  label: string
  result: string
}

export type GamePhase = 'title' | 'play'
