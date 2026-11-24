import { CATEGORY_LABEL, SUARA, type SoundItem } from '../../content/suara'
import SoundArt from './SoundArt'
import SoundButton from './SoundButton'
import type { ArtMode } from './storage'

interface SoundCardProps {
  item: SoundItem
  mode: ArtMode
  playing: boolean
  onPlay: () => void
  onOpen: () => void
}

/** One picture in the shelf: tap it to enlarge, tap the speaker to hear it. */
export default function SoundCard({
  item,
  mode,
  playing,
  onPlay,
  onOpen,
}: SoundCardProps) {
  return (
    <article
      className={`suara-card${playing ? ' is-playing' : ''}`}
      data-category={item.category}
    >
      <button
        type="button"
        className="suara-card__frame"
        onClick={onOpen}
        aria-label={SUARA.openAria(item.name)}
      >
        <SoundArt item={item} mode={mode} />
        <span className="suara-card__tag">{CATEGORY_LABEL[item.category]}</span>
        <span className="suara-card__zoom" aria-hidden="true">
          <svg viewBox="0 0 20 20" focusable="false">
            <path d="M3 8V3h5M17 12v5h-5" />
            <path d="M3 3l5 5M17 17l-5-5" />
          </svg>
        </span>
      </button>

      <div className="suara-card__body">
        <h3 className="suara-card__name">{item.name}</h3>
        <SoundButton
          playing={playing}
          onClick={onPlay}
          label={SUARA.playAria(item.name)}
          size="md"
        />
      </div>
    </article>
  )
}
