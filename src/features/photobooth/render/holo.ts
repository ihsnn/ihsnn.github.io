import {
  archPath,
  barcode,
  blobPath,
  circlePath,
  drawText,
  FONT,
  fillRound,
  formatDate,
  gloss,
  grainDots,
  halftone,
  holo,
  linear,
  palm,
  photo,
  radial,
  roundPath,
  seeded,
  sparkle,
  star,
  strokeRound,
  wrapText,
  type PhotoBitmap,
  type Scene,
} from '../art'

/* ------------------------------------------------------------------ */
/* 01 · Pokémon-style holo trainer card                                */
/* ------------------------------------------------------------------ */

export function paintPoke({ ctx, w, h, photos, caption }: Scene) {
  const cardX = 14
  const cardY = 14
  const cardW = w - 28
  const cardH = h - 28

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
  ctx.shadowBlur = 34
  ctx.shadowOffsetY = 12
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [
    [0, '#fbe6a0'],
    [0.22, '#dcb23f'],
    [0.5, '#f9e7ac'],
    [0.78, '#c69a28'],
    [1, '#f1d070'],
  ])
  roundPath(ctx, cardX, cardY, cardW, cardH, 34)
  ctx.fill()
  ctx.restore()

  strokeRound(ctx, cardX + 9, cardY + 9, cardW - 18, cardH - 18, 27, 'rgba(255, 255, 255, 0.55)', 2.5)
  strokeRound(ctx, cardX + 19, cardY + 19, cardW - 38, cardH - 38, 23, 'rgba(93, 63, 4, 0.32)', 1.5)

  const px = 40
  const py = 40
  const pw = w - 80
  const ph = h - 80
  fillRound(ctx, px, py, pw, ph, 20, '#f8f0dd')
  grainDots(ctx, px, py, pw, ph, 4, 'rgba(93, 63, 4, 0.09)', 0.5)

  // Header: logo, subtitle, HP.
  drawText(ctx, 'POKÉ PHOTO', 66, 112, {
    size: 60,
    weight: 900,
    family: FONT.sans,
    color: '#ffcb05',
    stroke: '#2456a6',
    lineWidth: 7,
    style: 'italic',
    tracking: -1,
  })
  drawText(ctx, 'TRADING CARD GAME · BOOTH EDITION', 70, 144, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#8a6a2a',
    tracking: 2.4,
  })

  drawText(ctx, 'HP', 660, 104, {
    size: 17,
    weight: 900,
    family: FONT.sans,
    color: '#d33a1e',
    align: 'right',
    tracking: 1,
  })
  drawText(ctx, '120', 776, 106, {
    size: 56,
    weight: 900,
    family: FONT.sans,
    color: '#242a33',
    align: 'right',
  })
  drawText(ctx, 'BASIC', 776, 136, {
    size: 14,
    weight: 800,
    family: FONT.mono,
    color: '#5e6a7a',
    align: 'right',
    tracking: 2,
  })

  // Main artwork window.
  const ax = 64
  const ay = 168
  const aw = w - 128
  const ah = 498
  ctx.save()
  ctx.shadowColor = 'rgba(60, 40, 0, 0.25)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 5
  fillRound(ctx, ax - 9, ay - 9, aw + 18, ah + 18, 18, '#c9a227')
  ctx.restore()
  fillRound(ctx, ax - 3, ay - 3, aw + 6, ah + 6, 14, '#fdf7e6')
  photo(ctx, photos[0], ax, ay, aw, ah, {
    radius: 11,
    label: 'ARTWORK',
    tone: 'warm',
    seed: 3,
  })
  holo(ctx, ax, ay, aw, ah, { opacity: 0.42, radius: 11, seed: 8, sparkles: 16 })

  fillRound(ctx, ax + 16, ay + 16, 124, 40, 20, 'rgba(255, 255, 255, 0.88)')
  drawText(ctx, 'BASIC', ax + 78, ay + 43, {
    size: 14,
    weight: 800,
    family: FONT.mono,
    color: '#4c5563',
    align: 'center',
    tracking: 2,
  })
  drawText(ctx, 'Illus. kamera depanmu', ax + aw - 16, ay + ah - 16, {
    size: 12,
    family: FONT.mono,
    color: 'rgba(255, 255, 255, 0.85)',
    align: 'right',
  })

  // Name row.
  drawText(ctx, caption ? caption.toUpperCase() : 'TRAINER', 64, 720, {
    size: 48,
    weight: 900,
    family: FONT.sans,
    color: '#20242c',
    tracking: -0.5,
    maxWidth: 520,
  })
  drawText(ctx, 'NO. 006', 776, 700, {
    size: 15,
    weight: 700,
    family: FONT.mono,
    color: '#6d6350',
    align: 'right',
    tracking: 1.5,
  })
  drawText(ctx, 'HOLO RARE', 776, 722, {
    size: 15,
    weight: 900,
    family: FONT.sans,
    color: '#b8341b',
    align: 'right',
    tracking: 1.5,
  })
  ctx.fillStyle = '#c7b586'
  ctx.fillRect(64, 744, w - 128, 2)

  // Trainer portrait.
  const tx = 64
  const ty = 776
  const tsize = 168
  fillRound(ctx, tx - 6, ty - 6, tsize + 12, tsize + 12, 14, '#d8b74a')
  photo(ctx, photos[1], tx, ty, tsize, tsize, {
    radius: 9,
    label: 'POTRET',
    tone: 'warm',
    seed: 5,
  })
  drawText(ctx, 'TRAINER', tx + tsize / 2, ty + tsize + 24, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#7a6a4e',
    align: 'center',
    tracking: 2,
  })

  const infoX = 262
  drawText(ctx, 'SERANGAN', infoX, 796, {
    size: 19,
    weight: 900,
    family: FONT.sans,
    color: '#8a3a16',
    tracking: 2.5,
  })

  const move = (y: number, name: string, power: string, flavor: string, color: string) => {
    ctx.save()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(infoX + 13, y - 9, 13, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
    ctx.beginPath()
    ctx.arc(infoX + 9, y - 13, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    drawText(ctx, name, infoX + 34, y, {
      size: 25,
      weight: 900,
      family: FONT.sans,
      color: '#2a2f38',
    })
    drawText(ctx, power, 776, y, {
      size: 34,
      weight: 900,
      family: FONT.sans,
      color: '#20242c',
      align: 'right',
    })
    drawText(ctx, flavor, infoX + 34, y + 26, {
      size: 16,
      family: FONT.sans,
      color: '#6b6455',
    })
  }

  move(836, 'FLASH SHUTTER', '30', 'One shot and every eye is on you.', '#e8b53a')
  move(916, 'HOLO BURST', '60+', 'The more friends, the brighter the foil.', '#c46bff')

  ctx.fillStyle = '#c7b586'
  ctx.fillRect(64, 972, w - 128, 2)

  // Footer stats.
  drawText(ctx, 'WEAKNESS', 64, 1006, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#8a7d64',
    tracking: 2,
  })
  drawText(ctx, '×2', 64, 1032, {
    size: 21,
    weight: 900,
    family: FONT.sans,
    color: '#b8341b',
  })
  drawText(ctx, 'RESISTANCE', 260, 1006, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#8a7d64',
    tracking: 2,
  })
  drawText(ctx, 'LIGHT', 260, 1032, {
    size: 19,
    weight: 800,
    family: FONT.sans,
    color: '#2f5c3b',
  })
  drawText(ctx, 'RETREAT', 470, 1006, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#8a7d64',
    tracking: 2,
  })
  for (let i = 0; i < 2; i += 1) {
    star(ctx, 478 + i * 26, 1028, 10, 4, 5, '#8a6a2a')
  }

  drawText(ctx, '006 / 108', 776, 1012, {
    size: 14,
    weight: 700,
    family: FONT.mono,
    color: '#6d6350',
    align: 'right',
  })
  drawText(ctx, '©2026 PHOTO BOOTH', 776, 1034, {
    size: 12,
    family: FONT.mono,
    color: '#8a7d64',
    align: 'right',
  })

  drawText(ctx, 'ONE SHOT, FOREVER', w / 2, 1106, {
    size: 16,
    weight: 700,
    family: FONT.mono,
    color: '#8a6a2a',
    align: 'center',
    tracking: 3,
    maxWidth: 640,
  })

  holo(ctx, cardX, cardY, cardW, cardH, {
    opacity: 0.24,
    radius: 34,
    seed: 21,
    sparkles: 18,
  })

  // A foil edge so the card reads as holo even in a small chat thumbnail.
  ctx.save()
  ctx.globalAlpha = 0.6
  ctx.strokeStyle = linear(ctx, cardX, cardY, cardX + cardW, cardY + cardH, [
    [0, '#ff7cc6'],
    [0.24, '#fff3c4'],
    [0.48, '#8ff3e8'],
    [0.72, '#c8a7ff'],
    [1, '#ff7cc6'],
  ])
  ctx.lineWidth = 3.5
  roundPath(ctx, cardX + 7, cardY + 7, cardW - 14, cardH - 14, 29)
  ctx.stroke()
  ctx.restore()

  gloss(ctx, cardX, cardY, cardW, cardH, { opacity: 0.14, radius: 34 })
}

