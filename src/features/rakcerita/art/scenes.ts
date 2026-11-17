/**
 * Backdrops and room props for all four books.
 *
 * `scene()` is the important one: it wraps a pile of SVG fragments in the
 * 960 × 540 stage used by every page, pulls any `@@OV@@…@@/OV@@` blocks out to
 * become real HTML buttons above the artwork, and squares off rounded corners
 * so the drawing keeps its chunky pixel look.
 */

import {
  bush,
  CAST,
  cloud,
  heartIcon,
  plant,
  put,
  R,
  shade,
  sunball,
  tree,
} from './core'

export const OV_A = '@@OV@@'
export const OV_B = '@@/OV@@'

let uidCounter = 0
export const uid = () => 'u' + ++uidCounter

export const archPath = (x: number, y: number, w: number, h: number) => {
  const r = w / 2
  return `M${x} ${y + r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h}H${x}Z`
}

/**
 * Wraps page artwork into the stage SVG and hoists overlay buttons out of it.
 * Rounded corners are stripped on purpose — the books are drawn as pixel art.
 */
export const scene = (body: string, cls = '') => {
  const ov: string[] = []
  let svg = body.replace(/@@OV@@([\s\S]*?)@@\/OV@@/g, (_m, h: string) => {
    ov.push(h)
    return ''
  })
  svg = svg
    .replace(/ rx="[^"]*"/g, '')
    .replace(/ ry="[^"]*"/g, '')
    .replace(/stroke-linecap="round"/g, 'stroke-linecap="square"')
    .replace(/stroke-linejoin="round"/g, 'stroke-linejoin="miter"')
  return `<svg class="scene ${cls}" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">${svg}</svg>${ov.join('')}`
}

/* ============================================================
   INDOOR ROOMS
   ============================================================ */

export interface RoomOptions {
  wall?: string
  floor?: string
  /** Floor line, in stage pixels. */
  fy?: number
  skirt?: string
  deco?: string
}

export function roomBg(o: RoomOptions = {}) {
  const wall = o.wall || '#F5C58E'
  const floor = o.floor || '#C98A4B'
  const fy = o.fy || 414
  let dots = ''
  for (let x = 20; x < 940; x += 48)
    for (let y = 40; y < fy - 20; y += 48) dots += `<rect x="${x}" y="${y}" width="4" height="4" fill="#00000010"/>`
  return `<rect width="960" height="540" fill="${wall}"/>
    ${o.skirt ? `<rect y="${fy - 150}" width="960" height="150" fill="${o.skirt}"/>` : ''}
    ${dots}
    <rect y="${fy - 24}" width="960" height="8" fill="#2B1B33" opacity=".25"/>
    <rect y="${fy - 16}" width="960" height="16" fill="${shade(floor, -20)}"/>
    <rect y="${fy}" width="960" height="${540 - fy}" fill="${floor}"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 84 + 8}" y="${fy + 24}" width="60" height="4" fill="#00000012"/>`).join('')}
    ${o.deco || ''}`
}

export function curtains(x: number, y: number, w: number, h: number) {
  const top = y - 30
  const lw = Math.round(w / 2 + 18)
  const fold = (bx: number) =>
    R(bx + 18, top + 20, 4, h - 28, '#C96E8C', 'opacity=".5"') +
    R(bx + 42, top + 20, 4, h - 28, '#C96E8C', 'opacity=".32"') +
    R(bx + lw - 24, top + 20, 4, h - 28, '#C96E8C', 'opacity=".22"')
  return `<g class="curt curt-l">${R(x - 26, top, lw, h, '#F08AAE')}${R(x - 26, top, lw, 18, '#F7AFC4')}${fold(x - 26)}${R(x - 26, top + h - 14, lw, 14, '#C96E8C')}</g>
    <g class="curt curt-r">${R(x + w + 26 - lw, top, lw, h, '#F08AAE')}${R(x + w + 26 - lw, top, lw, 18, '#F7AFC4')}${fold(x + w + 26 - lw)}${R(x + w + 26 - lw, top + h - 14, lw, 14, '#C96E8C')}</g>
    <rect x="${x - 34}" y="${top - 12}" width="${w + 68}" height="12" fill="#8A5A36" stroke="#2B1B33" stroke-width="4"/>
    <rect x="${x - 34}" y="${top - 30}" width="${w + 68}" height="18" fill="#F08AAE" stroke="#2B1B33" stroke-width="4"/>`
}

export const birdShape = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  ${R(-20, -4, 12, 8, '#3E5560')}${R(-8, -8, 8, 8, '#3E5560')}${R(-24, -8, 4, 4, '#3E5560')}${R(4, -4, 8, 4, '#3E5560')}</g>`

