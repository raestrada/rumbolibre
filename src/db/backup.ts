import { dbAll, dbExec, dbRun, getRawDb, importFromBytes } from './database';

export const TABLAS = [
  'config',
  'cursos',
  'asignaturas',
  'modulos',
  'progreso_actividad',
  'registros',
  'lecturas',
  'progreso_lectura',
  'hitos',
  'bitacora',
];

export function exportSqliteBytes(): Uint8Array {
  const db = getRawDb();
  if (!db) throw new Error('La base de datos no está inicializada');
  return db.export();
}

export function exportJsonString(): string {
  const tablas: Record<string, unknown[]> = {};
  for (const t of TABLAS) tablas[t] = dbAll(`SELECT * FROM ${t}`);
  return JSON.stringify(
    {
      app: 'rumbo-libre',
      schema_version: 1,
      exportado: new Date().toISOString(),
      tablas,
    },
    null,
    2,
  );
}

export function importJson(text: string): void {
  const obj = JSON.parse(text) as { tablas?: Record<string, unknown[]> };
  const tablas = obj?.tablas;
  if (!tablas || typeof tablas !== 'object') throw new Error('El JSON no tiene la estructura de Rumbo Libre');

  dbExec('BEGIN');
  try {
    for (const t of TABLAS) {
      const rows = Array.isArray(tablas[t]) ? tablas[t] : [];
      dbExec(`DELETE FROM ${t}`);
      if (rows.length) {
        const cols = Object.keys(rows[0] as Record<string, unknown>);
        const sql = `INSERT INTO ${t} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`;
        for (const row of rows) {
          const r = row as Record<string, unknown>;
          dbRun(sql, cols.map((c) => r[c] ?? null));
        }
      }
    }
    dbExec('COMMIT');
  } catch (e) {
    dbExec('ROLLBACK');
    throw e;
  }
}

export function importSqlite(bytes: Uint8Array): void {
  importFromBytes(bytes);
}

export function downloadBlob(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
