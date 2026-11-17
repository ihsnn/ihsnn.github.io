/**
 * Cerita 2 — Kaluna & Mamau di Kebun Nenda (8 halaman).
 */

import {
  AD,
  basketProp,
  bush,
  butterfly,
  cookiePlate,
  cupTea,
  fenceProp,
  flower,
  gardenBg,
  gateProp,
  houseSmall,
  HZ,
  KAL,
  MAM,
  SB,
  scene,
  star5,
  starField,
  cloud,
  bunting,
  tree,
  teaTable,
  teapot,
  tomato,
  tomatoPlant,
  wateringCan,
} from '../art'
import {
  award,
  bubble,
  confettiBurst,
  flags,
  go,
  hearts,
  pageDone,
  sceneEl,
  sfx,
  spark,
  sparkFrom,
  stagePos,
  bubblesEl,
  type ActTarget,
} from '../runtime'
import type { Story } from '../types'

const BLOOM_COLORS = ['#F27D9D', '#F2C14E', '#B58BE8']

/* ---------- aksi ---------- */
function bloomFlower(el: ActTarget, i: number) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.classList.add('done')
  const f = document.getElementById('kf' + i)
  if (f) f.classList.add('on')
  const b = document.getElementById('kb' + i)
  if (b) b.style.opacity = '0'
  flags.bloom += 1
  sfx('sparkle')
  sparkFrom(el)
  bubble(['Mekar!', 'Wangi!', 'Cantik!'][i - 1], 300 + (i - 1) * 185, 250, { ms: 1600 })
  if (flags.bloom === 3) {
    setTimeout(() => {
      confettiBurst(0.5, 0.45, 70)
      bubble('Kebunnya mekar semua!', 380, 70)
      award(el)
      pageDone()
    }, 450)
  }
}

function plantSeed(el: ActTarget, i: number) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.classList.add('done')
  const s = document.getElementById('sd' + i)
  if (s) s.style.opacity = '1'
  flags.seeds += 1
  const c = document.getElementById('seedCount')
  if (c) {
    c.textContent = `Benih ${flags.seeds}/3`
    c.classList.remove('bump')
    void c.offsetWidth
    c.classList.add('bump')
  }
  sfx('pop')
  sparkFrom(el)
  if (flags.seeds === 3) bubble('Sekarang siram, ya!', 600, 220)
  else bubble('Benih masuk ke tanah', 400, 250, { tiny: true })
}

function waterGarden(el: ActTarget) {
  if (flags.seeds < 3) {
    sfx('wrong')
    bubble('Tanam tiga benih dulu, ya!', 530, 220)
    return
  }
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.classList.add('done')
  sfx('water')
  const layer = bubblesEl()
  for (let i = 0; i < 9; i++) {
    const d = document.createElement('div')
    d.className = 'waterdrop'
    d.style.left = 700 + (i % 3) * 12 + 'px'
    d.style.top = 330 + i * 7 + 'px'
    d.style.animationDelay = i * 0.06 + 's'
    layer?.appendChild(d)
    setTimeout(() => d.remove(), 1200)
  }
  setTimeout(() => {
    ;[1, 2, 3].forEach((i) => document.getElementById('sp' + i)?.classList.add('on'))
    sfx('sparkle')
    bubble('Tumbuh!', 480, 180)
    confettiBurst(0.5, 0.5, 50)
    award(el)
    pageDone()
  }, 750)
}

function catchButterfly(el: ActTarget, i: number) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.classList.add('done')
  const b = document.getElementById('bf' + i)
  if (b) b.querySelector('.bfly')?.classList.add('flyaway')
  flags.flies += 1
  sfx('sparkle')
  sparkFrom(el)
  bubble(['Kuning!', 'Merah muda!', 'Biru!'][i - 1], [300, 560, 760][i - 1], 120, { ms: 1500 })
  if (flags.flies === 3) {
    setTimeout(() => {
      confettiBurst(0.5, 0.4, 60)
      bubble('Ketiganya hinggap di bunga!', 300, 70)
      award(el)
      pageDone()
    }, 450)
  }
}

