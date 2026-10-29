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

  // --- 6° Básico ---
  {
    id: 'b6-temario',
    cursoId: 'b6',
    asignatura: 'ALL',
    nombre: 'Temario Oficial 6° Básico (MINEDUC)',
    archivo: 'examenes/b6-temario.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2025/03/temario_basica_6deg_basico_UCE.pdf',
    esTemario: true,
  },
  {
    id: 'b6-lengua',
    cursoId: 'b6',
    asignatura: 'LEN',
    nombre: 'Lenguaje y Comunicación (Nivel Básico 2)',
    archivo: 'examenes/b5-lengua.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/ejemplos-de-preguntas-_NB2-lenguaje-2026_DS10.pdf',
  },
  {
    id: 'b6-matematica',
    cursoId: 'b6',
    asignatura: 'MAT',
    nombre: 'Educación Matemática (Nivel Básico 2)',
    archivo: 'examenes/b5-matematica.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2025/03/ejemplos-de-preguntas-_NB2-matematica-2025_DS257-uv.pdf',
  },
  {
    id: 'b6-ciencias',
    cursoId: 'b6',
    asignatura: 'CIE',
    nombre: 'Ciencias Naturales (Nivel Básico 2)',
    archivo: 'examenes/b5-ciencias.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/ejemplos-de-preguntas-_NB2-C-Naturales-2026_DS10.pdf',
  },
  {
    id: 'b6-historia',
    cursoId: 'b6',
    asignatura: 'HIS',
    nombre: 'Historia, Geografía y Ciencias Sociales (Nivel Básico 2)',
    archivo: 'examenes/b5-historia.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/Preguntas-ejemplos-NB2-D10-VE-2026.pdf',
  },

  // --- 7° Básico ---
  {
    id: 'b7-temario',
    cursoId: 'b7',
    asignatura: 'ALL',
    nombre: 'Temario Oficial 7° Básico (MINEDUC)',
    archivo: 'examenes/b7-temario.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/03/temario_basica_7deg_basico_uce.pdf',
    esTemario: true,
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
  b6: {
    LEN: {
      contexto:
        '“El bosque respiraba en silencio mientras los árboles mecían sus copas al compás de la brisa marina”.',
      enunciado: '¿Qué figura literaria predomina en la expresión “El bosque respiraba en silencio”?',
      alternativas: ['Personificación.', 'Hipérbole.', 'Comparación.', 'Aliteración.'],
    },
    MAT: {
      contexto: 'En un curso de 30 estudiantes, 12 son mujeres y 18 son hombres.',
      enunciado: '¿Cuál es la razón simplificada entre la cantidad de mujeres y el total de estudiantes?',
      alternativas: ['2 : 5', '3 : 5', '2 : 3', '1 : 2'],
    },
    CIE: {
      enunciado: '¿Cuál de los siguientes elementos es un reactante indispensable para la fotosíntesis?',
      alternativas: [
        'Dióxido de carbono (CO2).',
        'Glucosa.',
        'Oxígeno libre.',
        'Materia orgánica descompuesta.',
      ],
    },
    HIS: {
      enunciado: '¿Cuál fue el hecho inmediato que precipitó la formación de juntas de gobierno en América en 1810?',
      alternativas: [
        'El cautiverio del rey Fernando VII por Napoleón Bonaparte.',
        'La firma de la Declaración de Independencia de EE.UU.',
        'La promulgación de la Constitución liberal de 1833.',
        'El triunfo del ejército patriota en la Batalla de Maipú.',
      ],
    },
    ING: {
      contexto: 'The library is next to the bank and in front of the supermarket.',
      enunciado: 'Where is the library located?',
      alternativas: [
        'In front of the supermarket.',
        'Inside the bank.',
        'Far from the city.',
        'Behind the hospital.',
      ],
    },
  },
  b7: {
    LEN: {
      contexto:
        '“El autor sostiene en su columna que el acceso a internet debe ser considerado un servicio básico universal en el siglo XXI”.',
      enunciado: '¿Cuál de las siguientes afirmaciones del texto corresponde a un HECHO comprobable y no a una opinión?',
      alternativas: [
        'En Chile más del 85% de los hogares cuenta con acceso a internet móvil o fijo.',
        'Internet es el invento más maravilloso y perfecto de la humanidad.',
        'Los jóvenes deberían pasar menos horas navegando en redes sociales.',
        'Todo gobierno tiene la obligación moral ineludible de regalar computadores.',
      ],
    },
    MAT: {
      contexto: 'Un buzo desciende a -18 metros de profundidad y luego asciende 7 metros.',
      enunciado: '¿A qué profundidad en metros se encuentra ahora el buzo?',
      alternativas: ['-11 m', '-25 m', '11 m', '-7 m'],
    },
    CIE: {
      enunciado: '¿Cuál es la principal causa que origina el movimiento de las placas tectónicas en la litósfera?',
      alternativas: [
        'Las corrientes de convección del magma en el manto terrestre.',
        'La fuerza de atracción gravitacional de la Luna sobre los continentes.',
        'El movimiento continuo de las olas en las fosas marinas.',
        'El campo magnético originado en el núcleo externo de la Tierra.',
      ],
    },
    HIS: {
      enunciado: '¿Cuál fue la consecuencia fundamental de la Revolución Neolítica para las sociedades humanas?',
      alternativas: [
        'La consolidación del sedentarismo gracias a la agricultura y domesticación de animales.',
        'El inicio inmediato de las primeras rutas marítimas hacia América.',
        'El desarrollo de las armas de fuego y la metalurgia del acero.',
        'El abandono total de toda forma de comercio o intercambio entre comunidades.',
      ],
    },
    ING: {
      contexto: 'I was doing my English homework when suddenly the telephone rang.',
      enunciado: 'What action was in progress when the telephone rang?',
      alternativas: [
        'Doing English homework.',
        'Sleeping in the bedroom.',
        'Answering the telephone call.',
        'Watching television with friends.',
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
