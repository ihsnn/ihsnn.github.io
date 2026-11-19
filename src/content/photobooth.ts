import { ROUTES } from '../app/routes'

/**
 * Copy and the strip catalogue for the photobooth cartridge.
 *
 * The catalogue is data: the picker, the slot count, the exporter and the
 * canvas renderer all read from `STRIP_LAYOUTS`. Adding a strip means adding
 * one object here (plus a painter with the same `style` id in
 * features/photobooth/render). Nothing in this file touches React or a camera
 * — it is safe to import from the renderer, which runs without a DOM tree.
 */

export type LayoutStyle =
  | 'poke'
  | 'gta5'
  | 'gta6'
  | 'polaroid'
  | 'film'
  | 'ticket'
  | 'magazine'
  | 'idcard'
  | 'passport'
  | 'passportId'
  | 'comic'
  | 'dmg'
  | 'cassette'
  | 'floppy'
  | 'boarding'
  | 'wanted'
  | 'sticker'
  | 'newspaper'
  | 'yearbook'
  | 'riso'
  | 'vhs'
  | 'arcade'
  | 'contact'
  | 'holo'
  | 'cinema'
  | 'receipt'
  | 'thr'
  | 'studio'
  | 'postcard'
  | 'cassetteArt'
  | 'artwork'
  | 'webcam'
  | 'digicam'
  | 'filmcam'
  | 'cctv'
  | 'gamecart'
  | 'gamebox'
  | 'cassetteBox'
  | 'vandals'

/** The extra texture layered under a layout's notes. */
export type SoundTexture =
  | 'sparkle'
  | 'tape'
  | 'noise'
  | 'coin'
  | 'click'
  | 'stamp'
  | 'projector'

/**
 * Motion signature. A strip with motion gets a video download: the renderer
 * repaints it with a moving overlay (`render/motion.ts`) while the canvas is
 * recorded. Strips without motion are still, and the video button says so.
 */
export type MotionKind = 'foil' | 'scan' | 'tape' | 'feed' | 'pulse' | 'drift'

/**
 * A layout's audio signature, written as notes rather than samples: the synth
 * in features/photobooth/sound.ts plays `select` while the card is picked and
 * `done` once the strip is complete or downloaded.
 */
export interface LayoutSound {
  select: number[]
  done: number[]
  wave: 'square' | 'sawtooth' | 'triangle' | 'sine'
  texture?: SoundTexture
}

/** Which shine the picker card and the baked foil lean on. */
export type LayoutShine = 'holo' | 'foil' | 'gloss' | 'paper'

export interface StripLayout {
  id: string
  /** Shown on the picker card and in the preview caption. */
  name: string
  /** Small category line, printed above the name. */
  category: string
  blurb: string
  /** A strip holds one or two photos; the renderer draws exactly this many. */
  slots: 1 | 2
  /** Design-space dimensions. The exporter multiplies both by a scale. */
  width: number
  height: number
  style: LayoutStyle
  shine: LayoutShine
  /** Printed date exists on this design, so the date field applies to it. */
  date: boolean
  /** Optional motion; enables the looping video export. */
  motion?: MotionKind
  /** Accent colours used by the picker card around the real canvas preview. */
  theme: {
    base: string
    glow: string
    ink: string
    accent: string
  }
  sound: LayoutSound
}