export const moonShape = (x: number, y: number, r: number) => `<g>
  ${R(x - r * 0.8, y - r, r * 1.6, r * 2, '#FFF0B8')}${R(x - r, y - r * 0.6, r * 2, r * 1.2, '#FFF0B8')}
  ${R(x - r * 0.4, y - r * 0.5, r * 0.3, r * 0.3, '#E8D08A')}${R(x + r * 0.2, y + r * 0.2, r * 0.25, r * 0.25, '#E8D08A')}</g>`

export const starField = (x: number, y: number, w: number, h: number, n = 12) =>
  Array.from({ length: n }, (_, i) => {
    const px = Math.round((x + (((i * 73 + 19) % 100) / 100) * w) / 4) * 4
    const py = Math.round((y + (((i * 47 + 11) % 100) / 100) * h) / 4) * 4
    const s = i % 3 === 0 ? 8 : 4
    return R(px, py, s, s, '#FFF0B8', `opacity="${0.45 + (i % 4) * 0.14}"`)
  }).join('')

export const floorRug = (x: number, y: number, w: number, h: number, c = '#F08AAE') => `<g>
  ${R(x - w / 2, y - h / 2, w, h, c, 'stroke="#2B1B33" stroke-width="4"')}
  ${R(x - w / 2 + 12, y - h / 2 + 12, w - 24, h - 24, shade(c, -22), 'opacity=".35"')}
  ${Array.from({ length: Math.floor(w / 48) }, (_, i) => R(x - w / 2 + 16 + i * 48, y - h / 2 + 6, 24, 6, '#FFF0D8', 'opacity=".5"')).join('')}
</g>`

export function bunting(x1: number, x2: number, y: number, sag = 54) {
  const cols = ['#F05A8A', '#FFC93C', '#2E9E9A', '#8CC63F', '#F28A3C']
  let s = `<path d="M${x1} ${y}Q${(x1 + x2) / 2} ${y + sag} ${x2} ${y}" fill="none" stroke="#8A5A36" stroke-width="4"/>`
  const n = 12
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const cx = x1 + (x2 - x1) * t
    const cy = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + sag) + t * t * y
    s += `<path d="M${cx - 18} ${cy}L${cx + 18} ${cy}L${cx} ${cy + 32}Z" fill="${cols[i % 5]}" stroke="#2B1B33" stroke-width="4"/>`
  }
  return s
}

export function poster(x: number, y: number, w: number, h: number, c: string, kind = 'cross') {
  let icon = ''
  if (kind === 'cross') icon = R(x + w / 2 - 8, y + 16, 16, 24, '#FFF0D8') + R(x + w / 2 - 24, y + 24, 48, 16, '#FFF0D8')
  else if (kind === 'heart') icon = heartIcon(x + w / 2, y + h * 0.5, Math.min(w, h) * 0.2, '#FFF0D8')
  else icon = R(x + w * 0.35, y + h * 0.3, w * 0.3, h * 0.4, '#FFF0D8')
  return `<g>${R(x, y, w, h, c, 'stroke="#2B1B33" stroke-width="8"')}${R(x + 8, y + 8, w - 16, h - 16, shade(c, 22))}${icon}</g>`
}

export function fishTank(x: number, y: number, w: number, h: number) {
  return `<g>
    ${R(x - 10, y - 10, w + 20, h + 20, '#8A5A36', 'stroke="#2B1B33" stroke-width="6"')}
    ${R(x, y, w, h, '#7FD3E8', 'stroke="#2B1B33" stroke-width="4"')}
    ${R(x, y + 20, w, h - 20, '#4FB8D0', 'opacity=".55"')}
    ${R(x, y + h - 14, w, 14, '#E8D2A8')}
    ${R(x + 14, y + h - 30, 4, 20, '#3E7C34')}${R(x + 24, y + h - 36, 4, 26, '#4E9A3A')}
    <g class="swim1">${R(x + w * 0.4, y + h * 0.45, 28, 12, '#F28A3C')}${R(x + w * 0.4 - 10, y + h * 0.45 - 4, 12, 20, '#D9702A')}</g>
    <g class="swim2">${R(x + w * 0.7, y + h * 0.62, 20, 10, '#F05A8A')}${R(x + w * 0.7 - 8, y + h * 0.62 - 4, 8, 18, '#C93A63')}</g>
    ${R(x + w * 0.8, y + h * 0.3, 8, 8, '#FFF9E8', 'opacity=".8"')}
  </g>`
}

