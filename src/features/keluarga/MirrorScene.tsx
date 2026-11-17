import { useEffect, useRef } from 'react'
import { drawCharacter, drawCharacterShadow } from './character'
import { FIXED_CHARACTER } from '../../content/keluarga'
import { MIRROR } from '../../content/keluarga'

interface MirrorSceneProps {
  onContinue: () => void
}

/**
 * The fixed "who am I" mirror. No customisation: the story already knows who
 * this is, and the player only has to recognise him.
 */
export default function MirrorScene({ onContinue }: MirrorSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = '#d8c39a'
    ctx.fillRect(0, 0, 160, 144)

    // Wallpaper.
    for (let x = 0; x < 160; x += 8) {
      ctx.fillStyle =
        x % 16 === 0 ? 'rgba(107, 78, 48, 0.08)' : 'rgba(255, 255, 255, 0.06)'
      ctx.fillRect(x, 0, 4, 100)
    }
    ctx.fillStyle = '#a9774c'
    ctx.fillRect(0, 100, 160, 44)
    ctx.fillStyle = '#8c5f3d'
    ctx.fillRect(0, 100, 160, 2)
    for (let x = 0; x < 160; x += 16) {
      ctx.fillStyle = 'rgba(58, 34, 18, 0.2)'
      ctx.fillRect(x, 102, 1, 42)
    }

    // Mirror frame and glass.
    ctx.fillStyle = 'rgba(36, 26, 20, 0.18)'
    ctx.fillRect(34, 9, 92, 95)
    ctx.fillStyle = '#5b3922'
    ctx.fillRect(29, 3, 102, 98)
    ctx.fillStyle = '#8a5a34'
    ctx.fillRect(31, 5, 98, 94)
    const glass = ctx.createLinearGradient(32, 6, 128, 98)
    glass.addColorStop(0, '#c7e0d6')
    glass.addColorStop(0.48, '#a9cbbf')
    glass.addColorStop(1, '#6e9e94')
    ctx.fillStyle = glass
    ctx.fillRect(34, 8, 92, 88)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.fillRect(38, 12, 5, 52)
    ctx.fillRect(46, 12, 2, 38)
    ctx.fillStyle = 'rgba(36, 26, 20, 0.16)'
    ctx.fillRect(34, 90, 92, 6)
    ctx.fillStyle = '#d8ad66'
    ctx.fillRect(32, 94, 96, 3)

    // Fixed character, three-quarter mirror portrait.
    drawCharacterShadow(ctx, 59, 20, 3)
    drawCharacter(ctx, 59, 20, FIXED_CHARACTER.appearance, 'down', 0, 3)

    const vignette = ctx.createRadialGradient(80, 60, 40, 80, 60, 110)
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
    vignette.addColorStop(1, 'rgba(36, 22, 14, 0.2)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, 160, 144)
  }, [])

  return (
    <div className="kgb-mirror">
      <canvas
        ref={canvasRef}
        className="kgb-mirror__canvas"
        width={160}
        height={144}
        aria-hidden="true"
      />
      <p className="kgb-mirror__tag">{MIRROR.kicker}</p>
      <div className="kgb-mirror__copy">
        <p className="kgb-mirror__text">{MIRROR.text}</p>
        <button type="button" className="kgb-btn kgb-btn--gold" onClick={onContinue}>
          BUKA MATA
        </button>
        <p className="kgb-mirror__hint">{MIRROR.hint}</p>
      </div>
    </div>
  )
}
