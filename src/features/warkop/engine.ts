import { MENU_ITEMS, formatNumber } from '../../content/warkop'
import type {
  CustomerState,
  CustomerView,
  FloatFx,
  ItemId,
  Phase,
  WarkopEvent,
  WarkopSnapshot,
  WarkopView,
} from './types'

/**
 * The rules of the warkop, with no React and no canvas.
 *
 * One day is a fixed 90 seconds. Customers arrive on a curve that tightens
 * towards closing; each one waits on a patience bar, orders one to three menu
 * items, and pays the menu total plus a tip that shrinks with the wait. The
 * player cooks at five parallel stations, and a finished order is handed over
 * automatically — the game is throughput, not clicking plates.
 */

export const DAY_MS = 90_000

/** Two burners on purpose: the player has to choose what to cook next. */
export const MAX_BURNERS = 2

const SEATS = [40, 120, 200, 280] as const
const WALK_IN_MS = 110
const HAPPY_MS = 620
const LEAVE_SPEED = 180
const START_SPAWN_MS = 800
const SPAWN_SLOW = 4_800
const SPAWN_FAST = 2_600
const PATIENCE_SLOW = 18_000
const PATIENCE_FAST = 11_000
const EXTRA_PATIENCE = 1_200
const NEXT_CUSTOMER_MS = 1_700

const TIP_BASE = 0.08
const TIP_TOP = 0.32

const ITEM_IDS: readonly ItemId[] = MENU_ITEMS.map((item) => item.id)

const MENU_BY_ID = new Map(MENU_ITEMS.map((item) => [item.id, item]))
const ITEM_ORDER = new Map(ITEM_IDS.map((id, index) => [id, index]))

