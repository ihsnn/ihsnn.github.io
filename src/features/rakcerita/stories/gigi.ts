/**
 * Cerita 3 — Kaluna Rajin Sikat Gigi (7 halaman).
 *
 * The AIUEO song is the only page that borrows audio from outside: see
 * `song.ts`, which prefers the YouTube copy and falls back to the synth here.
 */

import {
  AD,
  bathBg,
  cupProp,
  foamGroup,
  HZ,
  HTMLX,
  KAL,
  noteShape,
  SB,
  scene,
  spark4,
  starField,
} from '../art'
import { R } from '../art/core'
import {
  award,
  bubble,
  confettiBurst,
  flags,
  go,
  hornNotes,
  openSong,
  pageDone,
  sfx,
  spark,
  sparkFrom,
  speak,
  tone,
  type ActTarget,
} from '../runtime'
import { VOWEL_FREQUENCIES, VOWELS, prewarmSong } from '../song'
import type { Story } from '../types'

function singVowel(el: ActTarget, i: number) {
  if (el.classList.contains('on')) return
  el.classList.add('on')
  if (!flags.sung.includes(VOWELS[i])) flags.sung.push(VOWELS[i])
  sfx('click')
  tone(VOWEL_FREQUENCIES[i], 0, 0.42, 'triangle', 0.18)
  tone(VOWEL_FREQUENCIES[i] * 2, 0, 0.24, 'sine', 0.05, 0.04)
  speak(VOWELS[i])
  sparkFrom(el)
  hornNotes(300 + flags.sung.length * 84, 170)
  if (flags.sung.length === 5) {
    setTimeout(() => {
      confettiBurst(0.5, 0.35, 80)
      sfx('chime')
      bubble('A I U E O!', 140, 190)
      award(el)
      pageDone()
    }, 450)
  }
}

