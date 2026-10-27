// Ejemplos reales de preguntas del MINEDUC ("Nivel Medio 1", modalidad adultos,
// equivalente a 1° y 2° medio). Para menores de 18 el MINEDUC solo publica temarios;
// estos son el mejor material oficial de referencia de FORMATO.
//
// Los PDFs completos están guardados en `public/examenes/` y se sirven con el sitio.

export interface ExamenPdf {
  id: string;
  asignatura: string; // codigo: LEN, MAT, CIE, HIS, ING
  nombre: string;
  archivo: string; // ruta relativa dentro de public
  fuente: string; // URL oficial
}

export interface EjemploPregunta {
  contexto?: string;
  enunciado: string;
  alternativas: string[];
}

export const EXAMENES_PDF: ExamenPdf[] = [
  {
    id: 'lengua',
    asignatura: 'LEN',
    nombre: 'Lengua y Literatura',
    archivo: 'examenes/lengua.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/ejemplos-de-preguntas-_NM1-lenguaje-2026_DS10.pdf',
  },
  {
    id: 'matematica',
    asignatura: 'MAT',
    nombre: 'Matemática',
    archivo: 'examenes/matematica.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2025/03/ejemplos-de-preguntas-_NM1-matematica-2025_DS257-uv.pdf',
  },
  {
    id: 'ciencias',
    asignatura: 'CIE',
    nombre: 'Ciencias Naturales',
    archivo: 'examenes/ciencias.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/ejemplos-de-preguntas-_NM1-C-Naturales-2026_DS10.pdf',
  },
  {
    id: 'historia',
    asignatura: 'HIS',
    nombre: 'Historia, Geografía y Ciencias Sociales',
    archivo: 'examenes/historia.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/Preguntas-ejemplos-nivel-medio-1-D10-VE-2026.pdf',
  },
  {
    id: 'ingles',
    asignatura: 'ING',
    nombre: 'Inglés',
    archivo: 'examenes/ingles.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2020/09/PREGUNTAS-PARA-LIBERAR-INGLES-VE257_NM1.pdf',
  },
];

// Un ejemplo real por asignatura (transcrito de los PDFs oficiales).
export const EJEMPLOS_PREGUNTA: Record<string, EjemploPregunta> = {
  LEN: {
    contexto: 'Marcos rescató a una paloma coja y le hizo una pata nueva con una cucharita de plástico.',
    enunciado: '¿Qué rasgo sobresale en la personalidad del protagonista?',
    alternativas: ['Su sencillez.', 'Su esfuerzo.', 'Su timidez.', 'Su compasión.'],
  },
  MAT: {
    contexto: 'Un galón de pintura de 3,8 L cuesta $19.190 y rinde 30 m².',
    enunciado: '¿Cuánto dinero se paga por un litro de pintura si se compra en el formato de galón?',
    alternativas: ['$640', '$1.279', '$2.432', '$5.050'],
  },
  CIE: {
    enunciado:
      '¿Qué nivel de organización ecológica contempla la interacción de los individuos de una misma especie?',
    alternativas: ['Biósfera', 'Poblaciones', 'Ecosistemas', 'Comunidades'],
  },
  HIS: {
    contexto: 'La Ilustración fue un movimiento cultural e intelectual europeo (siglos XVII–XIX).',
    enunciado: 'Además del racionalismo, ¿qué otra idea es característica de la Ilustración?',
    alternativas: [
      'Dios es el centro de las preocupaciones filosóficas y políticas.',
      'Cuestionó las monarquías absolutistas y el origen divino del poder.',
      'Todo conocimiento debía ser alcanzable a través del pensamiento místico y la fe.',
      'Creencia en que la ciencia y la tecnología llevarían a la humanidad a su destrucción.',
    ],
  },
  ING: {
    contexto:
      '“In China there is only one course, this means Chinese put all the nutritive food together on a plate and they eat with chopsticks”.',
    enunciado: 'What is the meaning of “course”?',
    alternativas: ['Dish.', 'Meat.', 'Habit.', 'Breakfast.'],
  },
};

export function ejemploDeAsignatura(codigo: string): EjemploPregunta | undefined {
  return EJEMPLOS_PREGUNTA[codigo];
}
