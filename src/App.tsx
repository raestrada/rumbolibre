import { Component, createContext, useContext, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { initDatabase } from './db/database';
import { getConfig } from './db/queries';
import { useDB } from './useDB';
import Sidebar from './components/Sidebar';
import Logo from './components/Logo';
import Dashboard from './screens/Dashboard';
import Ruta from './screens/Ruta';
import Modulo from './screens/Modulo';
import Registro from './screens/Registro';
import Repaso from './screens/Repaso';
import Ensayo from './screens/Ensayo';
import Examenes from './screens/Examenes';
import SesionIA from './screens/SesionIA';
import Biblioteca from './screens/Biblioteca';
import Padres from './screens/Padres';
import Ajustes from './screens/Ajustes';
import Onboarding from './screens/Onboarding';

export type Screen =
  | { name: 'dashboard' }
  | { name: 'ruta'; asignaturaId?: string }
  | { name: 'modulo'; moduloId: string }
  | { name: 'ensayo'; asignaturaId: string }
  | { name: 'sesionIA'; tipo: 'modulo' | 'ensayo'; id: string }
  | { name: 'repaso' }
  | { name: 'examenes' }
  | { name: 'registro' }
  | { name: 'biblioteca' }
  | { name: 'padres' }
  | { name: 'ajustes' };

interface NavCtx {
  nav: Screen;
  go: (s: Screen) => void;
}

export const NavContext = createContext<NavCtx>({ nav: { name: 'dashboard' }, go: () => {} });

export function useNav(): NavCtx {
  return useContext(NavContext);
}

function PantallaCarga(): JSX.Element {
  return (
    <div className="carga">
      <Logo size={64} />
      <p>Cargando Rumbo Libre…</p>
    </div>
  );
}

function renderScreen(nav: Screen): JSX.Element {
  switch (nav.name) {
    case 'dashboard':
      return <Dashboard />;
    case 'ruta':
      return <Ruta />;
    case 'modulo':
      return <Modulo moduloId={nav.moduloId} />;
    case 'ensayo':
      return <Ensayo asignaturaId={nav.asignaturaId} />;
    case 'sesionIA':
      return <SesionIA tipo={nav.tipo} id={nav.id} />;
    case 'repaso':
      return <Repaso />;
    case 'examenes':
      return <Examenes />;
    case 'registro':
      return <Registro />;
    case 'biblioteca':
      return <Biblioteca />;
    case 'padres':
      return <Padres />;
    case 'ajustes':
      return <Ajustes />;
  }
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Rumbo Libre · error de pantalla', error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="pantalla">
          <div className="msg-error">
            Ocurrió un error en esta pantalla: {String(this.state.error.message)}
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primario" onClick={() => location.reload()}>
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App(): JSX.Element {
  const { ready } = useDB();
  const [nav, setNav] = useState<Screen>({ name: 'dashboard' });

  useEffect(() => {
    void initDatabase();
  }, []);

  if (!ready) return <PantallaCarga />;

  const config = getConfig();
  if (!config.nombre) return <Onboarding />;

  return (
    <NavContext.Provider value={{ nav, go: setNav }}>
      <div className="app">
        <Sidebar />
        <main className="contenido">
          <ErrorBoundary>{renderScreen(nav)}</ErrorBoundary>
        </main>
      </div>
    </NavContext.Provider>
  );
}
