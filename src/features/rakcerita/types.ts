/**
 * Types shared by the Rak Cerita Kaluna cartridge.
 *
 * A `Story` is pure data: pages carry a caption, an artwork builder and an
 * `acts` map keyed by the `data-act` value of whatever was tapped. This mirrors
 * the hand-made books the cartridge grew out of, and keeps the engine from
 * knowing anything about a particular story.
 */

/** Story ids double as shelf ids and hash segments (`#/gigi/3`). */
export type StoryId = 'vaksin' | 'kebun' | 'gigi' | 'rakbuku'

export interface BubbleOptions {
  right?: boolean
  tiny?: boolean
  /** Lifetime in ms; defaults to 2800. */
  ms?: number
}

/** Element passed to an act: the button (or hotspot) that was tapped. */
export interface ActTarget extends HTMLElement {
  dataset: DOMStringMap & { done?: string }
}

export type ActHandler = (el: ActTarget) => void

export interface StoryPage {
  /** Short title, shown in the progress pill and the page list. */
  t: string
  /** Narration read aloud by the browser voice. */
  n: string
  /** On-screen nudge for the interaction. */
  hint?: string
  /** Hide the bottom caption band (cover pages draw their own). */
  band?: boolean
  /** Marks the final page: enables the end-of-story buttons. */
  lastPage?: boolean
  /** Builds the SVG scene plus its overlay buttons. */
  art: () => string
  /** Runs once after the page has been mounted. */
  setup?: () => void
  /** Interaction handlers, keyed by `data-act`. */
  acts: Record<string, ActHandler>
}

export interface Story {
  id: StoryId
  title: string
  /** Shorter label used in the reader header. */
  short: string
  pages: StoryPage[]
}

/** A shelf card. `ready: false` books are teased but not playable. */
export interface BookEntry {
  id: string
  title: string
  meta: string
  ready: boolean
  isNew: boolean
  keywords: string
  cover: () => string
}

/** Page-scoped interaction flags, reset on every page render. */
export interface StoryFlags {
  belt: number
  horn: boolean
  packed: number
  chairs: number
  vax: number
  night: number
  benefits: number
  bloom: number
  seeds: number
  flies: number
  tomatoes: number
  tea: boolean
  cookie: boolean
  engine: boolean
  rode: boolean
  morning1: boolean
  morning2: boolean
  point: boolean
  paste: boolean
  brushed: boolean
  rinse: boolean
  nbrush: boolean
  sung: string[]
  rakShelf: number
  rakNum: number
  rakFound: number
  rakRead: number
}

/** What the rest of the app is allowed to remember between visits. */
export interface RakProgress {
  stars: number
  seen: Record<string, number[]>
  done: Record<string, boolean>
}