export const STRIP_LAYOUTS: readonly StripLayout[] = [
  {
    id: 'trading-card',
    name: 'Trading Card',
    category: 'Holo foil',
    blurb:
      'A holographic trainer card: one shot becomes the artwork, the other the trainer portrait, complete with HP and an attack.',
    slots: 2,
    width: 840,
    height: 1176,
    style: 'poke',
    shine: 'holo',
    date: false,
    motion: 'foil',
    theme: { base: '#f6d365', glow: '#ffcb05', ink: '#2a1c03', accent: '#e3350d' },
    sound: {
      select: [659, 784, 1046],
      done: [659, 784, 1046, 1318],
      wave: 'square',
      texture: 'sparkle',
    },
  },
  {
    id: 'gta-v',
    name: 'GTA V',
    category: 'Los Santos poster',
    blurb:
      'A black-and-white box poster with a giant title, a tilted photo frame and a tagline that shouts.',
    slots: 2,
    width: 900,
    height: 1200,
    style: 'gta5',
    shine: 'gloss',
    date: false,
    theme: { base: '#f2efe6', glow: '#8bd450', ink: '#0b0b0f', accent: '#4a5e31' },
    sound: {
      select: [98, 147],
      done: [98, 98, 147, 196],
      wave: 'sawtooth',
      texture: 'noise',
    },
  },
  {
    id: 'gta-vi',
    name: 'GTA VI',
    category: 'Neon Leonida',
    blurb:
      'Leonida sunset, neon palms, two tilted photos and a huge roman numeral washed in pink.',
    slots: 2,
    width: 900,
    height: 1200,
    style: 'gta6',
    shine: 'holo',
    date: false,
    motion: 'foil',
    theme: { base: '#2b0b3f', glow: '#ff6b9d', ink: '#ffe9f3', accent: '#ffb347' },
    sound: {
      select: [220, 277, 330],
      done: [220, 277, 330, 440],
      wave: 'triangle',
      texture: 'sparkle',
    },
  },
  {
    id: 'polaroid',
    name: 'Classic Polaroid',
    category: 'Instant 1977',
    blurb:
      'Thick white instant frame, warm photo, a handwritten line and an editable date in the margin.',
    slots: 1,
    width: 820,
    height: 980,
    style: 'polaroid',
    shine: 'gloss',
    date: true,
    theme: { base: '#f4f0e6', glow: '#ff8a5c', ink: '#3d3226', accent: '#c0603f' },
    sound: {
      select: [392, 523],
      done: [392, 523, 659],
      wave: 'triangle',
      texture: 'click',
    },
  },
  {
    id: 'film-strip',
    name: '35mm Film',
    category: 'Analog 400',
    blurb:
      'A film strip with sprocket holes, frame numbers and a lab sticker — two frames from one roll.',
    slots: 2,
    width: 760,
    height: 1180,
    style: 'film',
    shine: 'gloss',
    date: false,
    theme: { base: '#111111', glow: '#ffb347', ink: '#f4efe6', accent: '#c9c2b6' },
    sound: {
      select: [196, 262],
      done: [196, 262, 330],
      wave: 'square',
      texture: 'click',
    },
  },
  {
    id: 'vintage-ticket',
    name: 'Vintage Ticket',
    category: 'Admit two',
    blurb:
      'An old cinema ticket: perforation, red stamp, serial number and two photos in the stubs.',
    slots: 2,
    width: 900,
    height: 620,
    style: 'ticket',
    shine: 'paper',
    date: true,
    theme: { base: '#e8dcc3', glow: '#b03a2e', ink: '#4a3a24', accent: '#7c6a4d' },
    sound: {
      select: [262, 196],
      done: [262, 196, 330],
      wave: 'triangle',
      texture: 'stamp',
    },
  },
  {
    id: 'magazine-cover',
    name: 'Magazine Cover',
    category: 'Issue 06',
    blurb:
      'Be the cover story: a giant serif masthead, barcode, coverlines and an edition sticker.',
    slots: 1,
    width: 840,
    height: 1120,
    style: 'magazine',
    shine: 'gloss',
    date: true,
    theme: { base: '#f7f1e6', glow: '#c8102e', ink: '#241f1c', accent: '#d8c9b0' },
    sound: {
      select: [523, 659],
      done: [523, 659, 784],
      wave: 'triangle',
      texture: 'sparkle',
    },
  },
  {
    id: 'staff-pass',
    name: 'Staff Pass',
    category: 'Lanyard ID',
    blurb:
      'A lanyard card with data fields, a barcode, a holo patch and a signature line.',
    slots: 1,
    width: 900,
    height: 560,
    style: 'idcard',
    shine: 'holo',
    date: false,
    motion: 'foil',
    theme: { base: '#14213d', glow: '#5ee6c8', ink: '#f4f6ff', accent: '#ffcb05' },
    sound: {
      select: [880, 1174],
      done: [880, 1174, 1568],
      wave: 'square',
      texture: 'click',
    },
  },
  {
    id: 'passport',
    name: 'Passport',
    category: 'Republic of the Islands',
    blurb:
      'An open passport book: the identity page with photo, fields and an MRZ, facing a visa page of stamps.',
    slots: 1,
    width: 1180,
    height: 740,
    style: 'passport',
    shine: 'foil',
    date: true,
    motion: 'foil',
    theme: { base: '#efe7d2', glow: '#2f6f5e', ink: '#1f3b34', accent: '#9c2b2b' },
    sound: {
      select: [294, 349],
      done: [294, 349, 440],
      wave: 'triangle',
      texture: 'stamp',
    },
  },
  {
    id: 'keepsake-passport',
    name: 'Keepsake Passport',
    category: 'Souvenir edition',
    blurb:
      'The same open book in oxblood and gold, stamped SOUVENIR. A prop — not a travel document and not a real passport.',
    slots: 1,
    width: 1180,
    height: 740,
    style: 'passportId',
    shine: 'foil',
    date: true,
    motion: 'foil',
    theme: { base: '#5b1e24', glow: '#d4af37', ink: '#f4efdc', accent: '#8c2f33' },
    sound: {
      select: [392, 523, 659],
      done: [392, 523, 659, 784],
      wave: 'triangle',
      texture: 'stamp',
    },
  },
  {
    id: 'comic-panel',
    name: 'Comic Panel',
    category: 'POW!',
    blurb:
      'Two comic panels with speech balloons, a yellow burst, halftone dots and dramatic captions.',
    slots: 2,
    width: 900,
    height: 1100,
    style: 'comic',
    shine: 'gloss',
    date: false,
    theme: { base: '#f5edcf', glow: '#e63946', ink: '#171310', accent: '#2a6fdb' },
    sound: {
      select: [196, 392],
      done: [196, 392, 523],
      wave: 'square',
      texture: 'noise',
    },
  },
  {
    id: 'dmg-console',
    name: 'Photo Boy DMG',
    category: '8-bit green',
    blurb:
      'A grey handheld with two photos on a green LCD, a D-pad and a speaker grille.',
    slots: 2,
    width: 860,
    height: 1120,
    style: 'dmg',
    shine: 'gloss',
    date: false,
    theme: { base: '#c8c4b8', glow: '#9bbc0f', ink: '#2b2b2b', accent: '#8b3a62' },
    sound: {
      select: [523, 659, 784],
      done: [523, 659, 784, 1046],
      wave: 'square',
      texture: 'sparkle',
    },
  },
  {
    id: 'mixtape',
    name: 'Mixtape',
    category: 'Side A',
    blurb:
      'A clear cassette with two photos on the label and a handwritten tracklist for someone.',
    slots: 2,
    width: 940,
    height: 640,
    style: 'cassette',
    shine: 'holo',
    date: false,
    motion: 'tape',
    theme: { base: '#2b211c', glow: '#ffb347', ink: '#f6ead4', accent: '#7a5c45' },
    sound: {
      select: [330, 392],
      done: [330, 392, 494],
      wave: 'triangle',
      texture: 'tape',
    },
  },
  {
    id: 'floppy-disk',
    name: 'Floppy 1.44',
    category: '1993 disk',
    blurb: 'A navy floppy with a metal shutter, a paper label and a handwritten note.',
    slots: 1,
    width: 900,
    height: 900,
    style: 'floppy',
    shine: 'gloss',
    date: false,
    theme: { base: '#1f2a5a', glow: '#8fb3ff', ink: '#f2f4ff', accent: '#ffd166' },
    sound: {
      select: [740, 880],
      done: [740, 880, 1174],
      wave: 'square',
      texture: 'click',
    },
  },
  {
    id: 'boarding-pass',
    name: 'Boarding Pass',
    category: 'CGK → DPS',
    blurb:
      'An airline ticket with seat 06A, gate 6, a torn right stub and a passenger photo.',
    slots: 2,
    width: 980,
    height: 500,
    style: 'boarding',
    shine: 'gloss',
    date: true,
    theme: { base: '#f4f7f5', glow: '#0f8b8d', ink: '#12343b', accent: '#ff8a5c' },
    sound: {
      select: [784, 1046, 1318],
      done: [784, 1046, 1318, 1568],
      wave: 'sine',
      texture: 'sparkle',
    },
  },
  {
    id: 'wanted-poster',
    name: 'Wanted',
    category: 'Reward $10,000',
    blurb:
      'A cowboy poster on old paper: sepia photo, corner nails and a reward for capture.',
    slots: 1,
    width: 880,
    height: 1180,
    style: 'wanted',
    shine: 'paper',
    date: false,
    theme: { base: '#d9c39a', glow: '#5a3d1f', ink: '#2e2113', accent: '#8c1c13' },
    sound: {
      select: [147, 196],
      done: [147, 196, 262],
      wave: 'sawtooth',
      texture: 'noise',
    },
  },
  {
    id: 'sticker-pack',
    name: 'Sticker Pack',
    category: 'Die-cut holo',
    blurb:
      'Two die-cut stickers with a thick white border, a drop shadow and glittering foil.',
    slots: 2,
    width: 880,
    height: 1100,
    style: 'sticker',
    shine: 'holo',
    date: false,
    motion: 'foil',
    theme: { base: '#e9d5ff', glow: '#ff5cb8', ink: '#3b1a4f', accent: '#67e8f9' },
    sound: {
      select: [659, 988],
      done: [659, 988, 1318],
      wave: 'triangle',
      texture: 'sparkle',
    },
  },
  {
    id: 'newspaper',
    name: 'Morning Paper',
    category: 'Extra!',
    blurb:
      'A front page with masthead, big headline, column rules and a halftone press photo.',
    slots: 1,
    width: 900,
    height: 1180,
    style: 'newspaper',
    shine: 'paper',
    date: true,
    theme: { base: '#efe9dc', glow: '#8c1c13', ink: '#241f1a', accent: '#6f6252' },
    sound: {
      select: [262, 330],
      done: [262, 330, 392],
      wave: 'square',
      texture: 'noise',
    },
  },
  {
    id: 'yearbook',
    name: 'Yearbook 2006',
    category: 'Class of 2026',
    blurb:
      'A yearbook page with a gold oval frame, a senior quote, signatures and a class ribbon.',
    slots: 1,
    width: 880,
    height: 1140,
    style: 'yearbook',
    shine: 'foil',
    date: false,
    theme: { base: '#16213e', glow: '#e8c37a', ink: '#f6efdf', accent: '#3d5a80' },
    sound: {
      select: [523, 784],
      done: [523, 784, 1046],
      wave: 'sine',
      texture: 'sparkle',
    },
  },
  {
    id: 'riso-zine',
    name: 'Riso Zine',
    category: 'Issue 06',
    blurb:
      'A two-colour riso print with deliberately misaligned ink, halftone and registration marks.',
    slots: 2,
    width: 880,
    height: 1180,
    style: 'riso',
    shine: 'paper',
    date: false,
    theme: { base: '#f6f0e2', glow: '#ff4d8d', ink: '#151515', accent: '#1f4fff' },
    sound: {
      select: [349, 440],
      done: [349, 440, 587],
      wave: 'square',
      texture: 'click',
    },
  },
  {
    id: 'vhs-tape',
    name: 'VHS 1987',
    category: 'Play ▶',
    blurb:
      'A glossy black VHS sleeve: handwritten label, scanlines, timecode and a play button.',
    slots: 1,
    width: 840,
    height: 1180,
    style: 'vhs',
    shine: 'gloss',
    date: false,
    motion: 'tape',
    theme: { base: '#0d0d10', glow: '#ff2d55', ink: '#f4f4f4', accent: '#22d3ee' },
    sound: {
      select: [110, 165],
      done: [110, 165, 220],
      wave: 'sawtooth',
      texture: 'tape',
    },
  },
  {
    id: 'arcade-highscore',
    name: 'High Score',
    category: 'Insert coin',
    blurb:
      'An arcade screen with a neon grid, two CRT photos, a 1UP score and a 25-cent coin.',
    slots: 2,
    width: 880,
    height: 1200,
    style: 'arcade',
    shine: 'holo',
    date: false,
    motion: 'scan',
    theme: { base: '#08111f', glow: '#5ee6c8', ink: '#f4f6ff', accent: '#ff4d9d' },
    sound: {
      select: [523, 659, 880],
      done: [523, 659, 880, 1046],
      wave: 'square',
      texture: 'coin',
    },
  },
  {
    id: 'contact-sheet',
    name: 'Contact Sheet',
    category: '35mm · ISO 400',
    blurb:
      'A clean contact sheet with frame numbers, red pencil marks and a handwritten note.',
    slots: 2,
    width: 900,
    height: 1180,
    style: 'contact',
    shine: 'gloss',
    date: true,
    theme: { base: '#f2efe8', glow: '#d64545', ink: '#2a2a2a', accent: '#9a9384' },
    sound: {
      select: [440, 523],
      done: [440, 523, 659],
      wave: 'triangle',
      texture: 'click',
    },
  },
  {
    id: 'holo-dream',
    name: 'Holo Dream',
    category: 'Dreamy foil',
    blurb:
      'A holographic dream: pastel gradients, two photos in arches, scattered sparkle and thick foil.',
    slots: 2,
    width: 880,
    height: 1180,
    style: 'holo',
    shine: 'holo',
    date: false,
    motion: 'foil',
    theme: { base: '#fbcfe8', glow: '#a78bfa', ink: '#3d2a5c', accent: '#67e8f9' },
    sound: {
      select: [880, 1108, 1318],
      done: [880, 1108, 1318, 1568],
      wave: 'sine',
      texture: 'sparkle',
    },
  },
  {
    id: 'cinema-ticket',
    name: 'Cinema Ticket',
    category: 'Admit one',
    blurb:
      'A torn movie ticket with two film frames, a seat number, a QR block and foil on the stub.',
    slots: 2,
    width: 940,
    height: 560,
    style: 'cinema',
    shine: 'gloss',
    date: false,
    theme: { base: '#f4e9d6', glow: '#7a1220', ink: '#3b1d17', accent: '#c9933f' },
    sound: {
      select: [392, 523, 659],
      done: [392, 523, 659, 784],
      wave: 'triangle',
      texture: 'projector',
    },
  },
  {
    id: 'receipt',
    name: 'Memory Receipt',
    category: 'Store #06',
    blurb:
      'Narrow thermal paper with itemised smiles, a total of one moment, a barcode and a paper feed.',
    slots: 1,
    width: 600,
    height: 1240,
    style: 'receipt',
    shine: 'paper',
    date: true,
    motion: 'feed',
    theme: { base: '#f7f3e8', glow: '#c8553d', ink: '#26231d', accent: '#7a6a4f' },
    sound: {
      select: [988, 784],
      done: [988, 784, 659, 988],
      wave: 'square',
      texture: 'click',
    },
  },
  {
    id: 'thr-envelope',
    name: 'Holiday Envelope',
    category: 'THR · Eid money',
    blurb:
      'A green and gold envelope woven with ketupat, a photo window and a handwritten name line.',
    slots: 1,
    width: 900,
    height: 640,
    style: 'thr',
    shine: 'foil',
    date: false,
    motion: 'foil',
    theme: { base: '#1d3b2a', glow: '#e3b34a', ink: '#f3ead6', accent: '#2f6b4a' },
    sound: {
      select: [523, 659, 784],
      done: [523, 659, 784, 1046],
      wave: 'sine',
      texture: 'sparkle',
    },
  },
  {
    id: 'studio-90s',
    name: '90s Studio',
    category: 'Portrait studio',
    blurb:
      'A painted blue backdrop, gold frame and an orange dot-matrix date, exactly like the mall studio.',
    slots: 1,
    width: 800,
    height: 1000,
    style: 'studio',
    shine: 'gloss',
    date: true,
    motion: 'drift',
    theme: { base: '#6f8bb5', glow: '#ff8a1e', ink: '#f0e6d2', accent: '#2b3a67' },
    sound: {
      select: [392, 494, 587],
      done: [392, 494, 587, 784],
      wave: 'triangle',
      texture: 'click',
    },
  },
  {
    id: 'postcard',
    name: 'Postcard',
    category: 'Greetings from',
    blurb:
      'A glossy postcard with a perforated stamp, wavy postmark, address lines and room for a message.',
    slots: 1,
    width: 1000,
    height: 700,
    style: 'postcard',
    shine: 'paper',
    date: true,
    theme: { base: '#efe3cc', glow: '#7fb3c8', ink: '#2b3a3a', accent: '#b23a2f' },
    sound: {
      select: [659, 880],
      done: [659, 880, 1046],
      wave: 'sine',
      texture: 'stamp',
    },
  },
  {
    id: 'cassette-art',
    name: 'Cassette Art',
    category: 'Riso print',
    blurb:
      'A two-colour art print of a cassette, photo on the label, reels spinning, tape spilling out.',
    slots: 1,
    width: 820,
    height: 1040,
    style: 'cassetteArt',
    shine: 'holo',
    date: false,
    motion: 'tape',
    theme: { base: '#ff4d8d', glow: '#67e8f9', ink: '#17131a', accent: '#ffd166' },
    sound: {
      select: [330, 440, 554],
      done: [330, 440, 554, 660],
      wave: 'triangle',
      texture: 'tape',
    },
  },
  {
    id: 'artwork',
    name: 'Artwork',
    category: 'Gallery edition',
    blurb:
      'Your photo as a framed painting on a gallery wall, with a brass plaque and your title.',
    slots: 1,
    width: 820,
    height: 1040,
    style: 'artwork',
    shine: 'gloss',
    date: true,
    motion: 'drift',
    theme: { base: '#e8e0cf', glow: '#b08d3f', ink: '#2c2822', accent: '#7a2f2a' },
    sound: {
      select: [262, 392, 523],
      done: [262, 392, 523, 659],
      wave: 'sine',
      texture: 'sparkle',
    },
  },
  {
    id: 'webcam',
    name: 'Webcam 2003',
    category: 'Chat window',
    blurb:
      'A grey chat window with a grainy webcam feed, a buddy avatar, message bubbles and a Send button.',
    slots: 2,
    width: 900,
    height: 680,
    style: 'webcam',
    shine: 'gloss',
    date: true,
    motion: 'scan',
    theme: { base: '#dfe6ee', glow: '#1b4f8a', ink: '#1d2733', accent: '#7ad151' },
    sound: {
      select: [880, 1046, 880],
      done: [880, 1046, 880, 1318],
      wave: 'square',
      texture: 'click',
    },
  },
  {
    id: 'digicam',
    name: 'Digicam',
    category: '3.2 megapixels',
    blurb:
      'A 2000s digital camera frame: chunky pixels, flash glare, an orange date stamp and a battery icon.',
    slots: 1,
    width: 820,
    height: 1040,
    style: 'digicam',
    shine: 'gloss',
    date: true,
    motion: 'scan',
    theme: { base: '#d7dbe0', glow: '#ff8a1e', ink: '#23282e', accent: '#4f7fbf' },
    sound: {
      select: [1046, 1318],
      done: [1046, 1318, 1568],
      wave: 'square',
      texture: 'click',
    },
  },
  {
    id: 'film-camera',
    name: 'Film Camera',
    category: 'Lab print',
    blurb:
      'A 4R lab print with a film-edge rebate, frame code, exposure marks and the lab envelope corner.',
    slots: 1,
    width: 900,
    height: 720,
    style: 'filmcam',
    shine: 'gloss',
    date: true,
    theme: { base: '#f1ede4', glow: '#c0603f', ink: '#2a2622', accent: '#8a7c66' },
    sound: {
      select: [196, 294],
      done: [196, 294, 392],
      wave: 'triangle',
      texture: 'click',
    },
  },
  {
    id: 'cctv',
    name: 'CCTV',
    category: 'CAM 04 · evidence',
    blurb:
      'A surveillance still: mono, fisheye vignette, scanlines, a REC dot, a timestamp and an evidence number.',
    slots: 1,
    width: 900,
    height: 700,
    style: 'cctv',
    shine: 'gloss',
    date: true,
    motion: 'scan',
    theme: { base: '#0b0d0c', glow: '#7bff9e', ink: '#d8ffe4', accent: '#ff4d4d' },
    sound: {
      select: [147, 220],
      done: [147, 220, 147],
      wave: 'sawtooth',
      texture: 'noise',
    },
  },
  {
    id: 'game-cartridge',
    name: 'Game Cartridge',
    category: '8-bit label',
    blurb:
      'A gold IHSNN shell on a dark stage: embossed logo plate, grip ribs, metal side bands and your photo printed on the label.',
    slots: 1,
    width: 860,
    height: 1080,
    style: 'gamecart',
    shine: 'gloss',
    date: true,
    motion: 'foil',
    theme: { base: '#e2c05a', glow: '#ffe8a3', ink: '#2b2a26', accent: '#c9a227' },
    sound: {
      select: [659, 880, 988],
      done: [659, 880, 988, 1174],
      wave: 'square',
      texture: 'sparkle',
    },
  },
  {
    id: 'game-box',
    name: 'Game Box',
    category: "Player's choice",
    blurb:
      'A boxed game cover with a gold award badge, spine text, a screenshot and a barcode.',
    slots: 1,
    width: 840,
    height: 1120,
    style: 'gamebox',
    shine: 'gloss',
    date: false,
    theme: { base: '#141b34', glow: '#ffcb05', ink: '#f4f6ff', accent: '#e3350d' },
    sound: {
      select: [523, 784, 1046],
      done: [523, 784, 1046, 1318],
      wave: 'square',
      texture: 'coin',
    },
  },
  {
    id: 'cassette-box',
    name: 'Cassette Box',
    category: 'J-card insert',
    blurb:
      'A plastic cassette case with a printed J-card: cover art, spine title and a tracklist on the back.',
    slots: 1,
    width: 840,
    height: 1120,
    style: 'cassetteBox',
    shine: 'gloss',
    date: false,
    motion: 'tape',
    theme: { base: '#1b1b20', glow: '#ffb347', ink: '#f4efe6', accent: '#c9c2b6' },
    sound: {
      select: [294, 370],
      done: [294, 370, 494],
      wave: 'triangle',
      texture: 'tape',
    },
  },
  {
    id: 'vandal-wall',
    name: 'Vandals in the Wall',
    category: 'Paste-up',
    blurb:
      'A wheat-pasted photo on a brick wall, torn corners, spray tags, drips and a NO ADS stencil.',
    slots: 1,
    width: 900,
    height: 720,
    style: 'vandals',
    shine: 'gloss',
    date: false,
    motion: 'pulse',
    theme: { base: '#6d6a63', glow: '#ff4d9d', ink: '#f4f4f4', accent: '#22d3ee' },
    sound: {
      select: [110, 98, 165],
      done: [110, 98, 165, 220],
      wave: 'sawtooth',
      texture: 'noise',
    },
  },
]

