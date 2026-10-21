import { useRecoilValue } from 'recoil'
import { GAMEBOY_SONGS } from '../../../content/gameboy'
import { IMAGES } from '../../../lib/assets'
import { gameBoyMusicIndexState } from '../../../state/gameboy'

export default function MusicDisplay() {
  const selectedIndex = useRecoilValue(gameBoyMusicIndexState)
  const song = GAMEBOY_SONGS[selectedIndex]

  if (!song) {
    return (
      <div className="gb-scene gb-scene--center">
        <p className="gb-hint">Tidak ada lagu yang dipilih.</p>
      </div>
    )
  }

  return (
    <div className="gb-scene gb-scene--center">
      <img
        className="gb-headphone"
        src={IMAGES.headphone.src}
        alt={IMAGES.headphone.alt}
      />
      <p className="gb-song-title">{song.title}</p>
      <audio
        className="gb-audio"
        controls
        autoPlay
        preload="metadata"
        src={song.src}
      >
        Browser kamu tidak mendukung pemutar audio.
      </audio>
    </div>
  )
}
