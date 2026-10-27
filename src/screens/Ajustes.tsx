import { useRef, useState, type FormEvent } from 'react';
import {
  addHito,
  deleteHito,
  getBitacora,
  addBitacora,
  deleteBitacora,
  getConfig,
  getCursoActivoId,
  getHitos,
  setConfig,
  setHitoCompletado,
  setHitoFecha,
} from '../db/queries';
import { hashPin } from '../lib/auth';
import { resetDatabase } from '../db/database';
import {
  downloadBlob,
  exportJsonString,
  exportSqliteBytes,
  importJson,
  importSqlite,
} from '../db/backup';
import { Chip } from '../components/ui';

export default function Ajustes(): JSX.Element {
  const config = getConfig();
  const cursoId = getCursoActivoId();
  const [nombre, setNombre] = useState(config.nombre || '');
  const [fecha, setFecha] = useState(config.fecha_examen || '');
  const [msg, setMsg] = useState('');

  // PIN
  const [pinActual, setPinActual] = useState('');
  const [pinNuevo, setPinNuevo] = useState('');
  const [pinConfirmar, setPinConfirmar] = useState('');
  const [msgPin, setMsgPin] = useState('');

  // Hitos
  const [hitoTitulo, setHitoTitulo] = useState('');
  const [nuevaFechaHito, setNuevaFechaHito] = useState('');

  const fileSqlite = useRef<HTMLInputElement>(null);
  const fileJson = useRef<HTMLInputElement>(null);

  const hitos = getHitos(cursoId);
  const bitacora = getBitacora();
  const [nota, setNota] = useState('');

  function flash(texto: string): void {
    setMsg(texto);
    setTimeout(() => setMsg(''), 2500);
  }

  function guardarPerfil(e: FormEvent): void {
    e.preventDefault();
    setConfig('nombre', nombre.trim() || 'Estudiante');
    setConfig('fecha_examen', fecha);
    flash('Perfil guardado ✓');
  }

  async function guardarPin(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (config.pin_hash && pinActual) {
      if ((await hashPin(pinActual)) !== config.pin_hash) {
        setMsgPin('El PIN actual no es correcto.');
        return;
      }
    }
    if (pinNuevo && pinNuevo !== pinConfirmar) {
      setMsgPin('Los PIN no coinciden.');
      return;
    }
    setConfig('pin_hash', pinNuevo ? await hashPin(pinNuevo) : config.pin_hash);
    setPinActual('');
    setPinNuevo('');
    setPinConfirmar('');
    setMsgPin('PIN actualizado ✓');
  }

  function exportarSqlite(): void {
    const bytes = exportSqliteBytes();
    downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'application/x-sqlite3' }), 'rumbo-libre-respaldo.sqlite');
    flash('Respaldo .sqlite descargado ✓');
  }

  function exportarJson(): void {
    const str = exportJsonString();
    downloadBlob(new Blob([str], { type: 'application/json' }), 'rumbo-libre-datos.json');
    flash('Respaldo .json descargado ✓');
  }

  async function onImportarSqlite(f: File | null): Promise<void> {
    if (!f) return;
    try {
      const buf = await f.arrayBuffer();
      importSqlite(new Uint8Array(buf));
      flash('Respaldo importado ✓');
    } catch (e) {
      alert('No se pudo importar: ' + (e as Error).message);
    }
  }

  async function onImportarJson(f: File | null): Promise<void> {
    if (!f) return;
    try {
      importJson(await f.text());
      flash('Respaldo importado ✓');
    } catch (e) {
      alert('No se pudo importar: ' + (e as Error).message);
    }
  }

  return (
    <div className="pantalla">
      <header className="cabecera">
        <h1>Ajustes ⚙️</h1>
        <p className="cabecera-sub">Tu perfil, plazos, PIN, respaldos y notas.</p>
      </header>
      {msg ? <div className="msg-ok">{msg}</div> : null}

      <div className="grid-ajustes">
        <section className="tarjeta">
          <h2 className="seccion-titulo">Perfil</h2>
          <form onSubmit={guardarPerfil} className="form-col">
            <label className="campo">
              <span>Nombre</span>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </label>
            <label className="campo">
              <span>Fecha del examen (aproximada)</span>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </label>
            <button className="btn btn-primario" type="submit">
              Guardar perfil
            </button>
          </form>
        </section>

        <section className="tarjeta">
          <h2 className="seccion-titulo">PIN de papás</h2>
          <form onSubmit={guardarPin} className="form-col">
            {config.pin_hash ? (
              <label className="campo">
                <span>PIN actual</span>
                <input type="password" value={pinActual} onChange={(e) => setPinActual(e.target.value)} />
              </label>
            ) : (
              <p className="cabecera-sub">Aún no hay PIN. Define uno para proteger el seguimiento.</p>
            )}
            <label className="campo">
              <span>Nuevo PIN</span>
              <input
                type="password"
                value={pinNuevo}
                onChange={(e) => setPinNuevo(e.target.value)}
                inputMode="numeric"
                maxLength={6}
              />
            </label>
            <label className="campo">
              <span>Repetir PIN</span>
              <input
                type="password"
                value={pinConfirmar}
                onChange={(e) => setPinConfirmar(e.target.value)}
                inputMode="numeric"
                maxLength={6}
              />
            </label>
            {msgPin ? <div className="msg-ok">{msgPin}</div> : null}
            <button className="btn btn-primario" type="submit">
              Guardar PIN
            </button>
          </form>
        </section>

        <section className="tarjeta">
          <h2 className="seccion-titulo">Respaldo de datos</h2>
          <p className="cabecera-sub">
            Tus datos viven en este computador. Descarga un respaldo y guárdalo en un lugar seguro (Drive,
            USB, etc.).
          </p>
          <div className="botones-col">
            <button className="btn btn-secundario" onClick={exportarSqlite}>
              ⬇️ Descargar respaldo (.sqlite)
            </button>
            <button className="btn btn-secundario" onClick={exportarJson}>
              ⬇️ Descargar respaldo (.json)
            </button>
            <button className="btn btn-suave" onClick={() => fileSqlite.current?.click()}>
              ⬆️ Importar .sqlite
            </button>
            <button className="btn btn-suave" onClick={() => fileJson.current?.click()}>
              ⬆️ Importar .json
            </button>
            <input
              ref={fileSqlite}
              type="file"
              accept=".sqlite,.db,.bin,application/x-sqlite3"
              hidden
              onChange={(e) => onImportarSqlite(e.target.files?.[0] ?? null)}
            />
            <input
              ref={fileJson}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => onImportarJson(e.target.files?.[0] ?? null)}
            />
          </div>
        </section>
      </div>

      <section className="tarjeta">
        <h2 className="seccion-titulo">Calendario y plazos</h2>
        <div className="lista">
          {hitos.map((h) => (
            <div key={h.id} className="tarjeta fila">
              <button
                className={`check ${h.completado ? 'check-on' : ''}`}
                onClick={() => setHitoCompletado(h.id, !h.completado)}
              >
                {h.completado ? '✓' : ''}
              </button>
              <div className="fila-cuerpo">
                <div className="fila-titulo">{h.titulo}</div>
                <div className="fila-sub">{h.descripcion}</div>
              </div>
              <input
                type="date"
                className="input-fecha"
                value={h.fecha || ''}
                onChange={(e) => setHitoFecha(h.id, e.target.value)}
              />
              <button className="btn-peligro-suave" onClick={() => deleteHito(h.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="form-fila">
          <input
            value={hitoTitulo}
            onChange={(e) => setHitoTitulo(e.target.value)}
            placeholder="Nuevo plazo (ej. Inscripción)"
          />
          <input
            type="date"
            value={nuevaFechaHito}
            onChange={(e) => setNuevaFechaHito(e.target.value)}
          />
          <button
            className="btn btn-suave"
            onClick={() => {
              if (hitoTitulo.trim()) {
                addHito(cursoId, hitoTitulo.trim(), nuevaFechaHito, '');
                setHitoTitulo('');
                setNuevaFechaHito('');
              }
            }}
          >
            Agregar
          </button>
        </div>
      </section>

      <section className="tarjeta">
        <h2 className="seccion-titulo">Notas rápidas</h2>
        <div className="form-fila">
          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Escribe una nota o recordatorio…"
          />
          <button
            className="btn btn-suave"
            onClick={() => {
              if (nota.trim()) {
                addBitacora(nota.trim());
                setNota('');
              }
            }}
          >
            Guardar
          </button>
        </div>
        {bitacora.length ? (
          <div className="lista bitacora">
            {bitacora.map((b) => (
              <div key={b.id} className="fila">
                <div className="fila-cuerpo">
                  <div className="fila-titulo">{b.texto}</div>
                  <div className="fila-sub">{new Date(b.fecha).toLocaleString('es-CL')}</div>
                </div>
                <button className="btn-peligro-suave" onClick={() => deleteBitacora(b.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="tarjeta peligro">
        <h2 className="seccion-titulo">Zona de riesgo</h2>
        <p className="cabecera-sub">Borra todos los datos y vuelve a empezar desde cero.</p>
        <button
          className="btn btn-peligro"
          onClick={() => {
            if (confirm('¿Seguro? Se borrará TODO tu progreso y registros.')) resetDatabase();
          }}
        >
          Restablecer todo
        </button>
      </section>
    </div>
  );
}
