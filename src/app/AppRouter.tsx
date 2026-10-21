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
