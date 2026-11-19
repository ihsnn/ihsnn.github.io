/**
 * Shared vocabulary for the WARKOP cartridge.
 *
 * The engine owns the numbers; this module only names the shapes that cross
 * between the engine, the canvas renderer and React.
 */

export type ItemId = 'kopi' | 'teh' | 'mie' | 'nasi' | 'gorengan'

export type Phase = 'closed' | 'open' | 'summary'

export type CustomerState = 'walking' | 'waiting' | 'happy' | 'leaving'

export interface MenuItem {
  id: ItemId
  /** Label moulded on the register key. */
  name: string
  label: string
  price: number
  prepMs: number
  /** Key colour and the ink that reads on it. */
  color: string
  ink: string
  edge: string
}

export interface CustomerView {
  id: number
  /** Current x, animated by the engine (seats are fixed). */
  x: number
  order: ItemId[]
  /** 0–1 patience left; drives the bar and the worried face. */
  patience: number
  state: CustomerState
  angry: boolean
  /** 0–5, picks shirt/skin/hair without random jitter while drawing. */
  variant: number
}

export interface FloatFx {
  id: number
  kind: 'serve' | 'miss'
  x: number
  y: number
  age: number
  text: string
}

export interface WarkopView {
  phase: Phase
  remainingMs: number
  coins: number
  best: number
  served: number
  missed: number
  newRecord: boolean
  customers: readonly CustomerView[]
  inventory: Record<ItemId, number>
  /** Remaining prep ms per station; 0 means idle. */
  stations: Record<ItemId, number>
  effects: readonly FloatFx[]
}

export interface WarkopSnapshot {
  phase: Phase
  coins: number
  best: number
  served: number
  missed: number
  remainingMs: number
  newRecord: boolean
  inventory: Record<ItemId, number>
  /** 0–1 progress of each station, for the register keys. */
  cooking: Record<ItemId, number>
  customerCount: number
  burners: number
  burnerLimit: number
}

export type WarkopEvent =
  | 'open'
  | 'cook'
  | 'ready'
  | 'serve'
  | 'miss'
  | 'busy'
  | 'close'
  | 'record'
  | 'ui'
