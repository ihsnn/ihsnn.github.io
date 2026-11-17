/**
 * The bookshelf room from "Rak Buku Kaluna" — the fourth book.
 *
 * The floor sits at y = 358 rather than the usual 414 so the bottom of the
 * stage stays visible above the caption band (which covers the last 118 px).
 */

import { R, shade, star5 } from './core'
import { windowArch } from './scenes'

export const RAK_INK = '#2B1B33'
export const RAK_PAL = ['#F05A8A', '#2E9E9A', '#FFC93C', '#8CC63F', '#F28A3C', '#8E7BD6', '#E05252', '#5AA9E6']

export const RAK_FLOOR = 358
export const RAK_BASES = [134, 240, 346]
export const RAK_BOOK_W = 60
export const RAK_BOOK_H = 84

/** Deterministic jitter so a shelf looks the same every render. */
export function rakRnd(seed: number) {
  let v = (seed >>> 0) || 17
  return () => {
    v = (v * 1664525 + 1013904223) >>> 0
    return v / 4294967296
  }
}

export type RakGaps = ReadonlyArray<ReadonlyArray<readonly [number, number]>>

/** One run of spines on a board; `gaps` leaves room for the tappable books. */
export function rakRow(x1: number, x2: number, baseY: number, seed: number, gaps: ReadonlyArray<readonly [number, number]> = []) {
  const r = rakRnd(seed)
  let x = x1
  let out = ''
  for (let i = 0; i < 90 && x < x2 - 14; i++) {
    const w = 18 + Math.floor(r() * 13)
    const h = 54 + Math.floor(r() * 32)
    const c = RAK_PAL[Math.floor(r() * RAK_PAL.length)]
    const blocked = gaps.some(([a, b]) => x + w > a && x < b)
    if (!blocked) {
      out +=
        R(x, baseY - h, w, h, c, `stroke="${RAK_INK}" stroke-width="3"`) +
        R(x + 4, baseY - h + 9, w - 8, 4, shade(c, 46)) +
        R(x + 4, baseY - h + 22, w - 8, 3, shade(c, 46), 'opacity=".65"') +
        R(x + 4, baseY - 14, w - 8, 5, shade(c, -30)) +
        R(x + w - 5, baseY - h + 4, 3, h - 8, shade(c, 34))
    }
    x += w + 2
  }
  return out
}

export interface RakCaseOptions {
  night?: boolean
  gaps?: RakGaps
}

function rakCase(o: RakCaseOptions = {}) {
  const night = !!o.night
  const wood = night ? '#7A5A78' : '#B4783A'
  const wood2 = night ? '#4E3A5C' : '#8A5A36'
  const wood3 = night ? '#9A7A98' : '#D9A06A'
  const back = night ? '#2A2350' : '#5E3B2A'
  const gaps = o.gaps || []
  let s = R(64, 26, 652, 332, wood2, `stroke="${RAK_INK}" stroke-width="6"`)
  s += R(78, 38, 624, 306, back)
  s += R(78, 38, 624, 22, '#000000', 'opacity=".22"')
  RAK_BASES.forEach((b, i) => {
    s += rakRow(84, 696, b, 41 + i * 97, gaps[i])
    s += R(74, b, 632, 11, wood, `stroke="${RAK_INK}" stroke-width="4"`)
    s += R(74, b + 11, 632, 5, shade(wood, -36))
  })
  s += R(58, 12, 664, 20, wood3, `stroke="${RAK_INK}" stroke-width="6"`)
  s += R(70, 352, 26, 12, wood2, `stroke="${RAK_INK}" stroke-width="4"`)
  s += R(684, 352, 26, 12, wood2, `stroke="${RAK_INK}" stroke-width="4"`)
  return s
}

/** Kaluna's room: wall, bookcase, window, floor. */
export function rakBg(o: RakCaseOptions = {}) {
  const night = !!o.night
  const wall = night ? '#433D6E' : '#F3D6AE'
  const wall2 = night ? '#4E4780' : '#FFE6C4'
  const floor = night ? '#382F5E' : '#C98A4B'
  const floor2 = night ? '#2A2350' : '#B4783A'
  let s = R(0, 0, 960, 540, wall)
  for (let x = 18; x < 960; x += 56) s += R(x, 0, 8, RAK_FLOOR, wall2, 'opacity=".45"')
  s += R(0, 0, 960, 110, '#FFF4D6', 'opacity=".10"')
  s += rakCase(o)
  s += R(0, RAK_FLOOR, 960, 540 - RAK_FLOOR, floor)
  for (let x = 6; x < 960; x += 96) s += R(x, RAK_FLOOR, 4, 540 - RAK_FLOOR, floor2, 'opacity=".5"')
  s += R(0, RAK_FLOOR, 960, 10, floor2)
  s += R(0, RAK_FLOOR, 960, 4, shade(floor, 28))
  s += windowArch(
    766,
    18,
    148,
    122,
    night ? { sky: '#241A4A', moon: true, stars: true, cloud: false } : { sky: '#6FD3E8', cloud: true },
  )
  return s
}