/* ------------------------------------------------------------------ */
/* 02 · GTA V-style monochrome poster                                  */
/* ------------------------------------------------------------------ */

export function paintGta5({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = '#f2efe6'
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 12, 'rgba(20, 20, 18, 0.12)', 0.5)
  strokeRound(ctx, 24, 24, w - 48, h - 48, 2, '#0b0b0f', 3)

  drawText(ctx, 'A PHOTO BOOTH PRODUCTION', 48, 72, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#111114',
    tracking: 3,
  })
  drawText(ctx, 'LOS SANTOS · PHOTO EDITION', 48, 94, {
    size: 11,
    family: FONT.mono,
    color: '#6c675d',
    tracking: 2,
  })

  fillRound(ctx, 792, 42, 62, 44, 3, '#0b0b0f')
  drawText(ctx, '18+', 823, 72, {
    size: 25,
    weight: 900,
    family: FONT.display,
    color: '#ffffff',
    align: 'center',
  })

  const panel = (
    x: number,
    y: number,
    pw: number,
    ph: number,
    image: PhotoBitmap | null,
    label: string,
    rotation: number,
  ) => {
    ctx.save()
    ctx.translate(x + pw / 2, y + ph / 2)
    ctx.rotate(rotation)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
    ctx.shadowBlur = 22
    ctx.shadowOffsetY = 10
    ctx.fillStyle = '#0b0b0f'
    ctx.fillRect(-pw / 2 - 8, -ph / 2 - 8, pw + 16, ph + 16)
    ctx.restore()

    ctx.save()
    ctx.translate(x + pw / 2, y + ph / 2)
    ctx.rotate(rotation)
    photo(ctx, image, -pw / 2, -ph / 2, pw, ph, {
      label: `PHOTO ${label}`,
      tone: 'bw',
      placeholderBg: '#25241f',
      placeholderInk: '#efeadf',
      seed: 8 + Number(label),
    })
    ctx.save()
    ctx.beginPath()
    ctx.rect(-pw / 2, -ph / 2, pw, ph)
    ctx.clip()
    halftone(ctx, -pw / 2, -ph / 2, pw, ph, 7, 'rgba(12, 12, 10, 0.2)')
    ctx.restore()
    ctx.fillStyle = '#0b0b0f'
    ctx.fillRect(-pw / 2, ph / 2 - 34, pw, 34)
    drawText(ctx, `TAKE ${label}`, -pw / 2 + 14, ph / 2 - 12, {
      size: 13,
      weight: 700,
      family: FONT.mono,
      color: '#f2efe6',
      tracking: 2,
    })
    drawText(ctx, '35MM', pw / 2 - 14, ph / 2 - 12, {
      size: 13,
      family: FONT.mono,
      color: '#8bd450',
      align: 'right',
      tracking: 2,
    })
    ctx.restore()
  }

  panel(60, 118, 380, 500, photos[0], '01', -0.018)
  panel(462, 148, 380, 500, photos[1], '02', 0.014)

  // Black title band.
  ctx.fillStyle = '#0b0b0f'
  ctx.fillRect(24, 690, w - 48, 408)

  drawText(ctx, 'GRAND', 54, 812, {
    size: 126,
    weight: 400,
    family: FONT.display,
    color: '#ffffff',
    tracking: 2,
  })
  drawText(ctx, 'PHOTO', 54, 936, {
    size: 126,
    weight: 400,
    family: FONT.display,
    color: '#ffffff',
    tracking: 2,
  })

  fillRound(ctx, 648, 742, 168, 176, 4, '#8bd450')
  drawText(ctx, 'V', 732, 888, {
    size: 168,
    weight: 400,
    family: FONT.display,
    color: '#0b0b0f',
    align: 'center',
  })

  drawText(ctx, 'LOS SANTOS · 2026', 54, 992, {
    size: 20,
    weight: 700,
    family: FONT.mono,
    color: '#d9d4c8',
    tracking: 5,
  })
  drawText(ctx, caption || 'PERSISTENCE IS KEY', 54, 1022, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#8bd450',
    tracking: 4,
    maxWidth: 520,
  })
  drawText(ctx, 'ONE SHOT, THREE CITIES.', 54, 1052, {
    size: 13,
    family: FONT.mono,
    color: '#7a756b',
    tracking: 2,
  })

  barcode(ctx, 620, 986, 220, 62, 6, '#f2efe6')
  drawText(ctx, '006 · 2026 · IHSNN GAMES', 840, 1070, {
    size: 10,
    family: FONT.mono,
    color: '#7a756b',
    align: 'right',
    tracking: 1.5,
  })

  // Bottom fine print on the paper margin.
  const footY = 1136
  drawText(ctx, '1–2 PEMAIN', 48, footY, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#3b3a35',
    tracking: 2,
  })
  drawText(ctx, 'CAMERA · PHOTO · DOWNLOAD', 48, 1158, {
    size: 10,
    family: FONT.mono,
    color: '#7a756b',
    tracking: 1.5,
  })
  drawText(ctx, '18+', 450, footY, {
    size: 13,
    weight: 900,
    family: FONT.mono,
    color: '#3b3a35',
    align: 'center',
  })
  drawText(ctx, 'MODEL PB-06', 852, footY, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#3b3a35',
    align: 'right',
    tracking: 2,
  })
  drawText(ctx, '©2026', 852, 1158, {
    size: 10,
    family: FONT.mono,
    color: '#7a756b',
    align: 'right',
    tracking: 2,
  })

  // Sharp light sheen across the black band.
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.12
  ctx.fillStyle = linear(ctx, 0, 690, w, 1100, [
    [0, 'rgba(255,255,255,0)'],
    [0.42, 'rgba(255,255,255,0.5)'],
    [0.5, 'rgba(255,255,255,0)'],
    [1, 'rgba(255,255,255,0)'],
  ])
  ctx.fillRect(24, 690, w - 48, 408)
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/* 03 · GTA VI-style neon sunset collage                               */
/* ------------------------------------------------------------------ */

