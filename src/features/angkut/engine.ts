import type {
  AngkutEvent,
  AngkutSnapshot,
  AngkutView,
  Cargo,
  DustFx,
  EndReason,
  FloatFx,
  Level,
  LevelId,
  LevelRecord,
  Phase,
  Pickup,
  Upgrades,
} from './types'
import { PX_PER_METER, START_X, Terrain, mulberry32 } from './terrain'

/**
 * The rules of ANGKUT, with no React and no canvas.
 *
 * The truck is a rigid body with a rigid axle pair: each wheel is a spring
 * pressed into the height field, and the drive force is clamped by the friction
 * cone under that wheel. That one decision is what makes the loads matter —
 * a heavy cargo eats the drive force, a tall cargo raises the centre of gravity
 * and pitches the truck over, a sliding cargo moves the centre of gravity
 * sideways every time the truck lands.
 *
 * Everything here is deterministic and frame-rate independent (fixed 180 Hz
 * substeps), so the same level, seed and inputs always play out the same way.
 */

export const VIEW_WIDTH = 480
export const VIEW_HEIGHT = 270

const STEP_MS = 1_000 / 180
const MAX_FRAME_MS = 90
const MAX_STEPS = 8

const GRAVITY = 800
const BASE_MASS = 1
/** Radius of gyration squared of the empty chassis, before the CoM offset. */
const K2 = 2_050

const SPRING = 200
const DAMPER = 26
/** Suspension force cap, in px/s� of body acceleration: the bump stop. */
const MAX_SUPPORT = 3_000
/** Drive force per unit of empty-truck mass, in px/s². */
const DRIVE = 1_150
const BRAKE_FORCE = 760
const REVERSE_FORCE = 250
const MAX_SPEED = 310
const MAX_ANGULAR = 9
const AIR_ALPHA = 3.2
/** How much of the contact-arm torque the drive is allowed to produce. */
const WHEELIE = 0.22
const ROLL_RESIST = 0.18

const BODY_MU = 0.6
const BODY_RESTITUTION = 0.1

const FLIP_COS = 0.12
const FLIP_HOLD = 1.15
const STALL_HOLD = 1.4

const FUEL_BASE = 100
const LOAD_MAX = 8
const LOAD_DECAY = 0.5

/** How the garage upgrades change the drive. */
const ENGINE_PER_LEVEL = 0.14
const GRIP_PER_LEVEL = 0.1
const TANK_PER_LEVEL = 0.2

/** Where a hard landing starts throwing the load around. */
const IMPACT_SOFT = 330
const IMPACT_HARD = 980

export const TRUCK = {
  wheelRadius: 17,
  /** Wheel centre below the axle at full extension, and its travel. */
  wheelRest: 6,
  wheelTravel: 20,
  halfWheelbase: 39,
  frameBottom: -12,
  bedRear: -64,
  bedFront: 6,
  bedFloor: -14,
  bedTop: -56,
  cabRear: 8,
  cabFront: 50,
  cabTop: -66,
  frontBumper: 54,
  /** Local centre of gravity of the empty chassis (above the axle line). */
  comY: -26,
  /** The engine and cab sit ahead of the axles, so an empty truck is nose-heavy. */
  comX: 16,
} as const

const BED_MIDDLE = (TRUCK.bedRear + TRUCK.bedFront) / 2

/** Collision outline points, in chassis-local px. */
const BODY_POINTS: ReadonlyArray<readonly [number, number]> = [
  [TRUCK.frontBumper, -10],
  [TRUCK.cabFront, TRUCK.cabTop],
  [TRUCK.cabRear, TRUCK.cabTop],
  [TRUCK.bedRear + 2, TRUCK.bedTop],
  [TRUCK.bedRear, -12],
  [-20, TRUCK.frameBottom],
  [16, TRUCK.frameBottom],
]

const WHEELS: ReadonlyArray<{ x: number; rear: boolean }> = [
  { x: -TRUCK.halfWheelbase, rear: true },
  { x: TRUCK.halfWheelbase, rear: false },
]

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function wrapAngle(value: number): number {
  let angle = value
  while (angle > Math.PI) angle -= Math.PI * 2
  while (angle < -Math.PI) angle += Math.PI * 2
  return angle
}

