import type { SoundName } from '../audio'
import { mulberry32 } from '../rng'
import type { SportInput } from '../types'
import type { SportRun, SportStatus } from './types'

/**
 * PANAHAN — three arrows, one drifting wind, one target.
 *
 * The wind is the whole game: it pushes the arrow in flight by up to 28 px, so
 * the player aims *against* it. The reticle is steered with the arrow keys or
 * dragged with a finger; the shot is fired with A (or by lifting the finger).
 */

const FONT = '"Press Start 2P", monospace'
const W = 320
const H = 240

const CX = 238
const CY = 104
const RING = 40

const AIM_MIN_X = 174
const AIM_MAX_X = 302
const AIM_MIN_Y = 44
const AIM_MAX_Y = 164

const SHOTS = 3
const AIM_SPEED = 118
const WIND_DRIFT = 28
const FLIGHT_SECONDS = 0.42
const IMPACT_SECONDS = 0.85

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function fill(
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

function label(
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
  ctx.fillStyle = 'rgba(22, 26, 20, 0.55)'
  ctx.fillText(text, x + 1, y + 1)
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
}

function disc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
): void {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

export function createArchery(seed: number): SportRun {
  return new ArcheryRun(seed)
}

class ArcheryRun implements SportRun {
  status: SportStatus = 'playing'
  playerScore = 0
  readonly rivalScore: number

  private readonly rng: () => number
  private shotsLeft = SHOTS
  private phase: 'aim' | 'fly' | 'impact' = 'aim'
  private reticle = { x: CX, y: CY }
  private wind = 0
  private flight = 0
  private impact = 0
  private hit = { x: CX, y: CY }
  private lastPoints = 0
  private shake = 0
  private cue: SoundName | null = null

  constructor(seed: number) {
    this.rng = mulberry32(seed)
    this.rivalScore = 18 + Math.floor(this.rng() * 7)
    this.wind = this.rollWind()
  }

  private rollWind(): number {
    // One decimal, sometimes zero: a still field is a reward.
    return Math.round((this.rng() * 2 - 1) * 10) / 10
  }

  step(dt: number, input: SportInput): void {
    if (this.status !== 'playing') return

    if (this.phase === 'aim') {
      if (input.pointer) {
        this.reticle.x = clamp(input.pointer.x, AIM_MIN_X, AIM_MAX_X)
        this.reticle.y = clamp(input.pointer.y, AIM_MIN_Y, AIM_MAX_Y)
      }
      let dx = 0
      let dy = 0
      if (input.left) dx -= 1
      if (input.right) dx += 1
      if (input.up) dy -= 1
      if (input.down) dy += 1
      if (dx !== 0 || dy !== 0) {
        this.reticle.x = clamp(
          this.reticle.x + dx * AIM_SPEED * dt,
          AIM_MIN_X,
          AIM_MAX_X,
        )
        this.reticle.y = clamp(
          this.reticle.y + dy * AIM_SPEED * dt,
          AIM_MIN_Y,
          AIM_MAX_Y,
        )
      }
      if (input.aPressed) this.shoot()
      return
    }

    if (this.phase === 'fly') {
      this.flight += dt
      if (this.flight >= FLIGHT_SECONDS) this.land()
      return
    }

    this.impact += dt
    this.shake = Math.max(0, this.shake - dt * 4)
    if (this.impact >= IMPACT_SECONDS) this.advance()
  }

  private shoot(): void {
    this.hit = {
      x: clamp(this.reticle.x + this.wind * WIND_DRIFT, 0, W),
      y: this.reticle.y,
    }
    this.phase = 'fly'
    this.flight = 0
    this.cue = 'bow'
  }

  private land(): void {
    const distance = Math.hypot(this.hit.x - CX, this.hit.y - CY)
    this.lastPoints =
      distance <= 7 ? 10 : distance <= 14 ? 8 : distance <= 23 ? 6 : distance <= 32 ? 3 : 1
    this.playerScore += this.lastPoints
    this.phase = 'impact'
    this.impact = 0
    this.shake = this.lastPoints >= 8 ? 1.4 : 0.5
    this.cue = 'hit'
  }

  sound(): SoundName | null {
    const cue = this.cue
    this.cue = null
    return cue
  }

  private advance(): void {
    this.shotsLeft -= 1
    this.lastPoints = 0
    if (this.shotsLeft <= 0) {
      this.status = this.playerScore > this.rivalScore ? 'won' : 'lost'
      return
    }
    this.phase = 'aim'
    this.wind = this.rollWind()
    this.reticle = { x: CX, y: CY }
  }

  draw(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save()
    if (this.shake > 0 && this.phase === 'impact') {
      ctx.translate(Math.sin(time * 70) * this.shake, 0)
    }

    this.drawSky(ctx, time)
    this.drawTarget(ctx)
    this.drawArcher(ctx, time)
    this.drawShot(ctx)
    ctx.restore()

    this.drawHud(ctx)
  }

  private drawSky(ctx: CanvasRenderingContext2D, time: number): void {
    const sky = ctx.createLinearGradient(0, 0, 0, 150)
    sky.addColorStop(0, '#7fb7c9')
    sky.addColorStop(0.55, '#cfd9b0')
    sky.addColorStop(1, '#f0d9a2')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, 150)

    // Far hills, then the field.
    ctx.fillStyle = '#8ea86a'
    ctx.beginPath()
    ctx.ellipse(70, 152, 110, 44, 0, Math.PI, 0)
    ctx.fill()
    ctx.fillStyle = '#75975a'
    ctx.beginPath()
    ctx.ellipse(250, 154, 120, 34, 0, Math.PI, 0)
    ctx.fill()

    fill(ctx, 0, 150, W, 90, '#88a854')
    fill(ctx, 0, 150, W, 3, '#6d8c42')
    for (let i = 0; i < 26; i += 1) {
      const x = (i * 37 + 11) % W
      const sway = Math.sin(time * 1.6 + i) * 1.5
      fill(ctx, x + sway, 160 + ((i * 13) % 60), 1, 4, '#6f9245')
    }

    // A small pennant on the range post.
    fill(ctx, 296, 60, 2, 46, '#7a5a3a')
    ctx.fillStyle = '#d9534b'
    ctx.beginPath()
    ctx.moveTo(298, 60)
    ctx.lineTo(318, 66 + Math.sin(time * 3) * 2)
    ctx.lineTo(298, 72)
    ctx.closePath()
    ctx.fill()
  }

  private drawTarget(ctx: CanvasRenderingContext2D): void {
    // Legs.
    fill(ctx, CX - 22, CY + 30, 6, 46, '#7a5a3a')
    fill(ctx, CX + 16, CY + 30, 6, 46, '#7a5a3a')
    fill(ctx, CX - 30, CY + 74, 60, 4, '#5d4228')

    const rings: Array<[number, string]> = [
      [RING, '#efe3c8'],
      [RING * 0.82, '#c94f45'],
      [RING * 0.62, '#efe3c8'],
      [RING * 0.44, '#c94f45'],
      [RING * 0.26, '#e0a13c'],
    ]
    disc(ctx, CX, CY, RING + 2, '#4b3a24')
    for (const [radius, color] of rings) disc(ctx, CX, CY, radius, color)
    disc(ctx, CX, CY, 3, '#4b3a24')
  }

  private drawArcher(ctx: CanvasRenderingContext2D, time: number): void {
    const x = 52
    const y = 132
    // Shadow and legs.
    fill(ctx, x - 8, y + 30, 26, 4, 'rgba(40, 50, 30, 0.25)')
    fill(ctx, x + 2, y + 16, 5, 14, '#3c3226')
    fill(ctx, x + 9, y + 16, 5, 14, '#3c3226')
    // Body and sarong.
    fill(ctx, x, y - 2, 16, 20, '#c2603a')
    fill(ctx, x - 1, y + 14, 18, 8, '#8a4a2a')
    // Head and cap.
    fill(ctx, x + 3, y - 14, 10, 10, '#b97a4a')
    fill(ctx, x + 1, y - 17, 14, 4, '#2f4a6b')
    fill(ctx, x + 12, y - 16, 5, 2, '#2f4a6b')
    // Arms and bow.
    fill(ctx, x + 15, y - 4, 10, 3, '#b97a4a')
    ctx.strokeStyle = '#6b4a2f'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x + 27, y + 2, 13, -Math.PI / 2.2, Math.PI / 2.2)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(240, 235, 220, 0.7)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + 31, y - 9)
    ctx.lineTo(x + 31, y + 13)
    ctx.stroke()

    // Idle breath.
    fill(ctx, x + 15, y - 6 + Math.sin(time * 2) * 0.6, 10, 2, '#b97a4a')
  }

  private drawShot(ctx: CanvasRenderingContext2D): void {
    if (this.phase === 'aim') {
      const { x, y } = this.reticle
      const crosshair = (color: string, width: number, grow: number) => {
        ctx.strokeStyle = color
        ctx.lineWidth = width
        ctx.beginPath()
        ctx.moveTo(x - 18 - grow, y)
        ctx.lineTo(x - 6, y)
        ctx.moveTo(x + 6, y)
        ctx.lineTo(x + 18 + grow, y)
        ctx.moveTo(x, y - 18 - grow)
        ctx.lineTo(x, y - 6)
        ctx.moveTo(x, y + 6)
        ctx.lineTo(x, y + 18 + grow)
        ctx.moveTo(x + 14 + grow, y)
        ctx.arc(x, y, 14 + grow, 0, Math.PI * 2)
        ctx.stroke()
      }
      crosshair('rgba(20, 20, 20, 0.6)', 4, 1)
      crosshair('rgba(255, 255, 255, 0.95)', 1.5, 0)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fillRect(x - 1, y - 1, 2, 2)
      return
    }

    if (this.phase === 'fly') {
      const t = Math.min(1, this.flight / FLIGHT_SECONDS)
      const startX = 82
      const startY = 138
      const x = startX + (this.hit.x - startX) * t
      const y = startY + (this.hit.y - startY) * t - Math.sin(Math.PI * t) * 18
      ctx.strokeStyle = '#3a2a1a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x - 10, y + 2)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.fillStyle = '#efe3c8'
      ctx.beginPath()
      ctx.moveTo(x, y - 2)
      ctx.lineTo(x + 4, y)
      ctx.lineTo(x, y + 2)
      ctx.closePath()
      ctx.fill()
      return
    }

    // Landed: ring, dot, points.
    const age = this.impact / IMPACT_SECONDS
    disc(ctx, this.hit.x, this.hit.y, 2, '#2b2118')
    ctx.strokeStyle = `rgba(255, 248, 220, ${1 - age})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(this.hit.x, this.hit.y, 6 + age * 22, 0, Math.PI * 2)
    ctx.stroke()
    if (this.lastPoints > 0) {
      label(
        ctx,
        `+${this.lastPoints}`,
        this.hit.x,
        this.hit.y - 26 - age * 14,
        8,
        this.lastPoints >= 8 ? '#ffe08a' : '#f4ead2',
        'center',
      )
    }
  }

  private drawHud(ctx: CanvasRenderingContext2D): void {
    fill(ctx, 0, 0, W, 22, 'rgba(16, 22, 18, 0.74)')
    label(ctx, 'PANAHAN', 10, 7, 8, '#ffe9b8')

    // Wind: direction and strength. Five pips so the drift is learnable.
    const strength = Math.min(5, Math.round(Math.abs(this.wind) * 5))
    const dirText = this.wind > 0.05 ? '>>' : this.wind < -0.05 ? '<<' : '--'
    label(ctx, 'ANGIN', 188, 7, 6, '#cfe0c0', 'right')
    label(ctx, dirText, 198, 6, 8, '#ffe9b8')
    for (let i = 0; i < 5; i += 1) {
      fill(ctx, 224 + i * 7, 10, 5, 8, i < strength ? '#e0a13c' : 'rgba(255,255,255,0.18)')
    }

    label(ctx, 'KAMU', 10, 30, 6, 'rgba(240, 235, 210, 0.85)')
    label(ctx, String(this.playerScore), 10, 40, 14, '#fff3d0')
    label(ctx, 'SI ELANG', 310, 30, 6, 'rgba(240, 235, 210, 0.85)', 'right')
    label(ctx, String(this.rivalScore), 310, 40, 14, '#f4ead2', 'right')

    // Arrows left.
    for (let i = 0; i < SHOTS; i += 1) {
      const used = i >= this.shotsLeft
      const x = 12 + i * 18
      const y = 214
      fill(ctx, x, y, 12, 2, used ? 'rgba(255,255,255,0.18)' : '#f4ead2')
      ctx.fillStyle = used ? 'rgba(255,255,255,0.18)' : '#f4ead2'
      ctx.beginPath()
      ctx.moveTo(x + 12, y - 2)
      ctx.lineTo(x + 16, y + 1)
      ctx.lineTo(x + 12, y + 4)
      ctx.closePath()
      ctx.fill()
    }

    fill(ctx, 0, H - 14, W, 14, 'rgba(16, 22, 18, 0.6)')
    label(
      ctx,
      'ARAH BIDIK   A LEPAS',
      W / 2,
      H - 10,
      6,
      'rgba(240, 235, 210, 0.8)',
      'center',
    )
  }
}
