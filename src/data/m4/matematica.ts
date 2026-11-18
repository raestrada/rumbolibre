import type { Modulo } from '../tipos';

const A = 'm4-mat';

export const modulosMatematica: Modulo[] = [
  {
    id: 'm4-mat-oa1',
    asignaturaId: A,
    codigo: 'M4-MAT-OA1',
    numero: '1',
    eje: 'Matemática Financiera',
    titulo: 'Decisiones financieras, tasas de interés e índices económicos',
    descripcion:
      'Fundamentar decisiones en el ámbito financiero y económico personal o comunitario, a partir de modelos que consideren tasas de interés e índices económicos.',
    indicadores: [
      'Interpretan información del ámbito financiero y económico personal o comunitario, que involucra porcentajes, tasas de interés o índices económicos.',
      'Evalúan diferentes posibilidades de créditos, utilizando porcentajes, tasas de interés o índices económicos para tomar una decisión fundamentada.',
      'Ajustan modelos que involucran porcentajes, tasas de interés o índices económicos para determinar las mejores posibilidades de una situación del ámbito financiero y económico.',
    ],
  },
  {
    id: 'm4-mat-oa2',
    asignaturaId: A,
    codigo: 'M4-MAT-OA2',
    numero: '2',
    eje: 'Probabilidad y Estadística',
    titulo: 'Decisiones en incerteza con modelos binomial y normal',
    descripcion:
      'Fundamentar decisiones en situaciones de incerteza, a partir del análisis crítico de datos estadísticos y con base en los modelos binomial y normal.',
    indicadores: [
      'Evalúan las diferentes posibilidades en un experimento aleatorio y determinan su probabilidad.',
      'Evalúan los alcances y límites de un argumento estadístico o probabilístico antes de tomar una decisión.',
      'Evalúan la pertinencia de usar modelos binomial o normal para interpretar situaciones de incerteza.',
    ],
  },
  {
    id: 'm4-mat-oa3',
    asignaturaId: A,
    codigo: 'M4-MAT-OA3',
    numero: '3',
    eje: 'Álgebra y Funciones',
    titulo: 'Modelos con funciones potencia y trigonométricas sen(x), cos(x)',
    descripcion:
      'Construir modelos de situaciones o fenómenos de crecimiento, decrecimiento y periódicos que involucren funciones potencia de exponente entero y trigonométricas sen(x) y cos(x), de forma manuscrita, con uso de herramientas tecnológicas y promoviendo la búsqueda, selección, contrastación y verificación de información en ambientes digitales y redes sociales.',
    indicadores: [
      'Interpretan información, utilizando modelos que involucran funciones potencia y trigonométricas para deducir resultados.',
      'Varían parámetros de modelos existentes que involucran funciones potencia y trigonométricas para comparar resultados.',
      'Describen modelos existentes que involucran funciones potencia y trigonométricas para relacionar partes y características de la situación.',
      'Construyen modelos de situaciones que involucran funciones potencia y trigonométricas para inferir resultados en diferentes momentos.',
      'Comparan modelos que involucran funciones potencia o trigonométricas con otros modelos que también describen la situación, para determinar fortalezas y debilidades.',
    ],
  },
];