export interface AngkutOptions {
  level: Level
  onEvent: (event: AngkutEvent) => void
  /** Read live so a garage purchase applies to the next run. */
  upgrades: () => Upgrades
  recordFor: (id: LevelId) => LevelRecord | undefined
}

export class AngkutGame {
  private level: Level
  private terrain: Terrain
  private pickups: Pickup[] = []
  private effects: FloatFx[] = []
  private dust: DustFx[] = []

  private phase: Phase = 'idle'
  private endReason: EndReason | null = null

  private x = START_X
  private y = 0
  private vx = 0
  private vy = 0
  private angle = 0
  private angVel = 0

  private throttle = 0
  private brake = 0
  private fuel = FUEL_BASE
  private fuelMax = FUEL_BASE
  private stalled = false
  private stallTimer = 0

  private coins = 0
  private earned = 0
  private clearanceBonus = 0
  private bestM = 0
  private bestCoins = 0
  private cleared = false
  private newRecord = false

  private airTime = 0
  private flipTimer = 0
  private loadShift = 0
  private loadWarned = false

  private rearSpin = 0
  private frontSpin = 0
  private rearTravel = 0
  private frontTravel = 0
  private rearContact = false
  private frontContact = false
  private hadContact = true
  private wheelSlip = 0

  private camX = 0
  private camY = 0
  private accumulator = 0
  private nextId = 1
  private dustClock = 0

  constructor(private readonly options: AngkutOptions) {
    this.level = options.level
    this.terrain = new Terrain(this.level.terrain, this.level.targetM)
    this.reset(options.level)
  }

  /** Swap the route and park the truck on the start line. */
  selectLevel(level: Level) {
    this.reset(level)
  }

  /** Which route the truck is parked on. */
  levelId(): LevelId {
    return this.level.id
  }

  start() {
    const record = this.options.recordFor(this.level.id)
    this.bestM = record?.bestM ?? 0
    this.bestCoins = record?.bestCoins ?? 0
    this.cleared = record?.cleared ?? false

    this.phase = 'driving'
    this.endReason = null
    this.fuelMax = FUEL_BASE * (1 + TANK_PER_LEVEL * this.options.upgrades().tank)
    this.fuel = this.fuelMax
    this.coins = 0
    this.earned = 0
    this.clearanceBonus = 0
    this.newRecord = false
    this.stalled = false
    this.stallTimer = 0
    this.flipTimer = 0
    this.airTime = 0
    this.loadShift = 0
    this.loadWarned = false
    this.emit('start')
  }

  /** Both pedals plus the air control; 1 = held, 0 = released. */
  setInput(gas: number, brake: number) {
    this.throttle = clamp(gas, 0, 1)
    this.brake = clamp(brake, 0, 1)
  }

  update(dtMs: number) {
    this.accumulator += clamp(dtMs, 0, MAX_FRAME_MS)
    let steps = 0
    while (this.accumulator >= STEP_MS && steps < MAX_STEPS) {
      this.accumulator -= STEP_MS
      this.step(STEP_MS / 1_000)
      steps += 1
    }
    if (steps >= MAX_STEPS) this.accumulator = 0
  }

  view(): AngkutView {
    return {
      phase: this.phase,
      level: this.level,
      terrain: this.terrain,
      truck: {
        x: this.x,
        y: this.y,
        angle: this.angle,
        speed: this.vx,
        rearSpin: this.rearSpin,
        frontSpin: this.frontSpin,
        rearTravel: this.rearTravel,
        frontTravel: this.frontTravel,
        rearContact: this.rearContact,
        frontContact: this.frontContact,
        throttle: this.throttle,
        brake: this.brake,
      },
      camera: { x: this.camX, y: this.camY },
      pickups: this.pickups,
      effects: this.effects,
      dust: this.dust,
      fuel: this.fuelMax > 0 ? clamp(this.fuel / this.fuelMax, 0, 1) : 0,
      distance: this.distance(),
      load: clamp(this.loadShift / LOAD_MAX, -1, 1),
      levelCleared: this.cleared,
    }
  }

