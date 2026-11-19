import {
  barcode,
  circlePath,
  drawText,
  fillRound,
  FONT,
  formatDate,
  gloss,
  grainDots,
  halftone,
  holo,
  linear,
  photo,
  radial,
  roundPath,
  scanlines,
  seeded,
  sparkle,
  sprocketHoles,
  strokeRound,
  vignette,
  type PhotoBitmap,
  type Scene,
} from '../art'

/* ------------------------------------------------------------------ */
/* 04 · Instant polaroid                                               */
/* ------------------------------------------------------------------ */

export function paintPolaroid({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 34
  ctx.shadowOffsetY = 14
  ctx.fillStyle = '#fbf7ee'
  roundPath(ctx, 10, 10, w - 20, h - 20, 8)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = linear(ctx, 10, 10, 10, h - 10, [
    [0, '#fffdf8'],
    [0.68, '#f7f1e4'],
    [1, '#eae0cc'],
  ])
  roundPath(ctx, 10, 10, w - 20, h - 20, 8)
  ctx.fill()
  grainDots(ctx, 14, 14, w - 28, h - 28, 5, 'rgba(90, 70, 40, 0.08)', 0.5)

  photo(ctx, photos[0], 58, 58, w - 116, 658, {
    radius: 2,
    label: 'PHOTO 1',
    tone: 'warm',
    seed: 13,
  })
  strokeRound(ctx, 58, 58, w - 116, 658, 2, 'rgba(90, 70, 40, 0.18)', 1.5)

  // Tape across the top edge, barely there.
  ctx.save()
  ctx.translate(w / 2, 36)
  ctx.rotate(-0.035)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.32)'
  ctx.fillRect(-96, -18, 192, 42)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 1
  ctx.strokeRect(-96, -18, 192, 42)
  ctx.restore()

  if (caption) {
    drawText(ctx, caption, 78, 862, {
      size: 52,
      family: FONT.script,
      color: '#3d3226',
      style: 'italic',
      maxWidth: 640,
    })
  } else {
    drawText(ctx, 'a day that', 78, 832, {
      size: 64,
      family: FONT.script,
      color: '#3d3226',
      style: 'italic',
    })
    drawText(ctx, 'turned out fine', 82, 898, {
      size: 52,
      family: FONT.script,
      color: '#3d3226',
      style: 'italic',
    })
  }
  drawText(ctx, '♥', w - 96, 872, {
    size: 52,
    family: FONT.sans,
    color: '#c0603f',
    align: 'right',
  })
  ctx.strokeStyle = 'rgba(192, 96, 63, 0.6)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(84, 922)
  ctx.quadraticCurveTo(230, 936, 380, 918)
  ctx.stroke()

  drawText(ctx, formatDate(date, 'dotted'), 82, 960, {
    size: 19,
    weight: 600,
    family: FONT.mono,
    color: '#8a7c66',
    tracking: 2,
  })
  drawText(ctx, 'POLAROID 600 · ISO 640', w - 82, 960, {
    size: 11,
    family: FONT.mono,
    color: '#a99b85',
    align: 'right',
    tracking: 1.5,
  })

  // Faint coffee ring, just enough to feel used.
  ctx.save()
  ctx.strokeStyle = 'rgba(120, 80, 40, 0.08)'
  ctx.lineWidth = 9
  ctx.beginPath()
  ctx.arc(w - 150, 742, 54, 0.4, Math.PI * 1.7)
  ctx.stroke()
  ctx.restore()

  gloss(ctx, 10, 10, w - 20, h - 20, { opacity: 0.18, radius: 8, angle: -0.5 })
  holo(ctx, 10, 10, w - 20, h - 20, { opacity: 0.08, seed: 4, sparkles: 5 })
}

/* ------------------------------------------------------------------ */
/* 05 · 35mm film strip                                                */
/* ------------------------------------------------------------------ */

export function paintFilm({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = '#0c0c0d'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#151516'],
    [0.5, '#0b0b0c'],
    [1, '#171718'],
  ])
  ctx.fillRect(0, 0, w, h)

  sprocketHoles(ctx, 18, 40, h - 78, 28, 34, 24, '#28282a')
  sprocketHoles(ctx, w - 46, 40, h - 78, 28, 34, 24, '#28282a')

  drawText(ctx, '35MM · PHOTO 400', 66, 68, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#d9d2c4',
    tracking: 2.5,
  })
  drawText(ctx, '36 EXP', w - 66, 68, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#d9d2c4',
    align: 'right',
    tracking: 2.5,
  })

  const frame = (
    y: number,
    image: PhotoBitmap | null,
    number: string,
    label: string,
  ) => {
    ctx.save()
    ctx.fillStyle = '#1b1b1c'
    ctx.fillRect(60, y - 6, 640, 482)
    ctx.restore()
    photo(ctx, image, 66, y, 628, 470, {
      label,
      tone: 'warm',
      placeholderBg: '#2a2723',
      placeholderInk: '#efe6d4',
      seed: number.charCodeAt(1),
    })
    ctx.save()
    ctx.fillStyle = 'rgba(8, 8, 8, 0.55)'
    ctx.fillRect(74, y + 12, 46, 26)
    ctx.restore()
    drawText(ctx, number, 84, y + 32, {
      size: 15,
      weight: 700,
      family: FONT.mono,
      color: '#ffb347',
      tracking: 1.5,
    })
    drawText(ctx, "19 11 '26", 678, y + 456, {
      size: 13,
      family: FONT.mono,
      color: '#ffb347',
      align: 'right',
      tracking: 1.5,
    })
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(66, y, 628, 470)
  }

  frame(92, photos[0], '12A', 'PHOTO 1')
  frame(600, photos[1], '13A', 'PHOTO 2')

  drawText(ctx, 'PHOTO 400 · 36 EXP · PROCESS C-41', w / 2, 588, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#8a8377',
    align: 'center',
    tracking: 2,
  })

  // Lab sticker.
  ctx.save()
  ctx.translate(w / 2, 1112)
  ctx.rotate(-0.012)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 4
  fillRound(ctx, -192, -38, 384, 76, 3, '#efe6d2')
  ctx.shadowColor = 'transparent'
  drawText(ctx, 'PHOTO LAB · BOOTH 06', -172, -12, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#3a3128',
    tracking: 2,
  })
  drawText(ctx, caption || 'ONE SHOT · FOREVER', -172, 20, {
    size: 15,
    weight: 700,
    family: FONT.sans,
    color: '#3a3128',
    tracking: 0.5,
    maxWidth: 240,
  })
  barcode(ctx, 92, -14, 78, 28, 12, '#3a3128')
  ctx.restore()

  gloss(ctx, 0, 0, w, h, { opacity: 0.14, angle: -0.62 })
  holo(ctx, 66, 92, 628, 470, { opacity: 0.1, seed: 8, sparkles: 5 })
  holo(ctx, 66, 600, 628, 470, { opacity: 0.1, seed: 9, sparkles: 5 })
}

/* ------------------------------------------------------------------ */
/* 12 · Cassette mixtape                                               */
/* ------------------------------------------------------------------ */

