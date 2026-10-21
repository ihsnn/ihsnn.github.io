import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { gameboySceneFromPath } from '../../app/routes'
import { useFitScale } from '../../lib/useFitScale'
import {
  gameBoyGalleryIndexState,
  gameBoyMenuIndexState,
  gameBoyMessageIndexState,
  gameBoyMusicIndexState,
  openEnvelopeState,
  powerOnState,
} from '../../state/gameboy'
import { playUiSound } from './audio'
import GameboyChassis from './GameboyChassis'
import GameboyScreen from './GameboyScreen'
import GameboyTopBar from './GameboyTopBar'
import { actionFromKeyboardEvent } from './input'
import { useGameboyInput } from './useGameboyInput'
import './stage.css'
import './gameboy.css'

/**
 * Chassis geometry, in CSS pixels — must match `.gameboy` (660 × 1080) plus
 * the 30 px the power slider overhangs above it in `gameboy.css`.
 */
const CHASSIS_WIDTH = 660
const CHASSIS_HEIGHT = 1110

export default function GameboyPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [powerOn, setPowerOn] = useRecoilState(powerOnState)
  const [menuIndex, setMenuIndex] = useRecoilState(gameBoyMenuIndexState)
  const [messageIndex, setMessageIndex] = useRecoilState(gameBoyMessageIndexState)
  const [musicIndex, setMusicIndex] = useRecoilState(gameBoyMusicIndexState)
  const [galleryIndex, setGalleryIndex] = useRecoilState(gameBoyGalleryIndexState)
  const [openEnvelope, setOpenEnvelope] = useRecoilState(openEnvelopeState)

  const scrollRef = useRef<HTMLDivElement>(null)
  const { ref: viewportRef, scale } = useFitScale(CHASSIS_WIDTH, CHASSIS_HEIGHT)

  const scene = useMemo(
    () => gameboySceneFromPath(location.pathname),
    [location.pathname],
  )

  const handleControl = useGameboyInput({
    scene,
    powerOn,
    menuIndex,
    messageIndex,
    musicIndex,
    galleryIndex,
    openEnvelope,
    setMenuIndex,
    setMessageIndex,
    setMusicIndex,
    setGalleryIndex,
    setOpenEnvelope,
    navigate,
    scrollRef,
  })

  // Physical keyboard mirrors the hardware — and lights the matching button
  // (`btnPressed` is already styled for every control in gameboy.css).
  useEffect(() => {
    const highlight = (action: string | null, pressed: boolean) => {
      if (!action) return
      document
        .getElementById(`controller_${action}`)
        ?.classList.toggle('btnPressed', pressed)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'p' || event.key === 'P') {
        const target = event.target as HTMLElement | null
        if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
        setPowerOn((on) => !on)
        return
      }
      const action = actionFromKeyboardEvent(event)
      if (!action) return
      if (event.key.startsWith('Arrow')) event.preventDefault()
      highlight(action, true)
      handleControl(action)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      highlight(actionFromKeyboardEvent(event), false)
    }

    // Losing focus mid-press would leave a button visually stuck down.
    const onBlur = () => {
      document
        .querySelectorAll('.btnPressed')
        .forEach((element) => element.classList.remove('btnPressed'))
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [handleControl, setPowerOn])

  return (
    <div className="gb-stage">
      <GameboyTopBar powerOn={powerOn} />

      <div className="gb-stage__viewport" ref={viewportRef}>
        <div
          className={`gb-console${scale === 0 ? ' is-measuring' : ''}`}
          style={{ '--gb-scale': scale } as CSSProperties}
        >
          <GameboyChassis
            powerOn={powerOn}
            onTogglePower={() => {
              if (!powerOn) playUiSound('confirm')
              setPowerOn(!powerOn)
            }}
            onControl={handleControl}
          >
            <GameboyScreen scrollRef={scrollRef} />
          </GameboyChassis>
        </div>
      </div>
    </div>
  )
}
