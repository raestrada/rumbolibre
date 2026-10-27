import { useState } from 'react';
import { getLecturas, getProgresoLectura, setProgresoLectura } from '../db/queries';
import { Chip, EmptyState } from '../components/ui';

const ESTADOS: Record<string, { label: string; icono: string }> = {
  sin_leer: { label: 'Sin leer', icono: '📕' },
  leyendo: { label: 'Leyendo', icono: '📖' },
  leida: { label: 'Leída', icono: '✅' },
};

const ordenEstados = ['sin_leer', 'leyendo', 'leida'];

export default function Biblioteca(): JSX.Element {
  const [genero, setGenero] = useState<string>('Todas');
  const lecturas = getLecturas();
  const progreso = getProgresoLectura();

  const generos = ['Todas', ...Array.from(new Set(lecturas.map((l) => l.genero)))];

  const filtradas = genero === 'Todas' ? lecturas : lecturas.filter((l) => l.genero === genero);

  function avanzar(id: string): void {
    const actual = progreso[id] || 'sin_leer';
    const idx = ordenEstados.indexOf(actual);
    const siguiente = ordenEstados[(idx + 1) % ordenEstados.length];
    setProgresoLectura(id, siguiente);
  }

  return (
    <div className="pantalla">
      <header className="cabecera">
        <h1>Biblioteca 📚</h1>
        <p className="cabecera-sub">
          Novelas y libros de divulgación que te ayudan a aprender mientras disfrutas. Toca el botón de
          estado para marcar tu avance.
        </p>
      </header>

      <div className="tabs scroll">
        {generos.map((g) => (
          <button key={g} className={`tab ${genero === g ? 'activo' : ''}`} onClick={() => setGenero(g)}>
            {g}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <EmptyState icono="📚" titulo="Sin libros en esta categoría" />
      ) : (
        <div className="grid-libros">
          {filtradas.map((l) => {
            const estado = progreso[l.id] || 'sin_leer';
            return (
              <div key={l.id} className="tarjeta libro">
                <div className="libro-cabecera">
                  <Chip color="var(--rosa)">{l.genero}</Chip>
                  <span className="libro-edad">+{l.edad_minima}</span>
                </div>
                <h3 className="libro-titulo">{l.titulo}</h3>
                <div className="libro-autor">✍️ {l.autor}</div>
                <div className="libro-area">🧠 {l.area}</div>
                <p className="libro-porque">{l.por_que}</p>
                <div className="libro-temas">
                  {l.temas.map((t, i) => (
                    <Chip key={i} tono="suave">
                      {t}
                    </Chip>
                  ))}
                </div>
                <button
                  className={`btn estado-libro estado-${estado}`}
                  onClick={() => avanzar(l.id)}
                >
                  {ESTADOS[estado].icono} {ESTADOS[estado].label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
