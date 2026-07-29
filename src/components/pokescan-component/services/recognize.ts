import { readCardName } from './ocr'
import { cleanOcrText, matchCard } from './nameMatcher'
import { searchCardsByName, getCardById } from './tcgdex'
import type { RecognitionResult } from '../types'

export class RecognitionError extends Error {
  /** Data URL of the exact crop OCR saw — attached so the UI can show it even on failure. */
  debugImage?: string
  constructor(message: string, debugImage?: string) {
    super(message)
    this.name = 'RecognitionError'
    this.debugImage = debugImage
  }
}

// Below this similarity score, the OCR read is probably too garbled (or the
// photo isn't a Pokémon card at all) to trust as an automatic match.
const CONFIDENCE_THRESHOLD = 0.55

/**
 * Reads a Pokémon TCG card's name band, searches TCGdex for candidates, and
 * fetches the full matching card (real HP, attacks, artwork, set info).
 * OCR and text cleanup run on-device; the TCGdex lookup is a network call.
 */
export async function recognizePokemon(imageFile: File): Promise<RecognitionResult> {
  const { text: rawText, debugImage } = await readCardName(imageFile)
  const cleaned = cleanOcrText(rawText)

  if (!cleaned) {
    throw new RecognitionError(
      "Couldn't read any text in the name area. Try a straighter, better-lit photo with the card's full top edge visible.",
      debugImage
    )
  }

  // Try the full cleaned string first; if OCR mangled part of it, fall back
  // to searching by each individual word so a garbled second word doesn't
  // sink an otherwise-readable name.
  let candidates = await searchCardsByName(cleaned)
  if (candidates.length === 0) {
    for (const word of cleaned.split(' ')) {
      if (word.length < 3) continue
      candidates = await searchCardsByName(word)
      if (candidates.length > 0) break
    }
  }

  if (candidates.length === 0) {
    throw new RecognitionError(`Read "${rawText.trim()}" but couldn't find a matching card.`, debugImage)
  }

  const match = matchCard(cleaned, candidates)
  if (!match) {
    throw new RecognitionError(`Read "${rawText.trim()}" but couldn't find a matching card.`, debugImage)
  }

  const card = await getCardById(match.brief.id)

  return {
    card,
    confidence: match.score >= CONFIDENCE_THRESHOLD ? 'high' : 'low',
    rawText: rawText.trim(),
    debugImage,
    cleanedText: cleaned
  }
}