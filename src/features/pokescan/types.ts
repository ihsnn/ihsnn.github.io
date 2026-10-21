export interface CardBrief {
  id: string
  localId: string
  name: string
  image: string | null
}

export interface CardAttack {
  name: string
  cost?: string[]
  damage?: number | string
  effect?: string
}

export interface CardWeaknessResistance {
  type: string
  value: string
}

export interface CardSet {
  id: string
  name: string
  logo?: string | null
  symbol?: string | null
}

export type CardCategory = 'Pokemon' | 'Trainer' | 'Energy'

export interface TcgCard {
  id: string
  localId: string
  name: string
  image: string | null
  category: CardCategory
  illustrator?: string
  rarity?: string
  set: CardSet

  // Pokémon-only fields
  hp?: number
  types?: string[]
  evolveFrom?: string
  description?: string
  stage?: string
  attacks?: CardAttack[]
  weaknesses?: CardWeaknessResistance[]
  resistances?: CardWeaknessResistance[]
  retreat?: number

  // Trainer/Energy-only fields
  effect?: string
  trainerType?: string
  energyType?: string
}

export type Confidence = 'high' | 'low'

export interface RecognitionResult {
  card: TcgCard
  confidence: Confidence
  rawText: string,
  debugImage: string,
  cleanedText: string
}

export interface CardMatch {
  brief: CardBrief
  score: number
}
