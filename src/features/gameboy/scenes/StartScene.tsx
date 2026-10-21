import { TypeAnimation } from 'react-type-animation'
import { IMAGES } from '../../../lib/assets'

const SEQUENCE = [
  'selamat datang',
  1000,
  'perkenalkan saya \n Ihsnn',
  1000,
  'terima kasih sudah mengunjungi game ini',
  1000,
  '♥ salam hangat ♥',
  3000,
  'Tekan tombol B untuk lanjut',
  3000,
]

export default function StartScene() {
  return (
    <div className="gb-scene gb-scene--center">
      <img
        className="gb-portrait"
        src={IMAGES.character.src}
        alt={IMAGES.character.alt}
      />
      <TypeAnimation
        sequence={SEQUENCE}
        wrapper="span"
        speed={7}
        className="gb-typed gb-typed--start"
      />
    </div>
  )
}