const ORDER_WEIGHTS: Record<ItemId, number> = {
  kopi: 3,
  teh: 3,
  mie: 2,
  nasi: 2,
  gorengan: 3,
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function emptyCounts(): Record<ItemId, number> {
  return { kopi: 0, teh: 0, mie: 0, nasi: 0, gorengan: 0 }
}

function countOrder(order: readonly ItemId[]): Map<ItemId, number> {
  const counts = new Map<ItemId, number>()
  for (const id of order) {
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}

interface Customer {
  id: number
  seat: number
  x: number
  targetX: number
  order: ItemId[]
  state: CustomerState
  angry: boolean
  variant: number
  patienceMs: number
  maxPatienceMs: number
  stateMs: number
  remove: boolean
}

export interface WarkopOptions {
  best: number
  onEvent: (event: WarkopEvent) => void
}

export class WarkopGame {
  private phase: Phase = 'closed'
  private remainingMs = DAY_MS
  private coins = 0
  private served = 0
  private missed = 0
  private best: number
  private newRecord = false
  private customers: Customer[] = []
  private inventory = emptyCounts()
  private stations = emptyCounts()
  private effects: FloatFx[] = []
  private spawnTimer = START_SPAWN_MS
  private nextId = 1
  private fxId = 1

  constructor(private readonly options: WarkopOptions) {
    this.best = options.best
  }

  start() {
    this.phase = 'open'
    this.remainingMs = DAY_MS
    this.coins = 0
    this.served = 0
    this.missed = 0
    this.newRecord = false
    this.customers = []
    this.inventory = emptyCounts()
    this.stations = emptyCounts()
    this.effects = []
    this.spawnTimer = START_SPAWN_MS
    this.emit('open')
  }

  cook(item: ItemId): boolean {
    if (this.phase !== 'open') return false
    const menu = MENU_BY_ID.get(item)
    if (!menu) return false
    if (this.stations[item] > 0) return false
    if (this.burnersInUse() >= MAX_BURNERS) {
      this.emit('busy')
      return false
    }
    this.stations[item] = menu.prepMs
    this.emit('cook')
    return true
  }

  closeEarly() {
    if (this.phase === 'open') this.closeDay()
  }

  update(dtMs: number) {
    const dt = clamp(dtMs, 0, 100)

    for (const effect of this.effects) effect.age += dt
    this.effects = this.effects.filter((effect) => effect.age < 1_100)

    if (this.phase !== 'open') return

    this.remainingMs -= dt
    if (this.remainingMs <= 0) {
      this.remainingMs = 0
      this.closeDay()
      return
    }

    let somethingReady = false
    for (const id of ITEM_IDS) {
      const remaining = this.stations[id]
      if (remaining <= 0) continue
      const next = remaining - dt
      if (next <= 0) {
        this.stations[id] = 0
        this.inventory[id] += 1
        somethingReady = true
        this.emit('ready')
      } else {
        this.stations[id] = next
      }
    }
    if (somethingReady) this.serveReady()

    this.spawnTimer -= dt
    if (this.spawnTimer <= 0) {
      if (this.freeSeat() !== null) {
        this.spawn()
        this.spawnTimer = this.spawnInterval()
      } else {
        this.spawnTimer = 600
      }
    }

    for (const customer of this.customers) {
      this.updateCustomer(customer, dt)
    }
    this.customers = this.customers.filter((customer) => !customer.remove)
  }

  view(): WarkopView {
    return {
      phase: this.phase,
      remainingMs: this.remainingMs,
      coins: this.coins,
      best: this.best,
      served: this.served,
      missed: this.missed,
      newRecord: this.newRecord,
      customers: this.customers.map(
        (customer): CustomerView => ({
          id: customer.id,
          x: customer.x,
          order: customer.order,
          patience:
            customer.maxPatienceMs > 0
              ? clamp(customer.patienceMs / customer.maxPatienceMs, 0, 1)
              : 0,
          state: customer.state,
          angry: customer.angry,
          variant: customer.variant,
        }),
      ),
      inventory: this.inventory,
      stations: this.stations,
      effects: this.effects,
    }
  }

  snapshot(): WarkopSnapshot {
    const cooking = emptyCounts()
    for (const id of ITEM_IDS) {
      const menu = MENU_BY_ID.get(id)
      const remaining = this.stations[id]
      cooking[id] =
        menu && remaining > 0 ? clamp(1 - remaining / menu.prepMs, 0, 1) : 0
    }

    return {
      phase: this.phase,
      coins: this.coins,
      best: this.best,
      served: this.served,
      missed: this.missed,
      remainingMs: this.remainingMs,
      newRecord: this.newRecord,
      inventory: { ...this.inventory },
      cooking,
      customerCount: this.customers.length,
      burners: this.burnersInUse(),
      burnerLimit: MAX_BURNERS,
    }
  }

  private burnersInUse(): number {
    let count = 0
    for (const id of ITEM_IDS) {
      if (this.stations[id] > 0) count += 1
    }
    return count
  }

  private updateCustomer(customer: Customer, dt: number) {
    if (customer.state === 'walking') {
      customer.x += (customer.targetX - customer.x) * Math.min(1, dt / WALK_IN_MS)
      if (Math.abs(customer.x - customer.targetX) < 1) {
        customer.x = customer.targetX
        customer.state = 'waiting'
        customer.stateMs = 0
        this.serveReady()
      }
      return
    }

    if (customer.state === 'waiting') {
      customer.patienceMs -= dt
      if (customer.patienceMs <= 0) {
        customer.patienceMs = 0
        customer.state = 'leaving'
        customer.angry = true
        customer.stateMs = 0
        this.missed += 1
        this.effects.push({
          id: this.fxId++,
          kind: 'miss',
          x: customer.x,
          y: 100,
          age: 0,
          text: 'Kabur!',
        })
        this.emit('miss')
        this.spawnTimer = Math.min(this.spawnTimer, NEXT_CUSTOMER_MS)
      }
      return
    }

    if (customer.state === 'happy') {
      customer.stateMs += dt
      if (customer.stateMs >= HAPPY_MS) {
        customer.state = 'leaving'
        customer.stateMs = 0
      }
      return
    }

    customer.x += (LEAVE_SPEED * dt) / 1_000
    if (customer.x > 355) customer.remove = true
  }

  private serveReady() {
    for (;;) {
      const waiting = this.customers.filter(
        (customer) =>
          customer.state === 'waiting' &&
          this.canFulfil(customer.order),
      )
      if (waiting.length === 0) return

      let target = waiting[0]
      for (const candidate of waiting) {
        if (candidate.patienceMs < target.patienceMs) target = candidate
      }

      for (const id of target.order) {
        this.inventory[id] = Math.max(0, this.inventory[id] - 1)
      }

      let base = 0
      for (const id of target.order) base += MENU_BY_ID.get(id)?.price ?? 0

      const ratio =
        target.maxPatienceMs > 0
          ? clamp(target.patienceMs / target.maxPatienceMs, 0, 1)
          : 0
      const tip = Math.round((base * (TIP_BASE + TIP_TOP * ratio)) / 500) * 500
      const total = base + tip

      this.coins += total
      this.served += 1
      target.state = 'happy'
      target.stateMs = 0

      this.effects.push({
        id: this.fxId++,
        kind: 'serve',
        x: target.x,
        y: 100,
        age: 0,
        text: `+${formatNumber(total)}`,
      })
      this.spawnTimer = Math.min(this.spawnTimer, NEXT_CUSTOMER_MS)
      this.emit('serve')
    }
  }

  private canFulfil(order: readonly ItemId[]): boolean {
    const need = countOrder(order)
    for (const [id, count] of need) {
      if (this.inventory[id] < count) return false
    }
    return true
  }

  private freeSeat(): number | null {
    const used = new Set(this.customers.map((customer) => customer.seat))
    for (let index = 0; index < SEATS.length; index += 1) {
      if (!used.has(index)) return index
    }
    return null
  }

  private spawn() {
    const seat = this.freeSeat()
    if (seat === null) return

    const progress = 1 - this.remainingMs / DAY_MS
    const order = this.makeOrder(this.orderSize(progress))
    const patience =
      PATIENCE_SLOW -
      progress * (PATIENCE_SLOW - PATIENCE_FAST) +
      Math.max(0, order.length - 1) * EXTRA_PATIENCE
    const targetX = SEATS[seat]

    this.customers.push({
      id: this.nextId++,
      seat,
      x: targetX + 34,
      targetX,
      order,
      state: 'walking',
      angry: false,
      variant: Math.floor(Math.random() * 6),
      patienceMs: patience,
      maxPatienceMs: patience,
      stateMs: 0,
      remove: false,
    })
  }

  private spawnInterval(): number {
    const progress = 1 - this.remainingMs / DAY_MS
    return (
      SPAWN_SLOW -
      progress * (SPAWN_SLOW - SPAWN_FAST) +
      (Math.random() * 600 - 300)
    )
  }

  private orderSize(progress: number): number {
    const roll = Math.random()
    if (progress < 0.25) return 1
    if (progress < 0.6) return roll < 0.6 ? 1 : 2
    return roll < 0.25 ? 1 : roll < 0.78 ? 2 : 3
  }

  private makeOrder(size: number): ItemId[] {
    const counts = new Map<ItemId, number>()
    const order: ItemId[] = []
    let guard = 0

    while (order.length < size && guard < 24) {
      guard += 1
      const id = this.weightedItem()
      if ((counts.get(id) ?? 0) >= 2) continue
      counts.set(id, (counts.get(id) ?? 0) + 1)
      order.push(id)
    }

    if (order.length === 0) order.push('kopi')
    order.sort((a, b) => (ITEM_ORDER.get(a) ?? 0) - (ITEM_ORDER.get(b) ?? 0))
    return order
  }

  private weightedItem(): ItemId {
    const total = ITEM_IDS.reduce((sum, id) => sum + ORDER_WEIGHTS[id], 0)
    let roll = Math.random() * total
    for (const id of ITEM_IDS) {
      roll -= ORDER_WEIGHTS[id]
      if (roll <= 0) return id
    }
    return ITEM_IDS[0]
  }

  private closeDay() {
    if (this.phase !== 'open') return

    this.phase = 'summary'
    this.remainingMs = 0
    this.customers = []
    this.stations = emptyCounts()
    this.inventory = emptyCounts()

    if (this.coins > this.best) {
      this.best = this.coins
      this.newRecord = true
      this.emit('record')
    }
    this.emit('close')
  }

  private emit(event: WarkopEvent) {
    this.options.onEvent(event)
  }
}
