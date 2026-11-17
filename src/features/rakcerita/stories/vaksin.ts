/**
 * Cerita 1 — Kaluna Berani Vaksin (15 halaman).
 *
 * Copy and artwork were written together, page by page, so they live in the
 * same file: editing a sentence means editing the drawing beside it.
 */

import {
  bedProp,
  booksStack,
  bunting,
  chair,
  clinicOutside,
  doorProp,
  fishTank,
  floorRug,
  frameArt,
  heartIcon,
  KAL,
  lantern,
  MAM,
  AD,
  HZ,
  SB,
  HTMLX,
  numberBoard,
  poster,
  plant,
  rehalBook,
  roomBg,
  scene,
  spark4,
  star5,
  starField,
  ticketMachine,
  windowArch,
  lamp,
  streetBg,
  motoCut,
  bagTote,
} from '../art'
import { R } from '../art/core'
import {
  award,
  bubble,
  confettiBurst,
  countBubble,
  flags,
  go,
  hearts,
  pageDone,
  sceneEl,
  setCaption,
  sfx,
  spark,
  sparkFrom,
  speak,
  stagePos,
  sunSound,
  floatTicket,
  hornNotes,
  type ActTarget,
} from '../runtime'
import type { Story } from '../types'

/* ---------- constelan sifat yang dipakai halaman 13 ---------- */
const benefits = [
  { act: 'b1', icon: 'shield', title: 'Tubuh kuat', text: 'Tubuh jadi kuat melawan kuman jahat.' },
  { act: 'b2', icon: 'heart', title: 'Tidak mudah sakit', text: 'Tidak mudah sakit, jadi bisa terus bermain.' },
  { act: 'b3', icon: 'family', title: 'Melindungi', text: 'Melindungi teman dan keluarga di rumah.' },
  { act: 'b4', icon: 'sprout', title: 'Tumbuh sehat', text: 'Tumbuh sehat, kuat, dan selalu ceria.' },
]

/* ---------- props kecil ---------- */
const milkBottle = `<svg viewBox="0 0 80 100"><rect x="28" y="6" width="24" height="12" rx="6" fill="#F2C14E"/><path d="M25 18h30l4 18v54a10 10 0 0 1-10 10H31a10 10 0 0 1-10-10V36z" fill="#FFF6E4"/><path d="M21 36h38v10H21z" fill="#F7BFD0"/><rect x="30" y="54" width="20" height="26" rx="4" fill="#BFE6E4"/><path d="M40 58v18M31 67h18" stroke="#7FC2AF" stroke-width="4" stroke-linecap="round"/></svg>`
const bookPink = `<svg viewBox="0 0 100 100">
  <rect x="14" y="14" width="64" height="74" fill="#F05A8A" stroke="#2B1B33" stroke-width="6"/>
  <rect x="20" y="20" width="52" height="62" fill="#F7AFC4"/>
  <rect x="66" y="16" width="12" height="70" fill="#FFF4D6" stroke="#2B1B33" stroke-width="5"/>
  <path d="M72 24h4M72 32h4M72 40h4" stroke="#D9C4A6" stroke-width="3"/>
  <path d="M46 34l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z" fill="#FFF4D6"/>
  <rect x="20" y="20" width="8" height="62" fill="#C93A63"/>
</svg>`
const mamaBottle = `<svg viewBox="0 0 100 120">
  <rect x="34" y="6" width="32" height="14" fill="#7FC9B0" stroke="#2B1B33" stroke-width="5"/>
  <rect x="30" y="20" width="40" height="10" fill="#2E9E9A" stroke="#2B1B33" stroke-width="5"/>
  <rect x="24" y="30" width="52" height="76" fill="#C9A7E8" stroke="#2B1B33" stroke-width="6"/>
  <rect x="30" y="48" width="40" height="24" fill="#FFF4D6"/>
  <path d="M78 44q12 12 0 26" stroke="#2B1B33" stroke-width="6" fill="none"/>
  <rect x="30" y="80" width="40" height="6" fill="#A97FD0"/>
  <rect x="36" y="38" width="8" height="44" fill="#E2CCF4" opacity=".7"/>
</svg>`
const vaxTray = `<g><rect x="-56" y="-16" width="112" height="30" rx="15" fill="#DDE9EC"/><rect x="-40" y="-24" width="20" height="24" rx="6" fill="#FFF6E4"/><rect x="-8" y="-28" width="14" height="28" rx="5" fill="#F7BFD0"/><circle cx="34" cy="-2" r="12" fill="#FFF1D8"/><path d="M26 -2h16M34 -10v16" stroke="#E76489" stroke-width="3"/></g>`

