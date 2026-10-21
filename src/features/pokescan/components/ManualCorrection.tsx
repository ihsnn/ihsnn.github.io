import { useEffect, useId, useRef, useState } from 'react'
import { cardImageUrl, searchCardsByName } from '../services/tcgdex'
import type { CardBrief } from '../types'

interface ManualCorrectionProps {
  onPick: (cardId: string) => void
  /** Compact variant used inside the printed result card. */
  inline?: boolean
}

/**
 * Escape hatch for a bad OCR read: type a name, get TCGdex candidates, pick one.
 * Styling now lives in pokescan.css instead of inline objects + stray Tailwind
 * utilities, so the dropdown can actually be positioned as a dropdown.
 */
export default function ManualCorrection({ onPick, inline }: ManualCorrectionProps) {
  const inputId = useId()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CardBrief[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const thisRequestId = ++requestIdRef.current

    debounceRef.current = setTimeout(async () => {
      try {
        const cards = await searchCardsByName(trimmed, 8)
        if (requestIdRef.current === thisRequestId) {
          setResults(cards)
          setLoading(false)
        }
      } catch {
        if (requestIdRef.current === thisRequestId) {
          setResults([])
          setLoading(false)
        }
      }
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function pick(cardId: string) {
    onPick(cardId)
    setQuery('')
    setOpen(false)
    setResults([])
  }

  return (
    <div className={`manual-correction${inline ? ' manual-correction--inline' : ''}`}>
      <label className="sr-only" htmlFor={inputId}>
        Cari nama kartu
      </label>
      <input
        id={inputId}
        type="text"
        className="manual-correction__input"
        value={query}
        autoComplete="off"
        placeholder={
          inline ? 'Not right? Search the card name…' : 'Search card name…'
        }
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
      />

      {open && (loading || results.length > 0) && (
        <ul className="manual-correction__list" aria-live="polite">
          {loading && <li className="manual-correction__status">Searching…</li>}

          {!loading &&
            results.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  className="manual-correction__item"
                  onClick={() => pick(card.id)}
                >
                  {card.image ? (
                    <img
                      src={cardImageUrl(card.image, 'low', 'webp') ?? undefined}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  <span className="manual-correction__name">{card.name}</span>
                  <span className="manual-correction__id">{card.id}</span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
