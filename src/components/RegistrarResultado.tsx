import { useState } from 'react';
import { actividadId, insertRegistro, setProgreso } from '../db/queries';
import { parsearRegistro } from '../lib/parser';
import { CopyButton } from './ui';

function splitComa(s: string): string[] {
  return s.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
}

function clampNota(s: string): number | null {
  const n = Number(s.replace(',', '.'));
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.min(7, Math.max(1, n)) * 10) / 10;
}

// Panel para pegar el bloque JSON de la IA y guardarlo como registro.
// `moduloId` es el id bajo el cual se guarda (módulo o ensayo de asignatura).
export default function RegistrarResultado({
  moduloId,
  cursoId,
  tipo,
  codigo,
  promptResultado,
  marcarPaso,
}: {
  moduloId: string;
  cursoId: string;
  tipo: 'evaluacion' | 'resumen';
  codigo: string;
  promptResultado: string;
  marcarPaso?: { moduloId: string; paso: string };
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
    const parsed = parsearRegistro(texto, tipo, codigo);
    const nota = parsed.nota ?? clampNota(notaManual);
    const temasA = parsed.temasAReforzar.length ? parsed.temasAReforzar : splitComa(temasManual);
    const estado: 'ok' | 'manual' | 'sin_parsear' =
      parsed.estadoParseo === 'ok' ? 'ok' : notaManual || temasManual ? 'manual' : 'sin_parsear';

    insertRegistro({
      modulo_id: moduloId,
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

    if (marcarPaso) {
      setProgreso(actividadId(marcarPaso.moduloId, marcarPaso.paso), marcarPaso.moduloId, marcarPaso.paso, 'completada');
    }

    setMsg({ ok: true, texto: nota != null ? `¡Guardado! Nota ${nota.toFixed(1)}` : '¡Guardado!' });
    setTexto('');
    setNotaManual('');
    setTemasManual('');
  }

  return (
    <div className="resultado-area">
      <div className="sub-paso">
        <span className="sub-paso-num">1</span>
        <p className="sub-paso-texto">
          Copia este prompt y pégalo en el <strong>mismo chat</strong> para obtener tus resultados:
        </p>
      </div>
      <CopyButton className="btn btn-secundario btn-ancho" text={promptResultado} label="Copiar prompt de resultados" icono="🧾" />

      <div className="sub-paso">
        <span className="sub-paso-num">2</span>
        <p className="sub-paso-texto">Pega aquí la respuesta (el bloque JSON) y guarda:</p>
      </div>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Pega aquí el texto de tu agente de IA…"
        rows={5}
      />
      <div className="pegar-manual">
        {tipo === 'evaluacion' ? (
          <label>
            Nota (1–7, si no se leyó)
            <input value={notaManual} onChange={(e) => setNotaManual(e.target.value)} inputMode="decimal" placeholder="ej. 5.5" />
          </label>
        ) : null}
        <label>
          {tipo === 'evaluacion' ? 'Temas a reforzar' : 'Notas / dudas'}
          <input
            value={temasManual}
            onChange={(e) => setTemasManual(e.target.value)}
            placeholder={tipo === 'evaluacion' ? 'Separados por coma' : 'Separadas por coma'}
          />
        </label>
      </div>
      {msg ? <div className={msg.ok ? 'msg-ok' : 'msg-error'}>{msg.texto}</div> : null}
      <button className="btn btn-primario btn-ancho" onClick={guardar}>
        💾 Guardar
      </button>
    </div>
  );
}
