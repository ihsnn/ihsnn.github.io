import { TypeAnimation } from 'react-type-animation'
import { useRecoilState, useRecoilValue } from 'recoil'
import { GAMEBOY_MESSAGES } from '../../../content/gameboy'
import { IMAGES } from '../../../lib/assets'
import { gameBoyMessageIndexState, openEnvelopeState } from '../../../state/gameboy'

/**
 * The one screen with real reading in it: an envelope that has to be opened
 * before the letter types itself out.
 */
export default function TextMessage() {
  const selectedIndex = useRecoilValue(gameBoyMessageIndexState)
  const text = GAMEBOY_MESSAGES[selectedIndex] ?? GAMEBOY_MESSAGES[0] ?? ''
  const [isOpen, setIsOpen] = useRecoilState(openEnvelopeState)

  if (!isOpen) {
    return (
      <div className="gb-scene gb-scene--center">
        <button
          type="button"
          className="gb-envelope-button"
          aria-label="Buka amplop"
          onClick={() => setIsOpen(true)}
        >
          <img
            className="gb-envelope"
            src={IMAGES.envelopeClosed.src}
            alt={IMAGES.envelopeClosed.alt}
          />
        </button>
        <p className="gb-hint">
          Tekan <b>B</b> untuk buka amplop
        </p>
      </div>
    )
  }

  return (
    <div className="gb-scene gb-scene--letter">
      <img
        className="gb-envelope gb-envelope--open"
        src={IMAGES.envelopeOpen.src}
        alt={IMAGES.envelopeOpen.alt}
      />
      <TypeAnimation
        sequence={[text, 1000]}
        wrapper="span"
        speed={5}
        className="gb-typed gb-typed--letter"
        repeat={Infinity}
      />
    </div>
  )
}
