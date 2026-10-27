import type { Curso, Asignatura } from './tipos';

export const cursos: Curso[] = [
  {
    id: 'm1',
    codigo: 'M1',
    nombre: '1° medio',
    orden: 1,
    decreto: 'Decreto Bases Curriculares N°614/2013',
    descripcion:
      'Exámenes libres (validación de estudios para menores de 18 años) del MINEDUC. Se rinden 5 asignaturas, cada una con su prueba separada de 25 preguntas y 90 minutos.',
  },
];

export const asignaturas: Asignatura[] = [
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
