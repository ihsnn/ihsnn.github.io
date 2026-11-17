/**
 * Pixel-art primitives and the Kaluna cast.
 *
 * Everything here returns an SVG string; the story pages splice those strings
 * together, which is how the books were drawn in the first place. Coordinates
 * are a 960 × 540 stage, sides in multiples of 4, dark outlines, no gradients.
 */

export const PAL = {
  ink: '#2B1B33',
  ink2: '#5B3F4A',
  skin: '#F5C08A',
  skin2: '#D99A63',
  hair: '#3A2135',
  cream: '#FFE9B8',
  paper: '#FFF4D6',
  pink: '#F05A8A',
  rose: '#C93A63',
  green: '#4E9A3A',
  lime: '#8CC63F',
  mint: '#7FC9B0',
  teal: '#2E9E9A',
  orange: '#F28A3C',
  gold: '#FFC93C',
  brown: '#9A6A45',
  brown2: '#6B4630',
  sky: '#6FD3E8',
  night: '#241A4A',
  white: '#FFF9E8',
} as const

export const INK = PAL.ink
export const OUT = 'stroke="#2B1B33" stroke-width="8" stroke-linejoin="miter" paint-order="stroke"'

export type Mood = 'smile' | 'laugh' | 'wow' | 'sleep' | 'brave' | 'sad' | 'calm'

/** A rectangle with optional extra presentation attributes. */
export const R = (x: number, y: number, w: number, h: number, c: string, ex = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${ex}/>`

export const S = (d: string, c: string, ex = '') => `<path d="${d}" fill="${c}" ${OUT} ${ex}/>`
export const SD = (d: string, c: string) =>
  `<path d="${d}" fill="${c}" stroke="#2B1B33" stroke-width="4" stroke-linejoin="miter"/>`
export const ST = (d: string, c: string, w = 8) =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="square"/>`

/** Lightens (+amt) or darkens (-amt) a `#rrggbb` colour. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const cl = (v: number) => Math.max(0, Math.min(255, v))
  const r = cl((n >> 16) + amt)
  const g = cl(((n >> 8) & 255) + amt)
  const b = cl((n & 255) + amt)
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/**
 * Places a sprite so that (x, y) is the bottom-centre of a `w × h` box scaled
 * by `s` — the same anchor every character in the books uses.
 */
export function put(
  inner: string,
  x: number,
  y: number,
  s: number,
  cls = '',
  h = 360,
  w = 200,
  extra = '',
): string {
  return `<g transform="translate(${(x - (w * s) / 2).toFixed(1)},${(y - h * s).toFixed(1)}) scale(${s})" ${extra}><g class="${cls}">${inner}</g></g>`
}

export const shadow = (x: number, y: number, rx: number, ry = 13, op = 0.2) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2B1B33" opacity="${op}"/>`

/* ---------- stars & sparkles ---------- */
export const star5 = (cx: number, cy: number, r: number, fill: string, extra = '') => {
  let p = ''
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.46 : r
    p += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1)
  }
  return `<path d="${p}Z" fill="${fill}" ${extra}/>`
}

export const spark4 = (cx: number, cy: number, r: number, fill: string, op = 1) => {
  const q = Math.max(2, Math.round(r / 4)) * 4
  return `<path d="M${cx} ${cy - r}H${cx + q}V${cy - q}H${cx + r}V${cy + q}H${cx + q}V${cy + r}H${cx - q}V${cy + q}H${cx - r}V${cy - q}H${cx - q}V${cy - r}Z" fill="${fill}" opacity="${op}"/>`
}

export const heartIcon = (x: number, y: number, r: number, c: string) => {
  const u = Math.max(4, Math.round(r / 4) * 2)
  return `<g>${R(x - u * 2, y - u, u * 2, u, c)}${R(x, y - u, u * 2, u, c)}
    ${R(x - u * 2, y, u * 4, u, c)}${R(x - u, y + u, u * 2, u, c)}${R(x - u / 2, y + u * 2, u, u, c)}</g>`
}

