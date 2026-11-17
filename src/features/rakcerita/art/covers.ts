/**
 * Shelf cover art. Two shapes only: the finished story cover (the family on a
 * pink arch) and the "coming soon" template, which swaps a background, an
 * icon and one character.
 */

import { CAST, flower, put, star5 } from './core'
import { moonShape, starField } from './scenes'

export function coverMain() {
  return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
    <rect width="400" height="500" fill="#F8C4D2"/>
    <rect x="46" y="236" width="308" height="152" fill="#FFF0F4"/>
    <rect x="70" y="204" width="260" height="40" fill="#FFF0F4"/>
    <rect x="94" y="180" width="212" height="32" fill="#FFF0F4"/>
    <rect x="118" y="164" width="164" height="24" fill="#FFF0F4"/>
    ${starField(30, 30, 340, 190, 9)}
    ${star5(332, 84, 22, '#F2C14E')}
    ${star5(66, 124, 13, '#E76489', 'opacity=".7"')}
    ${put(CAST.mamau.draw(), 84, 358, 0.58, 'bob', 170, 170)}
    ${put(CAST.mama.draw({ mood: 'laugh' }), 220, 358, 0.64, 'bob', 360, 200)}
    ${put(CAST.kaluna.draw({ mood: 'laugh', hijab: '#F08AAE' }), 230, 310, 0.4, 'bob', 260, 200)}
    ${put(CAST.papa.draw({ mood: 'laugh' }), 336, 358, 0.6, 'bob', 360, 200)}
    <ellipse cx="204" cy="362" rx="166" ry="10" fill="#C7496C" opacity=".14"/>
  </svg>`
}

type SoonKind = 'kebun' | 'gigi' | 'bintang' | 'piknik' | 'hujan' | 'rakbuku'

interface SoonLook {
  bg: string
  arch: string
  c: string
  char: string
  mood: 'smile' | 'laugh'
  icon: string
}

const SOON: Record<SoonKind, SoonLook> = {
  kebun: {
    bg: '#E2F1D6',
    arch: '#F5FBF0',
    c: '#638742',
    char: 'nenda',
    mood: 'laugh',
    icon: `${flower(96, 286, 1.5, '#F27D9D')}${flower(310, 300, 1.35, '#F2C14E', '#E08A3C')}<g transform="translate(300 150)"><ellipse cx="-13" cy="-8" rx="15" ry="11" fill="#E76489"/><ellipse cx="13" cy="-8" rx="15" ry="11" fill="#F2C14E"/><ellipse cx="-11" cy="8" rx="11" ry="9" fill="#F2C14E"/><ellipse cx="11" cy="8" rx="11" ry="9" fill="#E76489"/><rect x="-3" y="-11" width="6" height="25" rx="3" fill="#3E2A20"/></g>`,
  },
  gigi: {
    bg: '#CFE6E0',
    arch: '#E4F5F0',
    c: '#2E8C8C',
    char: 'kaluna',
    mood: 'laugh',
    icon: `<g transform="translate(80 76) scale(.6)"><path d="M200 120c-34 0-58 22-58 54 0 40 14 54 14 78 0 16 8 26 20 26 10 0 16-8 18-20 2-14 6-20 16-20s14 6 16 20c2 12 8 20 18 20 12 0 20-10 20-26 0-24 14-38 14-78 0-32-24-54-58-54z" fill="#FFFDF4" stroke="#2B1B33" stroke-width="6"/><path d="M200 120c-10 0-18 2-26 6 12 10 18 26 18 48 0 24-6 38-6 60h14z" fill="#BFE6E4"/></g>`,
  },
  bintang: {
    bg: '#DCD9F2',
    arch: '#EDEBFA',
    c: '#5B4B9E',
    char: 'papa',
    mood: 'smile',
    icon: `${moonShape(292, 112, 50)}${star5(104, 92, 17, '#F2C14E')}${star5(324, 198, 11, '#FFF3C9')}`,
  },
  piknik: {
    bg: '#FFE4C6',
    arch: '#FFF1E0',
    c: '#E08A3C',
    char: 'oma',
    mood: 'laugh',
    icon: `<rect x="118" y="112" width="164" height="108" rx="26" fill="#D98A4E"/><path d="M118 160h164" stroke="#B5764A" stroke-width="10"/><path d="M160 112q40 46 80 0" fill="none" stroke="#B5764A" stroke-width="10"/><circle cx="200" cy="190" r="20" fill="#F2C14E"/>`,
  },
  hujan: {
    bg: '#D7E8F5',
    arch: '#EAF4FB',
    c: '#4A7FB5',
    char: 'ayahchiek',
    mood: 'smile',
    icon: `<path d="M120 180a58 58 0 0 1 112-18 40 40 0 0 1 44 40H120z" fill="#BFDDF2"/><path d="M150 215l-16 42M205 215l-16 42M260 215l-16 42" stroke="#7FB0D6" stroke-width="9" stroke-linecap="round"/><path d="M300 300l40-88 40 88z" fill="#FFD9A0"/>`,
  },
  rakbuku: {
    bg: '#E9DCC2',
    arch: '#F8F0E0',
    c: '#B4783A',
    char: 'kaluna',
    mood: 'laugh',
    icon: `<g>
      <rect x="100" y="108" width="200" height="80" fill="#B4783A" stroke="#2B1B33" stroke-width="6"/>
      <rect x="110" y="118" width="180" height="60" fill="#5E3B2A"/>
      <rect x="116" y="158" width="168" height="8" fill="#B4783A"/>
      <rect x="122" y="130" width="16" height="28" fill="#F05A8A"/><rect x="142" y="122" width="14" height="36" fill="#FFC93C"/>
      <rect x="160" y="132" width="18" height="26" fill="#2E9E9A"/><rect x="182" y="124" width="12" height="34" fill="#8CC63F"/>
      <rect x="198" y="134" width="16" height="24" fill="#F28A3C"/><rect x="218" y="128" width="14" height="30" fill="#8E7BD6"/>
      <rect x="122" y="168" width="14" height="10" fill="#E05252"/><rect x="140" y="166" width="16" height="12" fill="#5AA9E6"/>
      <rect x="160" y="168" width="12" height="10" fill="#FFC93C"/>
      <rect x="238" y="120" width="30" height="36" fill="#FFE9B8" stroke="#2B1B33" stroke-width="4"/>
    </g>`,
  },
}

export function coverSoon(kind: SoonKind) {
  const m = SOON[kind]
  const char = CAST[m.char]
  const h = char.h
  const w = char.w
  return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
    <rect width="400" height="500" fill="${m.bg}"/>
    <rect x="40" y="236" width="320" height="150" fill="${m.arch}"/>
    <rect x="66" y="206" width="268" height="34" fill="${m.arch}"/>
    <rect x="92" y="182" width="216" height="28" fill="${m.arch}"/>
    <rect x="118" y="166" width="164" height="20" fill="${m.arch}"/>
    ${starField(40, 40, 320, 200, 6)}
    ${m.icon}
    ${put(char.draw({ mood: m.mood }), 200, 350, 0.6, 'bob', h, w)}
    <ellipse cx="200" cy="354" rx="150" ry="12" fill="${m.c}" opacity=".12"/>
  </svg>`
}
