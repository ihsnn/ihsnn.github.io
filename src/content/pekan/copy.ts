/**
 * PEKAN RAYA — every string the page and the screen show.
 *
 * The island, the branches and the people are data in `island.ts`; this file is
 * chrome and interface copy only, so a line can change without touching the
 * engine.
 */

export const PEKAN = {
  eyebrow: 'CARTRIDGE 12 · PEKAN RAYA',
  titleTop: 'PEKAN',
  titleBottom: 'RAYA',
  backToShelf: '/',
  kicker: 'PULAU NUSANTARA · 7 CABANG · 1 OBOR',
  headline: 'Tujuh juara menunggu di pulau yang sedang berpesta.',
  blurb:
    'Jelajahi kampung dan sawah, tantang juara di tiap cabang, kumpulkan tujuh scroll, lalu nyalakan obor di puncak. Sahabat kecilmu ikut ke mana pun kau pergi.',
  badges: [
    { label: 'CABANG', value: '7 + final' },
    { label: 'LAYAR', value: '320 × 240' },
    { label: 'SIMPAN', value: 'Lokal' },
  ],
  startNote: 'Semua berjalan di browser. Tidak ada server, tidak ada unduhan.',
} as const

export const HUD = {
  scroll: 'SCROLL',
  scrollOf: (have: number, total: number) => `${have}/${total}`,
  team: 'TIM',
  hint: 'A: bicara · panah/WASD: jalan',
} as const

export const TITLE = {
  title: 'PEKAN RAYA',
  subtitle: 'Sebuah pesta olahraga rakyat di pulau kecil',
  start: 'MULAI BARU',
  continue: 'LANJUTKAN',
  erase: 'HAPUS SIMPANAN',
  hint: '↑ ↓ pilih · A/Enter lanjut',
  confirmErase: 'Hapus simpanan? A = ya · B = batal',
  erased: 'Simpanan dihapus.',
} as const

export const DIALOGUE = {
  advance: 'A ▸',
  sportPrompt: 'A ▸ tantang',
} as const

export const VERSUS = {
  versus: 'VS',
  champion: 'JUARA',
  challenge: 'TANTANGAN',
  ready: 'SIAP?',
  go: 'MULAI!',
  hint: 'A untuk mempercepat',
} as const

export const RESULT = {
  win: 'MENANG!',
  lose: 'KALAH',
  score: 'SKOR',
  scrollWon: 'SCROLL DIDAPAT',
  scrollAlready: 'SCROLL SUDAH DI TANGAN',
  again: 'A ▸ kembali ke pulau',
  retryHint: 'Bicara lagi untuk menantang ulang',
} as const

export const DEBUG = {
  title: 'DEBUG · LOMPAT KE',
  hint: '↑ ↓ pilih · A masuk · ` tutup',
  rows: ['KAMPUNG', 'SAWAH', 'PANAHAN (SI ELANG)'],
} as const

export const MANUAL = {
  title: 'CARA MAIN',
  rows: [
    'Jalan dengan panah atau WASD. Tahan untuk terus berjalan.',
    'Bicara dan lanjutkan dialog dengan A (Z / Enter / spasi).',
    'B di mana saja untuk membatalkan atau menutup.',
    'Setiap juara punya satu cabang. Scroll hanya diberikan sekali.',
    'Kalah tidak menghukum: bicara lagi untuk menantang ulang.',
    'Simpanan otomatis: setelah cabang, setelah pindah peta, saat tab ditutup.',
    'Tekan ` untuk membuka lompat cepat (alat uji).',
  ],
  keys: 'PETA KUNCI',
  keyRows: [
    ['PANAH / WASD', 'JALAN'],
    ['Z / ENTER / SPASI', 'A · BICARA'],
    ['X / ESC', 'B · BATAL'],
    ['`', 'DEBUG'],
    ['M', 'BISU'],
  ],
  footer:
    'PEKAN RAYA adalah cartridge kedua belas. Semua sprite, peta, dan suara dibuat dari kode — tidak ada aset yang diunduh.',
  footerShelf: 'Kembali ke rak',
} as const

export const CONTROLS = {
  dpad: 'Tombol arah',
  up: 'Atas',
  down: 'Bawah',
  left: 'Kiri',
  right: 'Kanan',
  a: 'Tombol A: bicara dan lanjut',
  b: 'Tombol B: batal',
  sound: 'Suara',
  mute: 'Bisukan',
  unmute: 'Nyalakan suara',
} as const
