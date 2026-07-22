import type { Pokemon } from '../types'

const BASE_URL = 'https://pokeapi.co/api/v2'

export class PokeApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'PokeApiError'
    this.status = status
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new PokeApiError(
      res.status === 404 ? 'No Pokémon found with that name.' : `PokeAPI request failed (${res.status})`,
      res.status
    )
  }
  return res.json() as Promise<T>
}

// Normalizes whatever the recognizer returns ("Pikachu", "pikachu ", "PIKACHU")
// into the slug PokeAPI expects.
function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[.'’]/g, '')
}

function capitalize(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

// Minimal shapes of the PokeAPI responses we actually read.
interface RawPokemonResponse {
  id: number
  name: string
  height: number
  weight: number
  types: { type: { name: string } }[]
  abilities: { ability: { name: string }; is_hidden: boolean }[]
  stats: { stat: { name: string }; base_stat: number }[]
  sprites: {
    front_default: string | null
    other?: {
      'official-artwork'?: { front_default: string | null; front_shiny: string | null }
    }
  }
  cries?: { latest: string }
}

interface RawSpeciesResponse {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[]
  genera: { genus: string; language: { name: string } }[]
  color: { name: string } | null
}

interface RawPokemonListResponse {
  results: { name: string }[]
}

/**
 * Fetch full display data for a Pokémon by name or national dex number.
 * Combines /pokemon (stats, types, sprites) with /pokemon-species (flavor text, color).
 */
export async function getPokemonByName(nameOrId: string | number): Promise<Pokemon> {
  const slug = typeof nameOrId === 'number' ? nameOrId : normalizeName(nameOrId)

  const pokemon = await fetchJson<RawPokemonResponse>(`${BASE_URL}/pokemon/${slug}`)
  const species = await fetchJson<RawSpeciesResponse>(`${BASE_URL}/pokemon-species/${pokemon.id}`)

  const flavorEntry = species.flavor_text_entries.find((e) => e.language.name === 'en')
  const genusEntry = species.genera.find((e) => e.language.name === 'en')

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: capitalize(pokemon.name),
    height: pokemon.height,
    weight: pokemon.weight,
    types: pokemon.types.map((t) => t.type.name),
    abilities: pokemon.abilities.map((a) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
    })),
    stats: pokemon.stats.map((s) => ({
      name: s.stat.name,
      base: s.base_stat,
    })),
    sprite:
      pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default,
    spriteShiny: pokemon.sprites.other?.['official-artwork']?.front_shiny ?? null,
    cry: pokemon.cries?.latest ?? null,
    flavorText: flavorEntry ? flavorEntry.flavor_text.replace(/[\n\f\u00ad]/g, ' ') : '',
    genus: genusEntry ? genusEntry.genus : '',
    color: species.color?.name ?? 'gray',
  }
}

/** Search-as-you-type helper: pulls the full name list once and filters client-side. */
let nameListCache: string[] | null = null
export async function getAllPokemonNames(): Promise<string[]> {
  if (nameListCache) return nameListCache
  const data = await fetchJson<RawPokemonListResponse>(`${BASE_URL}/pokemon?limit=2000`)
  nameListCache = data.results.map((p) => p.name)
  return nameListCache
}
