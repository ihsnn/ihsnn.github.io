import { useEffect, useState } from 'react'
import { getAllPokemonNames } from '../services/pokeapi'

interface ManualCorrectionProps {
  onPick: (name: string) => void
  inline?: boolean
}

export default function ManualCorrection({ onPick, inline }: ManualCorrectionProps) {
  const [query, setQuery] = useState('')
  const [allNames, setAllNames] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    getAllPokemonNames().then(setAllNames)
  }, [])

  const matches =
    query.trim().length >= 2
      ? allNames.filter((n) => n.includes(query.trim().toLowerCase())).slice(0, 6)
      : []

  return (
    <div style={{ marginTop: 10, position: 'relative' }}>
      <input
        type="text"
        value={query}
        placeholder={inline ? 'Not right? Search the correct name...' : 'Search Pokémon name...'}
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
      {open && matches.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: '4px 0 0',
            padding: 0,
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            borderRadius: 6,
            boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            zIndex: 5,
          }}
        >
          {matches.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => {
                  onPick(name)
                  setQuery('')
                  setOpen(false)
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--ink)',
                  textTransform: 'capitalize',
                }}
              >
                {name.replace(/-/g, ' ')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
