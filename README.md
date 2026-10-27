# Rumbo Libre 🧭

Guía y seguimiento para preparar los **Exámenes Libres de 1° medio** (Validación de Estudios para
menores de 18 años, MINEDUC, Chile) con ayuda de un agente de IA (Gemini, Claude, etc.).

- **100% local**: los datos se guardan en una base SQLite **dentro del navegador** (sql.js +
  IndexedDB). Sin servidor, sin APIs, sin cuentas.
- **No enseña ni evalúa**: solo guía. Da **prompts listos para copiar** y registra lo que la
  estudiante pega de vuelta.
- **Respaldo real**: descarga un archivo `.sqlite` (o `.json`) y restáuralo cuando quieras.

## Requisitos

- Node.js 18+ y npm.

## Puesta en marcha

```bash
npm install      # instalar dependencias
npm run dev      # desarrollo (http://localhost:5173)
npm run build    # compilar a dist/
npm run preview  # servir el build compilado
```

> Para usar en la laptop de casa, lo más simple es dejar corriendo `npm run dev` y abrir la URL en el
> navegador. Los datos quedan en **ese navegador** (IndexedDB). Si se usa otro navegador u otro
> computador, importa el respaldo `.sqlite`.

## Cómo se usa (flujo de estudio)

1. **Inicio** — ve tu avance general y por asignatura.
2. **Mi ruta** — elige asignatura → módulo (Objetivo de Aprendizaje del temario oficial).
3. En cada módulo hay **3 pasos en orden**: **Estudiar** → **Evaluarte** (se desbloquea al terminar
   de estudiar) → **Crear apuntes** (opcional).
   - Copia el **prompt** y pégalo en tu agente de IA.
   - El prompt de evaluación/apuntes termina pidiendo un **bloque JSON**.
   - Pega la respuesta de vuelta en **"Pegar resultado"**: la app la **parsea** y la guarda
     estructurada (nota, temas a reforzar, apuntes…).
4. **Registro** — historial de evaluaciones y apuntes; marca las que verificaste.
5. **Biblioteca** — novelas y libros de divulgación que refuerzan lo aprendido.
6. **Para papás** — seguimiento protegido con PIN.
7. **Ajustes** — respaldos, PIN, calendario de plazos.

## Contenido curricular

La app incluye el **temario oficial de 1° medio** (40 Objetivos de Aprendizaje en 5 asignaturas:
Lengua y Literatura, Matemática, Ciencias Naturales, Historia, Geografía y Ciencias Sociales, e Inglés).
Ver `docs/01-temario-1medio.md`.

## Documentación para agentes de IA

- `AGENTS.md` — instrucciones generales.
- `.opencode/skills/` — skills estándar de OpenCode (agregar curso, verificar temario, agregar
  prompt, estructura de contenido).
- `docs/` — plan, arquitectura, temario, prompts, parser, fuentes oficiales y extensibilidad.

## Privacidad

Todo queda en el dispositivo. No hay telemetría ni envío de datos a ningún servidor.
