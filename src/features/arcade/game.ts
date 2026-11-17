import { STAGE_NAMES, STAGE_PATTERNS } from '../../content/arcade'
import type { ArcadeSoundName } from './sound'

/**
 * The whole brick-buster, with no React and no DOM: a fixed-step simulation
 * plus a Canvas 2D renderer. Keeping it headless means the cabinet can pause,
 * unmount or remount without the physics caring, and the collision code stays
 * readable on its own.
 */

export const PLAYFIELD_WIDTH = 320
export const PLAYFIELD_HEIGHT = 240

const FIXED_STEP = 1 / 120
const MAX_FRAME = 0.05

const PADDLE_BASE_WIDTH = 48
const PADDLE_HEIGHT = 6
const PADDLE_Y = 221
const PADDLE_SPEED = 340
const BALL_RADIUS = 3

const GRID = {
  cols: 8,
  marginX: 10,
  gapX: 4,
  brickWidth: 34,
  brickHeight: 10,
  gapY: 5,
  top: 38,
}

const BRICK_COLORS = ['#ff5c9a', '#ff9f43', '#ffd93d', '#5ee6c8', '#5aa9ff', '#b18cff']
const TOUGH_COLOR = '#d7e0ef'
const POWERUP_COLORS: Record<PowerupKind, string> = {
  wide: '#5ee6c8',
  slow: '#5aa9ff',
  multi: '#ff5c9a',
  life: '#ffd93d',
}
const POWERUP_LETTERS: Record<PowerupKind, string> = {
  wide: 'W',
  slow: 'S',
  multi: 'M',
  life: '+',
}

export type ArcadePhase =
  | 'menu'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'levelclear'
  | 'gameover'

export type PowerupKind = 'wide' | 'slow' | 'multi' | 'life'

export interface ArcadeSnapshot {
  phase: ArcadePhase
  score: number
  highScore: number
  level: number
  lives: number
  combo: number
  stageName: string
  newRecord: boolean
}

export interface ArcadeGameOptions {
  highScore: number
  reducedMotion: boolean
  onSnapshot: (snapshot: ArcadeSnapshot) => void
  onHighScore: (score: number) => void
  onSound: (name: ArcadeSoundName, pitch?: number) => void
}

interface Point {
  x: number
  y: number
}

interface Ball {
  x: number
  y: number
  vx: number
  vy: number
  speed: number
  trail: Point[]
}

interface Brick {
  x: number
  y: number
  w: number
  h: number
  hp: number
  maxHp: number
  color: string
}

interface Drop {
  x: number
  y: number
  vy: number
  kind: PowerupKind
  wobble: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  gravity: number
}

interface Floater {
  x: number
  y: number
  text: string
  life: number
  maxLife: number
  color: string
}

interface Star {
  x: number
  y: number
  size: number
  phase: number
  speed: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const rand = (min: number, max: number) => min + Math.random() * (max - min)

export class ArcadeGame {
  private readonly options: ArcadeGameOptions

  private phase: ArcadePhase = 'menu'
  private resumePhase: 'ready' | 'playing' = 'ready'
  private score = 0
  private highScore = 0
  private level = 1
  private lives = 3
  private combo = 0
  private newRecord = false

  private paddle = {
    x: (PLAYFIELD_WIDTH - PADDLE_BASE_WIDTH) / 2,
    y: PADDLE_Y,
    w: PADDLE_BASE_WIDTH,
    h: PADDLE_HEIGHT,
  }

  private balls: Ball[] = []
  private bricks: Brick[] = []
  private drops: Drop[] = []
  private particles: Particle[] = []
  private floaters: Floater[] = []
  private stars: Star[] = []

  private direction = 0
  private wideTimer = 0
  private slowTimer = 0
  private phaseTimer = 0
  private shake = 0
  private flash = 0
  private time = 0
  private accumulator = 0
  private lastSnapshotKey = ''

  constructor(options: ArcadeGameOptions) {
    this.options = options
    this.highScore = Math.max(0, Math.floor(options.highScore))
    this.buildLevel()
    this.attachBall()
    this.stars = Array.from({ length: 42 }, () => ({
      x: rand(4, PLAYFIELD_WIDTH - 4),
      y: rand(6, PLAYFIELD_HEIGHT - 30),
      size: Math.random() > 0.8 ? 2 : 1,
      phase: rand(0, Math.PI * 2),
      speed: rand(0.4, 1.4),
    }))
    this.emit()
  }

