# Modo IA con OpenRouter

La app ofrece **dos modos** para estudiar/evaluar:

1. **Manual** (por defecto): la app genera prompts y tú los pegas en tu IA; luego pegas el resultado.
2. **Directo (OpenRouter)**: la app llama al modelo desde el navegador, controla el contexto y la
   cobertura, y renderiza el contenido con el diseño de la app.

## Seguridad de la API key

Una web estática no puede ocultar una clave. Por eso:

- **Memoria (recomendado por defecto):** la clave vive solo en la sesión de la página.
- **Sesión:** `sessionStorage`; sobrevive recargas, se borra al cerrar la pestaña.
- **Cifrada:** se guarda en `localStorage` un blob **AES-GCM** derivado de una *passphrase* con
  PBKDF2 (150.000 iteraciones). Se descifra al "Probar clave" y queda en memoria.
- Nunca se incluye en el respaldo `.sqlite`/`.json`. Hay botón **Borrar clave**.
- Recomendación: usar una key de OpenRouter con **límite de gasto**.

> Requiere contexto seguro (HTTPS o localhost) por `crypto.subtle`. GitHub Pages es HTTPS.

## Cliente OpenRouter (`src/lib/openrouter.ts`)

- Endpoint: `https://openrouter.ai/api/v1/chat/completions` (CORS abierto, verificado).
- Cabeceras: `Authorization: Bearer`, `HTTP-Referer`, `X-Title`.
- **Streaming SSE** (delta.content y delta.reasoning).
- **Salidas estructuradas**: `response_format` `json_schema` si el modelo soporta
  `structured_outputs`, o `json_object` si soporta `response_format`; si no, se parsea el JSON.
- `listarModelos()` desde `/api/v1/models`; `probarClave()` desde `/api/v1/credits`.
- Modelo por defecto: **`deepseek/deepseek-v4.1-flash`**.
- Herramienta de búsqueda web: `tools: [{ type: 'openrouter:web_search' }]` (para fundamentar e
  imágenes; es *best-effort*).

Método basado en el proyecto **`martina`** (`js/tutor.js`), ya probado.

## Motor de cobertura determinístico (`src/lib/cobertura.ts`)

El control lo tiene la app, no el LLM:

- **Módulo:** cada **indicador** del temario es una unidad de cobertura.
- **Ensayo:** cada **OA/módulo** de la asignatura es una unidad.
- Enseñanza por turnos (un punto por vez) para no truncar por tokens.
- Evaluación: se piden preguntas mapeadas a unidades (`unidad` 1..N) y la app **verifica que cada
  unidad tenga al menos 1 pregunta**; si falta, **re-prompt** (hasta 2 veces).
- Corrección **determinística** en la app; nota chilena: 0%→1.0, 60%→4.0, 100%→7.0.
- Se guarda un `registro` (tabla existente) con nota, aciertos, temas dominados/a reforzar y el
  detalle de preguntas/respuestas. Se marca `estudiar`/`evaluar` como completadas cuando corresponde.

## Contenido rico

- La explicación llega en **HTML** y se **sanea con allowlist** (`src/lib/sanitize.ts`): sin
  scripts, sin eventos, solo tags/atributos permitidos; `href`/`src` solo `https`.
- Imágenes: se piden **URLs directas de Wikimedia/NASA** y se ocultan las que fallen. Puede usar
  `web_search` para fundamentar; la fiabilidad de imágenes es limitada.
- Todo se renderiza con el diseño de la app (`.contenido-ia`).

## Persistencia

Nueva tabla `sesiones_ia` (`modulo_id`, `mensajes`, `cobertura`, `fase`, `actualizado`), para
reanudar la conversación y la cobertura sin perder contexto. Las claves no se guardan aquí.

## Pantallas

- **Ajustes → Inteligencia Artificial:** modo, key, almacenamiento, passphrase, modelo, probar/borrar.
- **Módulo:** botón "🤖 Sesión guiada con IA" → enseñar por puntos + evaluación interactiva.
- **Ensayo:** botón "🤖 Ensayo general con IA" → 25 preguntas interactivas de la asignatura.

## Limitaciones conocidas

- Costo por tokens (lo paga la cuenta de OpenRouter).
- La calidad varía según el modelo; el motor valida y reintenta, pero no garantiza el 100%.
- Las imágenes dependen de URLs válidas; si fallan, se ocultan.
- Si el modelo no soporta JSON estructurado, se usa parseo tolerante y puede requerir reintento.
