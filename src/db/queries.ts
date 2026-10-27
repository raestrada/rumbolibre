import { dbAll, dbGet, dbRun } from './database';
import type { Actividad } from '../data/tipos';

export interface AsignaturaRow {
  id: string;
  curso_id: string;
  codigo: string;
  nombre: string;
  color: string;
  icono: string;
  ejes: string[];
}

export interface ModuloFull {
  id: string;
  asignatura_id: string;
  codigo: string;
  numero: string;
  titulo: string;
  descripcion: string;
  indicadores: string[];
  contenidos: string[];
  eje: string | null;
  actividades: Actividad[];
}

export interface RegistroRow {
  id: string;
  modulo_id: string;
  curso_id: string;
  tipo: 'evaluacion' | 'resumen';
  nota: number | null;
  preguntas_correctas: number | null;
  preguntas_totales: number | null;
  temas_dominados: string[];
  temas_a_reforzar: string[];
  retroalimentacion: string;
  siguiente_paso: string;
  ideas_clave: string[];
  conceptos: string[];
  dudas: string[];
  texto_crudo: string;
  estado_parseo: string;
  verificado: number;
  fecha: string;
}

export interface LecturaRow {
  id: string;
  titulo: string;
  autor: string;
  genero: string;
  area: string;
  temas: string[];
  cursos_aplica: string[];
  edad_minima: number;
  por_que: string;
}

export interface HitoRow {
  id: string;
  curso_id: string;
  titulo: string;
  fecha: string | null;
  descripcion: string;
  completado: number;
}

function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

function parseArray(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

// ---- Config ----
export function getConfig(): Record<string, string> {
  const rows = dbAll('SELECT clave, valor FROM config');
  const out: Record<string, string> = {};
  for (const r of rows) out[r.clave] = String(r.valor ?? '');
  return out;
}

export function setConfig(clave: string, valor: string): void {
  dbRun(
    'INSERT INTO config (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor',
    [clave, valor],
  );
}

// ---- Cursos / asignaturas / módulos ----
export function getCursoActivoId(): string {
  return getConfig().curso_activo || 'm1';
}

export function getAsignaturas(cursoId: string): AsignaturaRow[] {
  const rows = dbAll('SELECT * FROM asignaturas WHERE curso_id = ? ORDER BY id', [cursoId]);
  return rows.map((r) => ({ ...r, ejes: parseArray(r.ejes) })) as AsignaturaRow[];
}

export function getAsignatura(id: string): AsignaturaRow | undefined {
  const r = dbGet('SELECT * FROM asignaturas WHERE id = ?', [id]);
  return r ? ({ ...r, ejes: parseArray(r.ejes) } as AsignaturaRow) : undefined;
}

export function getModulos(asignaturaId: string): ModuloFull[] {
  const rows = dbAll('SELECT * FROM modulos WHERE asignatura_id = ? ORDER BY numero', [asignaturaId]);
  return rows.map((r) => ({
    id: r.id,
    asignatura_id: r.asignatura_id,
    codigo: r.codigo,
    numero: r.numero,
    titulo: r.titulo,
    descripcion: r.descripcion,
    indicadores: parseArray(r.indicadores),
    contenidos: parseArray(r.contenidos),
    eje: r.eje ?? null,
    actividades: parseActividades(r.actividades),
  }));
}

export function getModulo(id: string): ModuloFull | undefined {
  const r = dbGet('SELECT * FROM modulos WHERE id = ?', [id]);
  if (!r) return undefined;
  return {
    id: r.id,
    asignatura_id: r.asignatura_id,
    codigo: r.codigo,
    numero: r.numero,
    titulo: r.titulo,
    descripcion: r.descripcion,
    indicadores: parseArray(r.indicadores),
    contenidos: parseArray(r.contenidos),
    eje: r.eje ?? null,
    actividades: parseActividades(r.actividades),
  };
}

function parseActividades(s: string | null | undefined): Actividad[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? (v as Actividad[]) : [];
  } catch {
    return [];
  }
}

