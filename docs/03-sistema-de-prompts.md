# Sistema de prompts

Cada **módulo (OA)** tiene **3 pasos en orden**: **Estudiar → Evaluar → Apuntes**. Cada paso tiene un
**prompt de actividad** (autocontenido) que la estudiante copia y pega en su agente (Gemini, Claude,
etc.). Los pasos con resultado guardable (Evaluar y Apuntes) tienen, además, un **prompt de
resultados** que se copia **al terminar, en el mismo chat**, y que devuelve un **bloque JSON**
parseable por la app.

## Estructura de prompts por paso

| Paso | Prompt de actividad (se copia al empezar) | Prompt de resultados (se copia al terminar) | Salida parseable |
|---|---|---|---|
| `estudiar` (Estudiar) | Explica el tema y hace 3 preguntas | — (no aplica) | — |
| `evaluar` (Evaluar) | Examen de 25 preguntas, corrige al final | `resultado evaluacion` | nota + JSON evaluacion |
| `apuntes` (Apuntes) | Pide explicar y ayuda a organizar apuntes | `resultado resumen` | JSON resumen |

Además existe un **prompt de repasar** que se ofrece cuando la evaluación sale con nota < 4,0:
repasa los **temas a reforzar** obtenidos de la evaluación fallida y vuelve a bloquear la evaluación.

## Por qué un prompt de resultados separado

- El prompt de **estudio/evaluación es conversacional** y abierto: no debe forzar una salida
  estructurada.
- El **prompt de resultados es corto y autocontenido**: se pega en el **mismo chat** donde acaba de
  ocurrir la evaluación, para que el agente resuma lo conversado en un JSON simple y parseable.
- Aunque el agente pierda parte del contexto, este prompt re-establece el formato exacto y trae el
  código del módulo precargado (`"modulo": "M1-LEN-OA3"`), por lo que la salida siempre se puede
  asociar al módulo correcto.

## Flujo completo (p. ej. `evaluar`)

1. Copia el **prompt de actividad** y pégalo en tu agente (puede ser un **chat nuevo**). El agente
   te evalúa.
2. Al terminar, copia el **prompt de resultados** y pégalo en el **mismo chat** → el agente devuelve
   un bloque JSON.
3. Copia esa respuesta y pégala en la app ("Guardar mi resultado") → la app la **parsea** y guarda.

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

### Prompt de actividad — `estudiar`
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

### Prompt de actividad — `evaluar`
```
Actúa como mi profesora examinadora de 1° medio. Vamos a simular el examen libre del MINEDUC.

{cabecera con código, título, objetivo e indicadores}

Hazme un examen de 25 preguntas, como el real: opción múltiple, verdadero o falso y respuesta
corta. Hazlo por secciones y al final corrígeme todo. Sé justa y detalla qué debo repasar.
```

### Prompt de actividad — `apuntes`
```
Actúa como mi tutora. Terminé de estudiar: {cabecera}.

Pídeme que te explique con mis palabras lo que aprendí y ayúdame a organizar mis apuntes.
```

### Prompt de repasar (tras reprobar)
```
Actúa como mi profesora de 1° medio. Me fue mal en la evaluación de este módulo y necesito repasar.

Módulo: {codigo} — {titulo}.

Estos son los temas que debo reforzar:
- {tema a reforzar 1}
- {tema a reforzar 2}

Explícamelos de nuevo como si tuviera 14 años, con ejemplos de Chile, y al final hazme 3
preguntas para asegurarte de que ahora sí los entiendo.
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
- `buildPromptBusqueda` (`estudiar`), `buildPromptEvaluar`, `buildPromptResumir` (`apuntes`),
  `buildPromptRepasar`.
- `buildPromptResultadoEvaluacion`, `buildPromptResultadoResumen` (prompt de resultados).
- `getPrompt(tipo, modulo, asignatura)` y `getPromptResultado(tipo, modulo)`.

Los pasos y el umbral de aprobación viven en `src/data/tipos.ts` (`ACTIVIDADES`,
`NOTA_APROBACION = 4.0`).
