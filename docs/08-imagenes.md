# Arte e imágenes (prompts usados)

Se usa el agente **Antigravity (`agy`)** con su motor interno de imágenes para generar la marca
(logotipo e icono de la app).

## Comando base

```bash
agy --effort low --print-timeout 260s --print='<prompt>'
```

## Prompts de imagen

### 1. Logotipo / icono de la app
```
Genera una imagen con tu motor interno de imágenes: un logotipo de icono de app para una aplicación
educativa llamada "Rumbo Libre". Una brújula moderna y amigable con una aguja apuntando hacia una
estrella, estilo flat, colores violeta (#7C3AED), rosa (#EC4899) y menta (#10B981), fondo degradado
lavanda muy claro, forma cuadrada con esquinas redondeadas para icono de app, líneas limpias, sin
texto, pensado para una niña de 13-14 años. Guarda la imagen resultante en el archivo public/icon.png
(512x512).
```

### 2. Variante hero (opcional)
```
Ilustración de portada para app de estudio: una niña adolescente con mochila caminando por un camino
que se curva hacia una estrella en el horizonte, rodeada de libros flotantes, constelaciones y una
brújula. Estilo flat moderno y cálido, paleta violeta/rosa/menta, fondo degradado suave. Sin texto.
Apto para chicas de 13-14 años.
```

## Resultado

- **Estado:** ⚠️ No generado aún — el motor de imágenes devolvió cuota agotada
  (`RESOURCE_EXHAUSTED`, HTTP 429, "Individual quota reached"). Reintentar cuando se reinicie la cuota.
- **Fallback actual:** icono vectorial hecho a mano en `public/icon.svg` (brújula + estrella,
  degradado violeta/rosa), usado por el manifest y el favicon.
- **Cuando se genere:** guardar como `public/icon.png` (512×512) y agregar la entrada correspondiente
  al `public/manifest.webmanifest` (junto a `icon.svg`).