export const DEFAULT_LAYOUT_ID = 'trading-card'

/** Old ids kept alive so `?strip=kartu-pokemon` and old bookmarks still work. */
export const LEGACY_LAYOUT_IDS: Readonly<Record<string, string>> = {
  'kartu-pokemon': 'trading-card',
  'film-35mm': 'film-strip',
  'karcis-tua': 'vintage-ticket',
  'sampul-majalah': 'magazine-cover',
  'id-karyawan': 'staff-pass',
  'paspor': 'passport',
  'paspor-kenangan': 'keepsake-passport',
  'panel-komik': 'comic-panel',
  'photo-boy': 'dmg-console',
  'kaset-mixtape': 'mixtape',
  'floppy-144': 'floppy-disk',
  'koran-pagi': 'newspaper',
  'tiket-bioskop': 'cinema-ticket',
  'kartu-karyawan': 'staff-pass',
  'kartu-pos': 'postcard',
  'struk-kasir': 'receipt',
  'amplop-thr': 'thr-envelope',
  'foto-studio': 'studio-90s',
}

/**
 * Aspect of each photo window, used by the reposition/crop editor to show the
 * exact box the chosen layout will use. Approximate to the painter's rect; the
 * baked crop canvas is then drawn cover into the real slot.
 */
export const STRIP_CROP_ASPECTS: Readonly<Record<string, readonly number[]>> = {
  'trading-card': [1.43, 1],
  'gta-v': [0.76, 0.76],
  'gta-vi': [1.6, 1.1],
  polaroid: [1.07],
  'film-strip': [1.34, 1.34],
  'vintage-ticket': [0.92, 0.92],
  'magazine-cover': [1.1],
  'staff-pass': [0.83],
  passport: [0.78],
  'keepsake-passport': [0.78],
  'comic-panel': [2.03, 2.15],
  'dmg-console': [0.98, 0.98],
  mixtape: [1, 1],
  'floppy-disk': [1],
  'boarding-pass': [0.88, 1],
  'wanted-poster': [1.09],
  'sticker-pack': [1, 1],
  newspaper: [1.8],
  yearbook: [0.79],
  'riso-zine': [1.32, 1],
  'vhs-tape': [1.57],
  'arcade-highscore': [0.87, 0.87],
  'contact-sheet': [1.83, 1.83],
  'holo-dream': [0.75, 0.75],
  'cinema-ticket': [0.8, 0.8],
  receipt: [1.48],
  'thr-envelope': [0.75],
  'studio-90s': [0.89],
  postcard: [1.69],
  'cassette-art': [1.57],
  artwork: [0.81],
  webcam: [1.33, 1],
  digicam: [0.89],
  'film-camera': [1.41],
  cctv: [1.5],
  'game-cartridge': [1.45],
  'game-box': [0.84, 1.5],
  'cassette-box': [1],
  'vandal-wall': [1.25],
}

