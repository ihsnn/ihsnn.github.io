/**
 * Scroll helpers for the console screen.
 *
 * These take the element explicitly instead of looking up `#scroll` — the old
 * `document.getElementById('scroll')` matched several elements at once
 * (invalid HTML) and broke silently when a scene did not render one.
 */

type Nullable<T> = T | null | undefined

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

const behaviour = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth')

/** Scrolls by roughly one screenful. */
export function scrollByScreen(el: Nullable<HTMLElement>, direction: 'up' | 'down') {
  if (!el) return
  const distance = Math.max(48, el.clientHeight * 0.6)
  el.scrollBy({ top: direction === 'up' ? -distance : distance, behavior: behaviour() })
}

/** Jumps to the very top / bottom of the scroll area. */
export function scrollToEdge(el: Nullable<HTMLElement>, edge: 'top' | 'bottom') {
  if (!el) return
  el.scrollTo({ top: edge === 'top' ? 0 : el.scrollHeight, behavior: behaviour() })
}

/** Keeps a selected row visible without yanking the whole page around. */
export function scrollIntoView(el: Nullable<HTMLElement>) {
  el?.scrollIntoView({ block: 'nearest', behavior: behaviour() })
}
