import { useNav } from '../App';
import { getAsignatura, getModulo, getRegistrosDeModulo } from '../db/queries';
import { NOTA_APROBACION } from '../data/tipos';
import { notaColor } from '../lib/parser';
import { Chip, EmptyState } from '../components/ui';
import OpenRouterInfo from '../components/OpenRouterInfo';

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
  const registros = getRegistrosDeModulo(moduloId);
  const evaluaciones = registros.filter((r) => r.tipo === 'evaluacion');
  const ultima = evaluaciones[0];
  const nota = ultima?.nota ?? null;
  const aprobado = nota != null && nota >= NOTA_APROBACION;
  const reprobado = nota != null && nota < NOTA_APROBACION;
  const temas = ultima?.temas_a_reforzar ?? [];

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
          {aprobado ? '🎉 ¡Módulo aprobado!' : '🔁 Reprobado, a repasar'} — nota {nota.toFixed(1)}
        </div>
      ) : null}

      <section className="tarjeta ia-hero">
        <div className="ia-hero-icono">🤖</div>
        <div className="ia-hero-cuerpo">
          <strong>Estudiar y evaluarme con IA</strong>
          <p>
            Tu agente te explica punto por punto, te hace preguntas y te evalúa. La app controla el contexto y
            tu avance se guarda solo.
          </p>
          <OpenRouterInfo texto="¿Cómo funciona? ¿Qué es OpenRouter?" />
        </div>
        <button
          className="btn btn-primario"
          onClick={() => go({ name: 'sesionIA', tipo: 'modulo', id: modulo.id })}
        >
          {nota != null ? 'Repetir con IA' : 'Empezar con IA'}
        </button>
      </section>

      {reprobado && temas.length ? (
        <div className="banner banner-info">🔁 Repasa: {temas.slice(0, 4).join(' · ')}</div>
      ) : null}

      <details className="acordeon">
        <summary>
          <span>Qué se evalúa</span>
          <span className="acordeon-flecha">▾</span>
        </summary>
        <div className="acordeon-cuerpo">
          <p className="modulo-descripcion">{modulo.descripcion}</p>
          <ul className="indicadores">
            {modulo.indicadores.map((ind, i) => (
              <li key={i}>{ind}</li>
            ))}
          </ul>
        </div>
      </details>

      <h2 className="seccion-titulo">Tu historial aquí</h2>
      {registros.length === 0 ? (
        <EmptyState
          icono="📭"
          titulo="Sin registros todavía"
          texto="Cuando hagas tu sesión con IA, la evaluación aparecerá aquí."
        />
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
    </div>
  );
}
