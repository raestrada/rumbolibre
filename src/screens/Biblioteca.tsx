import { useState } from 'react';
import { getLecturas, getProgresoLectura, setProgresoLectura } from '../db/queries';
import { Chip, EmptyState } from '../components/ui';

const ESTADOS: Record<string, { label: string; icono: string }> = {
  sin_leer: { label: 'Por leer', icono: '📕' },
  leyendo: { label: 'Leyendo', icono: '📖' },
  leida: { label: 'Leída', icono: '✅' },
};
const ordenEstados = ['sin_leer', 'leyendo', 'leida'];

function ratingColor(r?: number | null): string {
  if (r == null) return 'var(--gris)';
  if (r >= 4.4) return 'var(--exito)';
  if (r >= 4.2) return 'var(--violeta)';
  return 'var(--texto-suave)';
}

function Portada({
  id,
  titulo,
  size,
}: {
  id: string;
  titulo: string;
  size: 'mini' | 'grande';
}): JSX.Element {
  const [error, setError] = useState(false);
  if (error) {
    return <span className={`portada portada-${size} portada-vacia`}>📖</span>;
  }
  return (
    <img
      className={`portada portada-${size}`}
      src={`portadas/${id}.jpg`}
      alt={`Portada de ${titulo}`}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

export default function Biblioteca(): JSX.Element {
  const [busqueda, setBusqueda] = useState('');
  const [genero, setGenero] = useState('Todas');
  const [soloPorLeer, setSoloPorLeer] = useState(false);
  const [orden, setOrden] = useState<'rating' | 'titulo'>('rating');

  const lecturas = getLecturas();
  const progreso = getProgresoLectura();

  const generos = ['Todas', ...Array.from(new Set(lecturas.map((l) => l.genero))).sort()];

  const q = busqueda.trim().toLowerCase();
  const filtradas = lecturas
    .filter((l) => {
      if (genero !== 'Todas' && l.genero !== genero) return false;
      const estado = progreso[l.id] || 'sin_leer';
      if (soloPorLeer && estado === 'leida') return false;
      if (q) {
        const texto = [l.titulo, l.autor, l.genero, l.area, l.por_que, ...l.temas].join(' ').toLowerCase();
        return texto.includes(q);
      }
      return true;
    })
    .sort((a, b) =>
      orden === 'rating'
        ? (b.rating ?? 0) - (a.rating ?? 0) || a.titulo.localeCompare(b.titulo)
        : a.titulo.localeCompare(b.titulo),
    );

  const totalLeidas = lecturas.filter((l) => progreso[l.id] === 'leida').length;

  function avanzar(id: string): void {
    const actual = progreso[id] || 'sin_leer';
    const idx = ordenEstados.indexOf(actual);
    setProgresoLectura(id, ordenEstados[(idx + 1) % ordenEstados.length]);
  }

  return (
    <div className="pantalla">
      <header className="cabecera">
        <h1>Biblioteca 📚</h1>
        <p className="cabecera-sub">
          Novelas y libros de divulgación que te enseñan mientras disfrutas. {lecturas.length} títulos ·{' '}
          {totalLeidas} leídos.
        </p>
      </header>

      <div className="biblioteca-toolbar">
        <input
          className="buscador"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por título, autor, tema…"
          aria-label="Buscar libros"
        />
        <select value={orden} onChange={(e) => setOrden(e.target.value as 'rating' | 'titulo')} aria-label="Ordenar">
          <option value="rating">Mejor calificados</option>
          <option value="titulo">Por título (A–Z)</option>
        </select>
      </div>

      <div className="tabs scroll">
        {generos.map((g) => (
          <button key={g} className={`tab ${genero === g ? 'activo' : ''}`} onClick={() => setGenero(g)}>
            {g}
          </button>
        ))}
        <button className={`tab ${soloPorLeer ? 'activo' : ''}`} onClick={() => setSoloPorLeer((v) => !v)}>
          {soloPorLeer ? '✓ Solo por leer' : 'Solo por leer'}
        </button>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState icono="📚" titulo="Sin resultados" texto="Prueba con otra búsqueda o filtro." />
      ) : (
        <div className="lista-libros">
          {filtradas.map((l) => {
            const estado = progreso[l.id] || 'sin_leer';
            return (
              <details key={l.id} className="libro-fila">
                <summary>
                  <Portada id={l.id} titulo={l.titulo} size="mini" />
                  <span className="libro-rating" style={{ color: ratingColor(l.rating) }}>
                    {l.rating != null ? `★ ${l.rating.toFixed(1)}` : '–'}
                  </span>
                  <div className="libro-info">
                    <div className="libro-titulo">{l.titulo}</div>
                    <div className="libro-meta">
                      {l.autor} · {l.genero}
                    </div>
                  </div>
                  <span className="libro-edad">+{l.edad_minima}</span>
                  <button
                    className={`libro-estado estado-${estado}`}
                    onClick={(e) => {
                      e.preventDefault();
                      avanzar(l.id);
                    }}
                    title="Cambiar estado de lectura"
                  >
                    {ESTADOS[estado].icono} <span>{ESTADOS[estado].label}</span>
                  </button>
                </summary>
                <div className="libro-detalle">
                  <Portada id={l.id} titulo={l.titulo} size="grande" />
                  <div className="libro-detalle-texto">
                    <div className="libro-area">🧠 {l.area}</div>
                    <p>{l.por_que}</p>
                    <div className="libro-temas">
                      {l.temas.map((t, i) => (
                        <Chip key={i} tono="suave">
                          {t}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}

      <p className="cabecera-sub" style={{ marginTop: 14 }}>
        Las calificaciones (★) son promedios aproximados de Goodreads y pueden variar con el tiempo.
      </p>
    </div>
  );
}
