import char1 from '../assets/images/char1.png'
import envelopeClose from '../assets/images/envelope-close.png'
import envelopeOpen from '../assets/images/envelope-open.png'
import headphone from '../assets/images/headphone.png'
import gallery1 from '../assets/images/gallery/1.png'
import gallery2 from '../assets/images/gallery/2.png'
import gallery3 from '../assets/images/gallery/3.png'
import gallery4 from '../assets/images/gallery/4.png'
import gallery5 from '../assets/images/gallery/5.png'
import gallery6 from '../assets/images/gallery/6.png'
import gallery7 from '../assets/images/gallery/7.png'
import gallery8 from '../assets/images/gallery/8.png'
import gallery9 from '../assets/images/gallery/9.png'

import beep from '../assets/sounds/beep.wav'
import boop from '../assets/sounds/boop.wav'
import musicHappy1 from '../assets/sounds/music-happy-1.mp3'
import musicHappy2 from '../assets/sounds/music-happy-2.mp3'
import musicHappy3 from '../assets/sounds/music-happy-3.mp3'
import musicHappy4 from '../assets/sounds/music-happy-4.mp3'
import musicRelax1 from '../assets/sounds/music-relax-1.mp3'
import songBirthday from '../assets/sounds/musics/hbd-song.mp3'
import songPaulKim from '../assets/sounds/musics/paul kim-me after you wed ver.mp3'

/**
 * Static media registry — the single place that knows where bytes live.
 *
 * Today every file is imported through Vite, so it is hashed, bundled and
 * served from the same origin as the app.
 *
 * Moving to object storage later (Cloudflare R2 / Images / a CDN) is meant to
 * be a change to this file only:
 *
 *   1. Upload `src/assets/**` to the bucket, keeping the folder shape.
 *   2. Set `VITE_ASSET_BASE_URL` (see `.env.example`) to the public base URL.
 *   3. Replace the `import` statements below with `remote('<path>')` calls —
 *      nothing else in the app changes, because screens only ever read
 *      `IMAGES`, `GALLERY_IMAGES`, `SOUNDS`, `SCENE_MUSIC` and `SONGS`.
 */

const BASE_URL = (import.meta.env.VITE_ASSET_BASE_URL ?? '').replace(/\/+$/, '')

/**
 * Builds an absolute URL for a file that lives in the media bucket.
 * Throws instead of silently shipping a broken `src` when the base URL is
 * missing, so a half-finished migration fails loudly in development.
 */
export function remote(path: string): string {
  if (!BASE_URL) {
    throw new Error(
      `VITE_ASSET_BASE_URL is not set — cannot resolve remote asset "${path}". ` +
        'Keep the bundled imports in src/lib/assets.ts until the bucket is live.',
    )
  }
  return `${BASE_URL}/${path.replace(/^\/+/, '')}`
}

export interface ImageAsset {
  src: string
  /** Alt text lives next to the file so copy never drifts from the picture. */
  alt: string
}

/** Images shown inside the console (not the gallery strip). */
export const IMAGES = {
  character: { src: char1, alt: 'Karakter piksel Ihsnn' },
  envelopeClosed: { src: envelopeClose, alt: 'Amplop tertutup' },
  envelopeOpen: { src: envelopeOpen, alt: 'Amplop yang sudah dibuka' },
  headphone: { src: headphone, alt: 'Headphone' },
} satisfies Record<string, ImageAsset>

/** Gallery strip, in display order. */
export const GALLERY_IMAGES: ImageAsset[] = [
  { src: gallery1, alt: 'Foto kenangan 1' },
  { src: gallery2, alt: 'Foto kenangan 2' },
  { src: gallery3, alt: 'Foto kenangan 3' },
  { src: gallery4, alt: 'Foto kenangan 4' },
  { src: gallery5, alt: 'Foto kenangan 5' },
  { src: gallery6, alt: 'Foto kenangan 6' },
  { src: gallery7, alt: 'Foto kenangan 7' },
  { src: gallery8, alt: 'Foto kenangan 8' },
  { src: gallery9, alt: 'Foto kenangan 9' },
]

/** One-shot UI blips. */
export const SOUNDS = {
  move: beep,
  confirm: boop,
} as const

/** Looping ambience for each console scene. */
export const SCENE_MUSIC = {
  boot: musicHappy1,
  message: musicHappy2,
  start: musicHappy3,
  gallery: musicHappy4,
  letter: musicRelax1,
} as const

/** Full-length tracks shown on the music player screen. */
export const SONGS = {
  paulKim: songPaulKim,
  birthday: songBirthday,
} as const
