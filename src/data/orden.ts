// Orden recomendado de estudio para cada curso.
//
// Dos criterios, como en un colegio:
// 1. DEPENDENCIA: dentro de cada asignatura, los módulos van en un orden pedagógico
//    (lo que se necesita antes, va antes).
// 2. MEZCLA: las asignaturas se intercalan para no hacer todo de una materia de corrido,
//    como un horario escolar (Lenguaje, Matemática, Ciencias, Historia, Inglés…).
//
// Cada módulo aparece una sola vez.

export const ORDEN_MODULOS_B5: string[] = [
  // Semana 1: Fundamentos y descubrimiento
  'b5-len-oa4', // Lenguaje: Narraciones
  'b5-mat-oa1', // Matemática: Números hasta 1.000 millones
  'b5-cie-oa1', // Ciencias: Organización celular y niveles
  'b5-his-oa2', // Historia: Conquista de América y Chile
  'b5-ing-oa5', // Inglés: Comprensión de textos simples

  // Semana 2: Profundización de estructuras
  'b5-mat-oa3', // Matemática: Multiplicación 2 dígitos
  'b5-len-oa5', // Lenguaje: Análisis de poemas
  'b5-cie-oa5', // Ciencias: Nutrición y alimentos saludables
  'b5-his-oa3', // Historia: Impacto de la conquista
  'b5-ing-oa6', // Inglés: Textos cotidianos no literarios

  // Semana 3: Operaciones y entorno
  'b5-mat-oa4', // Matemática: División 3 dígitos
  'b5-len-oa6', // Lenguaje: Textos no literarios
  'b5-cie-oa6', // Ciencias: Efectos del cigarrillo
  'b5-his-oa6', // Historia: Colonia y sociedad mestiza
  'b5-ing-oa8', // Inglés: Reaccionar a textos y vivencias

  // Semana 4: Aplicación y resolución de problemas
  'b5-mat-oa6', // Matemática: 4 operaciones y dinero
  'b5-len-oa7', // Lenguaje: Evaluación crítica de textos
  'b5-cie-oa7', // Ciencias: Microorganismos e higiene
  'b5-his-oa7', // Historia: Relaciones hispano-indígenas y parlamentos
  'b5-ing-oa14', // Inglés: Redacción con apoyo visual según modelo

  // Semana 5: Fracciones, geografía y energía
  'b5-mat-oa7', // Matemática: Fracciones propias
  'b5-len-oa14', // Lenguaje: Escritura de narraciones
  'b5-cie-oa10', // Ciencias: Conductores y aisladores eléctricos
  'b5-his-oa9', // Historia: Grandes zonas naturales de Chile
  'b5-ing-oa15', // Inglés: Expresión escrita cotidiana y descripciones

  // Semana 6: Decimales e hidrósfera
  'b5-mat-oa10', // Matemática: Fracciones a decimales
  'b5-mat-oa11', // Matemática: Comparar decimales
  'b5-len-oa15', // Lenguaje: Artículos informativos
  'b5-cie-oa12', // Ciencias: Distribución de agua dulce y salada
  'b5-his-oa10', // Historia: Recursos naturales de Chile y sustentabilidad

  // Semana 7: Álgebra, derechos y conservación
  'b5-mat-oa13', // Matemática: Adición/sustracción fracciones y decimales
  'b5-mat-oa14', // Matemática: Sucesiones y reglas
  'b5-cie-oa14', // Ciencias: Impacto humano en recursos hídricos
  'b5-his-oa13', // Historia: Sujetos de derecho universales
  'b5-mat-oa15', // Matemática: Ecuaciones e inecuaciones de 1 paso

  // Semana 8: Geometría y ciudadanía
  'b5-mat-oa17', // Matemática: Caras y aristas 3D / 2D
  'b5-mat-oa18', // Matemática: Congruencia e isometrías
  'b5-his-oa14', // Historia: Deberes, responsabilidades y Estado
  'b5-mat-oa19', // Matemática: Medición de longitudes
  'b5-mat-oa22', // Matemática: Áreas de figuras planas

  // Semana 9: Datos y probabilidades
  'b5-mat-oa23', // Matemática: Promedio de datos
  'b5-mat-oa24', // Matemática: Posibilidad y experimentos aleatorios
  'b5-mat-oa26', // Matemática: Tablas y gráficos de barras y líneas
];

export const ORDEN_MODULOS_M1: string[] = [
  // Semana 1
  'm1-len-oa3',
  'm1-his-oa1',
  'm1-cie-bio-oa2',
  'm1-mat-oa1',
  'm1-ing-oa9',
  // Semana 2
  'm1-his-oa3',
  'm1-len-oa5',
  'm1-cie-bio-oa4',
  'm1-mat-oa2',
  'm1-his-oa8',
  // Semana 3
  'm1-ing-oa10',
  'm1-cie-bio-oa6',
  'm1-len-oa8',
  'm1-his-oa10',
  'm1-mat-oa3',
  // Semana 4
  'm1-cie-bio-oa8',
  'm1-ing-oa13',
  'm1-his-oa12',
  'm1-len-oa9',
  'm1-cie-fis-oa10',
  // Semana 5
  'm1-mat-oa4',
  'm1-his-oa14',
  'm1-ing-oa16',
  'm1-cie-fis-oa11',
  'm1-len-oa10',
  // Semana 6
  'm1-his-oa15',
  'm1-mat-oa8',
  'm1-cie-fis-oa14',
  'm1-his-oa18',
  'm1-len-oa14',
  // Semana 7
  'm1-mat-oa10',
  'm1-cie-fis-oa16',
  'm1-his-oa7',
  'm1-mat-oa14',
  'm1-his-oa23',
  // Semana 8
  'm1-cie-qui-oa17',
  'm1-his-oa20',
  'm1-cie-qui-oa20',
  'm1-his-oa24',
  'm1-his-oa25',
];

export const ORDEN_MODULOS: string[] = [...ORDEN_MODULOS_B5, ...ORDEN_MODULOS_M1];

export function getOrdenModulos(cursoId: string): string[] {
  if (cursoId === 'b5') return ORDEN_MODULOS_B5;
  return ORDEN_MODULOS_M1;
}
