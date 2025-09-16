import { useRecoilState } from "recoil"
import { isMobileState } from "./Atom"
import GameboyMain from "./components/gameboy-component/GameboyMain"
import { useEffect } from "react"

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

    window.onkeydown = function(event) {
        console.log(event.key)
    }

    useEffect(() => {
        if (isMobile) {
            document.body.requestFullscreen()
        }
    }, [isMobile])

    return(
        <div className="relative w-screen h-screen bg-black flex justify-center items-center" style={{padding:`20px`}}>
            <GameboyMain/>
        </div>
    )
}