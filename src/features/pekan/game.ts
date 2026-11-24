import {
  SPORT_BY_ID,
  type SportId,
  type SportMeta,
} from '../../content/pekan/island'
import type { SoundName } from './audio'
import { createSport, isSportPlayable } from './sports/registry'
import type { SportRun } from './sports/types'
import { clearSave, defaultSave, writeSave } from './save'
import type {
  DebugState,
  DialogueState,
  InputFrame,
  Mode,
  PekanSave,
  ResultState,
  SportInput,
  TitleState,
  VersusState,
  WorldState,
} from './types'
import {
  createWorld,
  teleportWorld,
  updateWorld,
  type WorldEvent,
} from './world'
import type { NpcDef } from '../../content/pekan/island'

/** The three jumps the debug launcher offers; kept next to the code that runs them. */
const DEBUG_TARGETS = ['kampung', 'sawah', 'panahan'] as const

const VERSUS_SECONDS = 2.3
const SPORT_END_SECONDS = 0.9

function toSportInput(input: InputFrame): SportInput {
  return {
    left: input.left,
    right: input.right,
    up: input.up,
    down: input.down,
    aPressed: input.aPressed,
    pointer: input.pointer,
  }
}

export class PekanGame {
  mode: Mode = 'title'
  time = 0
  /** Nobody gets a save file until they actually start a run. */
  started = false
  /** Counts down after a screen change so the renderer can flash the map name. */
  locationTimer = 0
  title: TitleState
  save: PekanSave
  world: WorldState
  dialogue: DialogueState | null = null
  versus: VersusState | null = null
  sport: SportRun | null = null
  sportMeta: SportMeta | null = null
  result: ResultState | null = null
  sportEndTimer: number | null = null
  debug: DebugState | null = null

  private readonly play: (name: SoundName) => void

  constructor(save: PekanSave | null, play: (name: SoundName) => void) {
    this.play = play
    this.save = save ?? defaultSave()
    this.world = createWorld(this.save)
    this.title = {
      index: 0,
      hasSave: Boolean(save),
      confirmingErase: false,
      message: null,
      timer: 0,
    }
  }

  // ---------------------------------------------------------------- views

  view(): PekanGame {
    return this
  }

  /** Persists the run at the player's current tile. */
  saveNow(): void {
    if (!this.started) return
    const player = this.world.player
    this.save = {
      ...this.save,
      map: this.world.map,
      x: Math.round(player.x / 16),
      y: Math.round(player.y / 16),
      dir: player.dir,
    }
    writeSave(this.save)
  }

  // ---------------------------------------------------------------- input

  update(dt: number, input: InputFrame): void {
    this.time += dt
    this.locationTimer = Math.max(0, this.locationTimer - dt)
    if (this.title.message) {
      this.title.timer += dt
      if (this.title.timer > 2.4) {
        this.title.message = null
        this.title.timer = 0
      }
    }

    switch (this.mode) {
      case 'title':
        this.updateTitle(input)
        break
      case 'world':
        this.stepWorld(input, dt)
        break
      case 'dialogue':
        this.updateDialogue(input)
        break
      case 'versus':
        this.updateVersus(dt, input)
        break
      case 'sport':
        this.updateSport(dt, input)
        break
      case 'result':
        this.updateResult(dt, input)
        break
      case 'debug':
        this.updateDebug(input)
        break
    }
  }

  private updateTitle(input: InputFrame): void {
    const title = this.title

    if (title.confirmingErase) {
      if (input.aPressed) {
        title.confirmingErase = false
        title.hasSave = false
        title.message = 'erased'
        title.timer = 0
        clearSave()
        this.save = defaultSave()
        this.world = createWorld(this.save)
        this.started = false
        this.play('confirm')
      } else if (input.bPressed) {
        title.confirmingErase = false
        this.play('back')
      }
      return
    }

    if (input.upPressed || input.downPressed) {
      const count = this.titleItemCount()
      const delta = input.upPressed ? -1 : 1
      title.index = (title.index + delta + count) % count
      this.play('blip')
    }

    if (input.aPressed) {
      const item = this.titleItems()[title.index]
      this.play('confirm')
      if (item === 'continue') {
        this.world = createWorld(this.save)
        this.mode = 'world'
        this.started = true
        this.locationTimer = 2.4
      } else if (item === 'start') {
        this.save = defaultSave()
        this.world = createWorld(this.save)
        this.started = true
        title.hasSave = true
        this.mode = 'world'
        this.locationTimer = 2.4
        this.saveNow()
      } else {
        title.confirmingErase = true
      }
    }
  }

  private titleItems(): Array<'continue' | 'start' | 'erase'> {
    const items: Array<'continue' | 'start' | 'erase'> = []
    if (this.title.hasSave) items.push('continue')
    items.push('start')
    if (this.title.hasSave) items.push('erase')
    return items
  }

  private titleItemCount(): number {
    return this.titleItems().length
  }

  private stepWorld(input: InputFrame, dt: number): void {
    const events = updateWorld(this.world, dt, input)
    for (const event of events) this.handleWorldEvent(event)
  }

