# Extensibilidad multi-año

El diseño contempla **N cursos** aunque hoy solo exista **1° medio**. Agregar **2° medio** (o
básica, 3° y 4° medio) es **solo agregar contenido**, sin tocar el esquema ni el código.

## Cómo está preparado

1. **Tabla `cursos`:** cada curso es una fila (id, codigo, nombre, orden, decreto). 1° medio = `M1`.
2. **`asignaturas`** cuelgan de un `curso_id`, porque las asignaturas cambian entre niveles
   (ej. 3°/4° medio agregan Filosofía y Educación Ciudadana; 1° medio integra Ciencias Naturales).
3. **`modulos` (OA)** cuelgan de una asignatura y heredan el curso.
4. **Códigos únicos entre años:** `M1-LEN-OA3`, `M2-MAT-OA1`, `M3-FIL-…`, etc. El prefijo de nivel
   (`M1`, `M2`, …) evita colisiones y permite al parser asociar el registro al módulo correcto.
5. **Registros, progreso, hitos y bitácora** referencian `curso_id` o el módulo, por lo que el
   historial de cada año queda separado.
6. **`lecturas.cursos_aplica`** es un array (ej. `["M1","M2"]`) para reusar el catálogo entre años.

## Pasos para agregar 2° medio (resumen)

1. Descargar el temario oficial de 2° medio (ver `06-fuentes-oficiales.md`).
2. Crear `src/data/m2/` con los archivos de asignaturas (mismo formato que `src/data/m1/`).
3. Agregar el curso y sus asignaturas en `src/data/cursos.ts`.
4. Opcional: agregar prompts específicos (los prompts se generan solos desde la metadata).
5. Nada más: el esquema ya soporta varios cursos; no se necesita migración.

> **Importante:** no inventar el temario de 2° medio. Se transcribe del PDF oficial del MINEDUC
> (2° medio usa el Decreto N°614/2013 y evalúa 36 OA en 4–5 asignaturas).
