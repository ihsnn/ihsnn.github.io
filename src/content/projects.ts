import { ROUTES } from '../app/routes'

/**
 * The cartridge shelf. Adding an entry here is enough to ship a new project:
 * the landing page renders it, the shell uses the colours and part number
 * below, and `features/landing/CartridgeArt.tsx` supplies the label
 * illustration (with a generic pack as the fallback).
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
  {
    id: 'photobooth',
    catalogNo: '06',
    title: 'PHOTOBOOTH',
    tagline:
      'Twenty-five photo strips with foil and gloss: shoot or pick one or two photos, crop them, add a line of text, and download the PNG — nothing leaves the device.',
    route: ROUTES.photobooth,
    color: '#ff5cb8',
    colorDark: '#71103f',
    labelColor: '#fff0f7',
    code: 'DMG-PB-USA',
    tags: ['25 layouts', 'Camera', 'Crop & text'],
    year: '2026',
  },
  {
    id: 'piara',
    catalogNo: '07',
    title: 'PIARA',
    tagline:
      'A pocket creature on a keychain: hatch it, name it, and keep it fed while real time passes — even with the tab closed.',
    route: ROUTES.piara,
    color: '#7ed9c2',
    colorDark: '#2b6f60',
    labelColor: '#f6f1d8',
    code: 'DMG-PR-USA',
    tags: ['Virtual pet', 'Canvas', 'localStorage'],
    year: '2026',
  },
  {
    id: 'warkop',
    catalogNo: '08',
    title: 'WARKOP',
    tagline:
      'A beige cash register at a warkop: four seats and five dishes to keep the queue fed for ninety seconds.',
    route: ROUTES.warkop,
    color: '#d9a13c',
    colorDark: '#7a4a1c',
    labelColor: '#fff3d6',
    code: 'DMG-WK-USA',
    tags: ['Tiny sim', 'Canvas', 'Web audio'],
    year: '2026',
  },
  {
    id: 'todo',
    catalogNo: '09',
    title: 'TO-DO LIST',
    tagline:
      'A 1999 pocket organizer for today’s tasks: type it, tick it, bank the XP and keep the streak alive.',
    route: ROUTES.todo,
    color: '#3b453c',
    colorDark: '#131a14',
    labelColor: '#ffc45b',
    code: 'DMG-TD-USA',
    tags: ['Task list', 'Keyboard', 'localStorage'],
    year: '2026',
  },
  {
    id: 'angkut',
    catalogNo: '10',
    title: 'ANGKUT',
    tagline:
      'A big dump truck on six mountain roads: sand, logs, rock, gas bottles, livestock and cement each change the weight, the grip and the tilt.',
    route: ROUTES.angkut,
    color: '#c2603a',
    colorDark: '#5c2410',
    labelColor: '#ffe0a8',
    code: 'DMG-AK-USA',
    tags: ['Truck physics', '6 loads', 'Canvas'],
    year: '2026',
  },
  {
    id: 'suara',
    catalogNo: '11',
    title: 'TELINGA EMAS',
    tagline:
      'A listening game: forty real recordings of animals, wheels, rooms and weather, with 8-bit drawings or real photographs, giant speaker buttons and a full-screen view.',
    route: ROUTES.suara,
    color: '#e4572e',
    colorDark: '#7d2a10',
    labelColor: '#fff3e0',
    code: 'DMG-TE-USA',
    tags: ['40 sounds', 'Real audio', 'Pixel & photo'],
    year: '2026',
  },
  {
    id: 'pekan',
    catalogNo: '12',
    title: 'PEKAN RAYA',
    tagline:
      'A folk-sports island: walk the village and the rice fields, challenge seven champions, collect their scrolls, then light the torch at the summit.',
    route: ROUTES.pekan,
    color: '#1f4a3d',
    colorDark: '#0d2a22',
    labelColor: '#e8b44c',
    code: 'DMG-PK-USA',
    tags: ['Island map', '7 branches', 'Canvas'],
    year: '2026',
  },
]
