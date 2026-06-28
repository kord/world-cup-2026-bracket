import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './css/layout.css'
import './css/sidebar.css'
import './css/content.css'
import './css/standings.css'
import './css/matchup.css'
import './css/modals.css'
import './css/responsive.css'
import './css/bracket.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