export function paintCassette({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#46362c'],
    [0.45, '#2a201b'],
    [1, '#160f0d'],
  ])
  roundPath(ctx, 0, 0, w, h, 26)
  ctx.fill()
  strokeRound(ctx, 10, 10, w - 20, h - 20, 20, 'rgba(255, 230, 200, 0.16)', 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.fillRect(24, 210, w - 48, 3)

  // Track list window.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 6
  fillRound(ctx, 64, 56, w - 128, 290, 4, '#f2e7cf')
  ctx.restore()
  grainDots(ctx, 64, 56, w - 128, 290, 31, 'rgba(90, 60, 30, 0.12)', 0.5)

  photo(ctx, photos[0], 88, 88, 180, 180, {
    label: 'PHOTO 1',
    tone: 'sepia',
    radius: 2,
    seed: 17,
  })
  photo(ctx, photos[1], 288, 88, 180, 180, {
    label: 'PHOTO 2',
    tone: 'sepia',
    radius: 2,
    seed: 18,
  })
  ctx.strokeStyle = 'rgba(70, 50, 30, 0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(88, 88, 180, 180)
  ctx.strokeRect(288, 88, 180, 180)

  drawText(ctx, 'MIXTAPE', 500, 122, {
    size: 48,
    weight: 400,
    family: FONT.display,
    color: '#33261c',
    tracking: 1,
  })
  drawText(ctx, 'SIDE A · NO. 06 · 2026', 502, 150, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#8a6d4c',
    tracking: 2,
  })
  const tracks = ['A1  YOU', 'A2  US', 'B1  FOREVER']
  tracks.forEach((track, index) => {
    drawText(ctx, track, 502, 194 + index * 32, {
      size: 20,
      weight: 600,
      family: FONT.mono,
      color: '#3e2f22',
      tracking: 0.5,
    })
    for (let bar = 0; bar < 4; bar += 1) {
      ctx.fillStyle = 'rgba(90, 65, 40, 0.45)'
      ctx.fillRect(690 + bar * 9, 182 + index * 32 - bar * 2, 4, 10 + bar * 3)
    }
  })
  drawText(ctx, 'RECORDED AT PHOTO BOOTH', 502, 306, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#9a8164',
    tracking: 1.8,
  })
  drawText(ctx, caption || 'for you ♥', 88, 326, {
    size: 27,
    family: FONT.script,
    color: '#4a3624',
    style: 'italic',
    maxWidth: 300,
  })

  // Clear window and reels.
  fillRound(ctx, 226, 384, 488, 202, 26, 'rgba(18, 12, 9, 0.55)')
  ctx.strokeStyle = 'rgba(255, 230, 200, 0.12)'
  ctx.lineWidth = 2
  roundPath(ctx, 226, 384, 488, 202, 26)
  ctx.stroke()

  const reel = (cx: number, cy: number, radius: number) => {
    ctx.save()
    ctx.fillStyle = '#100c0a'
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 220, 190, 0.18)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#241a15'
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 0.66, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#d8c8ae'
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#3a2b22'
    for (let spoke = 0; spoke < 6; spoke += 1) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((spoke / 6) * Math.PI * 2)
      ctx.fillRect(radius * 0.18, -4, radius * 0.46, 8)
      ctx.restore()
    }
    ctx.fillStyle = '#160f0c'
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 0.08, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  ctx.fillStyle = '#100c0a'
  ctx.fillRect(330, 478, 280, 16)
  reel(330, 486, 94)
  reel(610, 486, 94)

  const screw = (cx: number, cy: number) => {
    ctx.save()
    ctx.fillStyle = '#7a6553'
    ctx.beginPath()
    ctx.arc(cx, cy, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#2b201a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx - 5, cy)
    ctx.lineTo(cx + 5, cy)
    ctx.stroke()
    ctx.restore()
  }
  screw(42, 42)
  screw(w - 42, 42)
  screw(42, h - 44)
  screw(w - 42, h - 44)

  drawText(ctx, 'C-60 · LOW NOISE · TYPE II', 66, 608, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#c2af95',
    tracking: 2,
  })
  drawText(ctx, 'IHSNN', w - 66, 608, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#c2af95',
    align: 'right',
    tracking: 3,
  })

  gloss(ctx, 0, 0, w, h, { opacity: 0.22, radius: 26, angle: -0.6 })
  holo(ctx, 0, 0, w, h, { opacity: 0.14, seed: 13, sparkles: 8 })
}

/* ------------------------------------------------------------------ */
/* 13 · 3.5" floppy disk                                               */
/* ------------------------------------------------------------------ */

export function paintFloppy({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#2b3a78'],
    [0.52, '#1e2a5e'],
    [1, '#141c40'],
  ])
  roundPath(ctx, 0, 0, w, h, 22)
  ctx.fill()
  strokeRound(ctx, 8, 8, w - 16, h - 16, 18, 'rgba(160, 190, 255, 0.22)', 2)
  grainDots(ctx, 0, 0, w, h, 19, 'rgba(255, 255, 255, 0.06)', 0.5)

  // Cut corner.
  ctx.save()
  ctx.fillStyle = 'rgba(8, 12, 30, 0.55)'
  ctx.beginPath()
  ctx.moveTo(700, 0)
  ctx.lineTo(w, 0)
  ctx.lineTo(w, 120)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Metal shutter.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 4
  ctx.fillStyle = linear(ctx, 296, 26, 296, 176, [
    [0, '#d7dbe2'],
    [0.35, '#9aa1ad'],
    [0.6, '#c3c9d2'],
    [1, '#7b828e'],
  ])
  roundPath(ctx, 296, 26, 308, 150, 5)
  ctx.fill()
  ctx.restore()
  ctx.fillStyle = '#1b2445'
  roundPath(ctx, 378, 54, 104, 94, 3)
  ctx.fill()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.fillRect(296, 140, 308, 12)
  ctx.fillStyle = '#cfd4dc'
  roundPath(ctx, 640, 58, 54, 26, 4)
  ctx.fill()
  ctx.fillStyle = '#7b828e'
  ctx.fillRect(654, 64, 26, 14)
  ctx.fillStyle = '#aeb4be'
  ctx.fillRect(316, 38, 268, 3)

  // Paper label.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
  ctx.shadowBlur = 16
  ctx.shadowOffsetY = 6
  fillRound(ctx, 120, 228, 660, 480, 4, '#f4eedd')
  ctx.restore()
  grainDots(ctx, 120, 228, 660, 480, 41, 'rgba(90, 70, 40, 0.1)', 0.5)
  ctx.fillStyle = '#1e2a5e'
  ctx.fillRect(120, 228, 660, 16)

  photo(ctx, photos[0], 150, 274, 300, 300, {
    label: 'PHOTO 1',
    tone: 'fade',
    radius: 2,
    seed: 21,
  })
  ctx.strokeStyle = 'rgba(30, 42, 94, 0.4)'
  ctx.lineWidth = 2
  ctx.strokeRect(150, 274, 300, 300)

  drawText(ctx, 'PHOTO DISK', 486, 306, {
    size: 39,
    weight: 400,
    family: FONT.display,
    color: '#1e2a5e',
    tracking: 1,
  })
  drawText(ctx, '1.44 MB', 486, 372, {
    size: 60,
    weight: 900,
    family: FONT.sans,
    color: '#1e2a5e',
    tracking: -1,
  })
  drawText(ctx, 'DOUBLE SIDED · HIGH DENSITY', 488, 400, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#6a6a60',
    tracking: 1.5,
  })
  ctx.strokeStyle = 'rgba(30, 42, 94, 0.28)'
  ctx.lineWidth = 1
  for (let line = 0; line < 3; line += 1) {
    ctx.beginPath()
    ctx.moveTo(488, 436 + line * 24)
    ctx.lineTo(748, 436 + line * 24)
    ctx.stroke()
  }

  drawText(ctx, caption || 'our photo ♥', 150, 646, {
    size: 38,
    family: FONT.script,
    color: '#1e2a5e',
    style: 'italic',
    maxWidth: 290,
  })
  drawText(ctx, '19.11.26 · SIDE A', 152, 686, {
    size: 14,
    weight: 700,
    family: FONT.mono,
    color: '#6a6a60',
    tracking: 1.5,
  })
  barcode(ctx, 496, 610, 246, 54, 14, '#1e2a5e')

  drawText(ctx, '3.5" MICRODISK · 1.44 MB', w / 2, 802, {
    size: 20,
    weight: 800,
    family: FONT.mono,
    color: 'rgba(210, 225, 255, 0.28)',
    align: 'center',
    tracking: 4,
  })
  ctx.fillStyle = 'rgba(210, 225, 255, 0.12)'
  ctx.fillRect(360, 784, 24, 4)
  ctx.fillRect(516, 784, 24, 4)

  gloss(ctx, 0, 0, w, h, { opacity: 0.22, radius: 22, angle: -0.58 })
  holo(ctx, 120, 228, 660, 480, { opacity: 0.08, seed: 31, sparkles: 5 })
}

/* ------------------------------------------------------------------ */
/* 11 · Photo Boy DMG console                                          */
/* ------------------------------------------------------------------ */