export function cropAspectFor(layout: StripLayout, slot: number): number {
  return STRIP_CROP_ASPECTS[layout.id]?.[slot] ?? 1
}

export function getStripLayout(id: string): StripLayout {
  const resolved = LEGACY_LAYOUT_IDS[id] ?? id
  return (
    STRIP_LAYOUTS.find((layout) => layout.id === resolved) ??
    STRIP_LAYOUTS.find((layout) => layout.id === DEFAULT_LAYOUT_ID) ??
    STRIP_LAYOUTS[0]
  )
}

/* ------------------------------------------------------------------ */
/* Export shapes and backdrops                                         */
/* ------------------------------------------------------------------ */

/**
 * The strip can leave the booth as its own proportion, or centred on a fixed
 * canvas. Width/height are the final PNG's pixels; the strip is fitted inside
 * with a margin. `strip` keeps the design's own size at export scale.
 */
export type ExportFormatId = 'strip' | 'square' | 'portrait' | 'story'

export interface ExportFormat {
  id: ExportFormatId
  label: string
  hint: string
  width: number | null
  height: number | null
}

export const EXPORT_FORMATS: readonly ExportFormat[] = [
  { id: 'strip', label: 'Strip', hint: 'Original cut', width: null, height: null },
  { id: 'square', label: 'Square', hint: '1:1 post', width: 1080, height: 1080 },
  { id: 'portrait', label: 'Portrait', hint: '4:5 feed', width: 1080, height: 1350 },
  { id: 'story', label: 'Phone', hint: '9:16 story', width: 1080, height: 1920 },
] as const

