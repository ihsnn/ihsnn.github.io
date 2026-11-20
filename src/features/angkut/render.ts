import { PX_PER_METER } from './terrain'
import { TRUCK, VIEW_HEIGHT, VIEW_WIDTH } from './engine'
import type { AngkutView, Cargo, DustFx, FloatFx, Level, Pickup } from './types'

/**
 * The 480 × 270 view out of the cab: a road built from the same height field
 * the wheels use, one big truck and the load of the day.
 *
 * No assets, no sprite sheets: sky, ridges, road, truck and cargo are drawn
 * from primitives every frame. The backing store is sized to the display's
 * density, so this module keeps speaking in the 480 × 270 design grid.
 */

const TYRE = '#1e1e23'
const TYRE_LIGHT = '#33333b'
const RIM = '#b8b3a6'
const RIM_DARK = '#7d786d'
const CHASSIS = '#2f3036'
const CHASSIS_LIGHT = '#4a4b52'
const CAB = '#d99a34'
const CAB_DARK = '#a86b1c'
const CAB_LIGHT = '#f0bd62'
const CAB_SHADE = '#8f5a14'
const GLASS = '#8ec6d8'
const GLASS_DARK = '#3f6a7a'
const STEEL = '#6b7076'
const STEEL_DARK = '#454a50'
const STEEL_LIGHT = '#8f959c'
const COIN = '#f2c14e'
const COIN_DARK = '#c28f1c'
const FUEL_CAN = '#d8543f'
const FUEL_CAN_DARK = '#8f2f22'
const PIXEL_FONT = '"Press Start 2P", monospace'

/** Where the sky meets the first ridge, in screen px. */
const HORIZON = 150
const START_X = 120

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function circle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fill()
}

function polygon(
  ctx: CanvasRenderingContext2D,
  points: ReadonlyArray<readonly [number, number]>,
  color: string,
) {
  ctx.fillStyle = color
  ctx.beginPath()
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.closePath()
  ctx.fill()
}

function hash(value: number, seed = 7): number {
  let h = Math.imul((value | 0) ^ seed, 0x27d4eb2d)
  h ^= h >>> 15
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  return (h >>> 0) / 4_294_967_296
}

export function renderAngkut(
  ctx: CanvasRenderingContext2D,
  view: AngkutView,
  time: number,
  reducedMotion: boolean,
) {
  const scaleX = ctx.canvas.width / VIEW_WIDTH
  const scaleY = ctx.canvas.height / VIEW_HEIGHT
  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0)
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)

  const camera = view.camera

  drawSky(ctx, view, time)
  if (!reducedMotion) drawWeather(ctx, view, time)
  drawRidges(ctx, view.level, camera)
  drawTerrain(ctx, view)
  drawRoadside(ctx, view)

  for (const pickup of view.pickups) {
    if (!pickup.taken) drawPickup(ctx, pickup, camera, time)
  }

  drawFinish(ctx, view)
  drawTruck(ctx, view, time, reducedMotion)

  for (const puff of view.dust) drawDust(ctx, puff, camera)
  for (const effect of view.effects) {
    drawEffect(ctx, effect, camera, view.level.palette.ink)
  }
}

function drawSky(ctx: CanvasRenderingContext2D, view: AngkutView, time: number) {
  const palette = view.level.palette
  const gradient = ctx.createLinearGradient(0, 0, 0, HORIZON + 80)
  gradient.addColorStop(0, palette.skyTop)
  gradient.addColorStop(1, palette.skyLow)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)

  const sunX = 374
  const sunY = 56 - view.camera.y * 0.04
  const glow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 64)
  glow.addColorStop(0, palette.sun)
  glow.addColorStop(0.34, `${palette.sun}55`)
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(sunX, sunY, 64, 0, Math.PI * 2)
  ctx.fill()
  circle(ctx, sunX, sunY, palette.night ? 14 : 19, palette.sun)

  if (palette.night) {
    for (let index = 0; index < 28; index += 1) {
      const x = (hash(index, 3) * VIEW_WIDTH + time * 0.004) % VIEW_WIDTH
      const y = hash(index, 11) * 104
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time * 0.0011 + index))
      ctx.fillStyle = `rgba(232, 238, 248, ${0.2 + twinkle * 0.55})`
      ctx.fillRect(x, y, 1.6, 1.6)
    }
  }

  ctx.globalAlpha = 0.32
  ctx.fillStyle = palette.haze
  ctx.fillRect(0, HORIZON - 26, VIEW_WIDTH, 52)
  ctx.globalAlpha = 1
}

