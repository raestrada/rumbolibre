import { useState } from 'react';
import { useNav } from '../App';
import {
  actividadId,
  getAsignatura,
  getCursoActivoId,
  getModulo,
  getProgreso,
  getRegistrosDeModulo,
  setProgreso,
} from '../db/queries';
import { NOTA_APROBACION } from '../data/tipos';
import { buildPromptRepasar, getPrompt, getPromptResultado } from '../lib/prompts';
import { notaColor } from '../lib/parser';
import { Chip, CopyButton, EmptyState, Modal } from '../components/ui';
import RegistrarResultado from '../components/RegistrarResultado';

type EstadoMini = 'hecho' | 'actual' | 'bloqueado' | 'reprobado' | 'todo';

function MiniStepper({ estados }: { estados: [EstadoMini, EstadoMini, EstadoMini] }): JSX.Element {
  const pasos: { n: number; label: string }[] = [
    { n: 1, label: 'Estudiar' },
    { n: 2, label: 'Evaluar' },
    { n: 3, label: 'Apuntes' },
  ];
  const icono: Record<EstadoMini, string> = {
    hecho: '✓',
    actual: '',
    bloqueado: '🔒',
    reprobado: '🔁',
    todo: '',
  };
  return (
    <div className="mini-stepper">
      {pasos.map((p, i) => {
        const e = estados[i];
        const contenido = icono[e] || String(p.n);
        return (
          <div key={p.n} className="mini-paso-fila">
            <div className={`mini-item ${e === 'actual' || e === 'reprobado' ? 'activo' : ''}`}>
              <span className={`mini-dot ${e}`}>{contenido}</span>
              <span className="mini-label">{p.label}</span>
            </div>
            {i < 2 ? <div className="mini-line" /> : null}
          </div>
        );
      })}
    </div>
  );
}