/* ---------- faces ---------- */
function pixEyes(mood: Mood, lx = 74, cy = 76, gap = 42) {
  const e = PAL.ink
  const w = PAL.white
  if (mood === 'sleep' || mood === 'calm') return R(lx, cy + 4, 14, 4, e) + R(lx + gap, cy + 4, 14, 4, e)
  if (mood === 'laugh')
    return (
      R(lx, cy + 4, 14, 4, e) +
      R(lx - 4, cy + 8, 4, 4, e) +
      R(lx + 14, cy + 8, 4, 4, e) +
      R(lx + gap, cy + 4, 14, 4, e) +
      R(lx + gap - 4, cy + 8, 4, 4, e) +
      R(lx + gap + 14, cy + 8, 4, 4, e)
    )
  return R(lx, cy, 10, 14, e) + R(lx + 2, cy, 4, 4, w) + R(lx + gap, cy, 10, 14, e) + R(lx + gap + 2, cy, 4, 4, w)
}

function pixBrows(mood: Mood, lx = 72, y = 64, color: string = PAL.hair) {
  if (mood === 'brave') return R(lx + 4, y + 4, 16, 4, color) + R(lx + 40, y, 16, 4, color)
  return R(lx, y, 16, 4, color) + R(lx + 40, y, 16, 4, color)
}

function pixMouth(mood: Mood, x = 90, y = 104) {
  const e = PAL.ink
  if (mood === 'laugh') return R(x, y, 20, 14, '#B4405A') + R(x + 4, y + 10, 12, 4, '#FF9AAE')
  if (mood === 'wow') return R(x + 6, y, 8, 14, '#B4405A')
  if (mood === 'sleep') return R(x + 4, y + 4, 12, 4, e)
  if (mood === 'brave') return R(x + 2, y + 6, 16, 4, e)
  if (mood === 'sad') return R(x, y + 4, 20, 4, e) + R(x - 4, y, 4, 4, e) + R(x + 20, y, 4, 4, e)
  return R(x, y, 20, 4, e) + R(x - 4, y - 4, 4, 4, e) + R(x + 20, y - 4, 4, 4, e)
}

/* ---------- grown-ups ---------- */
export interface AdultOpts {
  skin?: string
  hair?: string
  top?: string
  bottom?: string
  dress?: string
  shoe?: string
  mood?: Mood
  coat?: boolean
  glasses?: boolean
  beard?: string
  mustache?: string
  hijab?: string
  pin?: boolean
  stetho?: boolean
  brush?: boolean
  brushColor?: string
  lip?: string
  bald?: boolean
}