function plasterSVG(x: number, y: number) {
  return `<g transform="translate(${x} ${y}) rotate(-12)">
    <rect x="-22" y="-9" width="44" height="18" rx="9" fill="#F7BFD0"/>
    <rect x="-8" y="-9" width="16" height="18" fill="#FFF6E4"/>
    ${[0, 1, 2].map((i) => `<circle cx="-14" cy="${-4 + i * 4}" r="1.3" fill="#E76489"/>`).join('')}
    ${[0, 1, 2].map((i) => `<circle cx="14" cy="${-4 + i * 4}" r="1.3" fill="#E76489"/>`).join('')}
  </g>`
}

/* ---------- aksi ---------- */
function packItem(el: ActTarget) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.classList.add('gone')
  sfx('pop')
  flags.packed += 1
  const c = document.getElementById('bagCount')
  if (c) {
    c.textContent = `Tas ${flags.packed}/3`
    c.classList.remove('bump')
    void c.offsetWidth
    c.classList.add('bump')
  }
  sparkFrom(el)
  if (flags.packed === 3) {
    setTimeout(() => {
      sfx('sparkle')
      bubble('Tas siap!', 604, 300)
      hearts(610, 300)
      award(el)
      pageDone()
    }, 250)
  }
}

function checkRide() {
  if (flags.engine && flags.horn && !flags.rode) {
    flags.rode = true
    setTimeout(() => {
      sfx('drive')
      bubble('Hati-hati, ya!', 620, 90)
      confettiBurst(0.5, 0.5, 40)
      pageDone()
    }, 400)
  }
}

function checkMorning() {
  if (flags.morning1 && flags.morning2) pageDone()
}

function boardNumber() {
  const txt = sceneEl()?.querySelector('text[fill="#FFE88A"]')
  if (txt) {
    txt.textContent = '06'
    txt.classList.add('flip-num')
  }
}

function countChair(el: ActTarget) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  flags.chairs += 1
  const n = flags.chairs
  el.classList.add('done')
  sfx(`ding${Math.min(n, 3)}`)
  const p = stagePos(el)
  countBubble(n, p.x, p.y)
  sparkFrom(el)
  if (n === 3) {
    setTimeout(() => {
      bubble('Satu, dua, tiga!', 500, 120)
      confettiBurst(0.6, 0.35, 40)
      award(el)
      pageDone()
    }, 500)
  }
}

function countVax(el: ActTarget, n: number) {
  if (el.dataset.done) return
  if (flags.vax + 1 !== n) {
    el.classList.add('shake')
    setTimeout(() => el.classList.remove('shake'), 400)
    sfx('wrong')
    return
  }
  flags.vax = n
  el.dataset.done = '1'
  el.classList.add('pressed')
  sfx(`ding${n}`)
  if (n === 3) {
    setTimeout(() => {
      el.classList.add('done')
      const pl = document.getElementById('plaster')
      if (pl) {
        pl.setAttribute('opacity', '1')
        pl.classList.add('sticker-pop')
      }
      sfx('cuss')
      spark(340, 350)
      bubble('Cuss! Sudah, ya!', 430, 130)
      hearts(340, 280)
      confettiBurst(0.4, 0.5, 40)
      award(el)
      pageDone()
    }, 420)
  } else {
    bubble(n === 1 ? 'Satu…' : 'Dua…', 560 + n * 40, 250)
  }
}

function nightStar(el: ActTarget) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.style.opacity = '.12'
  el.style.pointerEvents = 'none'
  flags.night += 1
  const sc = sceneEl()
  if (sc) {
    sc.classList.remove('dim-0', 'dim-1', 'dim-2')
    sc.classList.add('dim-' + flags.night)
  }
  sfx('twinkle')
  if (flags.night === 3) {
    setTimeout(() => {
      sfx('lamp')
      bubble('Selamat malam, Kaluna…', 470, 140, { tiny: true })
      confettiBurst(0.5, 0.5, 26, ['#FFF3C9', '#FFE08A', '#F2C14E'])
      award(el)
      pageDone()
    }, 500)
  }
}

function openBenefit(el: ActTarget, i: number) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  el.classList.add('open')
  sfx('sparkle')
  sparkFrom(el)
  setCaption(benefits[i].text)
  speak(benefits[i].text)
  flags.benefits += 1
  if (flags.benefits === 4) {
    setTimeout(() => {
      confettiBurst(0.5, 0.45, 120)
      award(el)
      pageDone()
    }, 500)
  }
}

function beatHeart() {
  const h = sceneEl()?.querySelector<SVGGElement>('#heartBeat')
  if (!h) return
  h.setAttribute('opacity', '1')
  h.classList.remove('beat')
  void h.getBoundingClientRect()
  h.classList.add('beat')
  window.setTimeout(() => h.setAttribute('opacity', '0'), 1500)
}

