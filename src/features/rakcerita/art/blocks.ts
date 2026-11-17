/**
 * The four building blocks every page is written with: three character
 * placers and the two kinds of tappable overlay (a pulsing hotspot, or a
 * button drawn as part of the scene).
 */

import { CAST, put, type AdultOpts, type BabyOpts } from './core'
import { OV_A, OV_B } from './scenes'

export const KAL = (o: BabyOpts = {}, x = 0, y = 0, s = 1, cls = '') =>
  put(CAST.kaluna.draw(o), x, y, s, cls, 260, 200)

export const MAM = (o: BabyOpts = {}, x = 0, y = 0, s = 1, cls = '') =>
  put(CAST.mamau.draw(o), x, y, s * 0.6, cls, 170, 170)

export const AD = (key: string, o: AdultOpts = {}, x = 0, y = 0, s = 1, cls = '') =>
  put(CAST[key].draw(o), x, y, s, cls, 360, 200)

export interface HotspotOptions {
  /** Text on the little tag under the pulse. */
  label?: string
  /** Icon symbol name (`#i-…` on the sprite sheet). */
  icon?: string
  /** Compact variant for props that repeat. */
  sm?: boolean
  /** Where the pulse sits inside the box, in percent. */
  dot?: readonly [number, number]
}

export const HZ = (act: string, x: number, y: number, w: number, h: number, o: HotspotOptions = {}) =>
  `${OV_A}<button class="hot ${o.sm ? 'sm' : ''}" data-act="${act}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;--hx:${o.dot ? o.dot[0] + '%' : '50%'};--hy:${o.dot ? o.dot[1] + '%' : '50%'}" aria-label="${o.label || 'Ketuk'}">
  <span class="hi"><span class="hdot"><svg><use href="#i-${o.icon || 'sparkle'}"/></svg></span>${o.label ? `<span class="htag">${o.label}</span>` : ''}</span></button>${OV_B}`

export const SB = (act: string, x: number, y: number, w: number, h: number, inner: string, cls = '') =>
  `${OV_A}<button class="stagebtn ${cls}" data-act="${act}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${inner}</button>${OV_B}`

/** Raw HTML dropped on top of the scene (counters, credits, small props). */
export const HTMLX = (s: string) => `${OV_A}${s}${OV_B}`