export function adult(o: AdultOpts = {}) {
  const skin = o.skin || PAL.skin
  const skin2 = shade(skin, -24)
  const hair = o.hair || PAL.hair
  const top = o.top || PAL.green
  const bottom = o.bottom || '#3A4A6B'
  const dress = o.dress
  const shoe = o.shoe || '#4A3226'
  const mood = o.mood || 'smile'
  const sleeve = o.coat ? '#FFF6E0' : dress || top
  const glasses = o.glasses
    ? `<g fill="none" stroke="#5B3A2A" stroke-width="4">
      <rect x="66" y="70" width="30" height="26"/><rect x="104" y="70" width="30" height="26"/>
      <path d="M96 80h8M66 78l-8-4M134 78l8-4"/></g>`
    : ''
  const beard = o.beard
    ? R(54, 92, 12, 36, o.beard, OUT) +
      R(134, 92, 12, 36, o.beard, OUT) +
      S('M64 116h72v8h-8v12H72v-12h-8z', o.beard) +
      R(82, 96, 36, 8, o.beard)
    : ''
  const mustache = o.mustache ? R(82, 96, 36, 8, o.mustache) : ''
  let legs: string
  if (dress) {
    legs =
      R(80, 300, 12, 28, skin) +
      R(108, 300, 12, 28, skin) +
      R(68, 328, 32, 12, shoe, OUT) +
      R(100, 328, 32, 12, shoe, OUT)
  } else {
    legs =
      R(72, 244, 24, 88, bottom, OUT) +
      R(104, 244, 24, 88, bottom, OUT) +
      R(60, 332, 40, 16, shoe, OUT) +
      R(100, 332, 40, 16, shoe, OUT)
  }
  const torso = dress
    ? S('M62 140h76v8h8v152h-8v8H62v-8h-8V148h8z', dress)
    : S('M64 140h72v8h8v108h-8v8H64v-8h-8V148h8z', top)
  const arms =
    R(36, 148, 20, 92, sleeve, OUT) +
    R(36, 232, 20, 16, skin, OUT) +
    (o.brush ? '' : R(144, 148, 20, 92, sleeve, OUT) + R(144, 232, 20, 16, skin, OUT))
  const brushArm = o.brush
    ? `
    <path d="M140 176L128 148" stroke="${PAL.ink}" stroke-width="30"/>
    <path d="M140 176L128 148" stroke="${sleeve}" stroke-width="22"/>
    <path d="M110 120L134 146" stroke="${PAL.ink}" stroke-width="12"/>
    <path d="M110 120L134 146" stroke="${o.brushColor || '#F05A8A'}" stroke-width="6"/>
    <rect x="92" y="100" width="22" height="20" fill="#FFF4D6" stroke="${PAL.ink}" stroke-width="4"/>
    <path d="M96 98v-6M102 98v-6M108 98v-6M114 98v-6" stroke="#FFF4D6" stroke-width="4"/>
    <rect x="120" y="136" width="18" height="18" fill="${skin}" stroke="${PAL.ink}" stroke-width="4"/>`
    : ''
  const neck = R(88, 124, 24, 20, skin2, OUT)
  const head = S('M68 40h64v8h8v68h-8v8H68v-8h-8V48h8z', skin)
  const ears = o.hijab ? '' : R(50, 80, 12, 20, skin, OUT) + R(138, 80, 12, 20, skin, OUT)
  const hairTop =
    o.hijab || o.bald
      ? ''
      : S('M60 64V40h80v24h-8V52H68v12z', hair) + R(56, 64, 8, 16, hair, OUT) + R(136, 64, 8, 16, hair, OUT)
  const hood = o.hijab
    ? `<path fill-rule="evenodd" fill="${o.hijab}" ${OUT} d="M64 16h72v8h8v16h8v196h-8v8H56v-8h-8V40h8V24h8zM72 48h56v8h8v60h-8v8H72v-8h-8V56h8z"/>
    ${R(56, 60, 8, 128, shade(o.hijab, -26), 'opacity=".35"')}${R(136, 60, 8, 128, shade(o.hijab, -26), 'opacity=".22"')}
    ${R(60, 218, 80, 8, shade(o.hijab, -24), 'opacity=".3"')}
    ${o.pin ? R(132, 120, 8, 8, PAL.gold) : ''}`
    : ''
  const coat = o.coat
    ? S('M64 140h72v8h8v108h-8v8H64v-8h-8V148h8z', '#FFF6E0') +
      `<path d="M84 148h32v8h-8v48h-16v-48h-8z" fill="${top}"/>` +
      R(100, 208, 4, 44, shade('#FFF6E0', -30)) +
      R(68, 196, 16, 4, shade('#FFF6E0', -24))
    : ''
  const stetho = o.stetho
    ? `<path d="M78 152v40h8v24h28v-24h8v-40" fill="none" stroke="#3E5560" stroke-width="8" stroke-linecap="square"/>
    ${R(104, 210, 20, 16, '#B9CBD3', OUT)}`
    : ''
  const lipColor = o.lip || '#B4405A'
  return `${legs}${torso}${arms}${neck}${head}${ears}${hairTop}
    ${hood}
    ${coat}${beard}
    ${pixBrows(mood, 72, 64, hair)}
    ${pixEyes(mood, 74, 76)}
    ${R(58, 92, 8, 4, '#F27D7D', 'opacity=".55"')}${R(134, 92, 8, 4, '#F27D7D', 'opacity=".55"')}
    ${R(96, 92, 8, 4, shade(skin, -38))}
    ${pixMouth(mood, 90, 104).replace(/#B4405A/g, lipColor)}
    ${mustache}${glasses}${stetho}
    ${brushArm}`
}

/* ---------- baby Kaluna ---------- */
export interface BabyOpts {
  mood?: Mood
  suit?: string
  boot?: string
  skin?: string
  hair?: string
  hijab?: string
  brush?: boolean
  point?: boolean
}