export function doorProp(x: number, y: number, w: number, h: number) {
  return `<g>
    ${R(x - 16, y - 16, w + 32, h + 32, '#E0B070', 'stroke="#2B1B33" stroke-width="8"')}
    ${R(x, y, w, h, '#FFF0B8')}
    <g class="door-leaf">
      ${R(x, y, w, h, '#B4783A', 'stroke="#2B1B33" stroke-width="6"')}
      ${R(x + 12, y + 16, w - 24, h * 0.34, '#8A5A36')}
      ${R(x + 12, y + h * 0.58, w - 24, h * 0.3, '#8A5A36')}
      ${R(x + w - 24, y + h * 0.48, 10, 10, '#FFC93C', 'stroke="#2B1B33" stroke-width="4"')}
    </g>
  </g>`
}

export function numberBoard(x: number, y: number, w: number, h: number, txt = '05') {
  return `<g>
    ${R(x, y, w, h, '#2E9E9A', 'stroke="#2B1B33" stroke-width="8"')}
    ${R(x + 10, y + 10, w - 20, h - 20, '#1B2A33')}
    ${R(x + 20, y + 18, 12, 12, '#8CC63F')}
    <text x="${x + 20}" y="${y + 30}" font-family="'Press Start 2P',monospace" font-size="10" fill="#8CC63F">ANTRIAN</text>
    <text x="${x + w - 20}" y="${y + h - 16}" text-anchor="end" font-family="'Press Start 2P',monospace" font-size="${h * 0.48}" fill="#FFC93C">${txt}</text>
  </g>`
}

export interface WindowOptions {
  frame?: string
  sky?: string
  sun?: boolean
  cloud?: boolean
  bird?: boolean
  moon?: boolean
  stars?: boolean
  curtain?: boolean
}

export function windowArch(x: number, y: number, w: number, h: number, o: WindowOptions = {}) {
  const frame = o.frame || '#FFE9B8'
  const sky = o.sky || '#6FD3E8'
  const cut = archPath(x + 12, y + 12, w - 24, h - 24)
  const g = uid()
  return `<g>
    <path d="${archPath(x, y, w, h)}" fill="${frame}" stroke="#2B1B33" stroke-width="8" shape-rendering="crispEdges"/>
    <clipPath id="${g}"><path d="${cut}"/></clipPath>
    <g clip-path="url(#${g})">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${sky}"/>
      <rect x="${x}" y="${y + h * 0.55}" width="${w}" height="${h * 0.45}" fill="${shade(sky, 18)}" opacity=".55"/>
      ${o.sun ? `<g class="sunpoke">${sunball(x + w * 0.66, y + h * 0.46, Math.min(w, h) * 0.15)}</g>` : ''}
      ${o.cloud !== false ? cloud(x + w * 0.32, y + h * 0.38, 0.5, '#FFF9E8') : ''}
      ${o.bird ? `<g class="bird">${birdShape(x + w * 0.24, y + h * 0.3, 1)}</g>` : ''}
      ${o.moon ? moonShape(x + w * 0.68, y + h * 0.36, Math.min(w, h) * 0.13) : ''}
      ${o.stars ? starField(x + 10, y + 10, w - 20, h * 0.6) : ''}
    </g>
    <rect x="${x + w / 2 - 4}" y="${y + 12}" width="8" height="${h - 24}" fill="${frame}"/>
    <rect x="${x + 12}" y="${y + h * 0.6 - 4}" width="${w - 24}" height="8" fill="${frame}"/>
    <path d="${archPath(x, y, w, h)}" fill="none" stroke="#2B1B33" stroke-width="8"/>
    ${o.curtain ? curtains(x, y, w, h) : ''}
  </g>`
}

export function clinicOutside() {
  return `${skyBg({ top: '#8ADCE8', bottom: '#BDEFF4' })}
    <rect y="414" width="960" height="126" fill="#5FAE45"/>
    <rect y="430" width="960" height="14" fill="#4E9A3A"/>
    ${Array.from({ length: 20 }, (_, i) => R(i * 48, 414 + (i % 2) * 10, 24, 6, '#4E9A3A', 'opacity=".5"')).join('')}
    <path d="M392 540h180l-14-96H406z" fill="#F2D9A8"/>
    <g>
      <rect x="214" y="156" width="532" height="262" fill="#FFF0D0" stroke="#2B1B33" stroke-width="8"/>
      <path d="M190 170l60-52h460l60 52z" fill="#2E9E9A" stroke="#2B1B33" stroke-width="8"/>
      ${R(190, 162, 580, 18, '#2E9E9A', 'stroke="#2B1B33" stroke-width="6"')}
      ${R(226, 108, 508, 44, '#FFF4D6', 'stroke="#2B1B33" stroke-width="8"')}
      <text x="480" y="138" text-anchor="middle" font-family="'Press Start 2P',monospace" font-size="16" fill="#2E9E9A">KLINIK SEHAT CERIA</text>
      ${R(286, 214, 96, 86, '#7FD3E8', 'stroke="#2B1B33" stroke-width="6"')}
      ${R(310, 224, 48, 16, '#FFF0D8')}${R(326, 208, 16, 48, '#FFF0D8')}
      ${R(590, 214, 96, 86, '#7FD3E8', 'stroke="#2B1B33" stroke-width="6"')}
      ${R(626, 232, 24, 50, '#FFF0D8')}${R(610, 248, 56, 20, '#FFF0D8')}
      ${doorProp(432, 250, 96, 168)}
      ${R(200, 414, 560, 20, '#D9A97A', 'stroke="#2B1B33" stroke-width="6"')}
      ${plant(240, 410, 1.1)}${plant(736, 410, 1.0, '#B45A3E')}
      ${bush(110, 430, 1.0)}${bush(854, 430, 0.9)}
      ${tree(890, 414, 0.9)}
    </g>`
}