export function paintDmg({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#d8d4c6'],
    [0.5, '#c9c5b6'],
    [1, '#b3ae9f'],
  ])
  roundPath(ctx, 18, 18, w - 36, h - 36, 46)
  ctx.fill()
  strokeRound(ctx, 18, 18, w - 36, h - 36, 46, 'rgba(255, 255, 255, 0.45)', 2)
  grainDots(ctx, 18, 18, w - 36, h - 36, 11, 'rgba(0, 0, 0, 0.05)', 0.55)

  drawText(ctx, 'PHOTO BOY', 74, 104, {
    size: 38,
    weight: 900,
    family: FONT.sans,
    color: '#3c3a6b',
    tracking: 1.5,
  })
  drawText(ctx, 'DOT MATRIX WITH STEREO SOUND', 76, 130, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#6a675c',
    tracking: 2.2,
  })
  ctx.fillStyle = '#8b3a62'
  ctx.fillRect(74, 140, 110, 4)

  // Screen bezel.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 6
  fillRound(ctx, 78, 172, w - 156, 470, 28, '#4a4c53')
  ctx.restore()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  roundPath(ctx, 84, 178, w - 168, 454, 24)
  ctx.fill()
  ctx.strokeStyle = 'rgba(20, 20, 24, 0.4)'
  ctx.lineWidth = 2
  roundPath(ctx, 84, 178, w - 168, 454, 24)
  ctx.stroke()

  // LCD.
  fillRound(ctx, 120, 214, 620, 370, 8, '#8bac0f')
  ctx.fillStyle = '#9bbc0f'
  ctx.fillRect(126, 220, 608, 358)
  drawText(ctx, 'PHOTO BOY', 138, 238, {
    size: 11,
    weight: 700,
    family: FONT.pixel,
    color: '#2f3b0a',
    tracking: 1,
  })
  drawText(ctx, '2 SHOTS', 726, 238, {
    size: 11,
    weight: 700,
    family: FONT.pixel,
    color: '#2f3b0a',
    align: 'right',
    tracking: 1,
  })

  photo(ctx, photos[0], 142, 252, 280, 286, {
    label: 'PHOTO 1',
    tone: 'warm',
    radius: 2,
    placeholderBg: '#5d6f0c',
    placeholderInk: '#dfe8a8',
    seed: 23,
  })
  photo(ctx, photos[1], 438, 252, 280, 286, {
    label: 'PHOTO 2',
    tone: 'warm',
    radius: 2,
    placeholderBg: '#5d6f0c',
    placeholderInk: '#dfe8a8',
    seed: 24,
  })

  // LCD pixel grid and gloss.
  ctx.save()
  ctx.strokeStyle = 'rgba(30, 45, 5, 0.12)'
  ctx.lineWidth = 1
  for (let gx = 142; gx <= 718; gx += 8) {
    ctx.beginPath()
    ctx.moveTo(gx, 252)
    ctx.lineTo(gx, 538)
    ctx.stroke()
  }
  for (let gy = 252; gy <= 538; gy += 8) {
    ctx.beginPath()
    ctx.moveTo(142, gy)
    ctx.lineTo(718, gy)
    ctx.stroke()
  }
  ctx.restore()
  ctx.fillStyle = 'rgba(30, 45, 5, 0.18)'
  ctx.fillRect(142, 542, 576, 1)

  drawText(ctx, 'BATTERY', 138, 568, {
    size: 9,
    weight: 700,
    family: FONT.pixel,
    color: '#2f3b0a',
  })
  ctx.fillStyle = '#e3350d'
  ctx.beginPath()
  ctx.arc(222, 564, 5, 0, Math.PI * 2)
  ctx.fill()

  // D-pad.
  const dpadX = 250
  const dpadY = 760
  ctx.save()
  ctx.fillStyle = '#34363c'
  fillRound(ctx, dpadX - 66, dpadY - 19, 132, 38, 6, '#34363c')
  fillRound(ctx, dpadX - 19, dpadY - 66, 38, 132, 6, '#34363c')
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)'
  ctx.fillRect(dpadX - 58, dpadY - 15, 116, 3)
  ctx.fillRect(dpadX - 15, dpadY - 58, 3, 116)
  ctx.fillStyle = '#26282d'
  ctx.beginPath()
  ctx.moveTo(dpadX, dpadY - 40)
  ctx.lineTo(dpadX - 9, dpadY - 26)
  ctx.lineTo(dpadX + 9, dpadY - 26)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(dpadX, dpadY + 40)
  ctx.lineTo(dpadX - 9, dpadY + 26)
  ctx.lineTo(dpadX + 9, dpadY + 26)
  ctx.fill()
  ctx.restore()
  drawText(ctx, 'SELECT', 400, 796, {
    size: 10,
    weight: 700,
    family: FONT.sans,
    color: '#6a675c',
    align: 'center',
    tracking: 2,
  })
  drawText(ctx, 'START', 514, 796, {
    size: 10,
    weight: 700,
    family: FONT.sans,
    color: '#6a675c',
    align: 'center',
    tracking: 2,
  })
  ctx.save()
  ctx.translate(400, 820)
  ctx.rotate(-0.32)
  fillRound(ctx, -34, -9, 68, 18, 9, '#6f6d66')
  ctx.restore()
  ctx.save()
  ctx.translate(514, 820)
  ctx.rotate(-0.32)
  fillRound(ctx, -34, -9, 68, 18, 9, '#6f6d66')
  ctx.restore()

  // A / B buttons.
  const button = (cx: number, cy: number, letter: string) => {
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
    ctx.beginPath()
    ctx.ellipse(cx + 3, cy + 6, 43, 43, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#8b3a62'
    ctx.beginPath()
    ctx.arc(cx, cy, 43, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
    ctx.beginPath()
    ctx.ellipse(cx - 9, cy - 13, 24, 17, -0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    drawText(ctx, letter, cx, cy + 58, {
      size: 16,
      weight: 700,
      family: FONT.sans,
      color: '#6a675c',
      align: 'center',
    })
  }
  button(620, 748, 'B')
  button(714, 712, 'A')

  // Speaker grille.
  ctx.save()
  ctx.translate(668, 928)
  ctx.rotate(-0.62)
  ctx.fillStyle = 'rgba(60, 58, 50, 0.5)'
  for (let i = 0; i < 6; i += 1) {
    fillRound(ctx, 0, i * 20, 118, 7, 4, 'rgba(60, 58, 50, 0.45)')
  }
  ctx.restore()

  drawText(ctx, caption || 'IHSNN · MODEL PB-06', 62, 1072, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#6a675c',
    tracking: 2,
    maxWidth: 300,
  })
  drawText(ctx, 'BATTERY · 4×AA', w - 62, 1072, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: '#6a675c',
    align: 'right',
    tracking: 2,
  })

  // Screws.
  const screw = (cx: number, cy: number) => {
    ctx.save()
    ctx.fillStyle = '#9b9689'
    ctx.beginPath()
    ctx.arc(cx, cy, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#757062'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - 4, cy)
    ctx.lineTo(cx + 4, cy)
    ctx.stroke()
    ctx.restore()
  }
  screw(50, 50)
  screw(w - 50, 50)
  screw(50, h - 50)
  screw(w - 50, h - 50)

  gloss(ctx, 18, 18, w - 36, h - 36, { opacity: 0.24, radius: 46, angle: -0.55 })
  holo(ctx, 78, 172, w - 156, 470, { opacity: 0.07, seed: 26, sparkles: 4 })
}

/* ------------------------------------------------------------------ */
/* 20 · VHS sleeve                                                     */
/* ------------------------------------------------------------------ */

export function paintVhs({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = '#0b0b0e'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#17171d'],
    [0.5, '#0a0a0d'],
    [1, '#141419'],
  ])
  ctx.fillRect(0, 0, w, h)

  const rainbow = ['#ff2d55', '#ff8a3d', '#ffd23d', '#6ee7a8', '#34c9ef', '#8f6bff']
  rainbow.forEach((color, index) => {
    ctx.fillStyle = color
    ctx.fillRect(0, index * 10, w, 10)
  })
  ctx.fillStyle = '#f4f4f4'
  ctx.fillRect(0, 60, w, 2)

  drawText(ctx, 'IHSNN HOME VIDEO', 48, 98, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#cfcfd6',
    tracking: 3,
  })
  drawText(ctx, 'REC ●', w - 48, 98, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#ff2d55',
    align: 'right',
    tracking: 2,
  })

  drawText(ctx, 'PHOTO', 46, 248, {
    size: 134,
    weight: 400,
    family: FONT.display,
    color: '#ffffff',
    tracking: 2,
  })
  drawText(ctx, 'VIDEO', 46, 366, {
    size: 134,
    weight: 400,
    family: FONT.display,
    color: '#0b0b0e',
    stroke: '#ffffff',
    lineWidth: 3,
    tracking: 2,
  })
  drawText(ctx, 'THE ORIGINAL HOME MOVIE', 50, 404, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#a3a3ad',
    tracking: 3,
  })
  drawText(ctx, '00:00:06', w - 48, 404, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#22d3ee',
    align: 'right',
    tracking: 2,
  })

  photo(ctx, photos[0], 48, 436, w - 96, 470, {
    label: 'PHOTO 1',
    tone: 'warm',
    radius: 2,
    seed: 27,
  })
  scanlines(ctx, 48, 436, w - 96, 470, 4, 'rgba(0, 0, 0, 0.18)')
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.fillRect(48, 560, w - 96, 6)
  ctx.fillRect(48, 742, w - 96, 3)
  ctx.fillStyle = 'rgba(255, 45, 85, 0.16)'
  ctx.fillRect(48, 436, 8, 470)
  ctx.fillStyle = 'rgba(34, 211, 238, 0.16)'
  ctx.fillRect(w - 56, 436, 8, 470)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(48, 436, w - 96, 470)
  vignette(ctx, 48, 436, w - 96, 470, '#000000', 0.3)

  // Hand-written label sticker.
  ctx.save()
  ctx.translate(64, 872)
  ctx.rotate(-0.035)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 6
  fillRound(ctx, 0, 0, 424, 194, 4, '#f0e5cd')
  ctx.restore()
  ctx.save()
  ctx.translate(64, 872)
  ctx.rotate(-0.035)
  grainDots(ctx, 0, 0, 424, 194, 33, 'rgba(90, 70, 40, 0.12)', 0.6)
  drawText(ctx, 'HOME MOVIE · SP', 24, 34, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#6d5a3a',
    tracking: 2,
  })
  drawText(ctx, caption || 'you & me', 24, 100, {
    size: 46,
    family: FONT.script,
    color: '#332619',
    style: 'italic',
    maxWidth: 340,
  })
  drawText(ctx, '1987 · 120 MIN · HI-FI', 24, 150, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#6d5a3a',
    tracking: 1.5,
  })
  drawText(ctx, '♥', 382, 148, {
    size: 30,
    family: FONT.sans,
    color: '#b03030',
    align: 'right',
  })
  ctx.restore()

  drawText(ctx, 'PLAY ▶', w - 56, 946, {
    size: 38,
    weight: 700,
    family: FONT.mono,
    color: '#ffffff',
    align: 'right',
    tracking: 2,
  })
  fillRound(ctx, w - 130, 974, 74, 36, 4, 'rgba(255, 255, 255, 0.1)')
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 1
  strokeRound(ctx, w - 130, 974, 74, 36, 4, 'rgba(255, 255, 255, 0.5)', 1)
  drawText(ctx, 'SP', w - 93, 998, {
    size: 16,
    weight: 700,
    family: FONT.mono,
    color: '#ffffff',
    align: 'center',
    tracking: 1,
  })

  drawText(ctx, 'IHSNN VIDEO', 48, 1116, {
    size: 14,
    weight: 700,
    family: FONT.mono,
    color: '#cfcfd6',
    tracking: 3,
  })
  drawText(ctx, 'ONE SHOT, FOREVER', 48, 1142, {
    size: 11,
    family: FONT.mono,
    color: '#7b7b86',
    tracking: 2,
  })
  barcode(ctx, w - 214, 1100, 166, 48, 17, '#e9e9ee')
  drawText(ctx, '©1987 PHOTO BOOTH', w - 48, 1170, {
    size: 10,
    family: FONT.mono,
    color: '#7b7b86',
    align: 'right',
    tracking: 2,
  })

  gloss(ctx, 0, 0, w, h, { opacity: 0.16, angle: -0.6 })
  holo(ctx, 0, 60, w, 900, { opacity: 0.08, seed: 29, sparkles: 6 })
}