export function baby(o: BabyOpts = {}) {
  const mood = o.mood || 'smile'
  const suit = o.suit || '#F17FA6'
  const boot = o.boot || '#7FC9B0'
  const trim = '#FFF4D6'
  const skin = o.skin || '#FBD0A8'
  const hair = o.hair || '#141018'
  const inkk = '#0B0A0E'
  const head = S('M60 32h80v8h8v8h4v76h-4v12h-8v8h-8v4H68v-4h-8v-8h-8v-12h-4V48h4v-8h8z', skin)
  const hairMass = `<path d="M40 84V40h8V28h8v-8h88v8h8v12h8v44z" fill="${hair}"/>
    <path d="M40 84h16v40h-8v8H40z" fill="${hair}"/>
    <path d="M144 84h16v48h-8v-8h-8z" fill="${hair}"/>
    <path d="M78 100L100 48l22 52z" fill="${hair}"/>
    <path d="M56 100L74 68l18 32z" fill="${hair}"/>
    <path d="M126 68l18 32h-36z" fill="${hair}"/>`
  const hood = o.hijab
    ? `<path fill="${o.hijab}" d="M64 12h72v8h8v12h8v152h-8v8H56v-8h-8V32h8V20h8z"/>
    ${R(48, 64, 8, 112, shade(o.hijab, -30), 'opacity=".22"')}${R(144, 64, 8, 112, shade(o.hijab, -30), 'opacity=".14"')}
    <path fill="${skin}" d="M60 58h80v6h6v76h-6v6H60v-6h-6V64h6z"/>
    ${R(60, 64, 4, 76, shade(o.hijab, -18), 'opacity=".5"')}${R(136, 64, 4, 76, shade(o.hijab, -18), 'opacity=".4"')}
    ${R(66, 58, 68, 6, '#FFF0D8', 'opacity=".9"')}
    ${R(48, 134, 10, 42, shade(o.hijab, -26), 'opacity=".25"')}${R(142, 134, 10, 42, shade(o.hijab, -26), 'opacity=".18"')}
    ${R(52, 176, 96, 8, shade(o.hijab, 22), 'opacity=".5"')}`
    : ''
  const eye = (x: number) => `${R(x, 96, 20, 24, inkk)}${R(x + 4, 100, 6, 6, '#FFF')}${R(x + 14, 112, 4, 4, '#FFF')}`
  const eyes =
    mood === 'sleep'
      ? `${R(64, 108, 20, 6, inkk)}${R(116, 108, 20, 6, inkk)}`
      : mood === 'laugh'
        ? `${R(64, 108, 20, 6, inkk)}${R(58, 112, 8, 6, inkk)}${R(82, 112, 8, 6, inkk)}${R(116, 108, 20, 6, inkk)}${R(110, 112, 8, 6, inkk)}${R(134, 112, 8, 6, inkk)}`
        : `${eye(64)}${eye(116)}`
  const mouth =
    mood === 'laugh'
      ? R(86, 130, 28, 16, '#B4405A') + R(92, 138, 16, 6, '#FF9AAE')
      : mood === 'wow'
        ? R(94, 130, 12, 16, '#B4405A')
        : mood === 'sleep'
          ? R(92, 134, 16, 4, inkk)
          : R(90, 134, 20, 4, '#B4405A') + R(86, 130, 4, 4, '#B4405A') + R(110, 130, 4, 4, '#B4405A')
  return `
  ${R(76, 208, 20, 32, suit, OUT)}${R(104, 208, 20, 32, suit, OUT)}
  ${R(68, 236, 32, 16, boot, OUT)}${R(100, 236, 32, 16, boot, OUT)}
  ${S('M64 128h72v8h8v72h-8v8H64v-8h-8v-72h8z', suit)}
  ${R(44, 136, 20, 48, suit, OUT)}${o.brush || o.point ? '' : R(136, 136, 20, 48, suit, OUT)}
  ${R(44, 180, 20, 16, skin, OUT)}${R(136, 180, 20, 16, skin, OUT)}
  ${R(84, 124, 32, 8, trim)}
  ${star5(100, 164, 14, trim)}
  ${R(96, 188, 4, 4, shade(suit, -26))}${R(96, 200, 4, 4, shade(suit, -26))}
  <g transform="translate(100 128) scale(.86) translate(-100 -128)">
    ${head}
    ${o.hijab ? hood : hairMass}
    ${eyes}
    ${mouth}
    ${
      o.brush || o.point
        ? `
      <path d="M144 178L132 152" stroke="${inkk}" stroke-width="26"/>
      <path d="M144 178L132 152" stroke="${suit}" stroke-width="18"/>
      ${
        o.brush
          ? `
        <path d="M112 132L136 156" stroke="${inkk}" stroke-width="12"/>
        <path d="M112 132L136 156" stroke="#7FC9B0" stroke-width="6"/>
        <rect x="96" y="116" width="22" height="20" fill="#FFF4D6" stroke="${inkk}" stroke-width="4"/>
        <path d="M100 114v-6M106 114v-6M112 114v-6M118 114v-6" stroke="#FFF4D6" stroke-width="4"/>
        <rect x="122" y="144" width="18" height="18" fill="${skin}" stroke="${inkk}" stroke-width="4"/>`
          : `
        <rect x="116" y="138" width="18" height="18" fill="${skin}" stroke="${inkk}" stroke-width="4"/>
        <rect x="106" y="128" width="8" height="14" fill="${skin}" stroke="${inkk}" stroke-width="4"/>`
      }
    `
        : ''
    }
  </g>
  `
}