export const gigi: Story = {
  id: 'gigi',
  title: 'Kaluna Rajin Sikat Gigi',
  short: 'Sikat Gigi',
  pages: [
    /* ---------------- 0. SAMPUL ---------------- */
    {
      t: 'Sampul',
      n: 'Kaluna Rajin Sikat Gigi. Sikat gigi sambil nyanyi AIUEO.',
      band: false,
      art: () => `${scene(`
        ${bathBg()}
        ${KAL({ mood: 'laugh', brush: true }, 520, 380, 0.95, 'bob')}
        ${AD('mama', { mood: 'laugh', brush: true, brushColor: '#F05A8A' }, 660, 414, 0.88, 'bob')}
        ${AD('papa', { mood: 'laugh', brush: true, brushColor: '#5B8DEF' }, 840, 414, 0.86, 'bob')}
        ${foamGroup(486, 248, 0.7)}
      `)}
      <div class="cover-title ov">
        <span class="kick">Cerita 3 · Kaluna</span>
        <h2 style="font-size:34px;line-height:1.3">Sikat Gigi<br /><em>Rajin!</em></h2>
        <p>Sikat gigi sambil nyanyi AIUEO</p>
      </div>
      ${SB('start', 62, 340, 300, 84, `<span class="startbtn-in"><svg><use href="#i-play"/></svg> Mulai membaca</span>`, 'startbtn')}`,
      acts: {
        start() {
          sfx('open')
          go(1)
        },
      },
    },
    /* ---------------- 1. MANAA GIGINYAAA ---------------- */
    {
      t: 'Manaa Giginyaaa?',
      n: 'Mama bertanya, "Manaa giginyaaa?" Kaluna selalu menunjuk giginya!',
      hint: 'Ketuk Kaluna',
      art: () => scene(`
        ${bathBg()}
        ${AD('mama', { mood: 'smile' }, 200, 414, 0.9, 'bob')}
        ${AD('papa', { mood: 'smile' }, 820, 414, 0.88, 'bob')}
        <g id="kalNormal">${KAL({ mood: 'smile' }, 500, 380, 0.95, 'bob')}</g>
        <g id="kalPoint" style="display:none">${KAL({ mood: 'laugh', point: true }, 500, 380, 0.95, 'bob')}</g>
        ${noteShape(160, 200, 0.55, '#8FD0C8')}
        ${HZ('kal', 400, 170, 220, 220, { dot: [50, 76] })}
      `),
      acts: {
        kal(el) {
          if (flags.point) return
          flags.point = true
          sfx('giggle')
          bubble('Manaa giginyaaa?', 30, 56)
          setTimeout(() => {
            const a = document.getElementById('kalNormal')
            const b = document.getElementById('kalPoint')
            if (a) a.style.display = 'none'
            if (b) b.style.display = ''
            bubble('Ini giginya!', 560, 80)
            spark(500, 300)
            award(el)
            pageDone()
          }, 900)
        },
      },
    },
    /* ---------------- 2. SIKAT GIGI PAGI ---------------- */
    {
      t: 'Sikat Gigi Pagi',
      n: 'Pagi hari, Kaluna sikat gigi bersama Mama dan Papa.',
      hint: 'Ketuk pasta gigi, lalu sikat Kaluna',
      art: () => scene(`
        ${bathBg()}
        ${AD('mama', { mood: 'smile', brush: true, brushColor: '#F05A8A' }, 560, 414, 0.86, 'bob')}
        ${AD('papa', { mood: 'smile', brush: true, brushColor: '#5B8DEF' }, 830, 414, 0.84, 'bob')}
        ${KAL({ mood: 'smile', brush: true }, 500, 380, 0.95, 'bob')}
        <g id="pasteTip" opacity="0">
          ${R(488, 242, 18, 12, '#8FD8C8', 'stroke="#2B1B33" stroke-width="3"')}
          ${R(492, 238, 8, 6, '#FFF4D6')}
        </g>
        <g id="foam" opacity="0">${foamGroup(500, 252, 0.95)}</g>
        ${HZ('paste', 560, 210, 90, 110, { label: 'Pasta gigi' })}
        ${HZ('brush', 380, 170, 230, 220)}
      `),
      acts: {
        paste(el) {
          if (flags.paste) return
          flags.paste = true
          el.classList.add('done')
          const t = document.getElementById('pasteTip')
          if (t) t.style.opacity = '1'
          sfx('pop')
          bubble('Pasta gigi!', 520, 180)
          spark(500, 250)
        },
        brush(el) {
          if (flags.brushed) return
          if (!flags.paste) {
            sfx('wrong')
            bubble('Pasta gigi dulu, ya!', 500, 180)
            return
          }
          flags.brushed = true
          el.classList.add('done')
          const f = document.getElementById('foam')
          if (f) f.style.opacity = '1'
          sfx('water')
          bubble('Sikat atas, sikat bawah!', 480, 160)
          award(el)
          pageDone()
        },
      },
    },
    /* ---------------- 3. NYANYI AIUEO ---------------- */
    {
      t: 'Nyanyi AIUEO',
      n: 'Sambil sikat gigi, mereka nyanyi lagu AIUEO. A, I, U, E, O!',
      hint: 'Ketuk A I U E O · Ketuk tulisan lagu untuk memutar suaranya',
      art: () => scene(`
        ${bathBg()}
        ${AD('mama', { mood: 'laugh', brush: true, brushColor: '#F05A8A' }, 560, 414, 0.86, 'bob')}
        ${AD('papa', { mood: 'laugh', brush: true, brushColor: '#5B8DEF' }, 830, 414, 0.84, 'bob')}
        ${KAL({ mood: 'laugh', brush: true }, 500, 380, 0.95, 'bob')}
        ${foamGroup(510, 250, 0.7)}
        ${SB('v-a', 110, 64, 100, 96, 'A', 'vowl')}
        ${SB('v-i', 270, 64, 100, 96, 'I', 'vowl')}
        ${SB('v-u', 430, 64, 100, 96, 'U', 'vowl')}
        ${SB('v-e', 590, 64, 100, 96, 'E', 'vowl')}
        ${SB('v-o', 750, 64, 100, 96, 'O', 'vowl')}
        ${HTMLX('<button class="song-credit song-credit--play" type="button" data-act="mengenal">♪ Mengenal Huruf AIUEO — BabyZu</button>')}
      `),
      setup: prewarmSong,
      acts: {
        mengenal: () => openSong(),
        'v-a': (el) => singVowel(el, 0),
        'v-i': (el) => singVowel(el, 1),
        'v-u': (el) => singVowel(el, 2),
        'v-e': (el) => singVowel(el, 3),
        'v-o': (el) => singVowel(el, 4),
      },
    },
    /* ---------------- 4. KUMUR ---------------- */
    {
      t: 'Kumur & Bersih',
      n: 'Kumur-kumur, lalu senyum. Gigi Kaluna bersih dan berkilau!',
      hint: 'Ketuk gelas kumur',
      art: () => scene(`
        ${bathBg()}
        ${AD('mama', { mood: 'smile' }, 250, 414, 0.88, 'bob')}
        ${AD('papa', { mood: 'smile' }, 820, 414, 0.86, 'bob')}
        ${KAL({ mood: 'laugh' }, 500, 380, 0.95, 'bob')}
        ${cupProp(560, 318, 1.1, '#F2C14E')}
        <g id="rinseFx" opacity="0">
          ${spark4(540, 268, 16, '#FFF3C9', 1)}${spark4(468, 248, 12, '#8FD8E8', 0.9)}
          <path d="M556 300q-28 -22 -46 -12" stroke="#8FD8E8" stroke-width="6" fill="none"/>
        </g>
        ${HZ('rinse', 520, 250, 110, 110)}
      `),
      acts: {
        rinse(el) {
          if (flags.rinse) return
          flags.rinse = true
          el.classList.add('done')
          const fx = document.getElementById('rinseFx')
          if (fx) fx.style.opacity = '1'
          sfx('water')
          bubble('Kumur... pfft!', 500, 170)
          setTimeout(() => {
            sfx('sparkle')
            spark(800, 170)
          }, 600)
          award(el)
          pageDone()
        },
      },
    },
    /* ---------------- 5. SIKAT GIGI MALAM ---------------- */
    {
      t: 'Sikat Gigi Malam',
      n: 'Malam hari, sikat gigi lagi bersama Mama dan Papa. A, I, U, E, O!',
      hint: 'Ketuk Kaluna untuk sikat gigi malam',
      art: () => scene(`
        ${bathBg({ night: true })}
        ${AD('mama', { mood: 'smile', brush: true, brushColor: '#F05A8A' }, 540, 414, 0.86, 'bob')}
        ${AD('papa', { mood: 'smile', brush: true, brushColor: '#5B8DEF' }, 830, 414, 0.84, 'bob')}
        ${KAL({ mood: 'smile', brush: true }, 500, 380, 0.95, 'bob')}
        <g id="nightFoam" opacity="0">${foamGroup(500, 252, 0.95)}</g>
        <g id="nightGlow" opacity="0">${spark4(780, 140, 18, '#FFF3C9', 1)}${spark4(560, 180, 12, '#FFF3C9', 0.8)}</g>
        ${HZ('nightbrush', 380, 170, 230, 220)}
      `),
      acts: {
        nightbrush(el) {
          if (flags.nbrush) return
          flags.nbrush = true
          el.classList.add('done')
          const f = document.getElementById('nightFoam')
          if (f) f.style.opacity = '1'
          const g = document.getElementById('nightGlow')
          if (g) g.style.opacity = '1'
          sfx('water')
          bubble('Sikat gigi malam, A I U E O!', 460, 140)
          award(el)
          pageDone()
        },
      },
    },
    /* ---------------- 6. TAMAT ---------------- */
    {
      t: 'Tamat',
      n: 'Tamat. Gigi bersih, hati senang. Sampai jumpa di cerita berikutnya!',
      lastPage: true,
      art: () => `${scene(`
        ${bathBg()}
        ${starField(60, 60, 840, 200, 10)}
        ${AD('mama', { mood: 'laugh', brush: true, brushColor: '#F05A8A' }, 300, 414, 0.78, 'bob')}
        ${AD('papa', { mood: 'laugh', brush: true, brushColor: '#5B8DEF' }, 800, 414, 0.76, 'bob')}
        ${KAL({ mood: 'laugh', brush: true }, 540, 380, 0.9, 'bob')}
        ${spark4(680, 220, 14, '#F05A8A', 0.9)}
      `)}
      <div class="end-title ov"><span>Tamat</span><small>Gigi bersih, hati senang!</small></div>`,
      acts: {},
    },
  ],
}
