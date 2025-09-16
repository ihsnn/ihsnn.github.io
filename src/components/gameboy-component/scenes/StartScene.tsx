import { TypeAnimation } from "react-type-animation"
import char1 from "../../../assets/images/char1.png"

export default function StartScene() {

    const startMessage1 = "selamat datang"
    const startMessage2 = "perkenalkan saya \n Ihsnn"
    const startMessage3 = "terima kasih sudah mengunjungi game ini"
    const startMessage4 = "♥ salam hangat ♥"
    const startMessage5 = "Tekan tombol b untuk lanjut"
    
    return (
        <div className="w-full relative" style={{paddingTop:'220px'}}>
            <div className="absolute left-0 top-0 w-full flex justify-center items-center" style={{height:'210px'}}>
                <img src={char1}/>
            </div>
            <div id="scroll" className='w-full flex justify-center items-start' style={{fontSize:'50pt'}}>
                <TypeAnimation
                    sequence={[
                        startMessage1,
                        1000,
                        startMessage2,
                        1000,
                        startMessage3,
                        1000,
                        startMessage4,
                        3000,
                        startMessage5,
                        3000,
                    ]}
                    wrapper="span"
                    speed={7}
                    style={{ fontSize: '25pt', display: 'inline-block', lineHeight:'22pt', textAlign:'center' }}
                />
            </div>
        </div>
    )
}