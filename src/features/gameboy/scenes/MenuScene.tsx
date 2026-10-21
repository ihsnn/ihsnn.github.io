import { GAMEBOY_MENU } from '../../../content/gameboy'
import { useRecoilValue } from 'recoil'
import { gameBoyMenuIndexState } from '../../../state/gameboy'
import ListScene from './ListScene'

export default function MenuScene() {
  const selectedIndex = useRecoilValue(gameBoyMenuIndexState)

  return (
    <ListScene
      title="MENU"
      items={GAMEBOY_MENU.map((item) => item.label)}
      selectedIndex={selectedIndex}
    />
  )
}
