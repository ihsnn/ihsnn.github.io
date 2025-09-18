import { useRecoilState, useRecoilValue } from 'recoil'
import '../../gameboy.css'
import { gameBoyGalleryIndexState, gameBoyMenuIndexState, gameBoyMenuState, gameBoyMessageIndexState, gameBoyMessageState, gameBoyMusicIndexState, gameBoyMusicState, openEnvelopeState, powerOnState } from '../../Atom'
import GameboyScreen from './GameboyScreen'
import { scrollDown, scrollToBottom, scrollToTop, scrollUp } from '../../Helper'
import { useLocation, useNavigate } from 'react-router-dom'
import useSound from 'use-sound'
import beep from '../../assets/sounds/beep.wav'
import boop from '../../assets/sounds/boop.wav'
// import whoop from '../../assets/sounds/whoop.wav'
import { useRef } from 'react'

export default function GameboyMain() {
    const location = useLocation()
    const navigate = useNavigate()
    const [powerOn, setPowerOn] = useRecoilState(powerOnState)
    const menus = useRecoilValue(gameBoyMenuState)
    const messages = useRecoilValue(gameBoyMessageState)
    const musics = useRecoilValue(gameBoyMusicState)
    const [indexMenuSelected, setIndexMenuSelected] = useRecoilState(gameBoyMenuIndexState)
    const [indexMessageSelected, setIndexMessageSelected] = useRecoilState(gameBoyMessageIndexState)
    const [indexMusicSelected, setIndexMusicSelected] = useRecoilState(gameBoyMusicIndexState)
    const [indexGallery, setIndexGallery] = useRecoilState(gameBoyGalleryIndexState)
    const audioRef = useRef<any>(null)
    const [playBeep] = useSound(beep, {volume: 0.50})
    const [playBoop] = useSound(boop, {volume: 0.50})
    const [openEnvelope, setOpenEnvelope] = useRecoilState(openEnvelopeState)

    function onClickButton(id:string) {
        handleButtonMessage(id)
    }

    function handleButtonMessage(id:string) {
        if (powerOn) {
            // OPENING SCENE
            if (location?.pathname === '/') {
                playBeep()
                if (id === 'controller_b' || id === 'controller_start') {
                    navigate('/menu')
                }
            }

            // MENU
            else if (location?.pathname === '/menu') {
                if (id === 'controller_up') {
                    playBeep()
                    if (indexMenuSelected > 0) {
                        setIndexMenuSelected(indexMenuSelected-1)
                    }
                } else if (id === 'controller_down') {
                    playBeep()
                    if (indexMenuSelected < menus?.length-1) {
                        setIndexMenuSelected(indexMenuSelected+1)
                    }
                } else if (id === 'controller_a') {
                    playBoop()
                    navigate('/')
                } else if (id === 'controller_b') {
                    playBeep()
                    navigate('/' + menus[indexMenuSelected])
                }
            } 

            // START
            else if (location?.pathname === '/start') {
                if (id === 'controller_a') {
                    playBoop()
                    navigate('/menu')
                } else if (id === 'controller_b') {
                    playBeep()
                    navigate('/message')
                }
            } 

            // MESSAGE
            else if (location?.pathname === '/message') {
                if (id === 'controller_up') {
                    playBeep()
                    if (indexMessageSelected > 0) {
                        setIndexMessageSelected(indexMessageSelected-1)
                    }
                } else if (id === 'controller_down') {
                    playBeep()
                    if (indexMessageSelected < messages?.length-1) {
                        setIndexMessageSelected(indexMessageSelected+1)
                    }
                } else if (id === 'controller_a') {
                    playBoop()
                    navigate('/menu')
                } else if (id === 'controller_b') {
                    playBeep()
                    navigate('/message-display')
                }
            } 
            else if (location?.pathname === '/message-display') {
                if (id === 'controller_up') {
                    playBeep()
                    scrollUp()
                } else if (id === 'controller_down') {
                    playBeep()
                    scrollDown()
                } else if (id === 'controller_left') {
                    playBeep()
                    scrollToTop()
                } else if (id === 'controller_right') {
                    playBeep()
                    scrollToBottom()
                } else if (id === 'controller_start') {
                    playBoop()
                    navigate('/')
                } else if (id === 'controller_b') {
                    playBeep()
                    if (openEnvelope === true) {
                        navigate('/message')
                    } else {
                        setOpenEnvelope(true)
                    }
                } else if (id === 'controller_a') {
                    playBoop()
                    if (openEnvelope === true) {
                        setOpenEnvelope(false)
                    } else {
                        navigate('/message')
                    }
                }
            } 

            // GALLERY
            else if (location?.pathname === '/gallery') {
                if (id === 'controller_up') {
                    playBeep()
                    if (indexGallery > 0) {
                        setIndexGallery(indexGallery-1)
                    }
                } else if (id === 'controller_down') {
                    playBeep()
                    if (indexGallery < 8) {
                        setIndexGallery(indexGallery+1)
                    }
                } else if (id === 'controller_left') {
                    playBeep()
                    if (indexGallery > 0) {
                        setIndexGallery(indexGallery-1)
                    }
                } else if (id === 'controller_right') {
                    playBeep()
                    if (indexGallery < 8) {
                        setIndexGallery(indexGallery+1)
                    }
                } else if (id === 'controller_start') {
                    playBoop()
                    navigate('/')
                } else if (id === 'controller_b') {
                    playBeep()
                    if (indexGallery < 8) {
                        setIndexGallery(indexGallery+1)
                    }
                } else if (id === 'controller_a') {
                    playBoop()
                    navigate('/menu')
                }
            }
            
            // MUSIC
            else if (location?.pathname === '/music') {
                if (id === 'controller_up') {
                    playBeep()
                    if (indexMusicSelected > 0) {
                        scrollUp()
                        setIndexMusicSelected(indexMusicSelected-1)
                    }
                } else if (id === 'controller_down') {
                    playBeep()
                    if (indexMusicSelected < musics?.length-1) {
                        scrollDown()
                        setIndexMusicSelected(indexMusicSelected+1)
                    }
                } else if (id === 'controller_a') {
                    playBoop()
                    navigate('/menu')
                } else if (id === 'controller_b') {
                    playBeep()
                    navigate('/music-display')
                }
            } 
            else if (location?.pathname === '/music-display') {
                if (id === 'controller_up') {
                    playBeep()
                } else if (id === 'controller_down') {
                    playBeep()
                } else if (id === 'controller_left') {
                    playBeep()
                } else if (id === 'controller_right') {
                    playBeep()
                } else if (id === 'controller_start') {
                    playBoop()
                    navigate('/')
                } else if (id === 'controller_b') {
                    playBeep()
                    navigate('/music')
                } else if (id === 'controller_a') {
                    playBoop()
                    navigate('/music')
                }
            } 
            
        }
    }

    return (
        <div ref={audioRef} className={`gameboy ${powerOn ? 'power-on' : ''}`} style={{scale:'0.7'}}>
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