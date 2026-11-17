/**
 * Narration. The books never ship recorded audio — the browser voice reads
 * the page text in Indonesian, which is also why the panel offers a "Bacakan"
 * button next to every caption.
 */

let voices: SpeechSynthesisVoice[] = []

const loadVoices = () => {
  try {
    voices = window.speechSynthesis?.getVoices() ?? []
  } catch {
    voices = []
  }
}

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function initSpeech() {
  if (!speechSupported()) return () => {}
  loadVoices()
  try {
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  } catch {
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }
}

function indonesianVoice() {
  return (
    voices.find((v) => /^id[-_]?/i.test(v.lang)) ??
    voices.find((v) => /indones/i.test(v.name)) ??
    null
  )
}

export function stopSpeech() {
  if (!speechSupported()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* nothing to cancel */
  }
}

/**
 * Reads `text` aloud. `onStart` / `onEnd` let the stage glow while it talks.
 */
export function speak(text: string, enabled: boolean, onTalking?: (talking: boolean) => void) {
  if (!enabled || !text || !speechSupported()) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'id-ID'
    u.rate = 0.9
    u.pitch = 1.12
    u.volume = 1
    const v = indonesianVoice()
    if (v) u.voice = v
    u.onstart = () => onTalking?.(true)
    u.onend = () => onTalking?.(false)
    u.onerror = () => onTalking?.(false)
    window.speechSynthesis.speak(u)
  } catch {
    onTalking?.(false)
  }
}
