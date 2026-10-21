import { useCallback, useRef, type PointerEvent } from 'react'

const MAX_TILT_DEG = 6

/**
 * Cheap 3D tilt for pointer devices.
 *
 * Writes CSS custom properties straight onto the node instead of going through
 * React state, so moving the mouse never re-renders the card. Touch input,
 * keyboard focus and `prefers-reduced-motion` are left completely alone.
 *
 * The element is expected to consume `--tilt-x` / `--tilt-y` in its transform
 * and `--glare-x` / `--glare-y` in a highlight gradient.
 */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  const reset = useCallback((element: HTMLElement) => {
    element.classList.remove('is-tilting')
    element.style.removeProperty('--tilt-x')
    element.style.removeProperty('--tilt-y')
  }, [])

  const onPointerEnter = useCallback((event: PointerEvent<T>) => {
    if (event.pointerType !== 'mouse') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    ref.current?.classList.add('is-tilting')
  }, [])

  const onPointerMove = useCallback((event: PointerEvent<T>) => {
    const element = ref.current
    if (!element || event.pointerType !== 'mouse') return
    if (!element.classList.contains('is-tilting')) return

    const rect = element.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    element.style.setProperty('--tilt-x', `${(-y * MAX_TILT_DEG).toFixed(2)}deg`)
    element.style.setProperty('--tilt-y', `${(x * MAX_TILT_DEG).toFixed(2)}deg`)
    element.style.setProperty('--glare-x', `${((x + 0.5) * 100).toFixed(1)}%`)
    element.style.setProperty('--glare-y', `${((y + 0.5) * 100).toFixed(1)}%`)
  }, [])

  const onPointerLeave = useCallback(() => {
    if (ref.current) reset(ref.current)
  }, [reset])

  const onBlur = useCallback(() => {
    if (ref.current) reset(ref.current)
  }, [reset])

  return {
    ref,
    handlers: { onPointerEnter, onPointerMove, onPointerLeave, onBlur },
  }
}