export type ExportBackgroundId =
  | 'none'
  | 'studio'
  | 'paper'
  | 'ink'
  | 'sunset'
  | 'mint'
  | 'grid'
  | 'confetti'
  | 'noir'
  | 'image'

export interface ExportBackground {
  id: ExportBackgroundId
  label: string
  /** CSS value for the picker swatch only; the canvas painter is in export.ts. */
  swatch: string
}

export const EXPORT_BACKGROUNDS: readonly ExportBackground[] = [
  {
    id: 'none',
    label: 'None',
    swatch:
      'repeating-conic-gradient(#2a2a2a 0% 25%, #1b1b1b 0% 50%) 50% / 12px 12px',
  },
  {
    id: 'studio',
    label: 'Studio',
    swatch: 'radial-gradient(circle at 50% 18%, #f3e7d3, #c9a986)',
  },
  {
    id: 'paper',
    label: 'Paper',
    swatch: 'linear-gradient(160deg, #f7f2e6, #e3d8c2)',
  },
  {
    id: 'ink',
    label: 'Ink',
    swatch: 'radial-gradient(circle at 50% 30%, #2b3140, #0b0d12)',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    swatch: 'linear-gradient(160deg, #ffb56b, #ff7a9c 55%, #7b5bd6)',
  },
  {
    id: 'mint',
    label: 'Mint',
    swatch: 'linear-gradient(160deg, #d9f2e3, #9fd8c4)',
  },
  {
    id: 'grid',
    label: 'Grid',
    swatch:
      'repeating-linear-gradient(0deg, #b9cff0 0 1px, transparent 1px 12px), repeating-linear-gradient(90deg, #b9cff0 0 1px, transparent 1px 12px), #f7fbff',
  },
  {
    id: 'confetti',
    label: 'Confetti',
    swatch:
      'radial-gradient(circle at 22% 32%, #ff8fc7 0 3px, transparent 3px), radial-gradient(circle at 68% 62%, #67e8f9 0 3px, transparent 3px), #fdf6ec',
  },
  {
    id: 'noir',
    label: 'Noir',
    swatch: 'radial-gradient(circle at 50% 38%, #3a3a3a, #050505)',
  },
  {
    id: 'image',
    label: 'Your photo',
    swatch:
      'radial-gradient(circle at 32% 30%, #ffd166 0 5px, transparent 5px), linear-gradient(160deg, #6fa8c8, #24405c)',
  },
]

