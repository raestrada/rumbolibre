# AGENTS.md — Instrucciones para agentes de IA

> Proyecto **Rumbo Libre**: app web 100% cliente (sin servidor) para preparar los **Exámenes Libres
> (Validación de Estudios, menores de 18)** del MINEDUC, Chile. Nivel actual: **1° medio**.

## Antes de tocar cualquier cosa

1. Lee `docs/00-plan.md` (plan maestro) y `docs/01-temario-1medio.md` (fuente de verdad del contenido).
2. **REGLAS DE NO-ALUCINACIÓN** (críticas):
   - El contenido curricular (asignaturas, OA, títulos, descripciones, indicadores) SOLO puede salir
     del **temario oficial del MINEDUC** (ver `docs/06-fuentes-oficiales.md`).
   - **Prohibido inventar** asignaturas, OA, temas o indicadores.
   - Para agregar un curso nuevo, transcribe su temario oficial con el mismo rigor
     (ver `skills/agregar-curso.md`). No lo deduzcas ni lo "completes" de memoria.
3. Los **prompts** se generan programáticamente desde la metadata del temario; no se escriben a mano
   salvo que se quiera personalizar (ver `skills/agregar-prompt.md`).

## Stack

- Vite + React + TypeScript.
- **sql.js** (SQLite WASM) + **IndexedDB** para persistencia local.
- Sin backend, sin APIs, sin base de datos de servidor.
- CSS propio (`src/styles.css`) con variables; diseño ligero y colorido para 13–14 años.

## Estructura

```
docs/                 documentación y referencia (NO editar el contenido curricular sin fuentes)
.opencode/skills/     skills estándar de OpenCode (ver "Skills" más abajo)
public/               icon.svg, manifest, favicon
src/
  data/               semilla (cursos, asignaturas, módulos, lecturas) y tipos
  db/                 schema, init, seed, persistencia, backup
  lib/                parser JSON, builder de prompts
  components/         UI compartida
  screens/            pantallas
```

## Skills (estándar OpenCode)

Los skills viven en `.opencode/skills/<id>/SKILL.md` (formato estándar de OpenCode: frontmatter
`name` + `description`, cuerpo en Markdown). Este formato es **portable**: cualquier agente que lea
skills (OpenCode, Antigravity/`agy`, o los compatibles `.claude/skills` y `.agents/skills`) puede
consumirlos.

| ID | Uso |
|---|---|
| `agregar-curso` | Agregar un curso/año (ej. 2° medio) |
| `verificar-temario` | Comprobar que el contenido no alucina |
| `agregar-prompt` | Crear/ajustar prompts y el esquema JSON |
| `estructura-contenido` | Entender la jerarquía de la semilla |

En OpenCode se cargan con la herramienta `skill` (o `@<id>`). En otros agentes, leer directamente
el archivo `SKILL.md` correspondiente.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo
npm run build      # build de producción (verifica que compila)
npm run preview    # servir el build
```

## Flujo de datos importante

- La BD es la única fuente de verdad. Tras mutar, se re-consulta y se persiste a IndexedDB.
- Los registros (`src/db` tabla `registros`) guardan la **salida pegada de la IA**, que se parsea
  con `src/lib/parser.ts` (tolerante) y se guarda estructurada + `texto_crudo`.
- El PIN de padres se guarda como hash SHA-256 (WebCrypto), nunca en claro.

## Modelo de datos

Ver `docs/02-arquitectura.md`. Resumen de tablas: `config`, `cursos`, `asignaturas`, `modulos`,
`progreso_actividad`, `registros`, `lecturas`, `progreso_lectura`, `hitos`, `bitacora`.

## Cuándo usar cada skill

- Agregar un curso/año (ej. 2° medio) → skill `agregar-curso`
- Verificar que el contenido no alucine → skill `verificar-temario`
- Ajustar/crear prompts → skill `agregar-prompt`
- Entender la estructura del contenido semilla → skill `estructura-contenido`
