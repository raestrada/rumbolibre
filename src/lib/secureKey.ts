// Almacenamiento seguro de la API key de OpenRouter.
// Modos: memoria (más seguro), sesión (sessionStorage) y cifrada (AES-GCM + passphrase).
type ModoClave = 'memoria' | 'sesion' | 'cifrada';

const LS_MODE = 'rl-key-mode';
const LS_BLOB = 'rl-key-blob';
const SS_KEY = 'rl-key-session';

let memoria = '';

export function getModoClave(): ModoClave {
  try {
    const v = localStorage.getItem(LS_MODE);
    if (v === 'sesion' || v === 'cifrada') return v;
  } catch {
    /* ignore */
  }
  return 'memoria';
}

export function setModoClave(m: ModoClave): void {
  try {
    localStorage.setItem(LS_MODE, m);
  } catch {
    /* ignore */
  }
}

function b64(buf: Uint8Array): string {
  let s = '';
  for (const b of buf) s += String.fromCharCode(b);
  return btoa(s);
}

function fromB64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

function bs(u: Uint8Array): BufferSource {
  return u as unknown as BufferSource;
}

async function derivar(pass: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: bs(salt), iterations: 150000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function cifrar(key: string, pass: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ck = await derivar(pass, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: bs(iv) }, ck, new TextEncoder().encode(key));
  localStorage.setItem(LS_BLOB, JSON.stringify({ salt: b64(salt), iv: b64(iv), ct: b64(new Uint8Array(ct)) }));
}

async function descifrar(pass: string): Promise<string | null> {
  try {
    const raw = localStorage.getItem(LS_BLOB);
    if (!raw) return null;
    const { salt, iv, ct } = JSON.parse(raw) as { salt: string; iv: string; ct: string };
    const ck = await derivar(pass, fromB64(salt));
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bs(fromB64(iv)) }, ck, bs(fromB64(ct)));
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

export function hayClaveCifrada(): boolean {
  try {
    return !!localStorage.getItem(LS_BLOB);
  } catch {
    return false;
  }
}

export async function guardarClave(key: string, modo: ModoClave, passphrase?: string): Promise<void> {
  const limpia = key.trim().replace(/^\s*Bearer\s+/i, '').replace(/[\s\r\n]+/g, '');
  memoria = limpia;
  setModoClave(modo);
  try {
    sessionStorage.removeItem(SS_KEY);
    if (modo === 'sesion') sessionStorage.setItem(SS_KEY, limpia);
    if (modo === 'cifrada' && passphrase) await cifrar(limpia, passphrase);
    if (modo !== 'cifrada') localStorage.removeItem(LS_BLOB);
  } catch {
    /* ignore */
  }
}

// Devuelve la clave disponible en esta sesión (memoria/sesión) o la descifra si se da passphrase.
export async function cargarClave(passphrase?: string): Promise<string | null> {
  if (memoria) return memoria;
  const modo = getModoClave();
  if (modo === 'sesion') {
    try {
      const k = sessionStorage.getItem(SS_KEY);
      if (k) {
        memoria = k;
        return k;
      }
    } catch {
      /* ignore */
    }
    return null;
  }
  if (modo === 'cifrada' && passphrase) {
    const k = await descifrar(passphrase);
    if (k) memoria = k;
    return k;
  }
  return null;
}

export function claveEnMemoria(): string | null {
  return memoria || null;
}

export function borrarClave(): void {
  memoria = '';
  try {
    sessionStorage.removeItem(SS_KEY);
    localStorage.removeItem(LS_BLOB);
  } catch {
    /* ignore */
  }
}
