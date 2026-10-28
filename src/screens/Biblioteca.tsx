import { useState } from 'react';
import { getLecturas, getProgresoLectura, setProgresoLectura, type LecturaRow } from '../db/queries';
import { descripcionDe } from '../data/descripciones';
import { Chip, EmptyState, Modal } from '../components/ui';

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
  const [sel, setSel] = useState<LecturaRow | null>(null);

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

  const estadoSel = sel ? progreso[sel.id] || 'sin_leer' : 'sin_leer';

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
              <div key={l.id} className="libro-fila">
                <button className="libro-abrir" onClick={() => setSel(l)}>
                  <Portada id={l.id} titulo={l.titulo} size="mini" />
                  <span className="libro-rating" style={{ color: ratingColor(l.rating) }}>
                    {l.rating != null ? `★ ${l.rating.toFixed(1)}` : '–'}
                  </span>
                  <span className="libro-info">
                    <span className="libro-titulo">{l.titulo}</span>
                    <span className="libro-meta">
                      {l.autor} · {l.genero}
                    </span>
                  </span>
                  <span className="libro-edad">+{l.edad_minima}</span>
                </button>
                <button
                  className={`libro-estado estado-${estado}`}
                  onClick={() => avanzar(l.id)}
                  title="Cambiar estado de lectura"
                >
                  {ESTADOS[estado].icono} <span>{ESTADOS[estado].label}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="cabecera-sub" style={{ marginTop: 14 }}>
        Las calificaciones (★) son promedios aproximados de Goodreads y pueden variar con el tiempo.
      </p>

      <Modal abierto={sel != null} titulo={sel?.titulo ?? ''} onCerrar={() => setSel(null)} ancho={660}>
        {sel ? (
          <div className="libro-modal">
            <div className="libro-modal-cab">
              <Portada id={sel.id} titulo={sel.titulo} size="grande" />
              <div className="libro-modal-info">
                <div className="libro-modal-autor">{sel.autor}</div>
                <div className="libro-modal-meta">
                  <Chip>{sel.genero}</Chip>
                  <span className="libro-rating" style={{ color: ratingColor(sel.rating) }}>
                    ★ {sel.rating != null ? sel.rating.toFixed(1) : '–'}
                  </span>
                  <span>+{sel.edad_minima} años</span>
                </div>
                <button className={`libro-estado estado-${estadoSel}`} onClick={() => avanzar(sel.id)}>
                  {ESTADOS[estadoSel].icono} {ESTADOS[estadoSel].label}
                </button>
              </div>
            </div>

            <div className="libro-modal-seccion">
              <h4>De qué trata</h4>
              <p>{descripcionDe(sel.id)}</p>
            </div>

            <div className="libro-modal-seccion">
              <h4>Por qué leerlo (educativo)</h4>
              <p>{sel.por_que}</p>
            </div>

            <div className="libro-temas">
              {sel.temas.map((t, i) => (
                <Chip key={i} tono="suave">
                  {t}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
