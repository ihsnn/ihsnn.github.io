import {
  alpha,
  arcText,
  barcode,
  circlePath,
  clamp,
  dateParts,
  drawText,
  formatDate,
  FONT,
  fillRound,
  gloss,
  grainDots,
  halftone,
  holo,
  linear,
  mix,
  photo,
  radial,
  roundPath,
  rubberStamp,
  scanlines,
  seeded,
  star,
  strokeRound,
  textLines,
  vignette,
  wrapText,
  type PhotoBitmap,
  type Scene,
} from '../art'

/* ------------------------------------------------------------------ */
/* 06 · Aged cinema ticket                                             */
/* ------------------------------------------------------------------ */

export function paintTicket({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 12
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#efe3c8'],
    [0.45, '#e8dcc3'],
    [1, '#dccdae'],
  ])
  roundPath(ctx, 12, 12, w - 24, h - 24, 14)
  ctx.fill()
  ctx.restore()

  grainDots(ctx, 12, 12, w - 24, h - 24, 6, 'rgba(90, 60, 30, 0.14)', 0.7)
  vignette(ctx, 12, 12, w - 24, h - 24, '#7a5a2a', 0.22)
  ctx.fillStyle = 'rgba(120, 85, 40, 0.16)'
  ctx.beginPath()
  ctx.ellipse(720, 470, 120, 70, 0.4, 0, Math.PI * 2)
  ctx.fill()

  // Ticket notches and the tear line.
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  for (const [cx, cy, radius] of [
    [600, 12, 16],
    [600, h - 12, 16],
    [12, 310, 12],
    [w - 12, 310, 12],
  ] as const) {
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  strokeRound(ctx, 24, 24, w - 48, h - 48, 10, 'rgba(96, 66, 30, 0.45)', 2)
  strokeRound(ctx, 34, 34, w - 68, h - 68, 8, 'rgba(96, 66, 30, 0.22)', 1)

  drawText(ctx, 'PHOTO TICKET', 56, 92, {
    size: 30,
    weight: 700,
    family: FONT.serif,
    color: '#4a3a24',
    tracking: 3,
  })
  drawText(ctx, 'ADMIT TWO', 50, 168, {
    size: 76,
    weight: 400,
    family: FONT.display,
    color: '#3b2c18',
    tracking: 2,
  })
  drawText(ctx, 'ONE SHOT · VALID FOREVER', 56, 194, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#7c6a4d',
    tracking: 2.2,
  })

  const stub = (
    x: number,
    image: PhotoBitmap | null,
    label: string,
    number: string,
  ) => {
    ctx.save()
    ctx.fillStyle = '#f7efdd'
    ctx.fillRect(x - 7, 213, 244, 268)
    ctx.strokeStyle = 'rgba(96, 66, 30, 0.5)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(x - 7, 213, 244, 268)
    ctx.restore()
    photo(ctx, image, x, 220, 230, 250, {
      label,
      tone: 'sepia',
      placeholderBg: '#c9b690',
      placeholderInk: '#5a4525',
      seed: 9 + number.length,
    })
    drawText(ctx, `PHOTO ${number}`, x, 498, {
      size: 11,
      weight: 700,
      family: FONT.mono,
      color: '#6b5738',
      tracking: 2,
    })
    drawText(ctx, 'NON-TRANSFER', x + 230, 498, {
      size: 9,
      family: FONT.mono,
      color: '#9a8562',
      align: 'right',
      tracking: 1.5,
    })
  }

  stub(56, photos[0], 'PHOTO 1', '1')
  stub(306, photos[1], 'PHOTO 2', '2')

  drawText(ctx, 'NO. 006 · 119 · 026', 56, 548, {
    size: 14,
    weight: 700,
    family: FONT.mono,
    color: '#5a4729',
    tracking: 2,
  })
  drawText(ctx, caption || 'PRICE: ONE SMILE', 56, 574, {
    size: 11,
    family: FONT.mono,
    color: '#8a7550',
    tracking: 1.8,
    maxWidth: 420,
  })

  // Perforation.
  ctx.save()
  ctx.strokeStyle = 'rgba(96, 66, 30, 0.4)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([7, 9])
  ctx.beginPath()
  ctx.moveTo(600, 44)
  ctx.lineTo(600, h - 44)
  ctx.stroke()
  ctx.restore()

  // Right stub.
  ctx.save()
  ctx.translate(702, 322)
  ctx.rotate(-Math.PI / 2)
  drawText(ctx, 'ADMIT ONE', 0, 0, {
    size: 34,
    weight: 400,
    family: FONT.display,
    color: '#4a3a24',
    align: 'center',
    tracking: 8,
  })
  ctx.restore()

  drawText(ctx, 'PHOTO BOOTH · STUDIO 06', 620, 92, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#7c6a4d',
    tracking: 1.6,
  })
  drawText(ctx, formatDate(date, 'dotted'), 620, 112, {
    size: 10,
    family: FONT.mono,
    color: '#9a8562',
    tracking: 1.6,
  })

  rubberStamp(ctx, 810, 162, 42, 'PHOTO BOOTH', 'LUNAS', 'rgba(140, 36, 26, 0.75)', -0.18)
  rubberStamp(ctx, 810, 432, 46, 'ADMIT', 'PHOTO', 'rgba(44, 76, 122, 0.6)', 0.14)

  barcode(ctx, 640, 506, 216, 46, 8, '#4a3a24')
  drawText(ctx, '006 · 026', 856, 574, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#6b5738',
    align: 'right',
    tracking: 1.5,
  })

  gloss(ctx, 12, 12, w - 24, h - 24, { opacity: 0.14, radius: 14, angle: -0.35 })
  holo(ctx, 12, 12, w - 24, h - 24, { opacity: 0.06, seed: 18, sparkles: 4 })
}

/* ------------------------------------------------------------------ */
/* 07 · Magazine cover                                                 */
/* ------------------------------------------------------------------ */

export function paintMagazine({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.fillStyle = '#f7f1e6'
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 14, 'rgba(60, 45, 30, 0.08)', 0.5)

  drawText(ctx, 'INDEPENDENT PHOTO MAGAZINE', 46, 50, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#7a6a52',
    tracking: 2.4,
  })
  drawText(ctx, `NO. 06 · ${formatDate(date, 'long')} · FREE`, w - 46, 50, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#7a6a52',
    align: 'right',
    tracking: 1.8,
  })

  drawText(ctx, 'GLOSS', 32, 148, {
    size: 126,
    weight: 900,
    family: FONT.serif,
    color: '#b4001e',
    tracking: -3,
    shadow: { color: 'rgba(90, 10, 20, 0.18)', blur: 6, y: 3 },
  })
  drawText(ctx, 'PHOTO ISSUE', w - 32, 138, {
    size: 14,
    weight: 700,
    family: FONT.mono,
    color: '#6d5e49',
    align: 'right',
    tracking: 4,
  })

  photo(ctx, photos[0], 0, 170, w, 760, {
    label: 'COVER',
    tone: 'warm',
    seed: 31,
  })
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 170, w, 760)
  ctx.clip()
  halftone(ctx, 0, 170, w, 760, 5, 'rgba(0, 0, 0, 0.07)', 0.24)
  ctx.fillStyle = linear(ctx, 0, 620, 0, 930, [
    [0, 'rgba(0, 0, 0, 0)'],
    [1, 'rgba(20, 10, 8, 0.72)'],
  ])
  ctx.fillRect(0, 620, w, 310)
  ctx.restore()

  drawText(ctx, 'COVER STORY', 44, 724, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#ffd166',
    tracking: 4,
    shadow: { color: 'rgba(0, 0, 0, 0.45)', blur: 6 },
  })
  drawText(ctx, 'HAPPY', 40, 812, {
    size: 100,
    weight: 400,
    family: FONT.display,
    color: '#ffffff',
    tracking: 1,
    shadow: { color: 'rgba(0, 0, 0, 0.5)', blur: 10, y: 3 },
  })
  drawText(ctx, 'FACE', 40, 900, {
    size: 100,
    weight: 400,
    family: FONT.display,
    color: '#ffffff',
    tracking: 1,
    shadow: { color: 'rgba(0, 0, 0, 0.5)', blur: 10, y: 3 },
  })
  drawText(ctx, 'ONE SHOT, FOREVER', 44, 934, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#f3e3c8',
    tracking: 1.6,
    shadow: { color: 'rgba(0, 0, 0, 0.5)', blur: 6 },
  })

  // Edition sticker.
  ctx.save()
  ctx.translate(716, 262)
  ctx.rotate(-0.16)
  ctx.fillStyle = '#ffd166'
  ctx.beginPath()
  ctx.arc(0, 0, 78, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#b4001e'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, 66, 0, Math.PI * 2)
  ctx.stroke()
  drawText(ctx, 'ISSUE', 0, -10, {
    size: 18,
    weight: 900,
    family: FONT.sans,
    color: '#b4001e',
    align: 'center',
    tracking: 2,
  })
  drawText(ctx, 'PHOTO', 0, 18, {
    size: 26,
    weight: 900,
    family: FONT.sans,
    color: '#b4001e',
    align: 'center',
    tracking: 1,
  })
  drawText(ctx, '06', 0, 48, {
    size: 18,
    weight: 700,
    family: FONT.mono,
    color: '#7a2b12',
    align: 'center',
  })
  ctx.restore()

  // Bottom furniture.
  ctx.fillStyle = '#f7f1e6'
  ctx.fillRect(0, 930, w, h - 930)
  ctx.fillStyle = '#b4001e'
  ctx.fillRect(0, 930, w, 6)

  drawText(ctx, 'PHOTO: YOUR FRONT CAMERA', 46, 980, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#6d5e49',
    tracking: 2,
  })
  drawText(ctx, caption || 'SMILE: MANDATORY', 46, 1006, {
    size: 22,
    weight: 900,
    family: FONT.sans,
    color: '#2a211c',
    tracking: 1,
    maxWidth: 520,
  })
  drawText(ctx, 'LAYOUT: 06 STRIPS · 112 PAGES', 46, 1062, {
    size: 10,
    family: FONT.mono,
    color: '#8a7a62',
    tracking: 1.5,
  })

  drawText(ctx, '06', 630, 1094, {
    size: 150,
    weight: 900,
    family: FONT.serif,
    color: '#e8dcc8',
    align: 'right',
  })
  barcode(ctx, 650, 966, 146, 62, 22, '#2a211c')

  gloss(ctx, 0, 170, w, 760, { opacity: 0.2, angle: -0.6 })
  holo(ctx, 0, 170, w, 760, { opacity: 0.08, seed: 24, sparkles: 6 })
}

/* ------------------------------------------------------------------ */
/* 08 · Staff ID card                                                  */
/* ------------------------------------------------------------------ */

export function paintIdCard({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#1b2b55'],
    [0.55, '#14213d'],
    [1, '#0c152c'],
  ])
  roundPath(ctx, 0, 0, w, h, 28)
  ctx.fill()

  // Badge pattern.
  ctx.save()
  ctx.strokeStyle = 'rgba(94, 230, 200, 0.06)'
  ctx.lineWidth = 2
  for (let i = -h; i < w; i += 42) {
    ctx.beginPath()
    ctx.moveTo(i, h)
    ctx.lineTo(i + h, 0)
    ctx.stroke()
  }
  ctx.restore()
  halftone(ctx, 620, 0, 280, 340, 14, 'rgba(94, 230, 200, 0.09)', 0.3)

  strokeRound(ctx, 10, 10, w - 20, h - 20, 22, 'rgba(255, 255, 255, 0.16)', 2)

  // Lanyard slot.
  fillRound(ctx, 390, 14, 120, 24, 12, '#080f21')
  strokeRound(ctx, 390, 14, 120, 24, 12, 'rgba(255, 255, 255, 0.28)', 1.5)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.fillRect(398, 18, 104, 4)

  drawText(ctx, 'PHOTO BOOTH', 40, 88, {
    size: 22,
    weight: 900,
    family: FONT.sans,
    color: '#ffffff',
    tracking: 3,
  })
  drawText(ctx, 'PHOTO STAFF PASS · 06', 42, 110, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#5ee6c8',
    tracking: 2.4,
  })
  drawText(ctx, 'MODEL PB-06', w - 40, 88, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#8aa0c6',
    align: 'right',
    tracking: 1.8,
  })

  // Portrait.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 6
  fillRound(ctx, 34, 122, 228, 272, 16, '#ffffff')
  ctx.restore()
  photo(ctx, photos[0], 40, 128, 216, 260, {
    label: 'PHOTO 1',
    tone: 'fade',
    radius: 11,
    placeholderBg: '#24365e',
    placeholderInk: '#e8f6ff',
    seed: 33,
  })
  drawText(ctx, 'PHOTO BOOTH · 06', 40, 382, {
    size: 9,
    family: FONT.mono,
    color: '#9fb4d8',
    tracking: 1.5,
  })

  drawText(ctx, (caption || 'YOUR NAME').toUpperCase(), 292, 190, {
    size: 42,
    weight: 900,
    family: FONT.sans,
    color: '#ffffff',
    tracking: -0.5,
    maxWidth: 520,
  })
  drawText(ctx, 'PHOTO SUBJECT · SMILE DIVISION', 294, 222, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#ffcb05',
    tracking: 2.2,
  })
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
  ctx.fillRect(292, 242, 548, 1.5)

  const field = (x: number, y: number, label: string, value: string) => {
    drawText(ctx, label, x, y, {
      size: 9,
      weight: 700,
      family: FONT.mono,
      color: '#8aa0c6',
      tracking: 1.8,
    })
    drawText(ctx, value, x, y + 28, {
      size: 20,
      weight: 700,
      family: FONT.mono,
      color: '#ffffff',
      tracking: 0.5,
    })
  }
  field(292, 274, 'ID KARYAWAN', 'KF-006')
  field(458, 274, 'VALID THRU', 'FOREVER')
  field(640, 274, 'FORMAT', 'JPEG · PNG')
  field(292, 342, 'CLASS', 'PHOTOGENIK')
  field(458, 342, 'STATUS', 'SMILE')

  drawText(ctx, 'you', 306, 444, {
    size: 32,
    family: FONT.script,
    color: '#d8e6ff',
    style: 'italic',
  })
  ctx.strokeStyle = 'rgba(216, 230, 255, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(292, 452)
  ctx.lineTo(540, 452)
  ctx.stroke()
  drawText(ctx, 'SIGNATURE', 292, 470, {
    size: 8,
    family: FONT.mono,
    color: '#8aa0c6',
    tracking: 1.5,
  })

  barcode(ctx, 40, 432, 216, 42, 19, '#ffffff')

  // Holo patch.
  ctx.save()
  ctx.beginPath()
  ctx.arc(778, 420, 58, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = '#22305a'
  ctx.fillRect(720, 362, 116, 116)
  holo(ctx, 720, 362, 116, 116, { opacity: 0.7, seed: 45, sparkles: 8 })
  circleRing(ctx, 778, 420, 58, 'rgba(255, 255, 255, 0.35)', 2)
  ctx.restore()
  drawText(ctx, '06', 778, 432, {
    size: 30,
    weight: 900,
    family: FONT.mono,
    color: 'rgba(255, 255, 255, 0.82)',
    align: 'center',
  })

  // Bottom bar.
  ctx.fillStyle = 'rgba(8, 14, 30, 0.72)'
  ctx.fillRect(0, 500, w, 60)
  drawText(ctx, 'VALID FOR A LIFETIME OF MEMORIES', 40, 536, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#8aa0c6',
    tracking: 2.2,
  })
  drawText(ctx, 'PHOTO BOOTH · 2026', w - 40, 536, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#5ee6c8',
    align: 'right',
    tracking: 2,
  })

  gloss(ctx, 0, 0, w, h, { opacity: 0.16, radius: 28, angle: -0.5 })
  holo(ctx, 0, 0, w, h, { opacity: 0.07, seed: 30, sparkles: 5 })

  function circleRing(
    context: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    color: string,
    lineWidth: number,
  ) {
    context.save()
    context.strokeStyle = color
    context.lineWidth = lineWidth
    context.beginPath()
    context.arc(cx, cy, radius, 0, Math.PI * 2)
    context.stroke()
    context.restore()
  }
}

