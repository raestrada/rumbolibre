import type { AsignaturaRow, ModuloFull, RegistroRow } from '../db/queries';
import { NOTA_APROBACION } from '../data/tipos';
import { getOrdenModulos } from '../data/orden';
import { chatJSON, type MensajeIA } from './openrouter';

export interface ModalidadDef {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
  factorSugerido: number;
}

export const MODALIDADES: ModalidadDef[] = [
  {
    id: 'deporte',
    icono: '🏅',
    nombre: 'Deporte serio',
    descripcion: 'Entrenamientos frecuentes, partidos, torneos o alto rendimiento.',
    factorSugerido: 0.65,
  },
  {
    id: 'musica',
    icono: '🎵',
    nombre: 'Música seria',
    descripcion: 'Conservatorio, práctica diaria de instrumento, ensayos o conciertos.',
    factorSugerido: 0.65,
  },
  {
    id: 'arte',
    icono: '🎨',
    nombre: 'Arte serio / danza / teatro',
    descripcion: 'Talleres intensivos, ensayos escénicos, exposiciones o montajes.',
    factorSugerido: 0.7,
  },
  {
    id: 'tecnologia',
    icono: '💻',
    nombre: 'Programación / robótica',
    descripcion: 'Clubes de ciencia, olimpíadas, proyectos o cursos técnicos.',
    factorSugerido: 0.75,
  },
  {
    id: 'idiomas',
    icono: '🌍',
    nombre: 'Idiomas / academia',
    descripcion: 'Clases extracurriculares de idiomas o preparación de certificaciones.',
    factorSugerido: 0.8,
  },
  {
    id: 'familia',
    icono: '🏠',
    nombre: 'Apoyo familiar / trabajo',
    descripcion: 'Responsabilidades en casa, cuidado de hermanos o emprendimiento.',
    factorSugerido: 0.65,
  },
  {
    id: 'otro',
    icono: '✨',
    nombre: 'Otra actividad',
    descripcion: 'Cualquier otra disciplina o compromiso importante de tu semana.',
    factorSugerido: 0.75,
  },
];

export interface CalendarioConfig {
  fechaInicio: string; // YYYY-MM-DD
  fechaPrueba: string; // YYYY-MM-DD
  modalidades: string[];
  otraModalidad?: string;
  factorTiempo: number; // 0.25 .. 1.0
  horasSemanales: number; // 3 .. 30
  diasEstudio: number[]; // 0 (Dom) .. 6 (Sab)
  resumenIA?: string;
  recomendaciones?: string[];
  entrevistaCompletada?: boolean;
}

export type TipoTareaCalendario = 'estudio' | 'repaso' | 'ensayo' | 'repaso_final' | 'examen';

export interface TareaCalendario {
  id: string;
  tipo: TipoTareaCalendario;
  titulo: string;
  subtitulo: string;
  icono: string;
  color?: string;
  moduloId?: string;
  asignaturaId?: string;
  completada: boolean;
}

export interface DiaCalendario {
  fecha: string; // YYYY-MM-DD
  diaSemana: number; // 0..6
  esDiaEstudio: boolean;
  esHoy: boolean;
  esInicio: boolean;
  esPrueba: boolean;
  tareas: TareaCalendario[];
}

export type Viabilidad = 'holgado' | 'equilibrado' | 'exigente' | 'muy_apretado';

export interface PlanCalendario {
  valido: boolean;
  error?: string;
  dias: DiaCalendario[];
  diasTotales: number;
  diasEstudioDisponibles: number;
  modulosTotales: number;
  modulosAprobados: number;
  modulosPorHacer: number;
  modulosPorRepasar: number;
  ensayosPendientes: number;
  ritmoSemanal: number;
  horasPorModulo: number;
  viabilidad: Viabilidad;
  mensajeViabilidad: string;
}

export interface TurnoEntrevista {
  role: 'user' | 'assistant';
  content: string;
}

export interface RespuestaEntrevistaIA {
  listo: boolean;
  pregunta?: string;
  opciones_rapidas?: string[];
  resumen_entendido?: string;
  factor_tiempo?: number;
  horas_semanales?: number;
  dias_estudio?: number[];
  explicacion_factor?: string;
  recomendaciones?: string[];
}

