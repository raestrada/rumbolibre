// Ejemplos reales de preguntas del MINEDUC.
// Para menores de 18 el MINEDUC publica temarios por curso; los exámenes de adultos
// (Nivel Básico 2 para 5°/6° básico y Nivel Medio 1 para 1°/2° medio) son el material
// oficial de referencia de FORMATO (opción múltiple, etc.).
//
// Los PDFs completos están guardados en `public/examenes/` y se sirven con el sitio.

export interface ExamenPdf {
  id: string;
  cursoId: string; // 'b5' | 'm1'
  asignatura: string; // codigo: LEN, MAT, CIE, HIS, ING o ALL
  nombre: string;
  archivo: string; // ruta relativa dentro de public
  fuente: string; // URL oficial
  esTemario?: boolean;
}

export interface EjemploPregunta {
  contexto?: string;
  enunciado: string;
  alternativas: string[];
}

export const EXAMENES_PDF: ExamenPdf[] = [
  // --- 5° Básico ---
  {
    id: 'b5-temario',
    cursoId: 'b5',
    asignatura: 'ALL',
    nombre: 'Temario Oficial 5° Básico (MINEDUC)',
    archivo: 'examenes/b5-temario.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2025/03/temario_basica_5deg_basico_-UCE.pdf',
    esTemario: true,
  },
  {
    id: 'b5-lengua',
    cursoId: 'b5',
    asignatura: 'LEN',
    nombre: 'Lenguaje y Comunicación (Nivel Básico 2)',
    archivo: 'examenes/b5-lengua.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/ejemplos-de-preguntas-_NB2-lenguaje-2026_DS10.pdf',
  },
  {
    id: 'b5-matematica',
    cursoId: 'b5',
    asignatura: 'MAT',
    nombre: 'Educación Matemática (Nivel Básico 2)',
    archivo: 'examenes/b5-matematica.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2025/03/ejemplos-de-preguntas-_NB2-matematica-2025_DS257-uv.pdf',
  },
  {
    id: 'b5-ciencias',
    cursoId: 'b5',
    asignatura: 'CIE',
    nombre: 'Ciencias Naturales (Nivel Básico 2)',
    archivo: 'examenes/b5-ciencias.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/ejemplos-de-preguntas-_NB2-C-Naturales-2026_DS10.pdf',
  },
  {
    id: 'b5-historia',
    cursoId: 'b5',
    asignatura: 'HIS',
    nombre: 'Historia, Geografía y Ciencias Sociales (Nivel Básico 2)',
    archivo: 'examenes/b5-historia.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/Preguntas-ejemplos-NB2-D10-VE-2026.pdf',
  },

  // --- 1° Medio ---
  {
    id: 'lengua',
    cursoId: 'm1',
    asignatura: 'LEN',
    nombre: 'Lengua y Literatura',
    archivo: 'examenes/lengua.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/ejemplos-de-preguntas-_NM1-lenguaje-2026_DS10.pdf',
  },
  {
    id: 'matematica',
    cursoId: 'm1',
    asignatura: 'MAT',
    nombre: 'Matemática',
    archivo: 'examenes/matematica.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2025/03/ejemplos-de-preguntas-_NM1-matematica-2025_DS257-uv.pdf',
  },
  {
    id: 'ciencias',
    cursoId: 'm1',
    asignatura: 'CIE',
    nombre: 'Ciencias Naturales',
    archivo: 'examenes/ciencias.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/ejemplos-de-preguntas-_NM1-C-Naturales-2026_DS10.pdf',
  },
  {
    id: 'historia',
    cursoId: 'm1',
    asignatura: 'HIS',
    nombre: 'Historia, Geografía y Ciencias Sociales',
    archivo: 'examenes/historia.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/Preguntas-ejemplos-nivel-medio-1-D10-VE-2026.pdf',
  },
  {
    id: 'ingles',
    cursoId: 'm1',
    asignatura: 'ING',
    nombre: 'Inglés',
    archivo: 'examenes/ingles.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2020/09/PREGUNTAS-PARA-LIBERAR-INGLES-VE257_NM1.pdf',
  },
];

// Ejemplos reales por asignatura según curso
export const EJEMPLOS_PREGUNTA: Record<string, Record<string, EjemploPregunta>> = {
  b5: {
    LEN: {
      contexto: 'Ventila por 30 minutos antes de ingresar a un lugar que ha permanecido cerrado.',
      enunciado: '¿Qué palabra remplaza mejor a ventila en la oración?',
      alternativas: ['Airea.', 'Enfría.', 'Limpia.', 'Protege.'],
    },
    MAT: {
      contexto: 'De un saco de 25 kg, José tiene armadas 28 bolsas de 1/4 kg.',
      enunciado: '¿Para cuántas bolsas de 1/2 kg le alcanza con el resto del saco?',
      alternativas: ['36 bolsas', '18 bolsas', '12 bolsas', '9 bolsas'],
    },
    CIE: {
      enunciado: '¿Qué función común tienen el hígado y el páncreas?',
      alternativas: [
        'Producir la circulación de nutrientes.',
        'Participar en la digestión de los alimentos.',
        'Proteger al cuerpo de intoxicaciones.',
        'Distribuir agua a través del organismo.',
      ],
    },
    HIS: {
      enunciado:
        '¿Qué elemento del mundo colonial permaneció presente en Chile tras su independencia de España?',
      alternativas: [
        'La repartición de tierras bajo el sistema de encomiendas.',
        'El predominio de la religión católica en la sociedad.',
        'La dependencia económica de la Corona española.',
        'El monopolio comercial administrado desde Lima.',
      ],
    },
    ING: {
      contexto: 'Today is Monday. It is cold and rainy in the morning.',
      enunciado: 'According to the sentence, what is the weather like?',
      alternativas: [
        'It is hot and sunny.',
        'It is cold and rainy.',
        'It is warm and dry.',
        'It is windy and bright.',
      ],
    },
  },
  m1: {
    LEN: {
      contexto:
        'Marcos rescató a una paloma coja y le hizo una pata nueva con una cucharita de plástico.',
      enunciado: '¿Qué rasgo sobresale en la personalidad del protagonista?',
      alternativas: ['Su sencillez.', 'Su esfuerzo.', 'Su timidez.', 'Su compasión.'],
    },
    MAT: {
      contexto: 'Un galón de pintura de 3,8 L cuesta $19.190 y rinde 30 m².',
      enunciado:
        '¿Cuánto dinero se paga por un litro de pintura si se compra en el formato de galón?',
      alternativas: ['$640', '$1.279', '$2.432', '$5.050'],
    },
    CIE: {
      enunciado:
        '¿Qué nivel de organización ecológica contempla la interacción de los individuos de una misma especie?',
      alternativas: ['Biósfera', 'Poblaciones', 'Ecosistemas', 'Comunidades'],
    },
    HIS: {
      contexto:
        'La Ilustración fue un movimiento cultural e intelectual europeo (siglos XVII–XIX).',
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
  },
};

export function ejemploDeAsignatura(codigo: string, cursoId = 'm1'): EjemploPregunta | undefined {
  const preguntasCurso = EJEMPLOS_PREGUNTA[cursoId] || EJEMPLOS_PREGUNTA['m1'];
  return preguntasCurso[codigo];
}