/* ------------------------------------------------------------------ */
/* 21 · Arcade high-score screen                                       */
/* ------------------------------------------------------------------ */

export function paintArcade({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [
    [0, '#0a1526'],
    [0.55, '#081120'],
    [1, '#050a13'],
  ])
  ctx.fillRect(0, 0, w, h)

  // Neon grid floor.
  ctx.save()
  ctx.strokeStyle = 'rgba(94, 230, 200, 0.14)'
  ctx.lineWidth = 1.5
  for (let i = 0; i < 9; i += 1) {
    const y = 1000 + i * i * 2.4
    if (y > h) break
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
  for (let i = -7; i <= 7; i += 1) {
    ctx.beginPath()
    ctx.moveTo(w / 2 + i * 20, 990)
    ctx.lineTo(w / 2 + i * 150, h)
    ctx.stroke()
  }
  ctx.restore()

  strokeRound(ctx, 16, 16, w - 32, h - 32, 26, 'rgba(94, 230, 200, 0.28)', 2)
  strokeRound(ctx, 26, 26, w - 52, h - 52, 20, 'rgba(255, 77, 157, 0.18)', 1)

  drawText(ctx, 'PHOTO BOOTH ARCADE · MODEL PB-06', w / 2, 56, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#6f8aa8',
    align: 'center',
    tracking: 3,
  })

  drawText(ctx, 'HIGH SCORE', w / 2, 116, {
    size: 42,
    weight: 400,
    family: FONT.pixel,
    color: '#5ee6c8',
    align: 'center',
    shadow: { color: 'rgba(94, 230, 200, 0.8)', blur: 24 },
  })
  ctx.fillStyle = 'rgba(94, 230, 200, 0.5)'
  ctx.fillRect(w / 2 - 150, 138, 300, 2)

  drawText(ctx, '1UP', 56, 184, {
    size: 15,
    weight: 400,
    family: FONT.pixel,
    color: '#ffd23d',
  })
  drawText(ctx, '099200', 56, 218, {
    size: 22,
    weight: 400,
    family: FONT.pixel,
    color: '#ffffff',
    tracking: 1,
  })
  drawText(ctx, 'HI-SCORE', w - 56, 184, {
    size: 15,
    weight: 400,
    family: FONT.pixel,
    color: '#ff4d9d',
    align: 'right',
  })
  drawText(ctx, '099200', w - 56, 218, {
    size: 22,
    weight: 400,
    family: FONT.pixel,
    color: '#ffffff',
    align: 'right',
    tracking: 1,
  })

  const screen = (
    x: number,
    y: number,
    sw: number,
    sh: number,
    image: PhotoBitmap | null,
    label: string,
  ) => {
    ctx.save()
    ctx.shadowColor = 'rgba(94, 230, 200, 0.25)'
    ctx.shadowBlur = 22
    fillRound(ctx, x - 14, y - 14, sw + 28, sh + 28, 20, '#0d1a2b')
    ctx.restore()
    strokeRound(ctx, x - 14, y - 14, sw + 28, sh + 28, 20, 'rgba(94, 230, 200, 0.35)', 2)
    photo(ctx, image, x, y, sw, sh, {
      label,
      tone: 'fade',
      radius: 12,
      placeholderBg: '#132b33',
      placeholderInk: '#bff5e8',
      seed: label.length * 5,
    })
    ctx.save()
    roundPath(ctx, x, y, sw, sh, 12)
    ctx.clip()
    scanlines(ctx, x, y, sw, sh, 5, 'rgba(0, 0, 0, 0.28)')
    ctx.fillStyle = 'rgba(94, 230, 200, 0.08)'
    ctx.fillRect(x, y, sw, sh)
    ctx.restore()
    drawText(ctx, label, x + sw / 2, y - 24, {
      size: 11,
      weight: 400,
      family: FONT.pixel,
      color: '#5ee6c8',
      align: 'center',
      tracking: 1,
    })
    drawText(ctx, 'READY', x + sw - 16, y + 26, {
      size: 8,
      weight: 400,
      family: FONT.pixel,
      color: '#ffd23d',
      align: 'right',
    })
  }

  screen(54, 274, 366, 420, photos[0], 'PLAYER 1')
  screen(460, 274, 366, 420, photos[1], 'PLAYER 2')

  // Pixel hearts.
  const heart = (x: number, y: number, size: number, color: string) => {
    ctx.save()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x, y + size * 0.3)
    ctx.bezierCurveTo(x, y - size * 0.15, x - size * 0.6, y - size * 0.15, x - size * 0.6, y + size * 0.25)
    ctx.bezierCurveTo(x - size * 0.6, y + size * 0.65, x, y + size * 0.95, x, y + size * 1.15)
    ctx.bezierCurveTo(x, y + size * 0.95, x + size * 0.6, y + size * 0.65, x + size * 0.6, y + size * 0.25)
    ctx.bezierCurveTo(x + size * 0.6, y - size * 0.15, x, y - size * 0.15, x, y + size * 0.3)
    ctx.fill()
    ctx.restore()
  }
  for (let i = 0; i < 3; i += 1) heart(66 + i * 34, 748, 16, '#ff4d9d')
  drawText(ctx, 'INSERT COIN', w / 2, 792, {
    size: 18,
    weight: 400,
    family: FONT.pixel,
    color: '#ffd23d',
    align: 'center',
    shadow: { color: 'rgba(255, 210, 61, 0.7)', blur: 14 },
  })
  drawText(ctx, 'PRESS START · BIARKAN SMILEMU BEKERJA', w / 2, 826, {
    size: 9,
    weight: 400,
    family: FONT.pixel,
    color: '#9fb4c9',
    align: 'center',
  })

  // Leaderboard.
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(54, 870, w - 108, 240)
  ctx.strokeStyle = 'rgba(94, 230, 200, 0.16)'
  ctx.lineWidth = 1
  ctx.strokeRect(54, 870, w - 108, 240)
  ctx.restore()
  drawText(ctx, 'RANKING', 76, 900, {
    size: 10,
    weight: 400,
    family: FONT.pixel,
    color: '#5ee6c8',
    tracking: 1,
  })
  drawText(ctx, 'CREDIT 01', w - 76, 900, {
    size: 10,
    weight: 400,
    family: FONT.pixel,
    color: '#ffd23d',
    align: 'right',
    tracking: 1,
  })
  const scores = [
    ['1ST', 'YOU', '099200'],
    ['2ND', 'SMILE', '045600'],
    ['3RD', 'US', '006600'],
  ]
  scores.forEach(([rank, name, score], index) => {
    const y = 944 + index * 42
    drawText(ctx, rank, 76, y, {
      size: 12,
      weight: 400,
      family: FONT.pixel,
      color: index === 0 ? '#ff4d9d' : '#9fb4c9',
    })
    drawText(ctx, name, 160, y, {
      size: 12,
      weight: 400,
      family: FONT.pixel,
      color: '#ffffff',
    })
    drawText(ctx, score, w - 76, y, {
      size: 12,
      weight: 400,
      family: FONT.pixel,
      color: index === 0 ? '#ffd23d' : '#9fb4c9',
      align: 'right',
    })
  })

  drawText(ctx, caption || '25¢ · ONE SHOT · ONCE IN A LIFETIME', w / 2, 1152, {
    size: 10,
    weight: 400,
    family: FONT.pixel,
    color: '#6f8aa8',
    align: 'center',
    maxWidth: 700,
  })

  scanlines(ctx, 16, 16, w - 32, h - 32, 6, 'rgba(0, 0, 0, 0.16)')
  vignette(ctx, 0, 0, w, h, '#000000', 0.5)
  holo(ctx, 0, 0, w, h, { opacity: 0.14, seed: 36, sparkles: 10 })
  gloss(ctx, 0, 0, w, h, { opacity: 0.1 })
}

