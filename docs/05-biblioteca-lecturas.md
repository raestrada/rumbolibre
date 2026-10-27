# Biblioteca de lecturas complementarias

> **Fuente de verdad:** el catálogo completo (46 títulos, con calificación aproximada Goodreads ≥ 4.0)
> vive en `src/data/lecturas.ts` (campo `rating`). Esta página es solo una guía de criterios.
> La app lo muestra en "Biblioteca" con búsqueda, filtros, orden por calificación y marcado de lectura.

Objetivo: dar un **background general** entretenido que complemente el estudio, sin reemplazar el
temario. Cada libro se etiqueta por **género**, **área que refuerza**, **edad sugerida** y
**calificación aproximada Goodreads**.

## Ciencia ficción "dura" (enseña ciencia real)
- **Isaac Asimov** — *Fundación*, *Yo, Robot* (lógica, robótica, astronomía, historia cíclica).
- **Carl Sagan** — *Contacto* (astronomía, método científico).
- **Andy Weir** — *El marciano* (química, botánica, física, resolución de problemas).
- **Arthur C. Clarke** — *2001: Una odisea del espacio* (evolución, tecnología).
- **Ted Chiang** — *Exhalación*, *La historia de tu vida* (física, filosofía de la ciencia).
- **Kim Stanley Robinson** — *Marte Rojo* (geología, climatología, política).
- **Liu Cixin** — *El problema de los tres cuerpos* (física, astronomía).
- **Michael Crichton** — *Parque Jurásico* (genética, biología).

## Fantasía con sistemas consistentes (lógica, ética, sociedad)
- **Brandon Sanderson** — *Nacidos de la Bruma (Mistborn)*, *Elantris*, *El Camino de los Reyes*
  (sistemas de "magia dura": reglas, lógica, ética, religión).
- **Ursula K. Le Guin** — *Los desposeídos*, *La mano izquierda de la oscuridad* (antropología,
  política, género).
- **Terry Pratchett** — saga *Mundodisco* (sátira social, filosofía, historia, física).

## Psicología, sociología e historia en ficción
- **George Orwell** — *1984*, *Rebelión en la granja* (totalitarismo, historia, política).
- **Aldous Huxley** — *Un mundo feliz* (distopía, psicología, sociedad).
- **Ray Bradbury** — *Fahrenheit 451* (censura, cultura).
- **José Saramago** — *Ensayo sobre la ceguera* (comportamiento humano, sociedad).
- **Fiódor Dostoyevski** — *Crimen y castigo* (psicología, moral).
- **Markus Zusak** — *La ladrona de libros* (Segunda Guerra Mundial, historia).
- **Isabel Allende** — *La casa de los espíritus* (historia de Chile y Latinoamérica).
- **Chinua Achebe** — *Todo se desmorona* (colonialismo, cultura).

## Divulgación entretenida
- **Stephen Hawking** — *El universo en una cáscara de nuez*, *Breve historia del tiempo*.
- **Carl Sagan** — *Cosmos*.
- **Yuval Noah Harari** — *Sapiens* (historia, evolución).
- **Randall Munroe** — *¿Qué pasaría si…?* (ciencia con humor).
- **Bill Bryson** — *Una breve historia de casi todo*.
- **Richard Dawkins** — *El gen egoísta*, *El relojero ciego* (evolución).
- **Oliver Sacks** — *El hombre que confundió a su mujer con un sombrero* (neurociencia).
- **Daniel Kahneman** — *Pensar rápido, pensar despacio* (psicología).
- **Carlo Rovelli** — *Siete breves lecciones de física*.
- **Viktor Frankl** — *El hombre en busca de sentido* (psicología, resiliencia).
- **Stephen Jay Gould** — ensayos sobre evolución e historia natural.

## Criterios de selección
- Adecuado a 13–14 años (se marca `edad_minima`; algunos de divulgación se sugieren a partir de
  15+ y se indican como "para leer con un adulto" si aplica).
- Cada libro incluye una nota **"por qué te ayuda"** y qué **asignatura/área** refuerza.
- La lista es **semilla** y se puede editar desde la app o ampliar en `src/data/lecturas.ts`.
