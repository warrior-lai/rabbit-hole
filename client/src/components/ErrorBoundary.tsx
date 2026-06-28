import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  lang?: 'es' | 'en';
  // Called once when a render error is caught — used to report the crash for debugging.
  onError?: (error: Error, componentStack: string) => void;
}

interface State {
  error: Error | null;
}

// Catches render errors in the game screens. Without this, a single bad render blanks
// the page AND unmounts <App>, which runs useSocket's cleanup (socket.disconnect()) and
// gets the player kicked after the grace period. The boundary keeps <App> (and the socket)
// alive, shows a recover screen, and reports the real error.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    this.props.onError?.(error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const es = this.props.lang !== 'en';
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        textAlign: 'center',
        padding: '24px',
      }}>
        <div style={{ fontSize: '52px' }}>🐇💥</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
          {es ? 'Algo se rompió' : 'Something broke'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', maxWidth: '360px' }}>
          {es
            ? 'Hubo un error inesperado. Recargá para volver a la partida — tu lugar se conserva por unos segundos.'
            : 'An unexpected error occurred. Reload to get back in — your seat is held for a few seconds.'}
        </p>
        <button
          className="btn btn-accent"
          onClick={() => window.location.reload()}
          style={{ padding: '12px 28px', fontSize: '15px' }}
        >
          {es ? '🔄 Recargar' : '🔄 Reload'}
        </button>
      </div>
    );
  }
}
