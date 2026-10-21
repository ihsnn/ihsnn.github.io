import { useEffect, useMemo, type RefObject } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { GAMEBOY_SCENE_PATHS, gameboySceneFromPath } from '../../app/routes'
import { SCENE_TITLES, SCENE_TRACKS } from '../../content/gameboy'
import { powerOnState } from '../../state/gameboy'
import { playAmbient, stopAmbient } from './audio'
import GalleryScene from './scenes/GalleryScene'
import MenuScene from './scenes/MenuScene'
import MessageList from './scenes/MessageList'
import MusicDisplay from './scenes/MusicDisplay'
import MusicList from './scenes/MusicList'
import OpeningScene from './scenes/OpeningScene'
import StartScene from './scenes/StartScene'
import TextMessage from './scenes/TextMessage'
import './scenes/scenes.css'

interface GameboyScreenProps {
  /** Owned by the page so the chassis controls can scroll the LCD. */
  scrollRef: RefObject<HTMLDivElement>
}

/**
 * The LCD: a second router for the console's scenes, plus the ambient audio
 * that belongs to whichever scene is showing.
 *
 * Route segments match `GAMEBOY_SCENE_PATHS` exactly; the old capitalised
 * `/gameboy/Gallery` is redirected in `AppRouter`.
 */
export default function GameboyScreen({ scrollRef }: GameboyScreenProps) {
  const powerOn = useRecoilValue(powerOnState)
  const location = useLocation()
  const scene = useMemo(
    () => gameboySceneFromPath(location.pathname),
    [location.pathname],
  )

  // One track per scene, released when the scene changes or the console dies.
  useEffect(() => {
    if (!powerOn || !scene) {
      stopAmbient()
      return
    }
    playAmbient(SCENE_TRACKS[scene] ?? null)
  }, [powerOn, scene])

  useEffect(() => () => stopAmbient(), [])

  // Every scene starts at the top of the LCD, like a real boot would.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [scene, scrollRef])

  return (
    <div ref={scrollRef} className="gb-screen scroll" data-scroll-root>
      <p className="sr-only" aria-live="polite">
        {powerOn && scene ? SCENE_TITLES[scene] : 'Game Boy mati'}
      </p>

      {powerOn ? (
        <Routes>
          <Route path="/" element={<OpeningScene />} />
          <Route path="menu" element={<MenuScene />} />
          <Route path="start" element={<StartScene />} />
          <Route path="message" element={<MessageList />} />
          <Route path="message-display" element={<TextMessage />} />
          <Route path="music" element={<MusicList />} />
          <Route path="music-display" element={<MusicDisplay />} />
          <Route path="gallery" element={<GalleryScene />} />
          <Route
            path="*"
            element={<Navigate to={GAMEBOY_SCENE_PATHS.opening} replace />}
          />
        </Routes>
      ) : (
        <div className="gb-screen__idle">TURN ON TO START</div>
      )}
    </div>
  )
}