/* ------------------------------------------------------------------ */
/* 09 · Imaginary passport page                                        */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* 09 · Passport — an open book, identity page facing the visas        */
/* ------------------------------------------------------------------ */

const MRZ_WIDTH = 44

function mrzLine(value: string, length = MRZ_WIDTH): string {
  const clean = value
    .toUpperCase()
    .replace(/[^A-Z0-9<]/g, '<')
    .slice(0, length)
  return clean.padEnd(length, '<')
}

function mrzName(caption: string): string {
  const name = (caption || 'WANDERER').toUpperCase().replace(/[^A-Z ]/g, '')
  return name.trim().replace(/ +/g, '<')
}

interface BookPalette {
  cover: string
  coverDark: string
  page: string
  pageEdge: string
  ink: string
  muted: string
  accent: string
  gold: string
  stamp: string
  souvenir: boolean
}

function paintBook(
  { ctx, w, h, photos, caption, date }: Scene,
  palette: BookPalette,
) {
  const parts = dateParts(date)
  const expiryYear = Number(parts.year) + 10
  const expiry = formatDate(`${expiryYear}-${parts.monthNumber}-${parts.day}`, 'long')
  const issued = formatDate(date, 'long')
  const passportNo = `PB 006 ${parts.year}`
  const holder = (caption || 'WANDERER').toUpperCase()

  ctx.clearRect(0, 0, w, h)

  // Cover, seen just past the page block.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 10
  fillRound(ctx, 6, 6, w - 12, h - 12, 16, palette.cover)
  ctx.restore()
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, alpha('#ffffff', 0.08)],
    [0.4, 'rgba(255, 255, 255, 0)'],
    [1, palette.coverDark],
  ])
  roundPath(ctx, 6, 6, w - 12, h - 12, 16)
  ctx.fill()
  grainDots(ctx, 6, 6, w - 12, h - 12, 91, 'rgba(0, 0, 0, 0.18)', 0.5)
  strokeRound(ctx, 14, 14, w - 28, h - 28, 12, alpha(palette.gold, 0.55), 1.5)

  // Page block.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 3
  fillRound(ctx, 26, 24, w - 52, h - 76, 8, palette.page)
  ctx.restore()
  ctx.fillStyle = palette.page
  ctx.fillRect(26, 24, w - 52, h - 76)
  ctx.strokeStyle = alpha(palette.ink, 0.22)
  ctx.lineWidth = 1
  ctx.strokeRect(32, 30, w - 64, h - 88)

  // Stacked page edges.
  ctx.save()
  ctx.strokeStyle = alpha(palette.ink, 0.14)
  ctx.lineWidth = 1
  for (let edge = 0; edge < 3; edge += 1) {
    ctx.beginPath()
    ctx.moveTo(26, h - 56 + edge * 3)
    ctx.lineTo(w - 26, h - 56 + edge * 3)
    ctx.stroke()
  }
  ctx.restore()

  const left = { x: 56, y: 50, w: 500, h: 626 }
  const right = { x: 624, y: 50, w: 500, h: 626 }

  // Security print on both pages: guilloche rings plus wavy rules.
  ctx.save()
  ctx.beginPath()
  ctx.rect(left.x, left.y, left.w, left.h)
  ctx.rect(right.x, right.y, right.w, right.h)
  ctx.clip()
  ctx.strokeStyle = alpha(palette.accent, 0.12)
  ctx.lineWidth = 1
  for (let ring = 1; ring <= 16; ring += 1) {
    ctx.beginPath()
    ctx.ellipse(left.x + 250, left.y + 360, 40 + ring * 22, 26 + ring * 15, 0.2, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(right.x + 250, right.y + 330, 40 + ring * 24, 24 + ring * 16, -0.24, 0, Math.PI * 2)
    ctx.stroke()
  }
  for (let line = 0; line < 26; line += 1) {
    const y = 40 + line * 24
    ctx.beginPath()
    ctx.moveTo(30, y)
    ctx.bezierCurveTo(320, y + 7, 840, y - 7, 1150, y + 3)
    ctx.stroke()
  }
  ctx.restore()

  // Gutter shadow, so the book reads as one object.
  ctx.save()
  const gutter = ctx.createLinearGradient(560, 0, 620, 0)
  gutter.addColorStop(0, 'rgba(60, 45, 25, 0)')
  gutter.addColorStop(0.45, 'rgba(60, 45, 25, 0.22)')
  gutter.addColorStop(0.55, 'rgba(60, 45, 25, 0.22)')
  gutter.addColorStop(1, 'rgba(60, 45, 25, 0)')
  ctx.fillStyle = gutter
  ctx.fillRect(556, 24, 68, h - 76)
  ctx.restore()

  if (palette.souvenir) {
    ctx.save()
    ctx.translate(w / 2, 380)
    ctx.rotate(-0.42)
    drawText(ctx, 'SOUVENIR', 0, 0, {
      size: 128,
      weight: 700,
      family: FONT.display,
      color: alpha(palette.stamp, 0.06),
      align: 'center',
      tracking: 8,
    })
    ctx.restore()
  }

  /* ---------------- left page: identity ---------------- */

  // Emblem.
  ctx.save()
  ctx.translate(left.x + 26, 66)
  ctx.strokeStyle = palette.gold
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, 20, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 14, 0, Math.PI * 2)
  ctx.stroke()
  star(ctx, 0, 0, 7, 3, 5, palette.gold)
  ctx.restore()

  drawText(ctx, 'REPUBLIC OF THE ISLANDS', left.x + 56, 62, {
    size: 15,
    weight: 700,
    family: FONT.serif,
    color: palette.ink,
    tracking: 2.4,
  })
  drawText(ctx, 'PASSPORT', left.x + 56, 98, {
    size: 30,
    family: FONT.serif,
    color: palette.ink,
    tracking: 5,
  })
  drawText(ctx, 'TRAVEL DOCUMENT · BIOMETRIC', left.x + 58, 118, {
    size: 7,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1.8,
  })
  drawText(ctx, 'TYPE', left.x + 398, 60, {
    size: 7,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1.6,
  })
  drawText(ctx, 'P', left.x + 398, 80, {
    size: 18,
    weight: 700,
    family: FONT.mono,
    color: palette.ink,
  })
  drawText(ctx, 'CODE', left.x + 442, 60, {
    size: 7,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1.6,
  })
  drawText(ctx, 'ISL', left.x + 442, 80, {
    size: 18,
    weight: 700,
    family: FONT.mono,
    color: palette.ink,
  })

  ctx.strokeStyle = alpha(palette.accent, 0.45)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(left.x, 132)
  ctx.lineTo(left.x + left.w, 132)
  ctx.stroke()

  // Portrait with a ghost image behind it.
  const photoX = left.x + 8
  const photoY = 150
  ctx.save()
  ctx.globalAlpha = 0.08
  photo(ctx, photos[0], photoX + 9, photoY + 7, 168, 218, {
    label: 'PHOTO 1',
    tone: 'bw',
    seed: 34,
    placeholderBg: palette.page,
    placeholderInk: palette.ink,
  })
  ctx.restore()
  fillRound(ctx, photoX - 6, photoY - 6, 180, 230, 3, '#fdfaf0')
  photo(ctx, photos[0], photoX, photoY, 168, 218, {
    label: 'PHOTO 1',
    tone: 'bw',
    seed: 33,
    placeholderBg: '#d9d2be',
    placeholderInk: palette.ink,
  })
  strokeRound(ctx, photoX, photoY, 168, 218, 2, alpha(palette.ink, 0.35), 1)
  drawText(ctx, 'BEARER / TITULAIRE', photoX, 392, {
    size: 6,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1.2,
  })

  // Signature line under the portrait.
  ctx.strokeStyle = alpha(palette.ink, 0.4)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(photoX, 470)
  ctx.lineTo(photoX + 168, 470)
  ctx.stroke()
  drawText(ctx, holder.slice(0, 18), photoX + 4, 462, {
    size: 15,
    family: FONT.script,
    color: alpha(palette.ink, 0.75),
    maxWidth: 160,
  })
  drawText(ctx, 'SIGNATURE', photoX, 484, {
    size: 6,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1.2,
  })

  // Hologram patch.
  ctx.save()
  ctx.translate(photoX + 84, 548)
  ctx.beginPath()
  ctx.arc(0, 0, 38, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = '#d7ceb5'
  ctx.fillRect(-40, -40, 80, 80)
  holo(ctx, -40, -40, 80, 80, { opacity: 0.8, seed: 47, sparkles: 6 })
  ctx.restore()
  ctx.strokeStyle = alpha(palette.gold, 0.7)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(photoX + 84, 548, 38, 0, Math.PI * 2)
  ctx.stroke()
  drawText(ctx, 'BIO', photoX + 84, 552, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: alpha(palette.ink, 0.7),
    align: 'center',
    tracking: 2,
  })

  // Fields.
  const fieldX = left.x + 208
  const fieldWidth = 286
  const field = (y: number, label: string, value: string, size = 15) => {
    drawText(ctx, label, fieldX, y, {
      size: 6.5,
      family: FONT.mono,
      color: palette.muted,
      tracking: 1.4,
    })
    drawText(ctx, value, fieldX, y + 19, {
      size,
      weight: 700,
      family: FONT.sans,
      color: palette.ink,
      maxWidth: fieldWidth,
      tracking: 0.4,
    })
  }
  field(150, 'PASSPORT NO.', passportNo, 17)
  field(196, 'SURNAME', holder, 16)
  field(242, 'GIVEN NAMES', 'GOOD DAY', 15)
  field(288, 'NATIONALITY', 'ISLANDER', 15)
  field(334, 'DATE OF BIRTH', formatDate(date, 'long'), 13)
  field(380, 'PLACE OF BIRTH', 'MEMORY LANE', 14)
  field(426, 'SEX', 'X', 15)
  field(472, 'DATE OF ISSUE', issued, 13)
  field(518, 'DATE OF EXPIRY', expiry, 13)
  field(564, 'AUTHORITY', 'PHOTO BOOTH 06', 13)

  // MRZ.
  const mrzY = 636
  ctx.fillStyle = alpha(palette.ink, 0.05)
  ctx.fillRect(left.x, mrzY - 20, left.w, 74)
  ctx.strokeStyle = alpha(palette.ink, 0.2)
  ctx.strokeRect(left.x, mrzY - 20, left.w, 74)
  const line1 = mrzLine(`P<ISL${mrzName(caption)}`)
  const line2 = mrzLine(
    `${passportNo.replace(/ /g, '')}<ISL${parts.short}${parts.monthNumber}${parts.day}X${String(
      Number(parts.short) + 10,
    ).padStart(2, '0')}${parts.monthNumber}${parts.day}<<<<<<`,
  )
  drawText(ctx, line1, left.x + 8, mrzY + 8, {
    size: 14,
    weight: 600,
    family: FONT.mono,
    color: alpha(palette.ink, 0.82),
    tracking: 0.9,
  })
  drawText(ctx, line2, left.x + 8, mrzY + 34, {
    size: 14,
    weight: 600,
    family: FONT.mono,
    color: alpha(palette.ink, 0.82),
    tracking: 0.9,
  })
  drawText(ctx, palette.souvenir ? 'SOUVENIR MRZ · NOT VALID FOR TRAVEL' : 'MACHINE READABLE ZONE', left.x + 8, mrzY + 50, {
    size: 5.5,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1,
  })

  /* ---------------- right page: visas ---------------- */

  drawText(ctx, 'VISAS', right.x + 8, 70, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: palette.accent,
    tracking: 4,
  })
  drawText(ctx, 'RÉPUBLIQUE DES ÎLES · REPUBLIC OF THE ISLANDS', right.x + 8, 86, {
    size: 6,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1.2,
  })
  ctx.strokeStyle = alpha(palette.accent, 0.4)
  ctx.beginPath()
  ctx.moveTo(right.x, 96)
  ctx.lineTo(right.x + right.w, 96)
  ctx.stroke()

  // Visa sticker.
  const visaX = right.x + 12
  const visaY = 112
  const visaW = 476
  const visaH = 196
  fillRound(ctx, visaX, visaY, visaW, visaH, 6, '#fdfaf0')
  strokeRound(ctx, visaX, visaY, visaW, visaH, 6, alpha(palette.ink, 0.25), 1)
  ctx.save()
  ctx.beginPath()
  roundPath(ctx, visaX, visaY, visaW, visaH, 6)
  ctx.clip()
  holo(ctx, visaX, visaY, 34, visaH, { opacity: 0.5, seed: 12, sparkles: 2, angle: 'vertical' })
  ctx.restore()
  drawText(ctx, 'VISA', visaX + 52, visaY + 48, {
    size: 34,
    family: FONT.serif,
    color: palette.ink,
    tracking: 4,
  })
  drawText(ctx, 'SINGLE ENTRY · ONE MOMENT', visaX + 54, visaY + 68, {
    size: 7,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1.6,
  })
  drawText(ctx, 'ISSUED AT', visaX + 54, visaY + 96, {
    size: 6,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1.4,
  })
  drawText(ctx, 'PHOTO BOOTH 06', visaX + 54, visaY + 112, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: palette.ink,
    tracking: 1,
  })
  drawText(ctx, 'VALID UNTIL', visaX + 54, visaY + 138, {
    size: 6,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1.4,
  })
  drawText(ctx, expiry, visaX + 54, visaY + 154, {
    size: 12,
    family: FONT.mono,
    color: palette.ink,
    tracking: 1,
  })
  drawText(ctx, 'ENTRIES', visaX + 310, visaY + 96, {
    size: 6,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1.4,
  })
  drawText(ctx, '01', visaX + 310, visaY + 118, {
    size: 24,
    weight: 700,
    family: FONT.mono,
    color: palette.ink,
  })
  drawText(ctx, 'CLASS', visaX + 310, visaY + 140, {
    size: 6,
    family: FONT.mono,
    color: palette.muted,
    tracking: 1.4,
  })
  drawText(ctx, 'MEMORY', visaX + 310, visaY + 156, {
    size: 12,
    family: FONT.mono,
    color: palette.ink,
  })
  barcode(ctx, visaX + 300, visaY + 164, 156, 22, 15, alpha(palette.ink, 0.65))

  // Entry stamps.
  rubberStamp(ctx, right.x + 112, 430, 62, 'ENTRY', 'ONE DAY', alpha(palette.stamp, 0.72), -0.16)
  rubberStamp(ctx, right.x + 350, 470, 54, 'MEMORY', 'ISLAND', 'rgba(40, 74, 124, 0.6)', 0.18)
  rubberStamp(ctx, right.x + 214, 560, 48, 'APPROVED', '06', 'rgba(47, 111, 94, 0.6)', -0.08)

  drawText(ctx, 'entered: a good afternoon', right.x + 14, 648, {
    size: 20,
    family: FONT.script,
    color: alpha(palette.ink, 0.8),
    maxWidth: 300,
  })
  drawText(ctx, `REMARKS: ${(caption || 'KEEP THIS ONE').toUpperCase()}`, right.x + 14, 672, {
    size: 6,
    family: FONT.mono,
    color: palette.muted,
    maxWidth: 420,
    tracking: 1,
  })
  drawText(ctx, '12', right.x + right.w - 4, 672, {
    size: 9,
    family: FONT.mono,
    color: palette.muted,
    align: 'right',
  })

  // Cover footer: the honest disclaimer, printed where a real book would
  // carry its issuer line.
  if (palette.souvenir) {
    ctx.save()
    ctx.fillStyle = 'rgba(165, 28, 28, 0.92)'
    ctx.fillRect(26, h - 50, w - 52, 26)
    drawText(ctx, 'SOUVENIR · NOT A TRAVEL DOCUMENT · NOT A REAL PASSPORT', w / 2, h - 32, {
      size: 10,
      weight: 700,
      family: FONT.mono,
      color: '#f6e8cf',
      align: 'center',
      tracking: 2,
    })
    ctx.restore()
  } else {
    drawText(ctx, 'REPUBLIC OF THE ISLANDS · DIRECTORATE OF IMAGINARY TRAVEL', w / 2, h - 34, {
      size: 7,
      family: FONT.mono,
      color: alpha(palette.gold, 0.8),
      align: 'center',
      tracking: 1.6,
    })
  }

  gloss(ctx, 26, 24, w - 52, h - 76, { opacity: 0.08, angle: -0.5 })
  holo(ctx, 26, 24, w - 52, h - 76, { opacity: 0.08, seed: 25, sparkles: 10 })
}