  // ---------------------------------------------------------------- state

  snapshot(): ArcadeSnapshot {
    return {
      phase: this.phase,
      score: this.score,
      highScore: this.highScore,
      level: this.level,
      lives: this.lives,
      combo: this.combo,
      stageName: STAGE_NAMES[(this.level - 1) % STAGE_NAMES.length],
      newRecord: this.newRecord,
    }
  }

  private emit() {
    const snapshot = this.snapshot()
    const key = [
      snapshot.phase,
      snapshot.score,
      snapshot.highScore,
      snapshot.level,
      snapshot.lives,
      snapshot.combo,
      snapshot.newRecord,
    ].join('|')
    if (key === this.lastSnapshotKey) return
    this.lastSnapshotKey = key
    this.options.onSnapshot(snapshot)
  }

  private sound(name: ArcadeSoundName, pitch?: number) {
    this.options.onSound(name, pitch)
  }

  private addScore(points: number) {
    if (points <= 0) return
    this.score += points
    if (this.score > this.highScore) {
      this.highScore = this.score
      this.newRecord = true
      this.options.onHighScore(this.highScore)
    }
  }

  // -------------------------------------------------------------- actions

  start() {
    if (this.phase !== 'menu' && this.phase !== 'gameover') return
    this.score = 0
    this.level = 1
    this.lives = 3
    this.combo = 0
    this.newRecord = false
    this.wideTimer = 0
    this.slowTimer = 0
    this.paddle.w = PADDLE_BASE_WIDTH
    this.paddle.x = (PLAYFIELD_WIDTH - this.paddle.w) / 2
    this.balls = []
    this.drops = []
    this.particles = []
    this.floaters = []
    this.shake = 0
    this.flash = 0
    this.buildLevel()
    this.attachBall()
    this.phase = 'ready'
    this.phaseTimer = 0
    this.sound('start')
    this.emit()
  }

  serve() {
    if (this.phase !== 'ready') return
    const ball = this.balls[0]
    if (!ball) return
    ball.x = this.paddle.x + this.paddle.w / 2
    ball.y = this.paddle.y - BALL_RADIUS - 2
    const speed = this.stageSpeed()
    const angle = rand(-0.5, 0.5)
    ball.speed = speed
    ball.vx = Math.sin(angle) * speed
    ball.vy = -Math.cos(angle) * speed
    ball.trail = []
    this.phase = 'playing'
    this.combo = 0
    this.sound('serve')
    this.emit()
  }

  pause() {
    if (this.phase !== 'ready' && this.phase !== 'playing') return
    this.resumePhase = this.phase
    this.phase = 'paused'
    this.direction = 0
    this.sound('pause')
    this.emit()
  }

  resume() {
    if (this.phase !== 'paused') return
    this.phase = this.resumePhase
    this.sound('pause')
    this.emit()
  }

  togglePause() {
    if (this.phase === 'paused') this.resume()
    else this.pause()
  }

  setDirection(direction: -1 | 0 | 1) {
    this.direction = direction
  }

  /** Direct pointer control: puts the centre of the paddle under `x`. */
  movePaddleTo(x: number) {
    if (this.phase !== 'ready' && this.phase !== 'playing') return
    this.paddle.x = clamp(x - this.paddle.w / 2, 0, PLAYFIELD_WIDTH - this.paddle.w)
    this.followPaddle()
  }

  // ---------------------------------------------------------------- update

  update(dt: number) {
    this.accumulator += clamp(dt, 0, MAX_FRAME)
    while (this.accumulator >= FIXED_STEP) {
      this.step(FIXED_STEP)
      this.accumulator -= FIXED_STEP
    }
  }

  private step(dt: number) {
    this.time += dt
    this.ageAtmosphere(dt)

    if (this.phase === 'menu' || this.phase === 'gameover') {
      this.updateParticles(dt)
      this.updateFloaters(dt)
      return
    }

    if (this.phase === 'paused') return

    if (this.phase === 'levelclear') {
      this.updateParticles(dt)
      this.updateFloaters(dt)
      this.phaseTimer -= dt
      if (this.phaseTimer <= 0) this.advanceLevel()
      return
    }

    this.updateTimers(dt)
    this.updatePaddle(dt)
    this.updateParticles(dt)
    this.updateFloaters(dt)

    if (this.phase === 'playing') {
      this.updateBalls(dt)
      this.updateDrops(dt)
      if (this.phase === 'playing' && this.bricks.every((brick) => brick.hp <= 0)) {
        this.completeLevel()
      }
    }
  }

