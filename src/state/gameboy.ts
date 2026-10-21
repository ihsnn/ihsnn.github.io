import { atom } from 'recoil'

/**
 * Console state. Content (menu rows, letters, songs, gallery) lives in
 * `src/content/gameboy.ts` — atoms only hold what the user changes.
 */

/** Master switch; mirrors the physical power slider on the chassis. */
export const powerOnState = atom<boolean>({
  key: 'gameboy/powerOn',
  default: false,
})

/** Highlighted row in the menu screen. */
export const gameBoyMenuIndexState = atom<number>({
  key: 'gameboy/menuIndex',
  default: 0,
})

/** Highlighted row in the message list. */
export const gameBoyMessageIndexState = atom<number>({
  key: 'gameboy/messageIndex',
  default: 0,
})

/** Highlighted row in the music list. */
export const gameBoyMusicIndexState = atom<number>({
  key: 'gameboy/musicIndex',
  default: 0,
})

/** Photo currently shown in the gallery. */
export const gameBoyGalleryIndexState = atom<number>({
  key: 'gameboy/galleryIndex',
  default: 0,
})

/** Whether the letter's envelope has been opened. */
export const openEnvelopeState = atom<boolean>({
  key: 'gameboy/openEnvelope',
  default: false,
})
