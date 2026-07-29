import { useEffect, useRef, useState } from 'react'
import { searchCardsByName, cardImageUrl } from '../services/tcgdex'
import type { CardBrief } from '../types'

interface ManualCorrectionProps {
  onPick: (cardId: string) => void
  inline?: boolean
}

export default function ManualCorrection({ onPick, inline }: ManualCorrectionProps) {
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

  return (
    <div className='flex flex-col justify-center items-center' style={{ marginTop: 10, position: 'relative' }}>
      <input
        type="text"
        value={query}
        placeholder={inline ? 'Not right? Search the card name...' : 'Search card name...'}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        style={{
          width: '100%',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          padding: '8px 10px',
          borderRadius: 6,
          border: inline ? '1px solid var(--paper-line)' : '1px solid rgba(255,255,255,0.3)',
          background: inline ? '#fff' : 'rgba(0,0,0,0.2)',
          color: inline ? 'var(--ink)' : '#fff',
          outline: 'none',
        }}
      />
      {open && (loading || results.length > 0) && (
        <ul className="manual-correction-list py-5">
          {loading && <li className="manual-correction-list__status text-white">Searching…</li>}
          {!loading &&
            results.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  className="manual-correction-list__item"
                  onClick={() => {
                    onPick(card.id)
                    setQuery('')
                    setOpen(false)
                    setResults([])
                  }}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    padding: '8px 10px',
                    borderRadius: 6,
                    color: inline ? 'var(--ink)' : '#fff',
                    outline: 'none',
                    margin:'10px 0'
                  }}
                >
                  {card.image && (
                    <img src={cardImageUrl(card.image, 'low', 'webp') ?? undefined} alt="" />
                  )}
                  <span className='text-white'>{card.name}</span>
                  <span className='text-white'>{card.id}</span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