  snapshot(): AngkutSnapshot {
    return {
      phase: this.phase,
      levelId: this.level.id,
      distance: this.distance(),
      target: this.level.targetM,
      bestM: this.bestM,
      speed: Math.round((Math.abs(this.vx) / PX_PER_METER) * 3.6),
      fuel: this.fuelMax > 0 ? clamp(this.fuel / this.fuelMax, 0, 1) : 0,
      coins: this.coins,
      endReason: this.endReason,
      earned: this.phase === 'ended' ? this.earned : this.projectedEarned(),
      load: clamp(Math.abs(this.loadShift) / LOAD_MAX, 0, 1),
      loadShifted: Math.abs(this.loadShift) > LOAD_MAX * 0.45,
      airTime: this.airTime,
      cleared: this.cleared,
      newRecord: this.newRecord,
    }
  }

  /** Metres driven, never negative. */
  distance(): number {
    return Math.max(0, (this.x - START_X) / PX_PER_METER)
  }

  private projectedEarned(): number {
    return this.coins + Math.floor(this.distance() / 30)
  }

  private reset(level: Level) {
    this.level = level
    this.terrain = new Terrain(level.terrain, level.targetM)
    this.pickups = buildPickups(level, this.terrain)
    this.effects = []
    this.dust = []
    this.phase = 'idle'
    this.endReason = null
    this.fuelMax = FUEL_BASE * (1 + TANK_PER_LEVEL * this.options.upgrades().tank)
    this.fuel = this.fuelMax
    this.stalled = false
    this.stallTimer = 0
    this.coins = 0
    this.earned = 0
    this.clearanceBonus = 0
    this.newRecord = false
    this.flipTimer = 0
    this.airTime = 0
    this.loadShift = 0
    this.loadWarned = false
    this.hadContact = true
    this.wheelSlip = 0
    this.throttle = 0
    this.brake = 0
    this.accumulator = 0

    const record = this.options.recordFor(level.id)
    this.bestM = record?.bestM ?? 0
    this.bestCoins = record?.bestCoins ?? 0
    this.cleared = record?.cleared ?? false

    const ground = this.terrain.heightAt(START_X)
    this.x = START_X
    this.y = ground - TRUCK.wheelRadius - 2
    this.vx = 0
    this.vy = 0
    this.angle = 0
    this.angVel = 0
    this.rearSpin = 0
    this.frontSpin = 0
    this.rearContact = true
    this.frontContact = true
    this.camX = this.x - VIEW_WIDTH * 0.38
    this.camY = this.y - VIEW_HEIGHT * 0.58
  }

