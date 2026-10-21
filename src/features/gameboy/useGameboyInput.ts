import { useCallback, useMemo, type RefObject } from 'react'
import { GAMEBOY_SCENE_PATHS, ROUTES, type GameboySceneId } from '../../app/routes'
import { GAMEBOY_MENU, GAMEBOY_MESSAGES, GAMEBOY_SONGS } from '../../content/gameboy'
import { GALLERY_IMAGES } from '../../lib/assets'
import { scrollByScreen, scrollToEdge } from '../../lib/scroll'
import { playUiSound } from './audio'
import type { GameboyAction } from './input'

type ActionHandler = () => void
type SceneActions = Partial<Record<GameboyAction, ActionHandler>>
type SceneActionMap = Record<GameboySceneId, SceneActions>

/** Which blip each control makes — matches the original hardware feel. */
const SOUND_BY_ACTION: Record<GameboyAction, 'move' | 'confirm'> = {
  up: 'move',
  down: 'move',
  left: 'move',
  right: 'move',
  select: 'move',
  a: 'confirm',
  b: 'move',
  start: 'confirm',
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export interface GameboyInputDeps {
  scene: GameboySceneId | null
  powerOn: boolean
  menuIndex: number
  messageIndex: number
  musicIndex: number
  galleryIndex: number
  openEnvelope: boolean
  setMenuIndex: (index: number) => void
  setMessageIndex: (index: number) => void
  setMusicIndex: (index: number) => void
  setGalleryIndex: (index: number) => void
  setOpenEnvelope: (open: boolean) => void
  navigate: (to: string) => void
  scrollRef: RefObject<HTMLDivElement>
}

function buildSceneActions(deps: GameboyInputDeps): SceneActionMap {
  const {
    navigate,
    scrollRef,
    menuIndex,
    messageIndex,
    musicIndex,
    galleryIndex,
    openEnvelope,
    setMenuIndex,
    setMessageIndex,
    setMusicIndex,
    setGalleryIndex,
    setOpenEnvelope,
  } = deps

  const go = (path: string) => () => navigate(path)
  const scrollUp = () => scrollByScreen(scrollRef.current, 'up')
  const scrollDown = () => scrollByScreen(scrollRef.current, 'down')

  const selectedMenuRoute = GAMEBOY_MENU[menuIndex]?.route ?? null
  const lastGalleryIndex = GALLERY_IMAGES.length - 1
  const nextPhoto = () => setGalleryIndex(galleryIndex >= lastGalleryIndex ? 0 : galleryIndex + 1)
  const previousPhoto = () =>
    setGalleryIndex(galleryIndex <= 0 ? lastGalleryIndex : galleryIndex - 1)

  return {
    // "HTML BOY" boot screen — any of the two face buttons wakes the menu.
    opening: {
      a: go(GAMEBOY_SCENE_PATHS.menu),
      b: go(GAMEBOY_SCENE_PATHS.menu),
      start: go(GAMEBOY_SCENE_PATHS.menu),
    },

    menu: {
      up: () => setMenuIndex(clamp(menuIndex - 1, 0, GAMEBOY_MENU.length - 1)),
      down: () => setMenuIndex(clamp(menuIndex + 1, 0, GAMEBOY_MENU.length - 1)),
      a: go(GAMEBOY_SCENE_PATHS.opening),
      b: selectedMenuRoute ? go(selectedMenuRoute) : () => undefined,
    },

    start: {
      a: go(GAMEBOY_SCENE_PATHS.menu),
      b: go(GAMEBOY_SCENE_PATHS.message),
    },

    message: {
      up: () => setMessageIndex(clamp(messageIndex - 1, 0, GAMEBOY_MESSAGES.length - 1)),
      down: () => setMessageIndex(clamp(messageIndex + 1, 0, GAMEBOY_MESSAGES.length - 1)),
      a: go(GAMEBOY_SCENE_PATHS.menu),
      b: go(GAMEBOY_SCENE_PATHS['message-display']),
    },

    'message-display': {
      up: scrollUp,
      down: scrollDown,
      left: () => scrollToEdge(scrollRef.current, 'top'),
      right: () => scrollToEdge(scrollRef.current, 'bottom'),
      start: go(ROUTES.home),
      b: () => {
        if (openEnvelope) {
          navigate(GAMEBOY_SCENE_PATHS.message)
        } else {
          setOpenEnvelope(true)
        }
      },
      a: () => {
        if (openEnvelope) {
          setOpenEnvelope(false)
        } else {
          navigate(GAMEBOY_SCENE_PATHS.message)
        }
      },
    },

    gallery: {
      up: previousPhoto,
      left: previousPhoto,
      down: nextPhoto,
      right: nextPhoto,
      b: nextPhoto,
      a: go(GAMEBOY_SCENE_PATHS.menu),
      start: go(ROUTES.home),
    },

    music: {
      up: () => {
        if (musicIndex > 0) {
          scrollUp()
          setMusicIndex(musicIndex - 1)
        }
      },
      down: () => {
        if (musicIndex < GAMEBOY_SONGS.length - 1) {
          scrollDown()
          setMusicIndex(musicIndex + 1)
        }
      },
      a: go(GAMEBOY_SCENE_PATHS.menu),
      b: go(GAMEBOY_SCENE_PATHS['music-display']),
    },

    'music-display': {
      start: go(ROUTES.home),
      a: go(GAMEBOY_SCENE_PATHS.music),
      b: go(GAMEBOY_SCENE_PATHS.music),
    },
  }
}

/**
 * Returns a stable `press(action)` callback that plays the right blip and
 * runs whatever the current scene binds that control to.
 *
 * All scene→control bindings live in `buildSceneActions` above; there are no
 * hard-coded pathname comparisons left in the chassis.
 */
export function useGameboyInput(deps: GameboyInputDeps) {
  const {
    scene,
    powerOn,
    menuIndex,
    messageIndex,
    musicIndex,
    galleryIndex,
    openEnvelope,
    setMenuIndex,
    setMessageIndex,
    setMusicIndex,
    setGalleryIndex,
    setOpenEnvelope,
    navigate,
    scrollRef,
  } = deps

  const actions = useMemo(
    () =>
      buildSceneActions({
        scene,
        powerOn,
        menuIndex,
        messageIndex,
        musicIndex,
        galleryIndex,
        openEnvelope,
        setMenuIndex,
        setMessageIndex,
        setMusicIndex,
        setGalleryIndex,
        setOpenEnvelope,
        navigate,
        scrollRef,
      }),
    [
      scene,
      powerOn,
      menuIndex,
      messageIndex,
      musicIndex,
      galleryIndex,
      openEnvelope,
      setMenuIndex,
      setMessageIndex,
      setMusicIndex,
      setGalleryIndex,
      setOpenEnvelope,
      navigate,
      scrollRef,
    ],
  )

  return useCallback(
    (action: GameboyAction) => {
      if (!powerOn || !scene) return
      const handler = actions[scene][action]
      if (!handler) return
      playUiSound(SOUND_BY_ACTION[action])
      handler()
    },
    [actions, powerOn, scene],
  )
}
