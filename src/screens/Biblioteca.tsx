import { useState } from 'react';
import { lecturas as CATALOGO } from '../data/lecturas';
import type { Lectura } from '../data/tipos';
import { descripcionDe } from '../data/descripciones';
import { getCursoActivoId, getCursos, getProgresoLectura, setProgresoLectura } from '../db/queries';
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
  const cursoId = getCursoActivoId();
  const cursos = getCursos();
  const cursoActivo = cursos.find((c) => c.id === cursoId);

  // Selección automática según el nivel del curso activo (Básica o Media)
  const esNivelBasicaInicial = cursoId.startsWith('b') || cursoId === 'b5';
  const [seccionNivel, setSeccionNivel] = useState<'basica' | 'media'>(
    esNivelBasicaInicial ? 'basica' : 'media',
  );

  const [busqueda, setBusqueda] = useState('');
  const [genero, setGenero] = useState('Todas');
  const [soloPorLeer, setSoloPorLeer] = useState(false);
  const [orden, setOrden] = useState<'rating' | 'titulo'>('rating');
  const [sel, setSel] = useState<Lectura | null>(null);

  const progreso = getProgresoLectura();

  // Filtrado según nivel (Básica o Media)
  const catalogoNivel = CATALOGO.filter((l) => {
    if (seccionNivel === 'basica') {
      return (
        l.cursosAplica.includes('B5') ||
        l.cursosAplica.includes('B6') ||
        l.cursosAplica.includes('B7') ||
        l.cursosAplica.includes('B8') ||
        l.cursosAplica.includes('b5') ||
        l.cursosAplica.includes('b6') ||
        l.cursosAplica.includes('b7') ||
        l.cursosAplica.includes('b8') ||
        l.edadMinima <= 13
      );
    }
    return l.cursosAplica.includes('M1') || l.cursosAplica.includes('m1');
  });

  const generos = ['Todas', ...Array.from(new Set(catalogoNivel.map((l) => l.genero))).sort()];

  const q = busqueda.trim().toLowerCase();
  const filtradas = catalogoNivel
    .filter((l) => {
      if (genero !== 'Todas' && l.genero !== genero) return false;
      const estado = progreso[l.id] || 'sin_leer';
      if (soloPorLeer && estado === 'leida') return false;
      if (q) {
        const texto = [l.titulo, l.autor, l.genero, l.area, l.porQue, ...l.temas].join(' ').toLowerCase();
        return texto.includes(q);
      }
      return true;
    })
    .sort((a, b) =>
      orden === 'rating'
        ? (b.rating ?? 0) - (a.rating ?? 0) || a.titulo.localeCompare(b.titulo)
        : a.titulo.localeCompare(b.titulo),
    );

  const totalLeidas = catalogoNivel.filter((l) => progreso[l.id] === 'leida').length;

  function avanzar(id: string): void {
    const actual = progreso[id] || 'sin_leer';
    const idx = ordenEstados.indexOf(actual);
    setProgresoLectura(id, ordenEstados[(idx + 1) % ordenEstados.length]);
  }

  const estadoSel = sel ? progreso[sel.id] || 'sin_leer' : 'sin_leer';

  return (
    <div className="pantalla pantalla-ancha">
      <header className="cabecera">
        <h1>{seccionNivel === 'basica' ? 'Biblioteca Básica 🎒' : 'Biblioteca Media 🎓'}</h1>
        <p className="cabecera-sub">
          {seccionNivel === 'basica'
            ? 'Grandes lecturas, fantasía, humor, valores y ciencia adaptadas para educación básica. '
            : 'Novelas y obras de divulgación científica para educación media. '}
          {catalogoNivel.length} títulos · {totalLeidas} leídos en esta sección.
          {cursoActivo && (
            <span style={{ display: 'block', fontSize: '0.82rem', marginTop: 4, color: 'var(--texto-suave)' }}>
              (Seleccionada automáticamente según tu curso: <strong>{cursoActivo.nombre}</strong>)
            </span>
          )}
        </p>
      </header>

      {/* Switcher entre Biblioteca Básica y Media */}
      <div className="tabs" style={{ marginBottom: 12 }}>
        <button
          className={`tab ${seccionNivel === 'basica' ? 'activo' : ''}`}
          onClick={() => {
            setSeccionNivel('basica');
            setGenero('Todas');
          }}
          style={{ fontWeight: seccionNivel === 'basica' ? 700 : 500 }}
        >
          🎒 Biblioteca Básica (5° a 8°)
        </button>
        <button
          className={`tab ${seccionNivel === 'media' ? 'activo' : ''}`}
          onClick={() => {
            setSeccionNivel('media');
            setGenero('Todas');
          }}
          style={{ fontWeight: seccionNivel === 'media' ? 700 : 500 }}
        >
          🎓 Biblioteca Media (1° a 4°)
        </button>
      </div>

      <div className="biblioteca-toolbar">
        <input
          className="buscador"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={`Buscar en biblioteca ${seccionNivel} por título, autor, tema…`}
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
        <EmptyState icono="📚" titulo="Sin resultados" texto="Prueba con otra búsqueda o filtro en esta biblioteca." />
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
                  <span className="libro-edad">+{l.edadMinima}</span>
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
        Las calificaciones (★) son promedios de Goodreads.
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
                  <span>+{sel.edadMinima} años</span>
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
              <p>{sel.porQue}</p>
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
