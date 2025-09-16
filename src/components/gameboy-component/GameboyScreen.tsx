import { Route, Routes } from 'react-router-dom';
import TextMessage from './scenes/TextMessage';
import OpeningScene from './scenes/OpeningScene';
import { useRecoilValue } from 'recoil';
import { powerOnState } from '../../Atom';

export default function GameboyScreen() {
    const powerOn = useRecoilValue(powerOnState)
    // const location = useLocation()
    // const navigate = useNavigate()
    
    const text = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'

    
    return (
        <div id="scroll" className='w-full h-full p-4 scroll'>
            {powerOn ? (
                <Routes>
                    <Route path="/" element={<OpeningScene/>} />
                    <Route path="/message" element={<TextMessage text={text}/>} />
                </Routes>
            ) : (
                <div className='flex justify-center items-center w-full h-full opacity-10' style={{fontSize:'20pt'}}>Turn On to Start</div>
            )}
        </div>
    )
}


