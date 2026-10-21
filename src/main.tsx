import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Global styles are imported in cascade order on purpose:
//   1. Tailwind utilities/preflight
//   2. design tokens  (custom properties only)
//   3. base layer     (document, scrollbar, focus, a11y helpers)
// Page/feature stylesheets are imported by their own components and always
// win over this layer.
import './index.css'
import './styles/tokens.css'
import './styles/base.css'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
