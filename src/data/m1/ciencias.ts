import type { Modulo } from '../tipos';

const A = 'm1-cie';

export const modulosCiencias: Modulo[] = [
  // — Biología —
  {
    id: 'm1-cie-bio-oa2',
    asignaturaId: A,
    codigo: 'M1-CIE-BIO-OA2',
    numero: '2',
    eje: 'Biología',
    titulo: 'Evolución',
    descripcion:
      'Analizar e interpretar datos para proveer evidencias de que la diversidad de organismos es el resultado de la evolución, considerando evidencias (registro fósil, estructuras homólogas, embriología, secuencias de ADN), los postulados de la selección natural y los aportes de Darwin y Wallace.',
    indicadores: [
      'Interpretar evidencias evolutivas (registro fósil, estructuras homólogas, embriología, ADN).',
      'Describir elementos básicos de la especiación y su relación con la evolución.',
      'Explicar la selección natural y sus postulados (sobreproducción, variación, adaptación, selección).',
      'Analizar la relación entre Darwin, Wallace y la teoría de la selección natural.',
    ],
  },
  {
    id: 'm1-cie-bio-oa4',
    asignaturaId: A,
    codigo: 'M1-CIE-BIO-OA4',
    numero: '4',
    eje: 'Biología',
    titulo: 'Ecosistemas e interacciones',
    descripcion:
      'Investigar y explicar cómo se organizan e interactúan los seres vivos en diversos ecosistemas a partir de ejemplos de Chile, considerando los niveles de organización (organismo, población, comunidad, ecosistema) y las interacciones biológicas (depredación, competencia, comensalismo, mutualismo, parasitismo).',
    indicadores: [
      'Reconocer los niveles de organización de los seres vivos.',
      'Explicar la organización de la biodiversidad en organismos, poblaciones y comunidades.',
      'Caracterizar interacciones biológicas (depredación, competencia, comensalismo, mutualismo, parasitismo).',
      'Analizar efectos de interacciones (intra e interespecíficas) sobre el tamaño de poblaciones.',
    ],
  },
  {
    id: 'm1-cie-bio-oa6',
    asignaturaId: A,
    codigo: 'M1-CIE-BIO-OA6',
    numero: '6',
    eje: 'Biología',
    titulo: 'Ciclos biogeoquímicos y flujo de energía',
    descripcion:
      'Desarrollar modelos que expliquen el ciclo del carbono, el nitrógeno, el agua y el fósforo y su importancia biológica, los flujos de energía en un ecosistema (redes y pirámides tróficas) y la trayectoria de contaminantes y su bioacumulación.',
    indicadores: [
      'Describir la función de productores y descomponedores en los ciclos de la materia.',
      'Explicar el rol local y global de los ciclos biogeoquímicos mediante modelos.',
      'Predecir efectos de la alteración de los ciclos por la producción industrial moderna.',
      'Analizar modelos de redes y pirámides tróficas (eficiencia de transferencia de energía).',
      'Explicar consecuencias de la bioacumulación de sustancias nocivas en distintos niveles tróficos.',
    ],
  },
  {
    id: 'm1-cie-bio-oa8',
    asignaturaId: A,
    codigo: 'M1-CIE-BIO-OA8',
    numero: '8',
    eje: 'Biología',
    titulo: 'Acción humana y desarrollo sustentable',
    descripcion:
      'Explicar y evaluar los efectos de acciones humanas (conservación, cultivos, forestación, deforestación) y de fenómenos naturales (sequías, erupciones volcánicas) sobre el equilibrio de los ecosistemas, la disponibilidad de recursos renovables y no renovables, y las medidas para un desarrollo sustentable.',
    indicadores: [
      'Describir consecuencias de fenómenos naturales (geológicos y climáticos) y del cambio climático.',
      'Proponer acciones humanas para el desarrollo sustentable (diversidad cultural, salud, urbanización).',
      'Describir implicancias sociales, económicas y ambientales de acciones humanas.',
      'Explicar beneficios de medidas de desarrollo sustentable para las generaciones actuales y futuras.',
      'Evaluar estrategias de adaptación al cambio climático o reducción de riesgo de desastres.',
    ],
  },
  // — Física —
  {
    id: 'm1-cie-fis-oa10',
    asignaturaId: A,
    codigo: 'M1-CIE-FIS-OA10',
    numero: '10',
    eje: 'Física',
    titulo: 'Sonido',
    descripcion:
      'Explicar fenómenos del sonido perceptibles por las personas (eco, resonancia, efecto Doppler) utilizando el modelo ondulatorio, considerando sus características y cualidades (intensidad, tono, timbre, rapidez), emisiones, consecuencias y aplicaciones tecnológicas (ecógrafo, sonar, estetoscopio).',
    indicadores: [
      'Describir tono, intensidad y timbre desde frecuencia, amplitud y forma de la onda.',
      'Explicar reflexión, refracción, absorción, difracción, interferencia, eco, resonancia y efecto Doppler.',
      'Determinar la rapidez del sonido en un medio.',
      'Explicar consecuencias de los fenómenos acústicos (contaminación acústica, comunicación).',
      'Describir aplicaciones tecnológicas del sonido (sonar, ecógrafo, estetoscopio).',
    ],
  },
  {
    id: 'm1-cie-fis-oa11',
    asignaturaId: A,
    codigo: 'M1-CIE-FIS-OA11',
    numero: '11',
    eje: 'Física',
    titulo: 'Luz',
    descripcion:
      'Explicar fenómenos luminosos (reflexión, refracción, interferencia, efecto Doppler) por medio de la experimentación y el uso de modelos, considerando los modelos corpuscular y ondulatorio de la luz, sus características y propagación, la formación de imágenes (espejos y lentes), la formación de colores y sus aplicaciones tecnológicas.',
    indicadores: [
      'Describir los modelos de la luz (ondulatorio y corpuscular).',
      'Explicar la formación de sombras por la propagación rectilínea de la luz.',
      'Explicar la reflexión y la formación de imágenes en espejos planos, cóncavos y convexos.',
      'Explicar la refracción y la formación de imágenes a través de lentes.',
      'Explicar la reflexión total interna y sus aplicaciones.',
      'Describir difracción, interferencia y efecto Doppler de la luz.',
      'Explicar la importancia del efecto Doppler de la luz en astronomía.',
    ],
  },
  {
    id: 'm1-cie-fis-oa14',
    asignaturaId: A,
    codigo: 'M1-CIE-FIS-OA14',
    numero: '14',
    eje: 'Física',
    titulo: 'Sistema solar',
    descripcion:
      'Crear modelos que expliquen los fenómenos astronómicos del sistema solar: movimientos del sistema Tierra-Luna (fases lunares, eclipses), movimientos de la Tierra respecto del Sol (estaciones) y la comparación de los planetas con la Tierra.',
    indicadores: [
      'Describir movimientos relativos Tierra-Luna y Tierra-Sol con modelos.',
      'Explicar fases lunares y eclipses con óptica geométrica y modelos Tierra-Luna.',
      'Explicar las estaciones climáticas con modelos Tierra-Sol.',
      'Comparar la Tierra con los demás planetas (radio, tamaño, período orbital, atmósfera, gravedad).',
    ],
  },
  {
    id: 'm1-cie-fis-oa16',
    asignaturaId: A,
    codigo: 'M1-CIE-FIS-OA16',
    numero: '16',
    eje: 'Física',
    titulo: 'Investigación astronómica en Chile',
    descripcion:
      'Investigar y explicar sobre la investigación astronómica en Chile y el resto del mundo, considerando el clima y las ventajas del país para la observación, la tecnología utilizada, la información que proporciona la luz y otras radiaciones, y los aportes de científicas y científicos chilenos.',
    indicadores: [
      'Explicar las ventajas del cielo del norte de Chile para la observación (humedad, transparencia).',
      'Identificar recursos de observación para iniciados (prismáticos, telescopios) y profesionales (telescopios, radiotelescopios).',
      'Describir la astronomía de los pueblos originarios presentes en Chile.',
    ],
  },
  // — Química —
  {
    id: 'm1-cie-qui-oa17',
    asignaturaId: A,
    codigo: 'M1-CIE-QUI-OA17',
    numero: '17',
    eje: 'Química',
    titulo: 'Reacciones químicas',
    descripcion:
      'Investigar experimentalmente y explicar, usando evidencias, que la fermentación, la combustión y la oxidación de metales son reacciones químicas de la vida diaria, considerando la producción de gas, precipitados, cambios de temperatura/color/olor y emisión de luz, la influencia de cantidad, temperatura, volumen y presión, su representación en ecuaciones químicas y su impacto en los seres vivos y el entorno.',
    indicadores: [
      'Reconocer reactantes y productos en una ecuación química.',
      'Identificar evidencias de reacción (gas, precipitados, cambios de temperatura, olor, color, luz).',
      'Reconocer tipos de ecuaciones (descomposición, combustión) en el entorno y los seres vivos.',
      'Analizar reacciones a partir del balance de reactantes y productos.',
      'Identificar elementos químicos de la combustión y la fermentación.',
      'Clasificar reacciones (descomposición, sustitución, síntesis, oxidación) cualitativa y cuantitativamente.',
    ],
  },
  {
    id: 'm1-cie-qui-oa20',
    asignaturaId: A,
    codigo: 'M1-CIE-QUI-OA20',
    numero: '20',
    eje: 'Química',
    titulo: 'Estequiometría',
    descripcion:
      'Establecer relaciones cuantitativas entre reactantes y productos en reacciones químicas (estequiometría) y explicar la formación de compuestos útiles para los seres vivos, como la formación de la glucosa en la fotosíntesis.',
    indicadores: [
      'Evaluar la representación de reacciones según la ley de conservación de la materia.',
      'Calcular equivalentes estequiométricos del mol (número de átomos, moléculas, partículas).',
      'Analizar reacciones conocidas en industria y ambiente (lluvia ácida, amoníaco) con leyes ponderales y cálculos estequiométricos.',
    ],
  },
];
