import type { Modulo } from '../tipos';

const A = 'm3-mat';

export const modulosMatematica: Modulo[] = [
  {
    id: 'm3-mat-oa2',
    asignaturaId: A,
    codigo: 'M3-MAT-OA2',
    numero: '2',
    eje: 'Probabilidad y Estadística',
    titulo: 'Medidas de dispersión y probabilidades condicionales',
    descripcion:
      'Tomar decisiones en situaciones de incerteza que involucren el análisis de datos estadísticos con medidas de dispersión y probabilidades condicionales.',
    indicadores: [
      'Extraen e interpretan información estadística, calculando medidas de dispersión para comparar situaciones.',
      'Analizan datos, calculando las medidas de dispersión para tomar decisiones.',
      'Representan la información y utilizan las medidas de dispersión para comunicar alguna decisión.',
      'Seleccionan y relacionan información, calculando probabilidades condicionales para tomar decisiones.',
      'Utilizan árboles o tablas de doble entrada para representar y determinar la probabilidad condicional.',
    ],
  },
  {
    id: 'm3-mat-oa3',
    asignaturaId: A,
    codigo: 'M3-MAT-OA3',
    numero: '3',
    eje: 'Álgebra y Funciones',
    titulo: 'Modelos con funciones exponencial y logarítmica',
    descripcion:
      'Aplicar modelos matemáticos que describen fenómenos o situaciones de crecimiento y decrecimiento, que involucran las funciones exponencial y logarítmica, de forma manuscrita, con uso de herramientas tecnológicas y promoviendo la búsqueda, selección, contrastación y verificación de información en ambientes digitales y redes sociales.',
    indicadores: [
      'Utilizan modelos de situaciones de crecimiento y decrecimiento que involucran las funciones exponencial y logarítmica, para determinar valores o hacer proyecciones.',
      'Identifican los intervalos donde el modelo exponencial o logarítmico tiene sentido, según la situación de crecimiento o decrecimiento.',
      'Varían parámetros para ajustar un modelo exponencial o logarítmico según la situación.',
      'Construyen modelos de situaciones de crecimiento y decrecimiento que involucran las funciones exponencial y logarítmica, para determinar valores o hacer proyecciones.',
    ],
  },
  {
    id: 'm3-mat-oa4',
    asignaturaId: A,
    codigo: 'M3-MAT-OA4',
    numero: '4',
    eje: 'Geometría',
    titulo: 'Relaciones métricas en la circunferencia',
    descripcion:
      'Resolver problemas de geometría euclidiana que involucran relaciones métricas entre ángulos, arcos, cuerdas y secantes en la circunferencia, de forma manuscrita y con uso de herramientas tecnológicas.',
    indicadores: [
      'Utilizan relaciones métricas entre ángulos, arcos o cuerdas en la circunferencia para determinar medidas de objetos geométricos.',
      'Justifican el uso de propiedades sobre ángulos, arcos o cuerdas para resolver un problema.',
      'Explican las relaciones métricas entre ángulos, arcos o cuerdas en la circunferencia, utilizando dibujos, esquemas o proposiciones.',
    ],
  },
];
