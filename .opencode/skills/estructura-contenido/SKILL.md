---
name: Estructura Contenido
description: Explica la jerarquía de contenido semilla de Rumbo Libre (curso → asignatura → módulo/OA → actividades) y los códigos usados.
---

# Estructura del contenido semilla

## Jerarquía
```
Curso (ej. M1 — 1° medio)
 └─ Asignatura (ej. m1-len — Lengua y Literatura)
     └─ Módulo = OA (ej. m1-len-oa3 — OA3 "Analizar narraciones")
         └─ Actividades (4): aprender, practicar, evaluar, resumir
```

## Tipos TypeScript (`src/data/tipos.ts`)
`Curso`, `Asignatura`, `Modulo`, `Actividad`, `Lectura`.

## Archivos
- `src/data/cursos.ts` — cursos + asignaturas (colores e iconos).
- `src/data/m1/*.ts` — módulos de 1° medio (un archivo por asignatura).
- `src/data/lecturas.ts` — catálogo de lecturas.
- `src/lib/prompts.ts` — builders de prompts.
- `src/db/seed.ts` — inserta todo lo anterior en SQLite la primera vez.

## Códigos
- Curso: `M1`, `M2`, … (prefijo de nivel).
- Asignatura: `LEN`, `MAT`, `CIE`, `HIS`, `ING` (1°/2° medio).
- Módulo: `<NIVEL>-<ASIGNATURA>-OA<num>` (ej. `M1-LEN-OA3`).

## Actividades por módulo
| tipo | prompt | salida |
|---|---|---|
| `aprender` | búsqueda | texto + 3 preguntas |
| `practicar` | evaluación corta | quiz + JSON evaluacion |
| `evaluar` | examen formal | 25 preguntas + JSON evaluacion |
| `resumir` | resumen | apuntes + JSON resumen |

Cada actividad tiene `id` único `<modulo_id>:<tipo>` para el progreso.
