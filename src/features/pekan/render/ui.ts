import {
  SPORTS,
  TEAM_BY_ID,
} from '../../../content/pekan/island'
import {
  DIALOGUE,
  DEBUG,
  RESULT,
  TITLE,
  VERSUS,
} from '../../../content/pekan/copy'
import type {
  CompanionLook,
  DebugState,
  DialogueState,
  PekanSave,
  ResultState,
  TitleState,
  VersusState,
} from '../types'
import { drawCompanion } from './actors'

/** Every overlay, panel and label on the 320 × 240 screen. */

const FONT = '"Press Start 2P", monospace'
const CREAM = '#f4ead2'
const PANEL = 'rgba(24, 30, 24, 0.92)'
const GOLD = '#e8b44c'

export const DESIGN_W = 320
export const DESIGN_H = 240

export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: CanvasTextAlign = 'left',
): void {
  ctx.font = `${size}px ${FONT}`
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
}

export function fill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function panel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  border = CREAM,
): void {
  fill(ctx, x, y, w, h, PANEL)
  ctx.strokeStyle = border
  ctx.lineWidth = 2
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)
  ctx.strokeStyle = 'rgba(244, 234, 210, 0.22)'
  ctx.lineWidth = 1
  ctx.strokeRect(x + 4, y + 4, w - 8, h - 8)
}

export function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  size: number,
): string[] {
  ctx.font = `${size}px ${FONT}`
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

function scrollIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color = '#f4ead2',
): void {
  fill(ctx, x + 2, y + 1, 10, 10, color)
  fill(ctx, x, y, 3, 12, color)
  fill(ctx, x + 11, y, 3, 12, color)
  fill(ctx, x + 2, y + 1, 10, 1, 'rgba(90, 70, 40, 0.35)')
  fill(ctx, x + 4, y + 5, 6, 1, '#9a7f52')
  fill(ctx, x + 4, y + 8, 4, 1, '#9a7f52')
}

function dim(ctx: CanvasRenderingContext2D, alpha = 0.55): void {
  fill(ctx, 0, 0, DESIGN_W, DESIGN_H, `rgba(10, 14, 12, ${alpha})`)
}

// ------------------------------------------------------------------ HUD

export function drawHud(ctx: CanvasRenderingContext2D, save: PekanSave): void {
  fill(ctx, 4, 4, 78, 18, 'rgba(16, 22, 18, 0.6)')
  scrollIcon(ctx, 8, 7)
  label(ctx, `${save.scrolls.length}/${SPORTS.length}`, 26, 9, 8, '#ffe9b8')

  const team = TEAM_BY_ID.get(save.team)
  if (team) {
    const width = 8 + team.name.length * 6
    fill(ctx, DESIGN_W - width - 8, 7, width, 13, 'rgba(16, 22, 18, 0.7)')
    fill(ctx, DESIGN_W - width - 8, 7, 3, 13, team.color)
    label(ctx, team.name, DESIGN_W - width - 1, 10, 6, team.ink)
  }
}

export function drawLocation(
  ctx: CanvasRenderingContext2D,
  name: string,
  time: number,
): void {
  const alpha = Math.max(0, 1 - time / 2.4)
  if (alpha <= 0) return
  ctx.globalAlpha = alpha
  fill(ctx, 0, 26, DESIGN_W, 16, 'rgba(16, 22, 18, 0.55)')
  label(ctx, name, DESIGN_W / 2, 30, 8, CREAM, 'center')
  ctx.globalAlpha = 1
}

// ------------------------------------------------------------- dialogue

export function drawDialogue(
  ctx: CanvasRenderingContext2D,
  dialogue: DialogueState,
): void {
  const line = dialogue.npc.lines[dialogue.index]
  panel(ctx, 6, 158, 308, 76)
  fill(ctx, 12, 150, Math.min(200, 16 + line.speaker.length * 7), 14, '#3a2a1c')
  label(ctx, line.speaker, 18, 153, 6, '#ffe9b8')

  const lines = wrap(ctx, line.text, 284, 7)
  lines.slice(0, 3).forEach((text, index) => {
    label(ctx, text, 16, 172 + index * 13, 7, CREAM)
  })

  const more = dialogue.index < dialogue.npc.lines.length - 1
  label(
    ctx,
    more ? DIALOGUE.advance : dialogue.npc.sport ? DIALOGUE.sportPrompt : DIALOGUE.advance,
    298,
    216,
    6,
    GOLD,
    'right',
  )
}

