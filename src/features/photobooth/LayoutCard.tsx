import type { CSSProperties } from 'react'
import type { StripLayout } from '../../content/photobooth'
import type { PhotoBitmap } from './art'
import { STRIP_THUMB_SCALE } from './render'
import StripCanvas from './StripCanvas'

interface LayoutCardProps {
  layout: StripLayout
  selected: boolean
  onSelect: (id: string) => void
}

/**
 * Stable empty list: a fresh array on every render would make the thumbnail
 * canvas repaint whenever the booth state ticks (countdown, flash, …).
 */
const EMPTY_PHOTOS: readonly (PhotoBitmap | null)[] = []

/**
 * A picker card whose artwork is the real renderer at thumbnail scale. The
 * chosen colours only theme the frame around the canvas, so the card cannot
 * promise a design the strip does not deliver.
 */
export default function LayoutCard({
  layout,
  selected,
  onSelect,
}: LayoutCardProps) {
  const style = {
    '--card-base': layout.theme.base,
    '--card-glow': layout.theme.glow,
    '--card-ink': layout.theme.ink,
    '--card-accent': layout.theme.accent,
  } as CSSProperties

  return (
    <button
      type="button"
      className={`booth-card${selected ? ' is-selected' : ''}`}
      style={style}
      data-shine={layout.shine}
      onClick={() => onSelect(layout.id)}
      aria-pressed={selected}
      title={layout.blurb}
    >
      <span className="booth-card__sheen" aria-hidden="true" />
      <span className="booth-card__thumb">
        <StripCanvas
          layout={layout}
          photos={EMPTY_PHOTOS}
          scale={STRIP_THUMB_SCALE}
          label={`${layout.name}, ${layout.slots} {layout.slots === 1 ? 'photo' : 'photos'}`}
        />
      </span>
      <span className="booth-card__text">
        <span className="booth-card__category">{layout.category}</span>
        <span className="booth-card__name">{layout.name}</span>
        <span className="booth-card__slots">
          {Array.from({ length: layout.slots }, (_, index) => (
            <i key={index} aria-hidden="true" />
          ))}
          {layout.slots} {layout.slots === 1 ? 'photo' : 'photos'}
        </span>
      </span>
      {selected && (
        <span className="booth-card__check" aria-hidden="true">
          ✓
        </span>
      )}
    </button>
  )
}
