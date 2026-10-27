---
name: Verificar Temario
description: Verifica que el contenido curricular de Rumbo Libre (asignaturas, OA e indicadores) sea fiel al temario oficial del MINEDUC y no esté inventado.
---

# Verificar temario (anti-alucinación)

## Cuándo usarla
Antes de dar por bueno cualquier cambio en `src/data/` que toque asignaturas, módulos (OA) o
indicadores.

## Checklist
1. Cada `modulo` tiene un OA **numerado real** que existe en el temario oficial del curso.
2. `titulo` y `descripcion` corresponden al texto del temario (no inventados ni "mejorados" con
   contenido extra).
3. `indicadores` son los del temario (pueden condensarse, pero NO agregar indicadores que no estén).
4. El **código** sigue `<NIVEL>-<ASIGNATURA>-OA<num>` (ej. `M1-LEN-OA3`) y el prefijo de nivel
   coincide con el curso.
5. La asignatura pertenece al curso correcto y coincide con las que evalúa el MINEDUC para ese curso
   (ver "¿Cómo se evalúa?" en `docs/06-fuentes-oficiales.md`).
6. No hay contenido curricular "extra" que no provenga del temario (la app es una guía, no un libro
   de texto).

## Cómo resolver dudas
- Ir al PDF oficial del temario (links en `docs/06-fuentes-oficiales.md`).
- En caso de conflicto, **manda la fuente oficial**: actualiza la semilla y este skill.

## Salida
Informar: qué se verificó, contra qué fuente, y si quedó conforme o qué hay que corregir.
