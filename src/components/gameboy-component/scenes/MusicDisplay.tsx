import { useRecoilValue } from "recoil";
import { gameBoyMusicIndexState, gameBoyMusicState } from "../../../Atom";
import headphone from "../../../assets/images/headphone.png"
import audioMeAfterYou from "../../../assets/sounds/musics/paul kim-me after you wed ver.mp3"
import audioHBDSong from "../../../assets/sounds/musics/hbd-song.mp3"

export default function MusicDisplay() {
    const indexSelected = useRecoilValue(gameBoyMusicIndexState)
    const musics = useRecoilValue(gameBoyMusicState)
    const musicSelected = musics[indexSelected]

    // const audio = musicSelected?.src
    // const [isOpen, setIsOpen] = useRecoilState(openEnvelopeState)

    return(
        <div id="scroll" className='w-full flex justify-center items-center flex-col'>
            <img src={headphone} style={{height:'160px'}}/>
            <div style={{fontSize:'15pt', marginBottom:'15px', textAlign:'center'}}>{musicSelected?.title}</div>
            <audio controls autoPlay>
                <source src={
                    musicSelected?.title === "폴킴 (Paul Kim) - 너를 만나 (축가 ver)" ? audioMeAfterYou :
                    musicSelected?.title === "Birthday Song" ? audioHBDSong :
                    undefined
                } type="audio/ogg"/>
                <source src={
                    musicSelected?.title === "폴킴 (Paul Kim) - 너를 만나 (축가 ver)" ? audioMeAfterYou :
                    musicSelected?.title === "Birthday Song" ? audioHBDSong :
                    undefined
                } type="audio/mpeg"/>
            </audio>
        </div>
    )
}