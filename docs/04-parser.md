# Parser de resultados (JSON)

## Objetivo

Extraer, de un texto pegado, el bloque JSON estructurado generado por el agente, tolerando ruido
(texto explicativo antes/después, comillas raras, comas finales, etc.).

## Algoritmo

1. Buscar un bloque entre ```json y ``` (regex). Si existe, usar su contenido.
2. Si no, buscar desde el primer `{` hasta el último `}`.
3. Intentar `JSON.parse`. Si falla, **sanear**:
   - quitar comas finales antes de `}` o `]`,
   - normalizar comillas tipográficas (“ ” ‘ ’) a rectas,
   - quitar líneas que no sean pares clave/valor válidos (último recurso).
4. Validar tipos y clamps:
   - `nota`: número en [1, 7] (redondeado a 1 decimal),
   - `preguntas_correctas` / `preguntas_totales`: enteros ≥ 0,
   - `temas_dominados`, `temas_a_reforzar`, `ideas_clave`, `conceptos`, `dudas`: arrays de strings.
5. Si no se puede parsear: `estado_parseo = "sin_parsear"` y se guarda solo `texto_crudo`; la app
   muestra un mini-formulario para completar `nota` y `temas_a_reforzar` a mano (`estado_parseo =
   "manual"`).

## Campos de resultado

- `tipo`: `"evaluacion"` o `"resumen"` (se infiere de la actividad si falta).
- `modulo`: código (ej. `M1-LEN-OA3`); si falta, se usa el módulo abierto.
- Resto: según el tipo (ver [`03-sistema-de-prompts.md`](./03-sistema-de-prompts.md)).

## Seguridad

- Todo es local. Aún así: límite de tamaño del texto pegado (ej. 500 KB), `try/catch` en todo el
  parseo, y **sin** insertar HTML del texto (se muestra escapado).

## Persistencia

El resultado parseado se guarda en la tabla `registros` (columnas estructuradas) **junto con**
`texto_crudo` (respaldo completo del texto pegado).