export interface SkyOptions {
  top?: string
  bottom?: string
  band?: number
  sun?: boolean
  sunX?: number
  sunY?: number
}

export function skyBg(o: SkyOptions = {}) {
  const top = o.top || '#6FD3E8'
  const bottom = o.bottom || '#BDEFF4'
  return `<rect width="960" height="540" fill="${top}"/>
    <rect y="${o.band || 300}" width="960" height="8" fill="#FFF9E8" opacity=".18"/>
    <rect y="${(o.band || 300) + 8}" width="960" height="140" fill="${bottom}"/>
    ${o.sun !== false ? sunball(o.sunX || 806, o.sunY || 112, 44) : ''}
    ${cloud(180, 100, 0.9)}${cloud(520, 62, 0.6)}${cloud(880, 170, 0.55)}`
}

export const streetBg = () => `${skyBg({})}
  <rect y="330" width="960" height="64" fill="#5FAE45"/>
  ${Array.from({ length: 16 }, (_, i) => R(i * 64, 330 + (i % 3) * 8, 32, 8, '#4E9A3A', 'opacity=".55"')).join('')}
  <rect y="394" width="960" height="146" fill="#8C8C8C"/>
  <rect y="394" width="960" height="10" fill="#6E6E6E"/>
  ${Array.from({ length: 8 }, (_, i) => R(i * 120 + 24, 470, 56, 8, '#FFF4D6', 'opacity=".8"')).join('')}
  ${bush(70, 394, 0.9)}${bush(880, 394, 0.8)}${tree(140, 330, 0.8)}${tree(840, 326, 0.7)}`

/* ---------- the red scooter ---------- */
export const motoWheel = (x: number, y: number) => `<g class="wheel">
  <circle cx="${x}" cy="${y}" r="104" fill="#1A1A1A" stroke="#0A0A0A" stroke-width="12"/>
  <circle cx="${x}" cy="${y}" r="70" fill="#C9B68A" stroke="#181018" stroke-width="10"/>
  <circle cx="${x}" cy="${y}" r="40" fill="#9FD8E8" stroke="#181018" stroke-width="8"/>
  <circle cx="${x}" cy="${y}" r="14" fill="#6B5A2E"/>
</g>`

export function motoCut() {
  return `<g>
    <ellipse cx="480" cy="418" rx="225" ry="10" fill="#2B1B33" opacity=".25"/>
    ${put(CAST.mama.draw({ mood: 'smile' }), 606, 310, 0.44, 'bob', 360, 200)}
    ${put(CAST.kaluna.draw({ hijab: '#F08AAE', mood: 'laugh' }), 552, 270, 0.42, 'bob', 260, 200)}
    ${put(CAST.papa.draw({ mood: 'smile' }), 500, 310, 0.5, 'bob', 360, 200)}
    <g transform="translate(292 144) scale(.5)">
      ${motoWheel(100, 435)}${motoWheel(575, 435)}
      <path d="M0 400Q0 330 95 330Q190 330 200 400L160 412Q150 366 100 366Q50 366 36 412Z" fill="#C0272D" stroke="#181018" stroke-width="10"/>
      <path d="M180 380h200v40H200z" fill="#C0272D" stroke="#181018" stroke-width="10"/>
      <path d="M30 400V330l55-30 50-125 20-85 50 20-25 120-30 100 55 50z" fill="#C0272D" stroke="#181018" stroke-width="10"/>
      <path d="M62 360l14-58 44-100 22-68" stroke="#E04A50" stroke-width="12" fill="none"/>
      <rect x="145" y="80" width="120" height="16" fill="#181018"/>
      <rect x="250" y="72" width="22" height="32" fill="#181018"/>
      <rect x="118" y="58" width="44" height="46" fill="#C0272D" stroke="#181018" stroke-width="10"/>
      <rect x="128" y="68" width="24" height="26" fill="#FFE9B8" stroke="#181018" stroke-width="6"/>
      <path d="M330 420V260h10v-30h30v-20h280v10h30v30h10v170z" fill="#C0272D" stroke="#181018" stroke-width="10"/>
      <path d="M400 300h220v12H400zM400 340h220v12H400zM400 380h180v10H400z" fill="#E04A50"/>
      <rect x="345" y="170" width="285" height="40" fill="#3B2A1E" stroke="#181018" stroke-width="10"/>
      <rect x="362" y="178" width="250" height="10" fill="#6B4A2E"/>
      <rect x="300" y="400" width="130" height="14" fill="#B9B0A0" stroke="#181018" stroke-width="8"/>
    </g>
    <path d="M470 200L414 166" stroke="#181018" stroke-width="24"/>
    <path d="M470 200L414 166" stroke="#5E9B45" stroke-width="15"/>
  </g>`
}