  private ageAtmosphere(dt: number) {
    this.shake = Math.max(0, this.shake - dt * 3.2)
    this.flash = Math.max(0, this.flash - dt * 2.4)
  }

  private updateTimers(dt: number) {
    if (this.wideTimer > 0) {
      this.wideTimer = Math.max(0, this.wideTimer - dt)
      if (this.wideTimer === 0) this.setPaddleWidth(PADDLE_BASE_WIDTH)
    }
    if (this.slowTimer > 0) {
      this.slowTimer = Math.max(0, this.slowTimer - dt)
    }
  }

  private updatePaddle(dt: number) {
    if (this.direction !== 0) {
      this.paddle.x = clamp(
        this.paddle.x + this.direction * PADDLE_SPEED * dt,
        0,
        PLAYFIELD_WIDTH - this.paddle.w,
      )
    }
    this.followPaddle()
  }

  private followPaddle() {
    if (this.phase !== 'ready') return
    const ball = this.balls[0]
    if (!ball) return
    ball.x = clamp(
      this.paddle.x + this.paddle.w / 2,
      BALL_RADIUS,
      PLAYFIELD_WIDTH - BALL_RADIUS,
    )
    ball.y = this.paddle.y - BALL_RADIUS - 2
  }

  private updateBalls(dt: number) {
    const slowFactor = this.slowTimer > 0 ? 0.7 : 1
    const ballDt = dt * slowFactor
    let lost = false

    for (const ball of this.balls) {
      const previousY = ball.y
      ball.x += ball.vx * ballDt
      ball.y += ball.vy * ballDt

      if (ball.x - BALL_RADIUS < 0) {
        ball.x = BALL_RADIUS
        ball.vx = Math.abs(ball.vx)
        this.burst(ball.x, ball.y, '#5ee6c8', 2)
      } else if (ball.x + BALL_RADIUS > PLAYFIELD_WIDTH) {
        ball.x = PLAYFIELD_WIDTH - BALL_RADIUS
        ball.vx = -Math.abs(ball.vx)
        this.burst(ball.x, ball.y, '#5ee6c8', 2)
      }

      if (ball.y - BALL_RADIUS < 0) {
        ball.y = BALL_RADIUS
        ball.vy = Math.abs(ball.vy)
        this.burst(ball.x, ball.y, '#5ee6c8', 2)
      }

      if (ball.y - BALL_RADIUS > PLAYFIELD_HEIGHT) {
        ball.y = PLAYFIELD_HEIGHT + 20
        lost = true
        continue
      }

      this.collidePaddle(ball, previousY)
      this.collideBricks(ball)

      ball.trail.push({ x: ball.x, y: ball.y })
      if (ball.trail.length > 14) ball.trail.shift()
    }

    if (lost) {
      this.balls = this.balls.filter((ball) => ball.y <= PLAYFIELD_HEIGHT + 10)
      if (this.balls.length === 0) this.loseLife()
    }
  }

  private collidePaddle(ball: Ball, previousY: number) {
    const paddle = this.paddle
    if (ball.vy <= 0) return
    if (previousY + BALL_RADIUS > paddle.y + paddle.h) return
    if (ball.y + BALL_RADIUS < paddle.y) return
    if (ball.x < paddle.x - BALL_RADIUS || ball.x > paddle.x + paddle.w + BALL_RADIUS) {
      return
    }

    ball.y = paddle.y - BALL_RADIUS - 0.1
    const relative = clamp(
      (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2),
      -1,
      1,
    )
    const angle = relative * 1.05
    const maxSpeed = this.stageSpeed() * 1.35
    ball.speed = Math.min(ball.speed + 2, maxSpeed)
    ball.vx = Math.sin(angle) * ball.speed
    ball.vy = -Math.cos(angle) * ball.speed
    ball.trail = []

    this.combo = 0
    this.burst(ball.x, paddle.y, '#5ee6c8', 5)
    this.sound('paddle')
    this.emit()
  }

