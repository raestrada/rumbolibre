import { useNav } from '../App';
import {
  actividadId,
  getAsignaturas,
  getConfig,
  getCursoActivoId,
  getEnsayoNota,
  getHitos,
  getModulos,
  getProgreso,
  getRegistros,
} from '../db/queries';
import { NOTA_APROBACION } from '../data/tipos';
import { ProgressBar, EmptyState } from '../components/ui';
import { notaColor } from '../lib/parser';

function diasHasta(fechaISO: string): number | null {
  if (!fechaISO) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const meta = new Date(fechaISO + 'T00:00:00');
  if (isNaN(meta.getTime())) return null;
  return Math.round((meta.getTime() - hoy.getTime()) / 86400000);
}

export default function Dashboard(): JSX.Element {
  const { go } = useNav();
  const config = getConfig();
  const cursoId = getCursoActivoId();
  const asignaturas = getAsignaturas(cursoId);
  const progreso = getProgreso();
  const registros = getRegistros(cursoId);
  const hitos = getHitos(cursoId);

  const ultima = new Map<string, number | null>();
  for (const r of registros) {
    if (r.tipo === 'evaluacion' && !ultima.has(r.modulo_id)) ultima.set(r.modulo_id, r.nota);
  }

  const porAsignatura = asignaturas.map((a) => {
    const modulos = getModulos(a.id);
    let aprobados = 0;
    let reprobados = 0;
    for (const m of modulos) {
      const n = ultima.get(m.id) ?? null;
      if (n != null && n >= NOTA_APROBACION) aprobados += 1;
      else if (n != null) reprobados += 1;
    }
    const lista = modulos.length > 0 && aprobados === modulos.length;
    const ensayoNota = getEnsayoNota(a.id);
    return { asig: a, modulos, aprobados, reprobados, lista, ensayoNota };
  });

  // progreso de actividades (para el resumen global)
  let totalAct = 0;
  let hechas = 0;
  for (const { modulos } of porAsignatura) {
    for (const m of modulos) {
      for (const act of m.actividades) {
        totalAct += 1;
        if (progreso[actividadId(m.id, act.tipo)] === 'completada') hechas += 1;
      }
    }
  }
  const pctAct = totalAct ? (hechas / totalAct) * 100 : 0;

  const evaluaciones = registros.filter((r) => r.tipo === 'evaluacion');
  const verificadas = registros.filter((r) => r.verificado === 1).length;

  const nombre = config.nombre || '';
  const hora = new Date().getHours();
  const saludo = hora < 12 ? '¡Buenos días' : hora < 20 ? '¡Buenas tardes' : '¡Buenas noches';

  const diasExamen = diasHasta(config.fecha_examen);

  return (
    <div className="pantalla pantalla-ancha">
      <header className="cabecera">
        <h1>
          {saludo}, {nombre}! 👋
        </h1>
        <p className="cabecera-sub">Tu camino para aprobar los exámenes libres de 1° medio.</p>
      </header>

      <section className="tarjeta plazos">
        <div className="plazos-item">
          <span className="plazos-icono">📅</span>
          <div>
            <div className="plazos-titulo">
              {diasExamen != null
                ? diasExamen > 0
                  ? `Faltan ${diasExamen} días para el examen`
                  : diasExamen === 0
                    ? '¡El examen es hoy!'
                    : 'El examen ya pasó'
                : 'Define la fecha del examen en Ajustes'}
            </div>
            {config.fecha_examen ? (
              <div className="plazos-sub">{new Date(config.fecha_examen + 'T00:00:00').toLocaleDateString('es-CL')}</div>
            ) : null}
          </div>
        </div>
        {hitos.length ? (
          <div className="plazos-hitos">
            {hitos.map((h) => (
              <div key={h.id} className="plazos-hito">
                <span className={h.completado ? 'plazos-check ok' : 'plazos-check'}>{h.completado ? '✓' : '○'}</span>
                <span>{h.titulo}</span>
                {h.fecha ? <span className="plazos-fecha">{new Date(h.fecha + 'T00:00:00').toLocaleDateString('es-CL')}</span> : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="tarjeta resumen-global">
        <div className="resumen-texto">
          <div className="resumen-cifra">{Math.round(pctAct)}%</div>
          <div className="resumen-etiqueta">
            de pasos completados · {hechas} de {totalAct}
          </div>
        </div>
        <ProgressBar pct={pctAct} alto={12} />
        <div className="resumen-meta">
          <span>⭐ {evaluaciones.length} evaluaciones</span>
          <span>✅ {verificadas} verificadas</span>
        </div>
      </section>

      <h2 className="seccion-titulo">Listo para el examen</h2>
      <div className="lista">
        {porAsignatura.map(({ asig, modulos, aprobados, reprobados, lista, ensayoNota }) => (
          <div key={asig.id} className="tarjeta fila lista-asig">
            <span className="asig-icono" style={{ background: asig.color }}>
              {asig.icono}
            </span>
            <div className="fila-cuerpo">
              <div className="fila-titulo">
                {asig.nombre}
                <span className={`lista-chipo ${lista ? 'ok' : reprobados ? 'mal' : ''}`}>
                  {lista ? '✅ Lista' : reprobados ? `🔁 ${reprobados} por repasar` : '⏳ En progreso'}
                </span>
              </div>
              <div className="fila-sub">
                {aprobados}/{modulos.length} módulos aprobados
                {ensayoNota != null ? ` · ensayo general: ${ensayoNota.toFixed(1)}` : ''}
              </div>
              <ProgressBar pct={modulos.length ? (aprobados / modulos.length) * 100 : 0} color={asig.color} alto={6} />
            </div>
            <button className="btn btn-secundario btn-chico" onClick={() => go({ name: 'ensayo', asignaturaId: asig.id })}>
              🎯 Ensayo
            </button>
          </div>
        ))}
      </div>

      <h2 className="seccion-titulo">Últimas evaluaciones</h2>
      {evaluaciones.length === 0 ? (
        <EmptyState
          icono="⭐"
          titulo="Aún no hay evaluaciones"
          texto="Cuando tu IA te evalúe, pega el resultado en tu ruta y aparecerá aquí."
          accion={<button className="btn btn-primario" onClick={() => go({ name: 'ruta' })}>Ir a mi ruta →</button>}
        />
      ) : (
        <div className="lista">
          {evaluaciones.slice(0, 3).map((r) => (
            <div key={r.id} className="tarjeta fila">
              <span className="nota-burbuja" style={{ background: notaColor(r.nota) }}>
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