/* ============================================================
   GARDEN (Kebun Nenda)
   ============================================================ */

export interface GardenOptions {
  top?: string
  bottom?: string
  sun?: boolean
  sunX?: number
  sunY?: number
  deco?: string
}

export function gardenBg(o: GardenOptions = {}) {
  const top = o.top || '#7FD3E8'
  const bottom = o.bottom || '#BDEFF4'
  return `<rect width="960" height="540" fill="${top}"/>
    <rect y="260" width="960" height="12" fill="#FFF9E8" opacity=".15"/>
    <rect y="272" width="960" height="180" fill="${bottom}"/>
    ${o.sun !== false ? sunball(o.sunX || 470, o.sunY || 88, 44) : ''}
    ${cloud(180, 100, 0.85)}${cloud(700, 70, 0.55)}
    <path d="M0 330h120l24-24h180l24 24h160l24-20h200l24 20h84v210H0z" fill="#5FAE45"/>
    <rect y="386" width="960" height="154" fill="#4E9A3A"/>
    ${Array.from({ length: 20 }, (_, i) => R(i * 48 + 8, 386 + (i % 2) * 12, 24, 6, '#3E7C34', 'opacity=".55"')).join('')}
    <path d="M420 540h140l-24-100H444z" fill="#E8C88A"/>
    ${o.deco || ''}`
}

export const fenceProp = (x: number, y: number, w = 320, h = 82, c = '#FFF4D6') => {
  let s = ''
  for (let i = 0; i <= w; i += 56)
    s +=
      R(x + i, y - h, 12, h, c, 'stroke="#2B1B33" stroke-width="4"') +
      R(x + i - 2, y - h - 10, 16, 10, c, 'stroke="#2B1B33" stroke-width="4"')
  s +=
    R(x - 8, y - h * 0.66, w + 24, 10, c, 'stroke="#2B1B33" stroke-width="4"') +
    R(x - 8, y - h * 0.28, w + 24, 10, c, 'stroke="#2B1B33" stroke-width="4"')
  return `<g>${s}</g>`
}

export const houseSmall = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="2" rx="140" ry="10" fill="#2B1B33" opacity=".2"/>
  <rect x="-110" y="-170" width="220" height="170" fill="#FFF0D0" stroke="#2B1B33" stroke-width="8"/>
  <path d="M-134 -166L0 -250l134 84z" fill="#E85D8A" stroke="#2B1B33" stroke-width="8"/>
  <rect x="-134" y="-170" width="268" height="16" fill="#C93A63"/>
  <rect x="-26" y="-98" width="52" height="98" fill="#B4783A" stroke="#2B1B33" stroke-width="6"/>
  <rect x="12" y="-50" width="8" height="8" fill="#FFC93C"/>
  <rect x="-92" y="-138" width="52" height="46" fill="#7FD3E8" stroke="#2B1B33" stroke-width="6"/>
  <rect x="44" y="-138" width="52" height="46" fill="#7FD3E8" stroke="#2B1B33" stroke-width="6"/>
  <rect x="-72" y="-224" width="24" height="52" fill="#C9694A" stroke="#2B1B33" stroke-width="6"/>
