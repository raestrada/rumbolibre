import initSqlJs from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { loadDb, saveDb } from './storage';
import { seed, seedContenido, SEED_VERSION } from './seed';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let ready = false;
let version = 0;
let persistTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  version += 1;
  for (const l of listeners) l();
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getVersion(): number {
  return version;
}

export function isReady(): boolean {
  return ready;
}

function schedulePersist(): void {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    void persistNow();
  }, 400);
}

export async function persistNow(): Promise<void> {
  if (!db) return;
  try {
    await saveDb(db.export());
  } catch (e) {
    console.error('Error persistiendo la base de datos', e);
  }
}

function syncSeed(): void {
  migrateSchema();
  const actual = Number(
    dbGet('SELECT valor FROM config WHERE clave = ?', ['seed_version'])?.valor ?? 0,
  );
  // Auto-reparación: si hay libros sin calificación, re-sembrar el contenido.
  const faltanRatings =
    Number(dbGet('SELECT COUNT(*) AS n FROM lecturas WHERE rating IS NULL')?.n ?? 0) > 0;
  if ((actual < SEED_VERSION || faltanRatings) && db) {
    seedContenido(db);
    dbRun(
      'INSERT INTO config (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor',
      ['seed_version', String(SEED_VERSION)],
    );
  }
}

// Migraciones ligeras de esquema (columnas nuevas) para bases ya existentes.
function migrateSchema(): void {
  if (!db) return;
  const cols = dbAll('PRAGMA table_info(lecturas)');
  if (!cols.some((c) => c.name === 'rating')) {
    db.exec('ALTER TABLE lecturas ADD COLUMN rating REAL');
  }
}

export async function initDatabase(): Promise<void> {
  if (db) return;
  SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const bytes = await loadDb().catch(() => null);
  if (bytes) {
    db = new SQL.Database(bytes);
    syncSeed();
  } else {
    db = new SQL.Database();
    seed(db);
  }
  await persistNow();
  ready = true;
  emit();
}

export function getRawDb(): Database | null {
  return db;
}

export function replaceDatabase(next: Database): void {
  db?.close();
  db = next;
  schedulePersist();
  emit();
}

export function importFromBytes(bytes: Uint8Array): void {
  if (!SQL) throw new Error('La base de datos no está inicializada');
  const candidate = new SQL.Database(bytes);
  const hasConfig =
    candidate.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='config'").length > 0;
  if (!hasConfig) {
    candidate.close();
    throw new Error('El archivo no parece ser un respaldo de Rumbo Libre');
  }
  replaceDatabase(candidate);
}

export function resetDatabase(): void {
  if (!SQL || !db) return;
  db.close();
  db = new SQL.Database();
  seed(db);
  schedulePersist();
  emit();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbAll(sql: string, params: any[] = []): Record<string, any>[] {
  if (!db) return [];
  const stmt = db.prepare(sql);
  try {
    if (params.length) stmt.bind(params);
    const out: Record<string, any>[] = [];
    while (stmt.step()) out.push(stmt.getAsObject());
    return out;
  } finally {
    stmt.free();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbGet(sql: string, params: any[] = []): Record<string, any> | undefined {
  return dbAll(sql, params)[0];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbRun(sql: string, params: any[] = []): void {
  if (!db) return;
  db.run(sql, params);
  schedulePersist();
  emit();
}

export function dbExec(sql: string): void {
  if (!db) return;
  db.exec(sql);
  schedulePersist();
  emit();
}