/** Short labels used by the picker filter. */
export const STRIP_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'one', label: '1 photo' },
  { id: 'two', label: '2 photos' },
  { id: 'motion', label: 'Animated' },
] as const

export type StripFilterId = (typeof STRIP_FILTERS)[number]['id']

/** Shared by the input's maxLength and the store that clips pasted text. */
export const CAPTION_MAX_LENGTH = 40

export const PHOTOBOOTH_COPY = {
  eyebrow: 'Cartridge 06 · Photobooth',
  titleTop: 'PHOTO',
  titleBottom: 'BOOTH',
  heroKicker: 'PHOTO STUDIO · 100% ON DEVICE',
  heroLineOne: 'PICK A STRIP.',
  heroLineTwo: 'SNAP.',
  heroLineThree: 'DOWNLOAD.',
  heroBlurb:
    'Thirty-nine frames, one camera, zero uploads. Pick a template, take one or two shots, reframe them, set the date and a line of text, choose a backdrop — then save a PNG or a short looping video straight to your device.',
  badges: [
    { value: '39', label: 'strip designs' },
    { value: '1–2', label: 'photos per strip' },
    { value: '0', label: 'server uploads' },
  ],
  pickerIndex: '01',
  pickerTitle: 'Pick a strip',
  pickerLead:
    'Every card below is the real output, not a colour swatch. Click one — the preview in the camera panel changes with it, including its date and backdrop.',
  pickerCount: 'layouts ready',
  pickerNote:
    'Every layout has foil, gloss or holo shine baked into the download. Animated ones can also save a loop.',
  pickerFilterLabel: 'Filter layouts',
  jumpToCamera: 'To the camera',
  cameraIndex: '02',
  cameraTitle: 'Take the shot',
  cameraLead:
    'Turn the camera on, keep some room in the middle and let the 3–2–1 do its job. No photo leaves this device.',
  cameraOffTitle: 'Camera is still asleep',
  cameraErrorTitle: 'Camera would not open',
  cameraOffText:
    'Press the button below to wake the front camera. The browser will ask for permission once.',
  cameraStart: 'Turn camera on',
  cameraStarting: 'Connecting camera…',
  cameraRetry: 'Try again',
  cameraStop: 'Turn camera off',
  cameraLive: 'CAMERA LIVE',
  cameraHint: 'Centre your face · front light works best',
  cameraDenied:
    'Camera permission was refused. You can still use a photo from your gallery — the result is identical.',
  cameraMissing:
    'No camera was found on this device. Choose a photo from your gallery to continue.',
  cameraInsecure:
    'The camera only works over HTTPS or localhost. For now, pick a photo from your gallery.',
  cameraBroken: 'The camera failed to start. Try again, or use a photo from your gallery.',
  fileFailed:
    'That file could not be read. Try another JPG or PNG — everything is still processed on device.',
  downloadFailed:
    'Could not build the PNG. Try again; if it keeps failing, retake the photo at a smaller size.',
  capture: 'Snap',
  captureNext: 'Take the next photo',
  captureFull: 'All slots filled',
  countdownReady: 'Get ready…',
  soundOn: 'Sound on',
  soundOff: 'Sound off',
  gallery: 'Choose from gallery',
  galleryHint: 'Files stay on your device.',
  slotsTitle: 'Photo slots',
  slotLabel: 'Photo',
  slotEmpty: 'Empty',
  slotNext: 'Next slot',
  retake: 'Retake',
  capturing: 'Processing…',
  slotChoose: 'Choose',
  slotAdjust: 'Adjust',
  adjustPhoto: 'Adjust photo',
  slotHint:
    'Click a photo (or Adjust) to pan and zoom. An empty slot can be filled from your gallery.',
  cropTitle: 'Position the photo',
  cropLead:
    'Drag the photo inside the frame, set the zoom, then apply. The frame follows the active layout.',
  cropFrame: 'Slot frame',
  cropZoom: 'Zoom',
  cropNudge: 'Move',
  cropReset: 'Reset',
  cropApply: 'Apply',
  cropCancel: 'Cancel',
  cropClose: 'Close photo settings',
  cropHint: 'This position is used in the preview and the PNG.',
  captionTitle: 'Strip text',
  captionOptional: 'optional',
  captionPlaceholder: 'A name, a note, a tiny message…',
  captionHint: 'Max 40 characters. Each layout fits it to its own text area.',
  captionClear: 'Clear text',
  dateTitle: 'Date',
  dateHint: 'Only printed on layouts that show a date.',
  dateUnused: 'This design has no date — the field is ignored.',
  formatTitle: 'Export shape',
  formatHint: 'Square, portrait and phone add a backdrop around the strip.',
  backgroundTitle: 'Backdrop',
  backgroundHint: 'Painted behind the strip and baked into the file.',
  backgroundNone: 'None',
  backdropTitle: 'Backdrop photo',
  backdropLead:
    'Use your own image behind the strip: pick a file or grab the live camera frame, then position it.',
  backdropChoose: 'Choose image',
  backdropCapture: 'Use camera frame',
  backdropAdjust: 'Position',
  backdropRemove: 'Remove',
  backdropEmpty: 'No backdrop image yet.',
  backdropHint: 'Cover-cropped to the export shape · stays on this device.',
  backdropFailed: 'That image could not be read. Try another JPG or PNG.',
  backdropCameraOff: 'Turn the camera on to grab a frame.',
  backdropCrop: 'Backdrop framing',
  backdropCropLead:
    'Drag and zoom the backdrop. It fills the whole export frame behind the strip.',
  previewIndex: '03',
  previewTitle: 'Your strip',
  previewLead:
    'This preview is the download, only smaller: same shape, same backdrop, same shine.',
  previewEmpty: 'Take the first photo to watch the strip take shape.',
  previewEmptyOne: 'One more photo to finish this strip.',
  previewReady: 'Strip complete and ready to save.',
  download: 'Download PNG',
  downloading: 'Building PNG…',
  downloaded: 'Saved ✓',
  downloadHint: 'High-resolution PNG · foil, gloss and backdrop included',
  video: 'Save video',
  videoRecording: 'Recording…',
  videoDone: 'Video saved ✓',
  videoHint: '4-second loop · WebM',
  videoStill: 'This strip is still — pick an Animated one for video.',
  videoUnsupported: 'This browser cannot record canvas video. The PNG still works.',
  videoFailed: 'Video export failed. Try the PNG instead.',
  retakeAll: 'Retake all',
  changeLayout: 'Change layout above',
  completeBadge: 'STRIP READY',
  notesTitle: 'How it works',
  notes: [
    'Everything runs in the browser. Camera frames and gallery files never leave this device; there is no server and no upload queue.',
    'Pick the layout first: its slot count decides how many times you snap. Switch layouts any time — photos you already took are kept.',
    'The camera button needs permission once. If the camera is refused or missing, use "Choose from gallery"; the download is the same.',
    'Each layout has its own sound: click the card to hear its signature, finish the strip for the flourish.',
    'After a photo lands, press Adjust to pan, zoom and choose exactly what the frame keeps. Strip text and the date can change at any time.',
    'Export shapes: keep the original cut, or centre the strip on a square, portrait or phone canvas with a painted backdrop.',
    'Animated strips can be recorded as a four-second loop. The recording uses the same canvas as the PNG, so what you see is what you get.',
    'The download is a high-resolution PNG (or WebM). Foil, gloss, grain and scanlines are baked in, so it still sparkles in a chat app.',
    'All sound is synthesised with WebAudio — no audio files are downloaded. Turn it off with the speaker button whenever you like.',
  ],
  privacyNote:
    'Privacy: no photo, camera frame or file is uploaded. This page runs entirely on your device.',
  footer: 'Pocket photo booth · canvas, WebAudio, no server',
  footerShelf: '← Back to the shelf',
  sourceNote: 'Built with Canvas 2D · 39 layouts · 0 backend',
  backToShelf: ROUTES.home,
  downloadPrefix: 'photobooth',
} as const