</g>`

export const gateProp = (x: number, y: number, w = 140, h = 174) => `<g>
  <rect x="${x - 16}" y="${y - 16}" width="${w + 32}" height="16" fill="#8A5A36" stroke="#2B1B33" stroke-width="6"/>
  <rect x="${x - 16}" y="${y - 16}" width="16" height="${h + 16}" fill="#6B4630" stroke="#2B1B33" stroke-width="4"/>
  <rect x="${x + w}" y="${y - 16}" width="16" height="${h + 16}" fill="#6B4630" stroke="#2B1B33" stroke-width="4"/>
  <g class="gate-l">
    <rect x="${x + 4}" y="${y}" width="${w / 2 - 4}" height="${h}" fill="#CE9052" stroke="#2B1B33" stroke-width="6"/>
    ${Array.from({ length: 3 }, (_, i) => R(x + 16 + i * 18, y + 10, 6, h - 20, '#B0703C')).join('')}
    ${R(x + 4, y + 12, w / 2 - 4, 8, '#B0703C')}${R(x + 4, y + h - 28, w / 2 - 4, 8, '#B0703C')}
  </g>
  <g class="gate-r">
    <rect x="${x + w / 2}" y="${y}" width="${w / 2 - 4}" height="${h}" fill="#CE9052" stroke="#2B1B33" stroke-width="6"/>
    ${Array.from({ length: 3 }, (_, i) => R(x + w / 2 + 14 + i * 18, y + 10, 6, h - 20, '#B0703C')).join('')}
    ${R(x + w / 2, y + 12, w / 2 - 4, 8, '#B0703C')}${R(x + w / 2, y + h - 28, w / 2 - 4, 8, '#B0703C')}
  </g>
  <rect x="${x + w / 2 - 14}" y="${y + h / 2 - 6}" width="8" height="8" fill="#FFC93C"/>
</g>`

export const butterfly = (x: number, y: number, s = 1, c1 = '#FFC93C', c2 = '#F05A8A') => `<g transform="translate(${x} ${y}) scale(${s})"><g class="bfly">
  <rect x="-24" y="-18" width="20" height="16" fill="${c1}" stroke="#2B1B33" stroke-width="4"/>
  <rect x="4" y="-18" width="20" height="16" fill="${c1}" stroke="#2B1B33" stroke-width="4"/>
  <rect x="-18" y="6" width="16" height="14" fill="${c2}" stroke="#2B1B33" stroke-width="4"/>
  <rect x="2" y="6" width="16" height="14" fill="${c2}" stroke="#2B1B33" stroke-width="4"/>
  <rect x="-3" y="-20" width="6" height="40" fill="#2B1B33"/>
  <rect x="-8" y="-28" width="4" height="10" fill="#2B1B33"/><rect x="4" y="-28" width="4" height="10" fill="#2B1B33"/>
</g></g>`

export const wateringCan = (x: number, y: number, s = 1, c = '#2E9E9A') => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-36" y="-52" width="60" height="52" fill="${c}" stroke="#2B1B33" stroke-width="8"/>
  <rect x="-30" y="-50" width="48" height="8" fill="${shade(c, 26)}"/>
  <rect x="24" y="-40" width="28" height="14" fill="${shade(c, -12)}" stroke="#2B1B33" stroke-width="6"/>
  <rect x="48" y="-48" width="12" height="24" fill="${shade(c, -22)}" stroke="#2B1B33" stroke-width="4"/>
  <path d="M-30 -52v-20h40v20" fill="none" stroke="${shade(c, -28)}" stroke-width="8"/>
  <rect x="-8" y="-62" width="16" height="10" fill="${shade(c, -28)}"/>
</g>`

export const basketProp = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="2" rx="54" ry="8" fill="#2B1B33" opacity=".2"/>
  <path d="M-52 -64h104l-10 54h-84z" fill="#C98A4B" stroke="#2B1B33" stroke-width="8"/>
  <rect x="-56" y="-72" width="112" height="14" fill="#A9672F" stroke="#2B1B33" stroke-width="6"/>
  <path d="M-40 -70q40-60 80 0" fill="none" stroke="#A9672F" stroke-width="8"/>
  ${R(-40, -48, 80, 6, '#B5764A')}${R(-34, -28, 68, 6, '#B5764A')}${R(-28, -8, 56, 6, '#B5764A')}
</g>`

export const tomatoPlant = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="2" rx="76" ry="10" fill="#2B1B33" opacity=".2"/>
  <rect x="-4" y="-180" width="8" height="180" fill="#3E7C34" stroke="#2B1B33" stroke-width="4"/>
  <rect x="-54" y="-112" width="50" height="8" fill="#3E7C34"/><rect x="4" y="-146" width="56" height="8" fill="#3E7C34"/>
  <rect x="-40" y="-66" width="40" height="8" fill="#3E7C34"/><rect x="4" y="-96" width="44" height="8" fill="#3E7C34"/>
  ${R(-64, -120, 16, 12, '#5FAE45')}${R(50, -154, 16, 12, '#5FAE45')}${R(-46, -74, 16, 12, '#5FAE45')}
  ${R(-34, -164, 16, 12, '#5FAE45')}${R(24, -104, 16, 12, '#5FAE45')}${R(-58, -50, 16, 12, '#5FAE45')}
</g>`

