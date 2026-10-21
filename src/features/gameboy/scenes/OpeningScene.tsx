import { TypeAnimation } from 'react-type-animation'
import { useRecoilValue } from 'recoil'
import { powerOnState } from '../../../state/gameboy'

/** Boot screen. Nothing but the logo, typed out like the original ROM would. */
export default function OpeningScene() {
  const powerOn = useRecoilValue(powerOnState)

  return (
    <div className="gb-scene gb-scene--center">
      {powerOn && (
        <TypeAnimation
          sequence={['HTML BOY®', 1000]}
          wrapper="span"
          speed={5}
          className="gb-typed gb-typed--logo"
        />
      )}
    </div>
  )
}
