# Arquitectura técnica y modelo de datos

## Stack

- **Vite + React + TypeScript** (SPA estática, sin backend).
- **`sql.js`** (SQLite compilado a WebAssembly) para la base de datos real en el navegador.
- **IndexedDB** para persistir el binario de la base (`db.export()` → `Uint8Array`).
- **WebCrypto** (SHA-256) para el hash del PIN de padres.
- **PWA** básica: `manifest.webmanifest` + service worker (offline e instalable).
- Sin dependencias de UI pesadas: CSS propio con variables (diseño ligero, moderno y colorido).

## Dependencias

```
react, react-dom, sql.js
@types/react, @types/react-dom, @types/sql.js
typescript, vite, @vitejs/plugin-react
```

## Estructura de carpetas

```
rumbolibre/
  docs/                     # plan y referencia (ver 00-plan.md)
  skills/                   # playbooks para agentes de IA
  AGENTS.md                 # instrucciones para agentes de IA
  public/                   # icon.svg, manifest, iconos
  src/
    data/                   # semilla: cursos, asignaturas, módulos, lecturas, tipos
    db/                     # schema, init, persistencia, seed, backup
    lib/                    # parser JSON, builder de prompts, códigos
    components/             # componentes UI compartidos
    screens/                # pantallas
    App.tsx, main.tsx
    styles.css
```

## Modelo de datos (SQLite)

Todas las listas se guardan como texto JSON (JSON.stringify). Claves primarias por `id`.

```sql
-- Configuración global (clave/valor)
CREATE TABLE config (clave TEXT PRIMARY KEY, valor TEXT NOT NULL);
-- claves: nombre, curso_activo, fecha_examen, pin_hash, schema_version, fecha_creacion

-- Cursos (extensible a 2° medio, 3°, 4°, básica…)
CREATE TABLE cursos (
  id TEXT PRIMARY KEY,          -- 'm1'
  codigo TEXT NOT NULL,          -- 'M1'
  nombre TEXT NOT NULL,          -- '1° medio'
  orden INTEGER NOT NULL,
  decreto TEXT,                  -- 'Decreto 614/2013'
  descripcion TEXT
);

-- Asignaturas (pertenecen a un curso)
CREATE TABLE asignaturas (
  id TEXT PRIMARY KEY,           -- 'm1-len'
  curso_id TEXT NOT NULL,
  codigo TEXT NOT NULL,          -- 'LEN'
  nombre TEXT NOT NULL,
  color TEXT,                    -- color de la asignatura
  icono TEXT,                    -- emoji
  ejes TEXT                      -- JSON array de ejes
);

-- Módulos = Objetivos de Aprendizaje (OA)
CREATE TABLE modulos (
  id TEXT PRIMARY KEY,           -- 'm1-len-oa3'
  asignatura_id TEXT NOT NULL,
  codigo TEXT NOT NULL,          -- 'M1-LEN-OA3'
  numero TEXT NOT NULL,          -- '3'
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,     -- objetivo del OA (fiel al temario)
  indicadores TEXT NOT NULL,     -- JSON array de indicadores
  contenidos TEXT,               -- JSON array (opcional)
  actividades TEXT NOT NULL      -- JSON array: [{id, tipo, titulo, descripcion}]
);

-- Progreso de actividades
CREATE TABLE progreso_actividad (
  actividad_id TEXT PRIMARY KEY, -- '<modulo_id>:<tipo>'
  modulo_id TEXT NOT NULL,
  tipo TEXT NOT NULL,            -- aprender | practicar | evaluar | resumir
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | completada
  fecha TEXT
);

-- Registros (evaluaciones Y apuntes/resúmenes) — unificados por tipo
CREATE TABLE registros (
  id TEXT PRIMARY KEY,           -- uuid
  modulo_id TEXT NOT NULL,
  curso_id TEXT NOT NULL,        -- denormalizado para filtrar por curso
  tipo TEXT NOT NULL,            -- 'evaluacion' | 'resumen'
  nota REAL,
  preguntas_correctas INTEGER,
  preguntas_totales INTEGER,
  temas_dominados TEXT,          -- JSON array
  temas_a_reforzar TEXT,         -- JSON array
  retroalimentacion TEXT,
  siguiente_paso TEXT,
  ideas_clave TEXT,              -- JSON array (resumen)
  conceptos TEXT,                -- JSON array (resumen)
  dudas TEXT,                    -- JSON array (resumen)
  texto_crudo TEXT,              -- respaldo del texto pegado
  estado_parseo TEXT NOT NULL,   -- 'ok' | 'manual' | 'sin_parsear'
  verificado INTEGER NOT NULL DEFAULT 0,
  fecha TEXT NOT NULL
);

-- Biblioteca de lecturas (semilla)
CREATE TABLE lecturas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  genero TEXT NOT NULL,          -- ciencia-ficcion | fantasia | historia | psicologia | divulgacion ...
  area TEXT NOT NULL,            -- área que refuerza
  temas TEXT NOT NULL,           -- JSON array
  cursos_aplica TEXT NOT NULL,   -- JSON array, ej. ["M1","M2"]
  edad_minima INTEGER NOT NULL,
  por_que TEXT NOT NULL
);

-- Progreso de lectura
CREATE TABLE progreso_lectura (
  lectura_id TEXT PRIMARY KEY,
  estado TEXT NOT NULL DEFAULT 'sin_leer', -- sin_leer | leyendo | leida
  fecha TEXT
);

-- Hitos / plazos
CREATE TABLE hitos (
  id TEXT PRIMARY KEY,
  curso_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  fecha TEXT,
  descripcion TEXT,
  completado INTEGER NOT NULL DEFAULT 0
);

-- Bitácora (notas libres)
CREATE TABLE bitacora (
  id TEXT PRIMARY KEY,
  fecha TEXT NOT NULL,
  texto TEXT NOT NULL
);
```

## Persistencia y respaldo

1. Al iniciar: cargar WASM de sql.js → `new SQL.Database()`; si hay binario en IndexedDB, cargarlo;
   si no, ejecutar el **seed** (semilla) y persistir.
2. Tras cada mutación: `db.export()` → guardar en IndexedDB (con debounce ~400 ms).
3. **Respaldo:** descargar `rumbo-libre-respaldo.sqlite` (Blob del export) y
   `rumbo-libre-datos.json` (volcado de todas las tablas).
4. **Restaurar:** importar `.sqlite` (reemplaza la BD) o `.json` (reconstruye la BD).

## Versionado

- `config.schema_version` (entero). Al cargar, si la versión de la BD es menor que la del código,
  se ejecutan las migraciones necesarias. Agregar cursos futuros **no** cambia el esquema (solo
  inserta filas de semilla), por lo que no requiere migración.
