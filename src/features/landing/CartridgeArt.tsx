import type { ReactNode } from 'react'

/**
 * The artwork printed on each cartridge label, keyed by project id.
 *
 * These are deliberately illustrations rather than screenshots: one 96 × 56
 * stage, flat shapes, a paper/ink palette with each project's own accent. That
 * keeps the shelf consistent, sharp at 3-up phone size, and asset-free.
 */

const PAPER = '#f4ead2'
const INK = '#0b1533'

function Art({ children }: { children: ReactNode }) {
  return (
    <svg
      className="cartridge__art-svg"
      viewBox="0 0 96 56"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

/** DMG console with a pixel heart on the screen. */
function GameBoyArt() {
  return (
    <Art>
      <g transform="rotate(-4 48 28)">
        <rect
          x="27"
          y="4"
          width="42"
          height="48"
          rx="4"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.2"
        />
        <rect x="32" y="9" width="32" height="21" rx="2" fill={INK} />
        <rect x="35" y="12" width="26" height="15" fill="#9cba88" />
        <path
          d="M45 16h2v2h2v2h-2v2h-2v-2h-2v-2h2z"
          fill={INK}
        />
        <rect x="33" y="35" width="10" height="3" fill={INK} />
        <rect x="36.5" y="31.5" width="3" height="10" fill={INK} />
        <circle cx="60" cy="34" r="2.6" fill="#8b2f4a" />
        <circle cx="57" cy="39" r="2.6" fill="#8b2f4a" />
        <rect x="58" y="48" width="2" height="1" fill={INK} />
        <rect x="61" y="48" width="2" height="1" fill={INK} />
        <rect x="64" y="48" width="2" height="1" fill={INK} />
        <rect x="42" y="44" width="3" height="1.4" rx="0.7" fill={INK} />
        <rect x="44" y="47" width="3" height="1.4" rx="0.7" fill={INK} />
      </g>
    </Art>
  )
}

/** A TCG card inside a scan frame, with the reader beam across it. */
function PokeScanArt() {
  return (
    <Art>
      <g transform="rotate(-7 48 28)">
        <rect
          x="31"
          y="5"
          width="34"
          height="46"
          rx="2.5"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.2"
        />
        <rect x="34" y="8" width="28" height="12" rx="1" fill="#e3350d" />
        <circle cx="48" cy="14" r="4.2" fill={PAPER} stroke={INK} strokeWidth="1" />
        <rect x="43.8" y="13.4" width="8.4" height="1.2" fill={INK} />
        <circle cx="48" cy="14" r="1.4" fill={PAPER} stroke={INK} strokeWidth="1" />
        <rect x="34" y="24" width="24" height="2.2" rx="1" fill={INK} />
        <rect x="34" y="28.5" width="18" height="2.2" rx="1" fill={INK} />
        <rect x="34" y="33" width="21" height="2.2" rx="1" fill={INK} />
        <rect x="34" y="40" width="28" height="2" fill="#ffcb05" />
        <rect x="34" y="44" width="19" height="2" fill="#ffcb05" />
      </g>

      <path
        d="M20 16v-6h6 M70 10h6v6 M20 40v6h6 M76 40v6h-6"
        fill="none"
        stroke="#ffcb05"
        strokeWidth="2"
      />
      <rect x="18" y="29" width="60" height="1.5" fill="#ffcb05" opacity="0.85" />
      <path d="M79 19l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill={PAPER} />
    </Art>
  )
}

/** Brick wall, ball and paddle from the neon cabinet. */
function ArcadeArt() {
  return (
    <Art>
      <g>
        <rect x="16" y="8" width="14" height="5" rx="1" fill="#ff5c9a" />
        <rect x="32" y="8" width="14" height="5" rx="1" fill={PAPER} />
        <rect x="48" y="8" width="14" height="5" rx="1" fill="#ff5c9a" />
        <rect x="64" y="8" width="14" height="5" rx="1" fill={PAPER} />
        <rect x="20" y="15" width="14" height="5" rx="1" fill={PAPER} />
        <rect x="36" y="15" width="14" height="5" rx="1" fill="#ff5c9a" />
        <rect x="52" y="15" width="14" height="5" rx="1" fill={PAPER} />
        <rect x="68" y="15" width="14" height="5" rx="1" fill="#ff5c9a" />
        <rect x="16" y="22" width="14" height="5" rx="1" fill="#ff5c9a" />
        <rect x="32" y="22" width="14" height="5" rx="1" fill={PAPER} />
        <rect x="48" y="22" width="14" height="5" rx="1" fill="#ff5c9a" />
        <rect x="64" y="22" width="14" height="5" rx="1" fill={PAPER} />
      </g>

      <rect x="56" y="34" width="3" height="2" fill={PAPER} opacity="0.35" />
      <rect x="61" y="36" width="3" height="2" fill={PAPER} opacity="0.55" />
      <circle cx="68" cy="38" r="2.4" fill={PAPER} />

      <rect x="33" y="47" width="30" height="3.4" rx="1.7" fill="#5ee6c8" />
      <rect x="33" y="47" width="30" height="1.2" rx="0.6" fill={PAPER} opacity="0.75" />

      <rect x="14" y="33" width="1.6" height="1.6" fill={PAPER} opacity="0.5" />
      <rect x="80" y="28" width="1.6" height="1.6" fill={PAPER} opacity="0.5" />
    </Art>
  )
}

/** A little house, a heart and the family outside it. */
function KeluargaArt() {
  return (
    <Art>
      <rect x="12" y="50" width="72" height="2" fill={PAPER} opacity="0.3" />

      <rect x="30" y="24" width="36" height="26" fill={PAPER} />
      <path
        d="M24 26L48 8l24 18z"
        fill="#c9a227"
        stroke={INK}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <rect x="44" y="35" width="8" height="15" fill={INK} />
      <rect x="35" y="29" width="7" height="7" fill={INK} />
      <rect x="54" y="29" width="7" height="7" fill={INK} />
      <rect x="38" y="29" width="1" height="7" fill={PAPER} />
      <rect x="35" y="32.5" width="7" height="1" fill={PAPER} />
      <rect x="57" y="29" width="1" height="7" fill={PAPER} />
      <rect x="54" y="32.5" width="7" height="1" fill={PAPER} />

      <path
        d="M18 12c-1.4-2.2-4.4-.8-4.4 1.3 0 1.6 2.2 3 4.4 4.4 2.2-1.4 4.4-2.8 4.4-4.4 0-2.1-3-3.5-4.4-1.3z"
        fill="#e88a9a"
      />

      <circle cx="20" cy="41" r="3" fill={PAPER} />
      <rect x="17" y="44" width="6" height="7" rx="1" fill={PAPER} />
      <circle cx="76" cy="42" r="2.6" fill={PAPER} />
      <rect x="73.6" y="45" width="4.8" height="6" rx="1" fill={PAPER} />
    </Art>
  )
}

/** Three picture-book spines and a star. */
function RakCeritaArt() {
  return (
    <Art>
      <rect x="16" y="50" width="64" height="2" fill={PAPER} opacity="0.35" />

      <rect
        x="23"
        y="22"
        width="12"
        height="28"
        rx="1"
        fill="#2e8c8c"
        stroke={INK}
        strokeWidth="1.2"
      />
      <rect
        x="37"
        y="14"
        width="13"
        height="36"
        rx="1"
        fill="#ffe9b8"
        stroke={INK}
        strokeWidth="1.2"
      />
      <rect
        x="52"
        y="25"
        width="11"
        height="25"
        rx="1"
        fill="#c9a227"
        stroke={INK}
        strokeWidth="1.2"
      />

      <rect x="40" y="19" width="7" height="1.4" fill={INK} />
      <rect x="40" y="23" width="7" height="1.4" fill={INK} />
      <rect x="40" y="27" width="5" height="1.4" fill={INK} />
      <rect x="26" y="26" width="6" height="1.2" fill={PAPER} opacity="0.7" />
      <rect x="55" y="29" width="5" height="1.2" fill="#2e8c8c" />

      <path
        d="M48 2l1.7 3.8 4.1.4-3.1 2.8.9 4-3.6-2.1-3.6 2.1.9-4-3.1-2.8 4.1-.4z"
        fill="#ffe9b8"
      />
    </Art>
  )
}

/** A tilted photo strip with three frames, plus the booth curtain. */
function PhotoboothArt() {
  return (
    <Art>
      <rect x="16" y="7" width="3" height="40" fill="#ff5cb8" opacity="0.45" />
      <rect x="21" y="7" width="2" height="40" fill="#ff5cb8" opacity="0.3" />

      <g transform="rotate(5 48 28)">
        <rect
          x="35"
          y="3"
          width="26"
          height="50"
          rx="1.5"
          fill="#fff0f7"
          stroke={INK}
          strokeWidth="1.2"
        />
        <rect x="38" y="6" width="20" height="10" fill="#ff5cb8" />
        <rect x="38" y="18" width="20" height="10" fill="#ff5cb8" />
        <rect x="38" y="30" width="20" height="10" fill="#ff5cb8" />

        <circle cx="48" cy="9.5" r="2" fill={INK} />
        <path d="M44 15c0-2 1.8-3 4-3s4 1 4 3z" fill={INK} />
        <circle cx="48" cy="21.5" r="2" fill={INK} />
        <path d="M44 27c0-2 1.8-3 4-3s4 1 4 3z" fill={INK} />
        <circle cx="48" cy="33.5" r="2" fill={INK} />
        <path d="M44 39c0-2 1.8-3 4-3s4 1 4 3z" fill={INK} />

        <rect x="41" y="44" width="14" height="1.6" fill={INK} />
        <rect x="44" y="47" width="8" height="1.2" fill={INK} />
      </g>

      <path
        d="M74 8l1.4 3.4 3.4 1.4-3.4 1.4L74 18l-1.4-3.4L69 13.2l3.4-1.4z"
        fill="#fff0f7"
      />
    </Art>
  )
}

/** The egg with a keyring, before it hatches. */
function PiaraArt() {
  return (
    <Art>
      <circle cx="48" cy="7" r="4" fill="none" stroke="#f6f1d8" strokeWidth="2" />
      <rect x="46" y="10" width="4" height="5" fill="#f6f1d8" />

      <ellipse
        cx="48"
        cy="33"
        rx="17"
        ry="20"
        fill="#f6f1d8"
        stroke={INK}
        strokeWidth="1.2"
      />
      <path
        d="M38 22l4 3-3 3 5 2-2 3"
        fill="none"
        stroke={INK}
        strokeWidth="1.2"
      />
      <circle cx="43" cy="32" r="2" fill={INK} />
      <circle cx="53" cy="32" r="2" fill={INK} />
      <circle cx="37" cy="37" r="2.4" fill="#7ed9c2" />
      <circle cx="59" cy="37" r="2.4" fill="#7ed9c2" />
      <path
        d="M48 42c-1.5 2.2-5 .8-5-1.5 0-1.6 2.4-3 5-4.4 2.6 1.4 5 2.8 5 4.4 0 2.3-3.5 3.7-5 1.5z"
        fill="#e88a9a"
      />

      <rect x="40" y="52" width="6" height="2" rx="1" fill="#7ed9c2" />
      <rect x="50" y="52" width="6" height="2" rx="1" fill="#7ed9c2" />
    </Art>
  )
}

/** A warkop awning, a bowl of food and four seats at the counter. */
function WarkopArt() {
  return (
    <Art>
      <rect x="14" y="8" width="68" height="10" rx="2" fill="#d9a13c" />
      <rect x="14" y="16" width="68" height="2.5" fill={PAPER} />

      <rect x="24" y="8" width="7" height="10" fill="#e3350d" opacity="0.85" />
      <rect x="40" y="8" width="7" height="10" fill="#e3350d" opacity="0.85" />
      <rect x="56" y="8" width="7" height="10" fill="#e3350d" opacity="0.85" />
      <rect x="72" y="8" width="7" height="10" fill="#e3350d" opacity="0.85" />

      <rect x="18" y="18.5" width="2" height="30" fill="#7a4a1c" />
      <rect x="76" y="18.5" width="2" height="30" fill="#7a4a1c" />

      <rect x="22" y="30" width="52" height="18" fill={PAPER} />
      <rect x="22" y="30" width="52" height="3" fill="#7a4a1c" />

      <path
        d="M37 36h22c0 6-4.5 9-11 9s-11-3-11-9z"
        fill="#d9a13c"
        stroke={INK}
        strokeWidth="1"
      />
      <path
        d="M43 33c-2-2 2-2 0-4 M48 33c-2-2 2-2 0-4 M53 33c-2-2 2-2 0-4"
        fill="none"
        stroke={INK}
        strokeWidth="1"
      />

      <circle cx="16" cy="49" r="2.6" fill={PAPER} />
      <circle cx="30" cy="49" r="2.6" fill={PAPER} />
      <circle cx="66" cy="49" r="2.6" fill={PAPER} />
      <circle cx="80" cy="49" r="2.6" fill={PAPER} />
      <rect x="14.8" y="51" width="2.4" height="3" fill="#7a4a1c" />
      <rect x="28.8" y="51" width="2.4" height="3" fill="#7a4a1c" />
      <rect x="64.8" y="51" width="2.4" height="3" fill="#7a4a1c" />
      <rect x="78.8" y="51" width="2.4" height="3" fill="#7a4a1c" />
    </Art>
  )
}

/** Fallback for a cartridge that has not had its label art drawn yet. */
function GenericPackArt() {
  return (
    <Art>
      <rect
        x="30"
        y="6"
        width="36"
        height="45"
        rx="3"
        fill={PAPER}
        stroke={INK}
        strokeWidth="1.2"
      />
      <rect x="35" y="11" width="26" height="21" rx="1" fill={INK} />
      <rect x="38" y="14" width="20" height="15" fill="#9cba88" />
      <rect x="35" y="37" width="17" height="2" fill={INK} />
      <rect x="35" y="41" width="12" height="2" fill={INK} />
      <circle cx="60" cy="42" r="2" fill={INK} />
      <circle cx="66" cy="46" r="2" fill={INK} />
    </Art>
  )
}

export default function CartridgeArt({ id }: { id: string }) {
  switch (id) {
    case 'gameboy':
      return <GameBoyArt />
    case 'pokescan':
      return <PokeScanArt />
    case 'arcade':
      return <ArcadeArt />
    case 'keluarga':
      return <KeluargaArt />
    case 'rakcerita':
      return <RakCeritaArt />
    case 'photobooth':
      return <PhotoboothArt />
    case 'piara':
      return <PiaraArt />
    case 'warkop':
      return <WarkopArt />
    default:
      return <GenericPackArt />
  }
}
