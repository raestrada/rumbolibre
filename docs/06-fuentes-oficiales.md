# Fuentes oficiales (verificación y no-alucinación)

> **Regla de oro:** el contenido curricular de la app DEBE contrastarse con estas fuentes. **No
> inventar** asignaturas, OA, ejes ni indicadores. Si una fuente oficial cambia, actualizar la
> semilla y esta lista.

## Temario oficial (menores de 18) — 1° medio
- Ficha oficial: https://www.ayudamineduc.cl/ficha/examenes-libres-menores-de-18-anos-11
- PDF Temario Primero Medio:
  `https://ayudamineduc.cl/sites/default/files/temario_media_1deg_medio_uce_1.pdf`
- Lista de temarios por curso (EPJA / Validación de Estudios):
  https://epja.mineduc.cl/validacion-de-estudios/examenes-libres-menores-de-18-anos/cuales-son-los-temarios-que-se-utilizaran-en-la-examinacion/
- Cómo se evalúa (asignaturas por curso y decretos):
  https://epja.mineduc.cl/validacion-de-estudios/examenes-libres-menores-de-18-anos/como-se-evalua/

## Decretos que rigen la evaluación
- 1° a 6° básico: Decreto Supremo de Educación N°439/2012.
- 7° y 8° básico: Decreto Supremo de Educación N°614/2013.
- **1° y 2° medio: Decreto Supremo de Educación N°614/2013.**
- 3° y 4° medio: Decreto Supremo de Educación N°193/2019 (asignaturas distintas:
  incluyen Filosofía y Educación Ciudadana).

## Calendario e inscripción
- Inscripción (formulario): https://inscripcionexameneslibres.mineduc.cl/
- Calendario nacional de examinación: https://epja.mineduc.cl/ (sección "Validación de Estudios").
- Ayuda Mineduc: https://www.ayudamineduc.cl · call center 600 600 2626.

## Notas de proceso (para los padres)
- Inscripción la realiza **madre, padre o tutor legal**.
- Se evalúa por **trayectoria educativa**; sin trayectoria, se usa la edad al 31 de marzo
  (14 años → 1° medio).
- Sin eximición de asignaturas; obligatorio leer y escribir en español.
- Promoción (Decreto 67/2018): todas ≥ 4,0; o 1 reprobada con promedio ≥ 4,5; o 2 reprobadas con
  promedio ≥ 5,0.

## Cómo agregar otro curso sin alucinar
1. Descargar el **temario oficial** del curso desde la lista de temarios del MINEDUC.
2. Transcribir **fielmente** OA, títulos, descripciones e indicadores (ver
   `skills/agregar-curso.md`).
3. Crear la semilla en `src/data/<nivel>/` siguiendo el mismo formato de `src/data/m1/`.
4. Registrar el curso en `src/data/cursos.ts` (sin cambiar el esquema).
