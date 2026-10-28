import type { Database } from 'sql.js';
import { SCHEMA_SQL, SCHEMA_VERSION } from './schema';
import { cursos, asignaturas } from '../data/cursos';
import { ACTIVIDADES } from '../data/tipos';
import { modulosLengua } from '../data/m1/lengua';
import { modulosMatematica } from '../data/m1/matematica';
import { modulosCiencias } from '../data/m1/ciencias';
import { modulosHistoria } from '../data/m1/historia';
import { modulosIngles } from '../data/m1/ingles';
import { lecturas } from '../data/lecturas';

// Se incrementa cuando cambia el CONTENIDO semilla (módulos, actividades, lecturas).
// Al detectar una versión menor, la app re-sincroniza el contenido sin tocar el progreso del usuario.
export const SEED_VERSION = 4;

const TODOS_MODULOS = [
  ...modulosLengua,
  ...modulosMatematica,
  ...modulosCiencias,
  ...modulosHistoria,
  ...modulosIngles,
];

// Contenido curricular y biblioteca: idempotente (upsert). Se puede re-ejecutar sin duplicar.
export function seedContenido(db: Database): void {
  db.run(SCHEMA_SQL);

  const insCurso = db.prepare(
    `INSERT INTO cursos (id, codigo, nombre, orden, decreto, descripcion) VALUES (?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET codigo=excluded.codigo, nombre=excluded.nombre,
       orden=excluded.orden, decreto=excluded.decreto, descripcion=excluded.descripcion`,
  );
  for (const c of cursos) insCurso.run([c.id, c.codigo, c.nombre, c.orden, c.decreto, c.descripcion]);
  insCurso.free();

  const insAsig = db.prepare(
    `INSERT INTO asignaturas (id, curso_id, codigo, nombre, color, icono, ejes) VALUES (?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET curso_id=excluded.curso_id, codigo=excluded.codigo,
       nombre=excluded.nombre, color=excluded.color, icono=excluded.icono, ejes=excluded.ejes`,
  );
  for (const a of asignaturas) {
    insAsig.run([a.id, a.cursoId, a.codigo, a.nombre, a.color, a.icono, JSON.stringify(a.ejes)]);
  }
  insAsig.free();

  const insMod = db.prepare(
    `INSERT INTO modulos (id, asignatura_id, codigo, numero, titulo, descripcion, indicadores, contenidos, eje, actividades)
     VALUES (?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET asignatura_id=excluded.asignatura_id, codigo=excluded.codigo,
       numero=excluded.numero, titulo=excluded.titulo, descripcion=excluded.descripcion,
       indicadores=excluded.indicadores, contenidos=excluded.contenidos, eje=excluded.eje,
       actividades=excluded.actividades`,
  );
  for (const m of TODOS_MODULOS) {
    insMod.run([
      m.id,
      m.asignaturaId,
      m.codigo,
      m.numero,
      m.titulo,
      m.descripcion,
      JSON.stringify(m.indicadores),
      JSON.stringify(m.contenidos ?? []),
      m.eje ?? null,
      JSON.stringify(ACTIVIDADES),
    ]);
  }
  insMod.free();

  const insLec = db.prepare(
    `INSERT INTO lecturas (id, titulo, autor, genero, area, temas, cursos_aplica, edad_minima, por_que, rating)
     VALUES (?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET titulo=excluded.titulo, autor=excluded.autor, genero=excluded.genero,
       area=excluded.area, temas=excluded.temas, cursos_aplica=excluded.cursos_aplica,
       edad_minima=excluded.edad_minima, por_que=excluded.por_que, rating=excluded.rating`,
  );
  for (const l of lecturas) {
    insLec.run([
      l.id,
      l.titulo,
      l.autor,
      l.genero,
      l.area,
      JSON.stringify(l.temas),
      JSON.stringify(l.cursosAplica),
      l.edadMinima,
      l.porQue,
      l.rating ?? null,
    ]);
  }
  insLec.free();
}

// Configuración y datos por defecto: solo se insertan si no existen (no sobreescriben al usuario).
function seedConfig(db: Database): void {
  const conf = db.prepare('INSERT OR IGNORE INTO config (clave, valor) VALUES (?, ?)');
  const confs: [string, string][] = [
    ['nombre', ''],
    ['curso_activo', 'm1'],
    ['pin_hash', ''],
    ['schema_version', String(SCHEMA_VERSION)],
    ['seed_version', String(SEED_VERSION)],
    ['fecha_examen', ''],
    ['fecha_creacion', new Date().toISOString()],
  ];
  for (const [k, v] of confs) conf.run([k, v]);
  conf.free();

  const insHito = db.prepare(
    'INSERT OR IGNORE INTO hitos (id, curso_id, titulo, fecha, descripcion, completado) VALUES (?,?,?,?,?,0)',
  );
  insHito.run([
    'hito-inscripcion',
    'm1',
    'Inscripción al examen',
    '',
    'La inscripción la realiza la madre, padre o tutor legal en ayudamineduc.cl',
  ]);
  insHito.run([
    'hito-rendicion',
    'm1',
    'Rendición de exámenes',
    '',
    '5 asignaturas · 25 preguntas · 90 min cada una',
  ]);
  insHito.free();
}

// Semilla completa para una base nueva.
export function seed(db: Database): void {
  seedContenido(db);
  seedConfig(db);
}
