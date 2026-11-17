/**
 * The bridge between the (deliberately imperative) story pages and React.
 *
 * Books are drawn as SVG strings and their interactions mutate the stage the
 * way the original hand-written pages did: tap a hotspot, move a group, pop a
 * bubble. Rather than rewrite 36 pages as JSX, the page registers a `RakHost`
 * here once, and the stories keep calling `bubble()`, `award()`, `pageDone()`
 * and friends exactly as before. React still owns the screen, the page index
 * and everything that persists.
 */

import { playSfx, sunSfx, tone, type SfxName } from './audio'
import { burst, confettiBurst as confetti, spark as fxSpark } from './fx'
import { speak as speakAloud, stopSpeech as cancelSpeech } from './speech'
import type { ActTarget, BubbleOptions, StoryFlags } from './types'

export type { ActTarget, BubbleOptions, StoryFlags }
export type Sfx = SfxName

export interface RakHost {
  stage: HTMLElement | null
  bubbles: HTMLElement | null
  hotLayer: HTMLElement | null
  isSoundOn: () => boolean
  addStars: (n: number) => void
  markPageDone: () => void
  go: (index: number) => void
  /** Index of the page on screen — delayed props use it to bail out. */
  pageIndex: () => number
  setTalking: (talking: boolean) => void
  /** Raises the AIUEO song sheet (the tooth-brushing page's play button). */
  openSong: () => void
  /** Rewrites the narration under the stage (the vaccine page does this). */
  setCaption: (text: string) => void
  toast: (message: string) => void
}

let host: RakHost | null = null

export function setHost(next: RakHost | null) {
  host = next
}

export function getHost() {
  return host
}

/* ---------- page-scoped flags ---------- */
const blankFlags = (): StoryFlags => ({
  belt: 0,
  horn: false,
  packed: 0,
  chairs: 0,
  vax: 0,
  night: 0,
  benefits: 0,
  bloom: 0,
  seeds: 0,
  flies: 0,
  tomatoes: 0,
  tea: false,
  cookie: false,
  engine: false,
  rode: false,
  morning1: false,
  morning2: false,
  point: false,
  paste: false,
  brushed: false,
  rinse: false,
  nbrush: false,
  sung: [],
  rakShelf: 0,
  rakNum: 0,
  rakFound: 0,
  rakRead: 0,
})

export let flags = blankFlags()

/** Live page flags. Reset on every page render — never persisted. */
export function storyFlags(): StoryFlags {
  return flags
}

export function resetFlags() {
  flags = blankFlags()
}

/* ---------- sound ---------- */
export const sfx = (name: Sfx) => playSfx(name, host?.isSoundOn() ?? true)

export const sunSound = () => sunSfx(host?.isSoundOn() ?? true)

export { tone }

export function speak(text: string) {
  speakAloud(text, host?.isSoundOn() ?? true, (talking) => host?.setTalking(talking))
}

export const stopSpeech = cancelSpeech

export const toast = (message: string) => host?.toast(message)

/* ---------- stage geometry ---------- */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

export const stageEl = () => host?.stage ?? null

/** Layer that transient props (bubbles, hearts, droplets) are appended to. */
export const bubblesEl = () => host?.bubbles ?? null

export const hotLayerEl = () => host?.hotLayer ?? null

/** Index of the page currently on screen (or -1 before the reader mounts). */
export const currentPage = () => host?.pageIndex() ?? -1

/** Ask the reader to raise the song sheet. */
export const openSong = () => host?.openSong()

/** The animated `<svg class="scene">` currently on stage, if any. */
export const sceneEl = () => host?.stage?.querySelector<SVGSVGElement>('.scene') ?? null

/** Swap the narration shown under the stage without leaving the page. */
export const setCaption = (text: string) => host?.setCaption(text)

function stageRect() {
  return host?.stage?.getBoundingClientRect() ?? null
}

/** Stage pixels (960 × 540) → viewport pixels. */
export function toScreen(x: number, y: number) {
  const s = stageRect()
  if (!s) return { x: 0, y: 0 }
  const k = s.width / 960
  return { x: s.left + x * k, y: s.top + y * k }
}

