import { useEffect, useRef, useState } from 'react'
import { SONG_COPY } from '../../content/rakcerita'
import { sfx } from './runtime'
import { VOWELS, VowelSong, type SongSource } from './song'

interface SongSheetProps {
  open: boolean
  soundOn: boolean
  onClose: () => void
}

const SOURCE_LABEL: Record<SongSource, string> = {
  loading: SONG_COPY.statusLoading,
  youtube: SONG_COPY.statusYoutube,
  local: SONG_COPY.statusLocal,
}

/**
 * The AIUEO sheet: five letter tiles that light up with the song, a progress
 * bar bound to the real playback position, and a line telling you whether the
 * sound is coming from YouTube or from the synth in `song.ts`.
 */
export default function SongSheet({ open, soundOn, onClose }: SongSheetProps) {
  const [vowel, setVowel] = useState('')
  const [progress, setProgress] = useState(0)
  const [source, setSource] = useState<SongSource>('loading')
  const [playing, setPlaying] = useState(false)
  const songRef = useRef<VowelSong | null>(null)
  const soundRef = useRef(soundOn)
  soundRef.current = soundOn

  useEffect(() => {
    if (!open) return
    let song: VowelSong | null = null
    song = new VowelSong(
      (tick) => {
        setVowel(tick.vowel)
        setProgress(tick.progress)
        setSource(tick.source)
      },
      () => {
        setPlaying(false)
        setVowel('')
        sfx('sparkle')
      },
      () => soundRef.current,
    )
    songRef.current = song
    setPlaying(true)
    setSource('loading')
    setVowel('')
    setProgress(0)
    void song.start()
    return () => {
      song?.destroy()
      songRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const replay = () => {
    const song = songRef.current
    if (!song) return
    setPlaying(true)
    setSource('loading')
    setVowel('')
    setProgress(0)
    void song.start()
  }

  const stop = () => {
    songRef.current?.stop()
    setPlaying(false)
    setVowel('')
    setProgress(0)
    setSource('local')
  }

  return (
    <div
      className="songmodal"
      hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rak-song-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="songcard">
        <div className="songhead">
          <b id="rak-song-title">{SONG_COPY.title}</b>
          <span>{SONG_COPY.subtitle}</span>
          <button type="button" onClick={onClose} aria-label="Tutup lagu">
            <svg style={{ width: 18, height: 18 }}>
              <use href="#i-close" />
            </svg>
          </button>
        </div>

        <div className="songstage">
          <div className="songnote-big" aria-hidden="true">
            ♪
          </div>
          <div className="songletters">
            {VOWELS.map((v) => (
              <span key={v} className={v === vowel ? 'on' : ''}>
                {v}
              </span>
            ))}
          </div>
          <div className="songbar">
            <i style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="songlyric">{vowel ? `♪ ${vowel} ♪` : 'A · I · U · E · O'}</div>
        </div>

        <div className="songactions">
          <button className="songtoggle" type="button" onClick={playing ? stop : replay}>
            {playing ? SONG_COPY.stop : SONG_COPY.replay}
          </button>
          <span className={`songsrc${source === 'youtube' ? ' on' : source === 'local' ? ' off' : ''}`}>
            {SOURCE_LABEL[source]}
          </span>
          <a
            className="songcredit"
            href={`https://youtu.be/${SONG_COPY.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {SONG_COPY.credit}
          </a>
        </div>
        <p className="songnote">{SONG_COPY.note}</p>
      </div>
    </div>
  )
}
