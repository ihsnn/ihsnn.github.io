import type {
  CharacterState,
  RoomObjectCopy,
  ThoughtOption,
} from '../features/keluarga/types'

/**
 * All copy and data for Keluarga Kecil-Kecilan.
 *
 * The story is deliberately small: one room, one chapter, one quiet choice.
 * Dialogue stays here so future chapters can be written without touching the
 * engine.
 */

export const GAME = {
  title: 'KELUARGA KECIL-KECILAN',
  titleTop: 'KELUARGA',
  titleBottom: 'KECIL-KECILAN',
  shortTitle: 'KELUARGA',
  eyebrow: 'Cartridge 04 · Cerita',
  chapter: 'BAB 1',
  chapterTitle: 'TENTANG AKU',
  location: 'BANDA ACEH · RUMAH ORANG TUA',
  tagline: 'Sebuah cerita keluarga, satu kamar pada satu waktu.',
  about:
    'Keluarga Kecil-Kecilan adalah cerita pixel tentang rumah, seseorang yang belum kamu temui, dan keluarga yang tumbuh dari sana.',
  dedication: 'Ditulis untuk keluargaku.',
  noFailNote: 'Tidak ada game over. Pilihan hanya mengubah detail kecil.',
  memoryLabel: 'KENANGAN',
  memoryGoal: 3,
  nextChapter: 'BAB 2 — HARI PERTAMA',
  nextSoon: 'SEGERA',
  prototype: 'PURWARUPA BAB 1',
} as const

export const TITLE_SCREEN = {
  kicker: 'SEBUAH CERITA KELUARGA',
  start: 'MULAI BARU',
  continue: 'LANJUTKAN',
  completed: 'Bab 1 selesai',
  footnote: 'Satu kamar · tiga kenangan · tanpa game over',
} as const

export const MIRROR = {
  kicker: 'CERMIN',
  text: 'Aku adalah Ihsnn. Kulit hangat, rambut pendek, baju abu-abu gelap, celana hitam. Tidak ada aksesori.',
  hint: 'A · BUKA MATA',
} as const

export const FIXED_CHARACTER: CharacterState = {
  name: 'Ihsnn',
  appearance: {
    skin: 'warm',
    hairStyle: 'short',
    hairColor: 'black',
    shirt: 'charcoal',
    accessory: 'none',
  },
}

export const INTRO_LINES = [
  'Aku tinggal di Banda Aceh, di rumah orang tuaku.',
  'Kamarku cukup untuk satu orang. Dua jendela di dua sisi dinding.',
  'Satu kasur, satu meja, dan tumpukan barang yang belum selesai kubongkar.',
  'Hari ini terasa biasa. Aku belum tahu bahwa nanti aku akan ingin mengingatnya.',
]

export const OBJECT_COPY: Record<string, RoomObjectCopy> = {
  bed: {
    label: 'Kasur',
    memory: true,
    lines: [
      'Kasur ini cuma cukup untuk satu orang.',
      'Aku sudah hafal sisi mana yang paling nyaman, dan bantal mana yang harus dipukul dulu.',
    ],
  },
  shelf: {
    label: 'Rak buku',
    memory: true,
    lines: [
      'Rak buku ini isinya campur: buku pelajaran, novel, dan manual barang yang belum selesai kubongkar.',
      'Beberapa buku masih diselipkan kertas catatan. Aku jarang membuangnya.',
    ],
  },
  desk: {
    label: 'Meja belajar',
    memory: true,
    lines: [
      'Meja belajar ini lebih sering jadi bengkel daripada tempat belajar.',
      'Ada laptop, obeng, tang kecil, dan potongan kabel yang belum sempat dirapikan.',
      'Kalau ada barang mati di rumah, biasanya mampir ke sini dulu.',
      'Di laptop, video restorasi menemani malam. Aku suka bagian saat sesuatu yang mati bisa hidup lagi.',
    ],
  },
  wardrobe: {
    label: 'Lemari',
    memory: true,
    lines: [
      'Baju-baju ditumpuk dengan sistem yang cuma aku yang paham.',
      'Di bagian bawah ada kardus berisi barang yang belum tega kubuang.',
    ],
  },
  fan: {
    label: 'Kipas angin',
    memory: true,
    lines: [
      'Kipas angin ini berputar ke kiri dan ke kanan.',
      'Suaranya jadi latar hampir setiap malam di kamar ini.',
    ],
  },
  ac: {
    label: 'AC',
    memory: true,
    lines: [
      'AC di sudut kamar. Suaranya pelan, tapi dinginnya kadang berlebihan.',
      'Kalau sudah terlalu dingin, aku mematikannya dan membiarkan jendela yang bekerja.',
    ],
  },
  windowNorth: {
    label: 'Jendela',
    memory: true,
    lines: [
      'Dua jendela di dua sisi dinding. Kalau dibuka dua-duanya, angin lewat seperti terowongan.',
      'Dari sini, aku bisa melihat langit Banda Aceh berubah warna.',
    ],
  },
  windowEast: {
    label: 'Jendela',
    memory: true,
    lines: [
      'Jendela sisi ini kena matahari sore.',
      'Aku sering membukanya kalau kamar terasa pengap.',
    ],
  },
  door: {
    label: 'Pintu',
    memory: false,
    lines: [
      'Di luar kamar, rumah orang tuaku sudah mulai hidup.',
      'Aku belum siap keluar. Sebentar lagi.',
    ],
  },
}