/* ------------------------------------------------------------------ */
/* 28 · 90s studio                                                     */
/* ------------------------------------------------------------------ */

export function paintStudio({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [
    [0, '#8ba6c8'],
    [0.55, '#6a86ad'],
    [1, '#40567c'],
  ])
  ctx.fillRect(0, 0, w, h)
  const random = seeded(14)
  for (let cloud = 0; cloud < 7; cloud += 1) {
    const x = random() * w
    const y = 60 + random() * (h * 0.6)
    const radius = 90 + random() * 160
    ctx.fillStyle = radial(ctx, x, y, 0, x, y, radius, [
      [0, 'rgba(238, 244, 255, 0.2)'],
      [1, 'rgba(238, 244, 255, 0)'],
    ])
    ctx.beginPath()
    ctx.ellipse(x, y, radius, radius * 0.62, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Gold frame.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 10
  fillRound(ctx, 22, 22, w - 44, h - 44, 4, '#b8913f')
  ctx.restore()
  ctx.fillStyle = linear(ctx, 22, 22, w - 22, h - 22, [
    [0, '#d8b768'],
    [0.3, '#f2dfa6'],
    [0.52, '#a9812f'],
    [0.78, '#e6c47c'],
    [1, '#8a6526'],
  ])
  ctx.fillRect(22, 22, w - 44, h - 44)
  ctx.fillStyle = '#f3ecdc'
  ctx.fillRect(54, 54, w - 108, h - 108)
  ctx.strokeStyle = 'rgba(70, 55, 25, 0.4)'
  ctx.lineWidth = 2
  ctx.strokeRect(44, 44, w - 88, h - 88)

  photo(ctx, photos[0], 66, 66, w - 132, 736, {
    label: 'PHOTO 1',
    tone: 'warm',
    seed: 121,
    placeholderBg: '#9fb0c4',
    placeholderInk: '#26374f',
    grain: true,
  })
  strokeRound(ctx, 66, 66, w - 132, 736, 0, 'rgba(80, 60, 25, 0.35)', 1.5)

  // Corner ornaments.
  ctx.save()
  ctx.strokeStyle = 'rgba(120, 88, 30, 0.65)'
  ctx.lineWidth = 3
  for (const [cx, cy, sx, sy] of [
    [54, 54, 1, 1],
    [w - 54, 54, -1, 1],
    [54, h - 54, 1, -1],
    [w - 54, h - 54, -1, -1],
  ] as const) {
    ctx.beginPath()
    ctx.moveTo(cx + sx * 34, cy)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx, cy + sy * 34)
    ctx.stroke()
  }
  ctx.restore()

  drawText(ctx, 'THE MEMORY STUDIO', w / 2, 848, {
    size: 34,
    family: FONT.serif,
    color: '#3c3226',
    align: 'center',
    tracking: 2,
  })
  drawText(ctx, 'PORTRAIT · SIX LIGHTS · SOFT FOCUS', w / 2, 872, {
    size: 9,
    family: FONT.mono,
    color: '#8b7c62',
    align: 'center',
    tracking: 2.2,
  })
  drawText(ctx, formatDate(date, 'numeric'), w / 2, 902, {
    size: 28,
    weight: 700,
    family: FONT.mono,
    color: '#ff8a1e',
    align: 'center',
    tracking: 4,
    shadow: { color: 'rgba(120, 60, 0, 0.35)', blur: 4, x: 2, y: 2 },
  })
  drawText(ctx, caption || 'a good afternoon, framed', w / 2, 934, {
    size: 19,
    family: FONT.script,
    color: '#4b4034',
    align: 'center',
    maxWidth: 620,
  })

  // Soft-focus bloom and grain.
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = radial(ctx, w / 2, 160, 40, w / 2, 220, 520, [
    [0, 'rgba(255, 246, 225, 0.3)'],
    [1, 'rgba(255, 246, 225, 0)'],
  ])
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
  vignette(ctx, 0, 0, w, h, '#20304a', 0.38)
  grainDots(ctx, 0, 0, w, h, 8, 'rgba(60, 45, 25, 0.12)', 0.6)
  gloss(ctx, 0, 0, w, h, { opacity: 0.1, angle: -0.55 })
}

/* ------------------------------------------------------------------ */
/* 33 · Digicam                                                        */
/* ------------------------------------------------------------------ */

export function paintDigicam({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#e4e7ea'],
    [0.5, '#cfd4da'],
    [1, '#aab0b8'],
  ])
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 21, 'rgba(50, 55, 60, 0.12)', 0.5)

  drawText(ctx, 'DSC-060', 34, 46, {
    size: 18,
    weight: 700,
    family: FONT.mono,
    color: '#3a4046',
    tracking: 2,
  })
  drawText(ctx, '3.2 MEGA PIXELS', 34, 66, {
    size: 8,
    family: FONT.mono,
    color: '#6b727a',
    tracking: 1.6,
  })
  drawText(ctx, 'DIGITAL STILL CAMERA', w - 34, 46, {
    size: 8,
    family: FONT.mono,
    color: '#6b727a',
    align: 'right',
    tracking: 1.4,
  })
  drawText(ctx, '6.0–18.0mm · 3× ZOOM', w - 34, 64, {
    size: 8,
    family: FONT.mono,
    color: '#6b727a',
    align: 'right',
    tracking: 1.2,
  })

  // Photo well.
  fillRound(ctx, 42, 86, w - 84, 816, 8, '#23282e')
  photo(ctx, photos[0], 54, 98, w - 108, 792, {
    label: 'PHOTO 1',
    seed: 57,
    placeholderBg: '#2f353c',
    placeholderInk: '#d7dbe0',
  })
  strokeRound(ctx, 54, 98, w - 108, 792, 0, 'rgba(255, 255, 255, 0.18)', 1)

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = radial(ctx, w - 150, 190, 0, w - 150, 190, 260, [
    [0, 'rgba(255, 252, 235, 0.5)'],
    [0.5, 'rgba(255, 252, 235, 0.14)'],
    [1, 'rgba(255, 252, 235, 0)'],
  ])
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
  scanlines(ctx, 54, 98, w - 108, 792, 4, 'rgba(0, 0, 0, 0.05)', 1)

  // Burned-in date stamp.
  drawText(ctx, formatDate(date, 'slash'), w - 66, 872, {
    size: 30,
    weight: 700,
    family: FONT.mono,
    color: '#ff9a1f',
    align: 'right',
    tracking: 3,
    shadow: { color: 'rgba(0, 0, 0, 0.7)', blur: 3, x: 2, y: 2 },
  })

  // Control strip.
  drawText(ctx, 'F2.8 · 1/60 · ISO 100', 44, 952, {
    size: 10,
    family: FONT.mono,
    color: '#3a4046',
    tracking: 1.4,
  })
  drawText(ctx, caption || 'ONE SHOT, STRAIGHT TO THE CARD', 44, 976, {
    size: 12,
    family: FONT.mono,
    color: '#5a6169',
    maxWidth: 500,
    tracking: 1,
  })

  ctx.save()
  ctx.translate(w / 2 + 40, 958)
  ctx.fillStyle = '#3a4046'
  ctx.beginPath()
  ctx.arc(0, 0, 26, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e9edf1'
  ctx.beginPath()
  ctx.moveTo(-6, -10)
  ctx.lineTo(12, 0)
  ctx.lineTo(-6, 10)
  ctx.closePath()
  ctx.fill()
  drawText(ctx, 'PLAY', 0, 44, {
    size: 8,
    family: FONT.mono,
    color: '#4a5158',
    align: 'center',
    tracking: 1.4,
  })
  ctx.restore()

  // Battery.
  ctx.save()
  ctx.translate(w - 92, 938)
  ctx.strokeStyle = '#3a4046'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, 46, 18)
  ctx.fillStyle = '#3a4046'
  ctx.fillRect(46, 5, 5, 8)
  ctx.fillStyle = '#4f9d4f'
  for (let bar = 0; bar < 3; bar += 1) ctx.fillRect(4 + bar * 13, 4, 9, 10)
  drawText(ctx, 'CHARGED', 0, 36, {
    size: 7,
    family: FONT.mono,
    color: '#6b727a',
    tracking: 1.2,
  })
  ctx.restore()

  gloss(ctx, 0, 0, w, h, { opacity: 0.16, angle: -0.5 })
}