  private step(dt: number) {
    const cargo = this.level.cargo
    const upgrades = this.options.upgrades()
    const totalMass = BASE_MASS + cargo.mass
    const com = this.comLocal(cargo)
    const inertia = totalMass * (K2 + com.x * com.x + com.y * com.y)
    const invMass = 1 / totalMass
    const invI = 1 / inertia

    const cos = Math.cos(this.angle)
    const sin = Math.sin(this.angle)
    /** Chassis axes in world space: +y is "down" on screen. */
    const downX = -sin
    const downY = cos
    const upX = sin
    const upY = -cos
    const toWorld = (lx: number, ly: number) => ({
      x: this.x + lx * cos - ly * sin,
      y: this.y + lx * sin + ly * cos,
    })

    const driving = this.phase === 'driving'
    const gas = driving && !this.stalled ? this.throttle : 0
    const brake = driving ? this.brake : 0
    const engineMul = 1 + ENGINE_PER_LEVEL * upgrades.engine
    const gripMul = 1 + GRIP_PER_LEVEL * upgrades.tires
    const grip = this.level.grip * gripMul

    let fx = 0
    let fy = 0
    let torque = 0

    // Gravity through the centre of gravity — that offset is the whole game.
    const comWorld = toWorld(com.x, com.y)
    const weight = totalMass * GRAVITY
    fy += weight
    torque += (comWorld.x - this.x) * weight

    let contactCount = 0
    let slip = 0
    const curve = clamp(1 - (0.8 * Math.abs(this.vx)) / 500, 0.2, 1)

    for (const wheel of WHEELS) {
      // Raycast suspension: the wheel hangs from the axle along the chassis's
      // own down axis and slides up when it meets the road. The body never
      // takes the full impact, which is what keeps ramps from exploding.
      const anchorX = this.x + wheel.x * cos
      const anchorY = this.y + wheel.x * sin
      const reach = TRUCK.wheelRest + TRUCK.wheelRadius
      const tyreX = anchorX + downX * reach
      const tyreY = anchorY + downY * reach
      const groundY = this.terrain.heightAt(tyreX)
      const compression = clamp(tyreY - groundY, 0, TRUCK.wheelTravel)

      if (compression <= 0) {
        this.setContact(wheel.rear, false)
        if (wheel.rear) this.rearTravel = 0
        else this.frontTravel = 0
        const freeSpin = (this.vx / TRUCK.wheelRadius) * dt * 0.6
        if (wheel.rear) this.rearSpin += freeSpin
        else this.frontSpin += freeSpin
        continue
      }

      contactCount += 1
      this.setContact(wheel.rear, true)
      if (wheel.rear) this.rearTravel = compression
      else this.frontTravel = compression

      const normal = this.terrain.normalAt(tyreX)
      const rx = tyreX - this.x
      const ry = groundY - this.y
      const vpx = this.vx - this.angVel * ry
      const vpy = this.vy + this.angVel * rx
      const vn = vpx * normal.x + vpy * normal.y

      // Spring travel is the only compliance; the cap stops a deep landing
      // from turning into a catapult.
      const support = clamp(
        SPRING * compression - DAMPER * vn,
        0,
        MAX_SUPPORT,
      )
      const springForce = totalMass * support
      fx += upX * springForce
      fy += upY * springForce
      torque += rx * (upY * springForce) - ry * (upX * springForce)

      // Only the part of the push that goes into the road can make grip.
      const normalPush = Math.max(
        0,
        springForce * (upX * normal.x + upY * normal.y),
      )

      // Tangent pointing forward along the road.
      const tx = -normal.y
      const ty = normal.x
      const vt = vpx * tx + vpy * ty

      let demand = -vt * ROLL_RESIST * totalMass
      if (gas > 0 && !this.stalled) {
        demand +=
          gas *
          BASE_MASS *
          DRIVE *
          engineMul *
          curve *
          (wheel.rear ? 0.68 : 0.32)
      }
      if (brake > 0) {
        demand +=
          vt > 25
            ? -brake * BASE_MASS * BRAKE_FORCE
            : -brake * BASE_MASS * REVERSE_FORCE
      }

      const limit = grip * normalPush
      const traction = clamp(demand, -limit, limit)
      if (Math.abs(demand) > limit + 1) slip = Math.max(slip, 1)

      fx += tx * traction
      fy += ty * traction
      // Drive through a shortened arm: the truck rears up without looping.
      torque += WHEELIE * (rx * (ty * traction) - ry * (tx * traction))

      const spin = vt / TRUCK.wheelRadius
      if (wheel.rear) this.rearSpin += spin * dt
      else this.frontSpin += spin * dt
    }

    // Aerodynamic drag: the real top speed on a flat road, hills aside.
    fx -= this.vx * Math.abs(this.vx) * 0.0016 * totalMass

    this.wheelSlip = contactCount > 0 ? slip : 0

    // Chassis corners: keep the body out of the hill when it lands on its side.
    // Only the deepest point gets pushed out — moving on every point at once
    // used to launch the truck back out of the hill.
    let deepest = 0
    let deepestNormal = { x: 0, y: -1 }
    for (const point of BODY_POINTS) {
      const world = toWorld(point[0], point[1])
      const penetration = world.y - this.terrain.heightAt(world.x)
      if (penetration > deepest) {
        deepest = penetration
        deepestNormal = this.terrain.normalAt(world.x)
      }
    }
    if (deepest > 0) {
      const push = Math.min(deepest, 10)
      this.x += deepestNormal.x * push
      this.y += deepestNormal.y * push
    }

    for (const point of BODY_POINTS) {
      const world = toWorld(point[0], point[1])
      const groundY = this.terrain.heightAt(world.x)
      if (world.y - groundY <= 0) continue

      const normal = this.terrain.normalAt(world.x)
      const rx = world.x - this.x
      const ry = world.y - this.y
      const vpx = this.vx - this.angVel * ry
      const vpy = this.vy + this.angVel * rx
      const vn = vpx * normal.x + vpy * normal.y

      if (vn < 0) {
        const rn = rx * normal.y - ry * normal.x
        const impulse =
          (-(1 + BODY_RESTITUTION) * vn) / (invMass + rn * rn * invI)
        this.vx += normal.x * impulse * invMass
        this.vy += normal.y * impulse * invMass
        this.angVel += rn * impulse * invI

        const tx = -normal.y
        const ty = normal.x
        const vt = vpx * tx + vpy * ty
        const rt = rx * ty - ry * tx
        const maxFriction = BODY_MU * impulse
        const friction = clamp(
          -vt / (invMass + rt * rt * invI),
          -maxFriction,
          maxFriction,
        )
        this.vx += tx * friction * invMass
        this.vy += ty * friction * invMass
        this.angVel += rt * friction * invI
      }
    }

    if (contactCount === 0) {
      // Air control: gas lifts the nose, brake drops it. The classic deal.
      this.angVel += AIR_ALPHA * (brake - gas) * dt
    } else {
      // Pitch assist: as soon as a wheel is on the road the truck settles back
      // towards the surface angle. Without it a bump under the front wheel
      // turns every ramp into a backflip; in the air the player still owns the
      // rotation, which is where flips are supposed to happen.
      const target = Math.atan(this.terrain.slopeAt(this.x))
      const difference = wrapAngle(target - this.angle)
      const strength = contactCount === 2 ? 14 : 7
      const damping = contactCount === 2 ? 4 : 2.5
      this.angVel +=
        clamp(difference * strength - this.angVel * damping, -18, 18) * dt
    }

    // Touchdown bookkeeping, once per hop.
    if (contactCount > 0 && !this.hadContact) {
      this.touchdown()
    }
    if (contactCount === 0) this.airTime += dt
    this.hadContact = contactCount > 0

    this.vx += fx * invMass * dt
    this.vy += fy * invMass * dt
    this.angVel += torque * invI * dt
    this.angVel = clamp(this.angVel, -MAX_ANGULAR, MAX_ANGULAR)
    this.angVel *= Math.exp(-0.3 * dt)

    const speed = Math.hypot(this.vx, this.vy)
    const speedLimit = MAX_SPEED * 1.5
    if (speed > speedLimit) {
      const scale = speedLimit / speed
      this.vx *= scale
      this.vy *= scale
    }
    const forward = clamp(this.vx, -MAX_SPEED, MAX_SPEED)
    this.vx = forward
    this.vy = clamp(this.vy, -780, 780)

    this.x += this.vx * dt
    this.y += this.vy * dt
    this.angle += this.angVel * dt

    // Load creep: hard landings shove it, smooth driving lets it settle back.
    this.loadShift = clamp(
      this.loadShift - Math.sign(this.loadShift) * LOAD_DECAY * dt,
      -LOAD_MAX,
      LOAD_MAX,
    )

    if (driving) {
      this.consumeFuel(dt, cargo)
      this.collect()
      this.updateRunState(dt)
    }

    this.ageEffects(dt)
    this.emitDust(dt)
    this.updateCamera(dt)
  }