export function paintPassport(scene: Scene) {
  paintBook(scene, {
    cover: '#1d4a3c',
    coverDark: '#0f2d24',
    page: '#f4eeda',
    pageEdge: '#e2d9c0',
    ink: '#1f3b34',
    muted: '#6a8574',
    accent: '#2f6f5e',
    gold: '#c9a227',
    stamp: '#9c2b2b',
    souvenir: false,
  })
}

export function paintPassportId(scene: Scene) {
  paintBook(scene, {
    cover: '#5b1e24',
    coverDark: '#37100f',
    page: '#f3ead6',
    pageEdge: '#e0d3b6',
    ink: '#3a2418',
    muted: '#8a6f57',
    accent: '#8c2f33',
    gold: '#d4af37',
    stamp: '#a51c1c',
    souvenir: true,
  })
}

/* 10 · Comic panels                                                   */
/* ------------------------------------------------------------------ */

export function paintComic({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = '#f5edcf'
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 28, 'rgba(60, 40, 20, 0.1)', 0.5)
  halftone(ctx, 0, 0, w, 150, 9, 'rgba(230, 57, 70, 0.12)', 0.28)

  ctx.strokeStyle = '#171310'
  ctx.lineWidth = 14
  ctx.strokeRect(7, 7, w - 14, h - 14)

  drawText(ctx, 'PHOTO BOOTH', 44, 96, {
    size: 62,
    weight: 400,
    family: FONT.display,
    color: '#171310',
    tracking: 1,
    shadow: { color: '#e63946', blur: 0, x: 4, y: 4 },
  })
  fillRound(ctx, 646, 40, 170, 58, 4, '#e63946')
  drawText(ctx, 'KOMIK', 731, 82, {
    size: 34,
    weight: 400,
    family: FONT.display,
    color: '#f5edcf',
    align: 'center',
    tracking: 2,
  })
  drawText(ctx, 'NO. 06 · 20 PAGES · FREE', 48, 124, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#6b5d42',
    tracking: 2,
  })

  const panel = (
    x: number,
    y: number,
    pw: number,
    ph: number,
    image: PhotoBitmap | null,
    label: string,
  ) => {
    ctx.save()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x - 10, y - 10, pw + 20, ph + 20)
    ctx.restore()
    photo(ctx, image, x, y, pw, ph, {
      label,
      tone: 'warm',
      placeholderBg: '#d9c79c',
      placeholderInk: '#5b4a2a',
      seed: label.length * 3,
    })
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, pw, ph)
    ctx.clip()
    halftone(ctx, x, y, pw, ph, 6, 'rgba(23, 19, 16, 0.16)', 0.26)
    ctx.fillStyle = 'rgba(230, 57, 70, 0.08)'
    ctx.fillRect(x, y, pw, ph)
    ctx.restore()
    ctx.strokeStyle = '#171310'
    ctx.lineWidth = 7
    ctx.strokeRect(x, y, pw, ph)
  }

  panel(46, 152, 808, 398, photos[0], 'PHOTO 1')
  panel(46, 594, 808, 376, photos[1], 'PHOTO 2')

  // Caption box.
  ctx.save()
  ctx.fillStyle = '#f5edcf'
  ctx.fillRect(66, 170, 320, 78)
  ctx.strokeStyle = '#171310'
  ctx.lineWidth = 4
  ctx.strokeRect(66, 170, 320, 78)
  ctx.restore()
  drawText(ctx, 'THIS MORNING, OUTSIDE THE BOOTH…', 82, 205, {
    size: 14,
    weight: 900,
    family: FONT.mono,
    color: '#171310',
    tracking: 0.5,
  })
  drawText(ctx, 'SOMEONE FOUND THE SHUTTER BUTTON.', 82, 230, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#3a3026',
  })

  const burst = (
    cx: number,
    cy: number,
    outer: number,
    inner: number,
    points: number,
    fill: string,
    stroke: string,
    label: string,
    fontSize: number,
    rotation = 0,
  ) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)
    ctx.beginPath()
    for (let index = 0; index < points * 2; index += 1) {
      const radius = index % 2 === 0 ? outer : inner
      const angle = (index / (points * 2)) * Math.PI * 2 - Math.PI / 2
      const px = Math.cos(angle) * radius
      const py = Math.sin(angle) * radius
      if (index === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    ctx.strokeStyle = stroke
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.restore()
    drawText(ctx, label, cx, cy + fontSize * 0.36, {
      size: fontSize,
      weight: 400,
      family: FONT.display,
      color: stroke,
      align: 'center',
      tracking: 1,
      shadow: { color: 'rgba(255, 255, 255, 0.6)', blur: 0, x: 2, y: 2 },
    })
  }

  burst(724, 262, 112, 68, 9, '#ffd23d', '#171310', 'SNAP!', 34, -0.14)

  // Speech bubble.
  ctx.save()
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#171310'
  ctx.lineWidth = 4
  roundPath(ctx, 72, 610, 470, 104, 26)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(240, 714)
  ctx.lineTo(220, 754)
  ctx.lineTo(292, 714)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()
  drawText(ctx, 'ONE SHOT,', 100, 648, {
    size: 28,
    weight: 400,
    family: FONT.display,
    color: '#171310',
    tracking: 1,
  })
  drawText(ctx, 'FOREVER!', 100, 692, {
    size: 28,
    weight: 400,
    family: FONT.display,
    color: '#171310',
    tracking: 1,
  })

  burst(714, 838, 120, 76, 10, '#ffd23d', '#171310', 'POW!', 40, 0.1)
  drawText(ctx, 'KLIK!', 600, 686, {
    size: 22,
    weight: 400,
    family: FONT.display,
    color: '#e63946',
    tracking: 2,
    shadow: { color: '#171310', blur: 0, x: 2, y: 2 },
  })

  // Footer.
  ctx.fillStyle = '#171310'
  ctx.fillRect(46, 1004, w - 92, 3)
  drawText(ctx, caption || 'BERSAMBUNG…', 48, 1048, {
    size: 24,
    weight: 400,
    family: FONT.display,
    color: '#171310',
    tracking: 2,
    maxWidth: 560,
  })
  drawText(ctx, 'PHOTO BOOTH COMICS · 2026', 48, 1076, {
    size: 9,
    family: FONT.mono,
    color: '#6b5d42',
    tracking: 1.6,
  })
  fillRound(ctx, 690, 1028, 160, 50, 3, '#e63946')
  drawText(ctx, 'FREE!', 770, 1062, {
    size: 24,
    weight: 400,
    family: FONT.display,
    color: '#f5edcf',
    align: 'center',
    tracking: 1,
  })

  gloss(ctx, 0, 0, w, h, { opacity: 0.08 })
  holo(ctx, 0, 0, w, h, { opacity: 0.05, seed: 12, sparkles: 4 })
}

/* ------------------------------------------------------------------ */
/* 15 · Wanted poster                                                  */
/* ------------------------------------------------------------------ */

export function paintWanted({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#e1cda6'],
    [0.5, '#d9c39a'],
    [1, '#c4a979'],
  ])
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 35, 'rgba(70, 45, 20, 0.16)', 0.9)
  vignette(ctx, 0, 0, w, h, '#4a2f12', 0.65)

  // Aged stains.
  const random = seeded(15)
  for (let i = 0; i < 7; i += 1) {
    const cx = random() * w
    const cy = random() * h
    const radius = 30 + random() * 80
    ctx.fillStyle = `rgba(120, 80, 35, ${0.03 + random() * 0.05})`
    ctx.beginPath()
    ctx.ellipse(cx, cy, radius, radius * 0.7, random(), 0, Math.PI * 2)
    ctx.fill()
  }

  strokeRound(ctx, 28, 28, w - 56, h - 56, 2, 'rgba(70, 45, 20, 0.3)', 2)

  drawText(ctx, 'BY ORDER OF THE PHOTO BOOTH', w / 2, 74, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#5a3d1f',
    align: 'center',
    tracking: 3.5,
  })
  drawText(ctx, 'WANTED', w / 2, 240, {
    size: 176,
    weight: 400,
    family: FONT.display,
    color: '#2e2113',
    align: 'center',
    tracking: 8,
    shadow: { color: 'rgba(255, 240, 210, 0.65)', blur: 0, x: 5, y: 5 },
  })
  ctx.fillStyle = '#2e2113'
  ctx.fillRect(120, 268, w - 240, 5)
  drawText(ctx, 'DEAD OR ALIVE', w / 2, 308, {
    size: 22,
    weight: 700,
    family: FONT.serif,
    color: '#5a3d1f',
    align: 'center',
    tracking: 6,
  })

  // Photo with nails and tape.
  ctx.save()
  ctx.shadowColor = 'rgba(50, 30, 10, 0.45)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 8
  ctx.fillStyle = '#f2e4c8'
  ctx.fillRect(142, 340, 596, 548)
  ctx.restore()
  photo(ctx, photos[0], 150, 348, 580, 532, {
    label: 'PHOTO 1',
    tone: 'sepia',
    placeholderBg: '#b6976a',
    placeholderInk: '#3e2c17',
    seed: 37,
  })
  ctx.strokeStyle = 'rgba(70, 45, 20, 0.5)'
  ctx.lineWidth = 2
  ctx.strokeRect(150, 348, 580, 532)

  const nail = (x: number, y: number) => {
    ctx.save()
    ctx.fillStyle = 'rgba(40, 28, 14, 0.55)'
    ctx.beginPath()
    ctx.arc(x + 3, y + 4, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#8a8070'
    ctx.beginPath()
    ctx.arc(x, y, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#c4bcae'
    ctx.beginPath()
    ctx.arc(x - 2, y - 2, 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  nail(150, 348)
  nail(730, 348)
  nail(150, 880)
  nail(730, 880)

  // Reward.
  drawText(ctx, 'REWARD', w / 2, 966, {
    size: 20,
    weight: 700,
    family: FONT.mono,
    color: '#5a3d1f',
    align: 'center',
    tracking: 8,
  })
  drawText(ctx, '$10.000', w / 2, 1058, {
    size: 92,
    weight: 400,
    family: FONT.display,
    color: '#8c1c13',
    align: 'center',
    tracking: 2,
    shadow: { color: 'rgba(50, 30, 10, 0.28)', blur: 0, x: 3, y: 3 },
  })
  drawText(ctx, caption || 'TERTANGKAP KARENA TERLALU PHOTOGENIK', w / 2, 1098, {
    size: 15,
    weight: 700,
    family: FONT.mono,
    color: '#3a2a18',
    align: 'center',
    tracking: 1.5,
    maxWidth: 700,
  })

  // Sheriff star.
  ctx.save()
  ctx.translate(752, 1118)
  ctx.rotate(-0.06)
  star(ctx, 0, 0, 52, 24, 6, '#d9b13b')
  star(ctx, 0, 0, 40, 18, 6, '#f0d27a')
  drawText(ctx, 'SHERIFF', 0, 4, {
    size: 10,
    weight: 900,
    family: FONT.sans,
    color: '#5a4215',
    align: 'center',
  })
  drawText(ctx, '06', 0, 22, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#5a4215',
    align: 'center',
  })
  ctx.restore()

  drawText(ctx, 'PHOTO BOOTH · 2026', w / 2, 1142, {
    size: 9,
    family: FONT.mono,
    color: '#6b4e2b',
    align: 'center',
    tracking: 3,
  })

  gloss(ctx, 0, 0, w, h, { opacity: 0.07, angle: -0.4 })
  holo(ctx, 0, 0, w, h, { opacity: 0.04, seed: 5, sparkles: 4 })
}

/* ------------------------------------------------------------------ */
/* 17 · Morning newspaper                                              */
/* ------------------------------------------------------------------ */

export function paintNewspaper({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#f2ecdf'],
    [0.6, '#efe9dc'],
    [1, '#e6dfd0'],
  ])
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 27, 'rgba(50, 42, 30, 0.1)', 0.7)

  drawText(ctx, `SPECIAL EDITION · ${formatDate(date, 'long')}`, w / 2, 52, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#6f6252',
    align: 'center',
    tracking: 2.5,
  })
  ctx.fillStyle = '#241f1a'
  ctx.fillRect(52, 66, w - 104, 3)

  drawText(ctx, 'DAILY PHOTO', w / 2, 162, {
    size: 94,
    weight: 900,
    family: FONT.serif,
    color: '#241f1a',
    align: 'center',
    tracking: 1,
  })
  drawText(ctx, 'PUBLISHED EVERY SHUTTER', w / 2, 188, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#6f6252',
    align: 'center',
    tracking: 3,
  })
  ctx.fillStyle = '#241f1a'
  ctx.fillRect(52, 202, w - 104, 2)
  ctx.fillRect(52, 210, w - 104, 1)

  drawText(ctx, 'NO. 006', 52, 232, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#4a4136',
    tracking: 1.5,
  })
  drawText(ctx, 'FREE · 24 PAGES', w - 52, 232, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#4a4136',
    align: 'right',
    tracking: 1.5,
  })
  ctx.fillStyle = '#241f1a'
  ctx.fillRect(52, 242, w - 104, 1)

  drawText(ctx, 'THIS MORNING,', 52, 306, {
    size: 58,
    weight: 900,
    family: FONT.serif,
    color: '#241f1a',
    tracking: -0.5,
  })
  drawText(ctx, 'THE WORLD SMILES', 52, 366, {
    size: 58,
    weight: 900,
    family: FONT.serif,
    color: '#241f1a',
    tracking: -0.5,
  })
  drawText(ctx, caption || 'Witnesses say a shutter was pressed at nine in the morning.', 52, 400, {
    size: 14,
    weight: 400,
    family: FONT.serif,
    color: '#4a4136',
    style: 'italic',
    maxWidth: 780,
  })

  photo(ctx, photos[0], 52, 426, w - 104, 440, {
    label: 'MAIN PHOTO',
    tone: 'bw',
    placeholderBg: '#c9c1b0',
    placeholderInk: '#3d362c',
    seed: 39,
  })
  ctx.save()
  ctx.beginPath()
  ctx.rect(52, 426, w - 104, 440)
  ctx.clip()
  halftone(ctx, 52, 426, w - 104, 440, 6, 'rgba(36, 31, 26, 0.2)', 0.25)
  ctx.restore()
  ctx.strokeStyle = '#241f1a'
  ctx.lineWidth = 1.5
  ctx.strokeRect(52, 426, w - 104, 440)
  drawText(
    ctx,
    'THE SUBJECT POSES OUTSIDE THE BOOTH. PHOTO: YOUR FRONT CAMERA.',
    52,
    890,
    {
      size: 10,
      weight: 700,
      family: FONT.mono,
      color: '#4a4136',
      tracking: 1,
      maxWidth: 780,
    },
  )
  ctx.fillStyle = '#241f1a'
  ctx.fillRect(52, 904, w - 104, 1)

  drawText(ctx, 'SMILE', 52, 938, {
    size: 12,
    weight: 900,
    family: FONT.mono,
    color: '#241f1a',
    tracking: 2,
  })
  textLines(ctx, 52, 954, 244, 12, 15, 'rgba(36, 31, 26, 0.5)', 3, 1.5)

  drawText(ctx, 'SHUTTER', 312, 938, {
    size: 12,
    weight: 900,
    family: FONT.mono,
    color: '#241f1a',
    tracking: 2,
  })
  textLines(ctx, 312, 954, 244, 5, 15, 'rgba(36, 31, 26, 0.5)', 7, 1.5)
  drawText(ctx, '“Sekali jepret,', 312, 1044, {
    size: 20,
    weight: 700,
    family: FONT.serif,
    color: '#241f1a',
    style: 'italic',
  })
  drawText(ctx, 'selamanya.”', 312, 1072, {
    size: 20,
    weight: 700,
    family: FONT.serif,
    color: '#241f1a',
    style: 'italic',
  })
  drawText(ctx, '— YOU, WITNESS', 312, 1100, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#6f6252',
    tracking: 1.5,
  })

  drawText(ctx, 'MEMORIES', 568, 938, {
    size: 12,
    weight: 900,
    family: FONT.mono,
    color: '#241f1a',
    tracking: 2,
  })
  textLines(ctx, 568, 954, 280, 10, 15, 'rgba(36, 31, 26, 0.5)', 11, 1.5)
  ctx.fillStyle = '#241f1a'
  ctx.fillRect(550, 938, 1, 180)
  ctx.fillRect(294, 938, 1, 180)
  ctx.fillRect(52, 1138, w - 104, 1)
  drawText(ctx, 'DAILY PHOTO · PHOTO BOOTH · SELF-PRINTED 2026', w / 2, 1158, {
    size: 9,
    family: FONT.mono,
    color: '#6f6252',
    align: 'center',
    tracking: 2,
  })

  // Red rubber stamp.
  ctx.save()
  ctx.translate(806, 300)
  ctx.rotate(0.14)
  ctx.strokeStyle = 'rgba(140, 28, 19, 0.78)'
  ctx.lineWidth = 4
  ctx.strokeRect(-82, -26, 164, 52)
  drawText(ctx, 'EXTRA!', 0, 12, {
    size: 30,
    weight: 900,
    family: FONT.display,
    color: 'rgba(140, 28, 19, 0.78)',
    align: 'center',
    tracking: 2,
  })
  ctx.restore()

  gloss(ctx, 0, 0, w, h, { opacity: 0.06 })
  holo(ctx, 0, 0, w, h, { opacity: 0.03, seed: 6, sparkles: 3 })
}

