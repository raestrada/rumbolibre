// Directrices curriculares específicas del MINEDUC para la evaluación de cada asignatura
// (Validación de Estudios / Exámenes Libres, 1° medio, Decreto N°614/2013).
// Basadas en los temarios y pruebas de ejemplo oficiales publicadas por el Ministerio de Educación de Chile.

export type TipoPreguntaMineduc = 'seleccion_multiple' | 'verdadero_falso' | 'analisis_caso';

export interface CriterioProfundizacion {
  meta: string;
  queIncluye: string[];
  queFaltaSiNoSeProfundiza: string;
}

export interface GuiaMineducAsignatura {
  codigo: string;
  nombre: string;
  enfoqueMineduc: string;
  tiposPermitidos: TipoPreguntaMineduc[];
  contextosTipicos: string[];
  criteriosDistractores: string[];
  criterioProfundizacion: CriterioProfundizacion;
  ejemploOficial: {
    tipo: TipoPreguntaMineduc;
    contexto?: string;
    enunciado: string;
    alternativas: string[];
    correcta: number; // 0-based
    explicacion: string;
  };
}

export const GUIAS_MINEDUC: Record<string, GuiaMineducAsignatura> = {
  LEN: {
    codigo: 'LEN',
    nombre: 'Lengua y Literatura',
    enfoqueMineduc:
      'Comprensión lectora de textos narrativos (cuentos, novelas) y expositivos/argumentativos. Identificación de la idea principal, rasgos de personajes, vocabulario contextual deducido del fragmento, formas discursivas (definición, caracterización, narración) e inferencias locales y globales. No evaluar memorización abstracta de reglas gramaticales, sino lectura analítica.',
    tiposPermitidos: ['analisis_caso', 'seleccion_multiple', 'verdadero_falso'],
    contextosTipicos: [
      'Fragmento narrativo de 3 a 5 líneas con una situación cotidiana o personajes en acción.',
      'Párrafo expositivo breve sobre divulgación cultural, científica o social.',
      'Oración con una palabra destacada cuyo significado deba inferirse del contexto.',
    ],
    criteriosDistractores: [
      'Distractores que tomen detalles secundarios del texto pero no respondan a la idea central o inferencia.',
      'Sinónimos aproximados pero inadecuados para el sentido preciso del contexto.',
      'Interpretaciones literales de figuras retóricas o expresiones figuradas.',
    ],
    criterioProfundizacion: {
      meta: 'Lectura analítica e inferencial sobre fragmentos concretos, no mera teoría conceptual.',
      queIncluye: [
        'Análisis de un fragmento de lectura real paso a paso (identificando pistas textuales).',
        'Distinción clara entre lo que el texto dice explícitamente y lo que se deduce o infiere.',
        'Vocabulario en contexto y advertencia sobre trampas de lectura rápida en el examen.',
      ],
      queFaltaSiNoSeProfundiza:
        'Falta analizar un texto concreto, practicar deducción de vocabulario y distinguir inferencias de datos textuales.',
    },
    ejemploOficial: {
      tipo: 'analisis_caso',
      contexto:
        'Marcos trabajaba en un restaurant de comida rápida. Sacaba la basura por la puerta trasera. Siempre lo esperaban ansiosas algunas palomas con mirada hambrienta. Entre ellas había una a la que le faltaba una pata. Un día preparó una trampa con una caja y una pitilla para rescatarla y fabricarle una pata nueva con una cucharita de plástico.',
      enunciado: '¿Qué rasgo sobresale en la personalidad del protagonista a partir del relato?',
      alternativas: ['Su sencillez.', 'Su esfuerzo físico.', 'Su timidez ante los demás.', 'Su compasión hacia los animales.'],
      correcta: 3,
      explicacion:
        'La compasión es el rasgo evidente al dedicar tiempo e ingenio para curar y ayudar a una paloma herida sin esperar nada a cambio.',
    },
  },

  MAT: {
    codigo: 'MAT',
    nombre: 'Matemática',
    enfoqueMineduc:
      'Resolución de problemas contextualizados en situaciones reales de Chile: compras por volumen (galón vs tineta, costo por m²), presupuestos domésticos, proporciones directas e inversas, cálculo de áreas y perímetros para pintar o construir, escalas de temperatura (°C a °F), interpretación de tablas y gráficos estadísticos (precipitaciones, censos). Distractores basados en errores de procedimiento típicos de 1° medio.',
    tiposPermitidos: ['analisis_caso', 'seleccion_multiple', 'verdadero_falso'],
    contextosTipicos: [
      'Caso cotidiano de compra o rendimiento: galones de 3,8 L a cierto precio para cubrir determinada superficie en m².',
      'Tabla de datos con mediciones reales (precipitaciones en ciudades de Chile, temperaturas, cuentas de servicios).',
      'Problema geométrico de cálculo de superficie de paredes o suelos rectangulares.',
      'Ecuación o función lineal que modela una situación de costo fijo más costo variable.',
    ],
    criteriosDistractores: [
      'Distractor obtenido de omitir la conversión de unidades (ej. no dividir por 3,8 L para obtener el precio por litro).',
      'Distractor que surge de calcular el costo directo sin descontar o sumar la proporción indicada.',
      'Error de signos al despejar una incógnita o trasladar términos en una ecuación.',
      'Confusión entre superficie (m²) y perímetro (m) en problemas geométricos.',
    ],
    criterioProfundizacion: {
      meta: 'Resolución paso a paso de un problema numérico chileno con análisis de errores de cálculo comunes.',
      queIncluye: [
        'Desglose del cálculo paso a paso con las unidades de medida explícitas (pesos, litros, m², etc.).',
        'Trampas típicas de examen: dónde se equivocan habitualmente los alumnos (signos, conversiones, porcentajes).',
        'Verificación e interpretación del resultado matemático en el contexto de la vida real.',
      ],
      queFaltaSiNoSeProfundiza:
        'Falta resolver un problema numérico completo paso a paso y revisar las trampas de cálculo más habituales.',
    },
    ejemploOficial: {
      tipo: 'analisis_caso',
      contexto: 'Un galón de pintura de 3,8 litros cuesta $19.190 y rinde para cubrir 30 m² de superficie lisa.',
      enunciado: '¿Cuánto dinero se paga aproximadamente por un litro de pintura si se compra en el formato de galón?',
      alternativas: ['$640', '$1.279', '$2.432', '$5.050'],
      correcta: 3,
      explicacion:
        'Dividiendo el costo total del galón ($19.190) entre su volumen en litros (3,8 L): 19.190 ÷ 3,8 = $5.050 por litro.',
    },
  },

  CIE: {
    codigo: 'CIE',
    nombre: 'Ciencias Naturales',
    enfoqueMineduc:
      'Integración de Biología, Física y Química de 1° medio. Biología: niveles de organización ecológica (individuo, población, comunidad, ecosistema, biósfera), fotosíntesis, leyes de la genética mendeliana y función del ADN. Química: masa molar, ley de conservación de la materia en reacciones químicas, carbono y moléculas orgánicas. Física: ondas electromagnéticas vs mecánicas (luz y sonido), concepto de trabajo (W = F × d) y fuerza.',
    tiposPermitidos: ['analisis_caso', 'seleccion_multiple', 'verdadero_falso'],
    contextosTipicos: [
      'Tabla de datos experimentales con masa de reactantes y productos antes y después de una reacción.',
      'Situación ecológica concreta observada en un bosque o humedal chileno.',
      'Problema físico aplicado: aplicar una fuerza constante en Newtons para desplazar un objeto una distancia en metros.',
      'Comparación de propiedades físicas entre la luz solar y el sonido en distintos medios.',
    ],
    criteriosDistractores: [
      'Confundir población (misma especie) con comunidad (distintas especies que interactúan) o ecosistema (incluye factores abióticos).',
      'Asumir erróneamente que la masa se destruye o se pierde en una reacción con desprendimiento de gas.',
      'Confundir magnitudes ondulatorias (frecuencia, período, longitud de onda y velocidad de propagación).',
      'Confundir fuerza (N) con trabajo mecánico (J = N·m).',
    ],
    criterioProfundizacion: {
      meta: 'Aplicación de leyes científicas y distinción rigurosa de conceptos limítrofes que suelen confundirse.',
      queIncluye: [
        'Comparación directa entre conceptos que se prestan a confusión (ej. población vs comunidad, onda mecánica vs electromagnética).',
        'Aplicación a un fenómeno observable o caso de laboratorio con datos concretos.',
        'Regla de conservación, fórmula o principio biológico/químico/físico fundamental para el examen.',
      ],
      queFaltaSiNoSeProfundiza:
        'Falta contrastar con los conceptos limítrofes y aplicar la ley científica a un fenómeno o experimento real.',
    },
    ejemploOficial: {
      tipo: 'seleccion_multiple',
      contexto: '',
      enunciado:
        '¿Qué nivel de organización ecológica contempla exclusivamente la interacción de los individuos de una misma especie que habitan en un lugar y tiempo determinado?',
      alternativas: ['Biósfera', 'Poblaciones', 'Ecosistemas', 'Comunidades'],
      correcta: 1,
      explicacion:
        'Una población biológica está formada por organismos de la misma especie que comparten un área y tiempo común. La comunidad incluye múltiples especies y el ecosistema añade factores abióticos.',
    },
  },

  HIS: {
    codigo: 'HIS',
    nombre: 'Historia, Geografía y Ciencias Sociales',
    enfoqueMineduc:
      'Comprensión de procesos históricos y formación ciudadana. La Ilustración y su crítica al absolutismo y al origen divino del poder; ideas republicanas y liberales del siglo XIX; la Revolución Industrial; el Imperialismo y la Primera Guerra Mundial; la Gran Depresión de 1929 y el surgimiento del Estado de Bienestar y los totalitarismos; institucionalidad democrática chilena, plebiscito de 1988 y derechos humanos.',
    tiposPermitidos: ['analisis_caso', 'seleccion_multiple', 'verdadero_falso'],
    contextosTipicos: [
      'Fragmento de fuente histórica primaria (texto de pensador ilustrado, proclama, discurso o ley).',
      'Breve descripción de un acontecimiento económico crucial como la crisis bursátil de 1929 y sus efectos en Chile.',
      'Situación que ejemplifica el funcionamiento de los poderes del Estado o el ejercicio del sufragio en Chile.',
    ],
    criteriosDistractores: [
      'Anacronismos: atribuir a la Ilustración ideas del siglo XX o al absolutismo principios de soberanía popular.',
      'Confundir las causas de la crisis de 1929 con sus efectos (como el proteccionismo y rol del Estado).',
      'Confundir los tres poderes del Estado o sus atribuciones en la Constitución chilena.',
      'Atribuir el triunfo del Plebiscito de 1988 al continuismo del régimen militar.',
    ],
    criterioProfundizacion: {
      meta: 'Comprensión multicausal, análisis de fuentes y conexión con la ciudadanía chilena contemporánea.',
      queIncluye: [
        'Análisis de las causas de fondo vs detonantes inmediatos del proceso histórico.',
        'Impacto concreto en los derechos, la economía o la vida cotidiana de las personas.',
        'Reflexión sobre la vigencia del proceso en la institucionalidad democrática actual de Chile.',
      ],
      queFaltaSiNoSeProfundiza:
        'Falta analizar la multicausalidad histórica y conectar el proceso con sus repercusiones cívicas y democráticas.',
    },
    ejemploOficial: {
      tipo: 'analisis_caso',
      contexto:
        'La Ilustración fue un movimiento cultural e intelectual europeo (siglos XVII a XIX) que promovió el uso de la razón para iluminar a la sociedad y cuestionó las estructuras heredadas del Antiguo Régimen.',
      enunciado: 'Además de la razón y el progreso, ¿qué principio político fundamental caracterizó a la Ilustración?',
      alternativas: [
        'La defensa del origen divino del poder de los reyes.',
        'La soberanía popular y la división de los poderes del Estado.',
        'La concentración de todas las decisiones en la autoridad eclesiástica.',
        'La eliminación de la educación pública para preservar las tradiciones.',
      ],
      correcta: 1,
      explicacion:
        'Pensadores ilustrados como Montesquieu, Rousseau y Locke plantearon que la soberanía reside en el pueblo y que el poder debe dividirse para evitar la tiranía absolutista.',
    },
  },

  ING: {
    codigo: 'ING',
    nombre: 'Inglés',
    enfoqueMineduc:
      'Comprensión lectora funcional de textos breves en inglés para 1° medio: letreros, carteles públicos y avisos cotidianos, diálogos de presentación o profesiones, vocabulario deducido del contexto (evitando falsos amigos), tiempos verbales básicos (presente simple, pasado simple, verbos modales can/must/should).',
    tiposPermitidos: ['analisis_caso', 'seleccion_multiple', 'verdadero_falso'],
    contextosTipicos: [
      'Letrero o aviso en inglés en un lugar público: "Notice: You cannot take photographs in this area".',
      'Diálogo cotidiano breve: "What do you do? / I am a secondary school teacher".',
      'Párrafo corto sobre una costumbre internacional donde una palabra tiene significado específico.',
    ],
    criteriosDistractores: [
      'Falsos cognados: interpretar "course" como curso escolar en vez de plato/comida cuando se habla de alimentos.',
      'Incongruencia comunicativa: responder con la edad o procedencia cuando la pregunta es sobre ocupación ("What do you do?").',
      'Confundir una prohibición ("cannot / do not") con una invitación o instrucción afirmativa.',
    ],
    criterioProfundizacion: {
      meta: 'Lectura funcional de avisos y diálogos reales, descartando falsos amigos y trampas gramaticales.',
      queIncluye: [
        'Identificación del propósito comunicativo del cartel o diálogo (¿para qué sirve?).',
        'Descarte explícito de falsos amigos (palabras que se parecen al español pero significan otra cosa).',
        'Uso práctico de conectores y estructuras clave para 1° medio.',
      ],
      queFaltaSiNoSeProfundiza:
        'Falta practicar con letreros o diálogos reales y advertir sobre los falsos amigos de vocabulario.',
    },
    ejemploOficial: {
      tipo: 'analisis_caso',
      contexto:
        '“In traditional Chinese banquets there is not just one course; dishes are served together and people share food using chopsticks”.',
      enunciado: 'According to the context of the sentence, what is the meaning of the word “course”?',
      alternativas: ['A dish or part of a meal.', 'An academic school subject.', 'A natural river pathway.', 'A sports training program.'],
      correcta: 0,
      explicacion:
        'En el contexto gastronómico de un banquete, "course" alude a un plato o tiempo de la comida, no a un curso de estudio.',
    },
  },
};

