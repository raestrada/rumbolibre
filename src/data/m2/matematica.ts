import type { Modulo } from '../tipos';

const A = 'm2-mat';

export const modulosMatematica: Modulo[] = [
  {
    id: 'm2-mat-oa1',
    asignaturaId: A,
    codigo: 'M2-MAT-OA1',
    numero: '1',
    eje: 'Números y Operaciones',
    titulo: 'Cálculos y estimaciones con números reales y raíces',
    descripcion:
      'Realizar cálculos y estimaciones que involucren operaciones con números reales: utilizando la descomposición de raíces y las propiedades de las raíces; combinando raíces con números racionales; resolviendo problemas que involucren estas operaciones en contextos diversos.',
    indicadores: [
      'Aplican propiedades relativas a multiplicación y divisiones con potencias.',
      'Aplican propiedades relativas a multiplicación y divisiones con raíces.',
      'Transforman raíces a potencias y viceversa.',
      'Resuelven problemas rutinarios y no rutinarios que involucren logaritmos (propiedades de los logaritmos).',
    ],
  },
  {
    id: 'm2-mat-oa2',
    asignaturaId: A,
    codigo: 'M2-MAT-OA2',
    numero: '2',
    eje: 'Números y Operaciones',
    titulo: 'Relación entre potencias, raíces enésimas y logaritmos',
    descripcion:
      'Mostrar que comprenden las relaciones entre potencias, raíces enésimas y logaritmos: comparando representaciones de potencias de exponente racional con raíces enésimas en la recta numérica; convirtiendo raíces enésimas a potencias de exponente racional y viceversa; describiendo la relación entre potencias y logaritmos; y resolviendo problemas rutinarios y no rutinarios.',
    indicadores: [
      'Resuelven problemas que involucren raíces y números racionales.',
      'Establecen relaciones entre potencias, raíces y logaritmos.',
      'Comparan representaciones de potencias con exponente racional con raíces enésimas, y las representan en la recta numérica.',
      'Convierten desde un tipo de registro a otro: de potencias a raíces y viceversa, y de potencias a logaritmos y viceversa.',
      'Resuelven problemas rutinarios y no rutinarios que involucran logaritmos.',
    ],
  },
  {
    id: 'm2-mat-oa3',
    asignaturaId: A,
    codigo: 'M2-MAT-OA3',
    numero: '3',
    eje: 'Álgebra y Funciones',
    titulo: 'Función cuadrática f(x) = ax² + bx + c',
    descripcion:
      'Mostrar que comprenden la función cuadrática f(x) = ax² + bx + c (a ≠ 0): reconociendo f(x) = ax² en situaciones de la vida diaria y otras asignaturas; representándola en tablas y gráficos; determinando puntos especiales de su gráfica; y seleccionándola como modelo de situaciones de cambio cuadrático (como oferta y demanda).',
    indicadores: [
      'Elaboran gráficos de la función f(x) = ax² + bx + c (a ≠ 0), considerando a > 0 o a < 0 (variando b y c).',
      'Identifican los elementos de las funciones cuadráticas (vértice, intersecciones de los ejes, eje de simetría, concavidad).',
      'Modelan problemas geométricos, de la vida cotidiana y de ciencias naturales y sociales mediante ecuaciones cuadráticas.',
      'Determinan en el plano cartesiano las regiones cuyos puntos P(x, y) representan soluciones de las inecuaciones cuadráticas y < ax² + bx + c o y > ax² + bx + c.',
    ],
  },
  {
    id: 'm2-mat-oa5',
    asignaturaId: A,
    codigo: 'M2-MAT-OA5',
    numero: '5',
    eje: 'Álgebra y Funciones',
    titulo: 'Inversa de una función',
    descripcion:
      'Mostrar que comprenden la inversa de una función: utilizando la metáfora de una máquina; representándola por medio de tablas y gráficos; utilizando la reflexión de la función en el gráfico del plano cartesiano; y calculando las inversas en casos de funciones lineales y cuadráticas.',
    indicadores: [
      'Determinan las ecuaciones de las funciones inversas de funciones lineales y cuadráticas.',
      'Reconocen la función inversa de una función dada, en representaciones pictóricas y simbólicas.',
      'Resuelven problemas de la vida cotidiana y de otras ciencias que involucren el concepto de función inversa.',
    ],
  },
  {
    id: 'm2-mat-oa8',
    asignaturaId: A,
    codigo: 'M2-MAT-OA8',
    numero: '8',
    eje: 'Geometría',
    titulo: 'Razones trigonométricas: seno, coseno y tangente',
    descripcion:
      'Mostrar que comprenden las razones trigonométricas de seno, coseno y tangente en triángulos rectángulos: relacionándolas con las propiedades de la semejanza y los ángulos; explicándolas de manera pictórica y simbólica; aplicándolas para determinar ángulos o medidas de lados; y resolviendo problemas geométricos y de otras asignaturas.',
    indicadores: [
      'Resuelven triángulos rectángulos en ejercicios rutinarios; es decir, determinan todos sus ángulos y la medida de todos sus lados.',
      'Resuelven problemas de la vida cotidiana, de geometría y de ciencias naturales aplicando las razones trigonométricas.',
    ],
  },
  {
    id: 'm2-mat-oa11',
    asignaturaId: A,
    codigo: 'M2-MAT-OA11',
    numero: '11',
    eje: 'Probabilidad y Estadística',
    titulo: 'Permutaciones y combinatoria para probabilidades',
    descripcion:
      'Utilizar permutaciones y la combinatoria sencilla para calcular probabilidades de eventos y resolver problemas.',
    indicadores: [
      'Resuelven problemas de juegos de azar y de la vida cotidiana aplicando combinatoria y permutaciones.',
    ],
  },
];
