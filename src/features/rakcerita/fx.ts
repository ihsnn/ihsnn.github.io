/**
 * Confetti, sparkles and hearts drawn on one full-screen canvas above the
 * stage. Particles are plain objects stepped by a single rAF loop that stops
 * as soon as the last one dies, so an idle page costs nothing.
 */

export interface BurstOptions {
  n?: number
  colors?: readonly string[]
  shape?: 'star' | 'rect' | 'circle' | 'heart'
  speed?: number
  gravity?: number
  life?: number
  size?: number
  up?: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  g: number
  life: number
  max: number
  size: number
  color: string
  shape: string
  rot: number
  vr: number
}

const COLORS = ['#E76489', '#F2C14E', '#2E8C8C', '#A9C74E', '#F2994A', '#F7BFD0', '#FFF3C9'] as const

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let parts: Particle[] = []
let raf = 0
let last = 0
let dpr = Math.min(2, window.devicePixelRatio || 1)

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function attachFx(el: HTMLCanvasElement | null) {
  canvas = el
  ctx = el ? el.getContext('2d') : null
  if (el) resizeFx()
}

export function resizeFx() {
  if (!canvas || !ctx) return
  dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = Math.floor(window.innerWidth * dpr)
  canvas.height = Math.floor(window.innerHeight * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function starPath(c: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  c.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = rot - Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.45 : r
    const px = x + Math.cos(a) * rr
    const py = y + Math.sin(a) * rr
    if (i) c.lineTo(px, py)
    else c.moveTo(px, py)
  }
  c.closePath()
}

function heartPath(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
  c.beginPath()
  c.moveTo(x, y + s * 0.9)
  c.bezierCurveTo(x - s * 1.2, y + s * 0.1, x - s, y - s * 0.8, x, y - s * 0.3)
  c.bezierCurveTo(x + s, y - s * 0.8, x + s * 1.2, y + s * 0.1, x, y + s * 0.9)
  c.closePath()
}

function tick(t: number) {
  if (!ctx) return
  const dt = Math.min(40, t - (last || t))
  last = t
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  parts = parts.filter((p) => p.life < p.max)
  for (const p of parts) {
    p.life += dt
    p.vy += (p.g * dt) / 1000
    p.x += (p.vx * dt) / 1000
    p.y += (p.vy * dt) / 1000
    p.vx *= 0.995
    p.rot += (p.vr * dt) / 1000
    const k = 1 - p.life / p.max
    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, k * 1.6))
    ctx.fillStyle = p.color
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62)
    else if (p.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(0, 0, p.size / 2, 0, 6.283)
      ctx.fill()
    } else if (p.shape === 'heart') {
      heartPath(ctx, 0, 0, p.size * 0.8)
      ctx.fill()
    } else {
      starPath(ctx, 0, 0, p.size, 0)
      ctx.fill()
    }
    ctx.restore()
  }
  if (parts.length) raf = requestAnimationFrame(tick)
  else {
    raf = 0
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  }
}

export function burst(x: number, y: number, o: BurstOptions = {}) {
  if (!ctx) return
  const thin = reducedMotion()
  const n = Math.max(1, Math.round((o.n ?? 14) * (thin ? 0.4 : 1)))
  const colors = o.colors ?? COLORS
  const shape = o.shape ?? 'star'
  for (let i = 0; i < n; i++) {
    const a = o.up ? -Math.PI / 2 + (Math.random() - 0.5) * 1.7 : Math.random() * Math.PI * 2
    const sp = (o.speed ?? 260) * (0.35 + Math.random() * 0.9)
    parts.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - (o.up ? 140 : 0),
      g: o.gravity ?? 620,
      life: 0,
      max: (o.life ?? 900) * (0.7 + Math.random() * 0.6),
      size: (o.size ?? 8) * (0.7 + Math.random() * 0.7),
      color: colors[(Math.random() * colors.length) | 0],
      shape,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 9,
    })
  }
  if (!raf) {
    last = 0
    raf = requestAnimationFrame(tick)
  }
}

export function spark(x: number, y: number) {
  burst(x, y, { n: 10, shape: 'star', speed: 190, gravity: 420, life: 780, size: 7 })
}

export function confettiBurst(rx = 0.5, ry = 0.5, n = 90, colors?: readonly string[]) {
  burst(window.innerWidth * rx, window.innerHeight * ry, {
    n,
    shape: 'rect',
    up: true,
    speed: 640,
    gravity: 900,
    life: 2100,
    size: 11,
    colors,
  })
}

export function clearFx() {
  parts = []
  if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
}