/* ---------- Mamau, the pocket tiger ---------- */
export function mamau() {
  const y = '#F7C948'
  const y2 = '#E0A92E'
  const cream = '#FFF4D0'
  const cream2 = '#EFD9A6'
  const orange = '#F2943A'
  const dark = '#2B1B33'
  return `
  <path d="M18 112h18v8h4v20h-8v8H18z" fill="${y}" stroke="${dark}" stroke-width="8"/>
  <rect x="14" y="104" width="12" height="14" fill="${orange}" stroke="${dark}" stroke-width="6"/>
  <rect x="34" y="140" width="26" height="22" fill="${y}" stroke="${dark}" stroke-width="8"/>
  <rect x="106" y="140" width="26" height="22" fill="${y}" stroke="${dark}" stroke-width="8"/>
  <rect x="38" y="152" width="20" height="8" fill="${cream}"/>
  <rect x="110" y="152" width="20" height="8" fill="${cream}"/>
  <path d="M34 96h96v8h8v40h-8v8H42v-8h-8z" fill="${y}" stroke="${dark}" stroke-width="8"/>
  <rect x="54" y="108" width="62" height="40" fill="${cream}"/>
  <rect x="32" y="116" width="8" height="24" fill="${orange}"/>
  <rect x="130" y="116" width="8" height="24" fill="${orange}"/>
  <rect x="36" y="100" width="98" height="6" fill="${y2}"/>
  <rect x="140" y="116" width="10" height="8" fill="#C9B68A" stroke="${dark}" stroke-width="4"/>
  <g class="key">
    <path d="M150 112h8v6h6v22h-6v6h-8v-6h-6v-22h6z" fill="#D9C08A" stroke="${dark}" stroke-width="6"/>
    <rect x="149" y="122" width="10" height="10" fill="#8A6A3A"/>
  </g>
  <path d="M38 22h84v8h8v8h4v52h-4v8h-8v8H38v-8h-8v-8h-4V38h4v-8h8z" fill="${y}" stroke="${dark}" stroke-width="8"/>
  <rect x="18" y="10" width="32" height="32" fill="${y}" stroke="${dark}" stroke-width="8"/>
  <rect x="120" y="10" width="32" height="32" fill="${y}" stroke="${dark}" stroke-width="8"/>
  <rect x="25" y="17" width="18" height="18" fill="${cream}"/>
  <rect x="127" y="17" width="18" height="18" fill="${cream}"/>
  <rect x="34" y="48" width="8" height="20" fill="${cream2}"/>
  <rect x="128" y="48" width="8" height="20" fill="${cream2}"/>
  <rect x="58" y="26" width="10" height="8" fill="${cream2}"/>
  <rect x="102" y="26" width="10" height="8" fill="${cream2}"/>
  <path d="M50 70h70v6h6v22h-6v6H50v-6h-6V76h6z" fill="${cream}" stroke="${dark}" stroke-width="6"/>
  <rect x="74" y="72" width="22" height="12" fill="#5B3A2A"/>
  <path d="M85 84v6" stroke="${dark}" stroke-width="4"/>
  <path d="M77 92q8 7 16 0" stroke="${dark}" stroke-width="4" fill="none"/>
  <rect x="56" y="48" width="16" height="16" fill="#221A26"/>
  <rect x="98" y="48" width="16" height="16" fill="#221A26"/>
  <rect x="59" y="50" width="6" height="6" fill="#FFF"/>
  <rect x="101" y="50" width="6" height="6" fill="#FFF"/>
  <rect x="60" y="76" width="6" height="4" fill="${cream2}"/>
  <rect x="104" y="76" width="6" height="4" fill="${cream2}"/>
  `
}

/* ---------- cast ---------- */
/** Everything a character may be asked to wear, in one bag of options. */
export type DrawOptions = BabyOpts & AdultOpts

export interface CastMember {
  name: string
  role: string
  kind: 'baby' | 'toy' | 'adult'
  draw: (o?: DrawOptions) => string
  w: number
  h: number
}

