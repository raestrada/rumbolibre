---
name: Estructura Contenido
description: Explica la jerarquía de contenido semilla de Rumbo Libre (curso → asignatura → módulo/OA → pasos) y los códigos usados.
---

# Estructura del contenido semilla

## Jerarquía
```
Curso (ej. M1 — 1° medio)
 └─ Asignatura (ej. m1-len — Lengua y Literatura)
     └─ Módulo = OA (ej. m1-len-oa3 — OA3 "Analizar narraciones")
         └─ Pasos (3, en orden): estudiar → evaluar → apuntes
```

## Tipos TypeScript (`src/data/tipos.ts`)
`Curso`, `Asignatura`, `Modulo`, `Actividad`, `Lectura`. También `ACTIVIDADES` (los 3 pasos) y
`NOTA_APROBACION` (umbral 4.0).

## Archivos
- `src/data/cursos.ts` — cursos + asignaturas (colores e iconos).
- `src/data/m1/*.ts` — módulos de 1° medio (un archivo por asignatura).
- `src/data/orden.ts` — orden recomendado de módulos (dependencia + mezcla de materias, como un colegio).
- `src/data/lecturas.ts` — catálogo de lecturas.
- `src/lib/prompts.ts` — builders de prompts (actividad, resultados y repasar).
- `src/db/seed.ts` — inserta todo lo anterior en SQLite (idempotente, con `SEED_VERSION`).

## Códigos
- Curso: `M1`, `M2`, … (prefijo de nivel).
- Asignatura: `LEN`, `MAT`, `CIE`, `HIS`, `ING` (1°/2° medio).
- Módulo: `<NIVEL>-<ASIGNATURA>-OA<num>` (ej. `M1-LEN-OA3`).

## Pasos por módulo (orden y bloqueo)
| Paso | Prompt | Salida | Bloqueo |
|---|---|---|---|
| `estudiar` | búsqueda | texto + 3 preguntas | siempre disponible |
| `evaluar` | examen 25 preguntas | JSON evaluacion (nota) | se desbloquea al completar `estudiar` |
| `apuntes` | resumen | JSON resumen | opcional, siempre disponible |

- Al reprobar (`nota < 4.0`) se ofrece un **prompt de repasar** y se vuelve a bloquear `evaluar`.
- Cada paso tiene `id` único `<modulo_id>:<tipo>` para el progreso.
