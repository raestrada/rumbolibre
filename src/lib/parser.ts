export interface RegistroParseado {
  tipo: 'evaluacion' | 'resumen';
  modulo: string | null;
  nota: number | null;
  preguntasCorrectas: number | null;
  preguntasTotales: number | null;
  temasDominados: string[];
  temasAReforzar: string[];
  retroalimentacion: string;
  siguientePaso: string;
  ideasClave: string[];
  conceptos: string[];
  dudas: string[];
  estadoParseo: 'ok' | 'sin_parsear';
}

const MAX_TEXTO = 500_000;

function extraerTextoJson(texto: string): string | null {
  const fenced = texto.match(/```(?:json)?\s*\r?\n?([\s\S]*?)```/i);
  if (fenced && fenced[1].trim()) return fenced[1].trim();

  const inicio = texto.indexOf('{');
  const fin = texto.lastIndexOf('}');
  if (inicio !== -1 && fin !== -1 && fin > inicio) {
    return texto.slice(inicio, fin + 1);
  }
  return null;
}

function sanitizar(json: string): string {
  return json
    // comillas tipográficas a rectas
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    // comas finales antes de } o ]
    .replace(/,\s*([}\]])/g, '$1')
    // control chars (excepto nueva línea)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ');
}

function aStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === 'string')
    .map((x) => x.trim())
    .filter(Boolean);
}

function aNumero(v: unknown, min: number, max: number): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v.replace(',', '.')) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.min(max, Math.max(min, n)) * 10) / 10;
}

function aTexto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export function parsearRegistro(
  texto: string,
  tipoPorDefecto: 'evaluacion' | 'resumen',
  moduloPorDefecto: string,
): RegistroParseado {
  const base: RegistroParseado = {
    tipo: tipoPorDefecto,
    modulo: moduloPorDefecto,
    nota: null,
    preguntasCorrectas: null,
    preguntasTotales: null,
    temasDominados: [],
    temasAReforzar: [],
    retroalimentacion: '',
    siguientePaso: '',
    ideasClave: [],
    conceptos: [],
    dudas: [],
    estadoParseo: 'sin_parsear',
  };

  if (!texto) return base;

  const recorte = texto.length > MAX_TEXTO ? texto.slice(0, MAX_TEXTO) : texto;
  const crudo = extraerTextoJson(recorte);
  if (!crudo) return base;

  try {
    const obj: Record<string, unknown> = JSON.parse(sanitizar(crudo));
    if (!obj || typeof obj !== 'object') return base;

    const tipo =
      obj.tipo === 'resumen' ? 'resumen' : obj.tipo === 'evaluacion' ? 'evaluacion' : tipoPorDefecto;
    const modulo =
      typeof obj.modulo === 'string' && obj.modulo.trim() ? obj.modulo.trim() : moduloPorDefecto;

    return {
      tipo,
      modulo,
      nota: aNumero(obj.nota, 1, 7),
      preguntasCorrectas: aNumero(obj.preguntas_correctas, 0, 1_000_000),
      preguntasTotales: aNumero(obj.preguntas_totales, 0, 1_000_000),
      temasDominados: aStringArray(obj.temas_dominados),
      temasAReforzar: aStringArray(obj.temas_a_reforzar),
      retroalimentacion: aTexto(obj.retroalimentacion),
      siguientePaso: aTexto(obj.siguiente_paso),
      ideasClave: aStringArray(obj.ideas_clave),
      conceptos: aStringArray(obj.conceptos),
      dudas: aStringArray(obj.dudas),
      estadoParseo: 'ok',
    };
  } catch {
    return base;
  }
}

export function notaColor(nota: number | null): string {
  if (nota == null) return 'var(--gris)';
  if (nota >= 6) return 'var(--exito)';
  if (nota >= 4) return 'var(--amarillo)';
  return 'var(--peligro)';
}
