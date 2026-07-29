import { TYPE_COLORS } from '../constants'
import { cardImageUrl } from '../services/tcgdex'
import type { Confidence, TcgCard } from '../types'

interface PokedexCardProps {
  card: TcgCard
  confidence: Confidence | null
  rawText: string | null
}

function typeColor(type: string): string {
  return TYPE_COLORS[type.toLowerCase()] || '#777'
}

export default function PokedexCard({ card, confidence, rawText }: PokedexCardProps) {
  const imageUrl = cardImageUrl(card.image, 'high', 'webp')

  return (
    <div className="result-wrap">
      <div className="result-card">
        <div className="result-header">
          <div>
            <div className="result-id">
              {card.set.name.toUpperCase()} · {card.localId}
            </div>
            <div className="result-name">{card.name}</div>
            {card.category === 'Pokemon' && (
              <div className="result-genus">
                {card.stage || 'Basic'}
                {card.evolveFrom ? ` · Evolves from ${card.evolveFrom}` : ''}
              </div>
            )}
            {card.category !== 'Pokemon' && <div className="result-genus">{card.trainerType || card.energyType || card.category}</div>}
          </div>
          {card.hp != null && <div className="result-hp">HP {card.hp}</div>}
        </div>

        {/* The actual scanned card artwork, not a generic sprite */}
        <div className="card-art-wrap py-2">
          {imageUrl ? (
            <img src={imageUrl} alt={card.name} className="card-art" loading="lazy" />
          ) : (
            <div className="card-art-missing">No image available</div>
          )}
        </div>

        {card.types && card.types.length > 0 && (
          <div className="type-row">
            {card.types.map((type) => (
              <span key={type} className="type-chip" style={{ background: typeColor(type) }}>
                {type}
              </span>
            ))}
          </div>
        )}

        {card.description && <p className="result-flavor">{card.description}</p>}
        {card.effect && <p className="result-flavor">{card.effect}</p>}

        {card.attacks && card.attacks.length > 0 && (
          <div className="attack-list">
            {card.attacks.map((attack) => (
              <div className="attack-row" key={attack.name}>
                <div className="attack-row__head">
                  <span className="attack-row__cost">
                    {(attack.cost || []).map((c, i) => (
                      <span key={i} className="cost-pip" style={{ background: typeColor(c) }} title={c} />
                    ))}
                  </span>
                  <span className="attack-row__name">{attack.name}</span>
                  {attack.damage != null && <span className="attack-row__damage">{attack.damage}</span>}
                </div>
                {attack.effect && <p className="attack-row__effect">{attack.effect}</p>}
              </div>
            ))}
          </div>
        )}

        {((card.weaknesses && card.weaknesses.length > 0) || card.retreat != null) && (
          <div className="result-meta-row">
            {card.weaknesses?.map((w) => (
              <span key={w.type}>
                Weak: <b style={{ color: typeColor(w.type) }}>{w.type}</b> {w.value}
              </span>
            ))}
            {card.retreat != null && <span>Retreat: {card.retreat}</span>}
          </div>
        )}

        <div className="result-meta-row result-meta-row--footer">
          {card.rarity && <span>{card.rarity}</span>}
          {card.illustrator && <span>Ill. {card.illustrator}</span>}
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
