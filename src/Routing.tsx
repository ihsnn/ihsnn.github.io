import { useRecoilState } from "recoil"
import { isMobileState } from "./Atom"
import GameboyMain from "./components/gameboy-component/GameboyMain"
import { useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import LandingPage from "./components/landing/LandingPage"
import PokeScanPage from "./components/pokescan-component/PokeScanPage"

export default function Routing() {
    const [isMobile, setIsMobile] = useRecoilState(isMobileState)
    
    function reportWindowSize() {
        if(window.innerWidth< 640) {
            setIsMobile(true)
        } else {
            setIsMobile(false)
        }
    }
  
    window.onresize = reportWindowSize

    useEffect(() => {
        if (isMobile) {
            document.body.requestFullscreen()
        }
    }, [isMobile])

    return(
        <div className="relative w-screen h-screen bg-black flex justify-center items-center" style={{padding:`20px`}}>
            <Routes>
                <Route path="/" element={<LandingPage/>} />
                <Route path="/pokescan" element={<PokeScanPage/>} />
                <Route path="/gameboy/*" element={<GameboyMain/>} />
            </Routes>
        </div>
    )
}