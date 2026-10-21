import { useRecoilValue } from 'recoil'
import { GAMEBOY_SONGS } from '../../../content/gameboy'
import { gameBoyMusicIndexState } from '../../../state/gameboy'
import ListScene from './ListScene'

export default function MusicList() {
  const selectedIndex = useRecoilValue(gameBoyMusicIndexState)

  return (
    <ListScene
      title="MUSICS"
      items={GAMEBOY_SONGS.map((song) => song.title)}
      selectedIndex={selectedIndex}
      align="left"
    />
  )
}
