import { useNav } from '../App';
import {
  actividadId,
  getAsignaturas,
  getCursoActivoId,
  getEnsayoNota,
  getModulos,
  getProgreso,
  getRegistros,
  type AsignaturaRow,
  type ModuloFull,
  type RegistroRow,
} from '../db/queries';
import { NOTA_APROBACION } from '../data/tipos';
import { ORDEN_MODULOS } from '../data/orden';
import { ProgressBar } from '../components/ui';

type EstadoModulo = 'aprobado' | 'reprobado' | 'encurso' | 'pendiente';

interface ItemRuta {
  modulo: ModuloFull;
  asignatura: AsignaturaRow;
  estado: EstadoModulo;
  posicion: number;
}

function ordenarItems(asignaturas: AsignaturaRow[]): ItemRuta[] {
  const modulosPorId = new Map<string, { modulo: ModuloFull; asignatura: AsignaturaRow }>();
  for (const a of asignaturas) {
    for (const m of getModulos(a.id)) modulosPorId.set(m.id, { modulo: m, asignatura: a });
  }
  const ordenados = ORDEN_MODULOS.map((id) => modulosPorId.get(id)).filter(
    (x): x is { modulo: ModuloFull; asignatura: AsignaturaRow } => Boolean(x),
  );
  // Por seguridad: añadir cualquier módulo que no esté en el orden (p. ej. cursos futuros).
  const vistos = new Set(ordenados.map((x) => x.modulo.id));
  for (const [, v] of modulosPorId) {
    if (!vistos.has(v.modulo.id)) ordenados.push(v);
  }
  return ordenados.map((v) => ({ modulo: v.modulo, asignatura: v.asignatura, estado: 'pendiente', posicion: 0 }));
}

function estadoDe(
  moduloId: string,
  ultimaNota: number | null,
  progreso: Record<string, string>,
): EstadoModulo {
  if (ultimaNota != null) return ultimaNota >= NOTA_APROBACION ? 'aprobado' : 'reprobado';
  const conProgreso = (['estudiar', 'evaluar'] as const).some(
    (t) => progreso[actividadId(moduloId, t)] === 'completada',
  );
  return conProgreso ? 'encurso' : 'pendiente';
}

const ETIQUETA_ESTADO: Record<EstadoModulo, string> = {
  aprobado: '🎉 Aprobado',
  reprobado: '🔁 Repasar',
  encurso: '⏳ En curso',
  pendiente: 'Pendiente',
};