export function paintGta6({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [
    [0, '#17052f'],
    [0.24, '#43114f'],
    [0.46, '#8f1f60'],
    [0.62, '#e2476f'],
    [0.74, '#ff8a5c'],
    [0.82, '#ffc46b'],
    [0.84, '#2a0b3d'],
    [1, '#12041f'],
  ])
  ctx.fillRect(0, 0, w, h)

  const random = seeded(42)
  for (let i = 0; i < 70; i += 1) {
    const sx = random() * w
    const sy = random() * h * 0.45
    const size = random() * 1.8 + 0.5
    ctx.fillStyle = `rgba(255, 240, 250, ${0.15 + random() * 0.5})`
    ctx.fillRect(sx, sy, size, size)
  }

  // Sun with retro cut stripes.
  const sunX = 450
  const sunY = 448
  const sunR = 232
  ctx.save()
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = linear(ctx, 0, sunY - sunR, 0, sunY + sunR, [
    [0, '#fff2b0'],
    [0.42, '#ffb066'],
    [0.72, '#ff5f8f'],
    [1, '#c2276b'],
  ])
  ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2)
  for (let i = 0; i < 9; i += 1) {
    const y = sunY + i * 26
    ctx.fillStyle = `rgba(23, 5, 47, ${0.22 + i * 0.055})`
    ctx.fillRect(sunX - sunR, y, sunR * 2, 4 + i * 1.4)
  }
  ctx.restore()

  // Ground grid.
  ctx.save()
  ctx.strokeStyle = 'rgba(255, 107, 157, 0.26)'
  ctx.lineWidth = 1.5
  for (let i = 0; i < 10; i += 1) {
    const y = 1010 + i * i * 2.6
    if (y > h) break
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
  for (let i = -8; i <= 8; i += 1) {
    ctx.beginPath()
    ctx.moveTo(w / 2 + i * 16, 1002)
    ctx.lineTo(w / 2 + i * 130, h)
    ctx.stroke()
  }
  ctx.restore()

  // Palms behind the photos.
  palm(ctx, 26, 1040, 560, 1, '#1c0732')
  palm(ctx, 892, 1060, 640, -1, '#1c0732')

  // Title.
  drawText(ctx, 'GRAND PHOTO', w / 2, 94, {
    size: 22,
    weight: 700,
    family: FONT.sans,
    color: '#ffe9f3',
    align: 'center',
    tracking: 12,
    shadow: { color: 'rgba(80, 0, 60, 0.55)', blur: 12 },
  })

  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = `italic 900 300px ${FONT.serif}`
  const chrome = linear(ctx, 200, 70, 700, 390, [
    [0, '#ffffff'],
    [0.32, '#ffd9ea'],
    [0.58, '#ff7bb5'],
    [0.78, '#ff3f95'],
    [1, '#c81a6b'],
  ])
  ctx.fillStyle = chrome
  ctx.shadowColor = 'rgba(255, 77, 157, 0.65)'
  ctx.shadowBlur = 46
  ctx.fillText('VI', 450, 384)
  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.lineWidth = 2.5
  ctx.strokeText('VI', 450, 384)
  ctx.restore()

  drawText(ctx, 'LEONIDA', 450, 430, {
    size: 22,
    weight: 800,
    family: FONT.sans,
    color: '#ffe1ee',
    align: 'center',
    tracking: 16,
    shadow: { color: 'rgba(80, 0, 60, 0.5)', blur: 10 },
  })

  const tilted = (
    x: number,
    y: number,
    pw: number,
    ph: number,
    rotation: number,
    image: PhotoBitmap | null,
    label: string,
    caption?: string,
  ) => {
    ctx.save()
    ctx.translate(x + pw / 2, y + ph / 2)
    ctx.rotate(rotation)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 28
    ctx.shadowOffsetY = 14
    const pad = 12
    const captionH = caption ? 54 : 0
    fillRound(
      ctx,
      -pw / 2 - pad,
      -ph / 2 - pad,
      pw + pad * 2,
      ph + pad * 2 + captionH,
      10,
      '#fff7f2',
    )
    ctx.shadowColor = 'transparent'
    photo(ctx, image, -pw / 2, -ph / 2, pw, ph, {
      label,
      tone: 'warm',
      placeholderBg: '#3a1230',
      placeholderInk: '#ffe9f3',
      seed: label.length * 9,
    })
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(-pw / 2, -ph / 2, pw, ph)
    if (caption) {
      drawText(ctx, caption, 0, ph / 2 + pad + 34, {
        size: 20,
        family: FONT.script,
        color: '#8e3b63',
        align: 'center',
      })
    }
    ctx.restore()
  }

  tilted(88, 486, 548, 342, -0.035, photos[0], 'PHOTO 1')
  tilted(536, 700, 274, 250, 0.06, photos[1], 'PHOTO 2', "leonida '26")

  // Foreground palm, so the collage sits inside the scene.
  palm(ctx, 806, 1200, 360, -1, '#150427')

  // Bottom scrim and labels.
  ctx.fillStyle = linear(ctx, 0, 1030, 0, h, [
    [0, 'rgba(18, 4, 31, 0)'],
    [0.5, 'rgba(18, 4, 31, 0.72)'],
    [1, 'rgba(18, 4, 31, 0.95)'],
  ])
  ctx.fillRect(0, 1030, w, h - 1030)

  drawText(ctx, caption || 'GRAND PHOTO VI', 60, 1112, {
    size: 22,
    weight: 900,
    family: FONT.display,
    color: '#ffffff',
    tracking: 4,
    maxWidth: 520,
  })
  drawText(ctx, 'ONE SHOT, FOREVER', 60, 1142, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#ffd9e8',
    tracking: 4,
  })
  drawText(ctx, 'LEONIDA, FLORIDA · 2026', 60, 1170, {
    size: 11,
    family: FONT.mono,
    color: '#c88ba8',
    tracking: 2.5,
  })
  fillRound(ctx, 808, 1130, 34, 34, 2, 'rgba(0, 0, 0, 0.55)')
  drawText(ctx, '18+', 825, 1153, {
    size: 14,
    weight: 900,
    family: FONT.mono,
    color: '#ffffff',
    align: 'center',
  })
  drawText(ctx, 'GRAND PHOTO VI', 60, 1112, {
    size: 18,
    weight: 900,
    family: FONT.display,
    color: '#ffffff',
    tracking: 4,
  })

  for (let i = 0; i < 14; i += 1) {
    sparkle(ctx, random() * w, 80 + random() * 520, 2 + random() * 5, '#fff4d0', 0.5)
  }

  holo(ctx, 0, 0, w, h, { opacity: 0.22, seed: 33, sparkles: 22 })
  gloss(ctx, 0, 0, w, h, { opacity: 0.1 })
}

