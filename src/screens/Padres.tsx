import { useState, type FormEvent } from 'react';
import {
  actividadId,
  getAsignaturas,
  getConfig,
  getCursoActivoId,
  getModulos,
  getProgreso,
  getRegistros,
} from '../db/queries';
import { hashPin } from '../lib/auth';
import { ProgressBar, EmptyState } from '../components/ui';
import { notaColor } from '../lib/parser';

export default function Padres(): JSX.Element {
  const config = getConfig();
  const [autorizado, setAutorizado] = useState(!config.pin_hash);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  async function entrar(e: FormEvent): Promise<void> {
    e.preventDefault();
    const h = await hashPin(pin);
    if (h === config.pin_hash) setAutorizado(true);
    else setError('PIN incorrecto. Intenta de nuevo.');
  }

  if (!autorizado) {
    return (
      <div className="pantalla centrada">
        <div className="tarjeta pin-tarjeta">
          <div className="pin-icono">🔒</div>
          <h1>Zona para papás</h1>
          <p className="cabecera-sub">Ingresa el PIN para ver el seguimiento.</p>
          <form onSubmit={entrar} className="onboarding-form">
            <label className="campo">
              <span>PIN</span>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                type="password"
                inputMode="numeric"
                autoFocus
              />
            </label>
            {error ? <div className="error">{error}</div> : null}
            <button className="btn btn-primario" type="submit">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  const cursoId = getCursoActivoId();
  const asignaturas = getAsignaturas(cursoId);
  const progreso = getProgreso();
  const registros = getRegistros(cursoId);
  const evaluaciones = registros.filter((r) => r.tipo === 'evaluacion');
  const verificadas = registros.filter((r) => r.verificado === 1).length;

  const porAsignatura = asignaturas.map((a) => {
    const modulos = getModulos(a.id);
    let total = 0;
    let hechas = 0;
    for (const m of modulos)
      for (const act of m.actividades) {
        total += 1;
        if (progreso[actividadId(m.id, act.tipo)] === 'completada') hechas += 1;
      }
    return { asig: a, total, hechas, pct: total ? (hechas / total) * 100 : 0 };
  });

  const total = porAsignatura.reduce((s, x) => s + x.total, 0);
  const hechas = porAsignatura.reduce((s, x) => s + x.hechas, 0);
  const pctGlobal = total ? (hechas / total) * 100 : 0;

  return (
    <div className="pantalla">
      <header className="cabecera">
        <h1>Seguimiento 👨‍👩‍👧</h1>
        <p className="cabecera-sub">Resumen del avance de {config.nombre || 'la estudiante'}.</p>
      </header>

      <section className="tarjeta resumen-global">
        <div className="resumen-texto">
          <div className="resumen-cifra">{Math.round(pctGlobal)}%</div>
          <div className="resumen-etiqueta">avance general · {hechas} de {total} actividades</div>
        </div>
        <ProgressBar pct={pctGlobal} alto={14} />
        <div className="resumen-meta">
          <span>⭐ {evaluaciones.length} evaluaciones</span>
          <span>✅ {verificadas} verificadas</span>
        </div>
      </section>

      <h2 className="seccion-titulo">Por asignatura</h2>
      <div className="lista">
        {porAsignatura.map(({ asig, total: t, hechas: h, pct }) => (
          <div key={asig.id} className="tarjeta fila">
            <span className="asig-icono" style={{ background: asig.color }}>
              {asig.icono}
            </span>
            <div className="fila-cuerpo">
              <div className="fila-titulo">{asig.nombre}</div>
              <div className="fila-sub">
                {h}/{t} actividades
              </div>
              <ProgressBar pct={pct} color={asig.color} alto={6} />
            </div>
            <span className="fila-cifra">{Math.round(pct)}%</span>
          </div>
        ))}
      </div>

      <h2 className="seccion-titulo">Últimas evaluaciones</h2>
      {evaluaciones.length === 0 ? (
        <EmptyState icono="⭐" titulo="Aún no hay evaluaciones registradas" />
      ) : (
        <div className="lista">
          {evaluaciones.slice(0, 10).map((r) => (
            <div key={r.id} className="tarjeta fila">
              <span className="nota-burbuja" style={{ background: notaColor(r.nota) }}>
                {r.nota != null ? r.nota.toFixed(1) : '–'}
              </span>
              <div className="fila-cuerpo">
                <div className="fila-titulo">{r.modulo_id}</div>
                <div className="fila-sub">
                  {r.temas_a_reforzar.length ? `A reforzar: ${r.temas_a_reforzar.join(', ')}` : 'Sin temas pendientes'}
                </div>
              </div>
              <span>{r.verificado ? '✅' : '⏳'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
