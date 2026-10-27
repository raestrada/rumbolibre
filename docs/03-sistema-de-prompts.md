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

## Por qué de a poco (incremental)

Pedirle al LLM "todo en una sola respuesta" choca con el límite de tokens de salida y queda cortado
a medias. Por eso todos los prompts de actividad instruyen al agente a **avanzar de a poco**:

- **Estudiar / Repasar:** explica un tema por mensaje, hace UNA pregunta de comprobación y pregunta
  si seguir, profundizar o ver otro ejemplo.
- **Evaluar:** hace UNA pregunta por mensaje, corrige, y recién pasa a la siguiente; lleva la cuenta
  de correctas/incorrectas y NO entrega nota ni resumen hasta que se lo piden (eso lo hace el prompt
  de resultados).
- **Apuntes:** sugiere UNA idea clave o concepto por mensaje.

El formato del examen imita al real (opción múltiple con 4 alternativas, verdadero/falso, respuesta
corta o emparejamiento). Los prompts de evaluación y de ensayo general **incluyen un ejemplo real**
del MINEDUC (por asignatura, tomado de los PDFs oficiales) como referencia de formato. Las preguntas
de ejemplo oficiales (modalidad adultos) están en `docs/06-fuentes-oficiales.md` y guardadas en
`public/examenes/`.

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
Voy a estudiar sola para el examen libre del MINEDUC.

{cabecera con código, título, objetivo e indicadores}

CÓMO TRABAJAR (muy importante, ve de a poco):
1. Empieza explicando SOLO el primer punto o subtema, en un párrafo corto, como si tuviera 14
   años, con un ejemplo de Chile o de mi vida diaria.
2. Después hazme UNA pregunta de comprensión y espera mi respuesta; corrígela si hace falta.
3. Recién entonces pregúntame si quiero: seguir con el siguiente tema, profundizar este o ver
   otro ejemplo. NO me expliques todo de una vez ni en una sola respuesta.
```

### Prompt de actividad — `evaluar`
```
Actúa como mi profesora examinadora de 1° medio. Vamos a simular el examen libre del MINEDUC.

{cabecera con código, título, objetivo e indicadores}

FORMATO DEL EXAMEN (igual al real):
- Preguntas de opción múltiple con 4 alternativas (a, b, c, d), verdadero/falso, respuesta
  corta o emparejamiento, como los exámenes libres del MINEDUC.
- Me harás hasta 25 preguntas en total, pero de a UNA por vez.

CÓMO TRABAJAR (muy importante):
1. Hazme UNA sola pregunta por mensaje y espera mi respuesta. NO me des varias preguntas a la
   vez ni en una sola respuesta.
2. Cuando responda, dime si está correcta o no, explica brevemente por qué, y recién entonces
   hazme la siguiente pregunta.
3. Lleva la cuenta de cuántas correctas e incorrectas llevo.
4. Al final, NO me des la nota ni el resumen todavía: te lo pediré en el siguiente mensaje.
```

### Prompt de actividad — `apuntes`
```
Actúa como mi tutora. Terminé de estudiar: {cabecera}.

CÓMO TRABAJAR (ve de a poco):
1. Pregúntame qué aprendí y escucha mi explicación.
2. Sugiere UNA idea clave o concepto por mensaje, y pregúntame si quiero seguir con el
   siguiente. NO intentes resumir todo de una vez.
```

### Prompt de repasar (tras reprobar)
```
Actúa como mi profesora de 1° medio. Me fue mal en la evaluación de este módulo y necesito repasar.

Módulo: {codigo} — {titulo}.

Estos son los temas que debo reforzar:
- {tema a reforzar 1}
- {tema a reforzar 2}

CÓMO TRABAJAR (ve de a poco):
1. Explícame SOLO el primer tema en un párrafo corto, como si tuviera 14 años, con un ejemplo.
2. Hazme UNA pregunta para comprobar que entendí y corrige si hace falta.
3. Pregúntame si sigo con el siguiente tema. NO lo expliques todo de una vez.
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
- `buildPromptEnsayo` (ensayo general por asignatura) y `buildPromptRepasarAsignatura`.
- `buildPromptResultadoEvaluacion`, `buildPromptResultadoResumen` (prompt de resultados).
- `datosEnsayo(asignatura)` (datos sintéticos para el ensayo) y `getPrompt` / `getPromptResultado`.

Los pasos y el umbral de aprobación viven en `src/data/tipos.ts` (`ACTIVIDADES`,
`NOTA_APROBACION = 4.0`).

## Ensayo general (por asignatura)

Además de evaluar cada módulo, existe un **ensayo general por asignatura** que mezcla **todos los
OA** de la materia en 25 preguntas (igual al examen real). Se sugiere hacerlo cuando todos los
módulos de la asignatura están aprobados. El resultado se guarda como un registro con
`modulo_id = <asignatura>:ensayo` (ver `src/db/queries.ts` → `ensayoId` / `getEnsayoNota`).
