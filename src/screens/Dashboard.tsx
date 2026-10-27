import { useNav } from '../App';
import {
  actividadId,
  getAsignaturas,
  getConfig,
  getCursoActivoId,
  getModulos,
  getProgreso,
  getRegistros,
  type ModuloFull,
} from '../db/queries';
import { ProgressBar, EmptyState } from '../components/ui';
import { notaColor } from '../lib/parser';

function statsAsignatura(modulos: ModuloFull[], progreso: Record<string, string>) {
  let total = 0;
  let completadas = 0;
  for (const m of modulos) {
    for (const act of m.actividades) {
      total += 1;
      if (progreso[actividadId(m.id, act.tipo)] === 'completada') completadas += 1;
    }
  }
  return { total, completadas, pct: total ? (completadas / total) * 100 : 0 };
}

export default function Dashboard(): JSX.Element {
  const { go } = useNav();
  const config = getConfig();
  const cursoId = getCursoActivoId();
  const asignaturas = getAsignaturas(cursoId);
  const progreso = getProgreso();
  const registros = getRegistros(cursoId);

  const porAsignatura = asignaturas.map((a) => ({
    asig: a,
    ...statsAsignatura(getModulos(a.id), progreso),
  }));

  const total = porAsignatura.reduce((s, x) => s + x.total, 0);
  const completadas = porAsignatura.reduce((s, x) => s + x.completadas, 0);
  const pctGlobal = total ? (completadas / total) * 100 : 0;

  const evaluaciones = registros.filter((r) => r.tipo === 'evaluacion');
  const verificadas = registros.filter((r) => r.verificado === 1).length;

  const nombre = config.nombre || '';
  const saludo = new Date().getHours() < 12 ? '¡Buenos días' : new Date().getHours() < 20 ? '¡Buenas tardes' : '¡Buenas noches';

  let diasFalta = '';
  if (config.fecha_examen) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const meta = new Date(config.fecha_examen + 'T00:00:00');
    const diff = Math.round((meta.getTime() - hoy.getTime()) / 86400000);
    diasFalta = diff >= 0 ? ` · ${diff} días para el examen` : '';
  }

  return (
    <div className="pantalla">
      <header className="cabecera">
        <div>
          <h1>
            {saludo}, {nombre}! 👋
          </h1>
          <p className="cabecera-sub">
            Prepárate para tus exámenes libres de 1° medio{diasFalta}.
          </p>
        </div>
      </header>

      <section className="tarjeta resumen-global">
        <div className="resumen-texto">
          <div className="resumen-cifra">{Math.round(pctGlobal)}%</div>
          <div className="resumen-etiqueta">
            de tu ruta completada · {completadas} de {total} actividades
          </div>
        </div>
        <ProgressBar pct={pctGlobal} alto={14} />
        <div className="resumen-meta">
          <span>⭐ {evaluaciones.length} evaluaciones</span>
          <span>✅ {verificadas} verificadas</span>
        </div>
      </section>

      <h2 className="seccion-titulo">Asignaturas</h2>
      <div className="grid-asignaturas">
        {porAsignatura.map(({ asig, total: t, completadas: c, pct }) => (
          <button
            key={asig.id}
            className="tarjeta tarjeta-asignatura"
            style={{ borderTopColor: asig.color }}
            onClick={() => go({ name: 'ruta', asignaturaId: asig.id })}
          >
            <div className="asig-icono" style={{ background: asig.color }}>
              {asig.icono}
            </div>
            <div className="asig-cuerpo">
              <div className="asig-nombre">{asig.nombre}</div>
              <ProgressBar pct={pct} color={asig.color} alto={8} />
              <div className="asig-meta">
                {c}/{t} actividades
              </div>
            </div>
          </button>
        ))}
      </div>

      <h2 className="seccion-titulo">Últimas evaluaciones</h2>
      {evaluaciones.length === 0 ? (
        <EmptyState
          icono="⭐"
          titulo="Aún no hay evaluaciones"
          texto="Cuando tu IA te evalúe, pega el resultado en tu ruta y aparecerá aquí."
        />
      ) : (
        <div className="lista">
          {evaluaciones.slice(0, 3).map((r) => (
            <div key={r.id} className="tarjeta fila">
              <span
                className="nota-burbuja"
                style={{ background: notaColor(r.nota) }}
              >
                {r.nota != null ? r.nota.toFixed(1) : '–'}
              </span>
              <div className="fila-cuerpo">
                <div className="fila-titulo">{r.modulo_id}</div>
                <div className="fila-sub">
                  {r.temas_a_reforzar.length
                    ? `A reforzar: ${r.temas_a_reforzar.slice(0, 2).join(', ')}`
                    : 'Sin temas pendientes'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
