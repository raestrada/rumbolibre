import type { TipoActividad } from '../data/tipos';

export interface DatosModulo {
  codigo: string;
  titulo: string;
  descripcion: string;
  indicadores: string[];
  eje?: string | null;
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
// El resultado estructurado se obtiene con un prompt aparte (getPromptResultado).

export function buildPromptBusqueda(modulo: DatosModulo, asignatura: string): string {
  return [
    'Actúa como una profesora chilena de 1° medio, cercana, paciente y clara.',
    '',
    'Voy a estudiar sola para el examen libre del MINEDUC. Hoy me toca:',
    encabezado(modulo, asignatura),
    '',
    'Explícamelo como si tuviera 14 años, paso a paso, con ejemplos de Chile y de mi vida diaria.',
    'Usa un lenguaje simple y entretenido. Al final, hazme 3 preguntas cortas para comprobar que',
    'entendí y dime si las respondí bien.',
  ].join('\n');
}

export function buildPromptEvaluar(modulo: DatosModulo, asignatura: string): string {
  return [
    'Actúa como mi profesora examinadora de 1° medio. Vamos a simular el examen libre del MINEDUC.',
    '',
    encabezado(modulo, asignatura),
    '',
    'Hazme un examen de 25 preguntas, como el real: opción múltiple, verdadero o falso y respuesta',
    'corta. Hazlo por secciones y al final corrígeme todo. Sé justa y detalla qué debo repasar.',
  ].join('\n');
}

export function buildPromptResumir(modulo: DatosModulo, asignatura: string): string {
  return [
    'Actúa como mi tutora. Terminé de estudiar:',
    encabezado(modulo, asignatura),
    '',
    'Pídeme que te explique con mis palabras lo que aprendí y ayúdame a organizar mis apuntes.',
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
    'Explícamelos de nuevo como si tuviera 14 años, con ejemplos de Chile, y al final hazme 3',
    'preguntas para asegurarte de que ahora sí los entiendo.',
  ].join('\n');
}

// — Prompts de "resultados": se copian AL TERMINAR, en el MISMO chat —
// Son cortos y autocontenidos: devuelven un bloque JSON parseable por la app.

export function buildPromptResultadoEvaluacion(modulo: DatosModulo): string {
  return [
    'Ya terminamos la evaluación de este módulo. Ahora resume mis resultados en un formato simple.',
    '',
    'RESPONDE SOLO CON ESTE BLOQUE JSON, rellenando cada campo y SIN texto fuera de él:',
    '',
    fence(jsonEvaluacion(modulo.codigo)),
    '',
    'Reglas: `nota` en escala 1 a 7 con un decimal (ej. 5.5). `temas_dominados` y `temas_a_reforzar`',
    'son listas de frases cortas. Usa la información de la evaluación que acabamos de hacer.',
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