/* ------------------------------------------------------------------ */
/* 34 · Film camera lab print                                          */
/* ------------------------------------------------------------------ */

export function paintFilmcam({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.fillStyle = '#d9d2c4'
  ctx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 22
  ctx.shadowOffsetY = 10
  ctx.fillStyle = '#fbf8f0'
  ctx.fillRect(20, 18, w - 40, h - 36)
  ctx.restore()

  photo(ctx, photos[0], 60, 54, w - 120, 524, {
    label: 'PHOTO 1',
    tone: 'warm',
    seed: 38,
    placeholderBg: '#cdbfa6',
    placeholderInk: '#5c4a34',
  })
  strokeRound(ctx, 60, 54, w - 120, 524, 0, 'rgba(60, 50, 35, 0.2)', 1)

  // Film rebate with frame code and orange lab markings.
  const stripY = 590
  ctx.fillStyle = '#241a12'
  ctx.fillRect(60, stripY, w - 120, 62)
  ctx.fillStyle = '#fbf8f0'
  for (let hole = 0; hole < 30; hole += 1) {
    const x = 66 + hole * 26
    ctx.fillRect(x, stripY + 4, 12, 7)
    ctx.fillRect(x, stripY + 51, 12, 7)
  }
  drawText(ctx, 'BOOTH 200', 76, stripY + 38, {
    size: 15,
    weight: 700,
    family: FONT.mono,
    color: '#ff8a1e',
    tracking: 2,
  })
  drawText(ctx, '400', 300, stripY + 38, {
    size: 13,
    family: FONT.mono,
    color: '#ff8a1e',
    tracking: 2,
  })
  drawText(ctx, '6  •  6A  •  7', 470, stripY + 38, {
    size: 11,
    family: FONT.mono,
    color: 'rgba(255, 255, 255, 0.5)',
    tracking: 2,
  })
  drawText(ctx, '06A', w - 78, stripY + 38, {
    size: 15,
    weight: 700,
    family: FONT.mono,
    color: '#ff8a1e',
    align: 'right',
    tracking: 1.5,
  })

  drawText(ctx, 'PRINTED BY MEMORY LAB · 4R · GLOSSY', 60, 676, {
    size: 8,
    family: FONT.mono,
    color: '#8d8272',
    tracking: 1.4,
  })
  drawText(ctx, caption || 'a frame worth keeping', 60, 702, {
    size: 22,
    family: FONT.script,
    color: '#4a4034',
    maxWidth: 560,
  })
  drawText(ctx, formatDate(date, 'long'), w - 60, 700, {
    size: 9,
    family: FONT.mono,
    color: '#8d8272',
    align: 'right',
    tracking: 1.6,
  })

  grainDots(ctx, 20, 18, w - 40, h - 36, 13, 'rgba(90, 76, 50, 0.1)', 0.45)
  gloss(ctx, 20, 18, w - 40, h - 36, { opacity: 0.1, angle: -0.45 })
}

/* ------------------------------------------------------------------ */
/* 32 · Webcam 2003                                                    */
/* ------------------------------------------------------------------ */

export function paintWebcam({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.fillStyle = '#b9c2cc'
  ctx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 22
  ctx.shadowOffsetY = 10
  fillRound(ctx, 16, 16, w - 32, h - 32, 8, '#eef1f5')
  ctx.restore()
  strokeRound(ctx, 16, 16, w - 32, h - 32, 8, 'rgba(70, 80, 95, 0.55)', 1.5)

  // Title bar.
  const titleGradient = linear(ctx, 20, 20, w - 20, 66, [
    [0, '#2f6aa8'],
    [0.6, '#245488'],
    [1, '#1b3f6b'],
  ])
  ctx.fillStyle = titleGradient
  ctx.beginPath()
  ctx.moveTo(20, 56)
  ctx.lineTo(20, 24)
  ctx.quadraticCurveTo(20, 20, 24, 20)
  ctx.lineTo(w - 24, 20)
  ctx.quadraticCurveTo(w - 20, 20, w - 20, 24)
  ctx.lineTo(w - 20, 56)
  ctx.closePath()
  ctx.fill()
  drawText(ctx, 'chat — 1 new message', 36, 46, {
    size: 14,
    weight: 700,
    family: FONT.sans,
    color: '#f2f6fb',
    tracking: 0.4,
  })
  for (const [index, glyph] of ['_', '□', '×'].entries()) {
    const x = w - 52 - index * 26
    ctx.fillStyle = index === 2 ? '#d05a4a' : 'rgba(255, 255, 255, 0.28)'
    fillRound(ctx, x, 31, 18, 14, 2, ctx.fillStyle)
    drawText(ctx, glyph, x + 9, 43, {
      size: 10,
      family: FONT.sans,
      color: '#eef4fb',
      align: 'center',
    })
  }

  // Webcam feed.
  fillRound(ctx, 40, 84, 368, 300, 3, '#20262d')
  photo(ctx, photos[0], 48, 92, 352, 284, {
    label: 'WEBCAM',
    seed: 49,
    tone: 'cool',
    placeholderBg: '#2a323c',
    placeholderInk: '#cfd8e2',
    grain: true,
  })
  scanlines(ctx, 48, 92, 352, 284, 3, 'rgba(0, 0, 0, 0.1)', 1)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fillRect(48, 92, 352, 22)
  circlePath(ctx, 60, 103, 4)
  ctx.fillStyle = '#ff4d4d'
  ctx.fill()
  drawText(ctx, 'CAM · LIVE', 70, 107, {
    size: 9,
    weight: 700,
    family: FONT.mono,
    color: '#f2f6fb',
    tracking: 1.4,
  })
  drawText(ctx, `${formatDate(date, 'iso')} 14:50`, 392, 364, {
    size: 9,
    family: FONT.mono,
    color: '#d7e2ee',
    align: 'right',
    tracking: 1,
  })
  drawText(ctx, '320 × 240 · 12 FPS', 56, 404, {
    size: 8,
    family: FONT.mono,
    color: '#8b95a1',
    tracking: 1.2,
  })

  // Buddy identity.
  ctx.save()
  circlePath(ctx, 452, 124, 32)
  ctx.clip()
  photo(ctx, photos[1], 420, 92, 64, 64, {
    label: 'BUDDY',
    seed: 83,
    placeholderBg: '#3a4652',
    placeholderInk: '#dfe6ee',
  })
  ctx.restore()
  circlePath(ctx, 452, 124, 32)
  ctx.strokeStyle = 'rgba(60, 70, 80, 0.5)'
  ctx.lineWidth = 2
  ctx.stroke()
  circlePath(ctx, 476, 146, 7)
  ctx.fillStyle = '#7ad151'
  ctx.fill()
  drawText(ctx, 'xX_darkness_Xx', 496, 116, {
    size: 15,
    weight: 700,
    family: FONT.sans,
    color: '#22303f',
  })
  drawText(ctx, 'online · away in 10', 496, 136, {
    size: 9,
    family: FONT.mono,
    color: '#5d8a4a',
    tracking: 1,
  })

  const bubble = (
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    mine: boolean,
  ) => {
    fillRound(ctx, x, y, width, height, 10, mine ? '#d6e8ff' : '#ffffff')
    strokeRound(ctx, x, y, width, height, 10, 'rgba(90, 100, 115, 0.28)', 1)
    drawText(ctx, text, x + 14, y + height / 2 + 5, {
      size: 13,
      family: FONT.sans,
      color: '#26323e',
      maxWidth: width - 28,
    })
  }
  bubble(424, 170, 360, 50, 'hey, is that you?', false)
  bubble(468, 232, 380, 58, caption || 'nice webcam lol', true)
  bubble(424, 302, 300, 46, 'same time tomorrow?', false)
  drawText(ctx, '14:51', 856, 226, {
    size: 8,
    family: FONT.mono,
    color: '#8b95a1',
    align: 'right',
  })

  // Composer.
  fillRound(ctx, 40, 548, 700, 48, 3, '#ffffff')
  strokeRound(ctx, 40, 548, 700, 48, 3, 'rgba(90, 100, 115, 0.35)', 1)
  drawText(ctx, 'type a message…', 56, 578, {
    size: 13,
    family: FONT.sans,
    color: '#9aa4af',
  })
  fillRound(ctx, 752, 548, 96, 48, 4, '#2f6aa8')
  drawText(ctx, 'SEND', 800, 577, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#f2f6fb',
    align: 'center',
    tracking: 2,
  })
  drawText(ctx, 'AIM 6.0 · CONNECTED', 40, 622, {
    size: 8,
    family: FONT.mono,
    color: '#6f7b88',
    tracking: 1.2,
  })
  drawText(ctx, '128 kbps · 06', w - 40, 622, {
    size: 8,
    family: FONT.mono,
    color: '#6f7b88',
    align: 'right',
    tracking: 1.2,
  })

  gloss(ctx, 16, 16, w - 32, h - 32, { opacity: 0.1, radius: 8, angle: -0.4 })
}

/* ------------------------------------------------------------------ */
/* 35 · CCTV                                                           */
/* ------------------------------------------------------------------ */

export function paintCctv({ ctx, w, h, photos, caption, date, time }: Scene) {
  ctx.fillStyle = '#070908'
  ctx.fillRect(0, 0, w, h)

  drawText(ctx, 'CAM 04 · EAST CORRIDOR', 32, 50, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#b9d8c4',
    tracking: 2,
  })
  const blink = Math.sin(time * 4.2) > -0.15
  if (blink) {
    circlePath(ctx, w - 128, 45, 6)
    ctx.fillStyle = '#ff3b30'
    ctx.fill()
  }
  drawText(ctx, 'REC', w - 114, 50, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#ff6b60',
    tracking: 2.4,
  })
  drawText(ctx, 'CH 04', w - 32, 50, {
    size: 10,
    family: FONT.mono,
    color: '#6f8b79',
    align: 'right',
    tracking: 1.6,
  })

  // Feed.
  ctx.fillStyle = '#0b0f0c'
  ctx.fillRect(24, 72, w - 48, 516)
  photo(ctx, photos[0], 24, 72, w - 48, 516, {
    label: 'FEED',
    tone: 'bw',
    seed: 93,
    placeholderBg: '#1b211d',
    placeholderInk: '#9dbba8',
    grain: true,
  })
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgba(70, 130, 90, 0.16)'
  ctx.fillRect(24, 72, w - 48, 516)
  ctx.restore()
  scanlines(ctx, 24, 72, w - 48, 516, 4, 'rgba(0, 0, 0, 0.18)', 2)
  vignette(ctx, 24, 72, w - 48, 516, '#000000', 0.42)

  // HUD.
  ctx.strokeStyle = 'rgba(216, 255, 228, 0.55)'
  ctx.lineWidth = 2
  const bracket = (x: number, y: number, sx: number, sy: number) => {
    ctx.beginPath()
    ctx.moveTo(x + sx * 26, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + sy * 26)
    ctx.stroke()
  }
  bracket(48, 96, 1, 1)
  bracket(w - 48, 96, -1, 1)
  bracket(48, 564, 1, -1)
  bracket(w - 48, 564, -1, -1)
  ctx.beginPath()
  ctx.moveTo(w / 2 - 14, 330)
  ctx.lineTo(w / 2 + 14, 330)
  ctx.moveTo(w / 2, 316)
  ctx.lineTo(w / 2, 344)
  ctx.stroke()

  drawText(ctx, 'EVIDENCE #A-117', 52, 118, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: 'rgba(216, 255, 228, 0.85)',
    tracking: 2,
  })
  if (Math.sin(time * 2.4) > 0) {
    drawText(ctx, 'MOTION DETECTED', w - 52, 118, {
      size: 10,
      weight: 700,
      family: FONT.mono,
      color: 'rgba(255, 120, 100, 0.9)',
      align: 'right',
      tracking: 1.6,
    })
  }
  drawText(ctx, `${formatDate(date, 'iso')} 14:50:07`, 52, 566, {
    size: 19,
    weight: 700,
    family: FONT.mono,
    color: '#eafff0',
    tracking: 1.2,
    shadow: { color: 'rgba(0, 0, 0, 0.85)', blur: 5 },
  })

  // Control strip.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
  ctx.fillRect(24, 604, w - 48, 68)
  drawText(ctx, '1920 × 1080 · 12 FPS · IR ON', 32, 632, {
    size: 9,
    family: FONT.mono,
    color: '#89a394',
    tracking: 1.4,
  })
  for (let tick = 0; tick < 28; tick += 1) {
    const x = 32 + tick * 26
    ctx.fillStyle = tick % 4 === 0 ? 'rgba(216, 255, 228, 0.5)' : 'rgba(216, 255, 228, 0.2)'
    ctx.fillRect(x, 648, tick % 4 === 0 ? 2 : 1, tick % 4 === 0 ? 14 : 8)
  }
  drawText(ctx, (caption || 'ONE GOOD AFTERNOON').toUpperCase(), 32, 684, {
    size: 9,
    family: FONT.mono,
    color: '#6f8b79',
    maxWidth: 520,
    tracking: 1.4,
  })
  drawText(ctx, 'ARCHIVE 06', w - 32, 684, {
    size: 9,
    family: FONT.mono,
    color: '#6f8b79',
    align: 'right',
    tracking: 1.4,
  })
}

