/**
 * The little icon sheet the pages reference as `<use href="#i-…"/>`.
 * Declared once at the top of the cartridge (hidden SVG), never per page.
 */
export default function RakIcons() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="i-book" viewBox="0 0 24 24">
          <path d="M4 5a2 2 0 0 1 2-2h13v14H6a2 2 0 0 0-2 2z" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M4 19a2 2 0 0 1 2-2h13" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M8 7h7M8 10.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".55" />
        </symbol>
        <symbol id="i-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </symbol>
        <symbol id="i-star" viewBox="0 0 24 24">
          <path d="M12 2.6 15 9l7 .8-5.2 4.7 1.4 6.9L12 18l-6.2 3.4 1.4-6.9L2 9.8 9 9z" fill="currentColor" />
        </symbol>
        <symbol id="i-list" viewBox="0 0 24 24">
          <path d="M8 6h12M8 12h12M8 18h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="4" cy="6" r="1.5" fill="currentColor" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" />
          <circle cx="4" cy="18" r="1.5" fill="currentColor" />
        </symbol>
        <symbol id="i-sound" viewBox="0 0 24 24">
          <path d="M4 9.5h3.5L13 5v14L7.5 14.5H4z" fill="currentColor" />
          <path d="M16 8.5a5 5 0 0 1 0 7M18.6 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </symbol>
        <symbol id="i-mute" viewBox="0 0 24 24">
          <path d="M4 9.5h3.5L13 5v14L7.5 14.5H4z" fill="currentColor" />
          <path d="m16.5 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </symbol>
        <symbol id="i-mic" viewBox="0 0 24 24">
          <rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="2.1" />
          <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        </symbol>
        <symbol id="i-left" viewBox="0 0 24 24">
          <path d="m14.5 5-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-right" viewBox="0 0 24 24">
          <path d="m9.5 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-help" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.1" />
          <path d="M9.4 9.1a2.7 2.7 0 1 1 3.7 2.5c-.7.3-1.1 1-1.1 1.7v.4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          <circle cx="12" cy="17.2" r="1.3" fill="currentColor" />
        </symbol>
        <symbol id="i-close" viewBox="0 0 24 24">
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </symbol>
        <symbol id="i-sparkle" viewBox="0 0 24 24">
          <path d="M12 2.8c.6 4.4 1.9 5.7 6.3 6.3-4.4.6-5.7 1.9-6.3 6.3-.6-4.4-1.9-5.7-6.3-6.3 4.4-.6 5.7-1.9 6.3-6.3z" fill="currentColor" />
          <path d="M18.4 14.6c.3 2.2 1 2.9 3.2 3.2-2.2.3-2.9 1-3.2 3.2-.3-2.2-1-2.9-3.2-3.2 2.2-.3 2.9-1 3.2-3.2z" fill="currentColor" opacity=".6" />
        </symbol>
        <symbol id="i-play" viewBox="0 0 24 24">
          <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
        </symbol>
        <symbol id="i-expand" viewBox="0 0 24 24">
          <path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-replay" viewBox="0 0 24 24">
          <path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-home" viewBox="0 0 24 24">
          <path d="m4 10 8-6 8 6v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M9.5 20v-6h5v6" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-moon" viewBox="0 0 24 24">
          <path d="M20 15.2A8.6 8.6 0 0 1 8.8 4 8.8 8.8 0 1 0 20 15.2z" fill="currentColor" />
        </symbol>
        <symbol id="i-heart" viewBox="0 0 24 24">
          <path d="M12 20s-7.4-4.6-7.4-9.4A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.4 3C19.4 15.4 12 20 12 20z" fill="currentColor" />
        </symbol>
        <symbol id="i-bookopen" viewBox="0 0 24 24">
          <path d="M12 6.5C10 4.8 7 4.5 4 5v13c3-.5 6-.2 8 1.5 2-1.7 5-2 8-1.5V5c-3-.5-6-.2-8 1.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 6.5v13" stroke="currentColor" strokeWidth="2" />
        </symbol>
        <symbol id="i-lock" viewBox="0 0 24 24">
          <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8 10V7.5a4 4 0 0 1 8 0V10" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="15" r="1.4" fill="currentColor" />
        </symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24">
          <path d="M4 12h15M13 5.5 19.5 12 13 18.5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24">
          <path d="M12 2.6l7.4 3v6.2c0 4.6-3.1 7.9-7.4 9.6-4.3-1.7-7.4-5-7.4-9.6V5.6z" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
          <path d="m8.3 11.8 2.6 2.6 4.9-5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-family" viewBox="0 0 24 24">
          <circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="16.6" cy="9.4" r="2.4" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M2.8 19.6c0-3.2 2.3-5.4 5.2-5.4s5.2 2.2 5.2 5.4M14 19.6c0-2.4 1.4-4 3.4-4s3 1.6 3 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </symbol>
        <symbol id="i-sprout" viewBox="0 0 24 24">
          <path d="M12 21v-7.5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M12 13.5C8 13.5 5 11 5 7c4.3 0 7 2.4 7 6.5zM12 13.5c0-4.4 2.7-7 7-7 0 4-3 6.5-7 6.5z" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M8 21h8" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        </symbol>
        <symbol id="i-door" viewBox="0 0 24 24">
          <path d="M4.5 21V4.5A1.5 1.5 0 0 1 6 3h12a1.5 1.5 0 0 1 1.5 1.5V21" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M3 21h18" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          <circle cx="15.6" cy="12" r="1.3" fill="currentColor" />
        </symbol>
      </defs>
    </svg>
  )
}
