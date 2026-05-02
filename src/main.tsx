import {StrictMode, useState, useEffect, ReactNode, FormEvent} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { MobileApp } from './components/mobile/MobileApp';
import './index.css';

const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('mobile') === 'true') return true;
  if (params.get('desktop') === 'true') return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 1024;
};

function ErrorBoundary({children}: { children: ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error);
      setHasError(true);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Algo deu errado</h1>
        <p style={{ opacity: 0.6, marginBottom: '2rem' }}>
          Ocorreu um erro inesperado. Por favor, recarregue a página.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            background: '#00D1FF',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Recarregar Página
        </button>
      </div>
    );
  }

  return children;
}

function AuthHandler({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sonic_ai_auth') === 'true';
    }
    return false;
  });

  const handleLogout = () => {
    localStorage.removeItem('sonic_ai_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

function LoginScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        localStorage.setItem('sonic_ai_auth', 'true');
        window.location.reload();
      } else {
        setError('Senha incorreta');
      }
    } catch {
      setError('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-[340px]">
        <div className="text-center mb-10">
          <h1 className="text-[2.5rem] font-black uppercase tracking-tighter text-white">
            SONIC<span className="text-[#00D1FF]">.</span>AI
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] mt-2 opacity-50 font-bold">
            Studio Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-white/10 px-4 py-3.5 rounded-lg text-[16px] focus:outline-none focus:border-[#00D1FF] transition-colors"
              placeholder="••••••••"
              required
              style={{ fontSize: '16px' }}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase rounded text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-[#00D1FF] text-black h-12 rounded-lg font-black uppercase text-sm tracking-tighter hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] uppercase tracking-widest opacity-20 font-bold">
            SONIC.AI Studio
          </p>
        </div>
      </div>
    </div>
  );
}

const Root = () => {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  if (isMobileDevice === null) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00D1FF]/20 border-t-[#00D1FF] animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthHandler>
        {isMobileDevice ? <MobileApp onLogout={() => {
          localStorage.removeItem('sonic_ai_auth');
          window.location.reload();
        }} /> : <App />}
      </AuthHandler>
    </ErrorBoundary>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);