export const CAST: Record<string, CastMember> = {
  kaluna: {
    name: 'Kaluna',
    role: 'Bayi 9 bulan yang berani',
    kind: 'baby',
    draw: (o) => baby(o),
    w: 200,
    h: 260,
  },
  mamau: {
    name: 'Mamau',
    role: 'Mainan harimau mungil sebesar telapak tangan',
    kind: 'toy',
    draw: () => mamau(),
    w: 170,
    h: 170,
  },
  mama: {
    name: 'Mama',
    role: 'Selalu menemani Kaluna',
    kind: 'adult',
    draw: (o) => adult({ hijab: '#E85D8A', dress: '#F6A8BE', pin: true, mood: 'smile', ...o }),
    w: 200,
    h: 360,
  },
  papa: {
    name: 'Papa',
    role: 'Penyabar dan suka bercanda',
    kind: 'adult',
    draw: (o) => adult({ top: '#5E9B45', bottom: '#33456B', hair: '#2F1B28', mood: 'smile', ...o }),
    w: 200,
    h: 360,
  },
  nenda: {
    name: 'Nenda',
    role: 'Nenek dari keluarga Ayah',
    kind: 'adult',
    draw: (o) =>
      adult({ hijab: '#2E9E9A', dress: '#A7D8C6', glasses: true, pin: true, hair: '#CFC8BC', ...o }),
    w: 200,
    h: 360,
  },
  ayahchiek: {
    name: 'Ayah Chiek',
    role: 'Kakek dari keluarga Ayah',
    kind: 'adult',
    draw: (o) =>
      adult({
        top: '#CDB68E',
        bottom: '#6B4630',
        hair: '#E2DCD0',
        beard: '#F2ECDF',
        mood: 'smile',
        ...o,
      }),
    w: 200,
    h: 360,
  },
  oma: {
    name: 'Oma',
    role: 'Nenek dari keluarga Mama',
    kind: 'adult',
    draw: (o) =>
      adult({ hijab: '#C77F99', dress: '#F0C9AE', glasses: true, pin: true, hair: '#CFC8BE', ...o }),
    w: 200,
    h: 360,
  },
  opa: {
    name: 'Opa',
    role: 'Kakek dari keluarga Mama',
    kind: 'adult',
    draw: (o) =>
      adult({
        top: '#DE8438',
        bottom: '#66663F',
        hair: '#E2DCD0',
        glasses: true,
        mustache: '#F2ECDF',
        mood: 'smile',
        ...o,
      }),
    w: 200,
    h: 360,
  },
  dokter: {
    name: 'Bu Dokter Hana',
    role: 'Dokter yang ramah',
    kind: 'adult',
    draw: (o) =>
      adult({
        hijab: '#7FC9B0',
        top: '#2E7E7E',
        coat: true,
        stetho: true,
        pin: true,
        mood: 'smile',
        ...o,
      }),
    w: 200,
    h: 360,
  },
}

export function avatar(key: string, size = 64) {
  const c = CAST[key]
  if (!c) return ''
  const vb = c.kind === 'baby' ? '20 8 160 160' : c.kind === 'toy' ? '16 8 140 140' : '30 20 140 150'
  return `<svg viewBox="${vb}" width="${size}" height="${size}" aria-hidden="true">${c.draw({ mood: 'laugh' })}</svg>`
}

/* ---------- sky & decoration ---------- */
export const cloud = (x: number, y: number, s = 1, c = '#FFF9E8') => `<g transform="translate(${x} ${y}) scale(${s})">
  ${R(-40, -12, 80, 24, c)}${R(-24, -24, 48, 12, c)}${R(-8, -32, 24, 8, c)}${R(24, -20, 20, 8, c)}</g>`

export const sunball = (x: number, y: number, r = 46) => {
  const u = Math.max(4, Math.round(r / 8) * 4)
  const d = Math.round((r + 12) / 4) * 4
  return `<g class="rays" style="transform-origin:${x}px ${y}px">
    ${R(x - u / 2, y - d - u, u, u * 2, PAL.gold)}${R(x - u / 2, y + d, u, u * 2, PAL.gold)}
    ${R(x - d - u, y - u / 2, u * 2, u, PAL.gold)}${R(x + d, y - u / 2, u * 2, u, PAL.gold)}
    ${R(x - r * 0.8, y - r * 0.5, r * 1.6, r, PAL.gold)}${R(x - r * 0.5, y - r * 0.8, r, r * 1.6, PAL.gold)}
    ${R(x - r * 0.55, y - r * 0.55, r * 1.1, r * 1.1, '#FFD86B')}
    ${R(x - r * 0.3, y - r * 0.6, r * 0.6, r * 0.3, '#FFE9A8')}
  </g>`
}

