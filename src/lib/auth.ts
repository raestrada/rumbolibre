export async function hashPin(pin: string): Promise<string> {
  const base = 'rumbo-libre:' + pin;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(base);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback para contextos sin WebCrypto (p. ej. abrir desde file://).
  let h = 5381;
  for (let i = 0; i < base.length; i++) h = ((h << 5) + h + base.charCodeAt(i)) >>> 0;
  return 'fnv-' + h.toString(16);
}
