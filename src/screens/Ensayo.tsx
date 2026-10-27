import { useState } from 'react';
import { useNav } from '../App';
import {
  ensayoId,
  getAsignatura,
  getCursoActivoId,
  getEnsayoNota,
  getModulos,
  getRegistros,
} from '../db/queries';
import { NOTA_APROBACION } from '../data/tipos';
import { buildPromptEnsayo, buildPromptResultadoEvaluacion, datosEnsayo } from '../lib/prompts';
import { Chip, CopyButton, Modal } from '../components/ui';
import RegistrarResultado from '../components/RegistrarResultado';

export default function Ensayo({ asignaturaId }: { asignaturaId: string }): JSX.Element {
  const { go } = useNav();
  const asig = getAsignatura(asignaturaId);
  if (!asig) {
    return (
      <div className="pantalla">
        <p>Asignatura no encontrada.</p>
      </div>
    );
  }
  const cursoId = getCursoActivoId();
  const modulos = getModulos(asig.id);

  const [panel, setPanel] = useState(false);
  const [modal, setModal] = useState<{ titulo: string; texto: string } | null>(null);

  const prompt = buildPromptEnsayo(asig.nombre, asig.ejes, modulos, asig.codigo);
  const datos = datosEnsayo(asig);
  const promptResultado = buildPromptResultadoEvaluacion(datos);

  const ensayoNota = getEnsayoNota(asig.id);
  const aprobado = ensayoNota != null && ensayoNota >= NOTA_APROBACION;

  // Aprobados / total de módulos (última nota por módulo).
  const ultima = new Map<string, number | null>();
  for (const r of getRegistros(cursoId)) {
    if (r.tipo === 'evaluacion' && !ultima.has(r.modulo_id)) ultima.set(r.modulo_id, r.nota);
  }
  const aprobados = modulos.filter((m) => (ultima.get(m.id) ?? null) != null && (ultima.get(m.id) as number) >= NOTA_APROBACION).length;

  return (
    <div className="pantalla">
      <button className="btn-volver" onClick={() => go({ name: 'ruta', asignaturaId: asig.id })}>
        ← Volver a {asig.nombre}
      </button>

      <header className="cabecera cabecera-modulo">
        <div className="modulo-codigo">
          <Chip color={asig.color}>Ensayo general</Chip>
        </div>
        <h1>
          {asig.icono} {asig.nombre}
        </h1>
        <p className="cabecera-sub">
          {asig.ejes.join(' · ')} · {aprobados} de {modulos.length} módulos aprobados
        </p>
      </header>

      {ensayoNota != null ? (
        <div className={`banner ${aprobado ? 'banner-ok' : 'banner-mal'}`}>
          {aprobado ? '🎉 ¡Ensayo general aprobado!' : '🔁 Ensayo general reprobado'} — nota{' '}
          {ensayoNota.toFixed(1)}
        </div>
      ) : null}

      {aprobados < modulos.length ? (
        <div className="banner banner-info">
          💡 Lo ideal es hacerlo cuando apruebes todos los módulos de esta asignatura. Igual puedes practicar.
        </div>
      ) : (
        <div className="banner banner-ok">✅ ¡Tienes todos los módulos aprobados! Hora del ensayo final.</div>
      )}

      <section className="tarjeta">
        <h2 className="seccion-titulo">Ensayo general (25 preguntas)</h2>
        <p className="modulo-descripcion">
          Un examen que <strong>mezcla todos los temas</strong> de {asig.nombre}, igual al real. Copia el
          prompt y pégalo en tu agente de IA.
        </p>

        <div className="paso-acciones">
          <button className="btn btn-ghost" onClick={() => setModal({ titulo: 'Prompt del ensayo general', texto: prompt })}>
            Ver prompt
          </button>
          <CopyButton className="btn btn-primario" text={prompt} label="Copiar prompt del ensayo" />
        </div>
        <p className="paso-nota-chat">💡 Puedes usar un chat nuevo: el prompt trae todos los temas de la asignatura.</p>

        <div className="resultado-toggle">
          <button className="btn btn-secundario btn-ancho" onClick={() => setPanel((v) => !v)}>
            📥 {panel ? 'Ocultar' : 'Registrar mi resultado'}
          </button>
        </div>
        {panel ? (
          <RegistrarResultado
            moduloId={ensayoId(asig.id)}
            cursoId={cursoId}
            tipo="evaluacion"
            codigo={datos.codigo}
            promptResultado={promptResultado}
          />
        ) : null}
      </section>

      <Modal abierto={modal != null} titulo={modal?.titulo ?? ''} onCerrar={() => setModal(null)} ancho={680}>
        <p className="modal-hint">Copia este prompt y pégalo en tu agente de IA (Gemini, Claude, etc.).</p>
        <pre className="prompt-box">{modal?.texto}</pre>
        <div className="modal-acciones">
          <CopyButton className="btn btn-primario" text={modal?.texto ?? ''} label="Copiar prompt" />
        </div>
      </Modal>
    </div>
  );
}