export const plant = (x: number, y: number, s = 1, pot = '#C9694A') => `<g transform="translate(${x} ${y}) scale(${s})">
  ${R(-24, -8, 48, 8, shade(pot, -30), OUT)}
  ${S('M-20 0h40l-4 32h-32z', pot)}
  ${R(-4, -40, 8, 36, '#3E7C34')}
  ${R(-24, -28, 20, 12, '#4E9A3A')}${R(4, -24, 20, 12, '#4E9A3A')}
  ${R(-16, -44, 12, 12, '#5FAE45')}${R(4, -40, 12, 12, '#5FAE45')}
</g>`

export const frameArt = (x: number, y: number, w: number, h: number, c: string, kind = 'star') => {
  let inner = ''
  if (kind === 'star') inner = star5(x + w / 2, y + h / 2, Math.min(w, h) * 0.28, '#FFF0C8')
  else if (kind === 'arch')
    inner =
      R(x + w * 0.28, y + h * 0.35, w * 0.44, h * 0.45, '#FFF0C8') +
      R(x + w * 0.38, y + h * 0.22, w * 0.24, h * 0.2, '#FFF0C8')
  else if (kind === 'heart') inner = heartIcon(x + w / 2, y + h / 2 + 4, Math.min(w, h) * 0.22, '#FFF0C8')
  else inner = R(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4, '#FFF0C8')
  return `<g>${R(x - 4, y - 4, w + 8, h + 8, INK)}${R(x, y, w, h, c)}${R(x + 8, y + 8, w - 16, h - 16, '#FFF8E0')}${inner}</g>`
}

