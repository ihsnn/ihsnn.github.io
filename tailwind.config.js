/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Mirrors src/styles/tokens.css so utilities and hand-written CSS agree.
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        case: '#1a1a1f',
        'case-light': '#232329',
        paper: '#eae6da',
        'paper-dim': '#a9a598',
        led: '#5ee6c8',
        'led-dim': '#2b7a6c',
        dex: '#e3350d',
        'dex-yellow': '#ffcb05',
      },
      borderRadius: {
        cartridge: '10px',
      },
    },
  },
  plugins: [],
}
