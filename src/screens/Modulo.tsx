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
import type { Actividad } from '../data/tipos';
import { getPrompt } from '../lib/prompts';
import { parsearRegistro, notaColor } from '../lib/parser';
import { CopyButton, Modal, Chip, EmptyState } from '../components/ui';

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

function ActividadCard({
  modulo,
  asig,
  actividad,
  completada,
  onToggle,
}: {
  modulo: ModuloFull;
  asig: AsignaturaRow;
  actividad: Actividad;
  completada: boolean;
  onToggle: () => void;
}): JSX.Element {
  const cursoId = getCursoActivoId();
  const [verPrompt, setVerPrompt] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [notaManual, setNotaManual] = useState('');
  const [temasManual, setTemasManual] = useState('');
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  const prompt = getPrompt(actividad.tipo, modulo, asig.nombre);
  const esPegable = actividad.tipo === 'practicar' || actividad.tipo === 'evaluar' || actividad.tipo === 'resumir';
  const tipoDefault = actividad.tipo === 'resumir' ? ('resumen' as const) : ('evaluacion' as const);

  function guardar(): void {
    if (!texto.trim() && !notaManual.trim()) {
      setMensaje({ ok: false, texto: 'Pega el texto de tu IA o escribe una nota.' });
      return;
    }
    const parsed = parsearRegistro(texto, tipoDefault, modulo.codigo);
    const nota = parsed.nota ?? clampNota(notaManual);
    const temasA = parsed.temasAReforzar.length ? parsed.temasAReforzar : splitComa(temasManual);
    const estado: 'ok' | 'manual' | 'sin_parsear' =
      parsed.estadoParseo === 'ok' ? 'ok' : notaManual || temasManual ? 'manual' : 'sin_parsear';

    insertRegistro({
      modulo_id: modulo.id,
      curso_id: cursoId,
      tipo: tipoDefault,
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

    setProgreso(actividadId(modulo.id, actividad.tipo), modulo.id, actividad.tipo, 'completada');
    setMensaje({
      ok: true,
      texto: nota != null ? `¡Guardado! Nota ${nota.toFixed(1)}` : '¡Guardado!',
    });
    setTexto('');
    setNotaManual('');
    setTemasManual('');
    setPanelAbierto(false);
  }

  return (
    <div className={`tarjeta actividad ${completada ? 'actividad-hecha' : ''}`}>
      <div className="actividad-cabecera">
        <button
          className={`check ${completada ? 'check-on' : ''}`}
          onClick={onToggle}
          title={completada ? 'Desmarcar' : 'Marcar completada'}
        >
          {completada ? '✓' : ''}
        </button>
        <div className="actividad-titulo">
          <strong>{actividad.titulo}</strong>
          <span className="actividad-desc">{actividad.descripcion}</span>
        </div>
      </div>
      <div className="actividad-acciones">
        <button className="btn btn-secundario" onClick={() => setVerPrompt(true)}>
          👀 Ver prompt
        </button>
        <CopyButton text={prompt} label="Copiar prompt" className="btn-copiar" />
        {esPegable ? (
          <button className="btn btn-suave" onClick={() => setPanelAbierto((v) => !v)}>
            📥 {panelAbierto ? 'Cerrar' : 'Pegar resultado'}
          </button>
        ) : null}
      </div>

      {esPegable && panelAbierto ? (
        <div className="pegar-panel">
          <p className="pegar-instruccion">
            Pega aquí la respuesta completa de tu IA (con el bloque JSON al final). También puedes
            llenar la nota a mano si el bloque no se leyó.
          </p>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Pega aquí el texto de tu agente de IA…"
            rows={6}
          />
          <div className="pegar-manual">
            <label>
              Nota (1–7)
              <input
                value={notaManual}
                onChange={(e) => setNotaManual(e.target.value)}
                inputMode="decimal"
                placeholder="ej. 5.5"
              />
            </label>
            <label>
              Temas a reforzar (separados por coma)
              <input
                value={temasManual}
                onChange={(e) => setTemasManual(e.target.value)}
                placeholder="ej. tópicos literarios, intertextualidad"
              />
            </label>
          </div>
          {mensaje ? <div className={mensaje.ok ? 'msg-ok' : 'msg-error'}>{mensaje.texto}</div> : null}
          <button className="btn btn-primario" onClick={guardar}>
            💾 Guardar en mi registro
          </button>
        </div>
      ) : null}

      <Modal abierto={verPrompt} titulo={`Prompt · ${actividad.titulo}`} onCerrar={() => setVerPrompt(false)} ancho={620}>
        <p className="modal-hint">Copia este prompt y pégalo en tu agente de IA (Gemini, Claude, etc.).</p>
        <pre className="prompt-box">{prompt}</pre>
        <div className="modal-acciones">
          <CopyButton text={prompt} label="Copiar prompt" className="btn-copiar" />
        </div>
      </Modal>
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
  const progreso = getProgreso();
  const registros = getRegistrosDeModulo(moduloId);

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

      <section className="tarjeta">
        <h2 className="seccion-titulo">Qué se evalúa</h2>
        <p className="modulo-descripcion">{modulo.descripcion}</p>
        <ul className="indicadores">
          {modulo.indicadores.map((ind, i) => (
            <li key={i}>{ind}</li>
          ))}
        </ul>
      </section>

      <h2 className="seccion-titulo">Actividades</h2>
      <div className="lista-actividades">
        {modulo.actividades.map((act) => (
          <ActividadCard
            key={act.tipo}
            modulo={modulo}
            asig={asig!}
            actividad={act}
            completada={progreso[actividadId(modulo.id, act.tipo)] === 'completada'}
            onToggle={() =>
              setProgreso(
                actividadId(modulo.id, act.tipo),
                modulo.id,
                act.tipo,
                progreso[actividadId(modulo.id, act.tipo)] === 'completada' ? 'pendiente' : 'completada',
              )
            }
          />
        ))}
      </div>

      <h2 className="seccion-titulo">Tu historial aquí</h2>
      {registros.length === 0 ? (
        <EmptyState
          icono="📭"
          titulo="Sin registros todavía"
          texto="Cuando pegues una evaluación o unos apuntes, aparecerán aquí."
        />
      ) : (
        <div className="lista">
          {registros.map((r) => (
            <div key={r.id} className="tarjeta fila">
              <span
                className="nota-burbuja"
                style={{ background: r.tipo === 'resumen' ? 'var(--teal)' : notaColor(r.nota) }}
              >
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
    </div>
  );
}