function pickTomato(el: ActTarget, i: number) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.classList.add('done')
  const t = document.getElementById('tm' + i)
  if (t) t.style.opacity = '0'
  const bt = document.getElementById('bt' + i)
  if (bt) {
    bt.style.transition = 'opacity .3s'
    bt.style.opacity = '1'
  }
  flags.tomatoes += 1
  const c = document.getElementById('tomCount')
  if (c) {
    c.textContent = `Panen ${flags.tomatoes}/3`
    c.classList.remove('bump')
    void c.offsetWidth
    c.classList.add('bump')
  }
  sfx('pop')
  sparkFrom(el)
  bubble('Tomat merah!', 520, 170, { ms: 1600 })
  if (flags.tomatoes === 3) {
    setTimeout(() => {
      sfx('sparkle')
      confettiBurst(0.65, 0.45, 60)
      bubble('Keranjangnya penuh!', 600, 100)
      award(el)
      pageDone()
    }, 400)
  }
}

function checkTea(el: ActTarget) {
  if (flags.tea && flags.cookie) {
    setTimeout(() => {
      confettiBurst(0.5, 0.4, 40)
      award(el)
      pageDone()
    }, 300)
  }
}

function pourTea(el: ActTarget) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.classList.add('done')
  sfx('pour')
  const st = document.getElementById('teaStream')
  if (st) st.style.opacity = '1'
  setTimeout(() => {
    if (st) st.style.opacity = '0'
    document.querySelectorAll('.teafill').forEach((f) => {
      const e = f as HTMLElement
      e.style.transition = 'opacity .5s'
      e.style.opacity = '1'
    })
    sfx('chime')
    bubble('Teh hangat!', 470, 200)
    flags.tea = true
    checkTea(el)
  }, 800)
}

function eatCookie(el: ActTarget) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.classList.add('done')
  sfx('pop')
  sparkFrom(el)
  hearts(660, 300)
  bubble('Nyam nyam!', 620, 260)
  flags.cookie = true
  checkTea(el)
}