/* ---------- cerita ---------- */
export const vaksin: Story = {
  id: 'vaksin',
  title: 'Kaluna Berani Vaksin',
  short: 'Kaluna Vaksin',
  pages: [
    /* ---------------- 0. SAMPUL ---------------- */
    {
      t: 'Sampul',
      n: 'Kaluna Berani Vaksin. Cerita tentang keberanian kecil.',
      band: false,
      art: () => `${scene(`
        <rect width="960" height="540" fill="#FFEFD5"/>
        <rect x="150" y="260" width="500" height="240" fill="#FFE2BB" opacity=".8"/>
        <rect x="190" y="220" width="420" height="40" fill="#FFE2BB" opacity=".8"/>
        <rect x="240" y="188" width="320" height="32" fill="#FFE2BB" opacity=".8"/>
        <rect x="300" y="170" width="200" height="18" fill="#FFE2BB" opacity=".8"/>
        <rect x="186" y="266" width="428" height="234" fill="#FFF4DF" opacity=".65"/>
        <rect x="226" y="226" width="348" height="40" fill="#FFF4DF" opacity=".65"/>
        <rect x="276" y="196" width="248" height="30" fill="#FFF4DF" opacity=".65"/>
        <rect x="330" y="180" width="140" height="16" fill="#FFF4DF" opacity=".65"/>
        ${starField(120, 60, 720, 220, 10)}
        ${star5(120, 120, 16, '#F2C14E', 'opacity=".8"')}
        ${star5(842, 92, 12, '#E76489', 'opacity=".7"')}
        ${spark4(760, 330, 14, '#F2C14E', 0.9)}
        ${spark4(210, 360, 10, '#2E8C8C', 0.7)}
        <ellipse cx="520" cy="512" rx="430" ry="52" fill="#FFDDB4" opacity=".85"/>
        ${booksStack(188, 500, 1.05)}
        ${rehalBook(348, 502, 0.92)}
        ${MAM({}, 530, 512, 1.02, 'bob')}
        ${AD('mama', { mood: 'laugh' }, 712, 512, 1.06, 'bob')}
        ${KAL({ mood: 'laugh', hijab: '#F08AAE' }, 726, 412, 0.64, 'bob')}
        ${AD('papa', { mood: 'laugh' }, 872, 512, 1.02, 'bob')}
        ${lantern(70, 470, 0.7)}
      `)}
      <div class="cover-title ov">
        <span class="kick">Cerita 1 · Kaluna</span>
        <h2>Kaluna<br /><em>Berani Vaksin</em></h2>
        <p>Cerita tentang keberanian kecil</p>
      </div>
      ${SB('start', 62, 340, 300, 84, `<span class="startbtn-in"><svg><use href="#i-play"/></svg> Mulai membaca</span>`, 'startbtn')}`,
      acts: {
        start() {
          sfx('open')
          go(1)
        },
      },
    },
    /* ---------------- 1. PAGI ---------------- */
    {
      t: 'Pagi yang Cerah',
      n: 'Matahari bangun. Kaluna juga bangun! Hari ini Kaluna pergi ke klinik untuk vaksin.',
      hint: 'Ketuk tirai untuk membuka pagi',
      art: () =>
        scene(
          `
        ${roomBg({ wall: '#FFE3C6', floor: '#F2C795', fy: 414 })}
        ${windowArch(596, 76, 252, 292, { sun: true, bird: true, curtain: true, sky: '#CBEDEF' })}
        ${frameArt(90, 118, 118, 96, '#A9C74E', 'star')}
        ${frameArt(238, 158, 78, 64, '#F2C14E', 'heart')}
        <rect x="150" y="238" width="360" height="80" rx="28" fill="#C9945F"/>
        <rect x="164" y="250" width="332" height="56" rx="22" fill="#D9A97A"/>
        <rect x="136" y="300" width="388" height="86" fill="#FFF6E4" stroke="#2B1B33" stroke-width="6"/>
        <rect x="136" y="378" width="388" height="34" fill="#E9C9A8" stroke="#2B1B33" stroke-width="6"/>
        <rect x="152" y="404" width="18" height="14" fill="#A9744A"/>
        <rect x="490" y="404" width="18" height="14" fill="#A9744A"/>
        ${KAL({ mood: 'laugh' }, 330, 398, 0.92, 'bob')}
        ${R(228, 334, 200, 60, '#F6A8BE', 'stroke="#2B1B33" stroke-width="6"')}
        ${R(228, 334, 200, 14, '#FFC6D6')}
        ${MAM({}, 480, 380, 0.52, 'bob')}
        ${plant(892, 414, 1.0)}
        ${HZ('sun', 612, 96, 222, 258, { label: 'Buka tirai' })}
      `,
          'ws-closed',
        ),
      acts: {
        sun(btn) {
          if (btn.dataset.done) return
          btn.dataset.done = '1'
          btn.classList.add('done')
          sceneEl()?.classList.add('ws-open')
          sfx('chime')
          sunSound()
          bubble('Selamat pagi, Kaluna!', 560, 84)
          hearts(330, 250)
          award(btn)
          pageDone()
        },
      },
    },
    /* ---------------- 2. SIAP-SIAP ---------------- */
    {
      t: 'Siap-Siap',
      n: 'Mama menyiapkan tas. Papa menyiapkan motor. Mamau ikut, ya!',
      hint: 'Ketuk tiga benda untuk masuk ke tas',
      art: () => scene(`
        ${roomBg({ wall: '#FFE0CC', floor: '#EFC39A', fy: 414 })}
        ${windowArch(58, 86, 196, 238, { cloud: true, sky: '#CFEDEF' })}
        ${frameArt(300, 104, 92, 76, '#2E8C8C', 'arch')}
        ${plant(64, 414, 0.9)}
        <rect x="0" y="356" width="960" height="58" fill="#E9B181"/>
        <rect x="270" y="318" width="282" height="12" rx="6" fill="#C9905B"/>
        <rect x="284" y="330" width="10" height="18" rx="4" fill="#A9744A"/><rect x="528" y="330" width="10" height="18" rx="4" fill="#A9744A"/>
        ${AD('mama', { mood: 'smile' }, 560, 414, 0.92, 'bob')}
        ${bagTote(660, 414, 1.28)}
        ${AD('papa', { mood: 'laugh' }, 830, 414, 0.9, 'bob')}
        ${KAL({ mood: 'smile' }, 160, 414, 0.78, 'bob')}
        ${MAM({}, 252, 414, 0.5, 'bob')}
        ${floorRug(470, 436, 560, 60, '#F8C9D6')}
        <g transform="translate(780 330) rotate(18)"><circle cx="0" cy="0" r="11" fill="none" stroke="#F2C14E" stroke-width="6"/><path d="M0 11v24M0 30h10M0 24h7" stroke="#F2C14E" stroke-width="6" stroke-linecap="round"/></g>
        ${SB('b1', 280, 218, 86, 100, `<span class="bagitem">${milkBottle}</span><span class="baglabel">Botol Susu</span>`, 'bagitembtn')}
        ${SB('b2', 356, 218, 86, 100, `<span class="bagitem">${bookPink}</span><span class="baglabel">Buku Pink</span>`, 'bagitembtn')}
        ${SB('b3', 432, 218, 86, 100, `<span class="bagitem">${mamaBottle}</span><span class="baglabel">Botol Minum Mama</span>`, 'bagitembtn')}
        ${HTMLX('<div class="counter" id="bagCount" style="left:650px;top:250px">Tas 0/3</div>')}
      `),
      acts: { b1: (el) => packItem(el), b2: (el) => packItem(el), b3: (el) => packItem(el) },
    },
    /* ---------------- 3. NAIK MOTOR ---------------- */
    {
      t: 'Naik Motor',
      n: 'Papa mengendarai motor ke klinik. Kaluna duduk aman dalam dekapan Mama. Brum, brum!',
      hint: 'Nyalakan motor, lalu tekan klakson',
      art: () => scene(`
        ${streetBg()}
        <g class="moto">${motoCut()}</g>
        ${HZ('key', 330, 236, 96, 96, { label: 'Nyalakan', icon: 'play', dot: [50, 50] })}
        ${HZ('horn', 390, 132, 84, 70, { label: '', dot: [70, 58] })}
      `),
      acts: {
        key(btn) {
          if (btn.dataset.done) return
          btn.dataset.done = '1'
          btn.classList.add('done')
          sceneEl()?.querySelector('.moto')?.classList.add('go')
          sfx('engine')
          bubble('Brmmm! Berangkat!', 300, 120)
          flags.engine = true
          award(btn)
          checkRide()
        },
        horn(btn) {
          if (btn.dataset.done) return
          btn.dataset.done = '1'
          btn.classList.add('done')
          sfx('honk')
          hornNotes(700, 244)
          bubble('Tin tin!', 560, 120)
          flags.horn = true
          award(btn)
          checkRide()
        },
      },
    },
    /* ---------------- 4. KLINIK ---------------- */
    {
      t: 'Sampai di Klinik',
      n: 'Sampai di Klinik Sehat Ceria! Ada pohon rindang dan bunga warna-warni. Kaluna sabar menunggu.',
      hint: 'Ketuk pintu klinik',
      art: () => scene(`
        ${clinicOutside()}
        ${AD('papa', { mood: 'smile' }, 168, 414, 0.7, 'bob')}
        ${AD('mama', { mood: 'smile' }, 248, 414, 0.76, 'bob')}
        ${KAL({ mood: 'wow', hijab: '#F08AAE' }, 260, 352, 0.45, 'bob')}
        ${MAM({}, 108, 414, 0.55, 'bob')}
        ${HZ('door', 436, 262, 92, 164, { label: 'Masuk', icon: 'door' })}
      `),
      acts: {
        door(btn) {
          if (btn.dataset.done) return
          btn.dataset.done = '1'
          btn.classList.add('done')
          sceneEl()?.classList.add('ws-open')
          sfx('door')
          spark(628, 300)
          bubble('Ayo masuk!', 548, 208)
          hearts(364, 330)
          award(btn)
          pageDone()
        },
      },
    },
    /* ---------------- 5. NOMOR ANTRIAN ---------------- */
    {
      t: 'Nomor Antrian',
      n: 'Papa mengambil nomor antrian. Nomor tujuh! Kaluna menunggu sambil memeluk Mamau.',
      hint: 'Ketuk mesin tiket',
      art: () => scene(`
        ${roomBg({ wall: '#E9F6EE', floor: '#CDE8DA', fy: 414, skirt: '#D8EFE3' })}
        ${numberBoard(710, 64, 160, 88, '05')}
        ${fishTank(470, 250, 170, 104)}
        <rect x="478" y="354" width="154" height="60" rx="10" fill="#E7C69F"/>
        <rect x="488" y="366" width="134" height="6" rx="3" fill="#D3AC7C"/>
        ${chair(72, 414, 1.05, '#F2C14E')}
        ${chair(180, 414, 1.05, '#E76489')}
        ${ticketMachine(860, 414, 1.5)}
        ${AD('papa', { mood: 'smile' }, 760, 414, 0.75, 'bob')}
        ${AD('mama', { mood: 'smile' }, 300, 414, 0.88, 'bob')}
        ${KAL({ mood: 'smile', hijab: '#F08AAE' }, 320, 330, 0.55, 'bob')}
        ${MAM({}, 240, 414, 0.55, 'bob')}
        ${floorRug(480, 436, 500, 56, '#BFE6E4')}
        ${HZ('ticket', 798, 180, 124, 234, { label: 'Ambil nomor' })}
      `),
      acts: {
        ticket(btn) {
          if (btn.dataset.done) return
          btn.dataset.done = '1'
          btn.classList.add('done')
          sfx('print')
          boardNumber()
          floatTicket('<b>07</b><span>ANTRIAN</span>', 798, 300)
          bubble('Nomor tujuh!', 520, 208)
          spark(828, 360)
          award(btn)
          pageDone()
        },
      },
    },
    /* ---------------- 6. MENUNGGU ---------------- */
    {
      t: 'Menunggu dengan Sabar',
      n: 'Sambil menunggu, Kaluna menghitung kursi. Satu, dua, tiga! Tak lama lagi giliran Kaluna.',
      hint: 'Ketuk tiap kursi untuk menghitung',
      art: () => scene(`
        ${roomBg({ wall: '#E9F6EE', floor: '#CDE8DA', fy: 414, skirt: '#D8EFE3' })}
        ${numberBoard(700, 88, 160, 92, '06')}
        ${fishTank(36, 168, 150, 94)}
        <rect x="0" y="380" width="960" height="34" fill="#E2F2E8"/>
        ${chair(430, 414, 1.12, '#F2C14E')}
        ${chair(630, 414, 1.12, '#E76489')}
        ${chair(830, 414, 1.12, '#2E8C8C')}
        ${AD('mama', { mood: 'smile' }, 250, 414, 0.92, 'bob')}
        ${KAL({ mood: 'smile', hijab: '#F08AAE' }, 270, 330, 0.58, 'bob')}
        ${MAM({}, 330, 414, 0.5, 'bob')}
        ${HZ('c1', 372, 296, 116, 110, { sm: true, label: 'Kursi satu' })}
        ${HZ('c2', 572, 296, 116, 110, { sm: true, label: 'Kursi dua' })}
        ${HZ('c3', 772, 296, 116, 110, { sm: true, label: 'Kursi tiga' })}
      `),
      acts: { c1: (el) => countChair(el), c2: (el) => countChair(el), c3: (el) => countChair(el) },
    },
    /* ---------------- 7. DIPANGGIL ---------------- */
    {
      t: 'Dipanggil Bu Dokter',
      n: '“Kaluna!” panggil Bu Dokter Hana. Kaluna tersenyum dan melambai. Mama menggendongnya masuk.',
      hint: 'Ketuk pintu ruang periksa',
      art: () => scene(`
        ${roomBg({ wall: '#FFF0E0', floor: '#F4D4B4', fy: 414, skirt: '#FFE4CB' })}
        ${plant(60, 414, 1.0)}
        <rect x="548" y="150" width="160" height="42" rx="12" fill="#FFF6E4"/>
        <text x="628" y="177" text-anchor="middle" font-family="Nunito,Arial" font-weight="800" font-size="15" letter-spacing="1.4" fill="#2E8C8C">RUANG PERIKSA</text>
        ${doorProp(568, 214, 120, 200)}
        ${AD('dokter', { mood: 'laugh' }, 782, 414, 0.92, 'bob')}
        ${AD('mama', { mood: 'smile' }, 330, 414, 0.94, 'bob')}
        ${KAL({ mood: 'wow', hijab: '#F08AAE' }, 348, 328, 0.58, 'bob')}
        ${AD('papa', { mood: 'smile' }, 206, 414, 0.9, 'bob')}
        ${MAM({}, 440, 414, 0.52, 'bob')}
        ${HZ('door', 566, 230, 124, 184, { label: 'Buka pintu', icon: 'door' })}
      `),
      acts: {
        door(btn) {
          if (btn.dataset.done) return
          btn.dataset.done = '1'
          btn.classList.add('done')
          sceneEl()?.classList.add('ws-open')
          sfx('door')
          spark(628, 300)
          bubble('Silakan masuk, Kaluna!', 604, 152)
          award(btn)
          pageDone()
        },
      },
    },
    /* ---------------- 8. DIPERIKSA ---------------- */
    {
      t: 'Diperiksa',
      n: 'Bu Dokter mendengarkan dada Kaluna. Tuk… tuk… Jantung Kaluna sehat dan kuat!',
      hint: 'Ketuk stetoskop',
      art: () => scene(`
        ${roomBg({ wall: '#FFF0DC', floor: '#F6D5B4', fy: 414 })}
        ${windowArch(96, 70, 214, 240, { cloud: true, sky: '#CFEDEF' })}
        <rect x="644" y="248" width="264" height="166" rx="14" fill="#EAF4EF"/>
        <rect x="656" y="260" width="240" height="54" rx="10" fill="#CFE6DB"/>
        <path d="M690 300h34M690 318h34M822 300h34M822 318h34" stroke="#A9CFC0" stroke-width="5" stroke-linecap="round"/>
        <rect x="644" y="346" width="264" height="10" rx="5" fill="#D7E9DF"/>
        ${plant(920, 414, 0.75)}
        ${AD('mama', { mood: 'smile' }, 300, 414, 0.98, 'bob')}
        ${KAL({ mood: 'smile', hijab: '#F08AAE' }, 320, 332, 0.62, 'bob')}
        <path d="M472 302 Q430 344 396 334" stroke="#4C6A7A" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="394" cy="334" r="9" fill="#B9CBD3"/><circle cx="394" cy="334" r="4.5" fill="#7E99A6"/>
        ${AD('dokter', { mood: 'smile' }, 490, 414, 0.98, 'bob')}
        ${AD('papa', { mood: 'smile' }, 790, 414, 0.92, 'bob')}
        ${MAM({}, 210, 414, 0.54, 'bob')}
        <g id="heartBeat" opacity="0">${heartIcon(404, 268, 26, '#E76489')}</g>
        ${HZ('stetho', 330, 272, 120, 104, { label: 'Dengar jantung', icon: 'heart' })}
      `),
      acts: {
        stetho(btn) {
          btn.dataset.n = String(Number(btn.dataset.n ?? '0') + 1)
          sfx('heart')
          beatHeart()
          bubble('Tuk… tuk…', 400, 190)
          if (Number(btn.dataset.n) >= 2 && !btn.dataset.done) {
            btn.dataset.done = '1'
            btn.classList.add('done')
            bubble('Jantungnya kuat!', 540, 130)
            award(btn)
            pageDone()
          }
        },
      },
    },
    /* ---------------- 9. SUNTIK ---------------- */
    {
      t: 'Suntiknya Sebentar',
      n: 'Suntiknya hanya sebentar, seperti gigitan semut kecil. Kaluna memeluk Mamau dan menghitung: satu… dua… tiga!',
      hint: 'Ketuk angka 1, 2, 3',
      art: () => scene(`
        ${roomBg({ wall: '#FFF0DC', floor: '#F6D5B4', fy: 414 })}
        ${poster(96, 110, 92, 92, '#BFE6E4', 'cross')}
        ${poster(220, 152, 70, 70, '#F7BFD0', 'heart')}
        ${AD('mama', { mood: 'smile' }, 320, 414, 0.96, 'bob')}
        ${KAL({ mood: 'brave', hijab: '#F08AAE' }, 340, 334, 0.62, 'bob')}
        ${MAM({}, 250, 414, 0.58, 'bob')}
        ${AD('dokter', { mood: 'smile' }, 610, 414, 0.94, 'bob')}
        ${plant(906, 414, 0.8, '#C96A4A')}
        <g transform="translate(700 384) scale(.75)">${vaxTray}</g>
        <g id="plaster" opacity="0">${plasterSVG(312, 291)}</g>
        ${SB('n1', 752, 58, 92, 92, '1', 'num')}
        ${SB('n2', 752, 156, 92, 92, '2', 'num')}
        ${SB('n3', 752, 254, 92, 92, '3', 'num')}
      `),
      acts: { n1: (el) => countVax(el, 1), n2: (el) => countVax(el, 2), n3: (el) => countVax(el, 3) },
    },
    /* ---------------- 10. STIKER ---------------- */
    {
      t: 'Hore, Selesai!',
      n: 'Hore, selesai! Bu Dokter memberi stiker bintang. Kaluna hebat, Kaluna berani!',
      hint: 'Ketuk stiker bintang',
      art: () => scene(`
        ${roomBg({ wall: '#FFF0DC', floor: '#F6D5B4', fy: 414 })}
        ${bunting(120, 840, 46, 40)}
        ${floorRug(480, 436, 560, 66, '#F7BFD0')}
        ${AD('mama', { mood: 'laugh' }, 360, 414, 0.96, 'bob')}
        ${KAL({ mood: 'laugh', hijab: '#F08AAE' }, 380, 332, 0.62, 'bob')}
        ${AD('papa', { mood: 'laugh' }, 210, 414, 0.92, 'bob')}
        ${MAM({}, 456, 414, 0.56, 'bob')}
        ${AD('dokter', { mood: 'laugh' }, 690, 414, 0.96, 'bob')}
        <g id="bigStar" class="bob">${star5(560, 218, 56, '#F2C14E')}${star5(560, 218, 40, '#FFE08A')}<circle cx="546" cy="214" r="6" fill="#3E2A20"/><circle cx="574" cy="214" r="6" fill="#3E2A20"/><path d="M548 232q12 10 24 0" stroke="#A93A58" stroke-width="4" fill="none" stroke-linecap="round"/></g>
        ${HZ('sticker', 494, 152, 134, 134, { label: 'Ambil stiker', icon: 'star' })}
      `),
      acts: {
        sticker(btn) {
          if (btn.dataset.done) return
          btn.dataset.done = '1'
          btn.classList.add('done')
          const s = sceneEl()?.querySelector<SVGGElement>('#bigStar')
          if (s) s.style.opacity = '0'
          sfx('sparkle')
          confettiBurst(0.5, 0.4, 90)
          bubble('Stiker bintang!', 592, 150)
          hearts(380, 300)
          award(btn)
          pageDone()
        },
      },
    },
    /* ---------------- 11. ISTIRAHAT ---------------- */
    {
      t: 'Istirahat',
      n: 'Di rumah, Kaluna beristirahat. Selimut hangat, Mamau di samping. Zzz…',
      hint: 'Ketuk tiga bintang untuk mematikan lampu',
      art: () =>
        scene(
          `
        ${roomBg({ wall: '#3B3768', floor: '#322E5C', fy: 414 })}
        ${windowArch(596, 56, 280, 316, { moon: true, stars: true, sky: '#252348', frame: '#FFE6B8' })}
        ${starField(640, 90, 210, 150, 8)}
        ${floorRug(420, 436, 520, 70, '#4B4680')}
        ${bedProp(280, 414, 1.24)}
        ${KAL({ mood: 'sleep' }, 282, 356, 0.76, 'brth')}
        ${R(236, 330, 168, 58, '#F6A8BE', 'stroke="#2B1B33" stroke-width="6"')}
        ${R(236, 330, 168, 13, '#FFC6D6')}
        ${MAM({}, 404, 344, 0.48, 'bob')}
        ${lamp(524, 414, 0.85)}
        ${plant(906, 414, 0.85, '#7A5A8E')}
        ${SB('s1', 636, 130, 60, 60, `<svg viewBox="0 0 60 60" style="width:100%;height:100%">${star5(30, 30, 20, '#FFE7A0')}</svg>`, 'star-hit')}
        ${SB('s2', 724, 84, 60, 60, `<svg viewBox="0 0 60 60" style="width:100%;height:100%">${star5(30, 30, 20, '#FFE7A0')}</svg>`, 'star-hit')}
        ${SB('s3', 810, 140, 60, 60, `<svg viewBox="0 0 60 60" style="width:100%;height:100%">${star5(30, 30, 20, '#FFE7A0')}</svg>`, 'star-hit')}
        <defs><radialGradient id="dimG" cx="76%" cy="34%" r="46%"><stop offset="0" stop-color="#1B1840" stop-opacity=".12"/><stop offset="1" stop-color="#1B1840" stop-opacity=".78"/></radialGradient></defs>
        <rect class="dimlayer" x="0" y="0" width="960" height="540" fill="url(#dimG)" opacity="0"/>
      `,
          'dim-0',
        ),
      acts: { s1: (el) => nightStar(el), s2: (el) => nightStar(el), s3: (el) => nightStar(el) },
    },
    /* ---------------- 12. BANGUN SEGAR ---------------- */
    {
      t: 'Bangun Segar',
      n: 'Pagi berikutnya, Kaluna bangun segar! Badannya kuat, senyumnya lebar.',
      hint: 'Ketuk Kaluna dan Mamau',
      art: () => scene(`
        ${roomBg({ wall: '#FFE9CB', floor: '#F3C995', fy: 414 })}
        ${windowArch(600, 60, 280, 292, { sun: true, bird: true, sky: '#CBEDEF' })}
        ${bunting(80, 400, 50, 34)}
        ${floorRug(540, 436, 600, 70, '#D8EDD4')}
        ${bedProp(258, 414, 0.92)}
        ${AD('mama', { mood: 'laugh' }, 748, 414, 0.92, 'bob')}
        ${AD('papa', { mood: 'laugh' }, 866, 414, 0.84, 'bob')}
        ${KAL({ mood: 'laugh' }, 424, 414, 0.86, 'bob')}
        ${MAM({}, 524, 414, 0.6, 'bob')}
        ${HZ('kal', 348, 168, 150, 246, { label: 'Ketuk Kaluna', dot: [92, 12] })}
        ${HZ('mam', 472, 250, 116, 164, { label: 'Ketuk Mamau', dot: [92, 12] })}
      `),
      acts: {
        kal(btn) {
          if (btn.dataset.done) return
          btn.dataset.done = '1'
          btn.classList.add('done')
          sfx('giggle')
          hearts(420, 240)
          bubble('Aku kuat!', 448, 150)
          flags.morning1 = true
          award(btn)
          checkMorning()
        },
        mam(btn) {
          if (btn.dataset.done) return
          btn.dataset.done = '1'
          btn.classList.add('done')
          sfx('roar')
          bubble('Grrr!', 540, 268)
          spark(520, 320)
          flags.morning2 = true
          award(btn)
          checkMorning()
        },
      },
    },
    /* ---------------- 13. MANFAAT ---------------- */
    {
      t: 'Manfaat Vaksin',
      n: 'Kenapa kita divaksin? Ketuk setiap lambang untuk tahu jawabannya!',
      hint: 'Ketuk keempat lambang',
      art: () => `${scene(`
        <rect width="960" height="540" fill="#FFF3DF"/>
        <path d="M0 392V250a232 232 0 0 1 464 0v142z" fill="#FFE4BC" opacity=".65"/>
        ${starField(30, 30, 900, 340, 10)}
        ${floorRug(900, 436, 320, 90, '#E9F4DA')}
        ${KAL({ mood: 'laugh' }, 230, 414, 1.0, 'bob')}
        ${MAM({}, 330, 414, 0.66, 'bob')}
        <g opacity=".16">${star5(230, 250, 120, '#F2C14E')}</g>
        ${benefits
          .map((_b, i) => {
            const x = 520 + (i % 2) * 200
            const y = 70 + Math.floor(i / 2) * 178
            return `<g opacity=".5">${star5(x + 80, y + 80, 78, '#FFF9EC')}</g>`
          })
          .join('')}
      `)}
      ${benefits
        .map((b, i) => {
          const x = 520 + (i % 2) * 200
          const y = 70 + Math.floor(i / 2) * 178
          return SB(
            b.act,
            x,
            y,
            160,
            160,
            `<span class="benefit"><svg><use href="#i-${b.icon}"/></svg><b>${b.title}</b></span>`,
            'benefitbtn b' + (i + 1),
          )
        })
        .join('')}`,
      acts: {
        b1: (el) => openBenefit(el, 0),
        b2: (el) => openBenefit(el, 1),
        b3: (el) => openBenefit(el, 2),
        b4: (el) => openBenefit(el, 3),
      },
    },
    /* ---------------- 14. TAMAT ---------------- */
    {
      t: 'Tamat',
      n: 'Tamat. Kaluna berani, kamu juga berani! Sampai jumpa di cerita berikutnya.',
      lastPage: true,
      art: () => `${scene(`
        <rect width="960" height="540" fill="#FFF1D8"/>
        <path d="M90 500V270a220 220 0 0 1 440 0v230z" fill="#FFE2BB" opacity=".55"/>
        ${bunting(60, 900, 38, 48)}
        ${starField(60, 90, 840, 220, 12)}
        <ellipse cx="480" cy="516" rx="440" ry="48" fill="#FFDDB4" opacity=".8"/>
        ${AD('papa', { mood: 'laugh' }, 120, 414, 0.62, 'bob')}
        ${AD('mama', { mood: 'laugh' }, 236, 414, 0.64, 'bob')}
        ${AD('nenda', { mood: 'laugh' }, 350, 414, 0.62, 'bob')}
        ${AD('ayahchiek', { mood: 'laugh' }, 460, 414, 0.62, 'bob')}
        ${KAL({ mood: 'laugh' }, 500, 400, 0.52, 'bob')}
        ${AD('oma', { mood: 'laugh' }, 600, 414, 0.62, 'bob')}
        ${AD('opa', { mood: 'laugh' }, 706, 414, 0.62, 'bob')}
        ${AD('dokter', { mood: 'laugh' }, 820, 414, 0.62, 'bob')}
        ${MAM({}, 570, 414, 0.4, 'bob')}
        ${star5(900, 120, 26, '#F2C14E', 'opacity=".85"')}
        ${star5(120, 150, 18, '#E76489', 'opacity=".7"')}
      `)}
      <div class="end-title ov"><span>Tamat</span><small>Kaluna berani, kamu juga berani!</small></div>`,
      acts: {},
    },
  ],
}
