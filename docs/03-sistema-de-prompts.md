# Sistema de prompts

Cada **módulo (OA)** tiene 4 actividades. Cada actividad tiene un **prompt de actividad**
(autocontenido) que la estudiante copia y pega en su agente (Gemini, Claude, etc.). Las actividades
que producen un resultado guardable (Practicar, Evaluar, Crear apuntes) tienen, además, un **prompt
de resultados** que se copia **al terminar, en el mismo chat**, y que devuelve un **bloque JSON**
parseable por la app.

## Estructura de prompts por actividad

| Actividad | Prompt de actividad (se copia al empezar) | Prompt de resultados (se copia al terminar) | Salida parseable |
|---|---|---|---|
| `aprender` (Explorar) | Explica el tema y hace 3 preguntas | — (no aplica) | — |
| `practicar` (Ponerse a prueba) | Quiz corto de 5 preguntas, corrige al momento | `resultado evaluacion` | nota + JSON evaluacion |
| `evaluar` (Examen) | Examen de 25 preguntas, corrige al final | `resultado evaluacion` | nota + JSON evaluacion |
| `resumir` (Crear apuntes) | Pide explicar y ayuda a organizar apuntes | `resultado resumen` | JSON resumen |

## Por qué un prompt de resultados separado

- El prompt de **estudio/evaluación es conversacional** y abierto: no debe forzar una salida
  estructurada.
- El **prompt de resultados es corto y autocontenido**: se pega en el **mismo chat** donde acaba de
  ocurrir la evaluación, para que el agente resuma lo conversado en un JSON simple y parseable.
- Aunque el agente pierda parte del contexto, este prompt re-establece el formato exacto y trae el
  código del módulo precargado (`"modulo": "M1-LEN-OA3"`), por lo que la salida siempre se puede
  asociar al módulo correcto.

## Flujo completo (p. ej. `evaluar`)

1. Copia el **prompt de actividad** y pégalo en tu agente → el agente te evalúa.
2. Al terminar, copia el **prompt de resultados** y pégalo en el **mismo chat** → el agente devuelve
   un bloque JSON.
3. Copia esa respuesta y pégala en la app (botón "Pegar resultado") → la app la **parsea** y guarda.

## Esquema JSON de salida

### Evaluación (`tipo: "evaluacion"`)
```json
{
  "tipo": "evaluacion",
  "modulo": "M1-LEN-OA3",
  "nota": 5.5,
  "preguntas_correctas": 7,
  "preguntas_totales": 10,
  "temas_dominados": ["Conflicto narrativo", "Descripción de personajes"],
  "temas_a_reforzar": ["Tópicos literarios", "Relaciones intertextuales"],
  "retroalimentacion": "Resumen breve de la corrección.",
  "siguiente_paso": "Repasar tópicos literarios y volver a practicar."
}
```

### Resumen (`tipo: "resumen"`)
```json
{
  "tipo": "resumen",
  "modulo": "M1-LEN-OA3",
  "ideas_clave": ["Idea 1", "Idea 2"],
  "conceptos": ["Concepto 1"],
  "dudas": ["Duda 1"]
}
```

## Plantillas (español, 14 años)

Los prompts se **generan** desde la metadata oficial del módulo (código, título, descripción e
indicadores del temario). Esto garantiza que **nunca** se alucine contenido: el prompt solo nombra
lo que ya está en el temario.

### Prompt de actividad — `aprender` (búsqueda)
```
Actúa como una profesora chilena de 1° medio, cercana, paciente y clara.

Voy a estudiar sola para el examen libre del MINEDUC. Hoy me toca:
{codigo} — {titulo} (asignatura: {asignatura}).

Objetivo de Aprendizaje:
{descripcion}

Para lograrlo, debo ser capaz de:
- {indicador 1}
- {indicador 2}
- ...

Explícamelo como si tuviera 14 años, paso a paso, con ejemplos de Chile y de mi vida diaria.
Usa un lenguaje simple y entretenido. Al final, hazme 3 preguntas cortas para comprobar que
entendí y dime si las respondí bien.
```

### Prompt de actividad — `practicar` / `evaluar`
```
Actúa como mi profesora (examinadora) de 1° medio. Vamos a practicar / simular el examen libre
del MINEDUC.

{cabecera con código, título, objetivo e indicadores}

Hazme 5 preguntas (o 25, para el examen), una por una, y corrige cada respuesta. Sé exigente
pero amable. [En el examen: hazlo por secciones y corrige todo al final.]
```

### Prompt de resultados — evaluación
```
Ya terminamos la evaluación de este módulo. Ahora resume mis resultados en un formato simple.

RESPONDE SOLO CON ESTE BLOQUE JSON, rellenando cada campo y SIN texto fuera de él:

```json
{ "tipo": "evaluacion", "modulo": "{codigo}", "nota": 0, "preguntas_correctas": 0,
  "preguntas_totales": 0, "temas_dominados": [], "temas_a_reforzar": [],
  "retroalimentacion": "", "siguiente_paso": "" }
```

Reglas: `nota` en escala 1 a 7 con un decimal (ej. 5.5). `temas_dominados` y `temas_a_reforzar`
son listas de frases cortas. Usa la información de la evaluación que acabamos de hacer.
```

### Prompt de resultados — resumen
```
Ya terminamos de repasar este módulo. Ahora resume mis apuntes en un formato simple.

RESPONDE SOLO CON ESTE BLOQUE JSON, rellenando cada campo y SIN texto fuera de él:

```json
{ "tipo": "resumen", "modulo": "{codigo}", "ideas_clave": [], "conceptos": [], "dudas": [] }
```

Reglas: `ideas_clave` y `conceptos` son listas de frases cortas. `dudas` son preguntas que me
quedaron. Usa lo que conversamos recién.
```

## Implementación

Los builders viven en `src/lib/prompts.ts`:
- `buildPromptBusqueda`, `buildPromptPracticar`, `buildPromptEvaluar`, `buildPromptResumir`
  (prompt de actividad).
- `buildPromptResultadoEvaluacion`, `buildPromptResultadoResumen` (prompt de resultados).
- `getPrompt(tipo, modulo, asignatura)` y `getPromptResultado(tipo, modulo)`.