/* ------------------------------------------------------------------ */
/* 18 · Yearbook page                                                  */
/* ------------------------------------------------------------------ */

export function paintYearbook({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#1a2747'],
    [0.55, '#16213e'],
    [1, '#0f172d'],
  ])
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.strokeStyle = 'rgba(232, 195, 122, 0.07)'
  ctx.lineWidth = 2
  for (let i = -h; i < w; i += 56) {
    ctx.beginPath()
    ctx.moveTo(i, h)
    ctx.lineTo(i + h, 0)
    ctx.stroke()
  }
  ctx.restore()

  const random = seeded(18)
  for (let i = 0; i < 40; i += 1) {
    star(
      ctx,
      random() * w,
      random() * h,
      1 + random() * 2.4,
      0.6,
      5,
      `rgba(255, 240, 200, ${0.16 + random() * 0.4})`,
    )
  }

  strokeRound(ctx, 26, 26, w - 52, h - 52, 3, 'rgba(232, 195, 122, 0.75)', 3)
  strokeRound(ctx, 38, 38, w - 76, h - 76, 2, 'rgba(232, 195, 122, 0.28)', 1)

  drawText(ctx, 'CLASS OF 2026', w / 2, 92, {
    size: 14,
    weight: 700,
    family: FONT.mono,
    color: '#e8c37a',
    align: 'center',
    tracking: 7,
  })
  drawText(ctx, 'YEARBOOK', w / 2, 160, {
    size: 54,
    weight: 700,
    family: FONT.serif,
    color: '#f6efdf',
    align: 'center',
    tracking: 6,
  })
  drawText(ctx, 'PHOTO BOOTH HIGH · CLASS OF 06', w / 2, 190, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#a9b6cf',
    align: 'center',
    tracking: 2.5,
  })

  // Portrait in an oval frame.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 26
  ctx.shadowOffsetY = 12
  ctx.fillStyle = '#e8c37a'
  ctx.beginPath()
  ctx.ellipse(440, 494, 246, 306, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(440, 494, 230, 290, 0, 0, Math.PI * 2)
  ctx.clip()
  photo(ctx, photos[0], 210, 204, 460, 580, {
    label: 'PHOTO 1',
    tone: 'fade',
    placeholderBg: '#2a3b5e',
    placeholderInk: '#f6efdf',
    seed: 40,
  })
  ctx.fillStyle = 'rgba(30, 45, 80, 0.12)'
  ctx.fillRect(210, 204, 460, 580)
  ctx.restore()
  ctx.strokeStyle = 'rgba(246, 239, 223, 0.55)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(440, 494, 230, 290, 0, 0, Math.PI * 2)
  ctx.stroke()

  // Senior ribbon.
  ctx.save()
  ctx.translate(440, 222)
  ctx.fillStyle = '#8c2f39'
  ctx.beginPath()
  ctx.moveTo(-150, -24)
  ctx.lineTo(150, -24)
  ctx.lineTo(168, 0)
  ctx.lineTo(150, 24)
  ctx.lineTo(-150, 24)
  ctx.lineTo(-168, 0)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(232, 195, 122, 0.8)'
  ctx.lineWidth = 2
  ctx.stroke()
  drawText(ctx, 'SENIOR', 0, 8, {
    size: 20,
    weight: 700,
    family: FONT.mono,
    color: '#f6efdf',
    align: 'center',
    tracking: 7,
  })
  ctx.restore()

  drawText(ctx, caption || 'YOU', w / 2, 890, {
    size: 76,
    weight: 700,
    family: FONT.script,
    color: '#e8c37a',
    align: 'center',
    tracking: 1,
    maxWidth: 520,
  })
  drawText(ctx, '“Best smile, best class.”', w / 2, 938, {
    size: 20,
    weight: 400,
    family: FONT.serif,
    color: '#dce3ef',
    align: 'center',
    style: 'italic',
  })
  drawText(ctx, 'MOTTO: ONE SHOT, FOREVER', w / 2, 980, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#a9b6cf',
    align: 'center',
    tracking: 2.5,
  })

  // Signature.
  ctx.strokeStyle = 'rgba(246, 239, 223, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(280, 1072)
  ctx.lineTo(600, 1072)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(232, 195, 122, 0.75)'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(330, 1058)
  ctx.bezierCurveTo(370, 1024, 400, 1082, 442, 1048)
  ctx.bezierCurveTo(480, 1018, 500, 1076, 552, 1044)
  ctx.stroke()
  drawText(ctx, 'PRINCIPAL', w / 2, 1096, {
    size: 8,
    family: FONT.mono,
    color: '#8e9db8',
    align: 'center',
    tracking: 2,
  })

  drawText(ctx, 'PAGE 06 · 2026', w / 2, 1128, {
    size: 9,
    family: FONT.mono,
    color: '#8e9db8',
    align: 'center',
    tracking: 2.5,
  })

  gloss(ctx, 0, 0, w, h, { opacity: 0.09 })
  holo(ctx, 0, 0, w, h, { opacity: 0.08, seed: 8, sparkles: 7 })
}

/* ------------------------------------------------------------------ */
/* 19 · Two-colour riso zine                                           */
/* ------------------------------------------------------------------ */

export function paintRiso({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = '#f6f0e2'
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 41, 'rgba(40, 35, 25, 0.12)', 0.6)

  drawText(ctx, 'SHUTTER', 44, 236, {
    size: 176,
    weight: 400,
    family: FONT.display,
    color: '#1f4fff',
    tracking: 1,
  })
  drawText(ctx, 'SHUTTER', 52, 244, {
    size: 176,
    weight: 400,
    family: FONT.display,
    color: '#ff4d8d',
    tracking: 1,
    alpha: 0.55,
  })
  drawText(ctx, 'PHOTO ZINE · ISSUE 06 · 2026', 52, 280, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#ff4d8d',
    tracking: 3,
  })

  const duo = (
    x: number,
    y: number,
    pw: number,
    ph: number,
    image: PhotoBitmap | null,
    label: string,
    rotation = 0,
  ) => {
    ctx.save()
    ctx.translate(x + pw / 2, y + ph / 2)
    ctx.rotate(rotation)
    ctx.fillStyle = '#ff4d8d'
    ctx.fillRect(-pw / 2 + 8, -ph / 2 + 8, pw, ph)
    photo(ctx, image, -pw / 2, -ph / 2, pw, ph, {
      label,
      tone: 'bw',
      placeholderBg: '#d7d0c2',
      placeholderInk: '#1f1f1f',
      seed: label.length * 11,
    })
    ctx.save()
    ctx.beginPath()
    ctx.rect(-pw / 2, -ph / 2, pw, ph)
    ctx.clip()
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgba(255, 77, 141, 0.42)'
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph)
    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = 'rgba(31, 79, 255, 0.24)'
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph)
    ctx.restore()
    ctx.strokeStyle = '#1f4fff'
    ctx.lineWidth = 3
    ctx.strokeRect(-pw / 2 - 2, -ph / 2 - 2, pw + 4, ph + 4)
    ctx.restore()
  }

  duo(50, 330, 500, 380, photos[0], 'PHOTO 1')
  duo(520, 726, 300, 300, photos[1], 'PHOTO 2', 0.03)

  if (caption) {
    drawText(ctx, caption, 52, 804, {
      size: 30,
      weight: 900,
      family: FONT.sans,
      color: '#1f4fff',
      maxWidth: 420,
      tracking: -0.5,
    })
  } else {
    drawText(ctx, 'ONE SHOT,', 52, 782, {
      size: 34,
      weight: 900,
      family: FONT.sans,
      color: '#1f4fff',
      tracking: -0.5,
    })
    drawText(ctx, 'TWO COLOURS.', 52, 822, {
      size: 34,
      weight: 900,
      family: FONT.sans,
      color: '#ff4d8d',
      tracking: -0.5,
    })
  }
  textLines(ctx, 52, 866, 420, 8, 20, 'rgba(30, 30, 30, 0.45)', 13, 2)

  halftone(ctx, 52, 1040, 410, 80, 8, 'rgba(255, 77, 141, 0.24)', 0.3)
  star(ctx, 740, 1088, 58, 24, 8, 'rgba(31, 79, 255, 0.85)')
  star(ctx, 740, 1088, 34, 14, 8, 'rgba(255, 77, 141, 0.9)')

  drawText(ctx, 'RISO PRINT · PHOTO BOOTH 06 · 2026', 52, 1148, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#3a352c',
    tracking: 2.2,
  })
  drawText(ctx, 'SHUTTER ISSUE · PAGE 06', w - 52, 1148, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#ff4d8d',
    align: 'right',
    tracking: 2,
  })

  // Registration marks.
  const register = (x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = 'rgba(30, 30, 30, 0.55)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(x, y, 12, 0, Math.PI * 2)
    ctx.moveTo(x - 20, y)
    ctx.lineTo(x + 20, y)
    ctx.moveTo(x, y - 20)
    ctx.lineTo(x, y + 20)
    ctx.stroke()
    ctx.restore()
  }
  register(44, 44)
  register(w - 44, 44)
  register(44, h - 44)
  register(w - 44, h - 44)

  gloss(ctx, 0, 0, w, h, { opacity: 0.05 })
  holo(ctx, 0, 0, w, h, { opacity: 0.04, seed: 14, sparkles: 4 })
}

/* ------------------------------------------------------------------ */
/* 14 · Airline boarding pass                                          */
/* ------------------------------------------------------------------ */

