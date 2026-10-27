import { useNav } from '../App';
import {
  actividadId,
  getAsignatura,
  getAsignaturas,
  getCursoActivoId,
  getModulos,
  getProgreso,
  getRegistros,
  type ModuloFull,
  type RegistroRow,
} from '../db/queries';
import { NOTA_APROBACION } from '../data/tipos';
import { ProgressBar } from '../components/ui';

type EstadoModulo = 'aprobado' | 'reprobado' | 'encurso';

function progresoModulo(m: ModuloFull, progreso: Record<string, string>): { c: number; t: number } {
  let c = 0;
  let t = 0;
  for (const act of m.actividades) {
    t += 1;
    if (progreso[actividadId(m.id, act.tipo)] === 'completada') c += 1;
  }
  return { c, t };
}

function estadoDeModulo(ultimaNota: number | null): EstadoModulo {
  if (ultimaNota == null) return 'encurso';
  return ultimaNota >= NOTA_APROBACION ? 'aprobado' : 'reprobado';
}

function FilaModulo({
  m,
  progreso,
  estado,
}: {
  m: ModuloFull;
  progreso: Record<string, string>;
  estado: EstadoModulo;
}): JSX.Element {
  const { go } = useNav();
  const { c, t } = progresoModulo(m, progreso);
  const badge =
    estado === 'aprobado' ? (
      <span className="modulo-check completo" title="Aprobado">🎉</span>
    ) : estado === 'reprobado' ? (
      <span className="modulo-check reprobado" title="Reprobado, a repasar">🔁</span>
    ) : (
      <span className="modulo-check">{`${c}/${t}`}</span>
    );

  return (
    <button className="tarjeta fila fila-modulo" onClick={() => go({ name: 'modulo', moduloId: m.id })}>
      {badge}
      <div className="fila-cuerpo">
        <div className="fila-titulo">
          <span className="codigo">{m.codigo}</span> {m.titulo}
          {m.eje ? <span className="eje">{m.eje}</span> : null}
        </div>
        <div className="fila-sub">{m.descripcion.slice(0, 90)}…</div>
      </div>
      <span className="fila-flecha">›</span>
    </button>
  );
}

export default function Ruta(): JSX.Element {
  const { nav, go } = useNav();
  const cursoId = getCursoActivoId();
  const progreso = getProgreso();

  // Última nota de evaluación por módulo (los registros vienen ordenados por fecha descendente).
  const ultimaNotaPorModulo = new Map<string, number | null>();
  const registros: RegistroRow[] = getRegistros(cursoId);
  for (const r of registros) {
    if (r.tipo === 'evaluacion' && !ultimaNotaPorModulo.has(r.modulo_id)) {
      ultimaNotaPorModulo.set(r.modulo_id, r.nota);
    }
  }

  const asignaturaSel = nav.name === 'ruta' ? nav.asignaturaId : undefined;
  const asignaturas = getAsignaturas(cursoId);

  if (asignaturaSel) {
    const asig = getAsignatura(asignaturaSel);
    if (!asig) return <div className="pantalla" />;
    const modulos = getModulos(asig.id);
    const total = modulos.reduce((s, m) => s + m.actividades.length, 0);
    const hechas = modulos.reduce((s, m) => s + progresoModulo(m, progreso).c, 0);
    return (
      <div className="pantalla">
        <button className="btn-volver" onClick={() => go({ name: 'ruta' })}>
          ← Todas las asignaturas
        </button>
        <header className="cabecera cabecera-asig">
          <div className="asig-icono grande" style={{ background: asig.color }}>
            {asig.icono}
          </div>
          <div>
            <h1>{asig.nombre}</h1>
            <p className="cabecera-sub">
              {asig.ejes.join(' · ')} · {hechas}/{total} pasos
            </p>
            <ProgressBar pct={total ? (hechas / total) * 100 : 0} color={asig.color} alto={8} />
          </div>
        </header>
        <div className="lista">
          {modulos.map((m) => (
            <FilaModulo
              key={m.id}
              m={m}
              progreso={progreso}
              estado={estadoDeModulo(ultimaNotaPorModulo.get(m.id) ?? null)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pantalla">
      <header className="cabecera">
        <h1>Mi ruta 🗺️</h1>
        <p className="cabecera-sub">
          Elige una asignatura y luego un módulo. En cada módulo: estudia → evalúate → apuntes.
        </p>
      </header>
      <div className="lista">
        {asignaturas.map((a) => {
          const modulos = getModulos(a.id);
          const total = modulos.reduce((s, m) => s + m.actividades.length, 0);
          const hechas = modulos.reduce((s, m) => s + progresoModulo(m, progreso).c, 0);
          const aprobados = modulos.filter(
            (m) => estadoDeModulo(ultimaNotaPorModulo.get(m.id) ?? null) === 'aprobado',
          ).length;
          return (
            <button
              key={a.id}
              className="tarjeta fila fila-asig"
              onClick={() => go({ name: 'ruta', asignaturaId: a.id })}
            >
              <span className="asig-icono" style={{ background: a.color }}>
                {a.icono}
              </span>
              <div className="fila-cuerpo">
                <div className="fila-titulo">{a.nombre}</div>
                <div className="fila-sub">
                  {modulos.length} módulos · {aprobados} aprobados · {hechas}/{total} pasos
                </div>
                <ProgressBar pct={total ? (hechas / total) * 100 : 0} color={a.color} alto={6} />
              </div>
              <span className="fila-flecha">›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
