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

export const ORDEN_MODULOS_B6: string[] = [
  // Semana 1: Fundamentos y descubrimiento
  'b6-len-oa4', // Lenguaje: Narraciones literarias y desenlace
  'b6-mat-oa2', // Matemática: 4 operaciones en problemas > 10.000
  'b6-cie-oa1', // Ciencias: Fotosíntesis
  'b6-his-oa1', // Historia: Antecedentes de la Independencia
  'b6-ing-oa5', // Inglés: Comprensión de textos simples

  // Semana 2: Razones, poesía y tramas
  'b6-mat-oa3', // Matemática: Concepto de razón
  'b6-len-oa5', // Lenguaje: Análisis de poemas
  'b6-cie-oa2', // Ciencias: Cadenas y redes alimentarias
  'b6-his-oa2', // Historia: Proceso de Independencia
  'b6-ing-oa6', // Inglés: Textos cotidianos no literarios

  // Semana 3: Porcentajes, pubertad y república
  'b6-mat-oa4', // Matemática: Concepto de porcentaje
  'b6-len-oa6', // Lenguaje: Textos no literarios
  'b6-cie-oa5', // Ciencias: Cambios en la pubertad
  'b6-his-oa3', // Historia: Organización de la República y Constitución 1833
  'b6-ing-oa8', // Inglés: Reaccionar a textos y vivencias

  // Semana 4: Fracciones impropias y territorio
  'b6-mat-oa5', // Matemática: Fracciones impropias y números mixtos
  'b6-len-oa7', // Lenguaje: Evaluación crítica de información
  'b6-cie-oa6', // Ciencias: Actividad física e higiene en la pubertad
  'b6-his-oa5', // Historia: Conformación del territorio en el siglo XIX
  'b6-ing-oa14', // Inglés: Escritura guiada según modelo

  // Semana 5: Decimales, narraciones y energía
  'b6-mat-oa8', // Matemática: Suma y resta de fracciones y decimales
  'b6-len-oa14', // Lenguaje: Escritura de narraciones
  'b6-cie-oa8', // Ciencias: La energía y origen solar
  'b6-his-oa7', // Historia: Democratización en el siglo XX
  'b6-ing-oa15', // Inglés: Escritura comunicativa cotidiana

  // Semana 6: Ecuaciones, información y cambios sociales
  'b6-mat-oa11', // Matemática: Ecuaciones de 1° grado con 1 incógnita
  'b6-len-oa15', // Lenguaje: Artículos informativos
  'b6-cie-oa11', // Ciencias: Recursos energéticos renovables y no renovables
  'b6-his-oa8', // Historia: Quiebre democrático y recuperación
  'b6-his-oa9', // Historia: Continuidades y cambios en la sociedad chilena

  // Semana 7: Ángulos, superficie y regiones
  'b6-mat-oa16', // Matemática: Ángulos entre rectas que se cortan
  'b6-mat-oa18', // Matemática: Superficie de cubos y paralelepípedos
  'b6-cie-oa13', // Ciencias: Cambios de estado a nivel particulado
  'b6-his-oa11', // Historia: Regiones político-administrativas
  'b6-his-oa12', // Historia: Ambientes naturales de Chile

  // Semana 8: Volumen, capas terrestres y democracia
  'b6-mat-oa19', // Matemática: Volumen de cubos y paralelepípedos
  'b6-cie-oa16', // Ciencias: Capas de la Tierra
  'b6-his-oa15', // Historia: Organización democrática y poderes del Estado
  'b6-his-oa16', // Historia: Constitución Política y garantías
  'b6-cie-oa18', // Ciencias: Consecuencias de la erosión sobre la superficie

  // Semana 9: Probabilidad, gráficos y derechos humanos
  'b6-mat-oa23', // Matemática: Conjeturas en experimentos aleatorios
  'b6-mat-oa24', // Matemática: Gráficos de barra doble y circulares
  'b6-his-oa17', // Historia: Derechos fundamentales y DD.HH.
  'b6-his-oa18', // Historia: Deberes, responsabilidades y bien común
];

