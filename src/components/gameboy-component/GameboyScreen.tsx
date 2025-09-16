import { Route, Routes, useLocation } from 'react-router-dom';
import TextMessage from './scenes/TextMessage';
import OpeningScene from './scenes/OpeningScene';
import { useRecoilValue } from 'recoil';
import { powerOnState } from '../../Atom';
import useSound from 'use-sound';
import musicHappy1 from '../../assets/sounds/music-happy-1.mp3'
import musicHappy2 from '../../assets/sounds/music-happy-2.mp3'
import musicHappy3 from '../../assets/sounds/music-happy-3.mp3'
import musicHappy4 from '../../assets/sounds/music-happy-4.mp3'
import musicRelax1 from '../../assets/sounds/music-relax-1.mp3'
import { useEffect } from "react";
import MenuScene from './scenes/MenuScene';
import StartScene from './scenes/StartScene';
import MessageList from './scenes/MessageList';
import MusicList from './scenes/MusicList';
import MusicDisplay from './scenes/MusicDisplay';
import Gallery from './scenes/Gallery';

export default function GameboyScreen() {
    const powerOn = useRecoilValue(powerOnState)
    const location = useLocation()
    // const navigate = useNavigate()

    const [playHappyMusic1, {stop: stopHappyMusic1}] = useSound(musicHappy1)
    const [playHappyMusic2, {stop: stopHappyMusic2}] = useSound(musicHappy2)
    const [playHappyMusic3, {stop: stopHappyMusic3}] = useSound(musicHappy3)
    const [playHappyMusic4, {stop: stopHappyMusic4}] = useSound(musicHappy4)
    const [playRelaxMusic1, {stop: stopRelaxMusic1}] = useSound(musicRelax1)

    useEffect(() => {
        if (powerOn === true) {
            stopAllSound()
            const delay = setTimeout(()=> {
                if (location.pathname === '/') {
                    playHappyMusic1()
                } else if (location.pathname === '/message') {
                    playHappyMusic2()
                } else if (location.pathname === '/start') {
                    playHappyMusic3()
                } else if (location.pathname === '/gallery') {
                    playHappyMusic4()
                } else if (location.pathname === '/message-display') {
                    playRelaxMusic1()
                }
            }, 100)
            return (() => clearTimeout(delay))
        } else {
            stopAllSound()
        }
    }, [powerOn, location.pathname])

    function stopAllSound() {
        if (location.pathname !== '/menu') {
            stopHappyMusic1()
        }
        stopHappyMusic2()
        stopHappyMusic3()
        stopHappyMusic4()
        stopRelaxMusic1()
    }
    
    return (
        <div id="scroll" className='w-full h-full p-4 scroll'>
            {powerOn ? (
                <Routes>
                    <Route path="/" element={<OpeningScene/>} />
                    <Route path="/menu" element={<MenuScene/>} />
                    <Route path="/start" element={<StartScene/>} />
                    <Route path="/message" element={<MessageList/>}/>
                    <Route path="/message-display" element={<TextMessage/>}/>
                    <Route path="/music" element={<MusicList/>}/>
                    <Route path="/music-display" element={<MusicDisplay/>}/>
                    <Route path="/Gallery" element={<Gallery/>}/>
                </Routes>
            ) : (
                <div className='flex justify-center items-center w-full h-full opacity-10' style={{fontSize:'20pt'}}>Turn On to Start</div>
            )}
        </div>
    )
}


