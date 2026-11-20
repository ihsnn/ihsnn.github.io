import { ROUTES } from '../app/routes'
import type { TaskPriority, TodoFilter } from '../features/todo/types'

/**
 * Every word the TO-DO LIST cartridge prints.
 *
 * The rules (`quest.ts`) import the priorities from here for their XP values,
 * so tuning a reward is a content edit, not an engine edit. Strings live here
 * so the device, the LCD and the manual can be re-worded without touching the
 * controller or the stylesheet.
 */

export interface PriorityDef {
  id: TaskPriority
  label: string
  /** Dot-matrix mark printed on the task row. */
  mark: string
  xp: number
  hint: string
}

export const PRIORITIES: Record<TaskPriority, PriorityDef> = {
  ringan: {
    id: 'ringan',
    label: 'RINGAN',
    mark: '!',
    xp: 10,
    hint: 'Cepat beres, XP kecil.',
  },
  biasa: {
    id: 'biasa',
    label: 'SEDANG',
    mark: '!!',
    xp: 20,
    hint: 'Pekerjaan biasa sehari-hari.',
  },
  penting: {
    id: 'penting',
    label: 'PENTING',
    mark: '!!!',
    xp: 35,
    hint: 'Yang paling perlu dibereskan.',
  },
}

export const PRIORITY_ORDER: readonly TaskPriority[] = [
  'ringan',
  'biasa',
  'penting',
]

export const FILTERS: Record<TodoFilter, { label: string; title: string }> = {
  all: { label: 'SEMUA', title: 'Semua tugas' },
  open: { label: 'BELUM', title: 'Belum selesai' },
  done: { label: 'SELESAI', title: 'Selesai' },
}

export const FILTER_ORDER: readonly TodoFilter[] = ['all', 'open', 'done']

export const TODO = {
  eyebrow: 'Cartridge 09 · Daftar tugas',
  titleTop: 'TO-DO',
  titleBottom: 'LIST',
  backToShelf: ROUTES.home,
  kicker: 'ORGANIZER SAKU, TAHUN 1999',
  headline: 'Daftar tugas, rasa game.',
  blurb:
    'Tulis, pilih, tandai selesai. Setiap tugas memberi XP, tugas beruntun memberi bonus combo, dan setiap level punya nama. Sebuah organizer saku yang berjalan di browser ini — tanpa akun, tanpa server, tanpa notifikasi yang mengejar.',
  badges: [
    { label: 'Kapasitas', value: '60 tugas' },
    { label: 'Hadiah', value: 'XP · level' },
    { label: 'Simpan', value: 'lokal' },
  ],
  brand: 'TASK-9',
  brandMeta: 'POCKET ORGANIZER · 09',
  soundOn: 'Suara menyala',
  soundOff: 'Suara mati',
} as const

export const LCD = {
  brand: 'TASK-9',
  title: 'DAFTAR TUGAS',
  remaining: 'TERSISA',
  mission: 'MISI',
  missionAria: (done: number, target: number) =>
    `Misi hari ini: ${done} dari ${target} tugas selesai.`,
  inputLabel: 'Tugas baru',
  inputPlaceholder: 'ketik tugas, lalu Enter',
  add: 'TAMBAH',
  emptyTitle: 'DAFTAR MASIH KOSONG',
  emptyBody: 'Ketik tugas pertama di baris bawah. Satu baris, satu tugas.',
  emptyOpenTitle: 'SEMUA BERES',
  emptyOpenBody: 'Tidak ada tugas yang menunggu. Tekan + untuk menambah.',
  emptyDoneTitle: 'BELUM ADA YANG SELESAI',
  emptyDoneBody: 'Tandai satu tugas dengan tombol A, lalu lihat hasilnya di sini.',
  statusIdle: 'PANAH PILIH · A SELESAI · B PRIORITAS',
  selectAria: (text: string) => `Pilih tugas: ${text}`,
  checkAria: (done: boolean, text: string) =>
    done ? `Batalkan selesai: ${text}` : `Selesaikan: ${text}`,
  deleteAria: (text: string) => `Hapus tugas: ${text}`,
  priorityAria: (label: string, xp: number) =>
    `Prioritas ${label}, ${xp} XP. Klik untuk memutar prioritas.`,
  face: '[ o_o ]',
  faceDone: '[ :D ]',
} as const

export const LEVEL_TITLES: readonly string[] = [
  'PEMULA',
  'RAJIN',
  'TERATUR',
  'DISIPLIN',
  'MAESTRO',
  'LEGENDA',
]

export const LEVEL_COPY = {
  title: 'LEVEL',
  progress: (into: number, need: number) => `${into} / ${need} XP`,
  lifetimeNote: 'Level dihitung dari total XP yang pernah dikumpulkan.',
} as const

export const MISSION = {
  title: 'MISI HARI INI',
  done: 'Misi hari ini selesai.',
  pending: (left: number) => `${left} tugas lagi untuk misi hari ini.`,
} as const

export const STREAK = {
  title: 'STREAK',
  unit: 'hari',
  zero: 'Belum ada streak. Selesaikan satu tugas hari ini untuk memulai.',
  active: (days: number) => `${days} hari beruntun. Jangan putus hari ini.`,
} as const

