import { Component, type ErrorInfo, type ReactNode } from 'react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  error: Error | null
}

/**
 * Keeps a render crash from turning the whole shelf into a white page.
 * There are no error reporting services here — the console message is the
 * only channel, which is fine for a personal playground.
 */
export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="crash-screen" role="alert">
        <p className="crash-screen__eyebrow">SYSTEM HALT</p>
        <h1 className="crash-screen__title">GAME OVER</h1>
        <p className="crash-screen__text">
          Something in this cartridge threw an error. The shelf is still fine.
        </p>
        <div className="crash-screen__actions">
          <button
            type="button"
            className="crash-screen__button"
            onClick={() => window.location.assign('/')}
          >
            Back to the shelf
          </button>
          <button
            type="button"
            className="crash-screen__button crash-screen__button--ghost"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
        <pre className="crash-screen__detail">{error.message}</pre>
      </div>
    )
  }
}