export function hoyISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function sumarDiasISO(fechaISO: string, dias: number): string {
  const d = new Date(fechaISO + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function estimarFactorBase(modalidadIds: string[]): { factor: number; horas: number } {
  if (modalidadIds.length === 0) return { factor: 1.0, horas: 15 };
  let factor = 1.0;
  for (const id of modalidadIds) {
    const def = MODALIDADES.find((m) => m.id === id);
    const f = def ? def.factorSugerido : 0.75;
    // Penalización acumulativa moderada cuando se combinan varias modalidades
    factor *= f;
  }
  factor = Math.max(0.25, Math.min(1.0, Math.round(factor * 100) / 100));
  const horas = Math.max(4, Math.round(15 * factor));
  return { factor, horas };
}

export function generarPlanCalendario(params: {
  cursoId: string;
  cfg: CalendarioConfig;
  asignaturas: AsignaturaRow[];
  modulosPorAsig: Map<string, ModuloFull[]>;
  registros: RegistroRow[];
  ensayosNotas: Map<string, number | null>;
}): PlanCalendario {
  const { cursoId, cfg, asignaturas, modulosPorAsig, registros, ensayosNotas } = params;

  const empty = (error: string): PlanCalendario => ({
    valido: false,
    error,
    dias: [],
    diasTotales: 0,
    diasEstudioDisponibles: 0,
    modulosTotales: 0,
    modulosAprobados: 0,
    modulosPorHacer: 0,
    modulosPorRepasar: 0,
    ensayosPendientes: 0,
    ritmoSemanal: 0,
    horasPorModulo: 1.5,
    viabilidad: 'equilibrado',
    mensajeViabilidad: error,
  });

  if (!cfg.fechaInicio || !cfg.fechaPrueba) {
    return empty('Define una fecha de inicio y una fecha de prueba para calcular tu calendario.');
  }
  const start = new Date(cfg.fechaInicio + 'T00:00:00');
  const end = new Date(cfg.fechaPrueba + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return empty('Una de las fechas ingresadas no es válida.');
  }
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
  if (diffDays < 2) {
    return empty('La fecha de prueba debe ser al menos 2 días posterior a la fecha de inicio.');
  }

  const diasEstudioSet = new Set(cfg.diasEstudio.length > 0 ? cfg.diasEstudio : [1, 2, 3, 4, 5]);

  // Ordenar módulos según el orden pedagógico del curso
  const modulosMap = new Map<string, { modulo: ModuloFull; asig: AsignaturaRow }>();
  for (const a of asignaturas) {
    for (const m of modulosPorAsig.get(a.id) ?? []) {
      modulosMap.set(m.id, { modulo: m, asig: a });
    }
  }
  const ordenIds = getOrdenModulos(cursoId);
  const ordenados: { modulo: ModuloFull; asig: AsignaturaRow }[] = [];
  const vistos = new Set<string>();
  for (const id of ordenIds) {
    const item = modulosMap.get(id);
    if (item) {
      ordenados.push(item);
      vistos.add(id);
    }
  }
  for (const [id, item] of modulosMap) {
    if (!vistos.has(id)) ordenados.push(item);
  }

  // Última nota por módulo
  const ultimaNota = new Map<string, number | null>();
  for (const r of registros) {
    if (r.tipo === 'evaluacion' && !ultimaNota.has(r.modulo_id)) {
      ultimaNota.set(r.modulo_id, r.nota);
    }
  }

  const porRepasar: TareaCalendario[] = [];
  const porEstudiar: TareaCalendario[] = [];
  let aprobados = 0;

  for (const { modulo, asig } of ordenados) {
    const nota = ultimaNota.get(modulo.id);
    if (nota != null && nota >= NOTA_APROBACION) {
      aprobados += 1;
      continue;
    }
    if (nota != null && nota < NOTA_APROBACION) {
      porRepasar.push({
        id: `rep-${modulo.id}`,
        tipo: 'repaso',
        titulo: `${modulo.codigo} — ${modulo.titulo}`,
        subtitulo: `${asig.nombre} · Repasar (nota ${nota.toFixed(1)})`,
        icono: asig.icono || '🔁',
        color: asig.color,
        moduloId: modulo.id,
        asignaturaId: asig.id,
        completada: false,
      });
    } else {
      porEstudiar.push({
        id: `est-${modulo.id}`,
        tipo: 'estudio',
        titulo: `${modulo.codigo} — ${modulo.titulo}`,
        subtitulo: asig.nombre,
        icono: asig.icono || '📚',
        color: asig.color,
        moduloId: modulo.id,
        asignaturaId: asig.id,
        completada: false,
      });
    }
  }

  const tareasModulos = [...porRepasar, ...porEstudiar];

  // Ensayos generales pendientes (uno por asignatura que no tenga ensayo aprobado)
  const tareasEnsayos: TareaCalendario[] = [];
  for (const a of asignaturas) {
    const notaEnsayo = ensayosNotas.get(a.id) ?? null;
    if (notaEnsayo != null && notaEnsayo >= NOTA_APROBACION) continue;
    tareasEnsayos.push({
      id: `ensayo-${a.id}`,
      tipo: 'ensayo',
      titulo: `Ensayo general · ${a.nombre}`,
      subtitulo: 'Simulacro de 25 preguntas',
      icono: '🎯',
      color: a.color,
      asignaturaId: a.id,
      completada: false,
    });
  }

  // Construir arreglo de días [fechaInicio .. fechaPrueba]
  const hoy = hoyISO();
  const dias: DiaCalendario[] = [];
  const indicesEstudio: number[] = [];

  for (let i = 0; i <= diffDays; i++) {
    const fecha = sumarDiasISO(cfg.fechaInicio, i);
    const d = new Date(fecha + 'T00:00:00');
    const diaSemana = d.getDay();
    const esPrueba = i === diffDays;
    const esDiaEstudio = !esPrueba && diasEstudioSet.has(diaSemana);
    if (esDiaEstudio) indicesEstudio.push(i);
    dias.push({
      fecha,
      diaSemana,
      esDiaEstudio,
      esHoy: fecha === hoy,
      esInicio: i === 0,
      esPrueba,
      tareas: esPrueba
        ? [
            {
              id: 'dia-prueba',
              tipo: 'examen',
              titulo: 'Inicio de Exámenes Libres',
              subtitulo: '¡Éxito! Lleva tu carnet, lápiz y lo permitido por asignatura.',
              icono: '🏁',
              completada: false,
            },
          ]
        : [],
    });
  }

  const diasEstudioDisponibles = indicesEstudio.length;
  if (diasEstudioDisponibles === 0) {
    return empty('No hay días de estudio disponibles entre las fechas seleccionadas con los días elegidos.');
  }

  // Dividir días de estudio en: Fase 1 (módulos) y Fase 2 (ensayos y repaso final)
  let diasFaseEnsayos = 0;
  if (tareasEnsayos.length > 0 && diasEstudioDisponibles > tareasModulos.length + 1) {
    const idealEnsayos = Math.max(tareasEnsayos.length, Math.round(diasEstudioDisponibles * 0.18));
    diasFaseEnsayos = Math.min(idealEnsayos, Math.max(1, diasEstudioDisponibles - Math.min(tareasModulos.length, diasEstudioDisponibles - 1)));
  } else if (tareasEnsayos.length > 0 && diasEstudioDisponibles >= 2) {
    diasFaseEnsayos = Math.min(tareasEnsayos.length, Math.max(1, Math.floor(diasEstudioDisponibles * 0.2)));
  }

  const diasFaseEstudio = Math.max(1, diasEstudioDisponibles - diasFaseEnsayos);
  const indicesFase1 = indicesEstudio.slice(0, diasFaseEstudio);
  const indicesFase2 = indicesEstudio.slice(diasFaseEstudio);

  // Asignar módulos en Fase 1
  if (tareasModulos.length > 0) {
    if (indicesFase1.length >= tareasModulos.length) {
      for (let t = 0; t < tareasModulos.length; t++) {
        const slot = Math.floor((t * indicesFase1.length) / tareasModulos.length);
        dias[indicesFase1[slot]].tareas.push(tareasModulos[t]);
      }
    } else {
      for (let t = 0; t < tareasModulos.length; t++) {
        const slot = Math.floor((t * indicesFase1.length) / tareasModulos.length);
        dias[indicesFase1[slot]].tareas.push(tareasModulos[t]);
      }
    }
  }

  // Asignar ensayos y repaso final en Fase 2
  if (indicesFase2.length > 0) {
    for (let e = 0; e < tareasEnsayos.length; e++) {
      const slot = Math.floor((e * indicesFase2.length) / Math.max(1, tareasEnsayos.length));
      dias[indicesFase2[slot]].tareas.push(tareasEnsayos[e]);
    }
    for (const idx of indicesFase2) {
      if (dias[idx].tareas.length === 0) {
        dias[idx].tareas.push({
          id: `repfinal-${dias[idx].fecha}`,
          tipo: 'repaso_final',
          titulo: 'Repaso general y consolidación',
          subtitulo: 'Revisa tus apuntes y temas débiles antes de la prueba.',
          icono: '✨',
          completada: false,
        });
      }
    }
  } else if (tareasEnsayos.length > 0 && indicesEstudio.length > 0) {
    const ultimoIdx = indicesEstudio[indicesEstudio.length - 1];
    for (const ens of tareasEnsayos) {
      dias[ultimoIdx].tareas.push(ens);
    }
  }

  // Calcular métricas y viabilidad
  const semanas = Math.max(1, diffDays / 7);
  const totalUnidades = tareasModulos.length + tareasEnsayos.length;
  const ritmoSemanal = Math.round((totalUnidades / semanas) * 10) / 10;

  // Estimación de horas por módulo (~1.5h para estudiar + evaluar)
  const horasPorModulo = 1.5;
  const horasNecesariasSemana = ritmoSemanal * horasPorModulo;
  const horasDisponibles = Math.max(1, cfg.horasSemanales);
  const ratioCarga = horasNecesariasSemana / horasDisponibles;

  let viabilidad: Viabilidad = 'equilibrado';
  let mensajeViabilidad = '';

  if (totalUnidades === 0) {
    viabilidad = 'holgado';
    mensajeViabilidad = '¡Ya aprobaste todos los módulos y ensayos! Usa estos días para repasar con calma.';
  } else if (ratioCarga <= 0.7) {
    viabilidad = 'holgado';
    mensajeViabilidad = `Vas con muy buen margen: necesitas ~${ritmoSemanal} actividades/semana (${horasNecesariasSemana.toFixed(1)} h/sem) y tienes ${horasDisponibles} h/sem disponibles.`;
  } else if (ratioCarga <= 1.05) {
    viabilidad = 'equilibrado';
    mensajeViabilidad = `Plan equilibrado: con ${ritmoSemanal} actividades/semana (${horasNecesariasSemana.toFixed(1)} h/sem) alcanzas a cubrir todo y mantener tus actividades.`;
  } else if (ratioCarga <= 1.4) {
    viabilidad = 'exigente';
    mensajeViabilidad = `Ritmo exigente: requiere ~${horasNecesariasSemana.toFixed(1)} h/sem frente a tus ${horasDisponibles} h/sem estimadas. Conviene aprovechar bien los bloques de repaso.`;
  } else {
    viabilidad = 'muy_apretado';
    mensajeViabilidad = `Calendario muy apretado: se necesitan ~${horasNecesariasSemana.toFixed(1)} h/sem y hoy dispones de ${horasDisponibles} h/sem. Considera sumar un día de estudio o adelantar módulos los fines de semana.`;
  }

  return {
    valido: true,
    dias,
    diasTotales: diffDays + 1,
    diasEstudioDisponibles,
    modulosTotales: ordenados.length,
    modulosAprobados: aprobados,
    modulosPorHacer: porEstudiar.length,
    modulosPorRepasar: porRepasar.length,
    ensayosPendientes: tareasEnsayos.length,
    ritmoSemanal,
    horasPorModulo,
    viabilidad,
    mensajeViabilidad,
  };
}

const SCHEMA_ENTREVISTA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    listo: { type: 'boolean' },
    pregunta: { type: 'string' },
    opciones_rapidas: { type: 'array', items: { type: 'string' } },
    resumen_entendido: { type: 'string' },
    factor_tiempo: { type: 'number' },
    horas_semanales: { type: 'number' },
    dias_estudio: { type: 'array', items: { type: 'integer' } },
    explicacion_factor: { type: 'string' },
    recomendaciones: { type: 'array', items: { type: 'string' } },
  },
  required: ['listo'],
};

