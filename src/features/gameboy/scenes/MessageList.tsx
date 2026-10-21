import { useRecoilValue } from 'recoil'
import { MESSAGE_LIST_LABELS } from '../../../content/gameboy'
import { gameBoyMessageIndexState } from '../../../state/gameboy'
import ListScene from './ListScene'

export default function MessageList() {
  const selectedIndex = useRecoilValue(gameBoyMessageIndexState)

  return (
    <ListScene
      title="MESSAGES"
      items={MESSAGE_LIST_LABELS}
      selectedIndex={selectedIndex}
    />
  )
}
