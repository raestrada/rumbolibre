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

  // --- 8° Básico ---
  {
    id: 'b8-temario',
    cursoId: 'b8',
    asignatura: 'ALL',
    nombre: 'Temario Oficial 8° Básico (MINEDUC)',
    archivo: 'examenes/b8-temario.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/03/temario_basica_8deg_basico_uce.pdf',
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

  // --- 2° Medio ---
  {
    id: 'm2-temario',
    cursoId: 'm2',
    asignatura: 'ALL',
    nombre: 'Temario Oficial 2° Medio (MINEDUC)',
    archivo: 'examenes/m2-temario.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2025/03/temario_media_2deg_medio_UCE-1.pdf',
    esTemario: true,
  },
  {
    id: 'm2-lengua',
    cursoId: 'm2',
    asignatura: 'LEN',
    nombre: 'Lengua y Literatura (Nivel Medio 1)',
    archivo: 'examenes/lengua.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/ejemplos-de-preguntas-_NM1-lenguaje-2026_DS10.pdf',
  },
  {
    id: 'm2-matematica',
    cursoId: 'm2',
    asignatura: 'MAT',
    nombre: 'Matemática (Nivel Medio 1)',
    archivo: 'examenes/matematica.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2025/03/ejemplos-de-preguntas-_NM1-matematica-2025_DS257-uv.pdf',
  },
  {
    id: 'm2-ciencias',
    cursoId: 'm2',
    asignatura: 'CIE',
    nombre: 'Ciencias Naturales (Nivel Medio 1)',
    archivo: 'examenes/ciencias.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/ejemplos-de-preguntas-_NM1-C-Naturales-2026_DS10.pdf',
  },
  {
    id: 'm2-historia',
    cursoId: 'm2',
    asignatura: 'HIS',
    nombre: 'Historia, Geografía y Ciencias Sociales (Nivel Medio 1)',
    archivo: 'examenes/historia.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/06/Preguntas-ejemplos-nivel-medio-1-D10-VE-2026.pdf',
  },
  {
    id: 'm2-ingles',
    cursoId: 'm2',
    asignatura: 'ING',
    nombre: 'Inglés (Nivel Medio 1)',
    archivo: 'examenes/ingles.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2020/09/PREGUNTAS-PARA-LIBERAR-INGLES-VE257_NM1.pdf',
  },

  // --- 3° Medio ---
  {
    id: 'm3-temario',
    cursoId: 'm3',
    asignatura: 'ALL',
    nombre: 'Temario Oficial 3° Medio (MINEDUC)',
    archivo: 'examenes/m3-temario.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/03/temario_media_3deg_medio_uce.pdf',
    esTemario: true,
  },

  // --- 4° Medio ---
  {
    id: 'm4-temario',
    cursoId: 'm4',
    asignatura: 'ALL',
    nombre: 'Temario Oficial 4° Medio (MINEDUC)',
    archivo: 'examenes/m4-temario.pdf',
    fuente:
      'https://epja.mineduc.cl/wp-content/uploads/sites/43/2026/03/temario_media_4deg_medio_uce.pdf',
    esTemario: true,
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
  b8: {
    LEN: {
      contexto:
        'En una columna de opinión sobre redes sociales, el autor escribe: "Si bien conectan a personas distantes, a menudo aíslan a quienes comparten la misma mesa".',
      enunciado: '¿Cuál es la tesis o punto central del autor en este fragmento?',
      alternativas: [
        'Las redes sociales tienen un impacto ambivalente en las relaciones interpersonales.',
        'Las tecnologías móviles deberían prohibirse durante las comidas familiares.',
        'Las personas distantes se comunican mejor que los miembros de un hogar.',
        'Las redes sociales no aportan ningún beneficio a la sociedad contemporánea.',
      ],
    },
    MAT: {
      contexto: 'Un submarino desciende a una razón constante de -15 metros por minuto.',
      enunciado:
        'Si el submarino desciende durante 4 minutos seguidos a partir de la superficie (0 m), ¿a qué profundidad se encuentra?',
      alternativas: ['-60 m', '-19 m', '60 m', '-11 m'],
    },
    CIE: {
      enunciado:
        '¿Qué organelo celular es el responsable de la respiración celular y producción de energía (ATP) en las células eucariontes?',
      alternativas: [
        'Mitocondria',
        'Cloroplasto',
        'Ribosoma',
        'Aparato de Golgi',
      ],
    },
    HIS: {
      contexto:
        'Durante los siglos XV y XVI, la invención de la imprenta de tipos móviles por Johannes Gutenberg transformó a Europa.',
      enunciado: '¿Cuál fue una de las principales consecuencias directas de la difusión de la imprenta?',
      alternativas: [
        'La rápida difusión de las ideas humanistas, científicas y de la Reforma protestante.',
        'El monopolio exclusivo del conocimiento por parte de los monasterios católicos.',
        'La desaparición inmediata de las lenguas romances y vernáculas en favor del latín.',
        'El cese definitivo de los conflictos religiosos en el Sacro Imperio.',
      ],
    },
    ING: {
      contexto: 'If the weather is sunny this Saturday, our family will go camping in the national park.',
      enunciado: 'According to the sentence, what will happen if it is sunny this Saturday?',
      alternativas: [
        'The family will go camping.',
        'The family will stay at home.',
        'The national park will close.',
        'They went camping last Saturday.',
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
  m2: {
    LEN: {
      contexto:
        'En un ensayo sobre el uso de algoritmos en redes sociales, el autor afirma: "Es indudable que estas plataformas personalizan el contenido, pero también reducen la exposición a ideas distintas".',
      enunciado: '¿Qué función cumple la expresión "Es indudable que" en el argumento anterior?',
      alternativas: [
        'Funciona como modalizador discursivo que expresa un alto grado de certeza.',
        'Introduce un contraargumento emotivo sin respaldo lógico.',
        'Señala una duda abierta respecto de la existencia de los algoritmos.',
        'Reemplaza la tesis central del texto por una anécdota personal.',
      ],
    },
    MAT: {
      contexto: 'Considere la función cuadrática f(x) = x² - 4x + 3.',
      enunciado: '¿Cuáles son las coordenadas del vértice de la parábola que representa a f(x)?',
      alternativas: ['(2, -1)', '(-2, 15)', '(4, 3)', '(1, 0)'],
    },
    CIE: {
      enunciado:
        '¿Qué diferencia fundamental existe entre la mitosis y la meiosis respecto de las células hijas producidas?',
      alternativas: [
        'La mitosis genera dos células diploides idénticas; la meiosis genera cuatro células haploides genéticamente distintas.',
        'La mitosis ocurre solo en gametos sexuales y la meiosis en células musculares.',
        'La mitosis reduce a la mitad el número de cromosomas y la meiosis lo duplica.',
        'Ambas producen exactamente dos células idénticas sin variabilidad genética.',
      ],
    },
    HIS: {
      enunciado:
        '¿Cuál fue una de las principales consecuencias de la crisis económica de 1929 (Gran Depresión) en Europa y América Latina?',
      alternativas: [
        'El cuestionamiento al modelo liberal decimonónico y el surgimiento de totalitarismos, populismos y el Estado de Bienestar.',
        'La consolidación definitiva del patrón oro y la eliminación de los aranceles aduaneros.',
        'El fin inmediato de todos los regímenes autoritarios en Europa occidental.',
        'La creación automática de la Unión Europea como bloque económico único.',
      ],
    },
    ING: {
      contexto: 'If I were the principal of the school, I would create more green areas for students.',
      enunciado: 'What does the sentence express?',
      alternativas: [
        'A hypothetical or imaginary situation in the present.',
        'A routine action that happens every morning.',
        'A past event that occurred before another past action.',
        'A strict obligation imposed by the government.',
      ],
    },
  },
  m3: {
    LEN: {
      contexto:
        'En un foro digital se viraliza un meme que atribuye declaraciones falsas a una autoridad sanitaria, acompañado de insultos hacia quienes opinan distinto.',
      enunciado: 'Al analizar críticamente este género discursivo digital, ¿qué aspecto ético resulta prioritario evaluar?',
      alternativas: [
        'La veracidad de la evidencia compartida y la presencia de descalificaciones o acoso en la comunidad.',
        'La cantidad de colores utilizados en la tipografía de la imagen.',
        'La extensión mínima en párrafos propia de un ensayo académico impreso.',
        'La rima consonante empleada en los comentarios de los usuarios.',
      ],
    },
    MAT: {
      contexto:
        'Dos cursos obtuvieron el mismo promedio (5,5) en un ensayo, pero el Curso A tuvo una desviación estándar de 0,4 y el Curso B una desviación estándar de 1,8.',
      enunciado: '¿Qué conclusión estadística se puede tomar a partir de estas medidas de dispersión?',
      alternativas: [
        'Las notas del Curso A son mucho más homogéneas y cercanas al promedio que las del Curso B.',
        'El Curso B tiene un promedio necesariamente mayor que el Curso A.',
        'Todos los estudiantes del Curso A obtuvieron exactamente la misma nota.',
        'La desviación estándar no aporta información sobre la variabilidad de los datos.',
      ],
    },
    CC: {
      enunciado:
        'Al almacenar productos químicos domésticos como cloro y limpiadores ácidos en el hogar, ¿por qué es fundamental revisar el etiquetado y evitar mezclarlos?',
      alternativas: [
        'Porque su reactividad química puede liberar gases tóxicos peligrosos para la salud respiratoria.',
        'Porque al mezclarlos pierden su color original sin generar efectos en el ambiente.',
        'Porque las etiquetas solo indican la fecha de fabricación comercial.',
        'Porque todos los detergentes domésticos son inertes al entrar en contacto entre sí.',
      ],
    },
    EC: {
      enunciado:
        'En el marco de la democracia chilena y el acceso a la justicia, ¿cuál es el rol principal de la Defensoría Penal Pública?',
      alternativas: [
        'Proporcionar defensa penal gratuita a las personas imputadas o acusadas de un delito que carezcan de abogado.',
        'Dirigir la investigación criminal y formular acusaciones en representación del Estado.',
        'Aprobar las leyes tributarias y el presupuesto anual de la nación.',
        'Administrar los planes reguladores comunales junto a las juntas de vecinos.',
      ],
    },
    FIL: {
      enunciado:
        '¿Qué diferencia fundamental distingue a la validez lógica de la verdad material en un argumento deductivo?',
      alternativas: [
        'La validez depende de que la conclusión se siga lógicamente de las premisas; la verdad depende de la correspondencia con los hechos.',
        'Un argumento válido siempre tiene premisas verdaderas y una conclusión falsa.',
        'La validez solo aplica a opiniones personales y la verdad solo a la ontología.',
        'Son conceptos exactamente sinónimos dentro de la lógica formal.',
      ],
    },
    ING: {
      contexto:
        'Even though remote work offers flexibility, many employees miss face-to-face collaboration; consequently, hybrid schedules have become popular.',
      enunciado: 'According to the text, why have hybrid schedules become popular?',
      alternativas: [
        'Because they balance flexibility with the desire for in-person collaboration.',
        'Because companies banned all forms of remote work.',
        'Because employees prefer working longer hours without breaks.',
        'Because face-to-face collaboration is impossible in modern offices.',
      ],
    },
  },
  m4: {
    LEN: {
      contexto:
        'Dos novelas publicadas con cincuenta años de diferencia abordan la migración: la primera desde el optimismo del progreso industrial y la segunda desde el desarraigo y la precariedad digital.',
      enunciado: 'Al comparar ambas obras literarias, ¿qué elemento explica principalmente la diferencia en el tratamiento del tema?',
      alternativas: [
        'La relación de cada obra con su respectivo contexto histórico y cultural de producción.',
        'La cantidad de capítulos y páginas que posee cada edición impresa.',
        'El uso obligatorio de versos alejandrinos en las novelas contemporáneas.',
        'La prohibición de incorporar narradores en primera persona en el siglo XX.',
      ],
    },
    MAT: {
      contexto:
        'Para financiar un proyecto comunitario, se evalúan dos créditos por el mismo monto y plazo: el Crédito A tiene una tasa de interés anual del 6% y el Crédito B del 9%, ambos con las mismas condiciones de cobro.',
      enunciado: 'Si se busca minimizar el costo financiero total a pagar, ¿qué decisión resulta mejor fundamentada?',
      alternativas: [
        'Elegir el Crédito A porque, a igual monto y plazo, una menor tasa de interés genera un menor pago total de intereses.',
        'Elegir el Crédito B porque una tasa mayor reduce el capital adeudado.',
        'Elegir cualquiera de los dos, ya que la tasa de interés no afecta el monto final.',
        'Dividir el crédito en partes iguales para duplicar los costos de mantención.',
      ],
    },
    CC: {
      enunciado:
        '¿Cuál de las siguientes evidencias científicas respalda directamente los efectos del cambio climático sobre los ecosistemas marinos?',
      alternativas: [
        'La acidificación de los océanos por mayor absorción de CO₂ atmosférico, que afecta organismos calcáreos.',
        'La congelación permanente de todas las corrientes ecuatoriales durante el verano.',
        'La desaparición completa del ciclo hidrológico en las zonas costeras.',
        'El aumento espontáneo de la salinidad debido exclusivamente a las mareas lunares.',
      ],
    },
    EC: {
      enunciado:
        'Dentro de la institucionalidad democrática chilena, ¿qué función cumple principalmente el Servicio Electoral (Servel)?',
      alternativas: [
        'Administrar, supervigilar y fiscalizar los procesos electorales, plebiscitos y el registro electoral.',
        'Dictar sentencias penales en causas de corrupción administrativa.',
        'Redactar y aprobar los proyectos de ley enviados por el Poder Ejecutivo.',
        'Fijar la tasa de política monetaria y controlar la inflación anual.',
      ],
    },
    FIL: {
      enunciado:
        '¿Qué distingue principalmente a la ética de la moral dentro de la reflexión filosófica sobre la praxis?',
      alternativas: [
        'La moral remite a normas y costumbres vividas en una sociedad; la ética es la reflexión filosófica crítica sobre esas normas y su fundamento.',
        'La ética es un conjunto de leyes penales obligatorias y la moral solo aplica al arte.',
        'La moral pertenece exclusivamente a la ontología y la ética a la física.',
        'No existe distinción alguna entre ética, moral y etiqueta social.',
      ],
    },
    ING: {
      contexto:
        'Science fiction stories often explore how emerging technologies such as artificial intelligence might reshape human identity and ethical choices.',
      enunciado: 'What is the main purpose of this statement?',
      alternativas: [
        'To explain how science fiction reflects on technology, identity, and ethics.',
        'To instruct readers on how to program artificial intelligence software.',
        'To argue that science fiction books should be removed from schools.',
        'To describe the history of printing presses in Europe.',
      ],
    },
  },
};

export function ejemploDeAsignatura(codigo: string, cursoId = 'm1'): EjemploPregunta | undefined {
  const preguntasCurso = EJEMPLOS_PREGUNTA[cursoId] || EJEMPLOS_PREGUNTA['m1'];
  return preguntasCurso[codigo];
}
