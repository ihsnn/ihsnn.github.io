import { readCardName } from './ocr'
import { cleanOcrText, matchPokemonName } from './nameMatcher'
import { getAllPokemonNames } from './pokeapi'
import type { RecognitionResult } from '../types'

export class RecognitionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RecognitionError'
  }
}

// Below this similarity score, the OCR read is probably too garbled (or the
// photo isn't a Pokémon card at all) to trust as an automatic match.
const CONFIDENCE_THRESHOLD = 0.55

/**
 * Reads a Pokémon TCG card's name band and matches it against PokéAPI's
 * species list. Runs entirely on-device — no server, no API key, no cost.
 */
export async function recognizePokemon(imageFile: File): Promise<RecognitionResult> {
  const rawText = await readCardName(imageFile)
  const cleaned = cleanOcrText(rawText)

  if (!cleaned) {
    throw new RecognitionError(
      "Couldn't read any text in the name area. Try a straighter, better-lit photo with the card's full top edge visible."
    )
  }

  const allNames = await getAllPokemonNames()
  const match = matchPokemonName(cleaned, allNames)

  if (!match) {
    throw new RecognitionError(`Read "${rawText.trim()}" but couldn't match it to a Pokémon.`)
  }

  return {
    name: match.name,
    confidence: match.score >= CONFIDENCE_THRESHOLD ? 'high' : 'low',
    rawText: rawText.trim(),
  }
}
