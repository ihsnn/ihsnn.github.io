import type { CardBrief, TcgCard } from '../types'

// English by default. TCGdex supports 9+ languages (change 'en' to switch,
// e.g. 'fr', 'ja') — see https://tcgdex.dev/rest for the full list.
const BASE_URL = 'https://api.tcgdex.net/v2/en'

export class TcgdexError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'TcgdexError'
    this.status = status
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new TcgdexError(
      res.status === 404 ? 'No card found.' : `TCGdex request failed (${res.status})`,
      res.status
    )
  }
  return res.json() as Promise<T>
}

/**
 * Searches cards by name. TCGdex does a case-insensitive "contains" match by
 * default, across every printed card in every set/era — capped to a page of
 * results since a common name like "pikachu" can match 100+ prints.
 *
 * Note: this searches the whole physical card database, not just TCG Pocket.
 * To scope results to TCG Pocket only, add `&set.serie.id=tcgp` below (TCG
 * Pocket cards live under the "tcgp" series — see https://tcgdex.dev/tcg-pocket).
 */
export async function searchCardsByName(name: string, limit = 30): Promise<CardBrief[]> {
  const params = new URLSearchParams({
    name,
    'pagination:page': '1',
    'pagination:itemsPerPage': String(limit),
  })
  return fetchJson<CardBrief[]>(`${BASE_URL}/cards?${params.toString()}`)
}

/** Fetches the full card object (attacks, weaknesses, set, image, etc.) by id. */
export async function getCardById(id: string): Promise<TcgCard> {
  return fetchJson<TcgCard>(`${BASE_URL}/cards/${encodeURIComponent(id)}`)
}

export type ImageQuality = 'high' | 'low'
export type ImageExtension = 'webp' | 'png' | 'jpg'

/**
 * TCGdex image URLs come back without an extension — you append the quality
 * and format you want. webp is recommended for web display; png if you need
 * a transparent background in a non-webp format.
 */
export function cardImageUrl(
  image: string | null | undefined,
  quality: ImageQuality = 'high',
  extension: ImageExtension = 'webp'
): string | null {
  if (!image) return null
  return `${image}/${quality}.${extension}`
}
