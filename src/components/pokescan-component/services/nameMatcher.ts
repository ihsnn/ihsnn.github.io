import type { NameMatch } from '../types'

// TCG-specific tokens that ride along with the name in the name band but
// aren't part of the species name itself. Stripped before matching.
const CARD_NOISE_WORDS = [
  'basic', 'stage 1', 'stage 2', 'stage', 'v', 'vmax', 'vstar', 'gx', 'ex',
  'break', 'prime', 'lv.x', 'lvx', 'star', 'shining', 'radiant', 'dark',
  'light', 'galarian', 'alolan', 'hisuian', 'paldean', 'mega', 'tera',
  'restored', 'legend',
]

const SYMBOL_MAP: Record<string, string> = {
  '♀': '-f',
  '♂': '-m',
}

/**
 * Cleans raw OCR output from a card's name band into something matchable:
 * strips HP numbers, stray symbols, and TCG suffix words, but keeps gender
 * symbols since PokeAPI encodes those into the slug (nidoran-f / nidoran-m).
 */
export function cleanOcrText(raw: string): string {
  let text = raw

  for (const [symbol, replacement] of Object.entries(SYMBOL_MAP)) {
    text = text.split(symbol).join(replacement)
  }

  text = text
    .replace(/\d+\s*HP/gi, ' ')
    .replace(/[^a-zA-Z0-9\-\s]/g, ' ')
    .toLowerCase()

  const words = text.split(/\s+/).filter(Boolean)
  const kept = words.filter((w) => !CARD_NOISE_WORDS.includes(w))

  return (kept.length ? kept : words).join(' ').trim()
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function similarity(a: string, b: string): number {
  if (!a.length && !b.length) return 1
  const dist = levenshtein(a, b)
  return 1 - dist / Math.max(a.length, b.length)
}

/**
 * Finds the closest PokéAPI name slug to the (cleaned) OCR text.
 * Tries the full cleaned string first, then each individual word — OCR
 * often drops or garbles one word in a multi-word read, so single-word
 * species names ("pikachu") still match even if noise words fail to strip.
 */
export function matchPokemonName(cleanedText: string, allNames: string[]): NameMatch | null {
  if (!cleanedText) return null

  const candidates = [cleanedText, ...cleanedText.split(' ')].filter((c) => c.length >= 3)

  let best: NameMatch | null = null
  for (const candidate of candidates) {
    for (const name of allNames) {
      const baseName = name.split('-')[0] // compare against base species for hyphenated slugs
      const score = Math.max(similarity(candidate, name), similarity(candidate, baseName))
      if (!best || score > best.score) {
        best = { name, score }
      }
    }
  }

  return best
}