export async function avanzarEntrevistaCalendario(opts: {
  key: string;
  model: string;
  structured: boolean;
  json: boolean;
  cursoNombre: string;
  modalidades: string[];
  otraModalidad?: string;
  fechaInicio: string;
  fechaPrueba: string;
  modulosRestantes: number;
  historial: TurnoEntrevista[];
}): Promise<RespuestaEntrevistaIA> {
  const descModalidades = opts.modalidades
    .map((id) => {
      const m = MODALIDADES.find((x) => x.id === id);
      if (!m) return id;
      if (id === 'otro' && opts.otraModalidad?.trim()) {
        return `${m.nombre} (${opts.otraModalidad.trim()})`;
      }
      return `${m.nombre}: ${m.descripcion}`;
    })
    .join('; ');

  const preguntasHechas = opts.historial.filter((h) => h.role === 'assistant').length;

  const sys = `Eres un tutor amigable y práctico de Rumbo Libre (Chile) ayudando a un/a estudiante de ${opts.cursoNombre} que prepara sus Exámenes Libres MINEDUC.
Contexto actual:
- Fecha de inicio: ${opts.fechaInicio}
- Fecha de prueba: ${opts.fechaPrueba}
- Módulos pendientes + repasos por cubrir: ${opts.modulosRestantes}
- Modalidades / compromisos seleccionados: ${descModalidades || 'Ninguno especial (disponibilidad estándar)'}
- Preguntas realizadas hasta ahora: ${preguntasHechas}

Tu misión:
1. Hacer preguntas cortas, concretas y amables, UNA por turno, para entender realmente cuánto tiempo dedica a cada modalidad seleccionada (por ejemplo, si eligió deporte y música, indagar días y horas de entrenamiento, días de práctica musical, si tiene torneos/conciertos/competencias antes de la prueba, qué días de la semana tiene más libres, y si puede estudiar fines de semana).
2. Cuando ya tengas suficiente información (normalmente tras 2 a 4 respuestas del estudiante, y OBLIGATORIAMENTE cuando preguntasHechas >= 4), responde con "listo": true y entrega la estimación final:
   - "factor_tiempo": número entre 0.25 y 1.0 (1.0 = ~15-18h semanales libres para estudiar; 0.5 = ~7-8h semanales; 0.35 = ~5h semanales).
   - "horas_semanales": número realista de horas de estudio semanales que puede sostener (entre 3 y 25).
   - "dias_estudio": arreglo de enteros 0..6 (0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado) con los días recomendados para estudiar.
   - "explicacion_factor": explicación breve y motivadora de por qué estimaste ese factor y cómo se adapta a sus compromisos.
   - "recomendaciones": 2 a 4 consejos prácticos concretos para equilibrar sus actividades con el estudio y repaso.
3. Si aún necesitas preguntar ("listo": false):
   - "pregunta": una sola pregunta clara y directa en español chileno cercano (sin ser infantil).
   - "opciones_rapidas": 2 a 4 respuestas cortas posibles para facilitar responder con un clic (el estudiante igual podrá escribir texto libre).
   - "resumen_entendido": opcional, 1 frase breve confirmando lo que ya entendiste.

Responde SIEMPRE en JSON válido acorde al esquema.`;

  const messages: MensajeIA[] = [
    { role: 'system', content: sys },
    ...(opts.historial.length === 0
      ? [
          {
            role: 'user' as const,
            content:
              'Hola, ayúdame a estimar cuánto tiempo real tengo para estudiar según mis actividades y armar mi calendario.',
          },
        ]
      : opts.historial),
  ];

  const raw = await chatJSON({
    key: opts.key,
    model: opts.model,
    messages,
    schema: SCHEMA_ENTREVISTA,
    structured: opts.structured,
    json: opts.json,
  });

  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const listo = Boolean(obj.listo) || preguntasHechas >= 4;

  const diasRaw = Array.isArray(obj.dias_estudio)
    ? obj.dias_estudio.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
    : [];

  return {
    listo,
    pregunta: typeof obj.pregunta === 'string' ? obj.pregunta : undefined,
    opciones_rapidas: Array.isArray(obj.opciones_rapidas)
      ? obj.opciones_rapidas.filter((x): x is string => typeof x === 'string').slice(0, 4)
      : undefined,
    resumen_entendido: typeof obj.resumen_entendido === 'string' ? obj.resumen_entendido : undefined,
    factor_tiempo:
      typeof obj.factor_tiempo === 'number'
        ? Math.max(0.25, Math.min(1.0, obj.factor_tiempo))
        : undefined,
    horas_semanales:
      typeof obj.horas_semanales === 'number'
        ? Math.max(3, Math.min(30, Math.round(obj.horas_semanales)))
        : undefined,
    dias_estudio: diasRaw.length > 0 ? diasRaw : undefined,
    explicacion_factor: typeof obj.explicacion_factor === 'string' ? obj.explicacion_factor : undefined,
    recomendaciones: Array.isArray(obj.recomendaciones)
      ? obj.recomendaciones.filter((x): x is string => typeof x === 'string')
      : undefined,
  };
}
