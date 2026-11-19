import { ROUTES } from '../app/routes'
import type { ItemId, MenuItem } from '../features/warkop/types'

/**
 * The whole WARKOP catalogue and its copy.
 *
 * The engine imports `MENU_ITEMS` for prices and prep times — this is the one
 * place a menu change belongs. Strings stay here so the page, the keys and the
 * summary can be re-worded without touching gameplay code.
 */

export const MENU_ITEMS: readonly MenuItem[] = [
  {
    id: 'kopi',
    name: 'KOPI',
    label: 'Kopi tubruk',
    price: 5_000,
    prepMs: 1_400,
    color: '#7a4a2f',
    ink: '#ffe9cf',
    edge: '#4e2c18',
  },
  {
    id: 'teh',
    name: 'TEH',
    label: 'Es teh manis',
    price: 4_000,
    prepMs: 1_100,
    color: '#e0a13c',
    ink: '#3a2508',
    edge: '#9c6716',
  },
  {
    id: 'mie',
    name: 'MIE',
    label: 'Mie rebus',
    price: 10_000,
    prepMs: 2_200,
    color: '#e8703a',
    ink: '#2f1206',
    edge: '#a3471c',
  },
  {
    id: 'nasi',
    name: 'NASI',
    label: 'Nasi bungkus',
    price: 12_000,
    prepMs: 2_600,
    color: '#f2e3c0',
    ink: '#3a2a12',
    edge: '#b9a578',
  },
  {
    id: 'gorengan',
    name: 'GORENG',
    label: 'Gorengan',
    price: 3_000,
    prepMs: 1_500,
    color: '#d9a53c',
    ink: '#33220a',
    edge: '#94661a',
  },
]

export const WARKOP = {
  eyebrow: 'Cartridge 08 · Warkop',
  titleTop: 'WARKOP',
  titleBottom: 'sebelah rumah',
  backToShelf: ROUTES.home,
  kicker: 'BUKA DULU, LAYANI NANTI',
  headline: 'Empat kursi, satu warkop.',
  blurb:
    'Jaga meja, baca pesanan, dan masak lima menu sebelum pelanggan kehabisan sabar. Semuanya berjalan di browser ini — tanpa akun, tanpa server, tanpa uang sungguhan.',
  badges: [
    { label: 'Hari', value: '90 detik' },
    { label: 'Menu', value: '5 hidangan' },
    { label: 'Rekor', value: 'lokal' },
  ],
  startKicker: 'WARKOP BUKA',
  startTitle: 'Layani pelanggan sebelum kabur.',
  startBlurb:
    'Tekan tombol menu untuk memasak. Dua kompor saja, jadi pilih yang paling mendesak — pesanan diantar otomatis begitu lengkap.',
  startNote:
    'Tombol 1–5 di keyboard juga bisa. Pelanggan yang keburu kabur cuma bikin rugi, bukan game over.',
  start: 'BUKA WARKOP',
  summaryKicker: 'WARKOP TUTUP',
  summaryTitle: 'Pendapatan hari ini',
  summaryServed: 'Dilayani',
  summaryMissed: 'Kabur',
  summaryBest: 'Rekor',
  summaryRecord: 'REKOR BARU',
  again: 'BUKA LAGI',
  openLabel: 'BUKA',
  closedLabel: 'TUTUP',
  brand: 'WARKOP',
  brandMeta: 'SEBELAH RUMAH · 08',
  total: 'TOTAL',
  close: 'TUTUP',
  soundOn: 'Suara menyala',
  soundOff: 'Suara mati',
  keysHint: 'Tekan 1–5 untuk memasak',
  kitchenLabel: 'DAPUR',
  burnerLabel: (used: number, total: number) => `${used}/${total} KOMPOR`,
} as const

export const STATS = {
  title: 'HARI INI',
  coins: 'Pendapatan',
  time: 'Sisa waktu',
  served: 'Dilayani',
  missed: 'Kabur',
  best: 'Rekor',
  closed: 'Warkop belum buka.',
  open: 'Warkop buka. Jangan biarkan kursi kosong.',
  summary: 'Hari ini selesai. Rekor tersimpan di browser ini.',
} as const

export const MENU_CARD = {
  title: 'MENU & HARGA',
  prep: 'matang',
  hint: 'Dua kompor saja. Pilih menu yang paling mendesak — sisanya menunggu.',
} as const

export const HELP = {
  title: 'CARA MAIN',
  rows: [
    'Lima tombol di bawah layar adalah dapur. Tekan untuk mulai memasak.',
    'Hanya dua kompor: pilih menu yang paling mendesak, bukan semuanya sekaligus.',
    'Pesanan diantar otomatis begitu semua itemnya siap di meja.',
    'Pelanggan yang sabar memberi tip lebih besar. Yang kabur tidak membayar.',
    'Satu hari 90 detik. Tekan TUTUP kalau ingin menutup lebih awal.',
  ],
} as const

export const NOTES = {
  title: 'CATATAN KECIL',
  rows: [
    'Rekor tersimpan di localStorage dengan kunci ihsnn:warkop:best.',
    'Pelanggan, pesanan dan uangnya digambar ulang di canvas 320 × 240; tidak ada file gambar.',
    'Bel warkop, uap dan suara kas disintesis WebAudio — tanpa file audio.',
    'Semua harga fiktif. Tidak ada transaksi sungguhan di sini.',
  ],
  footer: 'WARKOP · cartridge 08',
  sourceNote: 'Satu hari kecil di warkop sebelah rumah.',
  footerShelf: 'Kembali ke rak',
} as const

const numberFormat = new Intl.NumberFormat('id-ID')

export function formatNumber(value: number): string {
  return numberFormat.format(Math.round(value))
}

export function rupiah(value: number): string {
  return `Rp ${formatNumber(value)}`
}

export function prepLabel(ms: number): string {
  return `${(ms / 1_000).toFixed(1).replace('.', ',')} dtk`
}

export function itemLabel(id: ItemId): string {
  return MENU_ITEMS.find((item) => item.id === id)?.label ?? id
}
