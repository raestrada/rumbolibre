// Almacenamiento persistente de la API key de OpenRouter.
// La clave se guarda en localStorage de este navegador para que no se pierda al refrescar.
import { sanitizeApiKey } from './openrouter';

const LS_KEY = 'rl-openrouter-key';
const SS_KEY = 'rl-key-session';

let memoria = '';

export async function guardarClave(key: string, _modo?: string, _passphrase?: string): Promise<void> {
  const limpia = sanitizeApiKey(key);
  memoria = limpia;
  try {
    if (limpia) {
      localStorage.setItem(LS_KEY, limpia);
      sessionStorage.setItem(SS_KEY, limpia);
    } else {
      borrarClave();
    }
  } catch {
    /* ignore */
  }
}

// Devuelve la clave persistente guardada en este navegador
export async function cargarClave(): Promise<string | null> {
  if (memoria) return sanitizeApiKey(memoria);
  try {
    const local = localStorage.getItem(LS_KEY);
    if (local) {
      memoria = sanitizeApiKey(local);
      return memoria;
    }
    const session = sessionStorage.getItem(SS_KEY);
    if (session) {
      memoria = sanitizeApiKey(session);
      return memoria;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function claveEnMemoria(): string | null {
  if (memoria) return sanitizeApiKey(memoria);
  try {
    const k = localStorage.getItem(LS_KEY) || sessionStorage.getItem(SS_KEY);
    if (k) {
      memoria = sanitizeApiKey(k);
      return memoria;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function borrarClave(): void {
  memoria = '';
  try {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem('rl-key-blob');
    localStorage.removeItem('rl-key-mode');
    sessionStorage.removeItem(SS_KEY);
  } catch {
    /* ignore */
  }
}

// Compatibilidad
export function getModoClave(): string {
  return 'local';
}

export function setModoClave(_m: string): void {
  /* no-op: siempre persistente */
}

export function hayClaveCifrada(): boolean {
  return false;
}
