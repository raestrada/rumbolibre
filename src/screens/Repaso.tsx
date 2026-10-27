import { useNav } from '../App';
import {
  getAsignaturas,
  getCursoActivoId,
  getModulos,
  getRegistros,
  type AsignaturaRow,
  type ModuloFull,
} from '../db/queries';
import { NOTA_APROBACION } from '../data/tipos';
import { buildPromptRepasarAsignatura } from '../lib/prompts';
import { notaColor } from '../lib/parser';
import { Chip, CopyButton, EmptyState } from '../components/ui';

interface SeccionRepaso {
  asig: AsignaturaRow;
  reprobados: { id: string; codigo: string; titulo: string; nota: number }[];
  temas: string[];
}

export default function Repaso(): JSX.Element {
  const { go } = useNav();
  const cursoId = getCursoActivoId();
  const asignaturas = getAsignaturas(cursoId);
  const registros = getRegistros(cursoId);

  const modulosPorAsig = new Map<string, ModuloFull[]>();
  const asigPorModulo = new Map<string, AsignaturaRow>();
  for (const a of asignaturas) {
    const ms = getModulos(a.id);
    modulosPorAsig.set(a.id, ms);
    for (const m of ms) asigPorModulo.set(m.id, a);
  }

  const ultimaNota = new Map<string, number | null>();
  const temasPorAsig = new Map<string, Set<string>>();
  for (const a of asignaturas) temasPorAsig.set(a.id, new Set());

  for (const r of registros) {
    if (r.tipo !== 'evaluacion') continue;
    const a = asigPorModulo.get(r.modulo_id);
    if (!a) continue;
    if (!ultimaNota.has(r.modulo_id)) ultimaNota.set(r.modulo_id, r.nota);
    for (const t of r.temas_a_reforzar) temasPorAsig.get(a.id)!.add(t);
  }

  const secciones: SeccionRepaso[] = [];
  for (const a of asignaturas) {
    const reprobados: SeccionRepaso['reprobados'] = [];
    for (const m of modulosPorAsig.get(a.id)!) {
      const n = ultimaNota.get(m.id);
      if (n != null && n < NOTA_APROBACION) {
        reprobados.push({ id: m.id, codigo: m.codigo, titulo: m.titulo, nota: n });
      }
    }
    const temas = Array.from(temasPorAsig.get(a.id)!).sort();
    if (reprobados.length || temas.length) secciones.push({ asig: a, reprobados, temas });
  }

  const totalReprobados = secciones.reduce((s, x) => s + x.reprobados.length, 0);

  return (
    <div className="pantalla">
      <header className="cabecera">
        <h1>Repasar 🔁</h1>
        <p className="cabecera-sub">
          Todo lo que te falta reforzar antes del examen, reunido por asignatura.
        </p>
      </header>

      {secciones.length === 0 ? (
        <EmptyState icono="🎉" titulo="¡Todo al día!" texto="No tienes módulos reprobados ni temas pendientes de reforzar." />
      ) : (
        <>
          <div className="resumen-meta repaso-resumen">
            <span>🔁 {totalReprobados} módulos por repasar</span>
          </div>
          <div className="lista">
            {secciones.map(({ asig, reprobados, temas }) => (
              <section key={asig.id} className="tarjeta">
                <div className="repaso-cabecera">
                  <span className="asig-icono" style={{ background: asig.color }}>
                    {asig.icono}
                  </span>
                  <div>
                    <h3>{asig.nombre}</h3>
                    <span className="fila-sub">
                      {reprobados.length} módulo(s) por repasar · {temas.length} tema(s) débiles
                    </span>
                  </div>
                </div>

                {reprobados.length ? (
                  <div className="lista">
                    {reprobados.map((r) => (
                      <button key={r.id} className="fila" onClick={() => go({ name: 'modulo', moduloId: r.id })}>
                        <span className="nota-burbuja" style={{ background: notaColor(r.nota) }}>
                          {r.nota.toFixed(1)}
                        </span>
                        <div className="fila-cuerpo">
                          <div className="fila-titulo">
                            <span className="codigo">{r.codigo}</span> {r.titulo}
                          </div>
                        </div>
                        <span className="fila-flecha">›</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {temas.length ? (
                  <div className="repaso-temas">
                    {temas.map((t, i) => (
                      <Chip key={i} tono="suave">
                        {t}
                      </Chip>
                    ))}
                  </div>
                ) : null}

                {temas.length ? (
                  <div className="paso-pie">
                    <CopyButton
                      className="btn btn-secundario"
                      text={buildPromptRepasarAsignatura(asig.nombre, temas)}
                      label="Copiar prompt de repaso de esta asignatura"
                      icono="📖"
                    />
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