  private collideBricks(ball: Ball) {
    for (const brick of this.bricks) {
      if (brick.hp <= 0) continue

      const nearestX = clamp(ball.x, brick.x, brick.x + brick.w)
      const nearestY = clamp(ball.y, brick.y, brick.y + brick.h)
      const dx = ball.x - nearestX
      const dy = ball.y - nearestY
      if (dx * dx + dy * dy > BALL_RADIUS * BALL_RADIUS) continue

      const centerX = brick.x + brick.w / 2
      const centerY = brick.y + brick.h / 2
      const overlapX = brick.w / 2 + BALL_RADIUS - Math.abs(ball.x - centerX)
      const overlapY = brick.h / 2 + BALL_RADIUS - Math.abs(ball.y - centerY)

      if (overlapX < overlapY) {
        ball.vx = Math.abs(ball.vx) * (ball.x < centerX ? -1 : 1)
        ball.x = ball.x < centerX ? brick.x - BALL_RADIUS : brick.x + brick.w + BALL_RADIUS
      } else {
        ball.vy = Math.abs(ball.vy) * (ball.y < centerY ? -1 : 1)
        ball.y = ball.y < centerY ? brick.y - BALL_RADIUS : brick.y + brick.h + BALL_RADIUS
      }

      this.hitBrick(brick)
      break
    }
  }

  private hitBrick(brick: Brick) {
    brick.hp -= 1
    this.combo = Math.min(8, this.combo + 1)
    const brickX = brick.x + brick.w / 2
    const brickY = brick.y + brick.h / 2

    if (brick.hp > 0) {
      this.addScore(5 * this.combo)
      this.burst(brickX, brickY, brick.color, 5)
      this.floaters.push({
        x: brickX,
        y: brickY,
        text: `+${5 * this.combo}`,
        life: 0.7,
        maxLife: 0.7,
        color: brick.color,
      })
      this.sound('tough', this.combo)
      this.emit()
      return
    }

    const points = 10 * this.level * this.combo
    this.addScore(points)
    this.burst(brickX, brickY, brick.color, 14)
    this.floaters.push({
      x: brickX,
      y: brickY,
      text: this.combo > 1 ? `+${points} ×${this.combo}` : `+${points}`,
      life: 0.9,
      maxLife: 0.9,
      color: brick.color,
    })
    this.shake = Math.min(1, this.shake + 0.16)
    this.sound('brick', this.combo)

    if (Math.random() < 0.15) this.dropPowerup(brickX, brickY)

    this.emit()
  }

  private dropPowerup(x: number, y: number) {
    const roll = Math.random()
    const kind: PowerupKind =
      roll < 0.36 ? 'wide' : roll < 0.64 ? 'slow' : roll < 0.9 ? 'multi' : 'life'
    this.drops.push({
      x: clamp(x, 10, PLAYFIELD_WIDTH - 10),
      y,
      vy: 62,
      kind,
      wobble: rand(0, Math.PI * 2),
    })
  }

  private updateDrops(dt: number) {
    for (const drop of this.drops) {
      drop.y += drop.vy * dt
      drop.wobble += dt * 5

      if (
        drop.y + 6 >= this.paddle.y &&
        drop.y - 6 <= this.paddle.y + this.paddle.h &&
        drop.x >= this.paddle.x - 4 &&
        drop.x <= this.paddle.x + this.paddle.w + 4
      ) {
        this.collectPowerup(drop)
        drop.y = PLAYFIELD_HEIGHT + 30
      }
    }
    this.drops = this.drops.filter((drop) => drop.y < PLAYFIELD_HEIGHT + 20)
  }

  private collectPowerup(drop: Drop) {
    this.sound('power')
    this.burst(drop.x, drop.y, POWERUP_COLORS[drop.kind], 12)

    if (drop.kind === 'wide') {
      this.wideTimer = 10
      this.setPaddleWidth(PADDLE_BASE_WIDTH * 1.65)
    } else if (drop.kind === 'slow') {
      this.slowTimer = 8
    } else if (drop.kind === 'multi') {
      this.splitBalls()
    } else {
      this.lives = Math.min(5, this.lives + 1)
    }

    this.floaters.push({
      x: drop.x,
      y: drop.y - 4,
      text: POWERUP_LETTERS[drop.kind],
      life: 1.1,
      maxLife: 1.1,
      color: POWERUP_COLORS[drop.kind],
    })
    this.emit()
  }