export const tomato = (x: number, y: number, s = 1, id = '') => `<g id="${id}" transform="translate(${x} ${y}) scale(${s})">
  <rect x="-20" y="-20" width="40" height="36" fill="#E05252" stroke="#2B1B33" stroke-width="4"/>
  <rect x="-16" y="-24" width="32" height="8" fill="#E05252" stroke="#2B1B33" stroke-width="4"/>
  <rect x="-16" y="16" width="32" height="4" fill="#E05252" stroke="#2B1B33" stroke-width="4"/>
  <rect x="-14" y="-16" width="12" height="8" fill="#F27D7D"/>
  <rect x="-8" y="-30" width="16" height="10" fill="#3E7C34" stroke="#2B1B33" stroke-width="4"/>
  <rect x="0" y="-38" width="4" height="8" fill="#3E7C34"/>
</g>`

export const teaTable = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="4" rx="144" ry="12" fill="#2B1B33" opacity=".2"/>
  <rect x="-136" y="-126" width="272" height="22" fill="#FFE9B8" stroke="#2B1B33" stroke-width="8"/>
  <rect x="-126" y="-104" width="252" height="78" fill="#F05A8A" stroke="#2B1B33" stroke-width="8"/>
  ${Array.from({ length: 10 }, (_, i) =>
    Array.from({ length: 3 }, (_, j) => R(-114 + i * 24, -92 + j * 24, 12, 12, '#FFE9B8', 'opacity=".45"')).join(''),
  ).join('')}
  <rect x="-126" y="-104" width="252" height="12" fill="#FFC6D6"/>
  <rect x="-112" y="-26" width="16" height="26" fill="#8A5A36" stroke="#2B1B33" stroke-width="4"/>
  <rect x="96" y="-26" width="16" height="26" fill="#8A5A36" stroke="#2B1B33" stroke-width="4"/>
</g>`

export const teapot = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-34" y="-38" width="68" height="38" fill="#2E9E9A" stroke="#2B1B33" stroke-width="6"/>
  <rect x="-24" y="-48" width="48" height="10" fill="#2E9E9A" stroke="#2B1B33" stroke-width="4"/>
  <rect x="-8" y="-56" width="16" height="8" fill="#2E9E9A" stroke="#2B1B33" stroke-width="4"/>
  <rect x="32" y="-32" width="20" height="10" fill="#2E9E9A" stroke="#2B1B33" stroke-width="4"/>
  <rect x="48" y="-36" width="6" height="14" fill="#2E9E9A" stroke="#2B1B33" stroke-width="4"/>
  <path d="M-34 -30h-14v16h14" fill="none" stroke="#2B1B33" stroke-width="6"/>
</g>`

export const cupTea = (x: number, y: number, s = 1, full = 0) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-16" y="-16" width="32" height="20" fill="#FFF4D6" stroke="#2B1B33" stroke-width="6"/>
  <rect x="-12" y="-20" width="24" height="6" fill="${full ? '#C98A4B' : '#E8C88A'}"/>
  <rect x="16" y="-12" width="8" height="10" fill="none" stroke="#2B1B33" stroke-width="4"/>
</g>`

export const cookiePlate = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-42" y="-8" width="84" height="12" fill="#FFF4D6" stroke="#2B1B33" stroke-width="4"/>
  <rect x="-26" y="-26" width="18" height="18" fill="#D9A15C" stroke="#2B1B33" stroke-width="4"/>
  <rect x="2" y="-24" width="18" height="18" fill="#D9A15C" stroke="#2B1B33" stroke-width="4"/>
  <rect x="-10" y="-38" width="16" height="16" fill="#E7B877" stroke="#2B1B33" stroke-width="4"/>
  <rect x="-22" y="-22" width="4" height="4" fill="#8A5A36"/><rect x="8" y="-20" width="4" height="4" fill="#8A5A36"/>
</g>`

/* ============================================================
   BATHROOM (Sikat Gigi)
   ============================================================ */

const mirrorProp = (x: number, y: number, w: number, h: number, night: boolean) => `<g class="mirror">
    <rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" fill="${night ? '#6B5A8A' : '#8FD0C8'}" stroke="#2B1B33" stroke-width="10"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${night ? '#2E2B55' : '#DFF4F4'}"/>
    <path d="M${x + 26} ${y + 26}h46v14h-32v46h-14z" fill="#FFF" opacity=".38"/>
    ${
      night
        ? `<rect x="${x + w - 96}" y="${y + 40}" width="48" height="48" fill="#FFF3C9"/>
      <rect x="${x + w - 96}" y="${y + 40}" width="20" height="48" fill="#2E2B55"/>
      <rect x="${x + 44}" y="${y + 120}" width="8" height="8" fill="#FFF3C9"/>
      <rect x="${x + 78}" y="${y + 152}" width="6" height="6" fill="#FFF3C9"/>`
        : ''
    }
  </g>`

