import { useNav } from '../App';
import { getAsignatura, getCursoActivoId, getEnsayoNota, getModulos, getRegistros } from '../db/queries';
import { NOTA_APROBACION } from '../data/tipos';
import { Chip } from '../components/ui';
import OpenRouterInfo from '../components/OpenRouterInfo';

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
  const ensayoNota = getEnsayoNota(asig.id);
  const aprobado = ensayoNota != null && ensayoNota >= NOTA_APROBACION;

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
          {aprobado ? '🎉 ¡Ensayo general aprobado!' : '🔁 Ensayo general reprobado'} — nota {ensayoNota.toFixed(1)}
        </div>
      ) : null}

      <section className="tarjeta ia-hero">
        <div className="ia-hero-icono">🎯</div>
        <div className="ia-hero-cuerpo">
          <strong>Ensayo general con IA</strong>
          <p>
            25 preguntas, una por vez, mezclando todos los temas de {asig.nombre}. Al final verás tu nota y qué
            repasar.
          </p>
          <OpenRouterInfo texto="¿Cómo funciona? ¿Qué es OpenRouter?" />
        </div>
        <button className="btn btn-primario" onClick={() => go({ name: 'sesionIA', tipo: 'ensayo', id: asig.id })}>
          {ensayoNota != null ? 'Repetir ensayo' : 'Empezar ensayo'}
        </button>
      </section>

      <div className="banner banner-info">
        💡 Lo ideal es hacerlo cuando hayas aprobado los módulos de la asignatura. Igual puedes practicar cuando
        quieras.
      </div>
    </div>
  );
}
