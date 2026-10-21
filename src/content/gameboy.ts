import { GAMEBOY_SCENE_PATHS, ROUTES, type GameboySceneId } from '../app/routes'
import { SCENE_MUSIC, SONGS } from '../lib/assets'

/**
 * All copy and menu structure for the console. Kept in one file (and in
 * Indonesian, matching the tone of the original) so neither the chassis nor
 * the scenes have to carry text.
 */

export interface GameboyMenuItem {
  id: string
  /** Rendered on the screen, lowercase like the original menu. */
  label: string
  /** `null` for items that do not navigate. */
  route: string | null
}

export const GAMEBOY_MENU: GameboyMenuItem[] = [
  { id: 'start', label: 'start', route: GAMEBOY_SCENE_PATHS.start },
  { id: 'message', label: 'message', route: GAMEBOY_SCENE_PATHS.message },
  { id: 'gallery', label: 'gallery', route: GAMEBOY_SCENE_PATHS.gallery },
  { id: 'music', label: 'music', route: GAMEBOY_SCENE_PATHS.music },
  { id: 'pokescan', label: 'pokescan', route: ROUTES.pokescan },
  { id: 'home', label: 'home', route: ROUTES.home },
]

/** Row labels for the message picker (the letters themselves stay hidden). */
export const MESSAGE_LIST_LABELS = ['Message - 1', 'Message - 2', 'Message - 3']

const BIRTHDAY_LETTER = [
  'Selamat ulang tahun sayangggg',
  '',
  'doa aku semoga kamu selalu diberikan kesehatan, kemudahan segala urusan, kebahagiaan, diwujudkan kenginan kamu, dan diberi umur panjang soalnya aku mau menjalani banyak hal dan menua dengan kamu',
  'semoga Allah mudahkan rejeki kamu, memudahkan kamu untuk menjadi orang yang baik, dan memudahkan kamu untuk menjadi ibu yang baik untuk anak kita',
  'semoga apapun sakit yang ga penah kamu ceritakan ke siapa-siapa bisa disembuhkan, dan semoga kamu bisa berdamai dengan apapun kegelisahan yang ga pernah kamu bagi ke siapa-siapa',
  'aku pengen kamu tau aku bakal selalu mendukung kamu, akan selalu membersamai kamu, aku mau kamu bisa menggapai cita-cita kamu',
  'aku harap hari ini kamu bisa bahagia, besok juga, lusa juga, dannnn seterusnyaaa',
  '',
  'i love you, always',
].join('\n')

export const GAMEBOY_MESSAGES: string[] = [
  BIRTHDAY_LETTER,
  'I LOVE YOUUUU',
  'I LOVE YOUUUU MOSTTTT',
]

export interface GameboySong {
  id: string
  title: string
  src: string
}

export const GAMEBOY_SONGS: GameboySong[] = [
  { id: 'paul-kim', title: '폴킴 (Paul Kim) - 너를 만나 (축가 ver)', src: SONGS.paulKim },
  { id: 'birthday', title: 'Birthday Song', src: SONGS.birthday },
]

export const GALLERY_CAPTION = 'my fav person'

/** Human-readable name for each scene — used for headings and announcements. */
export const SCENE_TITLES: Record<GameboySceneId, string> = {
  opening: 'HTML BOY',
  menu: 'MENU',
  start: 'START',
  message: 'MESSAGES',
  'message-display': 'MESSAGE',
  music: 'MUSICS',
  'music-display': 'NOW PLAYING',
  gallery: 'GALLERY',
}

/**
 * Ambient track per scene. Scenes that are deliberately quiet are simply
 * absent from the map.
 */
export const SCENE_TRACKS: Partial<Record<GameboySceneId, string>> = {
  opening: SCENE_MUSIC.boot,
  start: SCENE_MUSIC.start,
  message: SCENE_MUSIC.message,
  'message-display': SCENE_MUSIC.letter,
  gallery: SCENE_MUSIC.gallery,
}