export const ORDEN_MODULOS_B7: string[] = [
  // Semana 1: Fundamentos y orígenes
  'b7-len-oa3', // Lengua: Narraciones y conflicto
  'b7-mat-oa1', // Matemática: Números enteros
  'b7-cie-oa1', // Ciencias: Sexualidad humana
  'b7-his-oa2', // Historia: Revolución neolítica y agricultura
  'b7-ing-oa9', // Inglés: Comprensión general y explícita

  // Semana 2: Poesía, fracciones y primeras civilizaciones
  'b7-mat-oa3', // Matemática: Multiplicación y división de fracciones y decimales
  'b7-len-oa4', // Lengua: Análisis de poemas y lenguaje figurado
  'b7-cie-oa2', // Ciencias: Reproducción humana y ciclo menstrual
  'b7-his-oa3', // Historia: Primeras civilizaciones y ciudades
  'b7-ing-oa10', // Inglés: Textos no literarios y conectores

  // Semana 3: Porcentajes, microorganismos y democracia ateniense
  'b7-mat-oa4', // Matemática: Porcentajes e IVA
  'b7-len-oa7', // Lengua: Interpretación y contexto histórico
  'b7-cie-oa5', // Ciencias: Microorganismos: virus, bacterias y hongos
  'b7-his-oa6', // Historia: Democracia en Atenas clásica
  'b7-ing-oa13', // Inglés: Escritura multimodal

  // Semana 4: Álgebra, fuerzas y Roma
  'b7-mat-oa6', // Matemática: Lenguaje algebraico y ecuaciones
  'b7-len-oa8', // Lengua: Textos argumentativos y hecho vs opinión
  'b7-cie-oa7', // Ciencias: Fuerzas: gravedad, roce y elástica
  'b7-his-oa7', // Historia: Civilización romana e imperio
  'b7-ing-oa16', // Inglés: Obligaciones, rutinas y pasado continuo

  // Semana 5: Proporciones, tectónica y época medieval
  'b7-mat-oa8', // Matemática: Proporciones directas e inversas
  'b7-len-oa9', // Lengua: Medios de comunicación y estereotipos
  'b7-cie-oa9', // Ciencias: Tectónica de placas y sismos
  'b7-his-oa9', // Historia: Civilización europea medieval e Iglesia
  'b7-his-oa12', // Historia: Transformaciones desde siglo XII y universidades

  // Semana 6: El círculo, gases ideales y Mesoamérica
  'b7-mat-oa11', // Matemática: Perímetro y área del círculo
  'b7-len-oa15', // Lengua: Proceso de escritura y corrección
  'b7-cie-oa13', // Ciencias: Comportamiento de gases ideales
  'b7-his-oa13', // Historia: Mayas y aztecas en Mesoamérica
  'b7-his-oa16', // Historia: Legado de civilizaciones en Latinoamérica

  // Semana 7: Plano cartesiano, materia y ciudadanía
  'b7-mat-oa14', // Matemática: Plano cartesiano en 4 cuadrantes
  'b7-cie-oa14', // Ciencias: Sustancias puras, mezclas y separación
  'b7-his-oa18', // Historia: Ciudadanía, república y gremio
  'b7-his-oa19', // Historia: Diversidad cultural en el mundo antiguo y medieval
  'b7-his-oa20', // Historia: Convivencia y resolución pacífica de conflictos

  // Semana 8: Estadística, probabilidades y medio ambiente
  'b7-mat-oa16', // Matemática: Tablas de frecuencia y gráficos
  'b7-mat-oa18', // Matemática: Probabilidades de eventos
  'b7-his-oa21', // Historia: Relación ser humano y medio ambiente
  'b7-his-oa22', // Historia: Impacto humano y medidas de mitigación
];

