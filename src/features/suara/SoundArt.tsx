import { useState } from 'react'
import type { SoundItem } from '../../content/suara'
import { usePixelArt } from './pixel'
import type { ArtMode } from './storage'

interface SoundArtProps {
  item: SoundItem
  mode: ArtMode
  className?: string
  /** Hide from the accessibility tree (quiz choices must not name themselves). */
  decorative?: boolean
  eager?: boolean
}

/**
 * Two pictures per sound, chosen by the mode switch:
 *
 *  - **Piksel** — the 8-bit drawing, rasterised through `pixel.ts`.
 *  - **Real** — the photograph, credited in the full-screen view. If the photo
 *    fails to load, the drawing steps in so the card is never blank.
 */
export default function SoundArt({
  item,
  mode,
  className,
  decorative = false,
  eager = false,
}: SoundArtProps) {
  const pixelMode = mode === 'pixel'
  const pixel = usePixelArt(item.src, pixelMode)
  const [photoFailed, setPhotoFailed] = useState(false)

  const drawing = pixelMode || photoFailed
  const src = pixelMode ? pixel ?? item.src : photoFailed ? item.src : item.photo.src
  const alt = decorative ? '' : drawing ? item.alt : item.photo.alt

  return (
    <img
      className={`suara-art${pixelMode ? ' is-pixel' : ''}${className ? ` ${className}` : ''}`}
      src={src}
      alt={alt}
      width={240}
      height={240}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => {
        if (!pixelMode) setPhotoFailed(true)
      }}
      data-art={pixelMode ? 'pixel' : photoFailed ? 'drawing' : 'photo'}
    />
  )
}
