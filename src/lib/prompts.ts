import type { TipoActividad } from '../data/tipos';

export interface DatosModulo {
  codigo: string;
  titulo: string;
  descripcion: string;
  indicadores: string[];
  eje?: string | null;
}

// Datos sintéticos para el "ensayo general" de una asignatura (no corresponde a un OA puntual).
export function datosEnsayo(asignatura: { id: string; codigo: string; nombre: string }): DatosModulo {
  const nivel = asignatura.id.split('-')[0].toUpperCase();
  return {
    codigo: `${nivel}-${asignatura.codigo}-GENERAL`,
    titulo: 'Ensayo general',
    descripcion: asignatura.nombre,
    indicadores: [],
  };
}

function bullets(items: string[]): string {
  return items.map((i) => `- ${i}`).join('\n');
}

function fence(json: string): string {
  return '```json\n' + json + '\n```';
}

function jsonEvaluacion(codigo: string): string {
  return [
    '{',
    '  "tipo": "evaluacion",',
    `  "modulo": "${codigo}",`,
    '  "nota": 0,',
    '  "preguntas_correctas": 0,',
    '  "preguntas_totales": 0,',
    '  "temas_dominados": [],',
    '  "temas_a_reforzar": [],',
    '  "retroalimentacion": "",',
    '  "siguiente_paso": ""',
    '}',
  ].join('\n');
}

function jsonResumen(codigo: string): string {
  return [
    '{',
    '  "tipo": "resumen",',
    `  "modulo": "${codigo}",`,
    '  "ideas_clave": [],',
    '  "conceptos": [],',
    '  "dudas": []',
    '}',
  ].join('\n');
}

function encabezado(modulo: DatosModulo, asignatura: string): string {
  const eje = modulo.eje ? ` (${modulo.eje})` : '';
  return [
    `Tema: ${modulo.codigo} — ${modulo.titulo}${eje} (asignatura: ${asignatura}).`,
    '',
    'Objetivo de Aprendizaje:',
    modulo.descripcion,
    '',
    'Para lograrlo, debo ser capaz de:',
    bullets(modulo.indicadores),
  ].join('\n');
}

// — Prompts de actividad (estudio / evaluación / apuntes), sin JSON —
// Todos van "de a poco": el agente avanza tema por tema o pregunta por pregunta,
// y consulta antes de seguir, para no chocar con el límite de tokens de salida.

export function buildPromptBusqueda(modulo: DatosModulo, asignatura: string): string {
  return [
    'Actúa como una profesora chilena de 1° medio, cercana, paciente y clara.',
    'Voy a estudiar sola para el examen libre del MINEDUC.',
    '',
    encabezado(modulo, asignatura),
    '',
    'CÓMO TRABAJAR (muy importante, ve de a poco):',
    '1. Empieza explicando SOLO el primer punto o subtema, en un párrafo corto, como si tuviera 14',
    '   años, con un ejemplo de Chile o de mi vida diaria.',
    '2. Después hazme UNA pregunta de comprensión y espera mi respuesta; corrígela si hace falta.',
    '3. Recién entonces pregúntame si quiero: seguir con el siguiente tema, profundizar este o ver',
    '   otro ejemplo. NO me expliques todo de una vez ni en una sola respuesta.',
  ].join('\n');
}

export function buildPromptEvaluar(modulo: DatosModulo, asignatura: string): string {
  return [
    'Actúa como mi profesora examinadora de 1° medio. Vamos a simular el examen libre del MINEDUC.',
    '',
    encabezado(modulo, asignatura),
    '',
    'FORMATO DEL EXAMEN (igual al real):',
    '- Preguntas de opción múltiple con 4 alternativas (a, b, c, d), verdadero/falso, respuesta',
    '  corta o emparejamiento, como los exámenes libres del MINEDUC.',
    '- Me harás hasta 25 preguntas en total, pero de a UNA por vez.',
    '',
    'CÓMO TRABAJAR (muy importante):',
    '1. Hazme UNA sola pregunta por mensaje y espera mi respuesta. NO me des varias preguntas a la',
    '   vez ni en una sola respuesta.',
    '2. Cuando responda, dime si está correcta o no, explica brevemente por qué, y recién entonces',
    '   hazme la siguiente pregunta.',
    '3. Lleva la cuenta de cuántas correctas e incorrectas llevo.',
    '4. Al final, NO me des la nota ni el resumen todavía: te lo pediré en el siguiente mensaje.',
  ].join('\n');
}

export function buildPromptResumir(modulo: DatosModulo, asignatura: string): string {
  return [
    'Actúa como mi tutora. Terminé de estudiar:',
    encabezado(modulo, asignatura),
    '',
    'CÓMO TRABAJAR (ve de a poco):',
    '1. Pregúntame qué aprendí y escucha mi explicación.',
    '2. Sugiere UNA idea clave o concepto por mensaje, y pregúntame si quiero seguir con el',
    '   siguiente. NO intentes resumir todo de una vez.',
  ].join('\n');
}