  private touchdown() {
    if (this.airTime > 0.45) {
      const bonus = Math.max(1, Math.round(this.airTime * 3))
      this.coins += bonus
      this.float('air', this.x, this.y - 40, `AIR +${bonus}`)
      this.emit('air')
    }

    const impact = this.vy
    if (impact > IMPACT_SOFT) {
      const force = clamp((impact - IMPACT_SOFT) / (IMPACT_HARD - IMPACT_SOFT), 0, 1)
      const cargo = this.level.cargo
      const shove = (0.5 + force * 1.6) * cargo.slide * (this.vx >= 0 ? 1 : -1)
      this.loadShift = clamp(this.loadShift + shove, -LOAD_MAX, LOAD_MAX)

      if (force > 0.22) {
        this.burstDust(5 + Math.round(force * 7), this.x, this.y + TRUCK.wheelRadius)
        this.emit('land')
      }
      if (Math.abs(this.loadShift) > LOAD_MAX * 0.45 && !this.loadWarned) {
        this.loadWarned = true
        this.float('slide', this.x, this.y - 56, 'MUATAN GESER')
        this.emit('slide')
      }
    }

    this.airTime = 0
  }

  private consumeFuel(dt: number, cargo: Cargo) {
    if (this.fuel <= 0) return
    const loadFactor = 1 + 0.25 * cargo.mass
    const speedRatio = Math.min(1, Math.abs(this.vx) / MAX_SPEED)
    const burn =
      (0.35 + 1.15 * this.throttle + 0.55 * speedRatio) * loadFactor * dt
    this.fuel -= burn
    if (this.fuel <= 0) {
      this.fuel = 0
      this.stalled = true
      this.stallTimer = 0
      this.float('fuel', this.x, this.y - 52, 'BENSIN HABIS')
      this.emit('stall')
    }
  }