  private setPaddleWidth(width: number) {
    const center = this.paddle.x + this.paddle.w / 2
    this.paddle.w = width
    this.paddle.x = clamp(center - width / 2, 0, PLAYFIELD_WIDTH - width)
    this.followPaddle()
  }

  private splitBalls() {
    const source = this.balls.find((ball) => ball.vy !== 0) ?? this.balls[0]
    if (!source || this.balls.length >= 5) return
    const speed = Math.max(source.speed, this.stageSpeed() * 0.9)
    for (const angle of [-0.38, 0.38]) {
      if (this.balls.length >= 5) break
      const direction = Math.atan2(source.vy, source.vx) + angle
      this.balls.push({
        x: source.x,
        y: source.y,
        vx: Math.cos(direction) * speed,
        vy: Math.sin(direction) * speed,
        speed,
        trail: [],
      })
    }
  }

  private loseLife() {
    this.lives -= 1
    this.combo = 0
    this.wideTimer = 0
    this.slowTimer = 0
    this.setPaddleWidth(PADDLE_BASE_WIDTH)
    this.drops = []
    this.flash = 1
    this.shake = 0.9
    this.sound('lose')
    this.emit()

    if (this.lives <= 0) {
      this.lives = 0
      this.phase = 'gameover'
      this.balls = []
      this.direction = 0
      this.sound('gameover')
      this.emit()
      return
    }

    this.attachBall()
    this.phase = 'ready'
    this.emit()
  }

  private completeLevel() {
    if (this.phase !== 'playing') return
    const bonus = 100 * this.level
    this.addScore(bonus)
    if (this.level % 3 === 0 && this.lives < 5) {
      this.lives += 1
      this.floaters.push({
        x: PLAYFIELD_WIDTH / 2,
        y: PLAYFIELD_HEIGHT - 44,
        text: '1 UP',
        life: 1.5,
        maxLife: 1.5,
        color: '#ffd93d',
      })
    }
    this.phase = 'levelclear'
    this.phaseTimer = 1.8
    this.drops = []
    this.wideTimer = 0
    this.slowTimer = 0
    this.setPaddleWidth(PADDLE_BASE_WIDTH)
    this.sound('level')
    this.emit()
  }

  private advanceLevel() {
    this.level += 1
    this.buildLevel()
    this.attachBall()
    this.phase = 'ready'
    this.phaseTimer = 0
    this.combo = 0
    this.emit()
  }

  // --------------------------------------------------------------- world

  private stageSpeed() {
    return Math.min(165 + (this.level - 1) * 10, 255)
  }

  private buildLevel() {
    const pattern = STAGE_PATTERNS[(this.level - 1) % STAGE_PATTERNS.length]
    this.bricks = []

    pattern.forEach((row, rowIndex) => {
      for (let col = 0; col < GRID.cols; col += 1) {
        const cell = row[col]
        if (!cell || cell === '.') continue
        const tough = cell === '='
        this.bricks.push({
          x: GRID.marginX + col * (GRID.brickWidth + GRID.gapX),
          y: GRID.top + rowIndex * (GRID.brickHeight + GRID.gapY),
          w: GRID.brickWidth,
          h: GRID.brickHeight,
          hp: tough ? 2 : 1,
          maxHp: tough ? 2 : 1,
          color: tough ? TOUGH_COLOR : BRICK_COLORS[rowIndex % BRICK_COLORS.length],
        })
      }
    })
  }

  private attachBall() {
    this.balls = [
      {
        x: this.paddle.x + this.paddle.w / 2,
        y: this.paddle.y - BALL_RADIUS - 2,
        vx: 0,
        vy: 0,
        speed: this.stageSpeed(),
        trail: [],
      },
    ]
    this.combo = 0
  }

