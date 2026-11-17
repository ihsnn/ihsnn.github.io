import { ROUTES } from '../app/routes'

/**
 * The cartridge shelf. Adding an entry here is enough to ship a new project:
 * the landing page renders it and the cartridge art is derived from the
 * colours below.
 */
export interface Cartridge {
  /** Stable id, never shown — used as React key and for analytics later. */
  id: string
  /** Catalog number, shown as "NO. 01" — order they were added, oldest first. */
  catalogNo: string
  title: string
  tagline: string
  route: string
  /** Cartridge shell color. Pick something that nods to the project itself. */
  color: string
  colorDark: string
  labelColor: string
  /** Part number printed up the left edge of the sticker, DMG style. */
  code: string
  /** Two or three short chips printed on the cartridge label. */
  tags: string[]
  /** Shown as "© 2024" on the label; keeps the shelf feeling dated. */
  year: string
}

export const CARTRIDGES: readonly Cartridge[] = [
  {
    id: 'gameboy',
    catalogNo: '01',
    title: 'GAME BOY',
    tagline:
      'A hand-built replica console — press start for a message, and take the D-pad for a walk.',
    route: ROUTES.gameboy,
    color: '#8b8f98',
    colorDark: '#4a4e56',
    labelColor: '#eae6da',
    code: 'DMG-GB-USA',
    tags: ['CSS chassis', 'Web audio', 'Keyboard'],
    year: '2024',
  },
  {
    id: 'pokescan',
    catalogNo: '02',
    title: 'POKÉSCAN',
    tagline:
      'Point it at a Pokémon TCG card and get the set, HP, attacks and artwork back — read on-device.',
    route: ROUTES.pokescan,
    color: '#e3350d',
    colorDark: '#7d1a06',
    labelColor: '#ffcb05',
    code: 'DMG-PS-USA',
    tags: ['Tesseract OCR', 'TCGdex', 'Camera'],
    year: '2025',
  },
  {
    id: 'arcade',
    catalogNo: '03',
    title: 'NEON BREAKER',
    tagline:
      'A brick-busting upright cabinet: six neon stages, chiptune clatter and a high score worth defending.',
    route: ROUTES.arcade,
    color: '#2a1b4d',
    colorDark: '#0e0820',
    labelColor: '#ff5c9a',
    code: 'DMG-NB-USA',
    tags: ['Canvas', 'Web audio', 'High score'],
    year: '2026',
  },
  {
    id: 'keluarga',
    catalogNo: '04',
    title: 'KELUARGA KECIL-KECILAN',
    tagline:
      'A GBC-style family story: build yourself, wander a small room, and keep the memories that follow.',
    route: ROUTES.keluarga,
    color: '#c9a227',
    colorDark: '#6f4f0d',
    labelColor: '#ffe8a3',
    code: 'DMG-KK-USA',
    tags: ['Story', 'Pixel art', 'Mobile'],
    year: '2026',
  },
  {
    id: 'rakcerita',
    catalogNo: '05',
    title: 'RAK CERITA KALUNA',
    tagline:
      'Four picture books on one shelf: tap the stars, sing the AIUEO song, and tidy a bookshelf that never stays tidy.',
    route: ROUTES.rakcerita,
    color: '#2e8c8c',
    colorDark: '#154a4a',
    labelColor: '#ffe9b8',
    code: 'DMG-RC-USA',
    tags: ['Four stories', 'Web audio', 'Read aloud'],
    year: '2026',
  },
]