const sinkProp = (cx: number, top: number) => `<g class="sink">
    <rect x="${cx - 112}" y="${top}" width="224" height="48" fill="#FFFDF4" stroke="#2B1B33" stroke-width="8"/>
    <rect x="${cx - 94}" y="${top + 10}" width="188" height="18" fill="#CFEDEF"/>
    <rect x="${cx - 8}" y="${top - 36}" width="16" height="40" fill="#B9CBD3" stroke="#2B1B33" stroke-width="6"/>
    <path d="M${cx} ${top - 36}h44v12h-44z" fill="#B9CBD3" stroke="#2B1B33" stroke-width="6"/>
    <rect x="${cx - 60}" y="${top + 48}" width="120" height="66" fill="#E8E0D0" stroke="#2B1B33" stroke-width="8"/>
    <rect x="${cx - 78}" y="${top + 114}" width="156" height="12" fill="#D9CBB4" stroke="#2B1B33" stroke-width="6"/>
    <rect x="${cx - 70}" y="${top + 18}" width="140" height="8" fill="#B9DCD6" opacity=".6"/>
  </g>`

const toothPasteProp = (x: number, y: number, s = 1) => `<g class="paste" transform="translate(${x} ${y}) scale(${s})">
    <rect x="-16" y="-56" width="32" height="66" fill="#FFFDF4" stroke="#2B1B33" stroke-width="6"/>
    <rect x="-16" y="-56" width="32" height="16" fill="#7FC9B0" stroke="#2B1B33" stroke-width="6"/>
    <rect x="-10" y="-32" width="20" height="8" fill="#F05A8A"/>
    <rect x="-8" y="-4" width="16" height="10" fill="#B9CBD3" stroke="#2B1B33" stroke-width="4"/>
  </g>`

export const cupProp = (x: number, y: number, s = 1, c = '#7FC9B0') => `<g class="cup" transform="translate(${x} ${y}) scale(${s})">
    <path d="M-20 -30h40l-4 34H-16z" fill="${c}" stroke="#2B1B33" stroke-width="6"/>
    <rect x="-24" y="-34" width="48" height="8" fill="#FFF4D6" stroke="#2B1B33" stroke-width="4"/>
    <rect x="-14" y="-24" width="28" height="8" fill="#FFF4D6" opacity=".7"/>
  </g>`

export interface BathOptions {
  night?: boolean
  stool?: boolean
}

export function bathBg(o: BathOptions = {}) {
  const night = !!o.night
  const wall = night ? '#4A4678' : '#CFE9E4'
  const grout = night ? '#5B5690' : '#B9DCD6'
  const floor = night ? '#332F5A' : '#E8D5B8'
  let tiles = ''
  for (let x = 48; x < 960; x += 48) tiles += `<rect x="${x}" y="0" width="2" height="414" fill="${grout}" opacity=".6"/>`
  for (let y = 48; y < 414; y += 48) tiles += `<rect x="0" y="${y}" width="960" height="2" fill="${grout}" opacity=".6"/>`
  const stool =
    o.stool === false
      ? ''
      : `<rect x="420" y="380" width="140" height="16" fill="#E8C88A" stroke="#2B1B33" stroke-width="6"/>
    <rect x="432" y="396" width="14" height="18" fill="#C9905B" stroke="#2B1B33" stroke-width="4"/>
    <rect x="534" y="396" width="14" height="18" fill="#C9905B" stroke="#2B1B33" stroke-width="4"/>`
  return `<rect width="960" height="540" fill="${wall}"/>
    ${tiles}
    <rect y="414" width="960" height="126" fill="${floor}"/>
    <rect y="408" width="960" height="10" fill="${shade(floor, -24)}"/>
    ${mirrorProp(650, 60, 210, 210, night)}
    ${sinkProp(720, 300)}
    ${cupProp(846, 300, 0.9, '#F2C14E')}
    ${toothPasteProp(604, 300, 0.9)}
    ${stool}
  `
}

export function foamGroup(x: number, y: number, s = 1) {
  const pts: Array<[number, number]> = [
    [-26, 8],
    [-10, -6],
    [8, -12],
    [26, 0],
    [4, 14],
    [-18, 20],
  ]
  return `<g class="foam">${pts
    .map(
      ([dx, dy], i) =>
        `<circle cx="${x + dx * s}" cy="${y + dy * s}" r="${(8 + (i % 3) * 3) * s}" fill="#FFFDF4" stroke="#B9DCD6" stroke-width="${2 * s}"/>`,
    )
    .join('')}</g>`
}

export const noteShape = (x: number, y: number, s = 1, c = '#F05A8A') => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}">
    <ellipse cx="0" cy="0" rx="15" ry="11" transform="rotate(-18)"/>
    <rect x="11" y="-58" width="6" height="58"/>
    <path d="M17 -58h24v10H17z"/>
  </g>`