/* ------------------------------------------------------------------ */
/* 30 · Cassette art                                                   */
/* ------------------------------------------------------------------ */

export function paintCassetteArt({ ctx, w, h, photos, caption, time }: Scene) {
  ctx.fillStyle = '#ff4d8d'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, 'rgba(255, 236, 190, 0.9)'],
    [0.48, 'rgba(255, 236, 190, 0)'],
    [1, 'rgba(103, 232, 249, 0.25)'],
  ])
  ctx.fillRect(0, 0, w, h)
  halftone(ctx, 0, 0, w, h, 16, 'rgba(23, 19, 26, 0.18)', 0.26)
  sparkle(ctx, 96, 150, 20, '#fff6dc', 0.8)
  sparkle(ctx, 726, 210, 26, '#fff6dc', 0.7)

  // Registration marks.
  ctx.strokeStyle = 'rgba(23, 19, 26, 0.5)'
  ctx.lineWidth = 1.5
  for (const [x, y] of [
    [40, 40],
    [w - 40, 40],
    [40, h - 40],
    [w - 40, h - 40],
  ] as const) {
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.moveTo(x - 14, y)
    ctx.lineTo(x + 14, y)
    ctx.moveTo(x, y - 14)
    ctx.lineTo(x, y + 14)
    ctx.stroke()
  }

  drawText(ctx, 'MIXTAPE', w / 2, 132, {
    size: 92,
    weight: 700,
    family: FONT.display,
    color: 'rgba(23, 19, 26, 0.16)',
    align: 'center',
    tracking: 4,
  })
  drawText(ctx, 'VOL. 06 · RISO PRINT', w / 2, 164, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: 'rgba(23, 19, 26, 0.62)',
    align: 'center',
    tracking: 4,
  })

  // Cassette shell, slightly off-square like a print.
  ctx.save()
  ctx.translate(w / 2, 452)
  ctx.rotate(-0.08)
  ctx.save()
  ctx.translate(8, 10)
  fillRound(ctx, -300, -180, 600, 360, 18, 'rgba(23, 19, 26, 0.22)')
  ctx.restore()

  fillRound(ctx, -300, -180, 600, 360, 18, '#17131a')
  strokeRound(ctx, -300, -180, 600, 360, 18, 'rgba(255, 246, 214, 0.35)', 2)

  // Printed label across the top, photo inside it.
  fillRound(ctx, -282, -162, 564, 186, 8, '#f2e6cd')
  ctx.save()
  roundPath(ctx, -270, -150, 540, 150, 4)
  ctx.clip()
  photo(ctx, photos[0], -270, -150, 540, 150, {
    label: 'LABEL',
    seed: 77,
    placeholderBg: '#cbbd9f',
    placeholderInk: '#3b3440',
  })
  ctx.fillStyle = 'rgba(23, 19, 26, 0.1)'
  ctx.fillRect(-270, -150, 540, 150)
  ctx.restore()
  strokeRound(ctx, -270, -150, 540, 150, 4, 'rgba(23, 19, 26, 0.35)', 1)

  // Reel window.
  fillRound(ctx, -250, 52, 500, 104, 12, '#0c0a0f')
  strokeRound(ctx, -250, 52, 500, 104, 12, 'rgba(255, 246, 214, 0.22)', 1.5)
  fillRound(ctx, -96, 90, 192, 28, 5, '#54381f')
  fillRound(ctx, -90, 94, 180, 20, 4, '#7a5330')

  const hub = (x: number, y: number) => {
    circlePath(ctx, x, y, 42)
    ctx.fillStyle = '#2a2430'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 236, 190, 0.55)'
    ctx.lineWidth = 2
    ctx.stroke()
    const spin = time * 1.9
    for (let tooth = 0; tooth < 6; tooth += 1) {
      const angle = spin + (tooth / 6) * Math.PI * 2
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.fillStyle = 'rgba(255, 236, 190, 0.8)'
      ctx.fillRect(-3, -36, 6, 16)
      ctx.restore()
    }
    circlePath(ctx, x, y, 10)
    ctx.fillStyle = '#0f0d12'
    ctx.fill()
  }
  hub(-152, 104)
  hub(152, 104)

  drawText(ctx, 'SIDE A · 60 MIN · TYPE II', -278, 44, {
    size: 8,
    family: FONT.mono,
    color: 'rgba(255, 246, 214, 0.7)',
    tracking: 1.6,
  })
  circlePath(ctx, 262, 38, 12)
  ctx.strokeStyle = 'rgba(255, 246, 214, 0.6)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  drawText(ctx, 'A', 262, 42, {
    size: 10,
    weight: 700,
    family: FONT.mono,
    color: 'rgba(255, 246, 214, 0.8)',
    align: 'center',
  })
  for (const [sx, sy] of [
    [-276, -156],
    [276, -156],
    [-276, 156],
    [276, 156],
  ] as const) {
    circlePath(ctx, sx, sy, 5)
    ctx.fillStyle = 'rgba(255, 246, 214, 0.35)'
    ctx.fill()
  }
  ctx.restore()

  // Tape spilling across the print.
  ctx.save()
  ctx.strokeStyle = '#241d22'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(566, 610)
  ctx.bezierCurveTo(700, 720, 470, 790, 640, 880)
  ctx.bezierCurveTo(720, 922, 560, 952, 470, 918)
  ctx.stroke()
  ctx.strokeStyle = '#6b4a2f'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(566, 610)
  ctx.bezierCurveTo(700, 720, 470, 790, 640, 880)
  ctx.bezierCurveTo(720, 922, 560, 952, 470, 918)
  ctx.stroke()
  ctx.restore()

  drawText(ctx, (caption || 'for someone, side A').toLowerCase(), w / 2, 984, {
    size: 40,
    family: FONT.script,
    color: '#17131a',
    align: 'center',
    maxWidth: 700,
  })
  drawText(ctx, 'RECORDED AT HOME · PLAY LOUD', w / 2, 1012, {
    size: 9,
    family: FONT.mono,
    color: 'rgba(23, 19, 26, 0.62)',
    align: 'center',
    tracking: 2,
  })

  gloss(ctx, 0, 0, w, h, { opacity: 0.12, angle: -0.5 })
}

/* A tiny exported map keeps the render index declarative. */
export const ANALOG_PAINTERS = {
  polaroid: paintPolaroid,
  film: paintFilm,
  cassette: paintCassette,
  floppy: paintFloppy,
  dmg: paintDmg,
  vhs: paintVhs,
  arcade: paintArcade,
  studio: paintStudio,
  digicam: paintDigicam,
  filmcam: paintFilmcam,
  webcam: paintWebcam,
  cctv: paintCctv,
  cassetteArt: paintCassetteArt,
}