export function getGuiaMineduc(codigoAsignatura: string): GuiaMineducAsignatura {
  const norm = codigoAsignatura.trim().toUpperCase();
  if (GUIAS_MINEDUC[norm]) return GUIAS_MINEDUC[norm];
  // Retornar guía por defecto basada en ciencias y humanidades de 1° medio
  return {
    codigo: norm,
    nombre: 'Asignatura 1° medio',
    enfoqueMineduc:
      'Evaluación oficial según el temario de Validación de Estudios del MINEDUC. Preguntas directas, de análisis y de verdadero/falso que midan habilidades de comprensión, aplicación y razonamiento, sin trivialidades.',
    tiposPermitidos: ['analisis_caso', 'seleccion_multiple', 'verdadero_falso'],
    contextosTipicos: ['Situación práctica o de aplicación conceptual de la asignatura.'],
    criteriosDistractores: ['Distractores verosímiles que reflejen confusiones conceptuales típicas.'],
    criterioProfundizacion: {
      meta: 'Dominio exhaustivo del objetivo de aprendizaje con ejemplos prácticos y resolución de dudas.',
      queIncluye: ['Explicación detallada con casos reales.', 'Trampas y errores habituales.', 'Síntesis para el examen.'],
      queFaltaSiNoSeProfundiza: 'Falta profundizar en casos aplicados y advertir errores típicos de examinación.',
    },
    ejemploOficial: {
      tipo: 'seleccion_multiple',
      enunciado: 'Pregunta conceptual aplicada sobre el temario oficial.',
      alternativas: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
      correcta: 0,
      explicacion: 'Explicación fundamentada en el temario del MINEDUC.',
    },
  };
}