/** The book that appears in the shelf once its floor copy is tapped. */
export function rakSlot(i: number, x: number, baseY: number, c: string) {
  const h = RAK_BOOK_H
  const w = RAK_BOOK_W
  return `<g id="rslot${i}" opacity="0" style="transition:opacity .45s .18s">
    ${R(x, baseY - h, w, h, c, `stroke="${RAK_INK}" stroke-width="4"`)}
    ${R(x + 12, baseY - h + 10, w - 16, 5, '#FFF4D6', 'opacity=".9"')}
    ${R(x + 12, baseY - h + 20, w - 26, 4, '#FFF4D6', 'opacity=".6"')}
    ${R(x, baseY - h, 13, h, shade(c, -34), `stroke="${RAK_INK}" stroke-width="4"`)}
    ${R(x + 12, baseY - 12, w - 12, 5, shade(c, -28))}
  </g>`
}

/** A closed book standing on a shelf (also the tappable button art). */
export function rakBookSVG(c: string, o: { star?: boolean; tag?: boolean } = {}) {
  const star = o.star
    ? `<g transform="translate(38 50)">${star5(0, 0, 12, '#FFF4D6')}${star5(0, 0, 6, '#FFC93C')}</g>`
    : ''
  const tag = o.tag ? `<rect x="20" y="38" width="26" height="10" fill="#FFF4D6"/>` : ''
  return `<svg viewBox="0 0 60 84" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" aria-hidden="true">
    <rect x="2" y="2" width="56" height="80" fill="${c}" stroke="${RAK_INK}" stroke-width="4"/>
    <rect x="15" y="2" width="43" height="80" fill="${c}"/>
    <rect x="2" y="2" width="14" height="80" fill="${shade(c, -34)}" stroke="${RAK_INK}" stroke-width="4"/>
    <rect x="21" y="12" width="31" height="6" fill="#FFF4D6" opacity=".92"/>
    <rect x="21" y="24" width="21" height="5" fill="#FFF4D6" opacity=".62"/>
    <rect x="15" y="64" width="43" height="9" fill="${shade(c, -26)}"/>
    <rect x="2" y="74" width="56" height="8" fill="#FFF4D6" opacity=".3"/>
    ${tag}${star}
  </svg>`
}

/** A book lying face-up on the floor. */
export function rakBookLaySVG(c: string) {
  return `<svg viewBox="0 0 120 62" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" aria-hidden="true">
    <rect x="4" y="8" width="112" height="46" fill="${c}" stroke="${RAK_INK}" stroke-width="5"/>
    <rect x="26" y="16" width="88" height="30" fill="#FFF4D6"/>
    <rect x="34" y="23" width="58" height="5" fill="${shade(c, 30)}" opacity=".55"/>
    <rect x="34" y="33" width="40" height="5" fill="${shade(c, 30)}" opacity=".4"/>
    <rect x="98" y="16" width="16" height="30" fill="${shade(c, 22)}"/>
    <rect x="4" y="8" width="20" height="46" fill="${shade(c, -34)}" stroke="${RAK_INK}" stroke-width="5"/>
  </svg>`
}

/** The big open book on the bedtime page. */
export function rakOpenBook(x: number, y: number, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${R(-100, -74, 200, 148, '#C93A63', `stroke="${RAK_INK}" stroke-width="8"`)}
    ${R(-92, -66, 86, 132, '#FFF4D6', `stroke="${RAK_INK}" stroke-width="5"`)}
    ${R(6, -66, 86, 132, '#FFF4D6', `stroke="${RAK_INK}" stroke-width="5"`)}
    ${R(-2, -70, 4, 140, '#C93A63')}
    ${R(-80, -46, 60, 6, '#D9BE96')}${R(-80, -30, 46, 6, '#D9BE96')}${R(-80, -14, 54, 6, '#D9BE96')}
    ${R(14, -46, 60, 6, '#D9BE96')}${R(14, -30, 50, 6, '#D9BE96')}
    ${star5(48, 18, 14, '#FFC93C')}
    ${star5(48, 18, 7, '#FFF0B8')}
    ${R(-92, 56, 178, 6, '#E0C9A6', 'opacity=".8"')}
  </g>`
}