  private burst(x: number, y: number, color: string, count: number) {
    const amount = this.options.reducedMotion ? Math.ceil(count / 3) : count
    for (let i = 0; i < amount; i += 1) {
      const angle = rand(0, Math.PI * 2)
      const speed = rand(30, 130)
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        life: rand(0.25, 0.65),
        maxLife: 0.65,
        size: Math.random() > 0.7 ? 2 : 1,
        color,
        gravity: rand(120, 300),
      })
    }
    if (this.particles.length > 260) {
      this.particles = this.particles.slice(-260)
    }
  }

  private updateParticles(dt: number) {
    for (const particle of this.particles) {
      particle.life -= dt
      particle.vy += particle.gravity * dt
      particle.x += particle.vx * dt
      particle.y += particle.vy * dt
    }
    this.particles = this.particles.filter((particle) => particle.life > 0)
  }

  private updateFloaters(dt: number) {
    for (const floater of this.floaters) {
      floater.life -= dt
      floater.y -= 14 * dt
    }
    this.floaters = this.floaters.filter((floater) => floater.life > 0)
  }

  // ----------------------------------------------------------------- draw

  draw(ctx: CanvasRenderingContext2D) {
    ctx.imageSmoothingEnabled = false
    const shakeX = this.options.reducedMotion ? 0 : rand(-1, 1) * this.shake * 2.4
    const shakeY = this.options.reducedMotion ? 0 : rand(-1, 1) * this.shake * 2.4

    ctx.save()
    ctx.translate(Math.round(shakeX), Math.round(shakeY))

    this.drawBackground(ctx)
    this.drawBricks(ctx)
    this.drawDrops(ctx)
    this.drawParticles(ctx)
    this.drawPaddle(ctx)
    this.drawBalls(ctx)
    this.drawFloaters(ctx)
    this.drawFrame(ctx)

    ctx.restore()

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 60, 110, ${this.flash * 0.16})`
      ctx.fillRect(0, 0, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT)
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createLinearGradient(0, 0, 0, PLAYFIELD_HEIGHT)
    gradient.addColorStop(0, '#080713')
    gradient.addColorStop(0.62, '#0a0918')
    gradient.addColorStop(1, '#120b22')
    ctx.fillStyle = gradient
    ctx.fillRect(-4, -4, PLAYFIELD_WIDTH + 8, PLAYFIELD_HEIGHT + 8)

    ctx.strokeStyle = 'rgba(122, 92, 255, 0.075)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 16; x < PLAYFIELD_WIDTH; x += 32) {
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, PLAYFIELD_HEIGHT)
    }
    for (let y = 14; y < PLAYFIELD_HEIGHT; y += 28) {
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(PLAYFIELD_WIDTH, y + 0.5)
    }
    ctx.stroke()

    for (const star of this.stars) {
      const alpha = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(this.time * star.speed + star.phase))
      ctx.fillStyle = `rgba(210, 225, 255, ${alpha.toFixed(3)})`
      ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size)
    }

    const glow = ctx.createRadialGradient(
      PLAYFIELD_WIDTH / 2,
      128,
      10,
      PLAYFIELD_WIDTH / 2,
      128,
      180,
    )
    glow.addColorStop(0, 'rgba(255, 92, 154, 0.055)')
    glow.addColorStop(0.6, 'rgba(90, 169, 255, 0.025)')
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT)
  }

  private drawBricks(ctx: CanvasRenderingContext2D) {
    for (const brick of this.bricks) {
      if (brick.hp <= 0) continue
      const x = Math.round(brick.x)
      const y = Math.round(brick.y)

      ctx.globalAlpha = 0.28
      ctx.fillStyle = brick.color
      ctx.fillRect(x - 1, y - 1, brick.w + 2, brick.h + 2)

      ctx.globalAlpha = 1
      ctx.fillStyle = brick.color
      ctx.fillRect(x, y, brick.w, brick.h)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.38)'
      ctx.fillRect(x, y, brick.w, 2)
      ctx.fillStyle = 'rgba(8, 5, 18, 0.3)'
      ctx.fillRect(x, y + brick.h - 2, brick.w, 2)

      if (brick.maxHp > 1 && brick.hp < brick.maxHp) {
        ctx.strokeStyle = 'rgba(12, 8, 24, 0.75)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x + 9, y + 1)
        ctx.lineTo(x + 13, y + 5)
        ctx.lineTo(x + 10, y + 9)
        ctx.moveTo(x + 23, y + 1)
        ctx.lineTo(x + 19, y + 5)
        ctx.lineTo(x + 23, y + 9)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
  }

  private drawPaddle(ctx: CanvasRenderingContext2D) {
    const x = Math.round(this.paddle.x)
    const y = Math.round(this.paddle.y)
    const w = Math.round(this.paddle.w)
    const h = this.paddle.h

    ctx.fillStyle = 'rgba(94, 230, 200, 0.12)'
    ctx.fillRect(x - 3, y - 2, w + 6, h + 4)
    ctx.fillStyle = 'rgba(94, 230, 200, 0.18)'
    ctx.fillRect(x - 2, y + h, w + 4, 2)

    const gradient = ctx.createLinearGradient(0, y, 0, y + h)
    gradient.addColorStop(0, this.wideTimer > 0 ? '#a7fff0' : '#80f2d8')
    gradient.addColorStop(0.45, '#5ee6c8')
    gradient.addColorStop(1, '#1f9f86')
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, w, h)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.fillRect(x + 2, y + 1, w - 4, 1)
    ctx.fillStyle = 'rgba(4, 30, 26, 0.55)'
    ctx.fillRect(x + 2, y + h - 1, w - 4, 1)
  }

  private drawBalls(ctx: CanvasRenderingContext2D) {
    for (const ball of this.balls) {
      ball.trail.forEach((point, index) => {
        const alpha = ((index + 1) / ball.trail.length) * 0.3
        ctx.fillStyle = `rgba(255, 246, 214, ${alpha.toFixed(3)})`
        ctx.fillRect(
          Math.round(point.x) - 1,
          Math.round(point.y) - 1,
          2,
          2,
        )
      })

      const x = Math.round(ball.x)
      const y = Math.round(ball.y)
      ctx.fillStyle = 'rgba(255, 240, 196, 0.2)'
      ctx.fillRect(x - 4, y - 4, 9, 9)
      ctx.fillStyle = '#fff6d6'
      ctx.fillRect(x - 2, y - 2, 5, 5)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x - 1, y - 1, 3, 3)
    }
  }

  private drawDrops(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const drop of this.drops) {
      const x = Math.round(drop.x + Math.sin(drop.wobble) * 2)
      const y = Math.round(drop.y)
      const color = POWERUP_COLORS[drop.kind]

      ctx.fillStyle = 'rgba(8, 6, 18, 0.75)'
      ctx.fillRect(x - 8, y - 4, 16, 9)
      ctx.fillStyle = color
      ctx.fillRect(x - 8, y - 5, 16, 8)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
      ctx.fillRect(x - 8, y - 5, 16, 1)
      ctx.fillStyle = '#0a0714'
      ctx.font = '6px "Press Start 2P", monospace'
      ctx.fillText(POWERUP_LETTERS[drop.kind], x, y + 0.5)
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    for (const particle of this.particles) {
      ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1)
      ctx.fillStyle = particle.color
      ctx.fillRect(
        Math.round(particle.x),
        Math.round(particle.y),
        particle.size,
        particle.size,
      )
    }
    ctx.globalAlpha = 1
  }

  private drawFloaters(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '6px "Press Start 2P", monospace'
    for (const floater of this.floaters) {
      ctx.globalAlpha = clamp(floater.life / floater.maxLife, 0, 1)
      ctx.fillStyle = '#080512'
      ctx.fillText(floater.text, Math.round(floater.x) + 1, Math.round(floater.y) + 1)
      ctx.fillStyle = floater.color
      ctx.fillText(floater.text, Math.round(floater.x), Math.round(floater.y))
    }
    ctx.globalAlpha = 1
  }

  private drawFrame(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(180, 150, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, PLAYFIELD_WIDTH - 1, PLAYFIELD_HEIGHT - 1)

    ctx.strokeStyle = 'rgba(94, 230, 200, 0.5)'
    const corner = 7
    ctx.beginPath()
    ctx.moveTo(1, 1 + corner)
    ctx.lineTo(1, 1)
    ctx.lineTo(1 + corner, 1)
    ctx.moveTo(PLAYFIELD_WIDTH - 1 - corner, 1)
    ctx.lineTo(PLAYFIELD_WIDTH - 1, 1)
    ctx.lineTo(PLAYFIELD_WIDTH - 1, 1 + corner)
    ctx.moveTo(1, PLAYFIELD_HEIGHT - 1 - corner)
    ctx.lineTo(1, PLAYFIELD_HEIGHT - 1)
    ctx.lineTo(1 + corner, PLAYFIELD_HEIGHT - 1)
    ctx.moveTo(PLAYFIELD_WIDTH - 1 - corner, PLAYFIELD_HEIGHT - 1)
    ctx.lineTo(PLAYFIELD_WIDTH - 1, PLAYFIELD_HEIGHT - 1)
    ctx.lineTo(PLAYFIELD_WIDTH - 1, PLAYFIELD_HEIGHT - 1 - corner)
    ctx.stroke()
  }
}
