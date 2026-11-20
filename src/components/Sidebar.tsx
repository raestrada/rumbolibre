import { useNav } from '../App';
import Logo from './Logo';
import {
  IconBook,
  IconCalendar,
  IconCompass,
  IconFileText,
  IconHome,
  IconSettings,
} from './Icons';
import { getConfig, getCursos, setConfig } from '../db/queries';

const items: {
  name: 'dashboard' | 'ruta' | 'calendario' | 'biblioteca' | 'examenes' | 'ajustes';
  label: string;
  Icon: ({ size }: { size?: number }) => JSX.Element;
  match: string[];
}[] = [
  { name: 'dashboard', label: 'Inicio', Icon: IconHome, match: ['dashboard'] },
  { name: 'ruta', label: 'Mi ruta', Icon: IconCompass, match: ['ruta', 'modulo', 'repaso', 'sesionIA'] },
  { name: 'calendario', label: 'Calendario', Icon: IconCalendar, match: ['calendario'] },
  { name: 'biblioteca', label: 'Biblioteca', Icon: IconBook, match: ['biblioteca'] },
  { name: 'examenes', label: 'Exámenes', Icon: IconFileText, match: ['examenes', 'ensayo'] },
  { name: 'ajustes', label: 'Ajustes', Icon: IconSettings, match: ['ajustes', 'padres', 'registro'] },
];

export default function Sidebar(): JSX.Element {
  const { nav, go } = useNav();
  const config = getConfig();
  const nombre = config.nombre || '';
  const cursos = getCursos();
  const cursoActivo = config.curso_activo || 'm1';
  const cursoObj = cursos.find((c) => c.id === cursoActivo);

  return (
    <aside className="sidebar" aria-label="Navegación de la aplicación">
      <button
        type="button"
        className="sidebar-marca sidebar-marca-btn"
        onClick={() => go({ name: 'home' })}
        title="Volver al portal de Rumbo Libre"
      >
        <Logo size={36} />
        <div className="sidebar-marca-info">
          <div className="sidebar-titulo">Rumbo Libre</div>
          <div className="sidebar-nombre">{nombre || cursoObj?.nombre || '1° medio'}</div>
        </div>
      </button>

      <nav className="sidebar-nav">
        {items.map(({ name, label, Icon, match }) => {
          const activo = match.includes(nav.name);
          return (
            <button
              key={name}
              type="button"
              className={`nav-item ${activo ? 'activo' : ''}`}
              onClick={() => go({ name } as never)}
              aria-current={activo ? 'page' : undefined}
            >
              <span className="nav-icono">
                <Icon size={18} />
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-pie">
        <label className="sidebar-curso">
          <span>Curso activo</span>
          <select
            value={cursoActivo}
            onChange={(e) => setConfig('curso_activo', e.target.value)}
            aria-label="Curso activo"
          >
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <span className="sidebar-pie-texto">100% local · MINEDUC Chile</span>
      </div>
    </aside>
  );
}
