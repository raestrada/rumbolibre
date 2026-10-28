import { useState } from 'react';
import { useNav } from '../App';
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
import { EmptyState } from '../components/ui';

type Filtro = 'todas' | 'aprobadas' | 'repasar';

function DetalleRegistro({ r }: { r: RegistroRow }): JSX.Element {
  return (
    <div className="detalle-registro">
      {r.temas_dominados.length ? (
        <div className="detalle-grupo">
          <strong>✅ Temas dominados</strong>
          <ul>
            {r.temas_dominados.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {r.temas_a_reforzar.length ? (
        <div className="detalle-grupo">
          <strong>🔁 Temas a reforzar</strong>
          <ul>
            {r.temas_a_reforzar.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
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
    </div>
  );
}

export default function Registro(): JSX.Element {
  const cursoId = getCursoActivoId();
  const { go } = useNav();
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [expandido, setExpandido] = useState<string | null>(null);

  const mapa = new Map<string, string>();
  for (const r of dbAll('SELECT id, codigo, titulo FROM modulos')) {
    mapa.set(r.id as string, `${r.codigo} — ${r.titulo}`);
  }

  const nombreAsig = new Map<string, string>();
  for (const a of getAsignaturas(cursoId)) nombreAsig.set(a.id, a.nombre);

  function etiquetaModulo(id: string): string {
    if (id.endsWith(':ensayo')) {
      const asigId = id.slice(0, -':ensayo'.length);
      return `Ensayo general · ${nombreAsig.get(asigId) ?? 'Asignatura'}`;
    }
    return mapa.get(id) ?? id;
  }

  const evaluaciones = getRegistros(cursoId).filter((r) => r.tipo === 'evaluacion');
  const registros = evaluaciones.filter((r) => {
    if (filtro === 'aprobadas') return (r.nota ?? 0) >= 4;
    if (filtro === 'repasar') return (r.nota ?? 0) < 4;
    return true;
  });
  const aprobadas = evaluaciones.filter((r) => (r.nota ?? 0) >= 4).length;

  return (
    <div className="pantalla pantalla-ancha">
      <header className="cabecera">
        <h1>Mi registro ⭐</h1>
        <p className="cabecera-sub">
          Tus evaluaciones guardadas. {evaluaciones.length} evaluaciones · {aprobadas} con nota ≥ 4.
        </p>
      </header>

      <div className="tabs">
        <button className={`tab ${filtro === 'todas' ? 'activo' : ''}`} onClick={() => setFiltro('todas')}>
          Todas ({evaluaciones.length})
        </button>
        <button className={`tab ${filtro === 'aprobadas' ? 'activo' : ''}`} onClick={() => setFiltro('aprobadas')}>
          Aprobadas
        </button>
        <button className={`tab ${filtro === 'repasar' ? 'activo' : ''}`} onClick={() => setFiltro('repasar')}>
          Por repasar
        </button>
      </div>

      {registros.length === 0 ? (
        <EmptyState
          icono="⭐"
          titulo="Nada por aquí todavía"
          texto="Entra a tu ruta, estudia un módulo y realiza tu evaluación con IA."
          accion={
            <button className="btn btn-primario" onClick={() => go({ name: 'ruta' })}>
              Ir a mi ruta →
            </button>
          }
        />
      ) : (
        <div className="lista">
          {registros.map((r) => (
            <div key={r.id} className="tarjeta registro">
              <div className="registro-cabecera" onClick={() => setExpandido(expandido === r.id ? null : r.id)}>
                <span className="nota-burbuja" style={{ background: notaColor(r.nota) }}>
                  {r.nota != null ? r.nota.toFixed(1) : '–'}
                </span>
                <div className="fila-cuerpo">
                  <div className="fila-titulo">{etiquetaModulo(r.modulo_id)}</div>
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
