import { useEffect, useState, type ReactNode } from 'react';

export function CopyButton({
  text,
  label = 'Copiar',
  className = '',
  icono = '📋',
}: {
  text: string;
  label?: string;
  className?: string;
  icono?: string;
}): JSX.Element {
  const [copiado, setCopiado] = useState(false);

  async function copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1600);
  }

  return (
    <button type="button" className={`btn-copiar ${className}`} onClick={copiar}>
      {copiado ? '✓ ¡Copiado!' : `${icono} ${label}`}
    </button>
  );
}

export function ProgressBar({
  pct,
  color,
  alto = 10,
}: {
  pct: number;
  color?: string;
  alto?: number;
}): JSX.Element {
  const p = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="progress" style={{ height: alto }}>
      <div
        className="progress-fill"
        style={{ width: `${p}%`, background: color || 'var(--violeta)' }}
      />
    </div>
  );
}

export function Chip({
  children,
  color,
  tono,
}: {
  children: ReactNode;
  color?: string;
  tono?: 'suave' | 'fuerte';
}): JSX.Element {
  return (
    <span
      className={`chip ${tono === 'fuerte' ? 'chip-fuerte' : ''}`}
      style={color ? { background: color, color: '#fff' } : undefined}
    >
      {children}
    </span>
  );
}

export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
  ancho = 560,
}: {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: number;
}): JSX.Element | null {
  useEffect(() => {
    if (!abierto) return;
    const h = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return (
    <div className="overlay" onClick={onCerrar}>
      <div className="modal" style={{ maxWidth: ancho }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-cabecera">
          <h3>{titulo}</h3>
          <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  icono,
  titulo,
  texto,
}: {
  icono: string;
  titulo: string;
  texto?: string;
}): JSX.Element {
  return (
    <div className="empty">
      <div className="empty-icono">{icono}</div>
      <div className="empty-titulo">{titulo}</div>
      {texto ? <div className="empty-texto">{texto}</div> : null}
    </div>
  );
}
