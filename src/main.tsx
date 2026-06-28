import { StrictMode, Component, type ReactNode } from 'react'
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

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', color: '#e53e3e' }}>
          <h2>Something went wrong</h2>
          <pre style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
