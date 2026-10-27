---
name: Agregar Prompt
description: Ajusta o crea los prompts autocontenidos de Rumbo Libre (búsqueda, práctica, examen y resumen) respetando el esquema JSON parseable.
---

# Agregar / ajustar prompts

## Dónde viven
`src/lib/prompts.ts` — builders que generan los 4 prompts por módulo desde la metadata del temario
(`codigo`, `titulo`, `descripcion`, `indicadores`).

## Reglas al editar prompts
1. **Autocontenidos:** el prompt debe funcionar pegado en un chat nuevo (sin depender del historial).
2. **En español**, lenguaje para 13–14 años, tono cercano pero exigente.
3. **Nunca** inventar contenido curricular dentro del prompt: solo se nombra lo que ya está en el
   temario (código, título, descripción, indicadores).
4. Los prompts de `evaluar` y `practicar` terminan con el bloque JSON de `tipo: "evaluacion"`. El de
   `resumir` con `tipo: "resumen"` (ver `docs/03-sistema-de-prompts.md`).
5. El bloque JSON final debe incluir el código real del módulo (ej. `"modulo": "M1-LEN-OA3"`).
6. Mantener la estructura del JSON de salida (no agregar/eliminar campos sin actualizar también
   `src/lib/parser.ts` y `docs/03-sistema-de-prompts.md`).

## Si cambias el esquema JSON de salida
1. Actualiza el template en `src/lib/prompts.ts`.
2. Actualiza `src/lib/parser.ts` (validación y mapeo a columnas).
3. Actualiza `docs/03-sistema-de-prompts.md` y `docs/04-parser.md`.
4. Revisa que la UI de registro muestre los campos nuevos.
5. `npm run build`.