export const FINAL_LINES = [
  'Aku berdiri di dekat jendela. Di luar, langit mulai berwarna sore.',
  'Ada satu hal yang belakangan ini sering muncul di kepalaku.',
]

export const FINAL_PROMPT = 'Apa yang paling ingin kupikirkan?'

export const POST_COMPLETE_WINDOW = [
  'Jendela ini masih di tempatnya.',
  'Aku juga. Setidaknya untuk sekarang.',
]

export const THOUGHTS: ThoughtOption[] = [
  {
    id: 'fix',
    label: 'Barang rusak yang belum selesai kuperbaiki.',
    result:
      'Masih banyak barang yang belum selesai. Mungkin besok aku akan membongkarnya lagi.',
  },
  {
    id: 'routine',
    label: 'Rutinitas yang rasanya mulai sempit.',
    result:
      'Rutinitas ini nyaman. Tapi akhir-akhir ini aku bertanya-tanya, apakah aku hanya menunggu?',
  },
  {
    id: 'unknown',
    label: 'Ada sesuatu yang belum datang, dan aku belum tahu apa.',
    result:
      'Ada sesuatu yang belum datang. Aku belum tahu apa, tapi aku ingin mengetahuinya.',
  },
]

export const COMPLETE = {
  kicker: 'KENANGAN 01 TERSIMPAN',
  heading: 'TENTANG AKU',
  sub: 'Bab 1 selesai.',
  thoughtLabel: 'YANG KUPIKIRKAN',
  stay: 'TETAP DI KAMAR',
  toTitle: 'KEMBALI KE JUDUL',
} as const

export const PAUSE = {
  heading: 'JEDA',
  resume: 'LANJUTKAN',
  toTitle: 'KEMBALI KE JUDUL',
  note: 'Simpanan tersimpan otomatis.',
} as const

export const PROMPTS = {
  inspect: 'periksa',
  continue: 'lanjut',
  windowReady: 'ada yang menunggu',
} as const

export const CONTROLS = [
  { action: 'Gerak', keys: 'Panah / WASD / D-pad' },
  { action: 'Periksa / lanjut', keys: 'A / Spasi / Enter' },
  { action: 'Kembali', keys: 'B' },
  { action: 'Menu', keys: 'Esc / tombol MENU' },
] as const

export const OBJECTIVE = {
  label: 'TUJUAN',
  remaining: 'benda lagi',
  inspect: 'Dekati benda, lalu tekan A.',
  ready: 'Jendela sudah terbuka. Dekati dan tekan A.',
  done: 'Kenangan bab ini sudah tersimpan.',
} as const

export const SIDE_COPY = {
  title: 'Sebuah cerita keluarga.',
  titleBody:
    'Bab pertama dimulai di kamar masa muda: kasur untuk satu orang, dua jendela, dan meja yang lebih sering jadi bengkel.',
  play: 'Kamar ini menyimpan versi dirimu sebelum semuanya berubah.',
  playBody:
    'Dekati benda di kamar, lalu tekan A untuk memeriksanya. Tiga kenangan cukup untuk membuka jendela.',
  steps: [
    'Jalan dengan D-pad atau tombol panah.',
    'Dekati benda, lalu tekan A.',
    'Kumpulkan tiga kenangan.',
    'Buka jendela dan pilih satu pikiran.',
  ],
  windowReady: 'Jendela menunggumu.',
  complete: 'Bab 1 selesai. Bab berikutnya masih disimpan.',
  completeBody:
    'Hari Pertama akan mulai dari tempat yang belum kamu ceritakan. Kita bisa menulisnya kapan saja.',
  controlsTitle: 'Cara bermain',
  noteTitle: 'Catatan',
  progressTitle: 'Progres',
} as const


