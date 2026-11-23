import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error no controlado:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: 'var(--color-bg-light)'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}
          >
            <AlertTriangle size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Algo no salió como esperábamos
          </h2>
          <p
            style={{
              color: 'var(--color-gray-muted)',
              maxWidth: '460px',
              marginBottom: '2rem',
              lineHeight: 1.5,
              fontSize: '0.95rem'
            }}
          >
            Ocurrió un error inesperado al renderizar esta sección. Puedes recargar la página o volver al catálogo principal.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={this.handleReload} className="btn btn-primary">
              <RefreshCw size={16} />
              <span>Recargar Página</span>
            </button>
            <button onClick={this.handleReset} className="btn btn-outline">
              <Home size={16} />
              <span>Volver al Catálogo</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
