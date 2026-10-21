import { useEffect, useState } from 'react'
import { faRepeat } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ROUTES } from '../../app/routes'
import SiteHeader from '../../components/shared/SiteHeader'
import ManualCorrection from './components/ManualCorrection'
import PokedexCard from './components/PokedexCard'
import Scanner from './components/Scanner'
import { RecognitionError, recognizePokemon } from './services/recognize'
import { TcgdexError, getCardById } from './services/tcgdex'
import type { Confidence, TcgCard } from './types'
import './pokescan.css'

type Status = 'idle' | 'recognizing' | 'looking_up' | 'done' | 'error'

export default function PokeScanPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [card, setCard] = useState<TcgCard | null>(null)
  const [confidence, setConfidence] = useState<Confidence | null>(null)
  const [rawText, setRawText] = useState<string | null>(null)
  const [cleanedText, setCleanedText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugImage, setDebugImage] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function handleImageSelected(file: File) {
    setError(null)
    setCard(null)
    setRawText(null)
    setDebugImage(null)
    setCleanedText(null)
    setPreviewUrl(URL.createObjectURL(file))
    setStatus('recognizing')

    try {
      const result = await recognizePokemon(file)
      setDebugImage(result.debugImage)
      setCleanedText(result.cleanedText)
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
    setDebugImage(null)
    setCleanedText(null)
    setError(null)
  }

  const scanning = status === 'recognizing' || status === 'looking_up'
  const statusText =
    status === 'recognizing'
      ? 'READING CARD NAME...'
      : status === 'looking_up'
        ? 'FETCHING CARD DATA...'
        : ''

  return (
    <div className="pokescan-page">
      <div className="app-shell">
        <SiteHeader
          eyebrow="Cartridge 02 · Pokédex"
          title={
            <>
              POKÉ<em>SCAN</em>
            </>
          }
          backTo={ROUTES.home}
          led="red"
          size="md"
        />

        <div className="dex-layout">
          <div className="dex-frame">
            <div className="dex-body">
              <div className="dex-top-row">
                <div className="dex-lens" aria-hidden="true" />
                <div className="dex-small-leds" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <p className="dex-top-row__label">CARD SCANNER</p>
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
                    <FontAwesomeIcon icon={faRepeat} /> Scan another
                  </button>
                </div>
              )}

              {error && (
                <div className="dex-error" role="alert">
                  <p className="dex-error__text">⚠ {error}</p>
                  <button
                    type="button"
                    className="dex-btn dex-btn--ghost dex-btn--sm"
                    onClick={reset}
                  >
                    Try again
                  </button>
                  <ManualCorrection onPick={handleManualPick} />
                </div>
              )}

              {debugImage && (
                <details className="ocr-debug">
                  <summary>What OCR read</summary>
                  <img src={debugImage} alt="Cropped name-band sent to OCR" />
                  {rawText && <p className="ocr-debug__text">"{rawText}"</p>}
                  {cleanedText && <p className="ocr-debug__text">"{cleanedText}"</p>}
                </details>
              )}

              <div className="dex-grille" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <div className="dex-result">
            {card ? (
              <>
                <PokedexCard card={card} confidence={confidence} rawText={rawText} />
                {confidence === 'low' && (
                  <ManualCorrection onPick={handleManualPick} inline />
                )}
              </>
            ) : (
              <aside className="dex-result__empty">
                <p className="dex-result__empty-title">NO ENTRY YET</p>
                <p className="dex-result__empty-text">
                  Point the lens at the top of a card — or upload a photo — and
                  its Pokédex data prints here.
                </p>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
