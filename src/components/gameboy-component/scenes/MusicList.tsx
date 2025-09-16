import { useRecoilValue } from "recoil"
import { gameBoyMusicIndexState, gameBoyMusicState } from "../../../Atom"

export default function MusicList() {
    const indexSelected = useRecoilValue(gameBoyMusicIndexState)
    const musics = useRecoilValue(gameBoyMusicState)

    function listMusic() {
        let array:any[] = []

        musics.map((v:any, index:number)=> {
            array.push(
                <div className={`relative text-left ${index === indexSelected ? 'font-semibold' : ''}`}>
                    {index === indexSelected && (
                        <div className="absolute left-0 top-0 -ml-5">{'>'}</div>
                    )}
                    {v?.title}
                </div>
            )
        })

        return array
    }
    
    return (
        <div id="scroll" className='w-full flex justify-center items-center flex-col'>
            <div style={{fontSize:'40pt'}}>MUSICS</div>
            <div className="w-full flex justify-start items-start flex-col" style={{fontSize:'14pt', padding:'0 30px'}}>
                {listMusic()}
            </div>
        </div>
    )
}