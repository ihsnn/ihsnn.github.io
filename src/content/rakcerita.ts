/**
 * Copy for the Rak Cerita Kaluna cartridge.
 *
 * Story prose lives with its artwork in `features/rakcerita/stories/*` — the
 * two are written together, page by page. Everything else (shelf chrome,
 * buttons, sheets, the song card) is here so no sentence has to be hunted for
 * inside a component.
 */

export const GAME = {
  title: 'RAK CERITA KALUNA',
  short: 'Rak Cerita',
  kicker: 'Cartridge 05 · Cerita anak',
  tagline:
    'A shelf of picture books you can tap: four little stories with voices, objects that answer back, and a star for every page you finish.',
  /** Shown on the cartridge label in the shelf art. */
  code: 'DMG-RC-USA',
  year: '2026',
} as const

export const SHELF_COPY = {
  brandTitle: 'Rak Cerita',
  brandAccent: 'Kaluna',
  brandSub: 'Cerita anak yang bisa diketuk, dibaca, dan didengarkan',
  searchPlaceholder: 'Cari judul cerita…',
  sectionTitle: 'Pilih ceritamu',
  castTitle: 'Kenalan dulu, yuk!',
  emptyTitle: 'Belum ketemu, nih…',
  emptyText: 'Coba kata lain, misalnya “vaksin”, “kebun”, atau “bintang”.',
  emptyChips: ['vaksin', 'kebun', 'bintang'],
  footer:
    'Dibuat untuk Kaluna, dengan cinta. Sentuh bintang ✨ di dalam cerita untuk bermain.',
  footerNote: 'Suara dibacakan oleh peramban (browser) — tidak perlu unduhan.',
  helpLabel: 'Cara memakai buku ini',
} as const

export const READER_COPY = {
  backLabel: 'Rak Buku',
  readLabel: 'Bacakan halaman ini',
  menuLabel: 'Daftar halaman dan pengaturan',
  starsLabel: 'Bintang yang dikumpulkan',
  startOut: 'Mulai membaca',
  readOut: 'Bacakan',
  repeat: 'Ulangi cerita',
  otherStory: 'Cerita lain',
  shelf: 'Rak buku',
  comingSoon: 'Buku ini sedang ditulis. Segera hadir, ya! 📖',
} as const

export const SHEET_COPY = {
  pages: 'Daftar halaman',
  cast: 'Teman Kaluna',
  stars: 'Bintang Kaluna',
  help: 'Cara pakai',
  sound: 'Suara',
  auto: 'Bacakan otomatis',
  full: 'Layar penuh',
  helpTool: 'Cara pakai',
  shelfTool: 'Rak buku',
  repeatTool: 'Ulangi cerita dari awal',
  on: 'AKTIF',
  off: 'MATI',
  starsIntro: 'Kumpulkan bintang dengan mengetuk benda ajaib di dalam cerita.',
  starsUnit: 'bintang',
} as const

export const HELP_ROWS: ReadonlyArray<{ icon: string; title: string; text: string }> = [
  {
    icon: 'sparkle',
    title: 'Ketuk benda yang berkilau',
    text: 'Setiap halaman punya kejutan kecil. Ketuk bintang, pintu, atau benda lain yang berdenyut.',
  },
  {
    icon: 'arrow',
    title: 'Pindah halaman',
    text: 'Gunakan tombol panah, geser layar ke kiri/kanan, atau tombol panah di papan ketik.',
  },
  {
    icon: 'list',
    title: 'Daftar halaman',
    text: 'Ketuk ikon daftar di pojok kanan atas untuk melompat ke halaman mana pun.',
  },
  {
    icon: 'mic',
    title: 'Suara & narasi',
    text: 'Cerita dibacakan otomatis. Ketuk ikon mikrofon untuk membacakan ulang, dan atur suara di menu daftar halaman.',
  },
  {
    icon: 'expand',
    title: 'Layar penuh',
    text: 'Untuk pengalaman terbaik di ponsel, putar layar mendatar dan pilih layar penuh.',
  },
  {
    icon: 'star',
    title: 'Kumpulkan bintang',
    text: 'Setiap interaksi memberi bintang. Total bintang tersimpan di perangkat ini.',
  },
]

export const HELP_NOTE =
  'Suara narasi memakai suara bawaan peramban. Jika belum terdengar, ketuk layar sekali lalu coba lagi.'

export const SONG_COPY = {
  /** The AIUEO song the tooth-brushing story borrows from YouTube. */
  videoId: 'xLGiR59fD2k',
  title: '♪ Lagu Huruf Vokal',
  subtitle: 'AIUEO',
  stop: 'Hentikan',
  replay: '▶ Putar lagi',
  credit: 'Inspirasi: Mengenal Huruf AIUEO — BabyZu',
  note:
    'Suaranya diambil dari YouTube (tanpa video). Kalau halaman dibuka langsung dari berkas atau jaringan tidak mendukung, lagu dimainkan sendiri oleh peramban ini.',
  statusYoutube: '♪ audio dari YouTube',
  statusLocal: '♪ audio dari perangkat ini',
  statusLoading: '♪ menyiapkan suara…',
} as const

export const BADGES: ReadonlyArray<{ story: string; icon: string; name: string }> = [
  { story: 'vaksin', icon: 'shield', name: 'Pemberani' },
  { story: 'kebun', icon: 'sprout', name: 'Kebun Nenda' },
  { story: 'gigi', icon: 'sparkle', name: 'Sikat Gigi' },
  { story: 'rakbuku', icon: 'bookopen', name: 'Rak Buku' },
]

export const CAST_KEYS = [
  'kaluna',
  'mamau',
  'mama',
  'papa',
  'nenda',
  'ayahchiek',
  'oma',
  'opa',
] as const

export const CAST_SHEET_KEYS = [...CAST_KEYS, 'dokter'] as const
