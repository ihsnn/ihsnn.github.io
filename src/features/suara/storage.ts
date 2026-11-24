/** Everything TELINGA EMAS keeps between visits. All local, all optional. */

export type ArtMode = 'pixel' | 'real'

export interface BestRun {
  score: number
  total: number
}

const KEY_MUTED = 'ihsnn:suara:muted'
const KEY_ART = 'ihsnn:suara:art'
const KEY_BEST = 'ihsnn:suara:best'

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* private mode, full quota — the cartridge still works */
  }
}

export function readMuted(): boolean {
  return read(KEY_MUTED) === '1'
}

export function writeMuted(muted: boolean) {
  write(KEY_MUTED, muted ? '1' : '0')
}

export function readArtMode(): ArtMode {
  return read(KEY_ART) === 'pixel' ? 'pixel' : 'real'
}

export function writeArtMode(mode: ArtMode) {
  write(KEY_ART, mode)
}

export function readBest(): BestRun | null {
  const raw = read(KEY_BEST)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<BestRun>
    if (
      typeof parsed.score === 'number' &&
      typeof parsed.total === 'number' &&
      parsed.total > 0 &&
      parsed.score >= 0 &&
      parsed.score <= parsed.total
    ) {
      return { score: Math.round(parsed.score), total: Math.round(parsed.total) }
    }
  } catch {
    /* fall through to null */
  }
  return null
}

export function writeBest(run: BestRun) {
  write(KEY_BEST, JSON.stringify(run))
}

/** Percentage of a run, used to decide whether a new best beats the old one. */
export function runRatio(run: BestRun): number {
  return run.total > 0 ? run.score / run.total : 0
}
