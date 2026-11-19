import { ROUTES } from '../app/routes'
import type { ActionId, MoodId, RefusalReason, StageId } from '../features/piara/types'

/**
 * Every string the PIARA cartridge shows, plus the naming ceremony copy.
 *
 * The pet has no dialogue tree: it speaks in one-line bubbles picked from the
 * arrays below. Keeping them here means the toy can be re-toned without going
 * anywhere near `sim.ts` or the canvas renderer.
 */

export const PIARA = {
  eyebrow: 'Cartridge 07 · Teman saku',
  titleTop: 'PIARA',
  titleBottom: 'teman saku',
  backToShelf: ROUTES.home,
  kicker: 'SATU MAKHLUK KECIL',
  headline: 'Teman kecil di saku.',
  blurb:
    'Sebuah gantungan kunci yang hidup: satu makhluk mungil dengan tiga kebutuhan. Beri makan, ajak main, tidurkan, bersihkan — lalu biarkan waktu yang bekerja. Semuanya tersimpan di browser ini, tanpa akun dan tanpa server.',
  badges: [
    { label: 'Tahap', value: '4 bentuk' },
    { label: 'Umur', value: 'waktu nyata' },
    { label: 'Simpan', value: 'lokal' },
  ],
  soundOn: 'Suara menyala',
  soundOff: 'Suara mati',
} as const

export const STAGE_COPY: Record<StageId, { label: string; note: string }> = {
  telur: { label: 'Telur', note: 'Belum menetas. Ketuk pelan-pelan.' },
  bayi: { label: 'Bayi', note: 'Kecil, baru belajar berdiri.' },
  anak: { label: 'Anak', note: 'Sudah punya telinga dan banyak pertanyaan.' },
  remaja: { label: 'Remaja', note: 'Mulai jangkung dan suka berpetualang.' },
  dewasa: { label: 'Dewasa', note: 'Sudah besar. Tetap mau digendong.' },
}

export const MOODS: Record<MoodId, { label: string; line: string }> = {
  tidur: { label: 'Tidur', line: 'Dia sedang tidur. Pelan-pelan saja.' },
  lapar: { label: 'Lapar', line: 'Perutnya berbunyi.' },
  lesu: { label: 'Lelah', line: 'Matanya berat.' },
  sedih: { label: 'Kangen', line: 'Dia menunggu kamu.' },
  senang: { label: 'Senang', line: 'Dia lompat-lompat kecil.' },
  biasa: { label: 'Tenang', line: 'Dia memperhatikan layar.' },
}

/** The egg gets its own mood line: it has needs, but it cannot feel them yet. */
export const EGG_MOOD = {
  label: 'Menunggu',
  line: 'Telur itu bergerak sedikit.',
} as const

export const ACTION_COPY: Record<
  ActionId,
  { label: string; activeLabel: string; key: string; hint: string }
> = {
  feed: { label: 'MAKAN', activeLabel: 'MAKAN', key: 'F', hint: 'Beri makan' },
  play: { label: 'MAIN', activeLabel: 'MAIN', key: 'P', hint: 'Ajak main' },
  sleep: { label: 'TIDUR', activeLabel: 'BANGUN', key: 'S', hint: 'Tidurkan' },
  clean: { label: 'BERSIH', activeLabel: 'BERSIH', key: 'C', hint: 'Bersihkan' },
}

export const ACTION_ORDER: ActionId[] = ['feed', 'play', 'sleep', 'clean']

export const LINES: Record<ActionId, readonly string[]> = {
  feed: ['Nyam. Enak.', 'Lagi, dong.', 'Perutku jadi hangat.', 'Aku suka yang manis.'],
  play: ['Sekali lagi!', 'Lihat, aku lompat.', 'Cepat, kejar aku.', 'Hihihi.'],
  sleep: ['Aku pejamkan mata dulu.', 'Selamat malam.', 'Jangan ke mana-mana, ya.'],
  clean: ['Bersih!', 'Aku wangi sekarang.', 'Terima kasih sudah disapu.'],
}