export function paintBoarding({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 26
  ctx.shadowOffsetY = 10
  ctx.fillStyle = '#f6f8f5'
  roundPath(ctx, 10, 10, w - 20, h - 20, 18)
  ctx.fill()
  ctx.restore()

  // Header band.
  ctx.save()
  roundPath(ctx, 10, 10, w - 20, h - 20, 18)
  ctx.clip()
  ctx.fillStyle = linear(ctx, 0, 10, w, 86, [
    [0, '#0f8b8d'],
    [0.6, '#0b6e70'],
    [1, '#095557'],
  ])
  ctx.fillRect(10, 10, w - 20, 76)
  ctx.restore()

  drawText(ctx, 'AIR BOOTH', 40, 58, {
    size: 25,
    weight: 900,
    family: FONT.sans,
    color: '#ffffff',
    tracking: 3,
  })
  drawText(ctx, 'BOARDING PASS · MEMORY CLASS', w - 40, 58, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#bdf0e8',
    align: 'right',
    tracking: 2,
  })

  // Tear line and notches.
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(760, 10, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(760, h - 10, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.save()
  ctx.strokeStyle = 'rgba(18, 52, 59, 0.28)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 8])
  ctx.beginPath()
  ctx.moveTo(760, 110)
  ctx.lineTo(760, h - 40)
  ctx.stroke()
  ctx.restore()

  // Passenger photo.
  fillRound(ctx, 40, 116, 154, 174, 6, '#ffffff')
  ctx.strokeStyle = 'rgba(18, 52, 59, 0.2)'
  ctx.lineWidth = 1.5
  strokeRound(ctx, 40, 116, 154, 174, 6, 'rgba(18, 52, 59, 0.2)', 1.5)
  photo(ctx, photos[0], 44, 120, 146, 166, {
    label: 'PHOTO 1',
    tone: 'fade',
    radius: 4,
    placeholderBg: '#d7e4df',
    placeholderInk: '#12343b',
    seed: 42,
  })
  drawText(ctx, 'PENUMPANG', 40, 312, {
    size: 8,
    weight: 700,
    family: FONT.mono,
    color: '#6a7c7d',
    tracking: 1.8,
  })

  const field = (
    x: number,
    y: number,
    label: string,
    value: string,
    size = 22,
    maxWidth = 190,
  ) => {
    drawText(ctx, label, x, y, {
      size: 8,
      weight: 700,
      family: FONT.mono,
      color: '#6a7c7d',
      tracking: 1.8,
    })
    drawText(ctx, value, x, y + 27, {
      size,
      weight: 700,
      family: FONT.sans,
      color: '#12343b',
      tracking: 0.5,
      maxWidth,
    })
  }

  field(
    218,
    142,
    'PENUMPANG / PASSENGER',
    (caption || 'YOU').toUpperCase(),
    28,
    300,
  )
  field(218, 210, 'FLIGHT', 'KF 006')
  field(350, 210, 'SEAT', '06A')
  field(468, 210, 'GATE', '6')
  field(218, 278, 'DATE', formatDate(date, 'long'), 18)
  field(380, 278, 'BOARDING', 'NOW', 18)
  field(500, 278, 'DURATION', '2H 15M', 18)

  drawText(ctx, 'CGK  →  DPS', 218, 356, {
    size: 26,
    weight: 900,
    family: FONT.mono,
    color: '#0f8b8d',
    tracking: 2,
  })
  drawText(ctx, 'JAKARTA → BALI · 02J 15M', 218, 376, {
    size: 8,
    weight: 700,
    family: FONT.mono,
    color: '#ff8a5c',
    tracking: 2,
  })

  barcode(ctx, 40, 398, 300, 44, 16, '#12343b')
  drawText(ctx, 'BOARDING STARTS 30 MINUTES BEFORE A SMILE', 40, 470, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#6a7c7d',
    tracking: 1.4,
  })
  drawText(ctx, 'KF 006 · CGK DPS · AIR BOOTH', w - 40, 470, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#0f8b8d',
    align: 'right',
    tracking: 1.4,
  })

  // Stub.
  fillRound(ctx, 784, 112, 140, 160, 5, '#ffffff')
  photo(ctx, photos[1], 790, 118, 128, 128, {
    label: 'PHOTO 2',
    tone: 'fade',
    radius: 4,
    placeholderBg: '#f3dfd5',
    placeholderInk: '#8a4b36',
    seed: 43,
  })
  drawText(ctx, 'SELFIE STUB', 790, 266, {
    size: 8,
    weight: 700,
    family: FONT.mono,
    color: '#6a7c7d',
    tracking: 1.5,
  })
  drawText(ctx, 'KURSI 06A', 790, 306, {
    size: 15,
    weight: 900,
    family: FONT.mono,
    color: '#0f8b8d',
    tracking: 1,
  })
  barcode(ctx, 790, 332, 128, 92, 20, '#12343b')
  drawText(ctx, 'AIR BOOTH · 2026', 790, 446, {
    size: 8,
    family: FONT.mono,
    color: '#6a7c7d',
    tracking: 1.2,
  })

  // Holo strip on the stub.
  ctx.save()
  ctx.beginPath()
  ctx.rect(784, 112, 140, 22)
  ctx.clip()
  holo(ctx, 784, 112, 140, 22, { opacity: 0.8, seed: 51, sparkles: 3 })
  ctx.restore()

  ctx.strokeStyle = 'rgba(18, 52, 59, 0.12)'
  ctx.lineWidth = 1.5
  strokeRound(ctx, 10, 10, w - 20, h - 20, 18, 'rgba(18, 52, 59, 0.18)', 1.5)
  gloss(ctx, 10, 10, w - 20, h - 20, { opacity: 0.16, radius: 18, angle: -0.3 })
}

/* ------------------------------------------------------------------ */
/* 24 · Cinema ticket stub                                             */
/* ------------------------------------------------------------------ */

export function paintCinema({ ctx, w, h, photos, caption }: Scene) {
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 26
  ctx.shadowOffsetY = 10
  ctx.fillStyle = '#f4e9d6'
  roundPath(ctx, 10, 10, w - 20, h - 20, 14)
  ctx.fill()
  ctx.restore()
  grainDots(ctx, 10, 10, w - 20, h - 20, 46, 'rgba(80, 40, 30, 0.09)', 0.55)

  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(690, 10, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(690, h - 10, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  strokeRound(ctx, 20, 20, w - 40, h - 40, 8, 'rgba(122, 18, 32, 0.55)', 2)
  strokeRound(ctx, 30, 30, w - 60, h - 60, 6, 'rgba(122, 18, 32, 0.2)', 1)

  drawText(ctx, 'CINEMA 06 · SCREEN 1', 46, 64, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#7a1220',
    tracking: 2.5,
  })
  drawText(ctx, caption || 'ONE SHOWING', 42, 142, {
    size: 58,
    weight: 700,
    family: FONT.serif,
    color: '#3b1d17',
    tracking: -0.5,
    maxWidth: 520,
  })
  drawText(ctx, 'A FILM ABOUT ONE SHUTTER', 46, 168, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#8a5b4a',
    tracking: 2,
  })

  const frame = (x: number, image: PhotoBitmap | null, number: string) => {
    ctx.save()
    ctx.fillStyle = '#3b1d17'
    ctx.fillRect(x - 6, 194, 176, 216)
    ctx.restore()
    photo(ctx, image, x, 200, 164, 204, {
      label: `PHOTO ${number}`,
      tone: 'sepia',
      placeholderBg: '#c7a98a',
      placeholderInk: '#3b1d17',
      seed: 48 + Number(number),
    })
    drawText(ctx, number, x + 4, 390, {
      size: 10,
      weight: 700,
      family: FONT.mono,
      color: '#f4e9d6',
      tracking: 1,
    })
  }
  frame(46, photos[0], '1')
  frame(238, photos[1], '2')

  drawText(ctx, 'SABTU · 19.00', 438, 218, {
    size: 18,
    weight: 700,
    family: FONT.sans,
    color: '#3b1d17',
    tracking: 1,
  })
  drawText(ctx, '120 MENIT · 35MM · DOLBY', 438, 244, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#8a5b4a',
    tracking: 1.5,
  })
  drawText(ctx, 'KURSI', 438, 290, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#8a5b4a',
    tracking: 2,
  })
  drawText(ctx, 'F6', 438, 326, {
    size: 34,
    weight: 900,
    family: FONT.sans,
    color: '#7a1220',
    tracking: 1,
  })
  drawText(ctx, 'TARIF', 438, 376, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#8a5b4a',
    tracking: 2,
  })
  drawText(ctx, 'ONE SMILE', 438, 400, {
    size: 18,
    weight: 700,
    family: FONT.sans,
    color: '#3b1d17',
  })
  drawText(ctx, 'VALID FOREVER · NO QUEUE', 46, 462, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#8a5b4a',
    tracking: 1.5,
  })
  barcode(ctx, 46, 482, 250, 40, 21, '#3b1d17')
  drawText(ctx, '©2026 CINEMA 06', 438, 500, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#8a5b4a',
    tracking: 1.5,
  })

  // Tear line.
  ctx.save()
  ctx.strokeStyle = 'rgba(122, 18, 32, 0.4)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 8])
  ctx.beginPath()
  ctx.moveTo(690, 42)
  ctx.lineTo(690, h - 42)
  ctx.stroke()
  ctx.restore()

  drawText(ctx, 'ADMIT ONE', 714, 78, {
    size: 22,
    weight: 700,
    family: FONT.display,
    color: '#3b1d17',
    tracking: 4,
  })
  drawText(ctx, 'CINEMA TICKET', 714, 102, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#8a5b4a',
    tracking: 2,
  })
  drawText(ctx, 'STUDIO 1', 714, 144, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#7a1220',
    tracking: 2,
  })
  drawText(ctx, 'SABTU · 19.00', 714, 166, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#3b1d17',
    tracking: 1.5,
  })

  // Holo sticker on the stub.
  ctx.save()
  ctx.beginPath()
  ctx.arc(846, 232, 48, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = '#efe2c8'
  ctx.fillRect(798, 184, 96, 96)
  holo(ctx, 798, 184, 96, 96, { opacity: 0.75, seed: 52, sparkles: 6 })
  ctx.restore()
  ctx.strokeStyle = 'rgba(122, 18, 32, 0.35)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(846, 232, 48, 0, Math.PI * 2)
  ctx.stroke()
  drawText(ctx, '06', 846, 242, {
    size: 24,
    weight: 900,
    family: FONT.mono,
    color: 'rgba(59, 29, 23, 0.8)',
    align: 'center',
  })

  drawText(ctx, 'KURSI', 714, 322, {
    size: 8,
    weight: 700,
    family: FONT.mono,
    color: '#8a5b4a',
    tracking: 2,
  })
  drawText(ctx, 'F6', 714, 356, {
    size: 38,
    weight: 900,
    family: FONT.sans,
    color: '#7a1220',
    tracking: 1,
  })
  barcode(ctx, 714, 380, 128, 56, 23, '#3b1d17')
  drawText(ctx, 'FARE: ONE SMILE', 714, 470, {
    size: 8,
    family: FONT.mono,
    color: '#8a5b4a',
    tracking: 1.2,
  })

  gloss(ctx, 10, 10, w - 20, h - 20, { opacity: 0.18, radius: 14, angle: -0.3 })
  holo(ctx, 10, 10, w - 20, h - 20, { opacity: 0.05, seed: 17, sparkles: 3 })
}

/* ------------------------------------------------------------------ */
/* 10b · Indonesian-style souvenir passport page                       */
/* ------------------------------------------------------------------ */

/* 26 · Memory receipt                                                 */
/* ------------------------------------------------------------------ */

export function paintReceipt({ ctx, w, h, photos, caption, date }: Scene) {
  const x = 18
  const paperW = w - 36
  const bottom = h - 66

  // Torn paper silhouette: straight sides, a zigzag foot.
  const paper = () => {
    ctx.beginPath()
    ctx.moveTo(x, 10)
    ctx.lineTo(x + paperW, 10)
    ctx.lineTo(x + paperW, bottom)
    const teeth = 18
    const step = paperW / teeth
    for (let tooth = 0; tooth < teeth; tooth += 1) {
      ctx.lineTo(x + paperW - step * (tooth + 0.5), bottom + (tooth % 2 ? -6 : 10))
    }
    ctx.lineTo(x, bottom)
    ctx.closePath()
  }

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 12
  ctx.fillStyle = '#efeade'
  paper()
  ctx.fill()
  ctx.restore()

  ctx.save()
  paper()
  ctx.clip()
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [
    [0, '#fbf8f0'],
    [0.55, '#f6f2e8'],
    [1, '#e9e2d2'],
  ])
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 61, 'rgba(80, 70, 50, 0.08)', 0.5)
  ctx.restore()

  const dashed = (y: number, color = 'rgba(60, 55, 45, 0.32)') => {
    ctx.save()
    ctx.setLineDash([6, 6])
    ctx.strokeStyle = color
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(x + 28, y)
    ctx.lineTo(x + paperW - 28, y)
    ctx.stroke()
    ctx.restore()
  }

  drawText(ctx, 'MEMORY MART', w / 2, 64, {
    size: 34,
    weight: 700,
    family: FONT.mono,
    color: '#221f19',
    align: 'center',
    tracking: 5,
  })
  drawText(ctx, 'PHOTO BOOTH #06 · REGISTER 1', w / 2, 90, {
    size: 10,
    family: FONT.mono,
    color: '#7a6c53',
    align: 'center',
    tracking: 2.4,
  })
  drawText(ctx, '06 MEMORY LANE · OPEN 24 HOURS', w / 2, 108, {
    size: 9,
    family: FONT.mono,
    color: '#94886f',
    align: 'center',
    tracking: 1.6,
  })
  dashed(124)

  drawText(ctx, 'DATE', x + 28, 146, {
    size: 10,
    family: FONT.mono,
    color: '#7a6c53',
    tracking: 1.6,
  })
  drawText(ctx, formatDate(date, 'dotted'), x + paperW - 28, 146, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#3a352c',
    align: 'right',
    tracking: 1.4,
  })
  drawText(ctx, 'CASHIER', x + 28, 168, {
    size: 10,
    family: FONT.mono,
    color: '#7a6c53',
    tracking: 1.6,
  })
  drawText(ctx, 'SELF-SERVICE', x + paperW - 28, 168, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#3a352c',
    align: 'right',
    tracking: 1.2,
  })

  drawText(ctx, 'CUSTOMER', x + 28, 198, {
    size: 9,
    family: FONT.mono,
    color: '#8b7f68',
    tracking: 2,
  })
  drawText(ctx, (caption || 'WALK-IN').toUpperCase(), x + 28, 224, {
    size: 18,
    weight: 700,
    family: FONT.mono,
    color: '#221f19',
    maxWidth: paperW - 56,
    tracking: 1,
  })
  dashed(246)

  photo(ctx, photos[0], 46, 268, w - 92, 344, {
    radius: 2,
    label: 'PHOTO 1',
    tone: 'fade',
    seed: 71,
    placeholderBg: '#ded6c2',
    placeholderInk: '#6b6047',
  })
  strokeRound(ctx, 46, 268, w - 92, 344, 2, 'rgba(60, 55, 45, 0.35)', 1.5)
  drawText(ctx, 'ITEM 01 · ONE (1) PHOTOGRAPH', x + 28, 634, {
    size: 9,
    family: FONT.mono,
    color: '#7a6c53',
    tracking: 1.6,
  })
  dashed(650)

  const rows: Array<[string, string]> = [
    ['1x SMILE, HELD', '0.00'],
    ['1x LAUGH, LOUD', '0.00'],
    ['1x BAD POSE, KEPT', '0.00'],
    ['1x GOOD LIGHT', '0.00'],
  ]
  rows.forEach(([label, price], index) => {
    const y = 682 + index * 38
    drawText(ctx, label, x + 28, y, {
      size: 15,
      family: FONT.mono,
      color: '#2c2820',
      tracking: 1,
    })
    drawText(ctx, price, x + paperW - 28, y, {
      size: 15,
      family: FONT.mono,
      color: '#2c2820',
      align: 'right',
      tracking: 1,
    })
    ctx.save()
    ctx.strokeStyle = 'rgba(70, 62, 48, 0.18)'
    ctx.beginPath()
    ctx.moveTo(x + 28, y + 9)
    ctx.lineTo(x + paperW - 28, y + 9)
    ctx.stroke()
    ctx.restore()
  })
  dashed(846)

  const total = (label: string, value: string, y: number, big = false) => {
    drawText(ctx, label, x + 28, y, {
      size: big ? 17 : 12,
      weight: big ? 700 : 400,
      family: FONT.mono,
      color: big ? '#221f19' : '#5c5343',
      tracking: big ? 2 : 1.6,
    })
    drawText(ctx, value, x + paperW - 28, y, {
      size: big ? 26 : 12,
      weight: big ? 700 : 400,
      family: FONT.mono,
      color: big ? '#221f19' : '#5c5343',
      align: 'right',
      tracking: big ? 1 : 1.6,
    })
  }
  total('SUBTOTAL', '0.00', 872)
  total('TAX', '0.00', 898)
  total('TOTAL', 'PRICELESS', 934, true)
  dashed(954)

  drawText(ctx, 'PAID WITH MEMORY · CHANGE DUE: NONE', w / 2, 978, {
    size: 9,
    family: FONT.mono,
    color: '#5c5343',
    align: 'center',
    tracking: 1.6,
  })
  barcode(ctx, 46, 996, w - 92, 62, 43, '#2c2820', '#f4efe3')
  drawText(ctx, 'THANK YOU FOR MAKING MEMORIES', w / 2, 1090, {
    size: 14,
    weight: 700,
    family: FONT.mono,
    color: '#221f19',
    align: 'center',
    tracking: 2,
  })
  drawText(ctx, 'NO REFUNDS ON MOMENTS · NOT A REAL RECEIPT', w / 2, 1114, {
    size: 8,
    family: FONT.mono,
    color: '#8b7f68',
    align: 'center',
    tracking: 1.4,
  })
  drawText(ctx, 'PHOTOBOOTH.06 · EST. 2026', w / 2, 1134, {
    size: 8,
    family: FONT.mono,
    color: '#a2977f',
    align: 'center',
    tracking: 1.2,
  })

  ctx.save()
  ctx.globalAlpha = 0.1
  ctx.fillStyle = '#7a6a4f'
  ctx.fillRect(28, bottom - 4, paperW - 20, 3)
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/* 27 · Holiday envelope                                               */
/* ------------------------------------------------------------------ */

