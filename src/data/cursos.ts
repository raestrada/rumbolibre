import type { Curso, Asignatura } from './tipos';

export const cursos: Curso[] = [
  {
    id: 'b5',
    codigo: 'B5',
    nombre: '5° básico',
    orden: 1,
    decreto: 'Decreto Supremo de Educación N°439/2012',
    descripcion:
      'Exámenes libres (validación de estudios para menores de 18 años) del MINEDUC. Se rinden 5 asignaturas: Lenguaje y Comunicación, Matemática, Ciencias Naturales, Historia, Geografía y Ciencias Sociales, e Idioma Extranjero: Inglés. Cada una con su prueba separada de 25 preguntas y 90 minutos. Permitido calculadora en Matemática y diccionario en Inglés.',
  },
  {
    id: 'm1',
    codigo: 'M1',
    nombre: '1° medio',
    orden: 2,
    decreto: 'Decreto Bases Curriculares N°614/2013',
    descripcion:
      'Exámenes libres (validación de estudios para menores de 18 años) del MINEDUC. Se rinden 5 asignaturas, cada una con su prueba separada de 25 preguntas y 90 minutos.',
  },
];

export const asignaturas: Asignatura[] = [
  // 5° Básico
  {
    id: 'b5-len',
    cursoId: 'b5',
    codigo: 'LEN',
    nombre: 'Lenguaje y Comunicación',
    color: '#ec4899',
    icono: '📖',
    ejes: ['Lectura', 'Escritura'],
  },
  {
    id: 'b5-mat',
    cursoId: 'b5',
    codigo: 'MAT',
    nombre: 'Matemática',
    color: '#3b82f6',
    icono: '🔢',
    ejes: [
      'Números y Operaciones',
      'Patrones y Álgebra',
      'Geometría',
      'Medición',
      'Datos y Probabilidades',
    ],
  },
  {
    id: 'b5-cie',
    cursoId: 'b5',
    codigo: 'CIE',
    nombre: 'Ciencias Naturales',
    color: '#10b981',
    icono: '🔬',
    ejes: ['Ciencias de la Vida', 'Ciencias Físicas y Químicas', 'Ciencias de la Tierra y el Universo'],
  },
  {
    id: 'b5-his',
    cursoId: 'b5',
    codigo: 'HIS',
    nombre: 'Historia, Geografía y Ciencias Sociales',
    color: '#f59e0b',
    icono: '🏛️',
    ejes: ['Historia', 'Geografía', 'Formación Ciudadana'],
  },
  {
    id: 'b5-ing',
    cursoId: 'b5',
    codigo: 'ING',
    nombre: 'Inglés',
    color: '#14b8a6',
    icono: '🌍',
    ejes: ['Reading', 'Writing'],
  },

  // 1° Medio
  {
    id: 'm1-len',
    cursoId: 'm1',
    codigo: 'LEN',
    nombre: 'Lengua y Literatura',
    color: '#ec4899',
    icono: '📖',
    ejes: ['Lectura', 'Escritura'],
  },
  {
    id: 'm1-mat',
    cursoId: 'm1',
    codigo: 'MAT',
    nombre: 'Matemática',
    color: '#3b82f6',
    icono: '🔢',
    ejes: ['Números y Operaciones', 'Álgebra y Funciones', 'Geometría', 'Probabilidad y Estadística'],
  },
  {
    id: 'm1-cie',
    cursoId: 'm1',
    codigo: 'CIE',
    nombre: 'Ciencias Naturales',
    color: '#10b981',
    icono: '🔬',
    ejes: ['Biología', 'Física', 'Química'],
  },
  {
    id: 'm1-his',
    cursoId: 'm1',
    codigo: 'HIS',
    nombre: 'Historia, Geografía y Ciencias Sociales',
    color: '#f59e0b',
    icono: '🏛️',
    ejes: ['Historia', 'Geografía', 'Formación Ciudadana'],
  },
  {
    id: 'm1-ing',
    cursoId: 'm1',
    codigo: 'ING',
    nombre: 'Inglés',
    color: '#14b8a6',
    icono: '🌍',
    ejes: ['Reading', 'Writing'],
  },
];
