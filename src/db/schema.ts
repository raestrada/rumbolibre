export const SCHEMA_VERSION = 1;

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS config (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cursos (
  id TEXT PRIMARY KEY,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  orden INTEGER NOT NULL,
  decreto TEXT,
  descripcion TEXT
);
CREATE TABLE IF NOT EXISTS asignaturas (
  id TEXT PRIMARY KEY,
  curso_id TEXT NOT NULL,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  color TEXT,
  icono TEXT,
  ejes TEXT
);
CREATE TABLE IF NOT EXISTS modulos (
  id TEXT PRIMARY KEY,
  asignatura_id TEXT NOT NULL,
  codigo TEXT NOT NULL,
  numero TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  indicadores TEXT NOT NULL,
  contenidos TEXT,
  eje TEXT,
  actividades TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS progreso_actividad (
  actividad_id TEXT PRIMARY KEY,
  modulo_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  fecha TEXT
);
CREATE TABLE IF NOT EXISTS registros (
  id TEXT PRIMARY KEY,
  modulo_id TEXT NOT NULL,
  curso_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  nota REAL,
  preguntas_correctas INTEGER,
  preguntas_totales INTEGER,
  temas_dominados TEXT,
  temas_a_reforzar TEXT,
  retroalimentacion TEXT,
  siguiente_paso TEXT,
  ideas_clave TEXT,
  conceptos TEXT,
  dudas TEXT,
  texto_crudo TEXT,
  estado_parseo TEXT NOT NULL,
  verificado INTEGER NOT NULL DEFAULT 0,
  fecha TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS lecturas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  genero TEXT NOT NULL,
  area TEXT NOT NULL,
  temas TEXT NOT NULL,
  cursos_aplica TEXT NOT NULL,
  edad_minima INTEGER NOT NULL,
  por_que TEXT NOT NULL,
  rating REAL
);
CREATE TABLE IF NOT EXISTS progreso_lectura (
  lectura_id TEXT PRIMARY KEY,
  estado TEXT NOT NULL DEFAULT 'sin_leer',
  fecha TEXT
);
CREATE TABLE IF NOT EXISTS hitos (
  id TEXT PRIMARY KEY,
  curso_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  fecha TEXT,
  descripcion TEXT,
  completado INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS bitacora (
  id TEXT PRIMARY KEY,
  fecha TEXT NOT NULL,
  texto TEXT NOT NULL
);
`;
