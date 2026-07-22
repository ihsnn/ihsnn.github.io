export interface PokemonStat {
  name: string
  base: number
}

export interface PokemonAbility {
  name: string
  isHidden: boolean
}

export interface Pokemon {
  id: number
  name: string
  displayName: string
  height: number // decimetres
  weight: number // hectograms
  types: string[]
  abilities: PokemonAbility[]
  stats: PokemonStat[]
  sprite: string | null
  spriteShiny: string | null
  cry: string | null
  flavorText: string
  genus: string
  color: string
}

export type Confidence = 'high' | 'low'

export interface RecognitionResult {
  name: string
  confidence: Confidence
  rawText: string
}

export interface NameMatch {
  name: string
  score: number
}
