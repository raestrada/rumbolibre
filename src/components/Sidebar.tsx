import { useNav } from '../App';
import Logo from './Logo';
import { getConfig } from '../db/queries';

const items: { name: string; label: string; icon: string }[] = [
  { name: 'dashboard', label: 'Inicio', icon: '🏠' },
  { name: 'ruta', label: 'Mi ruta', icon: '🗺️' },
  { name: 'registro', label: 'Registro', icon: '⭐' },
  { name: 'biblioteca', label: 'Biblioteca', icon: '📚' },
  { name: 'padres', label: 'Para papás', icon: '👨‍👩‍👧' },
  { name: 'ajustes', label: 'Ajustes', icon: '⚙️' },
];

export default function Sidebar(): JSX.Element {
  const { nav, go } = useNav();
  const nombre = getConfig().nombre || '';

  return (
    <aside className="sidebar">
      <div className="sidebar-marca">
        <Logo size={40} />
        <div>
          <div className="sidebar-titulo">Rumbo Libre</div>
          <div className="sidebar-nombre">{nombre}</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map((it) => (
          <button
            key={it.name}
            className={`nav-item ${nav.name === it.name ? 'activo' : ''}`}
            onClick={() => go({ name: it.name } as never)}
          >
            <span className="nav-icono">{it.icon}</span>
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-pie">1° medio · Exámenes libres</div>
    </aside>
  );
}
