import { useNav } from '../App';
import Logo from './Logo';
import { getConfig, getCursos, setConfig } from '../db/queries';

const items: { name: string; label: string; icon: string }[] = [
  { name: 'dashboard', label: 'Inicio', icon: '🏠' },
  { name: 'ruta', label: 'Mi ruta', icon: '🗺️' },
  { name: 'biblioteca', label: 'Biblioteca', icon: '📚' },
  { name: 'examenes', label: 'Exámenes', icon: '📄' },
  { name: 'ajustes', label: 'Ajustes', icon: '⚙️' },
];

export default function Sidebar(): JSX.Element {
  const { nav, go } = useNav();
  const config = getConfig();
  const nombre = config.nombre || '';
  const cursos = getCursos();
  const cursoActivo = config.curso_activo || 'm1';

  return (
    <aside className="sidebar">
      <button
        type="button"
        className="sidebar-marca sidebar-marca-btn"
        onClick={() => go({ name: 'home' })}
        title="Ver portal web de Rumbo Libre"
      >
        <Logo size={40} />
        <div>
          <div className="sidebar-titulo">Rumbo Libre</div>
          <div className="sidebar-nombre">{nombre || '1° medio'}</div>
        </div>
      </button>
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
      <div className="sidebar-pie">
        <label className="sidebar-curso">
          <span>Curso</span>
          <select value={cursoActivo} onChange={(e) => setConfig('curso_activo', e.target.value)} aria-label="Curso">
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <span className="sidebar-pie-texto">Exámenes libres</span>
      </div>
    </aside>
  );
}