export const lantern = (x: number, y: number, s = 1, glow = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  ${glow ? `<circle cx="0" cy="26" r="42" fill="#FFD86B" opacity=".22"/>` : ''}
  ${R(-4, 4, 8, 12, '#8A5A36', OUT)}${R(-8, 2, 16, 6, '#8A5A36')}
  ${R(-22, 16, 44, 8, '#B4783A', OUT)}
  ${S('M-18 24h36v36h-36z', '#FFC93C')}${R(-10, 32, 20, 24, '#FFF0B0')}
  ${R(-18, 60, 36, 8, '#B4783A', OUT)}${R(-4, 68, 8, 10, '#8A5A36')}
</g>`

export const booksStack = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  ${R(-46, -6, 92, 20, '#E85D8A', OUT)}${R(-40, -2, 80, 4, '#FFF0D8')}
  ${R(-40, -28, 86, 22, '#2E9E9A', OUT)}${R(-34, -24, 74, 4, '#FFF0D8')}
  ${R(-48, -50, 88, 22, '#FFC93C', OUT)}${R(-42, -46, 76, 4, '#A9741C')}
</g>`

export const rehalBook = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  ${R(-44, -4, 88, 8, '#8A5A36', OUT)}
  ${R(-30, -40, 12, 40, '#9A6A45')}${R(18, -40, 12, 40, '#9A6A45')}
  ${R(-54, -44, 108, 28, '#F4E7CC', OUT)}
  ${R(-6, -42, 12, 24, '#D9C8A6')}
  ${R(-48, -38, 36, 4, '#B9A78A')}${R(12, -38, 36, 4, '#B9A78A')}
</g>`

export const prayerRug = (x: number, y: number, s = 1, c = '#2E9E9A') => `<g transform="translate(${x} ${y}) scale(${s})">
  ${R(-90, -118, 180, 118, c, OUT)}
  ${R(-70, -104, 140, 80, shade(c, 26))}
  ${R(-54, -90, 108, 52, '#FFE9B8', 'opacity=".35"')}
  ${R(-90, -100, 180, 4, '#FFF0D8', 'opacity=".4"')}
  ${R(-90, -40, 180, 4, '#FFF0D8', 'opacity=".4"')}
</g>`

export const chair = (x: number, y: number, s = 1, c = '#E85D8A') => `<g transform="translate(${x} ${y}) scale(${s})">
  ${R(-32, -76, 64, 56, c, OUT)}
  ${R(-20, -64, 40, 32, shade(c, 22))}
  ${R(-34, -24, 68, 16, shade(c, -26), OUT)}
  ${R(-28, -8, 8, 8, '#8A5A36', OUT)}${R(20, -8, 8, 8, '#8A5A36', OUT)}
</g>`

export const ticketMachine = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  ${R(-40, -150, 80, 150, '#F4E6D0', OUT)}
  ${R(-30, -140, 60, 52, '#2E9E9A')}
  ${R(-24, -128, 48, 8, '#FFF0D8')}${R(-24, -112, 32, 8, '#7FC9B0')}
  ${R(-32, -76, 64, 12, '#D9C4A6', OUT)}
  ${R(-20, -58, 40, 10, '#2B1B33')}
  ${R(-12, -38, 24, 24, '#E85D8A', OUT)}
  ${R(-34, -8, 68, 8, '#D9C4A6')}
</g>`

export const bagTote = (x: number, y: number, s = 1, c = '#FFC93C') => `<g transform="translate(${x} ${y}) scale(${s})">
  ${ST('M-16 -58v-16h32v16', shade(c, -40))}
  ${S('M-40 -56h80l-6 56h-68z', c)}
  ${R(-40, -56, 80, 10, shade(c, 18))}
  ${R(-20, -34, 40, 6, '#FFF6E4', 'opacity=".8"')}
  ${R(-6, -56, 12, 56, shade(c, -18), 'opacity=".35"')}
</g>`

export const bedProp = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  ${R(-150, -120, 300, 64, '#B4783A', OUT)}
  ${R(-138, -108, 276, 48, '#D9A97A')}
  ${R(-158, -80, 316, 24, '#8A5A36', OUT)}
  ${S('M-156 -88h312v56h-312z', '#FFF6E4')}
  ${R(-156, -56, 312, 40, '#F6A8BE', OUT)}
  ${R(-156, -56, 312, 12, '#FFC6D6')}
  ${R(-158, -16, 16, 16, '#8A5A36', OUT)}${R(142, -16, 16, 16, '#8A5A36', OUT)}
  ${R(-110, -108, 88, 32, '#FFFDF4', OUT)}
</g>`

export const lamp = (x: number, y: number, s = 1, on = true) => `<g transform="translate(${x} ${y}) scale(${s})">
  ${on ? `<circle cx="0" cy="-52" r="48" fill="#FFD86B" opacity=".2"/>` : ''}
  ${R(-20, -8, 40, 8, '#8A5A36', OUT)}${R(-4, -44, 8, 36, '#8A5A36')}
  ${S('M-28 -44h56l-8 -24h-40z', on ? '#FFC93C' : '#C9B8A0')}
  ${R(-28, -68, 56, 6, shade(on ? '#FFC93C' : '#C9B8A0', -30))}
</g>`

export const tree = (x: number, y: number, s = 1, c = '#4E9A3A') => `<g transform="translate(${x} ${y}) scale(${s})">
  ${R(-12, -84, 24, 84, '#8A5A36', OUT)}
  ${S('M-56 -128h112v24h8v40h-128v-40h8z', c)}
  ${R(-72, -112, 16, 24, shade(c, 18))}${R(56, -112, 16, 24, shade(c, 18))}
  ${R(-40, -152, 80, 24, shade(c, 20))}
  ${R(-24, -168, 48, 16, shade(c, 26))}
</g>`

export const bush = (x: number, y: number, s = 1, c = '#5FAE45') => `<g transform="translate(${x} ${y}) scale(${s})">
  ${S('M-56 -32h112v24h8v8h-128v-8h8z', c)}
  ${R(-40, -48, 80, 16, c)}${R(-24, -60, 48, 12, shade(c, 18))}
</g>`

export const flower = (x: number, y: number, s = 1, petal = '#F05A8A', center = '#FFC93C') => {
  const p = 12
  return `<g transform="translate(${x} ${y}) scale(${s})">
  ${R(-3, -34, 6, 34, '#3E7C34')}
  ${R(-18, -22, 12, 8, '#5FAE45')}${R(6, -28, 12, 8, '#5FAE45')}
  ${R(-p, -58, p * 2, p * 2, petal, OUT)}
  ${R(-p * 1.5, -48, p, p * 1.6, petal, OUT)}
  ${R(p * 0.5, -48, p, p * 1.6, petal, OUT)}
  ${R(-8, -70, 16, 12, petal, OUT)}
  ${R(-6, -52, 12, 12, center)}
</g>`
}