export function getTotalModulos(cursoId: string): number {
  const r = dbGet(
    'SELECT COUNT(*) AS n FROM modulos m JOIN asignaturas a ON m.asignatura_id = a.id WHERE a.curso_id = ?',
    [cursoId],
  );
  return Number(r?.n ?? 0);
}

// ---- Progreso de actividades ----
export function getProgreso(): Record<string, string> {
  const rows = dbAll('SELECT actividad_id, estado FROM progreso_actividad');
  const out: Record<string, string> = {};
  for (const r of rows) out[r.actividad_id] = r.estado;
  return out;
}

export function setProgreso(actividadId: string, moduloId: string, tipo: string, estado: string): void {
  dbRun(
    'INSERT INTO progreso_actividad (actividad_id, modulo_id, tipo, estado, fecha) VALUES (?,?,?,?,?) ' +
      'ON CONFLICT(actividad_id) DO UPDATE SET estado = excluded.estado, fecha = excluded.fecha',
    [actividadId, moduloId, tipo, estado, new Date().toISOString()],
  );
}

export function actividadId(moduloId: string, tipo: string): string {
  return `${moduloId}:${tipo}`;
}

// ---- Registros (evaluaciones + resúmenes) ----
export function getRegistros(cursoId?: string): RegistroRow[] {
  const rows = cursoId
    ? dbAll('SELECT * FROM registros WHERE curso_id = ? ORDER BY fecha DESC', [cursoId])
    : dbAll('SELECT * FROM registros ORDER BY fecha DESC');
  return rows.map((r) => ({
    id: r.id,
    modulo_id: r.modulo_id,
    curso_id: r.curso_id,
    tipo: r.tipo,
    nota: r.nota ?? null,
    preguntas_correctas: r.preguntas_correctas ?? null,
    preguntas_totales: r.preguntas_totales ?? null,
    temas_dominados: parseArray(r.temas_dominados),
    temas_a_reforzar: parseArray(r.temas_a_reforzar),
    retroalimentacion: r.retroalimentacion ?? '',
    siguiente_paso: r.siguiente_paso ?? '',
    ideas_clave: parseArray(r.ideas_clave),
    conceptos: parseArray(r.conceptos),
    dudas: parseArray(r.dudas),
    texto_crudo: r.texto_crudo ?? '',
    estado_parseo: r.estado_parseo ?? 'sin_parsear',
    verificado: Number(r.verificado ?? 0),
    fecha: r.fecha ?? '',
  }));
}

export function getRegistrosDeModulo(moduloId: string): RegistroRow[] {
  const rows = dbAll('SELECT * FROM registros WHERE modulo_id = ? ORDER BY fecha DESC', [moduloId]);
  return rows.map(mapRegistro);
}

function mapRegistro(r: Record<string, any>): RegistroRow {
  return {
    id: r.id,
    modulo_id: r.modulo_id,
    curso_id: r.curso_id,
    tipo: r.tipo,
    nota: r.nota ?? null,
    preguntas_correctas: r.preguntas_correctas ?? null,
    preguntas_totales: r.preguntas_totales ?? null,
    temas_dominados: parseArray(r.temas_dominados),
    temas_a_reforzar: parseArray(r.temas_a_reforzar),
    retroalimentacion: r.retroalimentacion ?? '',
    siguiente_paso: r.siguiente_paso ?? '',
    ideas_clave: parseArray(r.ideas_clave),
    conceptos: parseArray(r.conceptos),
    dudas: parseArray(r.dudas),
    texto_crudo: r.texto_crudo ?? '',
    estado_parseo: r.estado_parseo ?? 'sin_parsear',
    verificado: Number(r.verificado ?? 0),
    fecha: r.fecha ?? '',
  };
}

export interface NuevoRegistro {
  modulo_id: string;
  curso_id: string;
  tipo: 'evaluacion' | 'resumen';
  nota: number | null;
  preguntas_correctas: number | null;
  preguntas_totales: number | null;
  temas_dominados: string[];
  temas_a_reforzar: string[];
  retroalimentacion: string;
  siguiente_paso: string;
  ideas_clave: string[];
  conceptos: string[];
  dudas: string[];
  texto_crudo: string;
  estado_parseo: 'ok' | 'sin_parsear' | 'manual';
}

