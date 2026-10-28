import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  addHito,
  deleteHito,
  getBitacora,
  addBitacora,
  deleteBitacora,
  getConfig,
  getCursoActivoId,
  getCursos,
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
import { MODELO_DEFECTO, listarModelos, probarClave, type ModeloOR } from '../lib/openrouter';
import { borrarClave, cargarClave, getModoClave, guardarClave } from '../lib/secureKey';

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

  // IA (OpenRouter)
  const [aiMode, setAiMode] = useState(config.ai_mode || 'manual');
  const [aiModel, setAiModel] = useState(config.ai_model || MODELO_DEFECTO);
  const [keyInput, setKeyInput] = useState('');
  const [keyStorage, setKeyStorage] = useState<string>(getModoClave());
  const [passphrase, setPassphrase] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [msgIA, setMsgIA] = useState('');
  const [modelos, setModelos] = useState<ModeloOR[]>([]);
  const [cargandoModelos, setCargandoModelos] = useState(false);

  useEffect(() => {
    void cargarClave().then((k) => {
      if (k) setKeyInput(k);
    });
  }, []);

  useEffect(() => {
    setCargandoModelos(true);
    listarModelos()
      .then(setModelos)
      .catch(() => setModelos([]))
      .finally(() => setCargandoModelos(false));
  }, []);

  async function probarIA(): Promise<void> {
    let k = keyInput.trim();
    if (!k && keyStorage === 'cifrada' && passphrase.trim()) {
      const unlocked = await cargarClave(passphrase.trim());
      if (unlocked) {
        k = unlocked;
        setKeyInput(unlocked);
      }
    }
    const r = await probarClave(k);
    setTestMsg(r.ok ? `✓ Clave válida${r.saldo != null ? ` · saldo $${r.saldo}` : ''}` : `✗ ${r.error}`);
  }

  async function guardarIA(e: FormEvent): Promise<void> {
    e.preventDefault();
    setConfig('ai_mode', aiMode);
    setConfig('ai_model', aiModel);
    if (aiMode === 'openrouter' && keyInput.trim()) {
      if (keyStorage === 'cifrada' && !passphrase.trim()) {
        setMsgIA('Escribe una passphrase para cifrar la clave.');
        return;
      }
      await guardarClave(keyInput, keyStorage as 'memoria' | 'sesion' | 'cifrada', passphrase || undefined);
    }
    setMsgIA('Configuración de IA guardada ✓');
  }

  function quitarClave(): void {
    borrarClave();
    setKeyInput('');
    setMsgIA('Clave eliminada ✓');
  }

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
          <h2 className="seccion-titulo">Curso</h2>
          <p className="cabecera-sub">Elige el curso que estás preparando.</p>
          <label className="campo">
            <span>Curso activo</span>
            <select
              value={config.curso_activo || 'm1'}
              onChange={(e) => setConfig('curso_activo', e.target.value)}
            >
              {getCursos().map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <small>Por ahora solo está disponible 1° medio.</small>
          </label>
        </section>

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
        <h2 className="seccion-titulo">Inteligencia Artificial</h2>
        <p className="cabecera-sub">
          Elige cómo estudiar: <strong>manual</strong> (copiar/pegar en tu IA) o <strong>directo</strong> con
          OpenRouter (la app llama al modelo y controla el contexto).
        </p>
        <form onSubmit={guardarIA} className="form-col">
          <label className="campo">
            <span>Modo</span>
            <select value={aiMode} onChange={(e) => setAiMode(e.target.value)}>
              <option value="manual">Manual (copiar y pegar)</option>
              <option value="openrouter">Directo (OpenRouter)</option>
            </select>
          </label>

          {aiMode === 'openrouter' ? (
            <>
              <label className="campo">
                <span>Clave de OpenRouter</span>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sk-or-v1-…"
                  autoComplete="off"
                />
                <small>Se guarda solo en este navegador. Usa una clave con límite de gasto.</small>
              </label>

              <label className="campo">
                <span>Almacenamiento de la clave</span>
                <select value={keyStorage} onChange={(e) => setKeyStorage(e.target.value)}>
                  <option value="memoria">Solo en memoria (más seguro)</option>
                  <option value="sesion">En esta pestaña (se borra al cerrar)</option>
                  <option value="cifrada">Recordar en este equipo (cifrada)</option>
                </select>
              </label>

              {keyStorage === 'cifrada' ? (
                <label className="campo">
                  <span>Passphrase para cifrar</span>
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Frase secreta"
                  />
                </label>
              ) : null}

              <label className="campo">
                <span>Modelo</span>
                <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} disabled={cargandoModelos}>
                  {modelos.length === 0 ? <option value={MODELO_DEFECTO}>{MODELO_DEFECTO}</option> : null}
                  {modelos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {cargandoModelos ? <small>Cargando modelos…</small> : null}
              </label>

              <div className="paso-acciones">
                <button type="button" className="btn btn-secundario" onClick={probarIA}>
                  Probar clave
                </button>
                <button type="button" className="btn btn-suave" onClick={quitarClave}>
                  Borrar clave
                </button>
              </div>
              {testMsg ? <div className={testMsg.startsWith('✓') ? 'msg-ok' : 'msg-error'}>{testMsg}</div> : null}
            </>
          ) : null}

          {msgIA ? <div className="msg-ok">{msgIA}</div> : null}
          <button className="btn btn-primario" type="submit">
            Guardar IA
          </button>
        </form>
      </section>

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