export default function Ruta(): JSX.Element {
  const { nav, go } = useNav();
  const cursoId = getCursoActivoId();
  const progreso = getProgreso();
  const asignaturas = getAsignaturas(cursoId);

  // Última nota de evaluación por módulo.
  const ultimaNotaPorModulo = new Map<string, number | null>();
  const registros: RegistroRow[] = getRegistros(cursoId);
  for (const r of registros) {
    if (r.tipo === 'evaluacion' && !ultimaNotaPorModulo.has(r.modulo_id)) {
      ultimaNotaPorModulo.set(r.modulo_id, r.nota);
    }
  }

  const items = ordenarItems(asignaturas).map((it, i) => ({
    ...it,
    posicion: i + 1,
    estado: estadoDe(it.modulo.id, ultimaNotaPorModulo.get(it.modulo.id) ?? null, progreso),
  }));

  const filtro = nav.name === 'ruta' ? nav.asignaturaId : undefined;
  const visibles = filtro ? items.filter((it) => it.asignatura.id === filtro) : items;

  const aprobados = items.filter((it) => it.estado === 'aprobado').length;
  const encurso = items.filter((it) => it.estado === 'encurso').length;
  const reprobados = items.filter((it) => it.estado === 'reprobado').length;
  const siguiente = items.find((it) => it.estado !== 'aprobado');
  const ensayoAsig = filtro ? asignaturas.find((a) => a.id === filtro) : undefined;
  const ensayoNota = ensayoAsig ? getEnsayoNota(ensayoAsig.id) : null;

  const pctAprobados = items.length ? (aprobados / items.length) * 100 : 0;

  return (
    <div className="pantalla">
      <header className="cabecera">
        <h1>Mi ruta 🗺️</h1>
        <p className="cabecera-sub">
          Un camino sugerido que mezcla las materias para que no sea todo de una. Toca un módulo para
          estudiar.
        </p>
      </header>

      <section className="tarjeta resumen-global">
        <div className="resumen-texto">
          <div className="resumen-cifra">{aprobados}/{items.length}</div>
          <div className="resumen-etiqueta">
            módulos aprobados · {encurso} en curso · {reprobados} por repasar
          </div>
        </div>
        <ProgressBar pct={pctAprobados} alto={12} />
      </section>

      <div className="tabs scroll">
        <button className={`tab ${!filtro ? 'activo' : ''}`} onClick={() => go({ name: 'ruta' })}>
          Todos
        </button>
        {asignaturas.map((a) => (
          <button
            key={a.id}
            className={`tab ${filtro === a.id ? 'activo' : ''}`}
            onClick={() => go({ name: 'ruta', asignaturaId: a.id })}
          >
            {a.icono} {a.codigo}
          </button>
        ))}
      </div>

      {ensayoAsig ? (
        <div className="tarjeta ensayo-cta">
          <div className="fila-cuerpo">
            <div className="fila-titulo">🎯 Ensayo general de {ensayoAsig.nombre}</div>
            <div className="fila-sub">
              Mezcla todos los temas en 25 preguntas, como el examen real.
              {ensayoNota != null ? ` · última nota: ${ensayoNota.toFixed(1)}` : ''}
            </div>
          </div>
          <button className="btn btn-primario" onClick={() => go({ name: 'ensayo', asignaturaId: ensayoAsig.id })}>
            Hacer ensayo
          </button>
        </div>
      ) : null}

      {siguiente && !filtro ? (
        <div className="siguiente-hero">
          <div className="siguiente-cuerpo">
            <span className="siguiente-etiqueta">👉 Te recomiendo estudiar ahora</span>
            <div className="siguiente-titulo">
              {siguiente.asignatura.icono} {siguiente.modulo.codigo} — {siguiente.modulo.titulo}
            </div>
            <div className="siguiente-sub">
              {siguiente.asignatura.nombre}
              {siguiente.modulo.eje ? ` · ${siguiente.modulo.eje}` : ''}
            </div>
          </div>
          <button className="btn btn-primario" onClick={() => go({ name: 'modulo', moduloId: siguiente.modulo.id })}>
            Estudiar ahora →
          </button>
        </div>
      ) : null}

      {visibles.length === 0 ? (
        <div className="empty">
          <div className="empty-icono">🎉</div>
          <div className="empty-titulo">¡Todo listo!</div>
          <div className="empty-texto">No hay módulos pendientes en esta vista.</div>
        </div>
      ) : (
        <div className="roadmap">
          {visibles.map((it, i) => {
            const esSiguiente = !filtro && it.modulo.id === siguiente?.modulo.id;
            const dotBg =
              it.estado === 'aprobado'
                ? 'var(--exito)'
                : it.estado === 'reprobado'
                  ? 'var(--amarillo)'
                  : it.asignatura.color;
            const dotContenido =
              it.estado === 'aprobado' ? '✓' : it.estado === 'reprobado' ? '!' : String(it.posicion);
            return (
              <div key={it.modulo.id} className="roadmap-item">
                <div className="roadmap-track">
                  <span className={`roadmap-dot ${esSiguiente ? 'actual' : ''}`} style={{ background: dotBg }}>
                    {dotContenido}
                  </span>
                  {i < visibles.length - 1 ? <span className="roadmap-line" /> : null}
                </div>
                <button
                  className={`tarjeta roadmap-card ${esSiguiente ? 'siguiente' : ''}`}
                  onClick={() => go({ name: 'modulo', moduloId: it.modulo.id })}
                >
                  <span className="roadmap-icono" style={{ background: it.asignatura.color }}>
                    {it.asignatura.icono}
                  </span>
                  <div className="fila-cuerpo">
                    <div className="fila-titulo">
                      <span className="codigo">{it.modulo.codigo}</span> {it.modulo.titulo}
                      {it.modulo.eje ? <span className="eje">{it.modulo.eje}</span> : null}
                    </div>
                    <div className="fila-sub">{it.asignatura.nombre}</div>
                  </div>
                  <span className={`roadmap-badge estado-${it.estado}`}>{ETIQUETA_ESTADO[it.estado]}</span>
                  {esSiguiente ? <span className="roadmap-sig">👉</span> : null}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