export function insertRegistro(r: NuevoRegistro): string {
  const id = uid();
  dbRun(
    `INSERT INTO registros
      (id, modulo_id, curso_id, tipo, nota, preguntas_correctas, preguntas_totales,
       temas_dominados, temas_a_reforzar, retroalimentacion, siguiente_paso,
       ideas_clave, conceptos, dudas, texto_crudo, estado_parseo, verificado, fecha)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?)`,
    [
      id,
      r.modulo_id,
      r.curso_id,
      r.tipo,
      r.nota,
      r.preguntas_correctas,
      r.preguntas_totales,
      JSON.stringify(r.temas_dominados),
      JSON.stringify(r.temas_a_reforzar),
      r.retroalimentacion,
      r.siguiente_paso,
      JSON.stringify(r.ideas_clave),
      JSON.stringify(r.conceptos),
      JSON.stringify(r.dudas),
      r.texto_crudo,
      r.estado_parseo,
      new Date().toISOString(),
    ],
  );
  return id;
}

export function setRegistroVerificado(id: string, verificado: boolean): void {
  dbRun('UPDATE registros SET verificado = ? WHERE id = ?', [verificado ? 1 : 0, id]);
}

export function deleteRegistro(id: string): void {
  dbRun('DELETE FROM registros WHERE id = ?', [id]);
}

// ---- Lecturas ----
export function getLecturas(): LecturaRow[] {
  const rows = dbAll('SELECT * FROM lecturas ORDER BY genero, titulo');
  return rows.map((r) => ({
    id: r.id,
    titulo: r.titulo,
    autor: r.autor,
    genero: r.genero,
    area: r.area,
    temas: parseArray(r.temas),
    cursos_aplica: parseArray(r.cursos_aplica),
    edad_minima: Number(r.edad_minima ?? 13),
    por_que: r.por_que ?? '',
  }));
}

export function getProgresoLectura(): Record<string, string> {
  const rows = dbAll('SELECT lectura_id, estado FROM progreso_lectura');
  const out: Record<string, string> = {};
  for (const r of rows) out[r.lectura_id] = r.estado;
  return out;
}

export function setProgresoLectura(lecturaId: string, estado: string): void {
  dbRun(
    'INSERT INTO progreso_lectura (lectura_id, estado, fecha) VALUES (?,?,?) ' +
      'ON CONFLICT(lectura_id) DO UPDATE SET estado = excluded.estado, fecha = excluded.fecha',
    [lecturaId, estado, new Date().toISOString()],
  );
}

// ---- Hitos ----
export function getHitos(cursoId: string): HitoRow[] {
  return dbAll('SELECT * FROM hitos WHERE curso_id = ? ORDER BY fecha IS NULL, fecha', [cursoId]) as HitoRow[];
}

export function setHitoCompletado(id: string, completado: boolean): void {
  dbRun('UPDATE hitos SET completado = ? WHERE id = ?', [completado ? 1 : 0, id]);
}

export function setHitoFecha(id: string, fecha: string): void {
  dbRun('UPDATE hitos SET fecha = ? WHERE id = ?', [fecha || null, id]);
}

export function addHito(cursoId: string, titulo: string, fecha: string, descripcion: string): void {
  dbRun('INSERT INTO hitos (id, curso_id, titulo, fecha, descripcion, completado) VALUES (?,?,?,?,?,0)', [
    uid(),
    cursoId,
    titulo,
    fecha || null,
    descripcion,
  ]);
}

export function deleteHito(id: string): void {
  dbRun('DELETE FROM hitos WHERE id = ?', [id]);
}

// ---- Bitácora ----
export interface BitacoraRow {
  id: string;
  fecha: string;
  texto: string;
}

export function getBitacora(): BitacoraRow[] {
  return dbAll('SELECT * FROM bitacora ORDER BY fecha DESC') as BitacoraRow[];
}

export function addBitacora(texto: string): void {
  dbRun('INSERT INTO bitacora (id, fecha, texto) VALUES (?,?,?)', [uid(), new Date().toISOString(), texto]);
}

export function deleteBitacora(id: string): void {
  dbRun('DELETE FROM bitacora WHERE id = ?', [id]);
}
