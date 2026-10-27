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

export function seed(db: Database): void {
  db.run(SCHEMA_SQL);

  const todosModulos = [
    ...modulosLengua,
    ...modulosMatematica,
    ...modulosCiencias,
    ...modulosHistoria,
    ...modulosIngles,
  ];

  const conf = db.prepare('INSERT INTO config (clave, valor) VALUES (?, ?)');
  const confs: [string, string][] = [
    ['nombre', ''],
    ['curso_activo', 'm1'],
    ['pin_hash', ''],
    ['schema_version', String(SCHEMA_VERSION)],
    ['fecha_examen', ''],
    ['fecha_creacion', new Date().toISOString()],
  ];
  for (const [k, v] of confs) conf.run([k, v]);
  conf.free();

  const insCurso = db.prepare(
    'INSERT INTO cursos (id, codigo, nombre, orden, decreto, descripcion) VALUES (?,?,?,?,?,?)',
  );
  for (const c of cursos) insCurso.run([c.id, c.codigo, c.nombre, c.orden, c.decreto, c.descripcion]);
  insCurso.free();

  const insAsig = db.prepare(
    'INSERT INTO asignaturas (id, curso_id, codigo, nombre, color, icono, ejes) VALUES (?,?,?,?,?,?,?)',
  );
  for (const a of asignaturas) {
    insAsig.run([a.id, a.cursoId, a.codigo, a.nombre, a.color, a.icono, JSON.stringify(a.ejes)]);
  }
  insAsig.free();

  const insMod = db.prepare(
    'INSERT INTO modulos (id, asignatura_id, codigo, numero, titulo, descripcion, indicadores, contenidos, eje, actividades) VALUES (?,?,?,?,?,?,?,?,?,?)',
  );
  for (const m of todosModulos) {
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
    'INSERT INTO lecturas (id, titulo, autor, genero, area, temas, cursos_aplica, edad_minima, por_que) VALUES (?,?,?,?,?,?,?,?,?)',
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
    ]);
  }
  insLec.free();

  const insHito = db.prepare(
    'INSERT INTO hitos (id, curso_id, titulo, fecha, descripcion, completado) VALUES (?,?,?,?,?,0)',
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