/* ------------------------------------------------------------------ */
/* 16 · Die-cut sticker sheet                                          */
/* ------------------------------------------------------------------ */

export function paintSticker({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#f3e8ff'],
    [0.4, '#e9d5ff'],
    [0.72, '#fbcfe8'],
    [1, '#c7f9ff'],
  ])
  ctx.fillRect(0, 0, w, h)

  // Soft background blobs and confetti.
  const random = seeded(16)
  for (let i = 0; i < 8; i += 1) {
    const bx = random() * w
    const by = random() * h
    const radius = 100 + random() * 180
    ctx.fillStyle = radial(ctx, bx, by, 0, bx, by, radius, [
      [0, `rgba(255, 255, 255, ${0.2 + random() * 0.25})`],
      [1, 'rgba(255, 255, 255, 0)'],
    ])
    ctx.fillRect(bx - radius, by - radius, radius * 2, radius * 2)
  }
  for (let i = 0; i < 36; i += 1) {
    const x = random() * w
    const y = random() * h
    const size = 2 + random() * 6
    if (random() > 0.5) {
      star(ctx, x, y, size, size * 0.45, 5, `rgba(255, 255, 255, ${0.35 + random() * 0.4})`)
    } else {
      sparkle(ctx, x, y, size, 'rgba(255, 214, 250, 0.7)', 0.7)
    }
  }

  drawText(ctx, 'STICKER', 50, 132, {
    size: 96,
    weight: 400,
    family: FONT.display,
    color: '#3b1a4f',
    tracking: 3,
  })
  drawText(ctx, 'PACK · 06 LEMBAR · DIE-CUT HOLO', 54, 168, {
    size: 15,
    weight: 700,
    family: FONT.mono,
    color: '#7c3a91',
    tracking: 3,
  })
  drawText(ctx, 'PEEL', 830, 132, {
    size: 14,
    weight: 700,
    family: FONT.mono,
    color: '#7c3a91',
    align: 'right',
    tracking: 4,
  })

  const sticker = (
    cx: number,
    cy: number,
    radius: number,
    rotation: number,
    image: PhotoBitmap | null,
    label: string,
    seed: number,
    caption: string,
    tint: string,
  ) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    ctx.save()
    ctx.shadowColor = 'rgba(59, 26, 79, 0.35)'
    ctx.shadowBlur = 26
    ctx.shadowOffsetY = 14
    blobPath(ctx, 0, 0, radius, seed, 0.14)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.restore()

    ctx.save()
    blobPath(ctx, 0, 0, radius, seed, 0.14)
    ctx.clip()
    photo(ctx, image, -radius, -radius, radius * 2, radius * 2, {
      label,
      tone: 'warm',
      placeholderBg: tint,
      placeholderInk: '#ffffff',
      seed,
    })
    ctx.restore()

    ctx.save()
    blobPath(ctx, 0, 0, radius, seed, 0.14)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 24
    ctx.stroke()
    ctx.strokeStyle = 'rgba(59, 26, 79, 0.14)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()

    ctx.save()
    blobPath(ctx, 0, 0, radius, seed, 0.14)
    ctx.clip()
    holo(ctx, -radius, -radius, radius * 2, radius * 2, {
      opacity: 0.4,
      seed: seed + 4,
      sparkles: 12,
    })
    ctx.restore()
    ctx.save()
    fillRound(ctx, -radius * 0.62, radius * 0.42, radius * 1.24, 58, 29, '#ffffff')
    ctx.shadowColor = 'rgba(59, 26, 79, 0.25)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetY = 4
    ctx.fill()
    ctx.restore()
    drawText(ctx, caption, 0, radius * 0.42 + 40, {
      size: 30,
      weight: 400,
      family: FONT.display,
      color: '#3b1a4f',
      align: 'center',
      tracking: 3,
    })

    sparkle(ctx, radius * 0.55, -radius * 0.62, 22, '#ffffff', 0.9)
    sparkle(ctx, -radius * 0.66, -radius * 0.2, 12, '#fff6c8', 0.8)
    ctx.restore()
  }

  sticker(250, 470, 206, -0.09, photos[0], 'PHOTO 1', 61, 'CUTIE', '#ff8fc7')
  sticker(624, 736, 208, 0.07, photos[1], 'PHOTO 2', 62, 'LEGEND', '#67e8f9')

  // Loose mini stickers.
  star(ctx, 748, 352, 42, 19, 5, '#ffd166')
  star(ctx, 748, 352, 34, 15, 5, '#fff3c4')
  drawText(ctx, '100%', 748, 362, {
    size: 17,
    weight: 900,
    family: FONT.sans,
    color: '#7a4a00',
    align: 'center',
  })
  drawText(ctx, 'CUTE', 748, 384, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#7a4a00',
    align: 'center',
    tracking: 2,
  })

  drawText(ctx, caption || 'ONE SHOT, FOREVER', 54, 1084, {
    size: 14,
    weight: 700,
    family: FONT.mono,
    color: '#5b2c70',
    tracking: 3,
    maxWidth: 520,
  })
  drawText(ctx, 'PHOTO BOOTH · 06', 826, 1084, {
    size: 12,
    weight: 700,
    family: FONT.mono,
    color: '#7c3a91',
    align: 'right',
    tracking: 2,
  })

  holo(ctx, 0, 0, w, h, { opacity: 0.22, seed: 77, sparkles: 20 })
  gloss(ctx, 0, 0, w, h, { opacity: 0.1 })
}

