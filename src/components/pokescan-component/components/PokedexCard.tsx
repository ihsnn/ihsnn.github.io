import { TYPE_COLORS, STAT_LABELS, STAT_BAR_MAX } from '../constants'
import type { Confidence, Pokemon } from '../types'

interface PokedexCardProps {
  pokemon: Pokemon
  confidence: Confidence | null
  rawText: string | null
}

export default function PokedexCard({ pokemon, confidence, rawText }: PokedexCardProps) {
  return (
    <div className="result-wrap">
      <div className="result-card">
        <div className="result-header">
          <div>
            <div className="result-id">NO. {String(pokemon.id).padStart(4, '0')}</div>
            <div className="result-name">{pokemon.displayName}</div>
            <div className="result-genus">{pokemon.genus}</div>
          </div>
          <div className="result-sprite-wrap">
            {pokemon.sprite && <img src={pokemon.sprite} alt={pokemon.displayName} />}
          </div>
        </div>

        <div className="type-row">
          {pokemon.types.map((type) => (
            <span key={type} className="type-chip" style={{ background: TYPE_COLORS[type] || '#777' }}>
              {type}
            </span>
          ))}
        </div>

        {pokemon.flavorText && <p className="result-flavor">{pokemon.flavorText}</p>}

        <div className="stat-grid">
          {pokemon.stats.map((stat) => (
            <div className="stat-row" key={stat.name}>
              <span className="stat-label">{STAT_LABELS[stat.name] || stat.name}</span>
              <span className="stat-track">
                <span
                  className="stat-fill"
                  style={{ width: `${Math.min(100, (stat.base / STAT_BAR_MAX) * 100)}%` }}
                />
              </span>
              <span className="stat-value">{stat.base}</span>
            </div>
          ))}
        </div>

        <div className="result-meta-row">
          <span>HT {(pokemon.height / 10).toFixed(1)}m</span>
          <span>WT {(pokemon.weight / 10).toFixed(1)}kg</span>
        </div>

        {confidence === 'low' && (
          <div className="confidence-flag">
            ⚠ Low-confidence match{rawText ? ` — card read as "${rawText}"` : ''}. Verify below.
          </div>
        )}
      </div>
    </div>
  )
}