export const WAKE_LINES: readonly string[] = [
  'Aku bangun.',
  'Sudah pagi?',
  'Aku mimpi aneh.',
]

export const EVOLVE_LINE = 'Aku tumbuh!'

export const REFUSALS: Record<RefusalReason, string> = {
  full: 'Dia masih kenyang.',
  tired: 'Dia terlalu lelah untuk main. Tidurkan dulu.',
  asleep: 'Dia sedang tidur.',
  clean: 'Belum ada yang perlu dibersihkan.',
  unready: 'Dia belum siap untuk itu.',
}

export const HATCH = {
  taps: 5,
  kicker: 'TELUR MENETAS',
  title: 'Siapa namanya?',
  blurb: 'Nama pendek saja. Dia akan memakainya seumur hidup.',
  placeholder: 'Misal: KIKO',
  suggestions: ['KIKO', 'MOCHI', 'PUCUK', 'KUNANG', 'BUNTU'],
  submit: 'MULAI MERAWAT',
  maxLength: 10,
  tapHint: 'KETUK TELUR',
} as const

export const STATUS = {
  title: 'STATUS',
  nameFallback: '???',
  food: 'Kenyang',
  joy: 'Senang',
  rest: 'Tenaga',
  clean: 'Bersih',
  messy: 'tumpukan',
  agePrefix: 'Umur',
  unhatched: 'Belum menetas',
  sleepNote: 'Sedang tidur — tenaga pulih lebih cepat.',
  vitalsAria: 'Kebutuhan',
} as const

export const GROWTH = {
  title: 'TUMBUH',
  next: 'Menuju',
  remaining: 'lagi',
  care: 'Nilai rawat',
  needHint: (min: number) => `Butuh rata-rata ${min}% untuk tumbuh.`,
  adult: 'Sudah dewasa. Tidak ada tahap berikutnya — dia tinggal di sini.',
  egg: 'Masih telur. Ketuk lima kali, lalu beri nama.',
  locked: '—',
} as const

export const HELP = {
  title: 'CARA MAIN',
  rows: [
    'Ketuk telur lima kali, lalu beri nama.',
    'Empat tombol: makan, main, tidur, bersihkan. Keyboard: F P S C.',
    'Kebutuhan turun terus — bahkan saat tab ditutup.',
    'Tidak ada game over. Paling buruk, dia cuma kangen.',
  ],
  keyboardTitle: 'F · P · S · C',
  reset: 'Mulai dari telur',
  resetConfirm: 'Hapus semua kenangan dan mulai ulang?',
  resetYes: 'Ya, mulai ulang',
  resetNo: 'Batal',
  resetNote: 'Menghapus satu-satunya simpanan di browser ini.',
} as const

export const NOTES = {
  title: 'CATATAN KECIL',
  rows: [
    'Simpanan ada di localStorage dengan kunci ihsnn:piara:save — satu slot, versi 1.',
    'Waktu berjalan dari jam perangkat. Kalau jamnya diubah, umurnya ikut bergeser.',
    'Semua gambar digambar ulang di canvas 160 × 120; tidak ada file sprite atau audio.',
    'Dia tidak bisa mati. Kebutuhan bisa menyentuh nol, tapi dia tetap menunggu.',
  ],
  footer: 'PIARA · cartridge 07',
  sourceNote: 'Satu makhluk kecil, disimpan di browser ini.',
  footerShelf: 'Kembali ke rak',
} as const

/** Shown as a first bubble when someone returns after a while. */
export function awayLine(ms: number): string {
  const minutes = Math.round(ms / 60_000)
  if (minutes < 60) return `Kamu pergi ${minutes} menit. Dia sempat menoleh ke pintu.`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Kamu pergi ${hours} jam. Dia menunggu di saku.`
  const days = Math.round(hours / 24)
  return `Kamu pergi ${days} hari. Dia masih di sini.`
}
