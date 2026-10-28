import type { MensajeIA } from './openrouter';
import { getGuiaMineduc, type TipoPreguntaMineduc } from '../data/guiasMineduc';

export interface ModuloIA {
  codigo: string;
  titulo: string;
  descripcion: string;
  indicadores: string[];
  eje?: string | null;
}

export type TipoPregunta = TipoPreguntaMineduc;

export interface Pregunta {
  unidad: number; // 1-based
  tipo: TipoPregunta;
  contexto: string; // Situación o lectura oficial
  pregunta: string;
  alternativas: string[];
  correcta: number; // 0..alternativas.length - 1
  explicacion: string;
}

export interface Unidad {
  etiqueta: string;
  detalle: string;
}

export interface CoberturaEstado {
  vistos: number[]; // Puntos que tienen al menos una explicación inicial
  profundizados: number[]; // Puntos que ya fueron profundizados con rigor MINEDUC
}

export function parseCobertura(raw: unknown): CoberturaEstado {
  if (Array.isArray(raw)) {
    const arr = raw.filter((x): x is number => typeof x === 'number');
    return { vistos: arr, profundizados: [] };
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const vistos = Array.isArray(obj.vistos) ? obj.vistos.filter((x): x is number => typeof x === 'number') : [];
    const profundizados = Array.isArray(obj.profundizados)
      ? obj.profundizados.filter((x): x is number => typeof x === 'number')
      : [];
    return { vistos, profundizados };
  }
  return { vistos: [], profundizados: [] };
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
      'Eres una profesora chilena de 1° medio, cercana, paciente y clara. Estamos preparando el examen libre del MINEDUC.',
      'Explicas de a UN punto por vez, para una alumna de 14 años, con ejemplos de Chile.',
      '',
      'FORMATO OBLIGATORIO: responde en HTML didáctico y visual (NO markdown, NO texto plano).',
      '- Estructura con <h3>, párrafos cortos, <ul>/<ol>, <strong>, <em> y <table> cuando ayude.',
      '- Usa emojis al inicio de ideas clave: 🧠 Idea clave, ✅ Ejemplo, ⚠️ Ojo, 🔎 Dato, 📌 Para recordar.',
      '- Usa estos bloques (clases permitidas):',
      '  <div class="rl-callout">…</div> para un dato o regla importante.',
      '  <div class="rl-note">…</div> para una nota breve.',
      '  <blockquote class="rl-quote">…</blockquote> para una definición o cita.',
      '  <span class="rl-concept">término</span> para un concepto clave.',
      '- Cuando aporte, incluye 1 o 2 imágenes así:',
      '  <figure><img src="https://upload.wikimedia.org/…" alt="descripción"><figcaption>…</figcaption></figure>',
      '  Usa SOLO URLs https directas de imágenes de Wikimedia Commons o NASA. Si no estás seguro, NO pongas imagen.',
      '- Al final incluye <h3>🔎 Fuentes</h3> con 1 a 3 enlaces https confiables.',
      '- No uses <script>, <style>, ni atributos style/onclick/width/height: el diseño ya es responsivo.',
      '- Las tablas deben tener como máximo 3 columnas y textos cortos (se adaptan al ancho de la pantalla).',
      '- Escribe párrafos de 2 a 3 líneas; evita bloques de texto largos.',
      '- Sé breve: 3 a 6 bloques.',
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

export function buildDeepenMessages(
  asignatura: string,
  codigoAsignatura: string,
  modulo: ModuloIA,
  indicador: string,
  historial: MensajeIA[] = [],
): MensajeIA[] {
  const guia = getGuiaMineduc(codigoAsignatura);
  const system: MensajeIA = {
    role: 'system',
    content: [
      'Eres una profesora chilena de 1° medio, paciente, didáctica y muy rigurosa en el temario del MINEDUC.',
      'Tu objetivo en este turno es PROFUNDIZAR a fondo en este punto curricular para asegurar que la alumna domine todos los aspectos que pueden ser evaluados en el examen libre.',
      '',
      'CRITERIOS DETERMINÍSTICOS DE PROFUNDIZACIÓN OFICIAL DEL MINEDUC:',
      `Meta pedagógica: ${guia.criterioProfundizacion.meta}`,
      'Aspectos obligatorios que DEBES desarrollar exhaustivamente:',
      ...guia.criterioProfundizacion.queIncluye.map((q) => `- ${q}`),
      '',
      'FORMATO OBLIGATORIO: responde en HTML didáctico y visual (NO markdown, NO texto plano).',
      '- Estructura con <h3>, párrafos breves, <strong>, <em> y <table> si ayuda.',
      '- Usa emojis al inicio de ideas clave: 🔍 Profundización, ✅ Caso práctico, ⚠️ Trampa de examen, 📌 Regla de oro.',
      '- Bloques obligatorios:',
      '  <div class="rl-callout"><strong>⚠️ Trampa típica de examen:</strong> [Error o confusión frecuente de los estudiantes y cómo evitarlo]</div>',
      '  <div class="rl-note"><strong>📌 Para el examen:</strong> [Resumen clave o procedimiento a recordar]</div>',
      '- Finaliza con un mini-desafío o pregunta aplicada breve para verificar que el punto quedó 100% claro.',
      '- Sé exhaustiva pero accesible para 14 años: entre 4 y 7 bloques claros.',
    ].join('\n'),
  };
  const user: MensajeIA = {
    role: 'user',
    content: [
      `Asignatura: ${asignatura}.`,
      `Módulo: ${modulo.codigo} — ${modulo.titulo}.`,
      `Objetivo del temario: ${modulo.descripcion}`,
      '',
      `Punto a PROFUNDIZAR AHORA: "${indicador}".`,
      '',
      'Por favor profundiza a fondo en este punto según las exigencias del MINEDUC. Muestra un caso o problema práctico resuelto paso a paso y advierte sobre los errores típicos que se cometen en este tema.',
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
          required: ['unidad', 'tipo', 'contexto', 'pregunta', 'alternativas', 'correcta', 'explicacion'],
          properties: {
            unidad: { type: 'integer', minimum: 1, maximum: nUnidades },
            tipo: { type: 'string', enum: ['seleccion_multiple', 'verdadero_falso', 'analisis_caso'] },
            contexto: { type: 'string' },
            pregunta: { type: 'string' },
            alternativas: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string' } },
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
  codigoAsignatura?: string;
  unidades: Unidad[];
  nPreguntas: number;
  soloUnidades?: number[];
  tipoSugerido?: TipoPregunta;
}): MensajeIA[] {
  const guia = getGuiaMineduc(opts.codigoAsignatura || 'LEN');
  const tipoObjetivo: TipoPregunta =
    opts.tipoSugerido && guia.tiposPermitidos.includes(opts.tipoSugerido)
      ? opts.tipoSugerido
      : 'seleccion_multiple';

  const lista = opts.unidades
    .map((u, i) => `${i + 1}. ${u.etiqueta}${u.detalle ? ` — ${u.detalle}` : ''}`)
    .join('\n');
  const foco = opts.soloUnidades?.length
    ? `\nGenera preguntas EXCLUSIVAMENTE para estas unidades (usa su número original): ${opts.soloUnidades.join(', ')}.`
    : '';

  // Bloque JSON estructurado con las directrices específicas del MINEDUC para esta materia
  const directricesJSON = JSON.stringify(
    {
      materia_oficial: guia.nombre,
      codigo: guia.codigo,
      enfoque_curricular_mineduc: guia.enfoqueMineduc,
      tipo_pregunta_requerido: tipoObjetivo,
      criterios_distractores: guia.criteriosDistractores,
      contextos_situacionales_tipicos: guia.contextosTipicos,
      ejemplo_referencia_oficial: {
        tipo: guia.ejemploOficial.tipo,
        contexto: guia.ejemploOficial.contexto || undefined,
        enunciado: guia.ejemploOficial.enunciado,
        alternativas: guia.ejemploOficial.alternativas,
        correcta: guia.ejemploOficial.correcta,
        explicacion: guia.ejemploOficial.explicacion,
      },
    },
    null,
    2,
  );

  return [
    {
      role: 'system',
      content: [
        'Eres una examinadora oficial del MINEDUC (Chile) para Validación de Estudios / Exámenes Libres de 1° medio (14 años).',
        'Generas preguntas con el más estricto apego al marco curricular chileno y al formato oficial de las pruebas del ministerio.',
        '',
        'REGLAS PEDAGÓGICAS ESTRICTAS:',
        '1. NO TRIVIALIDAD: Queda estrictamente prohibido formular preguntas obvias, de mero sentido común o que cualquiera pueda acertar sin saber el contenido curricular.',
        '2. DISTRACTORES PLAUSIBLES: Los distractores incorrectos deben reflejar errores de cálculo, confusiones conceptuales o interpretaciones defectuosas típicas de alumnos de 1° medio.',
        '3. HOMOGENEIDAD: Todas las alternativas deben tener longitud y estilo gramatical semejante para que la respuesta correcta no se distinga a simple vista.',
        '4. TIPOLOGÍA ESPECÍFICA:',
        '   - Si el tipo es "verdadero_falso": plantea en "pregunta" una afirmación conceptual desafiante. Las alternativas deben ser exactamente ["Verdadero", "Falso"] (2 alternativas). "correcta" debe ser 0 si es Verdadero o 1 si es Falso.',
        '   - Si el tipo es "analisis_caso": en "contexto" incluye un texto, caso chileno cotidiano, tabla o situación práctica real. En "pregunta" pide un cálculo o inferencia sobre el caso, con 4 alternativas.',
        '   - Si el tipo es "seleccion_multiple": pregunta conceptual directa con 4 alternativas (A, B, C, D). "contexto" puede ser "".',
        '5. RESPUESTA JSON: Devuelve ÚNICAMENTE el JSON pedido según el esquema.',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `Módulo / Examen: ${opts.titulo}`,
        `Contexto curricular: ${opts.contexto}`,
        '',
        '--- DIRECTRICES MINEDUC EN FORMATO JSON (SÍGUELAS DETERMINÍSTICAMENTE) ---',
        directricesJSON,
        '--------------------------------------------------------------------------',
        '',
        'Unidades a evaluar:',
        lista,
        '',
        `Genera ${opts.nPreguntas} pregunta(s).${foco}`,
        `Tipo de pregunta a generar para este turno: "${tipoObjetivo}".`,
        '',
        'Asegura que cada objeto tenga: "unidad", "tipo", "contexto", "pregunta", "alternativas", "correcta" (índice entero 0-based) y "explicacion".',
      ].join('\n'),
    },
  ];
}

function normalizarCorrecta(v: unknown, numAlternativas: number): number {
  if (typeof v === 'number') {
    const r = Math.round(v);
    if (r >= 0 && r < numAlternativas) return r;
    // Si vino en formato 1-based (ej. 1 a 4)
    if (r === numAlternativas && r >= 1) return r - 1;
  }
  if (typeof v === 'string') {
    const s = v.trim().toUpperCase();
    if (/^[A-D]$/.test(s)) return s.charCodeAt(0) - 65;
    if (s === 'VERDADERO' || s === 'V' || s === 'TRUE') return 0;
    if (s === 'FALSO' || s === 'F' || s === 'FALSE') return 1;
    const n = Number(s);
    if (Number.isFinite(n)) {
      const r = Math.round(n);
      if (r >= 0 && r < numAlternativas) return r;
      if (r === numAlternativas && r >= 1) return r - 1;
    }
  }
  return NaN;
}

// Mezcla aleatoriamente las alternativas de selección múltiple y ajusta el índice correcto
// para eliminar el sesgo posicional natural de los LLMs (que tienden a poner la respuesta en A).
export function mezclarAlternativas(
  alternativas: string[],
  correctaIdx: number,
): { alternativas: string[]; correcta: number } {
  if (alternativas.length <= 2) {
    // Si es Verdadero/Falso, preservar el orden natural ['Verdadero', 'Falso']
    return { alternativas, correcta: correctaIdx };
  }
  const respuestaCorrecta = alternativas[correctaIdx];
  const mezcladas = [...alternativas];
  for (let i = mezcladas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
  }
  const nuevaCorrecta = mezcladas.indexOf(respuestaCorrecta);
  return {
    alternativas: mezcladas,
    correcta: nuevaCorrecta >= 0 ? nuevaCorrecta : correctaIdx,
  };
}

export function normalizarPreguntas(raw: unknown, nUnidades: number): Pregunta[] {
  const obj = raw as { preguntas?: unknown; questions?: unknown };
  const arr = Array.isArray(obj?.preguntas)
    ? obj.preguntas
    : Array.isArray(obj?.questions)
      ? obj.questions
      : Array.isArray(raw)
        ? raw
        : [];
  const out: Pregunta[] = [];
  for (const item of arr) {
    const p = item as Record<string, unknown>;
    let alternativas = Array.isArray(p.alternativas)
      ? p.alternativas.filter((a): a is string => typeof a === 'string').slice(0, 4)
      : Array.isArray(p.options)
        ? p.options.filter((a): a is string => typeof a === 'string').slice(0, 4)
        : [];

    let tipo: TipoPregunta =
      p.tipo === 'verdadero_falso' || p.tipo === 'analisis_caso' || p.tipo === 'seleccion_multiple'
        ? (p.tipo as TipoPregunta)
        : 'seleccion_multiple';

    // Detección automática si el modelo devolvió V/F sin poner el tipo
    if (alternativas.length === 2 && alternativas.some((a) => /verdadero|falso/i.test(a))) {
      tipo = 'verdadero_falso';
      // Estandarizar orden [Verdadero, Falso]
      if (/falso/i.test(alternativas[0])) {
        alternativas = ['Verdadero', 'Falso'];
      }
    }

    if (tipo !== 'verdadero_falso' && alternativas.length < 3) {
      continue;
    }

    const pregunta = typeof p.pregunta === 'string' ? p.pregunta.trim() : typeof p.question === 'string' ? p.question.trim() : '';
    const contexto = typeof p.contexto === 'string' ? p.contexto.trim() : typeof p.context === 'string' ? p.context.trim() : '';
    const unidad = Math.round(Number(p.unidad ?? p.unit ?? p.unidad_num));
    const explicacion = typeof p.explicacion === 'string' ? p.explicacion.trim() : typeof p.explanation === 'string' ? p.explanation.trim() : '';

    if (!pregunta || alternativas.length < 2) continue;
    if (!Number.isFinite(unidad) || unidad < 1 || unidad > nUnidades) continue;

    let correcta = normalizarCorrecta(p.correcta ?? p.correct ?? p.answer, alternativas.length);
    if (!Number.isFinite(correcta) || correcta < 0 || correcta >= alternativas.length) continue;

    // Si es selección múltiple o análisis de caso con 3 o 4 alternativas, mezclar para aleatorizar la posición
    let altsFinales = alternativas;
    let correctaFinal = correcta;
    if (tipo !== 'verdadero_falso' && altsFinales.length >= 3) {
      const shuffled = mezclarAlternativas(altsFinales, correctaFinal);
      altsFinales = shuffled.alternativas;
      correctaFinal = shuffled.correcta;
    }

    out.push({
      unidad,
      tipo,
      contexto,
      pregunta,
      alternativas: altsFinales,
      correcta: correctaFinal,
      explicacion,
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