export default function Modulo({ moduloId }: { moduloId: string }): JSX.Element {
  const { go } = useNav();
  const modulo = getModulo(moduloId);
  if (!modulo) {
    return (
      <div className="pantalla">
        <p>Módulo no encontrado.</p>
      </div>
    );
  }
  const asig = getAsignatura(modulo.asignatura_id);
  const cursoId = getCursoActivoId();
  const progreso = getProgreso();
  const registros = getRegistrosDeModulo(moduloId);

  const [modal, setModal] = useState<{ titulo: string; texto: string } | null>(null);
  const [panelEval, setPanelEval] = useState(false);
  const [panelApuntes, setPanelApuntes] = useState(false);

  const estudiarHecho = progreso[actividadId(modulo.id, 'estudiar')] === 'completada';
  const apuntesHecho = progreso[actividadId(modulo.id, 'apuntes')] === 'completada';
  const evaluaciones = registros.filter((r) => r.tipo === 'evaluacion');
  const ultimaEval = evaluaciones[0];
  const nota = ultimaEval?.nota ?? null;
  const aprobado = nota != null && nota >= NOTA_APROBACION;
  const reprobado = nota != null && nota < NOTA_APROBACION;

  const promptEstudiar = getPrompt('estudiar', modulo, asig!.nombre);
  const promptEvaluar = getPrompt('evaluar', modulo, asig!.nombre);
  const promptApuntes = getPrompt('apuntes', modulo, asig!.nombre);
  const promptResultadoEval = getPromptResultado('evaluar', modulo) ?? '';
  const promptResultadoApuntes = getPromptResultado('apuntes', modulo) ?? '';
  const promptRepasar = buildPromptRepasar(modulo, ultimaEval?.temas_a_reforzar ?? []);

  const estadosMini: [EstadoMini, EstadoMini, EstadoMini] = [
    estudiarHecho ? 'hecho' : 'actual',
    !estudiarHecho ? 'bloqueado' : aprobado ? 'hecho' : reprobado ? 'reprobado' : 'actual',
    apuntesHecho ? 'hecho' : 'todo',
  ];

  return (
    <div className="pantalla">
      <button className="btn-volver" onClick={() => go({ name: 'ruta', asignaturaId: modulo.asignatura_id })}>
        ← Volver a {asig?.nombre}
      </button>

      <header className="cabecera cabecera-modulo">
        <div className="modulo-codigo">
          <Chip color={asig?.color}>{modulo.codigo}</Chip>
          {modulo.eje ? <Chip tono="suave">{modulo.eje}</Chip> : null}
        </div>
        <h1>{modulo.titulo}</h1>
        <p className="cabecera-sub">{asig?.nombre}</p>
      </header>

      <MiniStepper estados={estadosMini} />

      {nota != null ? (
        <div className={`banner ${aprobado ? 'banner-ok' : 'banner-mal'}`}>
          {aprobado ? '🎉 ¡Módulo aprobado!' : '🔁 Reprobado, a repasar'} — nota {nota.toFixed(1)}
        </div>
      ) : null}

      <section className="tarjeta">
        <h2 className="seccion-titulo">Qué se evalúa</h2>
        <p className="modulo-descripcion">{modulo.descripcion}</p>
        <ul className="indicadores">
          {modulo.indicadores.map((ind, i) => (
            <li key={i}>{ind}</li>
          ))}
        </ul>
      </section>

      {/* Paso 1 */}
      <section className="tarjeta paso">
        <div className="paso-cabecera">
          <span className={`paso-numero ${estudiarHecho ? 'hecho' : ''}`}>{estudiarHecho ? '✓' : '1'}</span>
          <div className="paso-cuerpo">
            <h3>Estudiar el tema</h3>
            <p className="paso-desc">Aprende con tu agente de IA. Cuando termines, marca este paso.</p>
          </div>
          <span className={`paso-estado ${estudiarHecho ? 'ok' : ''}`}>{estudiarHecho ? '✓ Listo' : 'Paso 1 de 3'}</span>
        </div>

        <div className="paso-acciones">
          <button className="btn btn-ghost" onClick={() => setModal({ titulo: 'Prompt de estudio', texto: promptEstudiar })}>
            Ver prompt
          </button>
          <CopyButton className="btn btn-primario" text={promptEstudiar} label="Copiar prompt de estudio" />
        </div>

        <div className="paso-pie">
          {estudiarHecho ? (
            <button className="btn btn-suave" onClick={() => setProgreso(actividadId(modulo.id, 'estudiar'), modulo.id, 'estudiar', 'pendiente')}>
              ↩️ Aún no termino
            </button>
          ) : (
            <button className="btn btn-exito btn-ancho" onClick={() => setProgreso(actividadId(modulo.id, 'estudiar'), modulo.id, 'estudiar', 'completada')}>
              ✅ Ya estudié — desbloquear evaluación
            </button>
          )}
        </div>
      </section>

      {/* Paso 2 */}
      <section className={`tarjeta paso ${!estudiarHecho ? 'paso-bloqueado' : ''}`}>
        <div className="paso-cabecera">
          <span className={`paso-numero ${!estudiarHecho ? 'bloqueado' : aprobado ? 'hecho' : reprobado ? 'reprobado' : ''}`}>
            {!estudiarHecho ? '🔒' : aprobado ? '✓' : reprobado ? '🔁' : '2'}
          </span>
          <div className="paso-cuerpo">
            <h3>Evaluarte</h3>
            <p className="paso-desc">Simula el examen (25 preguntas, nota 1–7) y registra tu resultado.</p>
          </div>
          <span className={`paso-estado ${aprobado ? 'ok' : reprobado ? 'mal' : ''}`}>
            {aprobado ? '🎉 Aprobado' : reprobado ? '🔁 Repasar' : !estudiarHecho ? '🔒 Bloqueado' : 'Listo'}
          </span>
        </div>

        {!estudiarHecho ? (
          <div className="paso-lock">Termina de estudiar (paso 1) para desbloquear la evaluación.</div>
        ) : (
          <>
            <div className="paso-acciones">
              <button className="btn btn-ghost" onClick={() => setModal({ titulo: 'Prompt de evaluación', texto: promptEvaluar })}>
                Ver prompt
              </button>
              <CopyButton className="btn btn-primario" text={promptEvaluar} label="Copiar prompt de evaluación" />
            </div>
            <p className="paso-nota-chat">💡 Puedes usar un chat nuevo: el prompt ya trae todo el contexto del tema.</p>

            {reprobado ? (
              <div className="paso-repasar">
                <span className="paso-repasar-texto">Tu última nota fue {nota!.toFixed(1)}. Repasa y vuelve a intentar:</span>
                <CopyButton className="btn btn-secundario" text={promptRepasar} label="Copiar prompt de repasar" icono="📖" />
                <button
                  className="btn btn-suave"
                  onClick={() => setProgreso(actividadId(modulo.id, 'estudiar'), modulo.id, 'estudiar', 'pendiente')}
                >
                  ↩️ Volver a estudiar
                </button>
              </div>
            ) : null}

            <div className="resultado-toggle">
              <button className="btn btn-secundario btn-ancho" onClick={() => setPanelEval((v) => !v)}>
                📥 {panelEval ? 'Ocultar' : 'Registrar mi resultado'}
              </button>
            </div>
            {panelEval ? (
              <RegistrarResultado
                moduloId={modulo.id}
                cursoId={cursoId}
                tipo="evaluacion"
                codigo={modulo.codigo}
                promptResultado={promptResultadoEval}
                marcarPaso={{ moduloId: modulo.id, paso: 'evaluar' }}
              />
            ) : null}
          </>
        )}
      </section>

      {/* Paso 3 */}
      <section className="tarjeta paso">
        <div className="paso-cabecera">
          <span className={`paso-numero ${apuntesHecho ? 'hecho' : ''}`}>{apuntesHecho ? '✓' : '3'}</span>
          <div className="paso-cuerpo">
            <h3>Crear apuntes</h3>
            <p className="paso-desc">Resume lo aprendido y guarda tus apuntes (opcional).</p>
          </div>
          <span className={`paso-estado ${apuntesHecho ? 'ok' : ''}`}>{apuntesHecho ? '✓ Listo' : 'Opcional'}</span>
        </div>

        <div className="paso-acciones">
          <button className="btn btn-ghost" onClick={() => setModal({ titulo: 'Prompt de apuntes', texto: promptApuntes })}>
            Ver prompt
          </button>
          <CopyButton className="btn btn-primario" text={promptApuntes} label="Copiar prompt de apuntes" />
        </div>

        <div className="resultado-toggle">
          <button className="btn btn-secundario btn-ancho" onClick={() => setPanelApuntes((v) => !v)}>
            📥 {panelApuntes ? 'Ocultar' : 'Registrar mis apuntes'}
          </button>
        </div>
        {panelApuntes ? (
          <RegistrarResultado
            moduloId={modulo.id}
            cursoId={cursoId}
            tipo="resumen"
            codigo={modulo.codigo}
            promptResultado={promptResultadoApuntes}
            marcarPaso={{ moduloId: modulo.id, paso: 'apuntes' }}
          />
        ) : null}
      </section>

      <h2 className="seccion-titulo">Tu historial aquí</h2>
      {registros.length === 0 ? (
        <EmptyState icono="📭" titulo="Sin registros todavía" texto="Cuando guardes una evaluación o apuntes, aparecerán aquí." />
      ) : (
        <div className="lista">
          {registros.map((r) => (
            <div key={r.id} className="tarjeta fila">
              <span className="nota-burbuja" style={{ background: r.tipo === 'resumen' ? 'var(--teal)' : notaColor(r.nota) }}>
                {r.tipo === 'resumen' ? '📝' : r.nota != null ? r.nota.toFixed(1) : '–'}
              </span>
              <div className="fila-cuerpo">
                <div className="fila-titulo">{r.tipo === 'resumen' ? 'Apuntes' : 'Evaluación'}</div>
                <div className="fila-sub">
                  {r.temas_a_reforzar.length ? `A reforzar: ${r.temas_a_reforzar.join(', ')}` : r.siguiente_paso || '—'}
                </div>
              </div>
              <span className="fila-fecha">{new Date(r.fecha).toLocaleDateString('es-CL')}</span>
            </div>
          ))}
        </div>
      )}

      <Modal abierto={modal != null} titulo={modal?.titulo ?? ''} onCerrar={() => setModal(null)} ancho={620}>
        <p className="modal-hint">Copia este prompt y pégalo en tu agente de IA (Gemini, Claude, etc.).</p>
        <pre className="prompt-box">{modal?.texto}</pre>
        <div className="modal-acciones">
          <CopyButton className="btn btn-primario" text={modal?.texto ?? ''} label="Copiar prompt" />
        </div>
      </Modal>
    </div>
  );
}
