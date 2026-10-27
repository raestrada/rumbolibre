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
  const partes = [
    `Tema: ${modulo.codigo} — ${modulo.titulo}${eje} (asignatura: ${asignatura}).`,
    '',
    'Objetivo de Aprendizaje:',
    modulo.descripcion,
    '',
    'Para lograrlo, debo ser capaz de:',
    bullets(modulo.indicadores),
  ];
  return partes.join('\n');
}

function reglasNota(): string {
  return [
    'Reglas: `nota` en escala 1 a 7 con un decimal (ej. 5.5).',
    '`temas_dominados` y `temas_a_reforzar` son listas de frases cortas.',
    'Mantén el formato JSON exacto.',
  ].join('\n');
}

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

export function buildPromptPracticar(modulo: DatosModulo, asignatura: string): string {
  return [
    'Actúa como mi profesora de 1° medio. Vamos a practicar antes del examen libre del MINEDUC.',
    '',
    encabezado(modulo, asignatura),
    '',
    'Hazme 5 preguntas (tipo examen: opción múltiple y respuestas cortas), una por una, y corrige',
    'cada respuesta al momento. Sé exigente pero amable.',
    '',
    'AL TERMINAR, RESPONDE SOLO CON ESTE BLOQUE JSON, rellenando cada campo y SIN texto fuera de él:',
    '',
    fence(jsonEvaluacion(modulo.codigo)),
    '',
    reglasNota(),
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
    '',
    'AL TERMINAR, RESPONDE SOLO CON ESTE BLOQUE JSON, rellenando cada campo y SIN texto fuera de él:',
    '',
    fence(jsonEvaluacion(modulo.codigo)),
    '',
    reglasNota(),
  ].join('\n');
}

export function buildPromptResumir(modulo: DatosModulo, asignatura: string): string {
  return [
    'Actúa como mi tutora. Terminé de estudiar:',
    encabezado(modulo, asignatura),
    '',
    'Pídeme que te explique con mis palabras lo que aprendí y ayúdame a organizar mis apuntes.',
    '',
    'AL TERMINAR, RESPONDE SOLO CON ESTE BLOQUE JSON, rellenando cada campo y SIN texto fuera de él:',
    '',
    fence(jsonResumen(modulo.codigo)),
    '',
    'Reglas: `ideas_clave` y `conceptos` son listas de frases cortas. `dudas` son preguntas que me',
    'quedaron. Mantén el formato JSON exacto.',
  ].join('\n');
}

export function getPrompt(
  tipo: TipoActividad,
  modulo: DatosModulo,
  asignatura: string,
): string {
  switch (tipo) {
    case 'aprender':
      return buildPromptBusqueda(modulo, asignatura);
    case 'practicar':
      return buildPromptPracticar(modulo, asignatura);
    case 'evaluar':
      return buildPromptEvaluar(modulo, asignatura);
    case 'resumir':
      return buildPromptResumir(modulo, asignatura);
  }
}