function drawWeather(
  ctx: CanvasRenderingContext2D,
  view: AngkutView,
  time: number,
) {
  if (!view.level.palette.rain) return
  ctx.strokeStyle = 'rgba(200, 216, 240, 0.4)'
  ctx.lineWidth = 1
  for (let index = 0; index < 44; index += 1) {
    const drift = 0.55 + hash(index, 13)
    const x =
      (hash(index, 9) * (VIEW_WIDTH + 140) - time * 0.09 * drift) %
      (VIEW_WIDTH + 140)
    const y =
      (hash(index, 17) * (VIEW_HEIGHT + 100) + (time * 0.56 * drift) / 1) %
        (VIEW_HEIGHT + 100) -
      40
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x - 5, y + 16)
    ctx.stroke()
  }
}

function ridgeProfile(x: number, seed: number, amplitude: number): number {
  return (
    Math.sin(x * 0.0042 + seed) * amplitude +
    Math.sin(x * 0.011 + seed * 2.7) * amplitude * 0.42 +
    Math.sin(x * 0.027 + seed * 1.3) * amplitude * 0.16
  )
}

function drawRidges(
  ctx: CanvasRenderingContext2D,
  level: Level,
  camera: { x: number; y: number },
) {
  const palette = level.palette
  const layers = [
    { factor: 0.14, amp: 22, base: HORIZON - 20, color: palette.ridgeFar },
    { factor: 0.3, amp: 26, base: HORIZON + 8, color: palette.ridgeNear },
  ]

  for (const layer of layers) {
    ctx.fillStyle = layer.color
    ctx.beginPath()
    ctx.moveTo(0, VIEW_HEIGHT)
    for (let x = 0; x <= VIEW_WIDTH; x += 8) {
      const world = x + camera.x * layer.factor
      const y =
        layer.base -
        camera.y * layer.factor * 0.5 +
        ridgeProfile(world, layer.factor * 41, layer.amp)
      ctx.lineTo(x, y)
    }
    ctx.lineTo(VIEW_WIDTH, VIEW_HEIGHT)
    ctx.closePath()
    ctx.fill()
  }

  // Mist where the hills meet the road, so the layers do not stack flat.
  const mist = ctx.createLinearGradient(0, HORIZON - 36, 0, HORIZON + 62)
  mist.addColorStop(0, 'rgba(255, 255, 255, 0)')
  mist.addColorStop(0.55, `${palette.haze}55`)
  mist.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = mist
  ctx.fillRect(0, HORIZON - 36, VIEW_WIDTH, 98)
}

