/**
 * Every URL the app can render, in one place.
 *
 * Leaf module on purpose: it must not import React or any feature code, so
 * anything (content, features, tests) can import it without cycles.
 */
export const ROUTES = {
  home: '/',
  pokescan: '/pokescan',
  /** Upright arcade cabinet with a playable brick-buster. */
  arcade: '/arcade',
  /** GBC-style family story. */
  keluarga: '/keluarga',
  /** Shelf of tappable picture books (four stories on one cartridge). */
  rakcerita: '/rakcerita',
  /** Photobooth: pick a strip, shoot, download a PNG — all on-device. */
  photobooth: '/photobooth',
  /** Pocket pet: a keychain creature that grows in real time. */
  piara: '/piara',
  /** Warkop counter: four seats, five dishes, ninety seconds per day. */
  warkop: '/warkop',
  /** Boot screen of the console; every other scene hangs off it. */
  gameboy: '/gameboy',
} as const

/** Scenes rendered inside the Game Boy screen. Key === URL segment. */
export const GAMEBOY_SCENES = [
  'opening',
  'menu',
  'start',
  'message',
  'message-display',
  'music',
  'music-display',
  'gallery',
] as const

export type GameboySceneId = (typeof GAMEBOY_SCENES)[number]

/** `opening` is the console's index route (`/gameboy`, not `/gameboy/opening`). */
export const GAMEBOY_SCENE_PATHS: Record<GameboySceneId, string> = {
  opening: ROUTES.gameboy,
  menu: `${ROUTES.gameboy}/menu`,
  start: `${ROUTES.gameboy}/start`,
  message: `${ROUTES.gameboy}/message`,
  'message-display': `${ROUTES.gameboy}/message-display`,
  music: `${ROUTES.gameboy}/music`,
  'music-display': `${ROUTES.gameboy}/music-display`,
  gallery: `${ROUTES.gameboy}/gallery`,
}

const normalise = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

/** Resolves a pathname to a console scene, or `null` for an unknown URL. */
export function gameboySceneFromPath(pathname: string): GameboySceneId | null {
  const clean = normalise(pathname)
  for (const scene of GAMEBOY_SCENES) {
    if (normalise(GAMEBOY_SCENE_PATHS[scene]) === clean) return scene
  }
  return null
}

/**
 * URLs that used to be valid and should keep working (bookmarks, links from
 * old builds). Checked before the catch-all routes in `AppRouter`.
 */
export const LEGACY_REDIRECTS: ReadonlyArray<{ from: string; to: string }> = [
  // `/gameboy/Gallery` was the only capitalised segment; it is lowercase now.
  { from: '/gameboy/Gallery', to: GAMEBOY_SCENE_PATHS.gallery },
  // The warkop cartridge was briefly called "warung" while it was being built.
  { from: '/warung', to: ROUTES.warkop },
]