  private handleWorldEvent(event: WorldEvent): void {
    if (event.type === 'talk') {
      this.startDialogue(event.npc)
      return
    }
    if (event.type === 'warp') {
      const warp = event.warp
      teleportWorld(this.world, warp.toMap, warp.toX, warp.toY, this.world.player.dir)
      this.locationTimer = 2.4
      this.play('warp')
      this.saveNow()
      return
    }
    if (event.type === 'step') {
      this.play('step')
      return
    }
    if (event.type === 'bump') this.play('bump')
  }

  private startDialogue(npc: NpcDef): void {
    this.dialogue = { npc, index: 0 }
    this.mode = 'dialogue'
    this.play('talk')
  }

  private updateDialogue(input: InputFrame): void {
    const dialogue = this.dialogue
    if (!dialogue) {
      this.mode = 'world'
      return
    }

    if (input.bPressed) {
      const sport = dialogue.npc.sport
      this.dialogue = null
      this.mode = 'world'
      this.play('back')
      if (sport) this.startSport(sport)
      return
    }

    if (input.aPressed) {
      const last = dialogue.index >= dialogue.npc.lines.length - 1
      if (last) {
        const sport = dialogue.npc.sport
        this.dialogue = null
        this.mode = 'world'
        if (sport) this.startSport(sport)
        else this.play('confirm')
      } else {
        dialogue.index += 1
        this.play('blip')
      }
    }
  }

  startSport(id: SportId): void {
    const meta = SPORT_BY_ID.get(id)
    if (!meta) return
    if (!isSportPlayable(id)) {
      // Not built yet: the champion stays a talker.
      this.play('back')
      return
    }
    this.versus = { meta, timer: 0 }
    this.sportMeta = meta
    this.mode = 'versus'
    this.play('confirm')
  }

  private updateVersus(dt: number, input: InputFrame): void {
    const versus = this.versus
    if (!versus) {
      this.mode = 'world'
      return
    }
    versus.timer += dt
    if (versus.timer >= VERSUS_SECONDS || input.aPressed) {
      const run = createSport(versus.meta.id, (Date.now() ^ this.time * 1000) >>> 0)
      if (!run) {
        this.mode = 'world'
        return
      }
      this.sport = run
      this.sportEndTimer = null
      this.versus = null
      this.mode = 'sport'
      this.play('go')
    }
  }

  private updateSport(dt: number, input: InputFrame): void {
    const run = this.sport
    if (!run) {
      this.mode = 'world'
      return
    }

    run.step(dt, toSportInput(input))

    if (run.status !== 'playing' && this.sportEndTimer === null) {
      this.sportEndTimer = 0
      this.play(run.status === 'won' ? 'win' : 'lose')
      return
    }

    if (this.sportEndTimer !== null) {
      this.sportEndTimer += dt
      if (this.sportEndTimer >= SPORT_END_SECONDS) this.finishSport()
    }
  }

  private finishSport(): void {
    const run = this.sport
    const meta = this.sportMeta
    if (!run || !meta) {
      this.mode = 'world'
      return
    }
    const won = run.status === 'won'
    const firstScroll = won && !this.save.scrolls.includes(meta.id)
    if (firstScroll) {
      this.save = { ...this.save, scrolls: [...this.save.scrolls, meta.id] }
      this.play('scroll')
    }
    this.result = {
      meta,
      won,
      playerScore: run.playerScore,
      rivalScore: run.rivalScore,
      firstScroll,
      timer: 0,
    }
    this.mode = 'result'
    this.sportEndTimer = null
    this.saveNow()
  }

  private updateResult(dt: number, input: InputFrame): void {
    const result = this.result
    if (!result) {
      this.mode = 'world'
      return
    }
    result.timer += dt
    if (result.timer < 0.45) return
    if (input.aPressed || input.bPressed) {
      this.result = null
      this.sport = null
      this.sportMeta = null
      this.mode = 'world'
      this.play('confirm')
      this.saveNow()
    }
  }

  toggleDebug(): void {
    if (this.mode === 'debug') {
      this.debug = null
      this.mode = 'world'
      this.play('back')
      return
    }
    if (this.mode !== 'world') return
    this.debug = { index: 0 }
    this.mode = 'debug'
    this.play('confirm')
  }

  private updateDebug(input: InputFrame): void {
    const debug = this.debug
    if (!debug) {
      this.mode = 'world'
      return
    }
    if (input.upPressed || input.downPressed) {
      const delta = input.upPressed ? -1 : 1
      debug.index = (debug.index + delta + DEBUG_TARGETS.length) % DEBUG_TARGETS.length
      this.play('blip')
    }
    if (input.bPressed) {
      this.debug = null
      this.mode = 'world'
      this.play('back')
      return
    }
    if (input.aPressed) {
      const target = DEBUG_TARGETS[debug.index]
      this.debug = null
      this.play('confirm')
      if (target === 'kampung') {
        teleportWorld(this.world, 'kampung', 14, 12, 'down')
        this.mode = 'world'
        this.locationTimer = 2.4
        this.saveNow()
      } else if (target === 'sawah') {
        teleportWorld(this.world, 'sawah', 12, 9, 'right')
        this.mode = 'world'
        this.locationTimer = 2.4
        this.saveNow()
      } else {
        this.mode = 'world'
        this.startSport('panahan')
      }
    }
  }
}
