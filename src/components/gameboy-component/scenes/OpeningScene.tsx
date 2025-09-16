import { useRecoilValue } from "recoil"
import { powerOnState } from "../../../Atom"
import { TypeAnimation } from "react-type-animation"

export default function OpeningScene() {
    const powerOn = useRecoilValue(powerOnState)
    
    return (
        <div id="scroll" className='w-full h-full flex justify-center items-center' style={{fontSize:'50pt'}}>
            {powerOn && (
                <TypeAnimation
                    sequence={[
                        // Same substring at the start will only be typed out once, initially
                        `HTML BOY®`,
                        1000,
                    ]}
                    wrapper="span"
                    speed={5}
                    style={{ fontSize: '50pt', display: 'inline-block' }}
                />
            )}
        </div>
    )
}