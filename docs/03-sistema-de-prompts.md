# Sistema de prompts

Cada **módulo (OA)** tiene 4 actividades, cada una con su prompt **autocontenido** (no depende del
historial del chat) que la estudiante copia y pega en su agente (Gemini, Claude, etc.).

| Tipo | Actividad | Prompt | Salida esperada |
|---|---|---|---|
| `aprender` | Explorar el tema | `busqueda` | Explicación + 3 preguntas de comprobación |
| `practicar` | Ponerse a prueba | `evaluacion` (corto) | Quiz corto + bloque JSON |
| `evaluar` | Examen del módulo | `evaluacion` (formal) | 25 preguntas, nota 1–7 + bloque JSON |
| `resumir` | Crear apuntes | `resumen` | Resumen + bloque JSON |

Los prompts se **generan** a partir de la metadata oficial del módulo (código, título, descripción e
indicadores del temario). Esto garantiza que **nunca** se alucine contenido: el prompt solo nombra
lo que ya está en el temario.

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

## Plantillas de prompts (español, 14 años)

### Prompt de búsqueda (`aprender`)
```
Actúa como una profesora chilena de 1° medio, cercana, paciente y clara.

Voy a estudiar sola para el examen libre del MINEDUC. Hoy me toca:
{codigo} — {titulo} (asignatura: {asignatura}).

Lo que debo lograr (Objetivo de Aprendizaje):
{descripcion}

Para lograrlo, debo ser capaz de:
- {indicador 1}
- {indicador 2}
- ...

Explícamelo como si tuviera 14 años, paso a paso, con ejemplos de Chile y de mi vida diaria.
Usa un lenguaje simple y entretenido. Al final, hazme 3 preguntas cortas para comprobar que
entendí y dime si las respondí bien.
```

### Prompt de práctica (`practicar`)
```
Actúa como mi profesora de 1° medio. Vamos a practicar antes del examen libre del MINEDUC.

Tema: {codigo} — {titulo} ({asignatura}).
Objetivo: {descripcion}
Debo dominar: {indicadores}

Hazme 5 preguntas (tipo examen: opción múltiple y respuestas cortas), una por una, y corrige
cada respuesta al momento. Sé exigente pero amable.

AL TERMINAR, RESPONDE SOLO CON ESTE BLOQUE JSON, rellenando cada campo y SIN texto fuera de él:

```json
{ "tipo": "evaluacion", "modulo": "{codigo}", "nota": 0, "preguntas_correctas": 0,
  "preguntas_totales": 0, "temas_dominados": [], "temas_a_reforzar": [],
  "retroalimentacion": "", "siguiente_paso": "" }
```

Reglas: `nota` en escala 1 a 7 con un decimal (ej. 5.5). `temas_dominados` y `temas_a_reforzar`
son listas de frases cortas. Mantén el formato JSON exacto.
```

### Prompt de examen (`evaluar`)
Igual que el anterior, pero con **25 preguntas** estilo examen real (opción múltiple, verdadero o
falso, respuesta corta) y nota 1–7, simulando las condiciones del MINEDUC (90 min).

### Prompt de resumen (`resumir`)
```
Actúa como mi tutora. Terminé de estudiar: {codigo} — {titulo} ({asignatura}).
Objetivo: {descripcion}

Pídeme que te explique lo que aprendí y ayúdame a organizar mis apuntes.

AL TERMINAR, RESPONDE SOLO CON ESTE BLOQUE JSON, rellenando cada campo y SIN texto fuera de él:

```json
{ "tipo": "resumen", "modulo": "{codigo}", "ideas_clave": [], "conceptos": [], "dudas": [] }
```

`ideas_clave` y `conceptos` son listas de frases cortas. `dudas` son preguntas que me quedaron.
```

## Por qué el bloque JSON va al final

Los agentes **pierden contexto** en conversaciones largas. El prompt final es autocontenido y
re-establece todo lo necesario, de modo que la salida siempre tenga un bloque **parseable** por la
app, independiente de lo que haya pasado antes en el chat.
