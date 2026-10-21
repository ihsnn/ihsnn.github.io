import { RecoilRoot } from 'recoil'
import { BrowserRouter } from 'react-router-dom'
import AppErrorBoundary from './app/AppErrorBoundary'
import AppRouter from './app/AppRouter'

/**
 * Composition root only — providers live here, nothing else.
 * Routes (and every screen) are defined in `src/app/AppRouter.tsx`.
 */
export default function App() {
  return (
    <AppErrorBoundary>
      <RecoilRoot>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </RecoilRoot>
    </AppErrorBoundary>
  )
}