// --------------------------------------------------------------- title

export function drawTitle(
  ctx: CanvasRenderingContext2D,
  title: TitleState,
  companion: CompanionLook,
  time: number,
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, 170)
  sky.addColorStop(0, '#20305a')
  sky.addColorStop(0.45, '#7a4a63')
  sky.addColorStop(0.8, '#e08a5a')
  sky.addColorStop(1, '#f2c078')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, DESIGN_W, 170)

  // Setting sun.
  ctx.fillStyle = '#ffd27a'
  ctx.beginPath()
  ctx.arc(244, 116, 26, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255, 210, 122, 0.22)'
  ctx.beginPath()
  ctx.arc(244, 116, 40, 0, Math.PI * 2)
  ctx.fill()

  // Hills.
  ctx.fillStyle = '#3f5a3a'
  ctx.beginPath()
  ctx.ellipse(70, 176, 130, 62, 0, Math.PI, 0)
  ctx.fill()
  ctx.fillStyle = '#2f4630'
  ctx.beginPath()
  ctx.ellipse(260, 182, 130, 52, 0, Math.PI, 0)
  ctx.fill()
  fill(ctx, 0, 170, DESIGN_W, 70, '#2b3f2b')
  fill(ctx, 0, 170, DESIGN_W, 2, '#22331f')

  // Bunting.
  const flags = ['#d9534b', '#e8b44c', '#5f9e4a', '#f4ead2']
  ctx.strokeStyle = 'rgba(30, 20, 15, 0.6)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, 30)
  ctx.quadraticCurveTo(160, 46, DESIGN_W, 30)
  ctx.stroke()
  for (let i = 0; i < 11; i += 1) {
    const x = 8 + i * 29
    const y = 32 + Math.sin((i / 10) * Math.PI) * 10
    ctx.fillStyle = flags[i % flags.length]
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 14, y)
    ctx.lineTo(x + 7, y + 12)
    ctx.closePath()
    ctx.fill()
  }

  // Title with a hard shadow so it reads over the sunset.
  const titleY = 62
  ctx.font = `24px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'rgba(20, 14, 10, 0.55)'
  ctx.fillText('PEKAN', 162, titleY + 3)
  ctx.fillText('RAYA', 162, titleY + 31)
  ctx.fillStyle = CREAM
  ctx.fillText('PEKAN', 160, titleY)
  ctx.fillText('RAYA', 160, titleY + 28)

  fill(ctx, 108, 126, 104, 2, GOLD)

  label(ctx, TITLE.subtitle, 160, 136, 6, '#f7e2bd', 'center')

  // Menu.
  const items: string[] = []
  if (title.hasSave) items.push(TITLE.continue)
  items.push(TITLE.start)
  if (title.hasSave) items.push(TITLE.erase)

  items.forEach((item, index) => {
    const y = 162 + index * 18
    const selected = index === title.index
    if (selected) {
      fill(ctx, 86, y - 4, 148, 16, 'rgba(24, 30, 24, 0.6)')
      label(ctx, '▶', 92, y, 8, GOLD)
    }
    label(ctx, item, 160, y, 8, selected ? CREAM : 'rgba(244, 234, 210, 0.55)', 'center')
  })

  if (title.message === 'erased') {
    label(ctx, TITLE.erased, 160, 210, 6, '#f2a6a0', 'center')
  }

  const bob = Math.sin(time * 2.2) * 2
  drawCompanion(ctx, 268, 186 + bob, companion, time)
  label(ctx, companion.name, 275, 208, 6, 'rgba(244, 234, 210, 0.8)', 'center')

  if (title.confirmingErase) {
    dim(ctx, 0.6)
    panel(ctx, 40, 96, 240, 64)
    const lines = wrap(ctx, TITLE.confirmErase, 216, 7)
    lines.forEach((text, index) => {
      label(ctx, text, 160, 110 + index * 14, 7, CREAM, 'center')
    })
  }

  label(ctx, TITLE.hint, 160, 224, 6, 'rgba(244, 234, 210, 0.55)', 'center')
}

// -------------------------------------------------------------- versus

export function drawVersus(
  ctx: CanvasRenderingContext2D,
  versus: VersusState,
): void {
  dim(ctx, 0.55)
  const t = versus.timer
  const phase = t < 0.8 ? 0 : t < 1.6 ? 1 : 2

  panel(ctx, 26, 62, 268, 118)

  if (phase === 0) {
    label(ctx, VERSUS.challenge, 160, 76, 6, '#cfe0c0', 'center')
    label(ctx, versus.meta.champion, 160, 94, 16, CREAM, 'center')
    label(ctx, versus.meta.title, 160, 118, 8, GOLD, 'center')
    const lines = wrap(ctx, versus.meta.hint, 240, 6)
    lines.slice(0, 3).forEach((text, index) => {
      label(ctx, text, 160, 136 + index * 12, 6, 'rgba(244, 234, 210, 0.75)', 'center')
    })
  } else if (phase === 1) {
    label(ctx, VERSUS.ready, 160, 92, 16, CREAM, 'center')
    label(ctx, versus.meta.champion, 160, 120, 8, GOLD, 'center')
  } else {
    label(ctx, VERSUS.go, 160, 96, 16, GOLD, 'center')
  }

  // Countdown pips.
  const pips = Math.min(3, Math.floor(t / 0.7))
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < pips ? GOLD : 'rgba(244, 234, 210, 0.2)'
    ctx.beginPath()
    ctx.arc(148 + i * 12, 160, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

// -------------------------------------------------------------- result

export function drawResult(ctx: CanvasRenderingContext2D, result: ResultState): void {  dim(ctx, 0.6)
  const slide = Math.min(1, result.timer / 0.25)
  const y = 38 + (1 - slide) * 16
  panel(ctx, 20, y, 280, 168, result.won ? GOLD : '#b8a89a')

  label(
    ctx,
    result.won ? RESULT.win : RESULT.lose,
    160,
    y + 16,
    16,
    result.won ? '#ffe08a' : '#e8b3a8',
    'center',
  )
  label(ctx, result.meta.title, 160, y + 40, 6, 'rgba(244, 234, 210, 0.7)', 'center')

  label(ctx, 'KAMU', 70, y + 60, 6, 'rgba(244, 234, 210, 0.7)', 'center')
  label(ctx, String(result.playerScore), 70, y + 72, 16, CREAM, 'center')
  label(ctx, 'VS', 160, y + 74, 8, 'rgba(244, 234, 210, 0.5)', 'center')
  label(ctx, result.meta.champion, 250, y + 60, 6, 'rgba(244, 234, 210, 0.7)', 'center')
  label(ctx, String(result.rivalScore), 250, y + 72, 16, CREAM, 'center')

  fill(ctx, 40, y + 100, 240, 1, 'rgba(244, 234, 210, 0.2)')

  if (result.firstScroll) {
    scrollIcon(ctx, 86, y + 106)
    label(ctx, RESULT.scrollWon, 108, y + 110, 7, GOLD)
    label(ctx, result.meta.scroll, 160, y + 126, 6, 'rgba(244, 234, 210, 0.75)', 'center')
  } else if (result.won) {
    label(ctx, RESULT.scrollAlready, 160, y + 114, 6, 'rgba(244, 234, 210, 0.75)', 'center')
  } else {
    label(ctx, RESULT.retryHint, 160, y + 114, 6, 'rgba(244, 234, 210, 0.75)', 'center')
  }

  label(ctx, RESULT.again, 160, y + 146, 6, GOLD, 'center')
}

// --------------------------------------------------------------- debug

export function drawDebug(ctx: CanvasRenderingContext2D, debug: DebugState): void {
  dim(ctx, 0.5)
  panel(ctx, 30, 60, 260, 120)
  label(ctx, DEBUG.title, 160, 72, 8, CREAM, 'center')
  DEBUG.rows.forEach((row, index) => {
    const y = 98 + index * 18
    const selected = index === debug.index
    if (selected) fill(ctx, 44, y - 4, 232, 16, 'rgba(232, 180, 76, 0.22)')
    label(ctx, row, 54, y, 7, selected ? GOLD : 'rgba(244, 234, 210, 0.7)')
  })
  label(ctx, DEBUG.hint, 160, 162, 6, 'rgba(244, 234, 210, 0.55)', 'center')
}

// ---------------------------------------------------------------- misc
