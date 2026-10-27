---
name: Agregar Prompt
description: Ajusta o crea los prompts autocontenidos de Rumbo Libre (estudio, evaluación, apuntes, repasar y de resultados) respetando el esquema JSON parseable.
---

# Agregar / ajustar prompts

## Dónde viven
`src/lib/prompts.ts` — builders que generan los prompts por módulo desde la metadata del temario
(`codigo`, `titulo`, `descripcion`, `indicadores`):
- `buildPromptBusqueda` (`estudiar`), `buildPromptEvaluar`, `buildPromptResumir` (`apuntes`),
  `buildPromptRepasar`.
- `buildPromptResultadoEvaluacion`, `buildPromptResultadoResumen` (prompt de resultados).
- `getPrompt(tipo, modulo, asignatura)` y `getPromptResultado(tipo, modulo)`.

Los pasos y el umbral de aprobación viven en `src/data/tipos.ts` (`ACTIVIDADES`,
`NOTA_APROBACION = 4.0`).

## Reglas al editar prompts
1. **Autocontenidos:** el prompt debe funcionar pegado en un chat nuevo (sin depender del historial).
2. **En español**, lenguaje para 13–14 años, tono cercano pero exigente.
3. **Nunca** inventar contenido curricular dentro del prompt: solo se nombra lo que ya está en el
   temario (código, título, descripción, indicadores).
4. Hay **dos tipos de prompt**:
   - **Prompt de actividad** (`estudiar`, `evaluar`, `apuntes`): conversacional, sin JSON.
   - **Prompt de resultados** (`resultado evaluacion`, `resultado resumen`): corto, devuelve un
     bloque JSON parseable. Se copia al terminar, en el mismo chat.
5. Los prompts de resultados usan el bloque JSON de `tipo: "evaluacion"` (`evaluar`) o
   `tipo: "resumen"` (`apuntes`), con el código real del módulo precargado (ej. `"modulo": "M1-LEN-OA3"`).
6. El **prompt de repasar** se genera desde los `temas_a_reforzar` de la evaluación reprobada.
7. Mantener la estructura del JSON de salida (no agregar/eliminar campos sin actualizar también
   `src/lib/parser.ts` y `docs/03-sistema-de-prompts.md`).

## Si cambias el esquema JSON de salida
1. Actualiza el template en `src/lib/prompts.ts`.
2. Actualiza `src/lib/parser.ts` (validación y mapeo a columnas).
3. Actualiza `docs/03-sistema-de-prompts.md` y `docs/04-parser.md`.
4. Revisa que la UI de registro muestre los campos nuevos.
5. `npm run build`.
