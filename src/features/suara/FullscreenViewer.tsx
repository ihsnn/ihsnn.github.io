import { useCallback, useEffect, useRef, useState } from 'react'
import { CATEGORY_LABEL, SUARA, type SoundItem } from '../../content/suara'
import SoundArt from './SoundArt'
import SoundButton from './SoundButton'
import type { ArtMode } from './storage'

interface FullscreenViewerProps {
  item: SoundItem
  mode: ArtMode
  onMode: (mode: ArtMode) => void
  playing: boolean
  onPlay: () => void
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  index: number
  total: number
}

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * The full-screen picture. A dialog rather than the Fullscreen API alone: it
 * covers the viewport everywhere (iOS Safari still refuses element
 * fullscreen), and the API is offered as an extra button when the browser
 * supports it.
 */
export default function FullscreenViewer({
  item,
  mode,
  onMode,
  playing,
  onPlay,
  onClose,
  onPrev,
  onNext,
  index,
  total,
}: FullscreenViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [native, setNative] = useState(false)

  const close = useCallback(() => {
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {})
    }
    onClose()
  }, [onClose])

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const playButton = panelRef.current?.querySelector<HTMLButtonElement>(
      '.suara-fs__play',
    )
    playButton?.focus()

    return () => {
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onChange = () => setNative(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // While the browser is in real fullscreen, Escape belongs to it; the
        // overlay stays open and a second Escape closes the dialog.
        if (document.fullscreenElement) return
        event.preventDefault()
        close()
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrev()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNext()
        return
      }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, onNext, onPrev])

  const canFullscreen =
    typeof document !== 'undefined' && document.fullscreenEnabled === true

  const toggleNative = () => {
    const node = overlayRef.current
    if (!node) return
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {})
      return
    }
    const result = node.requestFullscreen?.()
    if (result) void result.catch(() => {})
  }

  return (
    <div className="suara-fs" ref={overlayRef} data-mode={mode}>
      <div className="suara-fs__veil" aria-hidden="true" onClick={close} />

      <div
        className="suara-fs__panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="suara-fs-title"
      >
        <div className="suara-fs__bar">
          <p className="suara-fs__count">
            {String(index + 1).padStart(2, '0')}
            <span aria-hidden="true"> / </span>
            {String(total).padStart(2, '0')}
          </p>

          <div className="suara-fs__modes" role="group" aria-label={SUARA.artLegend}>
            {(['pixel', 'real'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`suara-fs__mode${mode === value ? ' is-active' : ''}`}
                aria-pressed={mode === value}
                onClick={() => onMode(value)}
                aria-label={SUARA.artAria(value === 'pixel' ? SUARA.artPixel : SUARA.artReal)}
              >
                {value === 'pixel' ? SUARA.artPixel : SUARA.artReal}
              </button>
            ))}
          </div>

          <div className="suara-fs__tools">
            {canFullscreen && (
              <button
                type="button"
                className="suara-fs__tool"
                onClick={toggleNative}
                aria-pressed={native}
                title={native ? SUARA.exitFullscreen : SUARA.fullscreen}
              >
                <span className="suara-fs__tool-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" focusable="false">
                    {native ? (
                      <path d="M8 3v5H3M12 17v-5h5M3 3l5 5M17 17l-5-5" />
                    ) : (
                      <path d="M3 8V3h5M17 12v5h-5M3 3l5 5M17 17l-5-5" />
                    )}
                  </svg>
                </span>
                <span className="suara-fs__tool-text">
                  {native ? SUARA.exitFullscreen : SUARA.fullscreen}
                </span>
              </button>
            )}
            <button
              type="button"
              className="suara-fs__tool suara-fs__tool--close"
              onClick={close}
              aria-label={SUARA.close}
              title={SUARA.close}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="suara-fs__stage">
          <button
            type="button"
            className="suara-fs__nav suara-fs__nav--prev"
            onClick={onPrev}
            aria-label={SUARA.prev}
            title={SUARA.prev}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M15 4l-8 8 8 8" />
            </svg>
          </button>

          <figure className="suara-fs__figure">
            <SoundArt item={item} mode={mode} eager />
            <figcaption className="suara-fs__stamp" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </figcaption>
          </figure>

          <button
            type="button"
            className="suara-fs__nav suara-fs__nav--next"
            onClick={onNext}
            aria-label={SUARA.next}
            title={SUARA.next}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 4l8 8-8 8" />
            </svg>
          </button>
        </div>

        <div className="suara-fs__info" aria-live="polite">
          <div className="suara-fs__text">
            <p className="suara-fs__cat">{CATEGORY_LABEL[item.category]}</p>
            <h2 className="suara-fs__title" id="suara-fs-title">
              {item.name}
            </h2>
            <p className="suara-fs__note">{item.note}</p>
            <div className="suara-fs__credits">
              <a
                className="suara-fs__credit"
                href={item.sound.credit.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {item.sound.credit.text}
              </a>
              {mode === 'real' && (
                <a
                  className="suara-fs__credit"
                  href={item.photo.credit.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {item.photo.credit.text}
                </a>
              )}
            </div>
          </div>

          <SoundButton
            playing={playing}
            onClick={onPlay}
            label={SUARA.playAria(item.name)}
            text={playing ? SUARA.replay : SUARA.play}
            size="lg"
            className="suara-fs__play"
          />
        </div>
      </div>
    </div>
  )
}