export function paintThr({ ctx, w, h, photos, caption }: Scene) {
  const green = '#16382a'
  const gold = '#e3b34a'

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 26
  ctx.shadowOffsetY = 10
  fillRound(ctx, 10, 10, w - 20, h - 20, 10, green)
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.rect(10, 10, w - 20, h - 20)
  ctx.clip()
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#1d4531'],
    [0.55, '#16382a'],
    [1, '#0f2a20'],
  ])
  ctx.fillRect(0, 0, w, h)

  // Woven ketupat lattice.
  ctx.strokeStyle = alpha(gold, 0.16)
  ctx.lineWidth = 1.4
  const step = 58
  for (let row = -1; row < h / step + 2; row += 1) {
    for (let col = -1; col < w / step + 2; col += 1) {
      const cx = col * step + (row % 2 ? step / 2 : 0)
      const cy = row * step
      ctx.beginPath()
      ctx.moveTo(cx, cy - step * 0.34)
      ctx.lineTo(cx + step * 0.34, cy)
      ctx.lineTo(cx, cy + step * 0.34)
      ctx.lineTo(cx - step * 0.34, cy)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, cy - step * 0.2)
      ctx.lineTo(cx + step * 0.2, cy)
      ctx.lineTo(cx, cy + step * 0.2)
      ctx.lineTo(cx - step * 0.2, cy)
      ctx.closePath()
      ctx.stroke()
    }
  }

  ctx.fillStyle = radial(ctx, 740, 90, 20, 740, 120, 420, [
    [0, 'rgba(255, 236, 180, 0.24)'],
    [1, 'rgba(255, 236, 180, 0)'],
  ])
  ctx.fillRect(0, 0, w, h)
  ctx.restore()

  // Double foil rule.
  strokeRound(ctx, 18, 18, w - 36, h - 36, 6, alpha(gold, 0.7), 2)
  strokeRound(ctx, 26, 26, w - 52, h - 52, 4, alpha(gold, 0.28), 1)

  // Photo window.
  fillRound(ctx, 60, 148, 300, 372, 4, '#f4ead4')
  strokeRound(ctx, 60, 148, 300, 372, 4, gold, 3)
  photo(ctx, photos[0], 72, 160, 276, 348, {
    radius: 2,
    label: 'PHOTO 1',
    tone: 'warm',
    seed: 53,
    placeholderBg: '#cbbd9d',
    placeholderInk: '#3f5238',
  })
  strokeRound(ctx, 72, 160, 276, 348, 2, alpha('#3a2a12', 0.4), 1)
  drawText(ctx, 'THE GIFT OF ONE GOOD DAY', 210, 540, {
    size: 8,
    family: FONT.mono,
    color: alpha(gold, 0.75),
    align: 'center',
    tracking: 2,
  })

  // Crescent monogram.
  ctx.save()
  ctx.translate(782, 116)
  ctx.strokeStyle = gold
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(0, 0, 42, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = gold
  ctx.beginPath()
  ctx.arc(-4, 0, 21, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = green
  ctx.beginPath()
  ctx.arc(4, -3, 18, 0, Math.PI * 2)
  ctx.fill()
  star(ctx, 16, -14, 8, 3.4, 5, gold)
  ctx.restore()

  drawText(ctx, 'EID MUBARAK', 390, 232, {
    size: 58,
    family: FONT.serif,
    color: gold,
    tracking: 1.5,
  })
  drawText(ctx, 'HOLIDAY ENVELOPE · THR', 392, 264, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: alpha('#f3ead6', 0.72),
    tracking: 4,
  })
  ctx.strokeStyle = alpha(gold, 0.45)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(392, 288)
  ctx.lineTo(842, 288)
  ctx.stroke()

  drawText(ctx, 'FOR', 392, 330, {
    size: 9,
    family: FONT.mono,
    color: alpha('#f3ead6', 0.6),
    tracking: 2.4,
  })
  drawText(ctx, caption || 'someone loved', 392, 372, {
    size: 42,
    family: FONT.script,
    color: '#fdf6e4',
    maxWidth: 436,
  })
  ctx.strokeStyle = alpha('#fdf6e4', 0.35)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(392, 386)
  ctx.quadraticCurveTo(600, 398, 826, 384)
  ctx.stroke()

  drawText(ctx, 'CONTENTS', 392, 432, {
    size: 9,
    family: FONT.mono,
    color: alpha('#f3ead6', 0.6),
    tracking: 2.4,
  })
  drawText(ctx, 'ONE GOOD DAY', 392, 462, {
    size: 20,
    weight: 700,
    family: FONT.mono,
    color: '#f3ead6',
    tracking: 2,
  })
  drawText(ctx, 'NO. 006 · SEALED WITH FOIL · NOT CURRENCY', 392, 502, {
    size: 8,
    family: FONT.mono,
    color: alpha('#f3ead6', 0.45),
    tracking: 1.4,
  })

  rubberStamp(ctx, 800, 566, 52, 'PHOTO BOOTH', 'EID', alpha(gold, 0.6), -0.2)
  holo(ctx, 18, 18, w - 36, h - 36, { opacity: 0.18, seed: 33, sparkles: 16 })
  gloss(ctx, 18, 18, w - 36, h - 36, { opacity: 0.14, angle: -0.42 })
  vignette(ctx, 0, 0, w, h, '#0a1d14', 0.32)
}

/* ------------------------------------------------------------------ */
/* 29 · Postcard                                                       */
/* ------------------------------------------------------------------ */

export function paintPostcard({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.fillStyle = '#f6efe0'
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 19, 'rgba(90, 76, 50, 0.1)', 0.6)

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 8
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(34, 34, w - 68, 536)
  ctx.restore()

  photo(ctx, photos[0], 44, 44, w - 88, 516, {
    label: 'PHOTO 1',
    tone: 'fade',
    seed: 82,
    placeholderBg: '#b9c9c6',
    placeholderInk: '#2f4a46',
  })
  strokeRound(ctx, 44, 44, w - 88, 516, 0, 'rgba(60, 60, 50, 0.18)', 1)

  // Greeting over the picture corner, like a printed card.
  drawText(ctx, 'GREETINGS FROM', 74, 520, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#fdf8ea',
    tracking: 4,
    shadow: { color: 'rgba(0, 0, 0, 0.55)', blur: 6 },
  })
  drawText(ctx, 'THE PHOTO BOOTH', 72, 552, {
    size: 38,
    family: FONT.serif,
    color: '#ffffff',
    tracking: 0.5,
    shadow: { color: 'rgba(0, 0, 0, 0.5)', blur: 8 },
  })

  // Stamp with a perforated edge.
  const stampX = 806
  const stampY = 66
  const stampW = 110
  const stampH = 132
  ctx.save()
  ctx.fillStyle = '#f7f0df'
  ctx.fillRect(stampX, stampY, stampW, stampH)
  ctx.strokeStyle = 'rgba(70, 60, 45, 0.35)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.strokeRect(stampX + 4, stampY + 4, stampW - 8, stampH - 8)
  ctx.setLineDash([])
  const sky = linear(ctx, stampX, stampY, stampX, stampY + 82, [
    [0, '#9fc6d6'],
    [1, '#e8d3a9'],
  ])
  ctx.fillStyle = sky
  ctx.fillRect(stampX + 9, stampY + 9, stampW - 18, 92)
  ctx.fillStyle = '#e8a13c'
  ctx.beginPath()
  ctx.arc(stampX + 32, stampY + 38, 13, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4c6a63'
  ctx.beginPath()
  ctx.moveTo(stampX + 9, stampY + 101)
  ctx.lineTo(stampX + 40, stampY + 58)
  ctx.lineTo(stampX + 64, stampY + 101)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#37524c'
  ctx.beginPath()
  ctx.moveTo(stampX + 48, stampY + 101)
  ctx.lineTo(stampX + 78, stampY + 70)
  ctx.lineTo(stampX + 101, stampY + 101)
  ctx.closePath()
  ctx.fill()
  drawText(ctx, '06', stampX + stampW / 2, stampY + 122, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#5b4b35',
    align: 'center',
    tracking: 2,
  })
  ctx.restore()

  // Postmark: rings plus three waves across the stamp.
  ctx.save()
  ctx.strokeStyle = 'rgba(50, 60, 65, 0.5)'
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.arc(752, 132, 44, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(752, 132, 34, 0, Math.PI * 2)
  ctx.stroke()
  for (let wave = 0; wave < 3; wave += 1) {
    ctx.beginPath()
    const y = 112 + wave * 18
    ctx.moveTo(790, y)
    for (let x = 790; x <= 900; x += 22) {
      ctx.quadraticCurveTo(x + 11, y - 7, x + 22, y)
    }
    ctx.stroke()
  }
  drawText(ctx, formatDate(date, 'compact'), 752, 128, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: 'rgba(50, 60, 65, 0.75)',
    align: 'center',
    tracking: 1.2,
  })
  drawText(ctx, 'POSTAGE', 752, 142, {
    size: 7,
    family: FONT.mono,
    color: 'rgba(50, 60, 65, 0.6)',
    align: 'center',
    tracking: 2,
  })
  ctx.restore()

  // Bottom half: message on the left, address block on the right.
  ctx.strokeStyle = 'rgba(70, 62, 50, 0.22)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(40, 592)
  ctx.lineTo(w - 40, 592)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(620, 604)
  ctx.lineTo(620, h - 32)
  ctx.stroke()

  drawText(ctx, 'POSTCARD', 56, 632, {
    size: 30,
    family: FONT.serif,
    style: 'italic',
    color: '#2b3a3a',
    tracking: 1,
  })
  drawText(ctx, caption || 'wish you were here', 58, 658, {
    size: 26,
    family: FONT.script,
    color: '#3c4a46',
    maxWidth: 520,
  })
  drawText(ctx, formatDate(date, 'long'), 58, 682, {
    size: 9,
    family: FONT.mono,
    color: '#7d867e',
    tracking: 1.6,
  })

  drawText(ctx, 'TO:', 640, 622, {
    size: 9,
    family: FONT.mono,
    color: '#7d867e',
    tracking: 2,
  })
  for (let line = 0; line < 3; line += 1) {
    const y = 646 + line * 24
    ctx.strokeStyle = 'rgba(70, 62, 50, 0.22)'
    ctx.beginPath()
    ctx.moveTo(640, y)
    ctx.lineTo(w - 56, y)
    ctx.stroke()
  }
  drawText(ctx, 'SOMEONE KIND', 642, 640, {
    size: 13,
    family: FONT.script,
    color: '#4c5850',
  })
  drawText(ctx, '06 MEMORY LANE · THE ISLANDS', 640, 690, {
    size: 8,
    family: FONT.mono,
    color: '#8a9188',
    tracking: 1.2,
  })

  gloss(ctx, 0, 0, w, h, { opacity: 0.12, angle: -0.4 })
}

/* ------------------------------------------------------------------ */
/* 31 · Artwork                                                        */
/* ------------------------------------------------------------------ */

export function paintArtwork({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [
    [0, '#8d8880'],
    [0.5, '#a7a29a'],
    [1, '#726d66'],
  ])
  ctx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = radial(ctx, w * 0.46, h * 0.24, 0, w * 0.5, h * 0.3, Math.max(w, h) * 0.72, [
    [0, 'rgba(255, 244, 220, 0.42)'],
    [1, 'rgba(255, 244, 220, 0)'],
  ])
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
  grainDots(ctx, 0, 0, w, h, 12, 'rgba(40, 36, 30, 0.16)', 0.7)

  // Frame shadow and moulding.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 14
  fillRound(ctx, 68, 86, 684, 686, 4, '#8a6428')
  ctx.restore()

  const gold = linear(ctx, 68, 86, 752, 772, [
    [0, '#d8ab52'],
    [0.35, '#f0d795'],
    [0.55, '#a97f33'],
    [0.8, '#e7c47c'],
    [1, '#8a6428'],
  ])
  ctx.fillStyle = gold
  ctx.fillRect(68, 86, 684, 686)
  ctx.strokeStyle = 'rgba(60, 40, 15, 0.5)'
  ctx.lineWidth = 2
  ctx.strokeRect(88, 106, 644, 646)
  ctx.strokeStyle = 'rgba(255, 244, 214, 0.45)'
  ctx.lineWidth = 1
  ctx.strokeRect(96, 114, 628, 630)

  // Mat board.
  ctx.fillStyle = '#efe9db'
  ctx.fillRect(112, 130, 596, 598)
  ctx.strokeStyle = 'rgba(90, 80, 60, 0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(136, 154, 548, 550)

  photo(ctx, photos[0], 146, 164, 528, 530, {
    label: 'PHOTO 1',
    tone: 'warm',
    seed: 24,
    placeholderBg: '#c8bda5',
    placeholderInk: '#5a4f3a',
    grain: true,
  })
  strokeRound(ctx, 146, 164, 528, 530, 0, 'rgba(50, 40, 25, 0.35)', 1.5)
  // Painted texture: a few faint horizontal brush passes.
  ctx.save()
  ctx.globalAlpha = 0.06
  ctx.strokeStyle = '#fff3d8'
  for (let line = 0; line < 18; line += 1) {
    const y = 176 + line * 29
    ctx.lineWidth = 6 + (line % 3) * 3
    ctx.beginPath()
    ctx.moveTo(152, y)
    ctx.bezierCurveTo(300, y - 5, 460, y + 6, 668, y - 2)
    ctx.stroke()
  }
  ctx.restore()

  // Signature in the mat corner.
  drawText(ctx, 'PB. 06', 620, 726, {
    size: 16,
    family: FONT.script,
    color: 'rgba(60, 50, 40, 0.65)',
    align: 'right',
  })

  // Brass plaque.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 4
  fillRound(ctx, 190, 806, 440, 116, 4, '#b8964a')
  ctx.restore()
  ctx.fillStyle = linear(ctx, 190, 806, 630, 922, [
    [0, '#d8b968'],
    [0.45, '#f0dda2'],
    [1, '#9d7b34'],
  ])
  ctx.fillRect(196, 812, 428, 104)
  strokeRound(ctx, 196, 812, 428, 104, 2, 'rgba(80, 55, 15, 0.45)', 1)
  const title = (caption || 'ONE GOOD AFTERNOON').toUpperCase()
  drawText(ctx, title, 410, 850, {
    size: 20,
    weight: 700,
    family: FONT.serif,
    color: '#3d2b0c',
    align: 'center',
    maxWidth: 380,
    tracking: 1.5,
  })
  drawText(ctx, 'ARCHIVAL PIGMENT ON PAPER', 410, 876, {
    size: 8,
    family: FONT.mono,
    color: '#5b4113',
    align: 'center',
    tracking: 1.8,
  })
  drawText(ctx, formatDate(date, 'long'), 410, 898, {
    size: 9,
    family: FONT.mono,
    color: '#5b4113',
    align: 'center',
    tracking: 1.6,
  })

  // Gallery sticker.
  ctx.save()
  ctx.translate(716, 122)
  ctx.rotate(-0.12)
  ctx.fillStyle = '#9c2f2a'
  ctx.beginPath()
  ctx.arc(0, 0, 23, 0, Math.PI * 2)
  ctx.fill()
  drawText(ctx, 'SOLD', 0, 5, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#f6e8cf',
    align: 'center',
    tracking: 1,
  })
  ctx.restore()

  vignette(ctx, 0, 0, w, h, '#2a2418', 0.34)
  gloss(ctx, 0, 0, w, h, { opacity: 0.08, angle: -0.5 })
}

