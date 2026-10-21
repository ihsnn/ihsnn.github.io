import { ROUTES } from '../app/routes'

/**
 * Landing page copy.
 *
 * Kept as data so the cover can be re-worded without touching layout, and so
 * every number ("02 cartridges") is derived from the cartridge registry.
 */

export interface HeroCta {
  label: string
  route: string
  primary?: boolean
}

export interface HeroCopy {
  eyebrow: string
  /** Display headline, split into intentional lines. */
  titleTop: string
  titleBottom: string
  /** Swapped into the second line as a pixel-font highlight chip. */
  titleChip: string
  lede: string
  ctas: HeroCta[]
  meta: string[]
}

export const HERO: HeroCopy = {
  eyebrow: 'Personal playground',
  titleTop: 'Nostalgic hardware,',
  titleBottom: 'rebuilt in the',
  titleChip: 'browser',
  lede: 'A shelf of small, playful interfaces — old machines rebuilt with real CSS, real audio and far too much attention to a 1989 plastic shell. Pick a cartridge and boot it up; everything runs in your browser.',
  ctas: [
    { label: 'Boot the console', route: ROUTES.gameboy, primary: true },
    { label: 'Scan a card', route: ROUTES.pokescan },
  ],
  meta: ['No sign-up', 'No backend', 'Sound included'],
}

/** Lines printed in the cover terminal. Keep them short — it is a small panel. */
export const BOOT_LINES: Array<{ text: string; dim?: boolean }> = [
  { text: '> boot cartridge' },
  { text: '  mounting shell ....... 660×1080', dim: true },
  { text: '  decoding sprites ..... ok', dim: true },
  { text: '  wiring audio engine .. ok', dim: true },
  { text: '  power switch ......... ready', dim: true },
  { text: '> welcome to the shelf' },
]

export interface FieldNote {
  id: string
  index: string
  title: string
  body: string
}

export const FIELD_NOTES: FieldNote[] = [
  {
    id: 'hand-built',
    index: '01',
    title: 'Hand-built',
    body: 'No UI kit, no template. React, TypeScript and gradients measured by hand against photos of the real hardware.',
  },
  {
    id: 'client-side',
    index: '02',
    title: 'Client-side',
    body: 'OCR, sprites and audio all run in the browser. The only server involved is a public card database.',
  },
  {
    id: 'keyboard-first',
    index: '03',
    title: 'Keyboard first',
    body: 'The console takes WASD, arrows and J/K. Every moulded button is a real focusable control with a label.',
  },
]

/** Extra words woven into the scrolling strip under the shelf. */
export const MARQUEE_WORDS = ['more soon', 'sound on', 'pixels', 'no backend']
