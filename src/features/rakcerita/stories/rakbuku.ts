/**
 * Cerita 4 — Rak Buku Kaluna (6 halaman).
 *
 * The one book in the shelf that plays like a game: put four fallen books
 * back, count the top shelf, find the starred copy, then read it at bedtime.
 */

import {
  AD,
  bunting,
  floorRug,
  HTMLX,
  KAL,
  MAM,
  R,
  RAK_BOOK_H,
  RAK_BOOK_W,
  rakBg,
  rakBookLaySVG,
  rakBookSVG,
  rakOpenBook,
  rakSlot,
  SB,
  scene,
  spark4,
  star5,
} from '../art'
import { OV_A, OV_B } from '../art/scenes'
import {
  award,
  bubble,
  confettiBurst,
  flags,
  go,
  hearts,
  pageDone,
  currentPage,
  sfx,
  sparkFrom,
  stagePos,
  type ActTarget,
} from '../runtime'
import type { Story } from '../types'

/** A book drawn as a button (the shelf's whole interaction vocabulary). */
const RAKB = (
  act: string,
  x: number,
  y: number,
  w: number,
  h: number,
  inner: string,
  cls = '',
  extra = '',
  label = 'Buku',
) =>
  `${OV_A}<button class="stagebtn bookbtn ${cls}" data-act="${act}" aria-label="${label}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}">${inner}</button>${OV_B}`

/* ---------- aksi ---------- */
function bump(el: HTMLElement | null) {
  if (!el) return
  el.classList.remove('bump')
  void el.offsetWidth
  el.classList.add('bump')
}

/** Waits, but quietly drops the callback if the page has already turned. */
function later(fn: () => void, ms: number) {
  const at = currentPage()
  setTimeout(() => {
    if (currentPage() === at) fn()
  }, ms)
}

function returnBook(el: ActTarget, i: number) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.classList.add('gone')
  const slot = document.getElementById('rslot' + i)
  if (slot) slot.style.opacity = '1'
  flags.rakShelf += 1
  const c = document.getElementById('rakCount')
  if (c) {
    c.textContent = `Rak ${flags.rakShelf}/4`
    bump(c)
  }
  sfx('page')
  sparkFrom(el)
  bubble(
    ['Buku pink masuk!', 'Buku kuning masuk!', 'Buku hijau masuk!', 'Buku biru masuk!'][i - 1] ?? 'Masuk!',
    230,
    150,
    { ms: 1500 },
  )
  if (flags.rakShelf >= 4) {
    later(() => {
      confettiBurst(0.5, 0.28, 60)
      bubble('Rak buku rapi lagi!', 230, 56)
      award(el)
      pageDone()
    }, 520)
  }
}

function countBook(el: ActTarget) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.classList.add('counted')
  flags.rakNum += 1
  const n = flags.rakNum
  const c = document.getElementById('rakNum')
  if (c) {
    c.textContent = `${n} buku`
    bump(c)
  }
  sfx(`ding${n}`)
  sparkFrom(el)
  const p = stagePos(el)
  bubble(String(n), p.x - 18, Math.max(12, p.y - 76), { tiny: true, ms: 1000 })
  if (n >= 5) {
    later(() => {
      confettiBurst(0.5, 0.28, 60)
      bubble('Lima buku! Pintar!', 220, 56)
      award(el)
      pageDone()
    }, 520)
  }
}

function findBook(el: ActTarget, ok: boolean) {
  if (flags.rakFound) return
  if (!ok) {
    sfx('wrong')
    el.classList.remove('shake')
    void el.offsetWidth
    el.classList.add('shake')
    bubble('Bukan itu… cari yang pink!', 200, 96, { tiny: true, ms: 1700 })
    return
  }
  flags.rakFound = 1
  el.classList.add('counted')
  sfx('chime')
  sparkFrom(el)
  hearts(460, 150)
  bubble('Ini dia, buku kesayangan!', 190, 80)
  later(() => {
    confettiBurst(0.55, 0.3, 40)
    award(el)
    pageDone()
  }, 650)
}

function readBook(el: ActTarget) {
  if (flags.rakRead) return
  flags.rakRead = 1
  el.classList.add('done')
  sfx('page')
  sparkFrom(el)
  bubble('Dulu, ada bintang kecil…', 170, 58, { ms: 2400 })
  later(() => {
    sfx('page')
    bubble('…ia mencari seorang teman.', 190, 66, { ms: 2400 })
  }, 1600)
  later(() => {
    sfx('sparkle')
    bubble('…dan bertemu Kaluna!', 210, 74, { ms: 3000 })
    hearts(486, 150)
  }, 3300)
  later(() => {
    confettiBurst(0.5, 0.34, 50)
    award(el)
    pageDone()
  }, 4200)
}