/* ------------------------------------------------------------------ */
/* 37 · Game box                                                       */
/* ------------------------------------------------------------------ */

export function paintGameBox({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = '#0a0e1a'
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 27, 'rgba(255, 255, 255, 0.05)', 0.3)

  const front = { x: 92, y: 48, w: 700, h: 1024 }
  const frontGradient = linear(ctx, front.x, front.y, front.x + front.w, front.y + front.h, [
    [0, '#1d2a55'],
    [0.6, '#141b34'],
    [1, '#0a0e1a'],
  ])
  ctx.fillStyle = frontGradient
  ctx.fillRect(front.x, front.y, front.w, front.h)
  ctx.fillStyle = linear(ctx, 44, 48, 92, 1072, [
    [0, '#222c4a'],
    [1, '#0d1222'],
  ])
  ctx.fillRect(44, 48, 48, 1024)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(92, 48, 700, 1024)

  // Spine title, read bottom-to-top like a shelf box.
  ctx.save()
  ctx.translate(74, 860)
  ctx.rotate(-Math.PI / 2)
  drawText(ctx, 'MEMORY QUEST', 0, 0, {
    size: 26,
    weight: 700,
    family: FONT.display,
    color: '#ffcb05',
    tracking: 1.5,
  })
  ctx.restore()
  ctx.save()
  ctx.translate(62, 640)
  ctx.rotate(-Math.PI / 2)
  drawText(ctx, 'PHOTO BOX · 06', 0, 0, {
    size: 10,
    family: FONT.mono,
    color: 'rgba(255, 255, 255, 0.55)',
    tracking: 2,
  })
  ctx.restore()

  photo(ctx, photos[0], 124, 88, 636, 656, {
    label: 'PHOTO 1',
    seed: 66,
    placeholderBg: '#26324f',
    placeholderInk: '#dfe6ff',
  })
  ctx.strokeStyle = 'rgba(255, 203, 5, 0.55)'
  ctx.lineWidth = 2
  ctx.strokeRect(124, 88, 636, 656)

  // Award badge.
  ctx.save()
  ctx.translate(712, 148)
  ctx.fillStyle = '#f2c11f'
  ctx.beginPath()
  ctx.arc(0, 0, 58, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#7d5c07'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, 49, 0, Math.PI * 2)
  ctx.stroke()
  arcText(ctx, "PLAYER'S CHOICE", 0, 0, 40, -Math.PI / 2, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#3f2d03',
    tracking: 0.4,
  })
  star(ctx, 0, 2, 17, 7, 5, '#3f2d03')
  ctx.restore()

  drawText(ctx, 'MEMORY QUEST', 124, 818, {
    size: 62,
    weight: 700,
    family: FONT.display,
    color: '#ffffff',
    tracking: 1.5,
    maxWidth: 600,
    shadow: { color: 'rgba(0, 0, 0, 0.5)', blur: 10, y: 3 },
  })
  drawText(ctx, 'THE LEGEND OF ONE SHOT', 126, 846, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#ffcb05',
    tracking: 4,
  })

  // In-game screenshot (the same frame, cooler and smaller).
  ctx.fillStyle = '#06090f'
  ctx.fillRect(120, 872, 200, 132)
  photo(ctx, photos[0], 126, 878, 188, 106, {
    label: 'IN GAME',
    tone: 'cool',
    seed: 91,
    placeholderBg: '#101a2c',
    placeholderInk: '#8fb3ff',
  })
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
  ctx.lineWidth = 1
  ctx.strokeRect(126, 878, 188, 106)
  drawText(ctx, 'ACTUAL GAMEPLAY', 120, 1022, {
    size: 8,
    family: FONT.mono,
    color: 'rgba(255, 255, 255, 0.55)',
    tracking: 1.4,
  })

  drawText(ctx, '1 PLAYER', 360, 900, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#ffffff',
    tracking: 2,
  })
  drawText(ctx, 'MEMORY CARD', 360, 922, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#ffffff',
    tracking: 2,
  })
  drawText(ctx, 'RATED E FOR EVERYONE', 360, 944, {
    size: 9,
    family: FONT.mono,
    color: 'rgba(255, 255, 255, 0.55)',
    tracking: 1.4,
  })
  const quote = caption || 'A quest you can finish in one afternoon.'
  drawText(ctx, quote, 360, 982, {
    size: 13,
    family: FONT.serif,
    style: 'italic',
    color: 'rgba(255, 255, 255, 0.75)',
    maxWidth: 380,
  })
  barcode(ctx, 600, 896, 150, 48, 12, '#ffffff', 'rgba(255, 255, 255, 0.08)')
  drawText(ctx, '© 2026 PHOTO BOOTH', 750, 964, {
    size: 8,
    family: FONT.mono,
    color: 'rgba(255, 255, 255, 0.45)',
    align: 'right',
    tracking: 1,
  })

  gloss(ctx, 92, 48, 700, 1024, { opacity: 0.16, angle: -0.5 })
  grainDots(ctx, 92, 48, 700, 1024, 5, 'rgba(255, 255, 255, 0.06)', 0.4)
}

/* ------------------------------------------------------------------ */
/* 38 · Cassette box                                                   */
/* ------------------------------------------------------------------ */

export function paintCassetteBox({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#232328'],
    [0.5, '#111114'],
    [1, '#07070a'],
  ])
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 37, 'rgba(255, 255, 255, 0.06)', 0.35)

  // Plastic case.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
  ctx.shadowBlur = 26
  ctx.shadowOffsetY = 12
  fillRound(ctx, 36, 36, w - 72, h - 72, 10, '#1b1b20')
  ctx.restore()
  ctx.fillStyle = linear(ctx, 36, 36, w - 36, h - 36, [
    [0, 'rgba(255, 255, 255, 0.16)'],
    [0.35, 'rgba(255, 255, 255, 0.03)'],
    [1, 'rgba(255, 255, 255, 0.08)'],
  ])
  ctx.fillRect(44, 44, w - 88, h - 88)

  // J-card front.
  ctx.fillStyle = '#0e0e12'
  ctx.fillRect(64, 64, w - 128, 684)
  photo(ctx, photos[0], 88, 88, w - 176, 424, {
    label: 'COVER',
    seed: 45,
    placeholderBg: '#2a2a32',
    placeholderInk: '#e8e3d6',
  })
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 1
  ctx.strokeRect(88, 88, w - 176, 424)

  const title = (caption || 'SIDE A / SIDE B').toUpperCase()
  drawText(ctx, title, 92, 578, {
    size: 52,
    weight: 700,
    family: FONT.display,
    color: '#f4efe6',
    maxWidth: 640,
    tracking: 1,
  })
  drawText(ctx, 'STEREO · DOLBY B NR · CHROME 70µs', 94, 612, {
    size: 10,
    family: FONT.mono,
    color: '#b9b2a5',
    tracking: 1.8,
  })
  drawText(ctx, 'SIDE A', w - 96, 578, {
    size: 14,
    weight: 700,
    family: FONT.mono,
    color: '#ffb347',
    align: 'right',
    tracking: 2,
  })
  drawText(ctx, 'MADE IN THE BOOTH', w - 96, 612, {
    size: 9,
    family: FONT.mono,
    color: '#8d877c',
    align: 'right',
    tracking: 1.4,
  })

  // Hinge and back panel.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(52, 762)
  ctx.lineTo(w - 52, 762)
  ctx.stroke()

  ctx.fillStyle = 'rgba(244, 239, 230, 0.06)'
  ctx.fillRect(64, 776, w - 128, 280)
  drawText(ctx, 'TRACKLIST', 88, 808, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#ffb347',
    tracking: 3,
  })
  const tracks = [
    'A1  ONE GOOD AFTERNOON',
    'A2  THE LONG WAY HOME',
    'A3  SOMEONE LAUGHING',
    'B1  SAME TIME NEXT YEAR',
  ]
  tracks.forEach((track, index) => {
    drawText(ctx, track, 88, 838 + index * 26, {
      size: 13,
      family: FONT.mono,
      color: '#d9d2c4',
      tracking: 1,
    })
    drawText(ctx, '3:06', w - 88, 838 + index * 26, {
      size: 12,
      family: FONT.mono,
      color: '#9a9386',
      align: 'right',
      tracking: 1,
    })
  })
  drawText(ctx, 'ALL TRACKS RECORDED ON A PHONE, 2003', 88, 950, {
    size: 8,
    family: FONT.mono,
    color: '#7e786d',
    tracking: 1.2,
  })
  barcode(ctx, w - 260, 972, 172, 44, 21, '#e8e2d4', 'rgba(255, 255, 255, 0.08)')
  drawText(ctx, 'NO. 006', w - 88, 1034, {
    size: 9,
    family: FONT.mono,
    color: '#8d877c',
    align: 'right',
    tracking: 1.6,
  })

  // Case cracks and glare.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(118, 38)
  ctx.lineTo(160, 120)
  ctx.lineTo(150, 190)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(700, 1080)
  ctx.lineTo(672, 1000)
  ctx.lineTo(690, 930)
  ctx.stroke()
  scanlines(ctx, 36, 36, w - 72, h - 72, 5, 'rgba(255, 255, 255, 0.025)', 1)
  gloss(ctx, 36, 36, w - 72, h - 72, { opacity: 0.2, radius: 10, angle: -0.55 })
  holo(ctx, 64, 64, w - 128, 684, { opacity: 0.1, seed: 76, sparkles: 7 })
}

/* ------------------------------------------------------------------ */
/* 36 · Game cartridge                                                 */
/* ------------------------------------------------------------------ */

