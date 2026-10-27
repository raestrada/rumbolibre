import { useState } from 'react';
import { dbAll } from '../db/database';
import {
  deleteRegistro,
  getAsignaturas,
  getCursoActivoId,
  getRegistros,
  setRegistroVerificado,
  type RegistroRow,
} from '../db/queries';
import { notaColor } from '../lib/parser';
import { Chip, EmptyState } from '../components/ui';

type Filtro = 'todas' | 'evaluacion' | 'resumen';

function DetalleRegistro({ r }: { r: RegistroRow }): JSX.Element {
  return (
    <div className="detalle-registro">
      {r.tipo === 'evaluacion' ? (
        <>
          {r.temas_dominados.length ? (
            <div className="detalle-grupo">
              <strong>✅ Dominado</strong>
              <ul>{r.temas_dominados.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          ) : null}
          {r.temas_a_reforzar.length ? (
            <div className="detalle-grupo">
              <strong>🔁 A reforzar</strong>
              <ul>{r.temas_a_reforzar.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          ) : null}
          {r.retroalimentacion ? (
            <div className="detalle-grupo">
              <strong>💬 Retroalimentación</strong>
              <p>{r.retroalimentacion}</p>
            </div>
          ) : null}
          {r.siguiente_paso ? (
            <div className="detalle-grupo">
              <strong>👉 Siguiente paso</strong>
              <p>{r.siguiente_paso}</p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {r.ideas_clave.length ? (
            <div className="detalle-grupo">
              <strong>💡 Ideas clave</strong>
              <ul>{r.ideas_clave.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          ) : null}
          {r.conceptos.length ? (
            <div className="detalle-grupo">
              <strong>📖 Conceptos</strong>
              <ul>{r.conceptos.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          ) : null}
          {r.dudas.length ? (
            <div className="detalle-grupo">
              <strong>❓ Dudas</strong>
              <ul>{r.dudas.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          ) : null}
        </>
      )}
      {r.texto_crudo ? (
        <details className="detalle-crudo">
          <summary>Ver texto original</summary>
          <pre>{r.texto_crudo}</pre>
        </details>
      ) : null}
    </div>
  );
}

export default function Registro(): JSX.Element {
  const cursoId = getCursoActivoId();
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [expandido, setExpandido] = useState<string | null>(null);

  const mapa = new Map<string, string>();
  for (const r of dbAll('SELECT id, codigo FROM modulos')) mapa.set(r.id as string, r.codigo as string);

  const nombreAsig = new Map<string, string>();
  for (const a of getAsignaturas(cursoId)) nombreAsig.set(a.id, a.nombre);

  function etiquetaModulo(id: string): string {
    if (id.endsWith(':ensayo')) {
      const asigId = id.slice(0, -':ensayo'.length);
      return `Ensayo general · ${nombreAsig.get(asigId) ?? 'Asignatura'}`;
    }
    return mapa.get(id) ?? id;
  }

  const registros = getRegistros(cursoId).filter((r) => filtro === 'todas' || r.tipo === filtro);

  const evaluaciones = getRegistros(cursoId).filter((r) => r.tipo === 'evaluacion');
  const aprobadas = evaluaciones.filter((r) => (r.nota ?? 0) >= 4).length;

  return (
    <div className="pantalla">
      <header className="cabecera">
        <h1>Mi registro ⭐</h1>
        <p className="cabecera-sub">
          Tus evaluaciones y apuntes guardados. {evaluaciones.length} evaluaciones · {aprobadas} con nota ≥ 4.
        </p>
      </header>

      <div className="tabs">
        {(['todas', 'evaluacion', 'resumen'] as Filtro[]).map((f) => (
          <button
            key={f}
            className={`tab ${filtro === f ? 'activo' : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'todas' ? 'Todas' : f === 'evaluacion' ? 'Evaluaciones' : 'Apuntes'}
          </button>
        ))}
      </div>

      {registros.length === 0 ? (
        <EmptyState
          icono="⭐"
          titulo="Nada por aquí todavía"
          texto="Entra a tu ruta, estudia un módulo y pega el resultado de tu IA."
        />
      ) : (
        <div className="lista">
          {registros.map((r) => (
            <div key={r.id} className="tarjeta registro">
              <div
                className="registro-cabecera"
                onClick={() => setExpandido(expandido === r.id ? null : r.id)}
              >
                <span
                  className="nota-burbuja"
                  style={{ background: r.tipo === 'resumen' ? 'var(--teal)' : notaColor(r.nota) }}
                >
                  {r.tipo === 'resumen' ? '📝' : r.nota != null ? r.nota.toFixed(1) : '–'}
                </span>
                <div className="fila-cuerpo">
                  <div className="fila-titulo">
                    {etiquetaModulo(r.modulo_id)}
                    {r.estado_parseo !== 'ok' ? (
                      <Chip tono="suave">{r.estado_parseo === 'manual' ? 'a mano' : 'sin leer'}</Chip>
                    ) : null}
                  </div>
                  <div className="fila-sub">
                    {new Date(r.fecha).toLocaleString('es-CL')}
                    {r.tipo === 'evaluacion' && r.preguntas_totales
                      ? ` · ${r.preguntas_correctas ?? '?'}/${r.preguntas_totales} correctas`
                      : ''}
                  </div>
                </div>
                <button
                  className={`check ${r.verificado ? 'check-on' : ''}`}
                  title="Marcar como verificado"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRegistroVerificado(r.id, !r.verificado);
                  }}
                >
                  {r.verificado ? '✓' : ''}
                </button>
              </div>
              {expandido === r.id ? <DetalleRegistro r={r} /> : null}
              {expandido === r.id ? (
                <div className="registro-pie">
                  <button
                    className="btn btn-peligro-suave"
                    onClick={() => {
                      if (confirm('¿Eliminar este registro?')) deleteRegistro(r.id);
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