/** Centre of a DOM element, in stage pixels. */
export function stagePos(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  const s = stageRect()
  if (!s) return { x: 0, y: 0 }
  const k = s.width / 960
  return { x: (r.left - s.left + r.width / 2) / k, y: (r.top - s.top + r.height / 2) / k }
}

/* ---------- effects ---------- */
export function spark(x: number, y: number) {
  const p = toScreen(x, y)
  fxSpark(p.x, p.y)
}

export function sparkFrom(el: HTMLElement | null) {
  if (!el) return
  const p = stagePos(el)
  spark(p.x, p.y)
}

export function confettiBurst(rx = 0.5, ry = 0.5, n = 90, colors?: readonly string[]) {
  confetti(rx, ry, n, colors)
}

export function dust(x: number, y: number, n = 10) {
  const p = toScreen(x, y)
  burst(p.x, p.y, { n, shape: 'circle', speed: 150, gravity: 320, life: 700, size: 6 })
}

/* ---------- bubbles & floating props ---------- */
export function bubble(text: string, x: number, y: number, o: BubbleOptions = {}) {
  const layer = host?.bubbles
  if (!layer) return
  const b = document.createElement('div')
  b.className = 'bub' + (o.right ? ' right' : '') + (o.tiny ? ' tiny' : '')
  b.textContent = text
  b.style.left = clamp(x, 10, 700) + 'px'
  b.style.top = clamp(y, 10, 380) + 'px'
  layer.appendChild(b)
  setTimeout(() => {
    b.classList.add('out')
    setTimeout(() => b.remove(), 300)
  }, o.ms ?? 2800)
}

export function hearts(x: number, y: number) {
  const layer = host?.bubbles
  if (!layer) return
  for (let i = 0; i < 3; i++) {
    const d = document.createElement('div')
    d.className = 'heartfx'
    d.style.left = x + (i - 1) * 26 + 'px'
    d.style.top = y + 10 + 'px'
    d.style.animationDelay = i * 0.12 + 's'
    d.innerHTML =
      '<svg width="34" height="34" viewBox="0 0 24 24" style="color:#E76489"><use href="#i-heart"/></svg>'
    layer.appendChild(d)
    setTimeout(() => d.remove(), 1900)
  }
}

export function hornNotes(x: number, y: number) {
  const layer = host?.bubbles
  if (!layer) return
  ;['♪', '♫'].forEach((ch, i) => {
    const d = document.createElement('div')
    d.className = 'note'
    d.textContent = ch
    d.style.left = x + i * 34 + 'px'
    d.style.top = y - i * 18 + 'px'
    d.style.animationDelay = i * 0.12 + 's'
    layer.appendChild(d)
    setTimeout(() => d.remove(), 1600)
  })
}

/** The big "1, 2, 3" counter that pops above a tapped prop. */
export function countBubble(n: number, x: number, y: number) {
  const layer = host?.bubbles
  if (!layer) return
  const b = document.createElement('div')
  b.className = 'countbub'
  b.textContent = String(n)
  b.style.left = x - 31 + 'px'
  b.style.top = y - 96 + 'px'
  layer.appendChild(b)
  setTimeout(() => b.classList.add('out'), 1700)
  setTimeout(() => b.remove(), 2100)
}

export function floatTicket(html: string, left: number, top: number) {  const layer = host?.hotLayer
  if (!layer) return
  const t = document.createElement('div')
  t.className = 'ticket'
  t.innerHTML = html
  t.style.left = left + 'px'
  t.style.top = top + 'px'
  layer.appendChild(t)
  requestAnimationFrame(() => t.classList.add('in'))
}

/* ---------- rewards ---------- */
export function award(el: HTMLElement | null, n = 1) {
  host?.addStars(n)
  sfx('star')
  if (el) {
    sparkFrom(el)
    el.classList.add('done')
  }
}

export function pageDone() {
  host?.markPageDone()
}

export function go(index: number) {
  host?.go(index)
}
