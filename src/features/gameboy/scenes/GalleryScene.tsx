import { useRecoilValue } from 'recoil'
import { GALLERY_CAPTION } from '../../../content/gameboy'
import { GALLERY_IMAGES } from '../../../lib/assets'
import { gameBoyGalleryIndexState } from '../../../state/gameboy'

const pad = (value: number) => String(value).padStart(2, '0')

export default function GalleryScene() {
  const index = useRecoilValue(gameBoyGalleryIndexState)
  // Defensive: the index is user-driven and the photo list can shrink.
  const safeIndex = Math.min(Math.max(index, 0), GALLERY_IMAGES.length - 1)
  const photo = GALLERY_IMAGES[safeIndex]

  if (!photo) {
    return (
      <div className="gb-scene gb-scene--center">
        <p className="gb-hint">Belum ada foto.</p>
      </div>
    )
  }

  return (
    <div className="gb-scene gb-scene--center">
      <h1 className="gb-scene__title gb-scene__title--small">Gallery</h1>
      <img
        className="gb-gallery__photo"
        src={photo.src}
        alt={photo.alt}
        width={352}
        height={316}
      />
      <p className="gb-gallery__counter">
        {pad(safeIndex + 1)} / {pad(GALLERY_IMAGES.length)}
      </p>
      <p className="gb-gallery__caption">{GALLERY_CAPTION}</p>
    </div>
  )
}