export function paintGameCart({ ctx, w, h, photos, caption, date }: Scene) {
  /* The shelf cartridge, rebuilt 1:1: a moulded IHSNN shell, grip ribs, an
     embossed logo plate and a recessed sticker made of two metal bands around
     a printed label. Proportions follow .cartridge__* in landing.css. */
  const gold = '#c9a227'
  const edge = mix('#6f4f0d', '#000000', 0.18)
  const ink = '#0b1533'

  // Dark stage the cartridge sits on.
  ctx.fillStyle = radial(ctx, w * 0.5, h * 0.36, 40, w * 0.5, h * 0.42, w * 0.82, [
    [0, '#24212b'],
    [0.55, '#131118'],
    [1, '#08070b'],
  ])
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 31, 'rgba(255, 255, 255, 0.05)', 0.35)

  const sx = 70
  const sy = 70
  const sw = 720
  const sh = 837
  const bottom = sy + sh

  // Floor shadow and the moulded bottom lip.
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.beginPath()
  ctx.ellipse(w / 2, bottom + 40, sw * 0.44, 38, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  fillRound(ctx, sx, bottom - 8, sw, 14, 8, edge)

  // Shell.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 14
  fillRound(ctx, sx, sy, sw, sh, 32, gold)
  ctx.restore()

  ctx.save()
  roundPath(ctx, sx, sy, sw, sh, 32)
  ctx.clip()
  ctx.fillStyle = linear(ctx, 0, sy, 0, sy + sh, [
    [0, '#e6c665'],
    [0.14, '#dab64a'],
    [0.44, '#cfa62f'],
    [0.74, '#b38c22'],
    [1, '#8a6512'],
  ])
  ctx.fillRect(sx, sy, sw, sh)
  ctx.fillStyle = linear(ctx, sx + sw * 0.78, 0, sx + sw, 0, [
    [0, 'rgba(60, 40, 5, 0)'],
    [1, 'rgba(60, 40, 5, 0.32)'],
  ])
  ctx.fillRect(sx, sy, sw, sh)
  ctx.fillStyle = radial(
    ctx,
    sx + sw * 0.18,
    sy - sh * 0.05,
    10,
    sx + sw * 0.2,
    sy + sh * 0.04,
    sw * 0.5,
    [
      [0, 'rgba(255, 255, 255, 0.06)'],
      [1, 'rgba(255, 255, 255, 0)'],
    ],
  )
  ctx.fillRect(sx, sy, sw, sh)
  ctx.fillStyle = linear(ctx, 0, sy, 0, sy + 26, [
    [0, 'rgba(255, 255, 255, 0.14)'],
    [1, 'rgba(255, 255, 255, 0)'],
  ])
  ctx.fillRect(sx, sy, sw, 26)
  ctx.fillStyle = linear(ctx, 0, bottom - 70, 0, bottom, [
    [0, 'rgba(0, 0, 0, 0)'],
    [1, 'rgba(0, 0, 0, 0.42)'],
  ])
  ctx.fillRect(sx, bottom - 70, sw, 70)
  ctx.restore()
  grainDots(ctx, sx, sy, sw, sh, 77, 'rgba(255, 255, 255, 0.14)', 0.5)
  strokeRound(ctx, sx + 1, sy + 1, sw - 2, sh - 2, 31, 'rgba(0, 0, 0, 0.35)', 1.5)

  // Grip ribs.
  for (const x of [sx + sw * 0.03, sx + sw * 0.97 - sw * 0.105]) {
    for (let rib = 0; rib < 3; rib += 1) {
      const y = sy + sh * 0.054 + rib * 24
      fillRound(ctx, x, y, sw * 0.105, sw * 0.022, 7, 'rgba(80, 60, 10, 0.32)')
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x + 4, y + 2)
      ctx.lineTo(x + sw * 0.105 - 4, y + 2)
      ctx.stroke()
    }
  }

  // Embossed logo plate.
  const plate = {
    x: sx + sw * 0.18,
    y: sy + sh * 0.056,
    w: sw * 0.64,
    h: sh * 0.124,
  }
  fillRound(ctx, plate.x, plate.y, plate.w, plate.h, plate.h / 2, mix(gold, '#000000', 0.2))
  ctx.fillStyle = linear(ctx, plate.x, plate.y, plate.x, plate.y + plate.h, [
    [0, '#a07a1b'],
    [0.44, '#c9a227'],
    [1, '#8f6a14'],
  ])
  roundPath(ctx, plate.x, plate.y, plate.w, plate.h, plate.h / 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(70, 48, 5, 0.45)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  drawText(ctx, 'IHSNN', plate.x + plate.w * 0.28, plate.y + plate.h * 0.62, {
    size: plate.h * 0.38,
    weight: 400,
    family: FONT.pixel,
    color: '#fff3c4',
    align: 'right',
    tracking: 1,
    shadow: { color: 'rgba(70, 48, 5, 0.75)', blur: 1, y: 2 },
  })
  drawText(ctx, 'GAMES', plate.x + plate.w * 0.34, plate.y + plate.h * 0.63, {
    size: plate.h * 0.26,
    weight: 800,
    family: FONT.sans,
    color: '#fff3c4',
    style: 'italic',
    tracking: 3,
    shadow: { color: 'rgba(70, 48, 5, 0.7)', blur: 1, y: 2 },
  })

  // Recessed sticker well.
  const label = {
    x: sx + sw * 0.12,
    y: sy + sh * 0.285,
    w: sw * 0.76,
    h: sh * 0.62,
  }
  fillRound(ctx, label.x, label.y, label.w, label.h, 7, mix(gold, '#000000', 0.36))
  ctx.fillStyle = linear(ctx, label.x, label.y, label.x, label.y + label.h, [
    [0, mix(gold, '#000000', 0.44)],
    [1, mix(gold, '#000000', 0.3)],
  ])
  roundPath(ctx, label.x, label.y, label.w, label.h, 7)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 244, 205, 0.28)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(label.x + 6, label.y + label.h - 1)
  ctx.lineTo(label.x + label.w - 6, label.y + label.h - 1)
  ctx.stroke()

  const pad = 12
  const sticker = {
    x: label.x + pad,
    y: label.y + pad,
    w: label.w - pad * 2,
    h: label.h - pad * 2,
  }
  ctx.fillStyle = '#e9e2d0'
  ctx.fillRect(sticker.x, sticker.y, sticker.w, sticker.h)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(sticker.x + 0.5, sticker.y + 0.5, sticker.w - 1, sticker.h - 1)

  const paper = {
    x: sticker.x + 3,
    y: sticker.y + 3,
    w: sticker.w - 6,
    h: sticker.h - 6,
  }
  const bandW = paper.w * 0.085
  const art = {
    x: paper.x + bandW,
    y: paper.y,
    w: paper.w - bandW * 2,
    h: paper.h,
  }

  // Metal side bands.
  const band = (x: number, flip: boolean) => {
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, paper.y, bandW, paper.h)
    ctx.clip()
    ctx.fillStyle = linear(ctx, x, 0, x + bandW, 0, [
      [0, flip ? '#b3afa1' : '#ebe8dd'],
      [0.38, '#cecabd'],
      [1, flip ? '#ebe8dd' : '#b3afa1'],
    ])
    ctx.fillRect(x, paper.y, bandW, paper.h)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + (flip ? 0 : bandW), paper.y)
    ctx.lineTo(x + (flip ? 0 : bandW), paper.y + paper.h)
    ctx.stroke()
    ctx.restore()
  }
  band(paper.x, false)
  band(paper.x + paper.w - bandW, true)

  const vertical = (text: string, x: number, rotation: number) => {
    ctx.save()
    ctx.translate(x, paper.y + paper.h / 2)
    ctx.rotate(rotation)
    drawText(ctx, text, 0, 0, {
      size: 13,
      weight: 600,
      family: FONT.mono,
      color: '#33333a',
      align: 'center',
      tracking: 1.8,
    })
    ctx.restore()
  }
  vertical('DMG-06-PB', paper.x + bandW / 2, -Math.PI / 2)
  vertical('THIS SIDE OUT', paper.x + paper.w - bandW / 2, Math.PI / 2)

  // Printed label: navy upper half, cream lower half.
  const bodyTop = art.y + art.h * 0.6
  ctx.save()
  ctx.beginPath()
  ctx.rect(art.x, art.y, art.w, art.h)
  ctx.clip()
  ctx.fillStyle = linear(ctx, art.x, art.y, art.x + art.w * 0.6, art.y + art.h, [
    [0, '#16295f'],
    [0.55, '#0e1c46'],
    [1, '#0a1436'],
  ])
  ctx.fillRect(art.x, art.y, art.w, art.h)
  halftone(ctx, art.x, art.y, art.w, bodyTop - art.y, 4, 'rgba(255, 255, 255, 0.1)', 0.22)
  ctx.fillStyle = '#f6eccd'
  ctx.fillRect(art.x, bodyTop, art.w, art.y + art.h - bodyTop)
  ctx.fillStyle = 'rgba(11, 21, 51, 0.06)'
  for (let dot = 0; dot < 260; dot += 1) {
    const dx = art.x + ((dot * 37) % art.w)
    const dy = art.y + ((dot * 53) % art.h)
    ctx.fillRect(dx, dy, 1.2, 1.2)
  }
  ctx.restore()

  // Cover photo, inset like a printed plate.
  const sceneTop = art.y + art.h * 0.07
  const sceneH = bodyTop - sceneTop - 8
  const shot = {
    x: art.x + 40,
    y: sceneTop + 8,
    w: art.w - 80,
    h: sceneH - 10,
  }
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 3
  photo(ctx, photos[0], shot.x, shot.y, shot.w, shot.h, {
    label: 'LABEL',
    tone: 'cool',
    radius: 2,
    seed: 63,
    placeholderBg: '#1b2650',
    placeholderInk: '#ffe8a3',
  })
  ctx.restore()
  strokeRound(ctx, shot.x, shot.y, shot.w, shot.h, 2, 'rgba(255, 243, 205, 0.65)', 1.5)
  ctx.save()
  ctx.beginPath()
  ctx.rect(art.x, art.y, art.w, bodyTop - art.y)
  ctx.clip()
  ctx.fillStyle = linear(ctx, 0, art.y, 0, art.y + 46, [
    [0, 'rgba(9, 17, 46, 0.85)'],
    [1, 'rgba(9, 17, 46, 0)'],
  ])
  ctx.fillRect(art.x, art.y, art.w, 46)
  ctx.restore()

  drawText(ctx, 'NO. 06', art.x + 14, art.y + 27, {
    size: 13,
    weight: 600,
    family: FONT.mono,
    color: 'rgba(255, 255, 255, 0.9)',
    tracking: 1.6,
  })
  drawText(ctx, 'IHSNN', art.x + art.w - 14, art.y + 27, {
    size: 13,
    weight: 600,
    family: FONT.mono,
    color: 'rgba(255, 255, 255, 0.9)',
    align: 'right',
    tracking: 1.6,
  })

  // Barcode and dot register, printed in the cream half.
  const body = { x: art.x + 14, y: bodyTop, w: art.w - 28, h: art.y + art.h - bodyTop - 10 }
  ctx.save()
  ctx.globalAlpha = 0.5
  ctx.fillStyle = ink
  let barX = body.x
  const barSeed = seeded(19)
  while (barX < body.x + body.w * 0.24) {
    const bar = 1 + barSeed() * 2
    ctx.fillRect(barX, body.y + 10, bar, 12)
    barX += bar + 2
  }
  for (let dot = 0; dot < 5; dot += 1) {
    for (let row = 0; row < 2; row += 1) {
      ctx.beginPath()
      ctx.arc(body.x + body.w - 20 - dot * 6, body.y + 14 + row * 5, 1.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()

  const title = (caption || 'PHOTO BOOTH').toUpperCase()
  let size = 44
  let lines = wrapText(ctx, title, body.w, { size, family: FONT.pixelSoft, weight: 700 })
  if (lines.length > 2) {
    size = 34
    lines = wrapText(ctx, title, body.w, { size, family: FONT.pixelSoft, weight: 700 })
  }
  const lineHeight = size * 1.28
  const footY = body.y + body.h - 8
  const titleBottom = footY - 24
  const firstBase = titleBottom - (lines.length - 1) * lineHeight
  const kickerY = firstBase - size - 12

  drawText(ctx, 'IHSNN ORIGINAL', body.x, kickerY, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: 'rgba(11, 21, 51, 0.72)',
    tracking: 2,
  })
  lines.forEach((line, index) => {
    drawText(ctx, line, body.x, firstBase + index * lineHeight, {
      size,
      weight: 700,
      family: FONT.pixelSoft,
      color: ink,
      tracking: 0.2,
    })
  })
  drawText(ctx, `© ${dateParts(date).year}`, body.x, footY, {
    size: 11,
    family: FONT.mono,
    color: 'rgba(11, 21, 51, 0.78)',
    tracking: 1.2,
  })
  drawText(ctx, '8-BIT', body.x + body.w, footY, {
    size: 11,
    family: FONT.mono,
    color: 'rgba(11, 21, 51, 0.78)',
    align: 'right',
    tracking: 1.6,
  })

  // Side groove.
  fillRound(ctx, sx - 1, sy + sh * 0.46, 13, sh * 0.07, 3, 'rgba(0, 0, 0, 0.5)')
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(sx + 13, sy + sh * 0.46 + 4)
  ctx.lineTo(sx + 13, sy + sh * 0.53 - 4)
  ctx.stroke()

  // Moulded notch.
  const notchY = bottom - sh * 0.046
  ctx.beginPath()
  ctx.moveTo(w / 2 - 36, notchY)
  ctx.lineTo(w / 2 + 36, notchY)
  ctx.lineTo(w / 2, notchY + 30)
  ctx.closePath()
  ctx.fillStyle = mix(gold, '#000000', 0.62)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 244, 205, 0.25)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Plastic glare.
  ctx.save()
  roundPath(ctx, sx, sy, sw, sh, 32)
  ctx.clip()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = linear(ctx, sx, sy, sx + sw * 0.9, sy + sh * 0.7, [
    [0, 'rgba(255, 255, 255, 0.06)'],
    [0.18, 'rgba(255, 255, 255, 0.02)'],
    [0.42, 'rgba(255, 255, 255, 0)'],
  ])
  ctx.fillRect(sx, sy, sw, sh)
  ctx.fillStyle = radial(
    ctx,
    sx + sw * 0.28,
    sy + sh * 0.02,
    10,
    sx + sw * 0.28,
    sy + sh * 0.05,
    sw * 0.7,
    [
      [0, 'rgba(255, 255, 255, 0.05)'],
      [1, 'rgba(255, 255, 255, 0)'],
    ],
  )
  ctx.fillRect(sx, sy, sw, sh)
  ctx.restore()

  vignette(ctx, 0, 0, w, h, '#000000', 0.3)
  gloss(ctx, sx, sy, sw, sh, { opacity: 0.03, radius: 32, angle: -0.5 })
}

/* ------------------------------------------------------------------ */

function tornRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
) {
  const random = seeded(seed)
  const steps = 14
  ctx.beginPath()
  ctx.moveTo(x, y)
  for (let step = 1; step <= steps; step += 1) {
    ctx.lineTo(x + (width / steps) * step, y + (random() - 0.5) * 10)
  }
  for (let step = 1; step <= steps; step += 1) {
    ctx.lineTo(x + width + (random() - 0.5) * 10, y + (height / steps) * step)
  }
  for (let step = 1; step <= steps; step += 1) {
    ctx.lineTo(x + width - (width / steps) * step, y + height + (random() - 0.5) * 10)
  }
  for (let step = 1; step <= steps; step += 1) {
    ctx.lineTo(x + (random() - 0.5) * 10, y + height - (height / steps) * step)
  }
  ctx.closePath()
}

export function paintVandals({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = '#6f6b63'
  ctx.fillRect(0, 0, w, h)
  const random = seeded(17)
  const brickW = 74
  const brickH = 30
  for (let row = 0; row < Math.ceil(h / brickH); row += 1) {
    const offset = row % 2 ? brickW / 2 : 0
    for (let col = -1; col < Math.ceil(w / brickW) + 1; col += 1) {
      const shade = 0.18 + random() * 0.3
      ctx.fillStyle = mix('#6f6b63', '#3c332c', clamp(shade, 0, 0.55))
      ctx.fillRect(
        col * brickW + offset + 2,
        row * brickH + 2,
        brickW - 4,
        brickH - 4,
      )
    }
  }
  grainDots(ctx, 0, 0, w, h, 51, 'rgba(30, 24, 18, 0.3)', 0.9)
  vignette(ctx, 0, 0, w, h, '#1b1712', 0.45)

  // Paste-up paper with a photo inside.
  const paperX = 148
  const paperY = 118
  const paperW = 604
  const paperH = 468
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate(-0.018)
  ctx.translate(-w / 2, -h / 2)
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 8
  tornRect(ctx, paperX, paperY, paperW, paperH, 9)
  ctx.fillStyle = '#efe7d5'
  ctx.fill()
  ctx.restore()

  ctx.save()
  tornRect(ctx, paperX + 14, paperY + 14, paperW - 28, paperH - 28, 91)
  ctx.clip()
  photo(ctx, photos[0], paperX + 14, paperY + 14, paperW - 28, paperH - 28, {
    label: 'PHOTO 1',
    seed: 33,
    placeholderBg: '#8e8474',
    placeholderInk: '#2b241c',
    grain: true,
  })
  ctx.restore()
  ctx.restore()

  // Tape.
  const tape = (x: number, y: number, angle: number, width: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillStyle = 'rgba(246, 238, 214, 0.42)'
    ctx.fillRect(-width / 2, -16, width, 32)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.lineWidth = 1
    ctx.strokeRect(-width / 2, -16, width, 32)
    ctx.restore()
  }
  tape(178, 128, -0.6, 108)
  tape(722, 132, 0.5, 104)
  tape(176, 578, 0.55, 96)

  // Spray paint.
  const tag = (text: string, x: number, y: number, size: number, color: string, angle: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    drawText(ctx, text, 4, 4, {
      size,
      weight: 700,
      family: FONT.display,
      color: 'rgba(20, 16, 14, 0.55)',
      tracking: 2,
    })
    drawText(ctx, text, 0, 0, {
      size,
      weight: 700,
      family: FONT.display,
      color,
      tracking: 2,
      stroke: 'rgba(255, 255, 255, 0.85)',
      lineWidth: 4,
    })
    ctx.restore()
  }
  tag('VANDALS', 92, 668, 92, '#ff4d9d', -0.06)
  tag('NO ADS', 616, 66, 40, '#22d3ee', 0.08)
  tag('06', 760, 600, 54, '#ffd166', -0.12)

  // Drips under the big tag.
  ctx.save()
  ctx.strokeStyle = '#ff4d9d'
  ctx.lineCap = 'round'
  for (const [x, length, width] of [
    [128, 78, 7],
    [222, 46, 5],
    [332, 96, 6],
  ] as const) {
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(x, 690)
    ctx.lineTo(x, 690 + length)
    ctx.stroke()
    circlePath(ctx, x, 690 + length, width * 0.55)
    ctx.fillStyle = '#ff4d9d'
    ctx.fill()
  }
  ctx.restore()

  // Sharpie scribble and arrow.
  ctx.save()
  ctx.strokeStyle = 'rgba(28, 24, 20, 0.6)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(560, 96)
  ctx.bezierCurveTo(640, 40, 760, 70, 742, 152)
  ctx.bezierCurveTo(730, 214, 620, 200, 604, 132)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(300, 604)
  ctx.lineTo(430, 566)
  ctx.moveTo(430, 566)
  ctx.lineTo(408, 542)
  ctx.moveTo(430, 566)
  ctx.lineTo(402, 588)
  ctx.stroke()
  ctx.restore()

  drawText(ctx, (caption || 'PASTED AT 2AM').toUpperCase(), 468, 596, {
    size: 14,
    family: FONT.mono,
    color: 'rgba(246, 238, 214, 0.8)',
    align: 'right',
    maxWidth: 240,
    tracking: 1.4,
  })
  drawText(ctx, 'WHEAT PASTE · 06 · DO NOT REMOVE', 148, 700, {
    size: 8,
    family: FONT.mono,
    color: 'rgba(246, 238, 214, 0.45)',
    tracking: 1.4,
  })
}

/* A tiny exported map keeps the render index declarative. */
export const PRINT_PAINTERS = {
  ticket: paintTicket,
  magazine: paintMagazine,
  idcard: paintIdCard,
  passport: paintPassport,
  passportId: paintPassportId,
  comic: paintComic,
  wanted: paintWanted,
  newspaper: paintNewspaper,
  yearbook: paintYearbook,
  riso: paintRiso,
  boarding: paintBoarding,
  cinema: paintCinema,
  receipt: paintReceipt,
  thr: paintThr,
  postcard: paintPostcard,
  artwork: paintArtwork,
  gamebox: paintGameBox,
  cassetteBox: paintCassetteBox,
  gamecart: paintGameCart,
  vandals: paintVandals,
}
