import { useRecoilValue } from "recoil"
import { gameBoyMessageIndexState, gameBoyMessageState } from "../../../Atom"

export default function MessageList() {
    const indexSelected = useRecoilValue(gameBoyMessageIndexState)
    const messages = useRecoilValue(gameBoyMessageState)

    function listMessage() {
        let array:any[] = []

        messages.map((_v:any, index:number)=> {
            array.push(
                <div className={`relative ${index === indexSelected ? 'font-semibold' : ''}`}>
                    {index === indexSelected && (
                        <div className="absolute left-0 top-0 -ml-5">{'>'}</div>
                    )}
                    Message - {index+1}
                </div>
            )
        })

        return array
    }
    
    return (
        <div id="scroll" className='w-full flex justify-center items-center flex-col'>
            <div style={{fontSize:'40pt', marginBottom:'20px'}}>MESSAGES</div>
            <div className="w-full flex justify-center items-center flex-col" style={{fontSize:'20pt'}}>
                {listMessage()}
            </div>
        </div>
    )
}