export const ORDEN_MODULOS_B8: string[] = [
  // Semana 1: Fundamentos y época moderna
  'b8-len-oa3', // Lengua: Narraciones, personajes tipo y tópicos
  'b8-mat-oa1', // Matemática: Multiplicación y división de enteros
  'b8-cie-oa2', // Ciencias: Estructura y función celular eucarionte/procarionte
  'b8-his-oa2', // Historia: Transición medieval a moderna, Reforma e imprenta
  'b8-ing-oa9', // Inglés: Comprensión general y explícita

  // Semana 2: Racionales, poemas y Estado moderno
  'b8-mat-oa2', // Matemática: Operaciones con racionales en problemas
  'b8-len-oa4', // Lengua: Poemas, lenguaje figurado y repeticiones
  'b8-cie-oa4', // Ciencias: Plantas: ósmosis y estomas
  'b8-his-oa3', // Historia: El Estado moderno y monarquías nacionales
  'b8-ing-oa10', // Inglés: Textos no literarios, conectores y sufijos

  // Semana 3: Potencias, dilemas humanos y mercantilismo
  'b8-mat-oa3', // Matemática: Potencias de base y exponente natural
  'b8-len-oa8', // Lengua: Interpretación de textos literarios y dilemas
  'b8-cie-oa5', // Ciencias: Interacción sistemas vitales: digestivo, circulatorio, etc.
  'b8-his-oa4', // Historia: Economía mercantilista del siglo XVI
  'b8-ing-oa13', // Inglés: Escritura multimodal de historias e información

  // Semana 4: Raíces cuadradas, argumentación y Conquista
  'b8-mat-oa4', // Matemática: Raíces cuadradas de números naturales
  'b8-len-oa9', // Lengua: Textos argumentativos y modos verbales
  'b8-cie-oa7', // Ciencias: Factores para un cuerpo saludable y prevención
  'b8-his-oa7', // Historia: Impacto de la conquista y debates de Valladolid
  'b8-ing-oa16', // Inglés: Comparativos, futuro will/going to y condicional

  // Semana 5: Ecuaciones, circuitos y sociedad colonial
  'b8-mat-oa8', // Matemática: Ecuaciones e inecuaciones lineales
  'b8-len-oa10', // Lengua: Medios de comunicación y estereotipos
  'b8-cie-oa10', // Ciencias: Circuitos eléctricos: serie y paralelo, Ley de Ohm
  'b8-his-oa11', // Historia: Sociedad colonial: castas, encomienda y mestizaje
  'b8-his-oa12', // Historia: Sociedad de frontera y resistencia mapuche

  // Semana 6: Función afín, calor e Ilustración
  'b8-mat-oa10', // Matemática: Función afín, traslaciones y pendiente
  'b8-len-oa16', // Lengua: Proceso de escritura y mecanismos de cohesión
  'b8-cie-oa11', // Ciencias: Calor, energía térmica y escalas Celsius/Kelvin
  'b8-his-oa14', // Historia: La Ilustración y crítica al absolutismo
  'b8-his-oa16', // Historia: Independencia de Hispanoamérica y Chile

  // Semana 7: Pitágoras, modelos atómicos y derechos humanos
  'b8-mat-oa12', // Matemática: Teorema de Pitágoras
  'b8-cie-oa12', // Ciencias: Evolución de modelos atómicos: Dalton a Bohr
  'b8-his-oa18', // Historia: Derechos del Hombre (1789) y Derechos Humanos
  'b8-his-oa20', // Historia: Criterios de delimitación regional
  'b8-his-oa21', // Historia: Problemáticas regionales: aislamiento y conectividad

  // Semana 8: Isometrías, tabla periódica, posición y desarrollo regional
  'b8-mat-oa13', // Matemática: Transformaciones isométricas: vectores y rotación
  'b8-cie-oa14', // Ciencias: Tabla periódica y enlaces químicos
  'b8-mat-oa15', // Matemática: Percentiles, cuartiles y diagrama de cajón
  'b8-mat-oa16', // Matemática: Evaluación crítica de gráficos estadísticos
  'b8-his-oa22', // Historia: Desarrollo regional sustentable e IDH
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

export const ORDEN_MODULOS_M2: string[] = [
  // Semana 1: Raíces, narrativa, sistema nervioso y crisis liberal
  'm2-mat-oa1', // Matemática: Números reales y raíces
  'm2-len-oa3', // Lengua: Narraciones y visión de mundo
  'm2-cie-bio-oa1', // Ciencias: Sistema nervioso y neuronas
  'm2-his-oa2', // Historia: Crisis Estado liberal, Gran Depresión y totalitarismos
  'm2-ing-oa9', // Inglés: Comprensión lectora general

  // Semana 2: Logaritmos, dramática, sexualidad y II Guerra Mundial
  'm2-mat-oa2', // Matemática: Potencias, raíces enésimas y logaritmos
  'm2-len-oa5', // Lengua: Textos dramáticos
  'm2-cie-bio-oa3', // Ciencias: Sexualidad humana y reproducción responsable
  'm2-his-oa4', // Historia: Consecuencias II Guerra Mundial, ONU y DD.HH.
  'm2-ing-oa10', // Inglés: Textos no literarios, conectores y prefijos

  // Semana 3: Función cuadrática, interpretación, genética y democratización
  'm2-mat-oa3', // Matemática: Función cuadrática
  'm2-len-oa8', // Lengua: Interpretación de textos literarios
  'm2-cie-bio-oa6', // Ciencias: Material genético, mitosis y meiosis
  'm2-his-oa7', // Historia: Democratización y cultura de masas en Chile
  'm2-ing-oa13', // Inglés: Expresión escrita multimodal

  // Semana 4: Función inversa, argumentación, biotecnología y Guerra Fría
  'm2-mat-oa5', // Matemática: Inversa de una función
  'm2-len-oa9', // Lengua: Textos con finalidad argumentativa
  'm2-cie-bio-oa8', // Ciencias: Manipulación genética y biotecnología
  'm2-his-oa8', // Historia: Guerra Fría y orden bipolar
  'm2-ing-oa16', // Inglés: Tiempos perfectos, reporte y 2° condicional

  // Semana 5: Trigonometría, medios, cinemática y América Latina en Guerra Fría
  'm2-mat-oa8', // Matemática: Razones trigonométricas
  'm2-len-oa10', // Lengua: Medios de comunicación
  'm2-cie-fis-oa9', // Ciencias: Movimiento rectilíneo uniforme y acelerado
  'm2-his-oa10', // Historia: América Latina en la Guerra Fría
  'm2-his-oa11', // Historia: Fin de la Guerra Fría, neoliberalismo y globalización

  // Semana 6: Combinatoria, ensayos, leyes de Newton y Chile s. XX
  'm2-mat-oa11', // Matemática: Permutaciones y combinatoria
  'm2-len-oa14', // Lengua: Escribir textos persuasivos y ensayos
  'm2-cie-fis-oa10', // Ciencias: Leyes de Newton y diagrama de cuerpo libre
  'm2-his-oa12', // Historia: Pobreza y migración campo-ciudad en Chile
  'm2-his-oa15', // Historia: Interpretaciones historiográficas del golpe de 1973

  // Semana 7: Universo, soluciones, dictadura y modelo económico
  'm2-cie-fis-oa13', // Ciencias: Modelos del Universo y Big-Bang
  'm2-cie-qui-oa15', // Ciencias: Soluciones químicas y concentración
  'm2-his-oa16', // Historia: Dictadura militar, Estado de Derecho y DD.HH.
  'm2-his-oa17', // Historia: Modelo económico neoliberal en dictadura
  'm2-his-oa19', // Historia: Recuperación de la democracia en los años 80

  // Semana 8: Química del carbono, transición, DD.HH. y no discriminación
  'm2-cie-qui-oa17', // Ciencias: Química del carbono e hidrocarburos
  'm2-his-oa20', // Historia: Transición a la democracia y reparación
  'm2-his-oa22', // Historia: Derechos Humanos e institucionalidad
  'm2-his-oa25', // Historia: Diversidad, no discriminación y Ley Zamudio
];

export const ORDEN_MODULOS_M3: string[] = [
  // Semana 1: Fundamentos y comprensión crítica
  'm3-mat-oa2', // Matemática: Medidas de dispersión y probabilidades condicionales
  'm3-len-oa1', // Lengua: Interpretaciones literarias e intertextualidad
  'm3-cc-m1-oa1', // Ciencias para la Ciudadanía: Factores en la salud humana
  'm3-ec-oa1', // Educación Ciudadana: Fundamentos de democracia y ciudadanía
  'm3-fil-oa1', // Filosofía: Origen y sentido del quehacer filosófico
  'm3-ing-oa1', // Inglés: Comprensión escrita e interculturalidad

  // Semana 2: Modelos, justicia y ontología
  'm3-mat-oa3', // Matemática: Funciones exponencial y logarítmica
  'm3-len-oa3', // Lengua: Análisis crítico de géneros no literarios
  'm3-cc-m1-oa3', // Ciencias para la Ciudadanía: Agentes infecciosos y prevención
  'm3-ec-oa2', // Educación Ciudadana: Acceso a la justicia y sistema judicial
  'm3-fil-oa3', // Filosofía: Ontología: el ser y la realidad
  'm3-ing-oa3', // Inglés: Comprensión y producción crítica

  // Semana 3: Circunferencia, comunidades digitales y epistemología
  'm3-mat-oa4', // Matemática: Relaciones métricas en la circunferencia
  'm3-len-oa4', // Lengua: Géneros discursivos en comunidades digitales
  'm3-cc-m2-oa1', // Ciencias para la Ciudadanía: Sustancias químicas y seguridad
  'm3-ec-oa4', // Educación Ciudadana: Relaciones entre Estado y mercado
  'm3-fil-oa4', // Filosofía: Epistemología: conocimiento, ciencia y verdad
  'm3-ing-oa4', // Inglés: Producción fluida e identidad cultural

  // Semana 4: Escritura, riesgos, derechos, lógica y territorio
  'm3-len-oa6', // Lengua: Producir textos coherentes y cohesionados
  'm3-cc-m2-oa3', // Ciencias para la Ciudadanía: Riesgos socionaturales y adaptación
  'm3-ec-oa5', // Educación Ciudadana: Defensa y exigibilidad de DD.HH.
  'm3-ec-oa6', // Educación Ciudadana: Participación ciudadana y bien común
  'm3-fil-oa6', // Filosofía: Lógica, validez y argumentación
  'm3-ec-oa7', // Educación Ciudadana: Configuración política del territorio
];

export const ORDEN_MODULOS_M4: string[] = [
  // Semana 1: Fundamentos financieros, interpretación, sostenibilidad y democracia
  'm4-mat-oa1', // Matemática: Decisiones financieras e índices económicos
  'm4-len-oa1', // Lengua: Interpretación comparada de obras
  'm4-cc-m3-oa2', // Ciencias para la Ciudadanía: Proyectos de recursos naturales
  'm4-ec-oa1', // Educación Ciudadana: Institucionalidad democrática
  'm4-fil-oa1', // Filosofía: Alcances, límites y fines de la filosofía
  'm4-ing-oa1', // Inglés: Comprensión de información relevante

  // Semana 2: Incerteza, discursos, cambio climático y ética
  'm4-mat-oa2', // Matemática: Modelos binomial y normal
  'm4-len-oa3', // Lengua: Evaluación crítica de textos no literarios
  'm4-cc-m3-oa3', // Ciencias para la Ciudadanía: Cambio climático y mitigación
  'm4-ec-oa3', // Educación Ciudadana: Modelos de desarrollo y sustentabilidad
  'm4-fil-oa2', // Filosofía: Ética, moral, justicia, libertad e igualdad
  'm4-ing-oa3', // Inglés: Comprensión y producción con postura crítica

  // Semana 3: Funciones periódicas, escritura, derechos laborales y argumentación
  'm4-mat-oa3', // Matemática: Funciones potencia y trigonométricas
  'm4-len-oa5', // Lengua: Producción coherente y cohesionada
  'm4-ec-oa4', // Educación Ciudadana: Derechos laborales en Chile
  'm4-fil-oa4', // Filosofía: Evaluación de argumentos y falacias
  'm4-ing-oa4', // Inglés: Producción fluida, síntesis e identidad

  // Semana 4: Igualdad, medios masivos e impacto filosófico
  'm4-ec-oa5', // Educación Ciudadana: Libertad, igualdad y solidaridad
  'm4-ec-oa6', // Educación Ciudadana: Medios masivos, tecnologías y democracia
  'm4-fil-oa5', // Filosofía: Impacto de ideas filosóficas en la actualidad
];

export const ORDEN_MODULOS: string[] = [
  ...ORDEN_MODULOS_B5,
  ...ORDEN_MODULOS_B6,
  ...ORDEN_MODULOS_B7,
  ...ORDEN_MODULOS_B8,
  ...ORDEN_MODULOS_M1,
  ...ORDEN_MODULOS_M2,
  ...ORDEN_MODULOS_M3,
  ...ORDEN_MODULOS_M4,
];

export function getOrdenModulos(cursoId: string): string[] {
  if (cursoId === 'b5') return ORDEN_MODULOS_B5;
  if (cursoId === 'b6') return ORDEN_MODULOS_B6;
  if (cursoId === 'b7') return ORDEN_MODULOS_B7;
  if (cursoId === 'b8') return ORDEN_MODULOS_B8;
  if (cursoId === 'm2') return ORDEN_MODULOS_M2;
  if (cursoId === 'm3') return ORDEN_MODULOS_M3;
  if (cursoId === 'm4') return ORDEN_MODULOS_M4;
  return ORDEN_MODULOS_M1;
}
