import { TypeAnimation } from "react-type-animation";
import { useRecoilState, useRecoilValue } from "recoil";
import { gameBoyMessageIndexState, gameBoyMessageState, openEnvelopeState } from "../../../Atom";
import React from "react";
import envelopeClose from "../../../assets/images/envelope-close.png"
import envelopeOpen from "../../../assets/images/envelope-open.png"

export default function TextMessage() {
    const messages = useRecoilValue(gameBoyMessageState)
    const indexMessageSelected = useRecoilValue(gameBoyMessageIndexState)
    const text = messages[indexMessageSelected]
    const [isOpen, setIsOpen] = useRecoilState(openEnvelopeState)

    return(
        <div id="scroll" className='w-full flex justify-center items-center flex-col'>
            {isOpen === true ? (
                <React.Fragment>
                    <img src={envelopeOpen} style={{height:'240px'}}/>
                    <TypeAnimation
                        sequence={[
                            text,
                            1000,
                        ]}
                        wrapper="span"
                        speed={5}
                        style={{ fontSize: '25pt', display: 'inline-block', lineHeight:'22pt' }}
                        repeat={Infinity}
                    />
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <img src={envelopeClose} onClick={()=> setIsOpen(true)}/>
                    <div style={{fontSize:'18pt', marginTop:'15px'}}>Tekan <b>B</b> untuk buka amplop</div>
                </React.Fragment>
            )}
        </div>
    )
}