/* ------------------------------------------------------------------ */
/* 23 · Holo dream arches                                              */
/* ------------------------------------------------------------------ */

export function paintHolo({ ctx, w, h, photos, caption }: Scene) {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#f6d5ff'],
    [0.22, '#dcc7ff'],
    [0.46, '#bdefff'],
    [0.7, '#ffd9ec'],
    [1, '#fff3c7'],
  ])
  ctx.fillRect(0, 0, w, h)

  const random = seeded(23)
  for (let i = 0; i < 10; i += 1) {
    const bx = random() * w
    const by = random() * h
    const radius = 140 + random() * 220
    ctx.fillStyle = radial(ctx, bx, by, 0, bx, by, radius, [
      [0, i % 2 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 160, 220, 0.25)'],
      [1, 'rgba(255, 255, 255, 0)'],
    ])
    ctx.fillRect(bx - radius, by - radius, radius * 2, radius * 2)
  }

  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.lineWidth = 1
  for (let i = 0; i < 9; i += 1) {
    ctx.beginPath()
    ctx.moveTo(0, 240 + i * 110)
    ctx.bezierCurveTo(280, 190 + i * 110, 600, 300 + i * 110, w, 240 + i * 110)
    ctx.stroke()
  }
  ctx.restore()

  drawText(ctx, 'HOLO', w / 2, 130, {
    size: 104,
    weight: 900,
    family: FONT.serif,
    color: '#ffffff',
    align: 'center',
    tracking: 6,
    shadow: { color: 'rgba(150, 80, 200, 0.4)', blur: 18, y: 5 },
  })
  drawText(ctx, 'DREAM', w / 2, 208, {
    size: 34,
    weight: 700,
    family: FONT.sans,
    color: '#8a5ab8',
    align: 'center',
    tracking: 18,
  })
  drawText(ctx, caption || 'ONE SHOT · FOREVER', w / 2, 252, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#9a6fb8',
    align: 'center',
    tracking: 4,
    maxWidth: 620,
  })

  const arch = (
    x: number,
    y: number,
    aw: number,
    ah: number,
    rotation: number,
    image: PhotoBitmap | null,
    label: string,
    caption: string,
  ) => {
    ctx.save()
    ctx.translate(x + aw / 2, y + ah / 2)
    ctx.rotate(rotation)
    ctx.shadowColor = 'rgba(120, 70, 160, 0.28)'
    ctx.shadowBlur = 28
    ctx.shadowOffsetY = 16
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
    archPath(ctx, -aw / 2 - 16, -ah / 2 - 16, aw + 32, ah + 32)
    ctx.fill()
    ctx.shadowColor = 'transparent'

    ctx.save()
    archPath(ctx, -aw / 2, -ah / 2, aw, ah)
    ctx.clip()
    photo(ctx, image, -aw / 2, -ah / 2, aw, ah, {
      label,
      tone: 'fade',
      placeholderBg: '#b79ae0',
      placeholderInk: '#ffffff',
      seed: label.length * 7,
    })
    ctx.fillStyle = 'rgba(190, 140, 255, 0.12)'
    ctx.fillRect(-aw / 2, -ah / 2, aw, ah)
    ctx.restore()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.lineWidth = 2
    archPath(ctx, -aw / 2, -ah / 2, aw, ah)
    ctx.stroke()

    ctx.save()
    archPath(ctx, -aw / 2, -ah / 2, aw, ah)
    ctx.clip()
    holo(ctx, -aw / 2, -ah / 2, aw, ah, {
      opacity: 0.38,
      seed: 40 + label.length,
      sparkles: 12,
      radius: 0,
    })
    ctx.restore()

    fillRound(ctx, -70, ah / 2 + 30, 140, 46, 23, 'rgba(255, 255, 255, 0.94)')
    drawText(ctx, caption, 0, ah / 2 + 61, {
      size: 20,
      family: FONT.script,
      color: '#7a4a9c',
      align: 'center',
    })
    ctx.restore()
  }

  arch(84, 356, 300, 400, -0.03, photos[0], 'PHOTO 1', 'you')
  arch(496, 424, 300, 400, 0.05, photos[1], 'PHOTO 2', 'me')

  for (let i = 0; i < 26; i += 1) {
    const sx = random() * w
    const sy = 280 + random() * (h - 360)
    const size = 3 + random() * 9
    sparkle(ctx, sx, sy, size, '#ffffff', 0.35 + random() * 0.5)
  }

  drawText(ctx, 'ISSUE 06 · 2026', 54, 1104, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#7a4a9c',
    tracking: 3,
  })
  drawText(ctx, 'PHOTO BOOTH', 826, 1104, {
    size: 13,
    weight: 700,
    family: FONT.mono,
    color: '#7a4a9c',
    align: 'right',
    tracking: 3,
  })

  holo(ctx, 0, 0, w, h, { opacity: 0.4, seed: 87, sparkles: 24 })
  gloss(ctx, 0, 0, w, h, { opacity: 0.16, angle: -0.7 })
}

