import type { MensajeIA } from './openrouter';

export interface ModuloIA {
  codigo: string;
  titulo: string;
  descripcion: string;
  indicadores: string[];
  eje?: string | null;
}

export interface Pregunta {
  unidad: number; // 1-based
  pregunta: string;
  alternativas: string[];
  correcta: number; // 0..3
  explicacion: string;
}

export interface Unidad {
  etiqueta: string;
  detalle: string;
}

// Nota chilena: 0% -> 1.0, 60% -> 4.0, 100% -> 7.0
export function notaChilena(pct: number): number {
  const p = Math.max(0, Math.min(1, pct));
  const n = p <= 0.6 ? 1 + 3 * (p / 0.6) : 4 + 3 * ((p - 0.6) / 0.4);
  return Math.round(n * 10) / 10;
}

export function buildTeachMessages(
  asignatura: string,
  modulo: ModuloIA,
  indicador: string,
  historial: MensajeIA[] = [],
): MensajeIA[] {
  const system: MensajeIA = {
    role: 'system',
    content: [
      'Eres una profesora chilena de 1° medio, cercana, paciente y clara.',
      'Estamos preparando el examen libre del MINEDUC. Explicas de a un punto por vez.',
      'Usa lenguaje simple para una alumna de 14 años, con ejemplos de Chile.',
      'Cuando corresponda, entrega HTML simple y limpio (h3, p, ul, li, strong, em, table, figure/figcaption).',
      'Puedes incluir como máximo 2 imágenes, SOLO con URLs https directas de Wikimedia Commons o NASA',
      '(por ejemplo https://upload.wikimedia.org/...). Si no estás seguro de la URL, NO incluyas imágenes.',
    ].join('\n'),
  };
  const user: MensajeIA = {
    role: 'user',
    content: [
      `Asignatura: ${asignatura}.`,
      `Módulo: ${modulo.codigo} — ${modulo.titulo}.`,
      `Objetivo general: ${modulo.descripcion}`,
      '',
      `Punto a explicar AHORA: "${indicador}".`,
      '',
      'Explica SOLO este punto en 2 a 4 párrafos claros. Al final, hazme UNA pregunta corta',
      'para comprobar que entendí.',
    ].join('\n'),
  };
  return [system, ...historial, user];
}

export function buildEvalSchema(nUnidades: number, nPreguntas: number): Record<string, unknown> {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['preguntas'],
    properties: {
      preguntas: {
        type: 'array',
        minItems: nPreguntas,
        maxItems: nPreguntas,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['unidad', 'pregunta', 'alternativas', 'correcta', 'explicacion'],
          properties: {
            unidad: { type: 'integer', minimum: 1, maximum: nUnidades },
            pregunta: { type: 'string' },
            alternativas: { type: 'array', minItems: 4, maxItems: 4, items: { type: 'string' } },
            correcta: { type: 'integer', minimum: 0, maximum: 3 },
            explicacion: { type: 'string' },
          },
        },
      },
    },
  };
}

export function buildEvalMessages(opts: {
  titulo: string;
  contexto: string;
  unidades: Unidad[];
  nPreguntas: number;
  soloUnidades?: number[];
}): MensajeIA[] {
  const lista = opts.unidades
    .map((u, i) => `${i + 1}. ${u.etiqueta}${u.detalle ? ` — ${u.detalle}` : ''}`)
    .join('\n');
  const foco = opts.soloUnidades?.length
    ? `\nGenera preguntas SOLO para estas unidades (usa su número original): ${opts.soloUnidades.join(', ')}.`
    : '';
  return [
    {
      role: 'system',
      content: [
        'Eres una profesora examinadora chilena de 1° medio. Generas exámenes tipo MINEDUC.',
        'Formato: opción múltiple con 4 alternativas (una correcta). Explicación breve de la respuesta.',
        'Devuelve SOLO el JSON pedido, sin texto extra.',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `Examen: ${opts.titulo}.`,
        `Contexto: ${opts.contexto}`,
        '',
        'Unidades que debes cubrir (al menos 1 pregunta por unidad):',
        lista,
        '',
        `Genera ${opts.nPreguntas} preguntas en total, mezclando las unidades.${foco}`,
        'Cada pregunta debe indicar "unidad" (el número de la lista), 4 alternativas y "correcta" (0 a 3).',
      ].join('\n'),
    },
  ];
}

