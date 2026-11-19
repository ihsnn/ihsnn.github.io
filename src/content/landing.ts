/**
 * Landing page copy.
 *
 * Kept as data so the cover can be re-worded without touching layout. Counts
 * are never typed in here — the nav reads `CARTRIDGES.length`.
 */

export interface HeroAction {
  /** Which handler the cover wires up; the label/glyph stay here. */
  id: 'browse' | 'shuffle'
  label: string
  /** Decorative glyph printed after the label. */
  glyph: string
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
  actions: HeroAction[]
  /** Caption above the numbered shelf shortcuts. */
  quickLabel: string
  meta: string[]
}

export const HERO: HeroCopy = {
  eyebrow: 'Personal playground',
  titleTop: 'Nostalgic hardware,',
  titleBottom: 'rebuilt in the',
  titleChip: 'browser',
  lede: 'A shelf of small, playful interfaces — old machines, one loud arcade cabinet and one small family story, rebuilt with real CSS, real audio and far too much attention to a 1989 plastic shell. Pick a cartridge and boot it up; everything runs in your browser.',
  actions: [
    { id: 'browse', label: 'Browse the shelf', glyph: '↓', primary: true },
    { id: 'shuffle', label: 'Surprise me', glyph: '→' },
  ],
  quickLabel: 'Quick insert',
  meta: ['No sign-up', 'No backend', 'Sound included'],
}

/** Section id the cover's "browse" action scrolls to. */
export const SHELF_ID = 'hub-shelf'

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

/**
 * What is moulded into the plastic and printed on the sticker of every
 * cartridge on the shelf. Project-specific copy lives in `content/projects.ts`.
 */
export const SHELF = {
  /** Embossed on the shell's logo plate. */
  logo: 'IHSNN',
  logoSub: 'GAMES',
  /** Printed up the right side of the label. */
  sideOut: 'THIS SIDE OUT',
  /** Small print above the title on the sticker. */
  labelKicker: 'IHSNN ORIGINAL',
  /** Sticker footer, next to the copyright year. */
  labelMark: '8-BIT',
  /** Caption link at the bottom of each card. */
  cta: 'Insert cartridge',
}
