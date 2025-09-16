import { useRecoilState } from 'recoil'
import '../../gameboy.css'
import { powerOnState } from '../../Atom'
import GameboyScreen from './GameboyScreen'
import { scrollDown, scrollToBottom, scrollToTop, scrollUp } from '../../Helper'
import { useLocation, useNavigate } from 'react-router-dom'

export default function GameboyMain() {
    const location = useLocation()
    const navigate = useNavigate()
    const [powerOn, setPowerOn] = useRecoilState(powerOnState)

    function onClickButton(id:string) {
        console.log(id)
        handleButtonMessage(id)
    }

    function handleButtonMessage(id:string) {
        console.log(location.pathname)
        if (location?.pathname === '/') {
            if (id === 'controller_b') {
                navigate('/message')
            }
        } else if (location?.pathname === '/message') {
            if (id === 'controller_up') {
                scrollUp()
            } else if (id === 'controller_down') {
                scrollDown()
            } else if (id === 'controller_left') {
                scrollToTop()
            } else if (id === 'controller_right') {
                scrollToBottom()
            } else if ( id === 'controller_start') {
                navigate('/')
            }
        }
    }

    return (
        <div className={`gameboy ${powerOn ? 'power-on' : ''}`} style={{scale:'0.7'}}>
            <div className="front-plate">
            <div className="front-plate-head">
                <div className="vertical-stripe"></div>
                <div className="vertical-stripe"></div>
                <div className="vertical-stripe"></div>
        
                <div className="vertical-gouge vertical-gouge-1"></div>
                <div className="vertical-gouge vertical-gouge-2"></div>
        
                <div className="on-off">
                    <div className="spike spike-left"><div></div></div>
                    <div className="spike spike-right"><div></div></div>
                    <span>
                        OFF
                        <i></i>
                        ON
                    </span>
                </div>
            </div>
        
            <div className="screen-container">
                <div className="screen-headline">
                <span>DOT MATRIX WITH STEREO SOUND</span>
                </div>
        
                <div className="battery-light">
                <span>BATTERY</span>
                </div>
        
                <div className="screen">
                    <GameboyScreen/>
                </div>
            </div>
        
            <div className="logo"></div>
        
            <div id="controller">
        
                <div className="buttons-a-b">
                <div className="button-b button-key-j" id="controller_b" onClick={()=>onClickButton('controller_b')}></div>
        
                <div className="button-a button-key-k" id="controller_a" onClick={()=>onClickButton('controller_a')}></div> 
                </div>
                
                <div className="start button-key-m" id="controller_start" onClick={()=>onClickButton('controller_start')}><div></div></div>
        
                <div className="select button-key-n" id="controller_select" onClick={()=>onClickButton('controller_select')}><div></div></div>
        
                <div className="cross-container">
                <div className="spike"><div></div></div>
                <div className="spike"><div></div></div>
                <div className="spike"><div></div></div>
                <div className="spike"><div></div></div>
        
                <div className="cross" id="controller_dpad">
                    <div className="top-down">
                    <div className="button-top button-key-w" id="controller_up" onClick={()=>onClickButton('controller_up')}>
                        <div className="button-stripe"></div>
                        <div className="button-stripe"></div>
                        <div className="button-stripe"></div>
                    </div>
                    <div className="button-bottom button-key-s" id="controller_down" onClick={()=>onClickButton('controller_down')}>
                        <div className="button-stripe"></div>
                        <div className="button-stripe"></div>
                        <div className="button-stripe"></div>
                    </div>
                    </div>
        
                    <div className="left-right">
                    <div className="button-left button-key-a" id="controller_left" onClick={()=>onClickButton('controller_left')}>
                        <div className="button-stripe"></div>
                        <div className="button-stripe"></div>
                        <div className="button-stripe"></div>
                    </div>
                    <div className="button-right button-key-d" id="controller_right" onClick={()=>onClickButton('controller_right')}>
                        <div className="button-stripe"></div>
                        <div className="button-stripe"></div>
                        <div className="button-stripe"></div>
                    </div>
                    </div>
                    <div className="cross-middle-bumb"></div>
                </div>
                </div>
        
            </div>
        
            <div className="speaker">
                <div><div className="speaker-inner-shadow"></div></div>
                <div><div className="speaker-inner-shadow"></div></div>
                <div><div className="speaker-inner-shadow"></div></div>
                <div><div className="speaker-inner-shadow"></div></div>
                <div><div className="speaker-inner-shadow"></div></div>
                <div><div className="speaker-inner-shadow"></div></div>
            </div>
        
            <div className="phones" id="volume-switch">
                <div className="vertical-stripe"></div>
                <div className="vertical-stripe"></div>
                <div className="vertical-stripe"></div> 
                <i></i>
                <span>PHONES</span>
            </div>
        
            </div>
        
            <div className="power-button" onClick={()=> setPowerOn(!powerOn)}><div></div></div>
        </div>
    )
}