export const PRIORITY_CARD = {
  title: 'PRIORITAS',
  hint: 'Klik penanda di tiap tugas, atau tekan B saat tugas dipilih, untuk memutar prioritas. Prioritas hanya menentukan XP — bukan pengingat.',
  locked: 'Tugas yang sudah selesai tidak bisa diubah prioritasnya.',
} as const

export const COMBO = {
  label: 'COMBO',
  hint: 'Selesaikan tugas lain dalam 7 detik untuk bonus XP. Bonusnya ikut tersimpan di tugas itu.',
} as const

export const HELP = {
  title: 'CARA MAIN',
  rows: [
    'Ketik di baris > lalu Enter. Tombol TAMBAH atau huruf N juga membuka baris itu.',
    'Panah atas/bawah memilih tugas. A atau Spasi menandainya selesai.',
    'B memutar prioritas: ringan, sedang, penting. Prioritas menentukan XP.',
    'Del atau Backspace menghapus; Ctrl+Z mengembalikan yang terakhir dihapus.',
    'Selesaikan tugas beruntun dalam 7 detik untuk bonus combo.',
    '1, 2, 3 memilih filter. Semua tersimpan otomatis di browser ini.',
  ],
  keyboardTitle: 'A · B · N · DEL',
  reset: 'Kosongkan daftar',
  resetConfirm: 'Kosongkan semua tugas? XP, level dan streak tetap disimpan.',
  resetYes: 'Ya, kosongkan',
  resetNo: 'Batal',
  resetNote:
    'Tugas yang dikosongkan masih bisa dikembalikan dengan Ctrl+Z selama halaman ini terbuka.',
  resetAll: 'Mulai dari awal',
  resetAllConfirm: 'Hapus tugas, XP, level dan streak, lalu isi lagi empat contoh?',
  resetAllYes: 'Ya, mulai ulang',
  resetAllNote: 'Menghapus satu-satunya simpanan di browser ini.',
} as const

export const NOTES = {
  title: 'CATATAN KECIL',
  rows: [
    'Simpanan ada di localStorage dengan kunci ihsnn:todo:save — versi 1, satu slot.',
    'Maksimum 60 tugas, 90 karakter per tugas. Tidak ada akun dan tidak ada server.',
    'Kunjungan pertama diisi empat tugas contoh; hapus atau ubah sesukamu.',
    'XP dan level dihitung dari total sepanjang waktu dan tidak ikut terhapus saat daftar dikosongkan.',
    'Semua suara disintesis WebAudio — tidak ada file audio, tidak ada notifikasi.',
  ],
  footer: 'TASK-9 · cartridge 09',
  sourceNote: 'Daftar kecil, disimpan di browser ini.',
  footerShelf: 'Kembali ke rak',
} as const

/** LCD status-line feedback. Uppercase on purpose: it is a 1999 display. */
export const TOAST = {
  added: 'TUGAS DITAMBAH',
  duplicate: 'TUGAS ITU SUDAH ADA',
  emptyText: 'TULIS DULU TUGASNYA',
  full: (max: number) => `DAFTAR PENUH (${max} TUGAS)`,
  removed: 'DIHAPUS · CTRL+Z UNTUK KEMBALI',
  restored: 'TUGAS DIKEMBALIKAN',
  nothingToUndo: 'TIDAK ADA YANG BISA DIKEMBALIKAN',
  clearedDone: (count: number) => `${count} TUGAS SELESAI DIBERSIHKAN`,
  nothingDone: 'BELUM ADA TUGAS SELESAI',
  clearedAll: 'DAFTAR DIKOSONGKAN · XP TETAP',
  alreadyEmpty: 'DAFTAR SUDAH KOSONG',
  resetAll: 'MULAI DARI AWAL',
  xp: (xp: number) => `+${xp} XP`,
  lostXp: (xp: number) => `-${xp} XP`,
  levelUp: (level: number, title: string) => `LEVEL ${level} · ${title}`,
  mission: 'MISI HARI INI SELESAI',
  priority: (label: string, xp: number) => `${label} · ${xp} XP`,
  locked: 'TUGAS SELESAI TERKUNCI',
  filter: (label: string) => `FILTER: ${label}`,
  muted: (muted: boolean) => (muted ? 'SUARA MATI' : 'SUARA MENYALA'),
} as const

/** First-run list. Four small, obviously editable examples. */
export const SEED_TASKS: ReadonlyArray<{ text: string; priority: TaskPriority }> = [
  { text: 'Tulis satu tugas yang harus beres hari ini', priority: 'penting' },
  { text: 'Minum air sebelum kopi kedua', priority: 'ringan' },
  { text: 'Balas satu pesan yang mengendap', priority: 'biasa' },
  { text: 'Rapikan meja lima menit', priority: 'ringan' },
]

const dateFormat = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
})

const timeFormat = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** `20 NOV` — the two cells beside the LCD's brand. */
export function formatDate(timestamp: number): string {
  return dateFormat.format(timestamp).replace(/\./g, ' ').trim().toUpperCase()
}

/** `15.49` or `15:49`, whichever the device locale prefers. */
export function formatClock(timestamp: number): string {
  return timeFormat.format(timestamp)
}