/* ------------------------------------------------------------------ */
/* 22 · Minimal contact sheet                                          */
/* ------------------------------------------------------------------ */

export function paintContact({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.fillStyle = '#f2efe8'
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 22, 'rgba(40, 36, 30, 0.1)', 0.55)

  drawText(ctx, 'CONTACT SHEET', 66, 74, {
    size: 24,
    weight: 700,
    family: FONT.mono,
    color: '#2a2a2a',
    tracking: 5,
  })
  drawText(ctx, '35MM · ISO 400 · ROLL 06', 66, 104, {
    size: 11,
    weight: 500,
    family: FONT.mono,
    color: '#7c766a',
    tracking: 2.5,
  })
  drawText(ctx, formatDate(date, 'dotted'), w - 66, 74, {
    size: 15,
    weight: 700,
    family: FONT.mono,
    color: '#2a2a2a',
    align: 'right',
    tracking: 2,
  })
  drawText(ctx, 'PHOTO BOOTH · 06', w - 66, 104, {
    size: 11,
    family: FONT.mono,
    color: '#7c766a',
    align: 'right',
    tracking: 2.5,
  })
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(66, 132, w - 132, 2)

  const frame = (
    x: number,
    y: number,
    pw: number,
    ph: number,
    image: PhotoBitmap | null,
    number: string,
    label: string,
  ) => {
    ctx.save()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x - 14, y - 14, pw + 28, ph + 28)
    ctx.strokeStyle = 'rgba(42, 42, 42, 0.18)'
    ctx.lineWidth = 1
    ctx.strokeRect(x - 14, y - 14, pw + 28, ph + 28)
    ctx.restore()

    photo(ctx, image, x, y, pw, ph, {
      label,
      tone: 'fade',
      placeholderBg: '#d8d3c6',
      placeholderInk: '#4a463f',
      seed: number.charCodeAt(0),
    })
    ctx.strokeStyle = 'rgba(42, 42, 42, 0.35)'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, pw, ph)

    drawText(ctx, number, x, y + ph + 34, {
      size: 15,
      weight: 700,
      family: FONT.mono,
      color: '#5a5449',
      tracking: 2,
    })
  }

  frame(84, 190, 732, 400, photos[0], '01A', 'PHOTO 1')
  frame(84, 680, 732, 400, photos[1], '02A', 'PHOTO 2')

  // Grease-pencil marks on the second frame.
  ctx.save()
  ctx.strokeStyle = 'rgba(214, 69, 69, 0.8)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(400, 880, 210, 126, -0.12, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(406, 884, 200, 118, 0.06, 0.2, Math.PI * 1.85)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(604, 658)
  ctx.quadraticCurveTo(660, 630, 716, 658)
  ctx.stroke()
  ctx.restore()
  drawText(ctx, 'pick this one!', 640, 646, {
    size: 30,
    family: FONT.script,
    color: 'rgba(214, 69, 69, 0.9)',
    align: 'center',
  })

  drawText(ctx, caption || 'SMILE: MANDATORY · FLASH: AUTO', 84, 1150, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#7c766a',
    tracking: 2,
    maxWidth: 600,
  })
  drawText(ctx, 'PHOTO BOOTH · 2026', w - 84, 1150, {
    size: 11,
    weight: 700,
    family: FONT.mono,
    color: '#7c766a',
    align: 'right',
    tracking: 2,
  })
  ctx.strokeStyle = 'rgba(42, 42, 42, 0.4)'
  ctx.lineWidth = 1
  for (const corner of [
    [54, 152],
    [w - 54, 152],
    [54, 1160],
    [w - 54, 1160],
  ]) {
    const [cx, cy] = corner
    ctx.beginPath()
    ctx.moveTo(cx - 10, cy)
    ctx.lineTo(cx + 10, cy)
    ctx.moveTo(cx, cy - 10)
    ctx.lineTo(cx, cy + 10)
    ctx.stroke()
  }

  gloss(ctx, 0, 0, w, h, { opacity: 0.1, angle: -0.5 })
  holo(ctx, 0, 0, w, h, { opacity: 0.06, seed: 9, sparkles: 6 })
}

