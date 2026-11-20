import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import NotFoundPage from '../components/shared/NotFoundPage'
import ScrollToTop from '../components/shared/ScrollToTop'
import LandingPage from '../features/landing/LandingPage'
import { LEGACY_REDIRECTS, ROUTES } from './routes'

/**
 * The landing cartridges are lazy: their CSS (165 KB of chassis artwork,
 * ~19 MB of audio references, Tesseract) must not be downloaded before
 * someone actually plugs a cartridge in.
 */
const GameboyPage = lazy(() => import('../features/gameboy/GameboyPage'))
const PokeScanPage = lazy(() => import('../features/pokescan/PokeScanPage'))
const ArcadePage = lazy(() => import('../features/arcade/ArcadePage'))
const KeluargaPage = lazy(() => import('../features/keluarga/KeluargaPage'))
const RakCeritaPage = lazy(() => import('../features/rakcerita/RakCeritaPage'))
const PhotoboothPage = lazy(() => import('../features/photobooth/PhotoboothPage'))
const PiaraPage = lazy(() => import('../features/piara/PiaraPage'))
const WarkopPage = lazy(() => import('../features/warkop/WarkopPage'))
const TodoPage = lazy(() => import('../features/todo/TodoPage'))
const AngkutPage = lazy(() => import('../features/angkut/AngkutPage'))

function RouteFallback() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <span className="route-loader__led" aria-hidden="true" />
      LOADING CARTRIDGE…
    </div>
  )
}

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path={ROUTES.home} element={<LandingPage />} />

        <Route
          path={ROUTES.pokescan}
          element={
            <Suspense fallback={<RouteFallback />}>
              <PokeScanPage />
            </Suspense>
          }
        />

        <Route
          path={ROUTES.arcade}
          element={
            <Suspense fallback={<RouteFallback />}>
              <ArcadePage />
            </Suspense>
          }
        />

        <Route
          path={ROUTES.keluarga}
          element={
            <Suspense fallback={<RouteFallback />}>
              <KeluargaPage />
            </Suspense>
          }
        />

        <Route
          path={ROUTES.rakcerita}
          element={
            <Suspense fallback={<RouteFallback />}>
              <RakCeritaPage />
            </Suspense>
          }
        />

        <Route
          path={ROUTES.photobooth}
          element={
            <Suspense fallback={<RouteFallback />}>
              <PhotoboothPage />
            </Suspense>
          }
        />

        <Route
          path={ROUTES.piara}
          element={
            <Suspense fallback={<RouteFallback />}>
              <PiaraPage />
            </Suspense>
          }
        />

        <Route
          path={ROUTES.warkop}
          element={
            <Suspense fallback={<RouteFallback />}>
              <WarkopPage />
            </Suspense>
          }
        />

        <Route
          path={ROUTES.todo}
          element={
            <Suspense fallback={<RouteFallback />}>
              <TodoPage />
            </Suspense>
          }
        />

        <Route
          path={ROUTES.angkut}
          element={
            <Suspense fallback={<RouteFallback />}>
              <AngkutPage />
            </Suspense>
          }
        />

        <Route
          path={`${ROUTES.gameboy}/*`}
          element={
            <Suspense fallback={<RouteFallback />}>
              <GameboyPage />
            </Suspense>
          }
        />

        {LEGACY_REDIRECTS.map(({ from, to }) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
