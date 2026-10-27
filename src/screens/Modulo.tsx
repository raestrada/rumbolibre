import { useState } from 'react';
import { useNav } from '../App';
import {
  actividadId,
  getAsignatura,
  getCursoActivoId,
  getModulo,
  getProgreso,
  getRegistrosDeModulo,
  insertRegistro,
  setProgreso,
  type ModuloFull,
  type AsignaturaRow,
} from '../db/queries';
import { NOTA_APROBACION } from '../data/tipos';
import { buildPromptRepasar, getPrompt, getPromptResultado } from '../lib/prompts';
import { notaColor, parsearRegistro } from '../lib/parser';
import { Chip, CopyButton, EmptyState, Modal } from '../components/ui';

function splitComa(s: string): string[] {
  return s
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function clampNota(s: string): number | null {
  const n = Number(s.replace(',', '.'));
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.min(7, Math.max(1, n)) * 10) / 10;
}

function PanelResultado({
  modulo,
  cursoId,
  tipo,
  promptResultado,
}: {
  modulo: ModuloFull;
  cursoId: string;
  tipo: 'evaluacion' | 'resumen';
  promptResultado: string;
}): JSX.Element {
  const [texto, setTexto] = useState('');
  const [notaManual, setNotaManual] = useState('');
  const [temasManual, setTemasManual] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  function guardar(): void {
    if (!texto.trim() && !notaManual.trim()) {
      setMsg({ ok: false, texto: 'Pega el resultado de tu IA o escribe una nota.' });
      return;
    }
    const parsed = parsearRegistro(texto, tipo, modulo.codigo);
    const nota = parsed.nota ?? clampNota(notaManual);
    const temasA = parsed.temasAReforzar.length ? parsed.temasAReforzar : splitComa(temasManual);
    const estado: 'ok' | 'manual' | 'sin_parsear' =
      parsed.estadoParseo === 'ok' ? 'ok' : notaManual || temasManual ? 'manual' : 'sin_parsear';

    insertRegistro({
      modulo_id: modulo.id,
      curso_id: cursoId,
      tipo,
      nota,
      preguntas_correctas: parsed.preguntasCorrectas,
      preguntas_totales: parsed.preguntasTotales,
      temas_dominados: parsed.temasDominados,
      temas_a_reforzar: temasA,
      retroalimentacion: parsed.retroalimentacion,
      siguiente_paso: parsed.siguientePaso,
      ideas_clave: parsed.ideasClave,
      conceptos: parsed.conceptos,
      dudas: parsed.dudas,
      texto_crudo: texto.trim(),
      estado_parseo: estado,
    });

    const paso = tipo === 'evaluacion' ? 'evaluar' : 'apuntes';
    setProgreso(actividadId(modulo.id, paso), modulo.id, paso, 'completada');
    setMsg({ ok: true, texto: nota != null ? `¡Guardado! Nota ${nota.toFixed(1)}` : '¡Guardado!' });
    setTexto('');
    setNotaManual('');
    setTemasManual('');
  }

  return (
    <div className="pegar-panel">
      <p className="pegar-instruccion">
        1. Pega este prompt en el <strong>mismo chat</strong> para obtener tus resultados en un formato
        simple:
      </p>
      <CopyButton text={promptResultado} label="Copiar prompt de resultados" icono="🧾" />
      <p className="pegar-instruccion">
        2. Pega aquí la respuesta (el bloque JSON). Si no lo lee, completa la nota a mano.
      </p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Pega aquí el texto de tu agente de IA…"
        rows={6}
      />
      <div className="pegar-manual">
        {tipo === 'evaluacion' ? (
          <label>
            Nota (1–7)
            <input
              value={notaManual}
              onChange={(e) => setNotaManual(e.target.value)}
              inputMode="decimal"
              placeholder="ej. 5.5"
            />
          </label>
        ) : null}
        <label>
          {tipo === 'evaluacion' ? 'Temas a reforzar (separados por coma)' : 'Notas / dudas (separadas por coma)'}
          <input
            value={temasManual}
            onChange={(e) => setTemasManual(e.target.value)}
            placeholder={tipo === 'evaluacion' ? 'ej. tópicos literarios, intertextualidad' : 'ej. repasar X, preguntar Y'}
          />
        </label>
      </div>
      {msg ? <div className={msg.ok ? 'msg-ok' : 'msg-error'}>{msg.texto}</div> : null}
      <button className="btn btn-primario" onClick={guardar}>
        💾 Guardar
      </button>
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

      {nota != null ? (
        <div className={`banner ${aprobado ? 'banner-ok' : 'banner-mal'}`}>
          {aprobado ? '🎉 ¡Módulo aprobado!' : '🔁 Reprobado, a repasar'}
          {nota != null ? ` — nota ${nota.toFixed(1)}` : ''}
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

      {/* Paso 1 · Estudiar */}
      <section className={`tarjeta paso ${estudiarHecho ? 'paso-hecho' : ''}`}>
        <div className="paso-cabecera">
          <span className="paso-numero">1</span>
          <div className="paso-cuerpo">
            <h3>Estudiar el tema 📚</h3>
            <p className="paso-desc">Aprende con tu agente de IA y marca este paso cuando termines.</p>
          </div>
          <span className={`paso-estado ${estudiarHecho ? 'ok' : ''}`}>
            {estudiarHecho ? '✓ Listo' : 'Pendiente'}
          </span>
        </div>
        <div className="paso-acciones">
          <button className="btn btn-secundario" onClick={() => setModal({ titulo: 'Prompt de estudio', texto: promptEstudiar })}>
            👀 Ver prompt
          </button>
          <CopyButton text={promptEstudiar} label="Copiar prompt de estudio" />
        </div>
        <div className="paso-pie">
          {estudiarHecho ? (
            <button
              className="btn btn-suave"
              onClick={() => setProgreso(actividadId(modulo.id, 'estudiar'), modulo.id, 'estudiar', 'pendiente')}
            >
              ↩️ Desmarcar (aún no termino)
            </button>
          ) : (
            <button
              className="btn btn-primario"
              onClick={() => setProgreso(actividadId(modulo.id, 'estudiar'), modulo.id, 'estudiar', 'completada')}
            >
              ✅ Ya estudié, desbloquear evaluación
            </button>
          )}
        </div>
      </section>

      {/* Paso 2 · Evaluar */}
      <section className={`tarjeta paso ${!estudiarHecho ? 'paso-bloqueado' : ''} ${aprobado ? 'paso-aprobado' : ''}`}>
        <div className="paso-cabecera">
          <span className="paso-numero">2</span>
          <div className="paso-cuerpo">
            <h3>Evaluarte 🧪</h3>
            <p className="paso-desc">Simula el examen (25 preguntas, nota 1–7) y guarda tu resultado.</p>
          </div>
          <span className={`paso-estado ${aprobado ? 'ok' : reprobado ? 'mal' : ''}`}>
            {aprobado ? '🎉 Aprobado' : reprobado ? '🔁 Repasar' : !estudiarHecho ? '🔒 Bloqueado' : 'Listo para evaluar'}
          </span>
        </div>

        {!estudiarHecho ? (
          <div className="paso-lock">🔒 Termina de estudiar (paso 1) para desbloquear la evaluación.</div>
        ) : (
          <>
            <div className="paso-acciones">
              <button className="btn btn-secundario" onClick={() => setModal({ titulo: 'Prompt de evaluación', texto: promptEvaluar })}>
                👀 Ver prompt
              </button>
              <CopyButton text={promptEvaluar} label="Copiar prompt de evaluación" />
            </div>
            <p className="paso-nota-chat">💡 Puedes usar un chat nuevo: el prompt ya trae todo el contexto del tema.</p>

            {reprobado ? (
              <div className="paso-repasar">
                <CopyButton text={promptRepasar} label="Copiar prompt de repasar" icono="📖" className="btn-copiar-repasar" />
                <button
                  className="btn btn-suave"
                  onClick={() => setProgreso(actividadId(modulo.id, 'estudiar'), modulo.id, 'estudiar', 'pendiente')}
                >
                  ↩️ Volver a estudiar
                </button>
              </div>
            ) : null}

            <button className="btn btn-suave" onClick={() => setPanelEval((v) => !v)}>
              📥 {panelEval ? 'Cerrar' : 'Guardar mi resultado'}
            </button>
            {panelEval ? (
              <PanelResultado modulo={modulo} cursoId={cursoId} tipo="evaluacion" promptResultado={promptResultadoEval} />
            ) : null}
          </>
        )}
      </section>

      {/* Paso 3 · Apuntes */}
      <section className="tarjeta paso">
        <div className="paso-cabecera">
          <span className="paso-numero">3</span>
          <div className="paso-cuerpo">
            <h3>Crear apuntes 📝</h3>
            <p className="paso-desc">Resume lo aprendido y guarda tus apuntes (opcional).</p>
          </div>
          <span className="paso-estado">
            {progreso[actividadId(modulo.id, 'apuntes')] === 'completada' ? '✓ Listo' : 'Opcional'}
          </span>
        </div>
        <div className="paso-acciones">
          <button className="btn btn-secundario" onClick={() => setModal({ titulo: 'Prompt de apuntes', texto: promptApuntes })}>
            👀 Ver prompt
          </button>
          <CopyButton text={promptApuntes} label="Copiar prompt de apuntes" />
        </div>
        <button className="btn btn-suave" onClick={() => setPanelApuntes((v) => !v)}>
          📥 {panelApuntes ? 'Cerrar' : 'Guardar mis apuntes'}
        </button>
        {panelApuntes ? (
          <PanelResultado modulo={modulo} cursoId={cursoId} tipo="resumen" promptResultado={promptResultadoApuntes} />
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
          <CopyButton text={modal?.texto ?? ''} label="Copiar prompt" className="btn-copiar" />
        </div>
      </Modal>
    </div>
  );
}
