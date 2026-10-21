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
    tags: ['Tesseract OCR', 'TCGdex', 'Camera'],
    year: '2025',
  },
]