/* ------------------------------------------------------------------ */
/* 40 · Instagram post                                                 */
/* ------------------------------------------------------------------ */

export function paintInstagram({ ctx, w, h, photos, caption, date }: Scene) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)

  // Header: gradient avatar ring, handle, verified tick, location, menu.
  const avatar = { x: 46, y: 46, r: 25 }
  const ring = ['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5']
  ctx.save()
  ctx.translate(avatar.x, avatar.y)
  ring.forEach((color, index) => {
    ctx.beginPath()
    ctx.arc(0, 0, 30, (index / ring.length) * Math.PI * 2 - Math.PI / 2, ((index + 1) / ring.length) * Math.PI * 2 - Math.PI / 2)
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.stroke()
  })
  ctx.restore()
  ctx.save()
  circlePath(ctx, avatar.x, avatar.y, 25)
  ctx.clip()
  photo(ctx, photos[0], avatar.x - 25, avatar.y - 25, 50, 50, {
    label: 'YOU',
    seed: 41,
    placeholderBg: '#d9d2c4',
    placeholderInk: '#6d6455',
  })
  ctx.restore()

  const handle = 'photobooth06'
  drawText(ctx, handle, 88, 40, {
    size: 17,
    weight: 700,
    family: FONT.sans,
    color: '#1d1d1f',
    tracking: 0.1,
  })
  const handleWidth = ctx.measureText(handle).width
  ctx.save()
  ctx.translate(98 + handleWidth, 34)
  circlePath(ctx, 0, 0, 8)
  ctx.fillStyle = '#3897f0'
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-3.4, 0.4)
  ctx.lineTo(-1, 3)
  ctx.lineTo(3.6, -2.4)
  ctx.stroke()
  ctx.restore()

  drawText(ctx, 'Memory Lane · Photo Booth', 88, 64, {
    size: 11,
    family: FONT.sans,
    color: '#6e6e73',
    tracking: 0.1,
  })
  drawText(ctx, '•••', w - 44, 52, {
    size: 18,
    weight: 700,
    family: FONT.sans,
    color: '#1d1d1f',
    align: 'right',
    tracking: 2,
  })

  // The post itself.
  const photoTop = 92
  const photoHeight = 560
  photo(ctx, photos[0], 0, photoTop, w, photoHeight, {
    label: 'PHOTO 1',
    seed: 44,
    placeholderBg: '#cfc8ba',
    placeholderInk: '#6d6455',
  })

  // Action row.
  const iconY = 690
  ctx.save()
  ctx.fillStyle = '#ed4956'
  ctx.beginPath()
  ctx.moveTo(40, iconY + 16)
  ctx.bezierCurveTo(40, iconY + 8, 46, iconY, 54, iconY + 4)
  ctx.bezierCurveTo(58, iconY + 6, 60, iconY + 10, 60, iconY + 13)
  ctx.bezierCurveTo(60, iconY + 21, 52, iconY + 27, 40, iconY + 34)
  ctx.bezierCurveTo(28, iconY + 27, 20, iconY + 21, 20, iconY + 13)
  ctx.bezierCurveTo(20, iconY + 10, 22, iconY + 6, 26, iconY + 4)
  ctx.bezierCurveTo(34, iconY, 40, iconY + 8, 40, iconY + 16)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = '#1d1d1f'
  ctx.lineWidth = 2.2
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(102, iconY)
  ctx.quadraticCurveTo(102, iconY - 6, 108, iconY - 6)
  ctx.lineTo(132, iconY - 6)
  ctx.quadraticCurveTo(138, iconY - 6, 138, iconY)
  ctx.lineTo(138, iconY + 18)
  ctx.quadraticCurveTo(138, iconY + 24, 132, iconY + 24)
  ctx.lineTo(116, iconY + 24)
  ctx.lineTo(106, iconY + 32)
  ctx.lineTo(106, iconY + 24)
  ctx.quadraticCurveTo(102, iconY + 24, 102, iconY + 18)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(172, iconY - 4)
  ctx.lineTo(196, iconY - 2)
  ctx.lineTo(182, iconY + 16)
  ctx.lineTo(188, iconY + 30)
  ctx.lineTo(172, iconY + 20)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(w - 40, iconY - 6)
  ctx.lineTo(w - 40, iconY + 32)
  ctx.lineTo(w - 56, iconY + 20)
  ctx.lineTo(w - 72, iconY + 32)
  ctx.lineTo(w - 72, iconY - 6)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()

  drawText(ctx, '1,284 likes', 40, 756, {
    size: 15,
    weight: 700,
    family: FONT.sans,
    color: '#1d1d1f',
  })

  drawText(ctx, handle, 40, 792, {
    size: 14,
    weight: 700,
    family: FONT.sans,
    color: '#1d1d1f',
  })
  const lines = wrapText(ctx, caption || 'a good afternoon, kept.', w - 80, {
    size: 14,
    family: FONT.sans,
    weight: 400,
  })
  lines.slice(0, 2).forEach((line, index) => {
    drawText(ctx, line, 40, 816 + index * 20, {
      size: 14,
      family: FONT.sans,
      color: '#262626',
      maxWidth: w - 80,
    })
  })
  drawText(ctx, 'View all 48 comments', 40, 862, {
    size: 13,
    family: FONT.sans,
    color: '#8e8e93',
  })
  drawText(ctx, formatDate(date, 'long').toLowerCase(), 40, 891, {
    size: 9.5,
    family: FONT.sans,
    color: '#8e8e93',
    tracking: 1.2,
  })
  drawText(ctx, 'PHOTO BOOTH · 06', w - 40, 891, {
    size: 9,
    family: FONT.mono,
    color: '#b0b0b6',
    align: 'right',
    tracking: 1.2,
  })

  gloss(ctx, 0, 0, w, h, { opacity: 0.05, angle: -0.5 })
}

/* Kept local so the brief's third required style has one obvious entry. */
export const HOLO_PAINTERS = {
  poke: paintPoke,
  gta5: paintGta5,
  gta6: paintGta6,
  sticker: paintSticker,
  holo: paintHolo,
  contact: paintContact,
  instagram: paintInstagram,
}