function normalizarCorrecta(v: unknown): number {
  if (typeof v === 'number') return Math.round(v);
  if (typeof v === 'string') {
    const s = v.trim().toUpperCase();
    if (/^[A-D]$/.test(s)) return s.charCodeAt(0) - 65;
    const n = Number(s);
    if (Number.isFinite(n)) return Math.round(n);
  }
  return NaN;
}

export function normalizarPreguntas(raw: unknown, nUnidades: number): Pregunta[] {
  const obj = raw as { preguntas?: unknown; questions?: unknown };
  const arr = Array.isArray(obj?.preguntas)
    ? obj.preguntas
    : Array.isArray(obj?.questions)
      ? obj.questions
      : [];
  const out: Pregunta[] = [];
  for (const item of arr) {
    const p = item as Record<string, unknown>;
    const alternativas = Array.isArray(p.alternativas)
      ? p.alternativas.filter((a): a is string => typeof a === 'string').slice(0, 4)
      : Array.isArray(p.options)
        ? p.options.filter((a): a is string => typeof a === 'string').slice(0, 4)
        : [];
    const pregunta = typeof p.pregunta === 'string' ? p.pregunta.trim() : typeof p.question === 'string' ? p.question.trim() : '';
    const unidad = Math.round(Number(p.unidad ?? p.unit ?? p.unidad_num));
    const correcta = normalizarCorrecta(p.correcta ?? p.correct ?? p.answer);
    if (!pregunta || alternativas.length < 4) continue;
    if (!Number.isFinite(unidad) || unidad < 1 || unidad > nUnidades) continue;
    if (!Number.isFinite(correcta) || correcta < 0 || correcta > 3) continue;
    out.push({
      unidad,
      pregunta,
      alternativas,
      correcta,
      explicacion:
        typeof p.explicacion === 'string'
          ? p.explicacion.trim()
          : typeof p.explanation === 'string'
            ? p.explanation.trim()
            : '',
    });
  }
  return out;
}

export function unidadesCubiertas(preguntas: Pregunta[]): Set<number> {
  return new Set(preguntas.map((p) => p.unidad));
}

export interface ResultadoEval {
  correctas: number;
  total: number;
  pct: number;
  nota: number;
  porUnidad: { unidad: number; correctas: number; total: number }[];
}

export function calificar(preguntas: Pregunta[], respuestas: (number | null)[]): ResultadoEval {
  const porUnidad = new Map<number, { correctas: number; total: number }>();
  let correctas = 0;
  preguntas.forEach((p, i) => {
    const u = porUnidad.get(p.unidad) || { correctas: 0, total: 0 };
    u.total += 1;
    const ok = respuestas[i] === p.correcta;
    if (ok) {
      correctas += 1;
      u.correctas += 1;
    }
    porUnidad.set(p.unidad, u);
  });
  const total = preguntas.length;
  const pct = total ? correctas / total : 0;
  return {
    correctas,
    total,
    pct,
    nota: notaChilena(pct),
    porUnidad: Array.from(porUnidad.entries())
      .map(([unidad, v]) => ({ unidad, ...v }))
      .sort((a, b) => a.unidad - b.unidad),
  };
}

export function preguntasParaFaltantes(unidades: Set<number>, total: number): number[] {
  const faltan: number[] = [];
  for (let i = 1; i <= total; i++) if (!unidades.has(i)) faltan.push(i);
  return faltan;
}
