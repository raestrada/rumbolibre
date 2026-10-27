# Arte e imágenes (prompts usados)

Se usa el agente **Antigravity (`agy`)** con su motor interno de imágenes para generar la marca
(logotipo e icono de la app).

## Regla importante: usar siempre **flash**

- El modelo **argon** suele estar con cuota agotada (HTTP 429).
- Para generar imágenes, usar siempre el modelo **flash**:
  `--model gemini-3.8-flash-high`.
- No combinar `--model ...-high` con `--effort`: los modelos ya llevan el esfuerzo en el nombre
  (`-high`, `-medium`, `-low`). Pasar `--effort` da error de conflicto.
- En modo `--print` (headless) no se puede pedir permiso interactivo: usar
  `--dangerously-skip-permissions` para que el agente pueda escribir el archivo.

## Comando que funcionó

```bash
agy --model gemini-3.8-flash-high --dangerously-skip-permissions --continue \
    --print-timeout 200s \
    --print='Usa tu herramienta de generación de imágenes directamente para crear el icono y guarda el archivo en public/icon.png (512x512). Confirma la ruta del archivo guardado al terminar.'
```

> Nota: la primera invocación (sin `--continue`) delegó a un subagente y no guardó el archivo; la
> segunda (sin `--dangerously-skip-permissions`) falló por permiso de comando. La combinación
> `--continue` + `--dangerously-skip-permissions` fue la que funcionó.

## Prompts de imagen

### 1. Logotipo / icono de la app (generado ✓)
```
Genera una imagen con tu motor interno de imágenes: un logotipo de icono de app para una aplicación
educativa llamada "Rumbo Libre". Una brújula moderna y amigable con una aguja apuntando hacia una
estrella, estilo flat, colores violeta (#7C3AED), rosa (#EC4899) y menta (#10B981), fondo degradado
lavanda muy claro, forma cuadrada con esquinas redondeadas para icono de app, líneas limpias, sin
texto, pensado para una niña de 13-14 años. Guarda la imagen resultante en el archivo public/icon.png
(512x512).
```
- **Resultado:** `public/icon.png` (512×512 PNG, RGB 8-bit).

### 2. Variante hero (pendiente, opcional)
```
Ilustración de portada para app de estudio: una niña adolescente con mochila caminando por un camino
que se curva hacia una estrella en el horizonte, rodeada de libros flotantes, constelaciones y una
brújula. Estilo flat moderno y cálido, paleta violeta/rosa/menta, fondo degradado suave. Sin texto.
Apto para chicas de 13-14 años.
```

## Archivos de marca

- `public/icon.png` — icono principal (512×512), generado con Antigravity (flash).
- `public/icon.svg` — variante vectorial de respaldo (brújula + estrella), hecho a mano.
- Ambos referenciados en `public/manifest.webmanifest` e `index.html`.