function drawTerrain(ctx: CanvasRenderingContext2D, view: AngkutView) {
  const palette = view.level.palette
  const camera = view.camera
  const left = camera.x - 24
  const right = camera.x + VIEW_WIDTH + 24
  const step = 3
  const ground = (x: number) => view.terrain.heightAt(x) - camera.y

  ctx.beginPath()
  ctx.moveTo(left - camera.x, VIEW_HEIGHT + 12)
  for (let x = left; x <= right; x += step) {
    ctx.lineTo(x - camera.x, ground(x))
  }
  ctx.lineTo(right - camera.x, VIEW_HEIGHT + 12)
  ctx.closePath()

  const soil = ctx.createLinearGradient(0, HORIZON - 60, 0, VIEW_HEIGHT)
  soil.addColorStop(0, palette.soil)
  soil.addColorStop(1, palette.soilDeep)
  ctx.fillStyle = soil
  ctx.fill()

  ctx.beginPath()
  for (let x = left; x <= right; x += step) {
    const y = ground(x)
    if (x === left) ctx.moveTo(x - camera.x, y + 6)
    else ctx.lineTo(x - camera.x, y + 6)
  }
  ctx.lineWidth = 18
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.55
  ctx.strokeStyle = palette.surfaceAlt
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.beginPath()
  for (let x = left; x <= right; x += step) {
    const y = ground(x)
    if (x === left) ctx.moveTo(x - camera.x, y)
    else ctx.lineTo(x - camera.x, y)
  }
  ctx.lineWidth = 9
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = palette.surface
  ctx.stroke()
  ctx.lineWidth = 2.4
  ctx.strokeStyle = palette.surfaceAlt
  ctx.stroke()

  const seed = view.level.terrain.seed
  for (let x = Math.floor(left / 26) * 26; x < right; x += 26) {
    const roll = hash(x, seed)
    if (roll < 0.58) continue
    const y = ground(x) + 13 + roll * 30
    const size = 1.4 + hash(x, seed + 3) * 2.2
    ctx.globalAlpha = 0.45
    ctx.fillStyle = palette.surfaceAlt
    ctx.beginPath()
    ctx.ellipse(x - camera.x, y, size * 1.8, size, 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

function drawRoadside(ctx: CanvasRenderingContext2D, view: AngkutView) {
  const palette = view.level.palette
  const camera = view.camera
  const seed = view.level.terrain.seed
  const left = camera.x - 30
  const right = camera.x + VIEW_WIDTH + 30
  const ground = (x: number) => view.terrain.heightAt(x) - camera.y

  for (let x = Math.floor(left / 42) * 42; x < right; x += 42) {
    const roll = hash(x, seed + 21)
    if (roll < 0.36) continue
    const y = ground(x) + 1
    ctx.strokeStyle = roll > 0.72 ? palette.surfaceAlt : palette.surface
    ctx.globalAlpha = 0.75
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(x - camera.x, y)
    ctx.lineTo(x - camera.x - 2.4, y - 5 - roll * 4)
    ctx.moveTo(x - camera.x + 1.4, y)
    ctx.lineTo(x - camera.x + 3.2, y - 4 - roll * 5)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const metre = 100 * PX_PER_METER
  const first = Math.max(0, Math.floor((camera.x - START_X) / metre))
  for (let mark = first; mark < first + 6; mark += 1) {
    const metres = mark * 100
    if (metres <= 0) continue
    const worldX = START_X + metres * PX_PER_METER
    if (worldX < camera.x - 40 || worldX > camera.x + VIEW_WIDTH + 40) continue
    const screenX = worldX - camera.x
    const screenY = ground(worldX)
    rect(ctx, screenX - 1, screenY - 22, 2, 22, palette.ink)
    ctx.globalAlpha = 0.92
    ctx.fillStyle = palette.surface
    ctx.fillRect(screenX - 12, screenY - 33, 24, 11)
    ctx.globalAlpha = 1
    ctx.fillStyle = palette.ink
    ctx.font = `5px ${PIXEL_FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${metres}`, screenX, screenY - 27)
  }
}

function drawPickup(
  ctx: CanvasRenderingContext2D,
  pickup: Pickup,
  camera: { x: number; y: number },
  time: number,
) {
  const x = pickup.x - camera.x
  const y = pickup.y - camera.y
  if (x < -30 || x > VIEW_WIDTH + 30) return

  if (pickup.kind === 'coin') {
    const squash = Math.abs(Math.cos(time * 0.004 + pickup.x * 0.01))
    const width = 3 + squash * 6
    circle(ctx, x, y, 9, 'rgba(255, 240, 180, 0.16)')
    ctx.fillStyle = COIN
    ctx.beginPath()
    ctx.ellipse(x, y, width, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = COIN_DARK
    ctx.lineWidth = 1.6
    ctx.stroke()
    if (width > 5) rect(ctx, x - 1, y - 4, 2, 8, COIN_DARK)
    return
  }

  const bob = Math.sin(time * 0.004 + pickup.x) * 2
  ctx.save()
  ctx.translate(x, y + bob)
  rect(ctx, -8, -10, 16, 20, FUEL_CAN)
  rect(ctx, -8, -10, 16, 3, FUEL_CAN_DARK)
  rect(ctx, -2, -14, 5, 4, FUEL_CAN_DARK)
  rect(ctx, -3, -5, 6, 8, FUEL_CAN_DARK)
  rect(ctx, -6, -3, 3, 5, '#f6e2bb')
  ctx.restore()
}

function drawFinish(ctx: CanvasRenderingContext2D, view: AngkutView) {
  const finishX = START_X + view.level.targetM * PX_PER_METER
  const screenX = finishX - view.camera.x
  if (screenX < -80 || screenX > VIEW_WIDTH + 80) return

  const screenY = view.terrain.heightAt(finishX) - view.camera.y
  rect(ctx, screenX - 2, screenY - 76, 4, 76, '#4a3a28')
  rect(ctx, screenX, screenY - 82, 52, 28, '#f4ead2')
  ctx.fillStyle = '#16161a'
  ctx.font = `7px ${PIXEL_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('DEPOT', screenX + 26, screenY - 68)

  for (let index = 0; index < 10; index += 1) {
    ctx.fillStyle = index % 2 === 0 ? '#f4ead2' : '#16161a'
    ctx.fillRect(screenX - 25 + index * 5, screenY - 4, 5, 5)
  }
}

function drawTruck(
  ctx: CanvasRenderingContext2D,
  view: AngkutView,
  time: number,
  reducedMotion: boolean,
) {
  const truck = view.truck
  const screenX = truck.x - view.camera.x
  const screenY = truck.y - view.camera.y
  const ground = view.terrain.heightAt(truck.x) - view.camera.y
  const height = Math.max(0, ground - screenY - TRUCK.wheelRadius)

  ctx.fillStyle = `rgba(20, 16, 12, ${clamp(0.3 - height / 360, 0.05, 0.3)})`
  ctx.beginPath()
  ctx.ellipse(
    screenX,
    ground + 2,
    Math.max(26, 64 - height * 0.08),
    7,
    0,
    0,
    Math.PI * 2,
  )
  ctx.fill()

  ctx.save()
  ctx.translate(screenX, screenY)
  ctx.rotate(truck.angle)

  drawWheel(
    ctx,
    -TRUCK.halfWheelbase,
    TRUCK.wheelRest - truck.rearTravel,
    truck.rearSpin,
    truck.rearTravel,
  )
  drawWheel(
    ctx,
    TRUCK.halfWheelbase,
    TRUCK.wheelRest - truck.frontTravel,
    truck.frontSpin,
    truck.frontTravel,
  )

  rect(ctx, TRUCK.bedRear - 4, -10, 8, 18, '#232326')

  rect(
    ctx,
    TRUCK.bedRear - 2,
    -22,
    TRUCK.frontBumper - TRUCK.bedRear + 2,
    10,
    CHASSIS,
  )
  rect(
    ctx,
    TRUCK.bedRear - 2,
    -22,
    TRUCK.frontBumper - TRUCK.bedRear + 2,
    3,
    CHASSIS_LIGHT,
  )

  drawBed(ctx, view.level.cargo, view.load)
  drawCargo(ctx, view.level.cargo, view.load)
  drawCab(ctx, view, time, reducedMotion)

  rect(ctx, -34, -10, 26, 12, STEEL)
  rect(ctx, -34, -10, 26, 3, STEEL_LIGHT)
  rect(ctx, 0, -12, 14, 9, STEEL_DARK)

  ctx.restore()

  if (!reducedMotion && truck.throttle > 0.15 && Math.abs(truck.speed) > 8) {
    for (let index = 0; index < 3; index += 1) {
      const age = (time * 0.0016 + index * 0.33) % 1
      ctx.fillStyle = `rgba(58, 55, 52, ${0.22 * (1 - age)})`
      ctx.beginPath()
      ctx.arc(
        screenX - 62 * Math.cos(truck.angle) + age * 14,
        screenY - 70 + age * 34,
        2 + age * 5,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
  }
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  spin: number,
  travel: number,
) {
  const radius = TRUCK.wheelRadius
  rect(ctx, x - 2, -14, 4, Math.max(3, y + 14), CHASSIS_LIGHT)
  circle(ctx, x, y, radius, TYRE)
  circle(ctx, x, y, radius - 1.5, TYRE_LIGHT)
  circle(ctx, x, y, radius - 4.5, TYRE)

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(spin)
  ctx.fillStyle = TYRE_LIGHT
  for (let index = 0; index < 6; index += 1) {
    ctx.save()
    ctx.rotate((index / 6) * Math.PI * 2)
    ctx.fillRect(-1.4, -radius + 1, 2.8, 4)
    ctx.restore()
  }
  circle(ctx, 0, 0, radius - 6.5, RIM_DARK)
  circle(ctx, 0, 0, radius - 8, RIM)
  ctx.fillStyle = RIM_DARK
  for (let index = 0; index < 5; index += 1) {
    ctx.save()
    ctx.rotate((index / 5) * Math.PI * 2)
    ctx.fillRect(-1, -radius + 10, 2, 3.2)
    ctx.restore()
  }
  circle(ctx, 0, 0, 2.4, RIM_DARK)
  ctx.restore()

  if (travel > TRUCK.wheelTravel - 1.5) {
    rect(ctx, x - 6, y - radius - 3, 12, 2, '#1a1a1e')
  }
}

function drawCab(
  ctx: CanvasRenderingContext2D,
  view: AngkutView,
  time: number,
  reducedMotion: boolean,
) {
  const night = Boolean(view.level.palette.night)
  const cabTop = TRUCK.cabTop
  const cabBack = TRUCK.cabRear
  const cabFront = TRUCK.cabFront
  const height = -cabTop - 8

  rect(ctx, cabBack, cabTop, cabFront - cabBack, height, CAB)
  rect(ctx, cabBack, cabTop, cabFront - cabBack, 5, CAB_LIGHT)
  rect(ctx, cabBack, -26, cabFront - cabBack, 12, CAB_DARK)

  polygon(
    ctx,
    [
      [cabBack + 5, cabTop + 8],
      [cabFront - 5, cabTop + 8],
      [cabFront - 2, cabTop + 24],
      [cabBack + 5, cabTop + 24],
    ],
    GLASS,
  )
  polygon(
    ctx,
    [
      [cabBack + 5, cabTop + 20],
      [cabFront - 3, cabTop + 20],
      [cabFront - 2, cabTop + 24],
      [cabBack + 5, cabTop + 24],
    ],
    GLASS_DARK,
  )

  circle(ctx, cabFront - 16, cabTop + 17, 4.2, '#2b2b31')
  rect(ctx, cabFront - 21, cabTop + 21, 10, 4, '#3a434f')

  ctx.fillStyle = CAB_SHADE
  ctx.fillRect(cabBack + 4, cabTop + 26, 1.4, 26)
  ctx.fillRect(cabFront - 9, cabTop + 28, 5, 2)
  ctx.fillStyle = CHASSIS
  ctx.fillRect(cabBack + 3, -22, 12, 4)

  ctx.fillStyle = CHASSIS
  ctx.fillRect(cabFront - 2, cabTop + 12, 5, 2)
  rect(ctx, cabFront + 3, cabTop + 8, 3, 9, CHASSIS_LIGHT)

  rect(ctx, cabFront, -18, 6, 12, CHASSIS_LIGHT)
  const lamp = night ? '#ffe9a8' : '#f6edc6'
  circle(ctx, cabFront + 1, -8, 2.6, lamp)
  circle(ctx, cabFront + 1, -14, 2.6, lamp)

  if (night) {
    const glow = ctx.createLinearGradient(cabFront, 0, cabFront + 150, -10)
    glow.addColorStop(0, 'rgba(255, 236, 170, 0.28)')
    glow.addColorStop(1, 'rgba(255, 236, 170, 0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.moveTo(cabFront + 2, -14)
    ctx.lineTo(cabFront + 150, -48)
    ctx.lineTo(cabFront + 150, 28)
    ctx.closePath()
    ctx.fill()
  }

  rect(ctx, cabBack - 5, cabTop - 14, 5, -cabTop + 2, CHASSIS)
  rect(ctx, cabBack - 5, cabTop - 16, 7, 3, CHASSIS_LIGHT)

  if (!reducedMotion && view.truck.throttle > 0.1) {
    void time
  }
}

function drawBed(ctx: CanvasRenderingContext2D, cargo: Cargo, load: number) {
  const rear = TRUCK.bedRear
  const front = TRUCK.bedFront
  const floor = TRUCK.bedFloor
  const top = TRUCK.bedTop

  rect(ctx, rear + 3, floor - 2, front - rear - 6, 6, '#2a2a2e')
  rect(ctx, rear, top, 6, floor - top, STEEL)
  rect(ctx, front - 6, top, 6, floor - top, STEEL)
  rect(ctx, rear, floor, front - rear, 5, STEEL_DARK)
  rect(ctx, rear, top, front - rear, 4, STEEL_LIGHT)

  ctx.fillStyle = STEEL_DARK
  for (let x = rear + 12; x < front - 8; x += 13) {
    ctx.fillRect(x, top + 5, 1.5, floor - top - 6)
  }

  ctx.globalAlpha = 0.8
  rect(ctx, rear + 6 + load * 3, top - 2, 4, 3, cargo.color)
  ctx.globalAlpha = 1
}

/* --------------------------------------------------------------------------
   Cargo. One painter per load shape, all in chassis-local coordinates with
   the bed floor at TRUCK.bedFloor.
   -------------------------------------------------------------------------- */

function drawCargo(
  ctx: CanvasRenderingContext2D,
  cargo: Cargo,
  load: number,
) {
  const baseY = TRUCK.bedFloor - 3
  const left = TRUCK.bedRear + 9 + load * 7
  const width = TRUCK.bedFront - TRUCK.bedRear - 18
  const height = cargo.height

  ctx.save()
  ctx.beginPath()
  ctx.rect(TRUCK.bedRear + 4, baseY - height - 14, TRUCK.bedFront - TRUCK.bedRear - 8, height + 16)
  ctx.clip()

  switch (cargo.shape) {
    case 'sand':
      drawSand(ctx, left, baseY, width, height, cargo)
      break
    case 'logs':
      drawLogs(ctx, left, baseY, width, height, cargo)
      break
    case 'rocks':
      drawRocks(ctx, left, baseY, width, cargo)
      break
    case 'cylinders':
      drawCylinders(ctx, left, baseY, width, height, cargo)
      break
    case 'livestock':
      drawLivestock(ctx, left, baseY, width, height, cargo)
      break
    case 'bags':
      drawBags(ctx, left, baseY, width, height, cargo)
      break
  }

  ctx.restore()
}

function drawSand(
  ctx: CanvasRenderingContext2D,
  left: number,
  baseY: number,
  width: number,
  height: number,
  cargo: Cargo,
) {
  const right = left + width
  ctx.fillStyle = cargo.color
  ctx.beginPath()
  ctx.moveTo(left - 4, baseY)
  ctx.lineTo(left, baseY - height * 0.55)
  ctx.quadraticCurveTo(
    left + width * 0.28,
    baseY - height * 1.25,
    left + width * 0.55,
    baseY - height * 0.9,
  )
  ctx.quadraticCurveTo(right, baseY - height * 1.1, right + 3, baseY)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = cargo.accent
  ctx.globalAlpha = 0.55
  for (let index = 0; index < 9; index += 1) {
    const x = left + hash(index, 5) * width
    const y = baseY - hash(index, 9) * height * 0.9
    ctx.fillRect(x, y, 1.6, 1.6)
  }
  ctx.globalAlpha = 1
  ctx.strokeStyle = cargo.colorDark
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(left - 2, baseY - 2)
  ctx.quadraticCurveTo(
    left + width * 0.4,
    baseY - height * 1.05,
    right + 1,
    baseY - 2,
  )
  ctx.stroke()
}

function drawLogs(
  ctx: CanvasRenderingContext2D,
  left: number,
  baseY: number,
  width: number,
  height: number,
  cargo: Cargo,
) {
  const logHeight = Math.max(8, height / 2.6)
  for (let row = 0; row < 2; row += 1) {
    const y = baseY - row * (logHeight - 1.5)
    const offset = row === 0 ? 0 : 6
    rect(ctx, left - offset, y - logHeight, width, logHeight, cargo.color)
    rect(ctx, left - offset, y - logHeight, width, 2, cargo.accent)
    ctx.fillStyle = cargo.colorDark
    for (let mark = left + 10; mark < left + width - 6; mark += 14) {
      ctx.fillRect(mark, y - logHeight + 2.5, 1.2, logHeight - 4)
    }
    // Sawn end at the back.
    circle(ctx, left - offset + 1.5, y - logHeight / 2, logHeight / 2 - 1, cargo.accent)
    circle(ctx, left - offset + 1.5, y - logHeight / 2, logHeight / 2 - 3, cargo.colorDark)
  }
}

function drawRocks(
  ctx: CanvasRenderingContext2D,
  left: number,
  baseY: number,
  width: number,
  cargo: Cargo,
) {
  const rocks = [
    { x: 0.1, y: 0.6, r: 0.3 },
    { x: 0.42, y: 0.75, r: 0.34 },
    { x: 0.72, y: 0.5, r: 0.26 },
    { x: 0.28, y: 1.15, r: 0.3 },
    { x: 0.62, y: 1.2, r: 0.28 },
  ]
  for (const rock of rocks) {
    const cx = left + width * rock.x
    const cy = baseY - width * rock.r * 0.6 * rock.y
    const r = width * rock.r * 0.55
    polygon(
      ctx,
      [
        [cx - r, cy],
        [cx - r * 0.45, cy - r * 0.95],
        [cx + r * 0.35, cy - r * 0.8],
        [cx + r, cy],
        [cx + r * 0.2, cy + r * 0.25],
      ],
      cargo.color,
    )
    polygon(
      ctx,
      [
        [cx - r * 0.45, cy - r * 0.95],
        [cx + r * 0.35, cy - r * 0.8],
        [cx + r * 0.2, cy - r * 0.2],
        [cx - r * 0.4, cy - r * 0.3],
      ],
      cargo.accent,
    )
  }
}

function drawCylinders(
  ctx: CanvasRenderingContext2D,
  left: number,
  baseY: number,
  width: number,
  height: number,
  cargo: Cargo,
) {
  const count = 4
  const gap = 4
  const bottleWidth = (width - gap * (count - 1)) / count
  for (let index = 0; index < count; index += 1) {
    const x = left + index * (bottleWidth + gap)
    const top = baseY - height - (index % 2 === 0 ? 0 : 3)
    rect(ctx, x, top, bottleWidth, height, cargo.color)
    rect(ctx, x + 1, top + 2, bottleWidth * 0.35, height - 4, cargo.accent)
    rect(ctx, x + bottleWidth * 0.28, top - 4, bottleWidth * 0.44, 5, cargo.colorDark)
    rect(ctx, x + bottleWidth * 0.4, top - 7, bottleWidth * 0.2, 4, STEEL)
    ctx.fillStyle = cargo.colorDark
    for (let band = top + 8; band < top + height - 6; band += 11) {
      ctx.fillRect(x, band, bottleWidth, 1.4)
    }
  }
}

function drawLivestock(
  ctx: CanvasRenderingContext2D,
  left: number,
  baseY: number,
  width: number,
  height: number,
  cargo: Cargo,
) {
  // A cow facing right, standing on the bed floor.
  const bodyX = left + 4
  const bodyY = baseY - height * 0.72
  const bodyW = width * 0.62
  const bodyH = height * 0.46

  ctx.fillStyle = cargo.color
  ctx.beginPath()
  ctx.ellipse(bodyX + bodyW / 2, bodyY, bodyW / 2, bodyH * 0.62, 0, 0, Math.PI * 2)
  ctx.fill()

  // Head, ear and horn.
  circle(ctx, bodyX + bodyW + 3, bodyY - 4, height * 0.18, cargo.color)
  polygon(
    ctx,
    [
      [bodyX + bodyW + 9, bodyY - 9],
      [bodyX + bodyW + 16, bodyY - 13],
      [bodyX + bodyW + 13, bodyY - 5],
    ],
    cargo.accent,
  )
  circle(ctx, bodyX + bodyW + 1.5, bodyY - 6, 3.2, cargo.accent)
  rect(ctx, bodyX + bodyW + 8, bodyY - 2, 3, 2, '#2a2018')

  // Legs.
  ctx.fillStyle = cargo.colorDark
  for (let index = 0; index < 3; index += 1) {
    const legX = bodyX + 6 + index * (bodyW / 3)
    ctx.fillRect(legX, bodyY + bodyH * 0.4, 3, baseY - (bodyY + bodyH * 0.4))
  }

  // A goat peeking over the side.
  circle(ctx, forGoat(left, width), baseY - height - 2, height * 0.16, cargo.accent)
  circle(ctx, forGoat(left, width) + 3, baseY - height - 4, 1.4, '#2a2018')
}

function forGoat(left: number, width: number): number {
  return left + width * 0.78
}

function drawBags(
  ctx: CanvasRenderingContext2D,
  left: number,
  baseY: number,
  width: number,
  height: number,
  cargo: Cargo,
) {
  const bagWidth = width / 3 - 2
  const bagHeight = height / 2.2
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const x = left + column * (bagWidth + 3) + (row === 1 ? 4 : 0)
      const y = baseY - bagHeight * (row + 1) + 2
      rect(ctx, x, y, bagWidth, bagHeight - 3, cargo.color)
      rect(ctx, x, y, bagWidth, 2, cargo.accent)
      ctx.fillStyle = cargo.colorDark
      ctx.fillRect(x + 2, y + bagHeight - 8, bagWidth - 4, 1.2)
      ctx.fillRect(x + bagWidth / 2 - 1, y + 2, 1.4, bagHeight - 7)
    }
  }
}

function drawDust(
  ctx: CanvasRenderingContext2D,
  puff: DustFx,
  camera: { x: number; y: number },
) {
  const life = clamp(1 - puff.age / puff.life, 0, 1)
  ctx.fillStyle = puff.smoke
    ? `rgba(214, 210, 200, ${life * 0.34})`
    : `rgba(150, 132, 100, ${life * 0.4})`
  ctx.beginPath()
  ctx.arc(puff.x - camera.x, puff.y - camera.y, puff.size, 0, Math.PI * 2)
  ctx.fill()
}

function drawEffect(
  ctx: CanvasRenderingContext2D,
  effect: FloatFx,
  camera: { x: number; y: number },
  ink: string,
) {
  const progress = clamp(effect.age / 1_100, 0, 1)
  const rise = progress * 34
  const alpha = 1 - progress * progress
  const x = effect.x - camera.x
  const y = effect.y - camera.y - rise
  if (x < -80 || x > VIEW_WIDTH + 80) return

  ctx.globalAlpha = alpha
  ctx.font = `8px ${PIXEL_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const color =
    effect.kind === 'coin'
      ? '#ffe08a'
      : effect.kind === 'fuel'
        ? '#8fe3a0'
        : effect.kind === 'slide'
          ? '#ff9b6b'
          : ink

  ctx.fillStyle = 'rgba(10, 8, 6, 0.55)'
  ctx.fillText(effect.text, x + 1, y + 1)
  ctx.fillStyle = color
  ctx.fillText(effect.text, x, y)
  ctx.globalAlpha = 1
}