/* ---------- cerita ---------- */
export const kebun: Story = {
  id: 'kebun',
  title: 'Kaluna & Mamau di Kebun Nenda',
  short: 'Kebun Nenda',
  pages: [
    /* ---------------- 0. SAMPUL ---------------- */
    {
      t: 'Sampul',
      n: 'Kaluna & Mamau di Kebun Nenda. Petualangan di kebun Nenda.',
      band: false,
      art: () => `${scene(`
        <rect width="960" height="540" fill="#E7F4D8"/>
        <rect x="120" y="250" width="480" height="250" fill="#F4FBEC" opacity=".9"/>
        <rect x="160" y="210" width="400" height="40" fill="#F4FBEC" opacity=".9"/>
        <rect x="210" y="178" width="300" height="32" fill="#F4FBEC" opacity=".9"/>
        <rect x="270" y="160" width="180" height="18" fill="#F4FBEC" opacity=".9"/>
        ${starField(90, 50, 760, 220, 9)}
        ${flower(430, 502, 2.6, '#F27D9D')}
        ${flower(868, 504, 2.0, '#F2C14E', '#E08A3C')}
        ${butterfly(430, 214, 1.55, '#F2C14E', '#E76489')}
        <ellipse cx="520" cy="514" rx="420" ry="46" fill="#CBE3A8" opacity=".7"/>
        ${MAM({}, 530, 512, 0.88, 'bob')}
        ${KAL({ mood: 'laugh', hijab: '#F08AAE' }, 620, 512, 0.92, 'bob')}
        ${AD('nenda', { mood: 'laugh' }, 780, 512, 1.0, 'bob')}
      `)}
      <div class="cover-title ov">
        <span class="kick">Cerita 2 · Kaluna &amp; Mamau</span>
        <h2>Kebun<br /><em>Nenda</em></h2>
        <p>Petualangan di kebun Nenda</p>
      </div>
      ${SB('start', 62, 340, 300, 84, `<span class="startbtn-in"><svg><use href="#i-play"/></svg> Mulai membaca</span>`, 'startbtn')}`,
      acts: {
        start() {
          sfx('open')
          go(1)
        },
      },
    },
    /* ---------------- 1. KE RUMAH NENDA ---------------- */
    {
      t: 'Ke Rumah Nenda',
      n: 'Sampai di rumah Nenda! Gerbangnya tinggi. Ketuk gerbang untuk masuk.',
      hint: 'Ketuk gerbang kayu',
      art: () => scene(`
        ${gardenBg({ sun: true })}
        ${fenceProp(36, 362, 264)}
        ${houseSmall(742, 414, 0.9)}
        ${gateProp(400, 240, 152, 174)}
        ${AD('nenda', { mood: 'laugh' }, 776, 414, 0.78, 'bob')}
        ${AD('mama', { mood: 'smile' }, 286, 414, 0.84, 'bob')}
        ${KAL({ mood: 'wow', hijab: '#F08AAE' }, 190, 414, 0.76, 'bob')}
        ${MAM({}, 110, 414, 0.54, 'bob')}
        ${HZ('gate', 398, 234, 156, 184, { label: 'Buka', icon: 'door' })}
      `),
      acts: {
        gate(btn) {
          if (btn.dataset.done) return
          btn.dataset.done = '1'
          btn.classList.add('done')
          sceneEl()?.classList.add('ws-open')
          sfx('door')
          const p = stagePos(btn)
          spark(p.x, p.y)
          bubble('Assalamualaikum, Nenda!', 590, 120)
          award(btn)
          pageDone()
        },
      },
    },
    /* ---------------- 2. KEBUN YANG HIJAU ---------------- */
    {
      t: 'Kebun yang Hijau',
      n: 'Kebun Nenda hijau dan wangi. Ketuk tiga kuncup bunga supaya mekar!',
      hint: 'Ketuk tiga kuncup bunga',
      art: () => scene(`
        ${gardenBg({ sun: true })}
        ${AD('nenda', { mood: 'laugh' }, 860, 414, 0.82, 'bob')}
        ${KAL({ mood: 'laugh', hijab: '#F08AAE' }, 140, 414, 0.8, 'bob')}
        ${MAM({}, 228, 414, 0.52, 'bob')}
        ${[0, 1, 2]
          .map((i) => {
            const x = 330 + i * 185
            return `<g id="kf${i + 1}" class="bloom-flower">${flower(x, 414, 2.7, BLOOM_COLORS[i])}</g>
            <g id="kb${i + 1}"><path d="M${x} 414v-74" stroke="#5E9A5C" stroke-width="6" stroke-linecap="round"/><path d="M${x - 4} 386q-20-4-26-20 18 0 26 20z" fill="#7FB46E"/><path d="M${x + 4} 366q20-4 26-20-18 0-26 20z" fill="#7FB46E"/><path d="M${x - 18} 344q18-44 36 0-7 24-18 29-11-5-18-29z" fill="#E76489"/><path d="M${x - 18} 344q18 12 36 0l-4 12q-14 8-28 0z" fill="#7FB46E"/><ellipse cx="${x}" cy="414" rx="18" ry="6" fill="#5B3A22" opacity=".18"/></g>`
          })
          .join('')}
        ${butterfly(250, 200, 1.5, '#F2C14E', '#E76489')}
        ${butterfly(700, 160, 1.3, '#B58BE8', '#F2C14E')}
        ${HZ('f1', 250, 292, 160, 124, { sm: true, label: 'Kuncup satu', dot: [50, 45] })}
        ${HZ('f2', 435, 292, 160, 124, { sm: true, label: 'Kuncup dua', dot: [50, 45] })}
        ${HZ('f3', 620, 292, 160, 124, { sm: true, label: 'Kuncup tiga', dot: [50, 45] })}
      `),
      acts: {
        f1: (el) => bloomFlower(el, 1),
        f2: (el) => bloomFlower(el, 2),
        f3: (el) => bloomFlower(el, 3),
      },
    },
    /* ---------------- 3. MENANAM BUNGA ---------------- */
    {
      t: 'Menanam Bunga',
      n: 'Ayo menanam! Ketuk tiga lubang tanah, lalu siram dengan air.',
      hint: 'Tanam tiga benih, lalu siram',
      art: () => scene(`
        ${gardenBg({ sun: true })}
        <path d="M250 414q0-64 230-64t230 64z" fill="#B98A5E"/>
        <path d="M270 412q0-48 210-48t210 48z" fill="#A9744A"/>
        ${[0, 1, 2]
          .map((i) => {
            const x = 340 + i * 130
            return `<ellipse cx="${x}" cy="398" rx="24" ry="10" fill="#8C5A36"/>
            <g id="sd${i + 1}" opacity="0"><ellipse cx="${x}" cy="392" rx="8" ry="5.5" fill="#F2C14E"/><path d="M${x - 3} 394q3-7 6 0" stroke="#8C5A36" stroke-width="1.5" fill="none"/></g>
            <g id="sp${i + 1}" class="sprout">${flower(x, 402, 0.72, '#7FB46E', '#A9C74E')}</g>`
          })
          .join('')}
        ${wateringCan(722, 408, 1.35)}
        ${AD('nenda', { mood: 'smile' }, 884, 414, 0.7, 'bob')}
        ${KAL({ mood: 'smile', hijab: '#F08AAE' }, 146, 414, 0.8, 'bob')}
        ${MAM({}, 234, 414, 0.52, 'bob')}
        ${HZ('s1', 300, 330, 84, 90, { sm: true, label: 'Tanam', dot: [50, 78] })}
        ${HZ('s2', 430, 330, 84, 90, { sm: true, label: 'Tanam', dot: [50, 78] })}
        ${HZ('s3', 560, 330, 84, 90, { sm: true, label: 'Tanam', dot: [50, 78] })}
        ${HZ('water', 646, 296, 160, 124, { label: 'Siram', icon: 'sparkle', dot: [62, 55] })}
        ${`<div class="counter" id="seedCount" style="left:406px;top:246px">Benih 0/3</div>`}
      `),
      acts: {
        s1: (el) => plantSeed(el, 1),
        s2: (el) => plantSeed(el, 2),
        s3: (el) => plantSeed(el, 3),
        water: (el) => waterGarden(el),
      },
    },
    /* ---------------- 4. KUPU-KUPU ---------------- */
    {
      t: 'Kupu-Kupu Warna-Warni',
      n: 'Kupu-kupu datang ke kebun! Ketuk tiga kupu-kupu warna-warni.',
      hint: 'Ketuk tiga kupu-kupu',
      art: () => scene(`
        ${gardenBg({ sun: true })}
        ${flower(250, 414, 2.3, '#F27D9D')}
        ${flower(540, 414, 2.5, '#F2C14E', '#E08A3C')}
        ${flower(820, 414, 2.1, '#B58BE8')}
        ${KAL({ mood: 'wow', hijab: '#F08AAE' }, 120, 414, 0.8, 'bob')}
        ${AD('nenda', { mood: 'laugh' }, 892, 414, 0.68, 'bob')}
        <g id="bf1">${butterfly(330, 220, 1.9, '#F2C14E', '#E76489')}</g>
        <g id="bf2">${butterfly(590, 180, 1.75, '#E76489', '#F2C14E')}</g>
        <g id="bf3">${butterfly(800, 250, 1.65, '#5AA9E6', '#F2C14E')}</g>
        ${HZ('k1', 278, 168, 108, 108, { sm: true, label: 'Kupu-kupu kuning', dot: [50, 8] })}
        ${HZ('k2', 538, 128, 108, 108, { sm: true, label: 'Kupu-kupu merah muda', dot: [50, 8] })}
        ${HZ('k3', 748, 198, 108, 108, { sm: true, label: 'Kupu-kupu biru', dot: [50, 8] })}
      `),
      acts: {
        k1: (el) => catchButterfly(el, 1),
        k2: (el) => catchButterfly(el, 2),
        k3: (el) => catchButterfly(el, 3),
      },
    },
    /* ---------------- 5. PANEN TOMAT ---------------- */
    {
      t: 'Panen Tomat',
      n: 'Tomatnya sudah merah! Ketuk tiga tomat untuk memanen.',
      hint: 'Ketuk tiga tomat',
      art: () => scene(`
        ${gardenBg({ sun: true })}
        ${tomatoPlant(300, 414, 1.2)}
        ${tomato(240, 322, 1.25, 'tm1')}
        ${tomato(356, 292, 1.25, 'tm2')}
        ${tomato(300, 236, 1.25, 'tm3')}
        ${basketProp(700, 414, 1.12)}
        <g id="bt1" opacity="0"><circle cx="676" cy="376" r="16" fill="#E05252"/><circle cx="671" cy="371" r="5" fill="#F27D7D" opacity=".6"/></g>
        <g id="bt2" opacity="0"><circle cx="716" cy="380" r="16" fill="#E05252"/><circle cx="711" cy="375" r="5" fill="#F27D7D" opacity=".6"/></g>
        <g id="bt3" opacity="0"><circle cx="694" cy="352" r="16" fill="#E05252"/><circle cx="689" cy="347" r="5" fill="#F27D7D" opacity=".6"/></g>
        ${AD('nenda', { mood: 'laugh' }, 866, 414, 0.72, 'bob')}
        ${KAL({ mood: 'laugh', hijab: '#F08AAE' }, 120, 414, 0.78, 'bob')}
        ${MAM({}, 208, 414, 0.5, 'bob')}
        ${HZ('t1', 200, 286, 84, 84, { sm: true, label: 'Tomat satu', dot: [50, 8] })}
        ${HZ('t2', 316, 256, 84, 84, { sm: true, label: 'Tomat dua', dot: [50, 8] })}
        ${HZ('t3', 260, 200, 84, 84, { sm: true, label: 'Tomat tiga', dot: [50, 8] })}
        <div class="counter" id="tomCount" style="left:646px;top:246px">Panen 0/3</div>
      `),
      acts: {
        t1: (el) => pickTomato(el, 1),
        t2: (el) => pickTomato(el, 2),
        t3: (el) => pickTomato(el, 3),
      },
    },
    /* ---------------- 6. MAKAN BERSAMA ---------------- */
    {
      t: 'Makan Bersama',
      n: 'Nenda membuat teh hangat dan kue. Ketuk teko dan kuenya!',
      hint: 'Ketuk teko, lalu kuenya',
      art: () => scene(`
        ${gardenBg({ sun: true })}
        ${bush(70, 414, 1.1)}
        ${bush(880, 414, 0.9)}
        ${AD('nenda', { mood: 'laugh' }, 190, 414, 0.78, 'bob')}
        ${AD('ayahchiek', { mood: 'laugh' }, 790, 414, 0.76, 'bob')}
        ${KAL({ mood: 'laugh', hijab: '#F08AAE' }, 360, 414, 0.74, 'bob')}
        ${MAM({}, 288, 414, 0.46, 'bob')}
        ${teaTable(470, 414, 1.05)}
        ${teapot(420, 312, 1.0)}
        ${cupTea(540, 314, 0.92)}
        <ellipse class="teafill" cx="540" cy="303" rx="11" ry="3.4" fill="#C98A4B" opacity="0"/>
        ${cupTea(596, 320, 0.82)}
        <ellipse class="teafill" cx="596" cy="310" rx="10" ry="3" fill="#C98A4B" opacity="0"/>
        ${cookiePlate(492, 322, 0.95)}
        <path id="teaStream" d="M452 292 Q500 302 530 306" stroke="#C98A4B" stroke-width="6" fill="none" stroke-linecap="square" stroke-dasharray="8 8" opacity="0"/>
        ${HZ('teapot', 386, 258, 96, 74, { label: '', dot: [50, 60] })}
        ${HZ('cookie', 456, 292, 84, 58, { label: '', dot: [50, 80] })}
      `),
      acts: {
        teapot: (el) => pourTea(el),
        cookie: (el) => eatCookie(el),
      },
    },
    /* ---------------- 7. TAMAT ---------------- */
    {
      t: 'Tamat',
      n: 'Tamat. Kebun Nenda selalu ramai dan hangat. Sampai jumpa di cerita berikutnya!',
      lastPage: true,
      art: () => `${scene(`
        <defs><linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9A8"/><stop offset=".55" stop-color="#FFC1A0"/><stop offset="1" stop-color="#FCE3C4"/></linearGradient></defs>
        <rect width="960" height="540" fill="url(#sunset)"/>
        <circle cx="842" cy="168" r="58" fill="#FFE08A" opacity=".9"/>
        <circle cx="842" cy="168" r="42" fill="#FFEDB8"/>
        ${cloud(170, 130, 0.8, '#FFF3E2')}${cloud(480, 90, 0.55, '#FFF3E2')}
        <path d="M0 336q170-64 350-30t290-22 320 34v222H0z" fill="#8FBE6A"/>
        <rect y="392" width="960" height="148" fill="#7FB05E"/>
        ${bunting(60, 900, 40, 48)}
        <g transform="translate(880 414)">${tree(0, 0, 0.7, '#6BA368')}</g>
        <g transform="translate(70 414)">${tree(0, 0, 0.8, '#79B06A')}</g>
        ${AD('nenda', { mood: 'laugh' }, 220, 414, 0.62, 'bob')}
        ${AD('ayahchiek', { mood: 'laugh' }, 340, 414, 0.6, 'bob')}
        ${KAL({ mood: 'laugh', hijab: '#F08AAE' }, 470, 414, 0.58, 'bob')}
        ${AD('mama', { mood: 'laugh' }, 580, 414, 0.62, 'bob')}
        ${AD('papa', { mood: 'laugh' }, 700, 414, 0.62, 'bob')}
        ${MAM({}, 780, 414, 0.42, 'bob')}
        ${star5(906, 120, 20, '#FFF3C9', 'opacity=".9"')}
        ${star5(84, 160, 14, '#FFF3C9', 'opacity=".7"')}
      `)}
      <div class="end-title ov"><span>Tamat</span><small>Kebun Nenda selalu hangat</small></div>`,
      acts: {},
    },
  ],
}
