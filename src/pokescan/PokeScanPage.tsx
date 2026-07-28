import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Scanner from './components/Scanner'
import PokedexCard from './components/PokedexCard'
import ManualCorrection from './components/ManualCorrection'
import { recognizePokemon, RecognitionError } from './services/recognize'
import { getCardById, TcgdexError } from './services/tcgdex'
import type { Confidence, TcgCard } from './types'
import './pokescan.css'

type Status = 'idle' | 'recognizing' | 'looking_up' | 'done' | 'error'

export default function PokeScanPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [card, setCard] = useState<TcgCard | null>(null)
  const [confidence, setConfidence] = useState<Confidence | null>(null)
  const [rawText, setRawText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function handleImageSelected(file: File) {
    setError(null)
    setCard(null)
    setRawText(null)
    setPreviewUrl(URL.createObjectURL(file))
    setStatus('recognizing')

    try {
      const result = await recognizePokemon(file)
      setConfidence(result.confidence)
      setRawText(result.rawText)
      setCard(result.card)
      setStatus('done')
    } catch (err) {
      console.error(err)
      if (err instanceof RecognitionError) {
        setError(err.message)
      } else if (err instanceof TcgdexError) {
        setError(`Found a name match but couldn't load the card's details.`)
      } else {
        setError('Something went wrong. Try again.')
      }
      setStatus('error')
    }
  }

  async function handleManualPick(cardId: string) {
    setError(null)
    setStatus('looking_up')
    try {
      const data = await getCardById(cardId)
      setCard(data)
      setConfidence('high')
      setStatus('done')
    } catch (err) {
      console.error(err)
      setError('Could not load that card.')
      setStatus('error')
    }
  }

  function reset() {
    setStatus('idle')
    setPreviewUrl(null)
    setCard(null)
    setRawText(null)
    setError(null)
  }

  const scanning = status === 'recognizing' || status === 'looking_up'
  const statusText =
    status === 'recognizing' ? 'READING CARD NAME...' : status === 'looking_up' ? 'FETCHING CARD DATA...' : ''

  return (
    <div className="pokescan-page">
      <div className="app-shell">
        <div className="dex-frame">
          <div className="dex-brand">
            <Link to="/" className="dex-brand__back" title="Back to portfolio">
              ←
            </Link>
            <span className="dex-brand__dot" />
            <span className="dex-brand__title">
              POKÉ<span>SCAN</span>
            </span>
          </div>

          <div className="dex-body">
            <div className="dex-top-row">
              <div className="dex-lens" />
              <div className="dex-small-leds">
                <span />
                <span />
                <span />
              </div>
            </div>

            <Scanner
              onImageSelected={handleImageSelected}
              scanning={scanning}
              previewUrl={previewUrl}
              statusText={statusText}
            />

            {status === 'done' && (
              <div className="dex-controls">
                <button type="button" className="dex-btn dex-btn--primary" onClick={reset}>
                  🔄 Scan Another
                </button>
              </div>
            )}

            {error && (
              <div className="dex-error">
                ⚠ {error}
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="dex-btn dex-btn--ghost"
                    style={{ padding: '6px 10px', fontSize: 12 }}
                    onClick={reset}
                  >
                    Try again
                  </button>
                </div>
                <ManualCorrection onPick={handleManualPick} />
              </div>
            )}

            <div className="dex-grille">
              <span />
              <span />
              <span />
            </div>
          </div>

          {card && (
            <>
              <PokedexCard card={card} confidence={confidence} rawText={rawText} />
              {confidence === 'low' && <ManualCorrection onPick={handleManualPick} inline />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
