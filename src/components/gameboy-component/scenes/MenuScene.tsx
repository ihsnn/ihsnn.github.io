import { useRecoilValue } from "recoil"
import { gameBoyMenuIndexState, gameBoyMenuState } from "../../../Atom"

export default function MenuScene() {
    const indexSelected = useRecoilValue(gameBoyMenuIndexState)
    const menus = useRecoilValue(gameBoyMenuState)

    function listMenu() {
        let array:any[] = []

        menus.map((v:any, index:number)=> {
            array.push(
                <div className={`relative ${index === indexSelected ? 'font-semibold' : ''}`}>
                    {index === indexSelected && (
                        <div className="absolute left-0 top-0 -ml-5">{'>'}</div>
                    )}
                    {v}
                </div>
            )
        })

        return array
    }
    
    return (
        <div id="scroll" className='w-full flex justify-center items-center flex-col'>
            <div style={{fontSize:'40pt', marginBottom:'20px'}}>MENU</div>
            <div className="w-full flex justify-center items-center flex-col" style={{fontSize:'20pt'}}>
                {listMenu()}
            </div>
        </div>
    )
}