export const rakbuku: Story = {
  id: 'rakbuku',
  title: 'Rak Buku Kaluna',
  short: 'Rak Buku',
  pages: [
    /* ---------------- 0. SAMPUL ---------------- */
    {
      t: 'Sampul',
      n: 'Rak Buku Kaluna. Main merapikan buku bersama Kaluna dan Mamau.',
      band: false,
      art: () => `${scene(`
        ${rakBg()}
        ${KAL({ mood: 'laugh' }, 846, 358, 0.84, 'bob')}
        ${MAM({}, 726, 358, 0.56, 'bob')}
        ${star5(300, 486, 13, '#FFF3C9', 'opacity=".5"')}
      `)}
      <div class="cover-title ov rak-cover">
        <span class="kick">Cerita 4 · Main</span>
        <h2>Rak Buku<br /><em>Kaluna</em></h2>
        <p>Rapikan, hitung, lalu baca bersama</p>
      </div>
      ${SB('start', 64, 396, 322, 74, `<span class="startbtn-in"><svg><use href="#i-play"/></svg> Mulai main</span>`, 'startbtn')}`,
      acts: {
        start() {
          sfx('open')
          go(1)
        },
      },
    },
    /* ---------------- 1. RAK BERANTAKAN ---------------- */
    {
      t: 'Rak Berantakan',
      n: 'Uh-oh! Buku-buku Kaluna jatuh berserakan. Ayo kembalikan ke rak!',
      hint: 'Ketuk empat buku di lantai',
      art: () => scene(`
        ${rakBg({ gaps: [[], [[96, 168], [246, 318], [396, 468], [546, 618]], []] })}
        ${R(254, 408, 100, 10, '#000000', 'opacity=".18"')}
        ${R(384, 408, 100, 10, '#000000', 'opacity=".18"')}
        ${R(514, 408, 100, 10, '#000000', 'opacity=".18"')}
        ${R(644, 408, 100, 10, '#000000', 'opacity=".18"')}
        ${KAL({ mood: 'wow' }, 846, 358, 0.84, 'bob')}
        ${rakSlot(1, 100, 240, '#F05A8A')}
        ${rakSlot(2, 250, 240, '#FFC93C')}
        ${rakSlot(3, 400, 240, '#8CC63F')}
        ${rakSlot(4, 550, 240, '#5AA9E6')}
        ${RAKB('b1', 246, 352, 116, 62, rakBookLaySVG('#F05A8A'), '', 'transform:rotate(-6deg)', 'Buku pink di lantai')}
        ${RAKB('b2', 376, 352, 116, 62, rakBookLaySVG('#FFC93C'), '', 'transform:rotate(5deg)', 'Buku kuning di lantai')}
        ${RAKB('b3', 506, 352, 116, 62, rakBookLaySVG('#8CC63F'), '', 'transform:rotate(-3deg)', 'Buku hijau di lantai')}
        ${RAKB('b4', 636, 352, 116, 62, rakBookLaySVG('#5AA9E6'), '', 'transform:rotate(7deg)', 'Buku biru di lantai')}
        ${HTMLX('<div class="counter" id="rakCount" style="left:28px;top:372px">Rak 0/4</div>')}
      `),
      acts: {
        b1: (el) => returnBook(el, 1),
        b2: (el) => returnBook(el, 2),
        b3: (el) => returnBook(el, 3),
        b4: (el) => returnBook(el, 4),
      },
    },
    /* ---------------- 2. HITUNG BUKU ---------------- */
    {
      t: 'Hitung Buku',
      n: 'Rak sudah rapi! Sekarang hitung bukunya, yuk. Ketuk satu per satu.',
      hint: 'Ketuk lima buku di rak atas',
      art: () => scene(`
        ${rakBg({ gaps: [[[104, 176], [226, 298], [348, 420], [470, 542], [592, 664]], [], []] })}
        ${KAL({ mood: 'laugh' }, 846, 358, 0.84, 'bob')}
        ${RAKB('c1', 110, 50, RAK_BOOK_W, RAK_BOOK_H, rakBookSVG('#F05A8A'), '', '--d:.1s')}
        ${RAKB('c2', 232, 50, RAK_BOOK_W, RAK_BOOK_H, rakBookSVG('#FFC93C'), '', '--d:.35s')}
        ${RAKB('c3', 354, 50, RAK_BOOK_W, RAK_BOOK_H, rakBookSVG('#2E9E9A'), '', '--d:.6s')}
        ${RAKB('c4', 476, 50, RAK_BOOK_W, RAK_BOOK_H, rakBookSVG('#8CC63F'), '', '--d:.85s')}
        ${RAKB('c5', 598, 50, RAK_BOOK_W, RAK_BOOK_H, rakBookSVG('#8E7BD6'), '', '--d:1.1s')}
        ${HTMLX('<div class="counter" id="rakNum" style="left:28px;top:372px">0 buku</div>')}
      `),
      acts: {
        c1: (el) => countBook(el),
        c2: (el) => countBook(el),
        c3: (el) => countBook(el),
        c4: (el) => countBook(el),
        c5: (el) => countBook(el),
      },
    },
    /* ---------------- 3. CARI BUKU FAVORIT ---------------- */
    {
      t: 'Cari Buku Favorit',
      n: 'Mana buku kesayangan Kaluna? Bukunya berwarna pink dan ada bintangnya!',
      hint: 'Ketuk buku pink bertanda bintang',
      art: () => scene(`
        ${rakBg({ gaps: [[], [[176, 248], [300, 372], [424, 496], [548, 620]], []] })}
        ${KAL({ mood: 'smile' }, 846, 358, 0.84, 'bob')}
        ${RAKB('f1', 182, 156, RAK_BOOK_W, RAK_BOOK_H, rakBookSVG('#2E9E9A'), '', '--d:.15s', 'Buku biru kehijauan')}
        ${RAKB('f2', 306, 156, RAK_BOOK_W, RAK_BOOK_H, rakBookSVG('#8CC63F'), '', '--d:.4s', 'Buku hijau')}
        ${RAKB('f3', 430, 156, RAK_BOOK_W, RAK_BOOK_H, rakBookSVG('#F05A8A', { star: true }), '', '--d:.65s', 'Buku pink berbintang')}
        ${RAKB('f4', 554, 156, RAK_BOOK_W, RAK_BOOK_H, rakBookSVG('#8E7BD6'), '', '--d:.9s', 'Buku ungu')}
      `),
      acts: {
        f1: (el) => findBook(el, false),
        f2: (el) => findBook(el, false),
        f3: (el) => findBook(el, true),
        f4: (el) => findBook(el, false),
      },
    },
    /* ---------------- 4. BACA BERSAMA ---------------- */
    {
      t: 'Baca Bersama',
      n: 'Malam sudah datang. Mama membacakan buku kesayangan Kaluna.',
      hint: 'Ketuk buku yang terbuka',
      art: () => scene(`
        ${rakBg({ night: true })}
        ${AD('mama', { mood: 'smile' }, 226, 358, 0.78, 'bob')}
        ${KAL({ mood: 'laugh' }, 748, 358, 0.78, 'bob')}
        ${spark4(330, 190, 13, '#FFE9A8', 0.85)}
        ${spark4(650, 214, 10, '#FFE9A8', 0.75)}
        ${rakOpenBook(486, 248, 1.06)}
        ${SB('read', 372, 158, 228, 196, '', 'hitbtn')}
      `),
      acts: {
        read: (el) => readBook(el),
      },
    },
    /* ---------------- 5. TAMAT ---------------- */
    {
      t: 'Tamat',
      n: 'Tamat. Raknya rapi, hatinya senang. Besok kita baca lagi, ya!',
      lastPage: true,
      art: () => `${scene(`
        <rect width="960" height="540" fill="#F3D6AE"/>
        ${Array.from({ length: 18 }, (_, i) => R(14 + i * 56, 0, 8, 414, '#FFE6C4', 'opacity=".5"')).join('')}
        ${R(0, 414, 960, 126, '#C98A4B')}
        ${R(0, 414, 960, 10, '#B4783A')}
        ${R(0, 414, 960, 4, '#D9A06A')}
        ${bunting(60, 900, 26, 50)}
        ${floorRug(480, 486, 620, 96, '#F08AAE')}
        ${AD('mama', { mood: 'laugh' }, 210, 414, 0.72, 'bob')}
        ${AD('papa', { mood: 'laugh' }, 700, 414, 0.72, 'bob')}
        ${KAL({ mood: 'laugh' }, 430, 414, 0.84, 'bob')}
        ${MAM({}, 532, 414, 0.58, 'bob')}
        ${star5(120, 150, 18, '#FFF3C9', 'opacity=".85"')}
        ${star5(840, 120, 14, '#FFF3C9', 'opacity=".7"')}
        ${spark4(320, 200, 12, '#FFE9A8', 0.8)}
      `)}
      <div class="end-title ov"><span>Tamat</span><small>Rak rapi, hati senang</small></div>`,
      acts: {},
    },
  ],
}