  private collect() {
    const com = this.comLocal(this.level.cargo)
    const cos = Math.cos(this.angle)
    const sin = Math.sin(this.angle)
    const centreX = this.x + com.x * cos - com.y * sin
    const centreY = this.y + com.x * sin + com.y * cos

    for (const pickup of this.pickups) {
      if (pickup.taken) continue
      const dx = pickup.x - centreX
      const dy = pickup.y - centreY
      const reach = pickup.kind === 'fuel' ? 52 : 46
      if (dx * dx + dy * dy > reach * reach) continue

      pickup.taken = true
      if (pickup.kind === 'coin') {
        this.coins += 1
        this.float('coin', pickup.x, pickup.y - 6, '+1')
        this.emit('coin')
      } else {
        this.fuel = Math.min(this.fuelMax, this.fuel + this.fuelMax * 0.18)
        if (this.stalled && this.fuel > 0) this.stalled = false
        this.float('fuel', pickup.x, pickup.y - 10, '+BENSIN')
        this.emit('fuel')
      }
    }
  }

  private updateRunState(dt: number) {
    // "On its side" is measured by how the chassis is oriented, not by the raw
    // angle: a truck that rolled twice is still on its roof.
    const upright = Math.cos(this.angle)
    if (upright < FLIP_COS && this.hadContact) {
      this.flipTimer += dt
    } else if (upright > FLIP_COS + 0.25) {
      this.flipTimer = Math.max(0, this.flipTimer - dt * 2)
    }

    if (this.flipTimer > FLIP_HOLD) {
      this.endRun('flip')
      return
    }

    if (this.stalled) {
      this.stallTimer += dt
      if (
        this.stallTimer > STALL_HOLD &&
        (Math.abs(this.vx) < 16 || this.stallTimer > STALL_HOLD + 4)
      ) {
        this.endRun('fuel')
        return
      }
    }

    if (this.distance() >= this.level.targetM) {
      this.endRun('finish')
    }
  }

  private endRun(reason: EndReason) {
    if (this.phase === 'ended') return

    this.phase = 'ended'
    this.endReason = reason
    this.throttle = 0
    this.brake = 0
    this.earned = this.projectedEarned() + this.clearanceBonus
    if (reason === 'finish') this.earned += 25

    const distance = this.distance()
    if (distance > this.bestM) {
      this.bestM = distance
      this.newRecord = true
    }
    if (this.earned > this.bestCoins) {
      this.bestCoins = this.earned
      this.newRecord = true
    }
    if (reason === 'finish') this.cleared = true

    this.float(
      reason === 'finish' ? 'finish' : 'slide',
      this.x,
      this.y - 62,
      reason === 'finish' ? 'TIBA!' : reason === 'fuel' ? 'HABIS' : 'TERBALIK',
    )

    this.emit(
      reason === 'finish' ? 'finish' : reason === 'fuel' ? 'stall' : 'flip',
    )
    if (this.newRecord) this.emit('record')
  }

  private comLocal(cargo: Cargo): { x: number; y: number } {
    const total = BASE_MASS + cargo.mass
    const cargoX = BED_MIDDLE + cargo.offset
    const cargoY = TRUCK.bedFloor - 2 - cargo.height / 2
    return {
      x:
        (BASE_MASS * TRUCK.comX + cargo.mass * cargoX) / total +
        clamp(this.loadShift, -LOAD_MAX, LOAD_MAX),
      y: (BASE_MASS * TRUCK.comY + cargo.mass * cargoY) / total,
    }
  }

  private float(kind: FloatFx['kind'], x: number, y: number, text: string) {
    this.effects.push({ id: this.nextId++, kind, x, y, age: 0, text })
    if (this.effects.length > 14) this.effects.shift()
  }