export function buildPromptRepasar(modulo: DatosModulo, temas: string[]): string {
  const enfoque = temas.length ? bullets(temas) : modulo.descripcion;
  return [
    'Actúa como mi profesora de 1° medio. Me fue mal en la evaluación de este módulo y necesito repasar.',
    '',
    `Módulo: ${modulo.codigo} — ${modulo.titulo}.`,
    '',
    temas.length ? 'Estos son los temas que debo reforzar:' : 'Repasemos el objetivo completo:',
    enfoque,
    '',
    'CÓMO TRABAJAR (ve de a poco):',
    '1. Explícame SOLO el primer tema en un párrafo corto, como si tuviera 14 años, con un ejemplo.',
    '2. Hazme UNA pregunta para comprobar que entendí y corrige si hace falta.',
    '3. Pregúntame si sigo con el siguiente tema. NO lo expliques todo de una vez.',
  ].join('\n');
}

// — Ensayo general (por asignatura) y repaso por asignatura —

export function buildPromptEnsayo(
  asignatura: string,
  ejes: string[],
  modulos: DatosModulo[],
): string {
  const lista = modulos.map((m) => `- ${m.codigo} — ${m.titulo}: ${m.descripcion}`).join('\n');
  return [
    'Actúa como mi profesora examinadora de 1° medio. Vamos a hacer el ENSAYO GENERAL de la',
    `asignatura ${asignatura} (${ejes.join(' · ') || 'asignatura'}), igual al examen libre del MINEDUC.`,
    '',
    'Estos son todos los temas de la asignatura que debo dominar:',
    lista,
    '',
    'FORMATO (igual al real): opción múltiple con 4 alternativas (a, b, c, d), verdadero/falso,',
    'respuesta corta o emparejamiento. 25 preguntas en total, MEZCLANDO todos los temas.',
    '',
    'CÓMO TRABAJAR:',
    '1. Hazme UNA sola pregunta por mensaje y espera mi respuesta; corrígela y recién pasa a la',
    '   siguiente. NO me des todas las preguntas de una vez.',
    '2. Mezcla los temas: no preguntes todo de un tema seguido.',
    '3. Lleva la cuenta de correctas e incorrectas.',
    '4. Al final, NO me des la nota ni el resumen todavía: te lo pediré en el siguiente mensaje.',
  ].join('\n');
}

export function buildPromptRepasarAsignatura(asignatura: string, temas: string[]): string {
  return [
    'Actúa como mi profesora de 1° medio. Antes del examen libre, debo reforzar estos temas de',
    `${asignatura}:`,
    bullets(temas),
    '',
    'CÓMO TRABAJAR (ve de a poco):',
    '1. Explícame SOLO el primer tema en un párrafo corto, como si tuviera 14 años, con un ejemplo.',
    '2. Hazme UNA pregunta para comprobar que entendí y corrige si hace falta.',
    '3. Pregúntame si sigo con el siguiente tema. NO lo expliques todo de una vez.',
  ].join('\n');
}

// — Prompts de "resultados": se copian AL TERMINAR, en el MISMO chat —

export function buildPromptResultadoEvaluacion(modulo: DatosModulo): string {
  return [
    'Ya terminamos la evaluación de este módulo. Ahora resume mis resultados en un formato simple.',
    'Usa la cuenta de correctas e incorrectas que llevamos en esta conversación.',
    '',
    'RESPONDE SOLO CON ESTE BLOQUE JSON, rellenando cada campo y SIN texto fuera de él:',
    '',
    fence(jsonEvaluacion(modulo.codigo)),
    '',
    'Reglas: `nota` en escala 1 a 7 con un decimal (ej. 5.5). `preguntas_totales` es el total de',
    'preguntas que alcanzamos a hacer. `temas_dominados` y `temas_a_reforzar` son listas de frases',
    'cortas.',
  ].join('\n');
}

export function buildPromptResultadoResumen(modulo: DatosModulo): string {
  return [
    'Ya terminamos de repasar este módulo. Ahora resume mis apuntes en un formato simple.',
    '',
    'RESPONDE SOLO CON ESTE BLOQUE JSON, rellenando cada campo y SIN texto fuera de él:',
    '',
    fence(jsonResumen(modulo.codigo)),
    '',
    'Reglas: `ideas_clave` y `conceptos` son listas de frases cortas. `dudas` son preguntas que me',
    'quedaron. Usa lo que conversamos recién.',
  ].join('\n');
}

export function getPrompt(
  tipo: TipoActividad,
  modulo: DatosModulo,
  asignatura: string,
): string {
  switch (tipo) {
    case 'estudiar':
      return buildPromptBusqueda(modulo, asignatura);
    case 'evaluar':
      return buildPromptEvaluar(modulo, asignatura);
    case 'apuntes':
      return buildPromptResumir(modulo, asignatura);
  }
}

export function getPromptResultado(tipo: TipoActividad, modulo: DatosModulo): string | null {
  switch (tipo) {
    case 'evaluar':
      return buildPromptResultadoEvaluacion(modulo);
    case 'apuntes':
      return buildPromptResultadoResumen(modulo);
    default:
      return null;
  }
}
