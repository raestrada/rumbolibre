# Rumbo Libre — Plan maestro del proyecto

> App web **100% cliente** (sin servidor ni APIs) para preparar los **Exámenes Libres
> (Validación de Estudios para menores de 18 años)** del MINEDUC, Chile. Pensada para una
> estudiante de 13–14 años que cursará **1° medio** en Santiago.

## 1. Propósito y principio rector

- La app **NO enseña ni evalúa**. No ofrece contenido ni corrige respuestas.
- Es una **guía de estudio** que orienta a la estudiante a usar **su propio agente de IA**
  (Gemini, Claude, etc.) y registra el resultado.
- Aporta: **estructura, orden, prompts listos para copiar, checklist, registro y seguimiento**.
- El valor para los padres es el **seguimiento transparente** (qué completó, qué evaluaciones
  subió, qué falta) sin invadir el contenido.

## 2. Qué exige el MINEDUC (base de la guía)

Proceso: **"Exámenes de Validación de Estudios para menores de 18 años"** ("exámenes libres").

Para **1° medio** se rinden **5 asignaturas, cada una con su prueba separada**
(Decreto Bases Curriculares N°614/2013):

| Asignatura | Ejes evaluados |
|---|---|
| Lengua y Literatura | Lectura, Escritura |
| Matemática | Números y Operaciones · Álgebra y Funciones · Geometría · Probabilidad y Estadística |
| Ciencias Naturales | Biología · Física · Química |
| Historia, Geografía y Ciencias Sociales | Historia · Geografía · Formación Ciudadana |
| Inglés | Comprensión de lectura (reading) · Expresión escrita (writing) |

### Reglas clave
- 25 preguntas por prueba, 90 minutos, **máx. 2 pruebas por día**, presencial y en papel.
- Sin libros ni celular. **Inglés permite diccionario** y **Matemática permite calculadora**.
- **Sin eximición** de ninguna asignatura.
- Se evalúa una **selección** de los OA del temario: hay que estudiar **todo** el temario,
  aunque en la prueba solo aparezcan algunos.
- Aprobación (Decreto 67/2018): nota ≥ 4,0 en todas; **o** 1 reprobada con promedio ≥ 4,5;
  **o** 2 reprobadas con promedio ≥ 5,0.
- 14 años cumplidos al 31 de marzo → corresponde 1° medio. Inscripción por madre/padre/tutor legal.

> **Ver listado exhaustivo y fiel de OA en [`01-temario-1medio.md`](./01-temario-1medio.md).**
> Esa es la fuente de verdad del contenido. **No inventar OA ni temas**: derivar siempre del
> temario oficial.

## 3. Arquitectura técnica

- **SPA estática** con **Vite + React + TypeScript**.
- **SQLite real en el navegador** con **`sql.js`** (WASM).
- **Persistencia** en **IndexedDB**: tras cada cambio (con debounce) se exporta el binario de la
  BD y se guarda.
- **Respaldo/restauración**: descargar archivo `.sqlite` e importarlo; además export/import JSON.
- **Sin login de servidor**: el dashboard de padres se protege con un **PIN local** (hash SHA-256
  vía WebCrypto).
- **PWA** básica (manifest + service worker) para uso offline e instalable.
- **IA directa (OpenRouter)**: la app llama al modelo desde el navegador con **key segura**,
  **cobertura determinística** por indicadores y **contenido HTML saneado**. No hay prompts manuales.
  Ver [`09-modo-ia.md`](./09-modo-ia.md).
- Detalles en [`02-arquitectura.md`](./02-arquitectura.md).

## 4. Flujo de estudio (por módulo)

Cada módulo tiene **3 pasos en orden**, con bloqueo/desbloqueo:

1. **Estudiar** — estudia con el prompt de estudio y, al terminar, marca "listo".
2. **Evaluar** (se desbloquea al terminar de estudiar) — simula el examen en un chat (puede ser
   nuevo: el prompt trae todo el contexto) y guarda el resultado.
   - Nota ≥ 4,0 → módulo **aprobado** 🎉.
   - Nota < 4,0 → se ofrece un **prompt de repasar** (centrado en los temas débiles) y se vuelve a
     bloquear la evaluación.
3. **Crear apuntes** (opcional) — resume y guarda apuntes estructurados.

Las actividades con resultado guardable (Evaluar, Crear apuntes) tienen un **prompt de resultados**
aparte: se pega **al terminar, en el mismo chat**, y devuelve un **bloque JSON** que la app
**parsea** y guarda.

Flujo de evaluación:
1. Abre la ficha del módulo y copia el **prompt de actividad** (estudiar o ser evaluada).
2. Lo pega en su agente de IA y realiza la actividad (conversación libre).
3. Al terminar, copia el **prompt de resultados** y lo pega en el **mismo chat**.
4. El agente devuelve un **bloque JSON** con los resultados (nota, temas a reforzar, apuntes…).
5. Copia esa respuesta y la pega en la app.
6. La app **extrae y parsea el JSON** (tolerante), valida y guarda estructurado + texto crudo.
7. La app actualiza el roadmap (módulo, temas a reforzar, siguiente paso).

Detalles en [`03-sistema-de-prompts.md`](./03-sistema-de-prompts.md) y
[`04-parser.md`](./04-parser.md).

## 5. Pantallas

1. **Configuración inicial** (onboarding): nombre, curso, fecha objetivo, PIN de padres, importar respaldo.
2. **Dashboard estudiante**: avance por asignatura, OA completados, racha, próximos hitos.
3. **Ruta (roadmap)**: los 40 módulos en un **orden recomendado** (por dependencia y con las
   materias intercaladas como un horario de colegio), con estados visibles, "siguiente recomendado"
   y clic directo a cada módulo.
4. **Ensayo general (por asignatura)**: mezcla todos los OA de una materia en 25 preguntas, como el
   examen real. Se sugiere al aprobar todos sus módulos.
5. **Repasar**: reúne por asignatura los módulos reprobados y los temas a reforzar, con prompt de
   repaso.
4. **Ficha de módulo**: qué se evalúa (indicadores), copiar prompts, checklist, pegar evaluación/apuntes.
5. **Registro**: historial de evaluaciones y apuntes, marcar verificadas.
6. **Biblioteca**: lecturas recomendadas (ciencia, fantasía, historia, divulgación).
7. **Padres** (PIN): reporte de avance y de evaluaciones subidas vs verificadas, descargar respaldo.
8. **Ajustes**: respaldo/restauración, PIN, calendario de plazos.

## 6. Extensibilidad multi-año

Hoy solo existe **1° medio**, pero el esquema contempla **N cursos**. Agregar **2° medio** (o
básica, 3°/4°) = **agregar una semilla nueva**, sin tocar código ni migrar datos. Ver
[`07-multi-ano.md`](./07-multi-ano.md).

## 7. Fuentes oficiales

Ver [`06-fuentes-oficiales.md`](./06-fuentes-oficiales.md). **Regla de oro:** todo contenido
curricular debe contrastarse con el temario oficial del MINEDUC. **Prohibido alucinar asignaturas
o temas.**

## 8. Estado del proyecto

- [x] Documentación completa
- [x] `AGENTS.md` + skills
- [x] App funcional (1° medio)
- [x] Arte / marca (ver [`08-imagenes.md`](./08-imagenes.md))