  private burstDust(count: number, x: number, y: number) {
    for (let index = 0; index < count; index += 1) {
      const spread = (Math.random() - 0.5) * 90
      this.dust.push({
        id: this.nextId++,
        x: x + (Math.random() - 0.5) * 26,
        y: y - Math.random() * 8,
        vx: spread,
        vy: -30 - Math.random() * 70,
        age: 0,
        life: 0.55 + Math.random() * 0.5,
        size: 2 + Math.random() * 4,
        smoke: false,
      })
    }
    this.trimDust()
  }

  private emitDust(dt: number) {
    if (this.dust.length > 0) {
      for (const puff of this.dust) {
        puff.age += dt
        puff.x += puff.vx * dt
        puff.y += puff.vy * dt
        puff.vy += 110 * dt
        puff.vx *= 1 - 1.6 * dt
        puff.size += dt * 5
      }
      this.dust = this.dust.filter((puff) => puff.age < puff.life)
    }

    if (this.phase !== 'driving' || !this.rearContact) return
    this.dustClock -= dt
    if (this.dustClock > 0) return
    this.dustClock = 0.055

    const fast = Math.abs(this.vx) > 120
    if (this.wheelSlip < 1 && !fast) return
    const rear = this.wheelWorld(-TRUCK.halfWheelbase)
    this.dust.push({
      id: this.nextId++,
      x: rear.x,
      y: rear.y + TRUCK.wheelRadius,
      vx: -this.vx * 0.16 + (Math.random() - 0.5) * 40,
      vy: -20 - Math.random() * 50,
      age: 0,
      life: 0.4 + Math.random() * 0.4,
      size: 2 + Math.random() * 3,
      smoke: this.wheelSlip > 0,
    })
    this.trimDust()
  }

  private trimDust() {
    if (this.dust.length > 54) this.dust.splice(0, this.dust.length - 54)
  }

  private wheelWorld(localX: number): { x: number; y: number } {
    const cos = Math.cos(this.angle)
    const sin = Math.sin(this.angle)
    return { x: this.x + localX * cos, y: this.y + localX * sin }
  }

  private ageEffects(dt: number) {
    for (const effect of this.effects) effect.age += dt * 1_000
    this.effects = this.effects.filter((effect) => effect.age < 1_100)
  }

  private updateCamera(dt: number) {
    const targetX = this.x - VIEW_WIDTH * 0.38
    const targetY = this.y - VIEW_HEIGHT * 0.56
    this.camX += (targetX - this.camX) * (1 - Math.exp(-6 * dt))
    this.camY += (targetY - this.camY) * (1 - Math.exp(-3.6 * dt))
  }

  private setContact(rear: boolean, contact: boolean) {
    if (rear) this.rearContact = contact
    else this.frontContact = contact
  }

  private emit(event: AngkutEvent) {
    this.options.onEvent(event)
  }
}

/** The snapshot before the first run, so the page can render immediately. */
export function idleSnapshot(
  level: Level,
  record: LevelRecord | undefined,
): AngkutSnapshot {
  return {
    phase: 'idle',
    levelId: level.id,
    distance: 0,
    target: level.targetM,
    bestM: record?.bestM ?? 0,
    speed: 0,
    fuel: 1,
    coins: 0,
    endReason: null,
    earned: 0,
    load: 0,
    loadShifted: false,
    airTime: 0,
    cleared: record?.cleared ?? false,
    newRecord: false,
  }
}

/** Coins and jerry cans for a whole run, deterministic per level seed. */
function buildPickups(level: Level, terrain: Terrain): Pickup[] {
  const random = mulberry32(level.terrain.seed ^ 0x5f3a)
  const pickups: Pickup[] = []
  const start = START_X + 420
  const finish = terrain.finishLineX - 60
  let id = 1

  for (let x = start; x < finish; x += 150 + random() * 90) {
    const extra = random() < 0.16 ? 3 : 1
    for (let index = 0; index < extra; index += 1) {
      const coinX = x + index * 26
      pickups.push({
        id: id++,
        kind: 'coin',
        x: coinX,
        y: terrain.heightAt(coinX) - 30,
        taken: false,
      })
    }
  }

  for (let x = start + 880; x < finish; x += 2_100 + random() * 600) {
    pickups.push({
      id: id++,
      kind: 'fuel',
      x,
      y: terrain.heightAt(x) - 18,
      taken: false,
    })
  }

  return pickups
}











