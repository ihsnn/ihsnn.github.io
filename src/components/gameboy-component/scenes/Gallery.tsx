import photo1 from "../../../assets/images/gallery/1.png"
import photo2 from "../../../assets/images/gallery/2.png"
import photo3 from "../../../assets/images/gallery/3.png"
import photo4 from "../../../assets/images/gallery/4.png"
import photo5 from "../../../assets/images/gallery/5.png"
import photo6 from "../../../assets/images/gallery/6.png"
import photo7 from "../../../assets/images/gallery/7.png"
import photo8 from "../../../assets/images/gallery/8.png"
import photo9 from "../../../assets/images/gallery/9.png"
import { useRecoilValue } from "recoil"
import { gameBoyGalleryIndexState } from "../../../Atom"

export default function Gallery() {
    const indexGallery = useRecoilValue(gameBoyGalleryIndexState)

    return (
        <div id="scroll" className='w-full flex justify-center items-center flex-col relative'>
            <div style={{fontSize:'20pt'}}>Gallery</div>
            <img className="rounded-md shadow-lg border-2 border-black" src={
                indexGallery === 0 ? photo1 :
                indexGallery === 1 ? photo2 :
                indexGallery === 2 ? photo3 :
                indexGallery === 3 ? photo4 :
                indexGallery === 4 ? photo5 :
                indexGallery === 5 ? photo6 :
                indexGallery === 6 ? photo7 :
                indexGallery === 7 ? photo8 :
                indexGallery === 8 ? photo9 :
                undefined
            } style={{height:'220px'}}/>
            <div style={{fontSize:'10pt'}}>my fav person</div>
        </div>
    )
}