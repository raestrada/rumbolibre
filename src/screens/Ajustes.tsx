import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  actividadId,
  addHito,
  deleteHito,
  getBitacora,
  addBitacora,
  deleteBitacora,
  deleteRegistro,
  getAsignaturas,
  getConfig,
  getCursoActivoId,
  getCursos,
  getHitos,
  getModulos,
  getProgreso,
  getRegistros,
  setConfig,
  setHitoCompletado,
  setHitoFecha,
  setRegistroVerificado,
  type RegistroRow,
  type ModuloFull,
  type AsignaturaRow,
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
import { MODELO_DEFECTO, listarModelos, probarClave, type ModeloOR } from '../lib/openrouter';
import { borrarClave, cargarClave, guardarClave } from '../lib/secureKey';
import OpenRouterInfo from '../components/OpenRouterInfo';
import { ProgressBar, EmptyState } from '../components/ui';
import { notaColor } from '../lib/parser';

export type AjustesTab = 'general' | 'ia' | 'planes' | 'datos' | 'padres' | 'registro';

export default function Ajustes({ initialTab = 'general' }: { initialTab?: AjustesTab }): JSX.Element {
  const config = getConfig();
  const cursoId = getCursoActivoId();
  const [tab, setTab] = useState<AjustesTab>(initialTab);
  const [nombre, setNombre] = useState(config.nombre || '');
  const [fecha, setFecha] = useState(config.fecha_examen || '');
  const [msg, setMsg] = useState('');

  // PIN de seguridad para pestañas de papás y registro
  const [pinAutorizado, setPinAutorizado] = useState(!config.pin_hash);
  const [pinAcceso, setPinAcceso] = useState('');
  const [errorPinAcceso, setErrorPinAcceso] = useState('');

  // Configuración de PIN
  const [pinActual, setPinActual] = useState('');
  const [pinNuevo, setPinNuevo] = useState('');
  const [pinConfirmar, setPinConfirmar] = useState('');
  const [msgPin, setMsgPin] = useState('');

  // Hitos y notas rápidas
  const [hitoTitulo, setHitoTitulo] = useState('');
  const [nuevaFechaHito, setNuevaFechaHito] = useState('');
  const hitos = getHitos(cursoId);
  const bitacora = getBitacora();
  const [nota, setNota] = useState('');

  const fileSqlite = useRef<HTMLInputElement>(null);
  const fileJson = useRef<HTMLInputElement>(null);

  // IA (OpenRouter)
  const [aiModel, setAiModel] = useState(config.ai_model || MODELO_DEFECTO);
  const [keyInput, setKeyInput] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [msgIA, setMsgIA] = useState('');
  const [modelos, setModelos] = useState<ModeloOR[]>([]);
  const [cargandoModelos, setCargandoModelos] = useState(false);

  // Datos para Registro y Seguimiento (Papás)
  const asignaturas = getAsignaturas(cursoId);
  const progreso = getProgreso();
  const todosRegistros = getRegistros(cursoId);
  const evaluaciones = todosRegistros.filter((r) => r.tipo === 'evaluacion');
  const verificadas = todosRegistros.filter((r) => r.verificado === 1).length;

  const [filtroRegistro, setFiltroRegistro] = useState<'todas' | 'aprobadas' | 'repasar'>('todas');
  const [registroExpandido, setRegistroExpandido] = useState<string | null>(null);

  // Mapa de nombres de módulos
  const modulosMap = new Map<string, { modulo: ModuloFull; asig: AsignaturaRow }>();
  for (const a of asignaturas) {
    for (const m of getModulos(a.id)) {
      modulosMap.set(m.id, { modulo: m, asig: a });
    }
  }

  function getNombreModulo(moduloId: string): string {
    if (moduloId.endsWith(':ensayo')) {
      const asigId = moduloId.slice(0, -':ensayo'.length);
      const a = asignaturas.find((x) => x.id === asigId);
      return `Ensayo general · ${a?.nombre ?? 'Asignatura'}`;
    }
    const info = modulosMap.get(moduloId);
    if (info) {
      return `${info.modulo.codigo} — ${info.modulo.titulo}`;
    }
    return moduloId;
  }

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

  async function verificarPinAcceso(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!config.pin_hash) {
      setPinAutorizado(true);
      return;
    }
    const h = await hashPin(pinAcceso);
    if (h === config.pin_hash) {
      setPinAutorizado(true);
      setErrorPinAcceso('');
    } else {
      setErrorPinAcceso('PIN incorrecto. Intenta de nuevo.');
    }
  }

  async function probarIA(): Promise<void> {
    const k = keyInput.trim();
    if (!k) {
      setTestMsg('Ingresa una clave para probar.');
      return;
    }
    const r = await probarClave(k);
    if (r.ok) {
      setTestMsg(`✓ Clave válida${r.saldo != null ? ` · saldo $${r.saldo}` : ''}`);
      await guardarClave(k);
    } else {
      setTestMsg(`✗ ${r.error}`);
    }
  }

  async function guardarIA(e: FormEvent): Promise<void> {
    e.preventDefault();
    setConfig('ai_model', aiModel);
    if (keyInput.trim()) {
      await guardarClave(keyInput);
    }
    setMsgIA('Configuración guardada de forma permanente ✓');
    setTimeout(() => setMsgIA(''), 3000);
  }

  function quitarClave(): void {
    borrarClave();
    setKeyInput('');
    setMsgIA('Clave eliminada ✓');
    setTimeout(() => setMsgIA(''), 3000);
  }

  function flash(texto: string): void {
    setMsg(texto);
    setTimeout(() => setMsg(''), 3000);
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
    if (pinNuevo) {
      const hashed = await hashPin(pinNuevo);
      setConfig('pin_hash', hashed);
      setPinAutorizado(true);
    }
    setPinActual('');
    setPinNuevo('');
    setPinConfirmar('');
    setMsgPin('PIN actualizado ✓');
    setTimeout(() => setMsgPin(''), 3000);
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

  // Progreso global para la pestaña de papás
  const porAsignatura = asignaturas.map((a) => {
    const modulos = getModulos(a.id);
    let total = 0;
    let hechas = 0;
    for (const m of modulos) {
      for (const act of m.actividades) {
        total += 1;
        if (progreso[actividadId(m.id, act.tipo)] === 'completada') hechas += 1;
      }
    }
    return { asig: a, total, hechas, pct: total ? (hechas / total) * 100 : 0 };
  });
  const totalAct = porAsignatura.reduce((s, x) => s + x.total, 0);
  const hechasAct = porAsignatura.reduce((s, x) => s + x.hechas, 0);
  const pctGlobal = totalAct ? (hechasAct / totalAct) * 100 : 0;

  // Filtrado de evaluaciones en la pestaña registro
  const registrosFiltrados = evaluaciones.filter((r) => {
    if (filtroRegistro === 'aprobadas') return (r.nota ?? 0) >= 4;
    if (filtroRegistro === 'repasar') return (r.nota ?? 0) < 4;
    return true;
  });

  const requierePin = (tab === 'padres' || tab === 'registro') && config.pin_hash && !pinAutorizado;

  return (
    <div className="pantalla pantalla-ancha">
      <header className="cabecera">
        <h1>Ajustes ⚙️</h1>
        <p className="cabecera-sub">Tu perfil, la IA, el seguimiento de papás y tus plazos de estudio.</p>
      </header>
      {msg ? <div className="msg-ok">{msg}</div> : null}

      <div className="tabs scroll">
        {(
          [
            ['general', '👤 Perfil y PIN'],
            ['ia', '🤖 Inteligencia artificial'],
            ['planes', '📅 Plazos y notas'],
            ['datos', '💾 Respaldos'],
            ['padres', '👨‍👩‍👧 Para papás'],
            ['registro', '⭐ Evaluaciones'],
          ] as [AjustesTab, string][]
        ).map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'activo' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {requierePin ? (
        <div className="tarjeta pin-tarjeta" style={{ maxWidth: 440, margin: '30px auto', textAlign: 'center' }}>
          <div className="pin-icono">🔒</div>
          <h2>Área protegida con PIN</h2>
          <p className="cabecera-sub">Ingresa el PIN de papás para desbloquear el seguimiento y las evaluaciones.</p>
          <form onSubmit={verificarPinAcceso} className="onboarding-form">
            <label className="campo">
              <span>PIN de acceso</span>
              <input
                value={pinAcceso}
                onChange={(e) => setPinAcceso(e.target.value)}
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Ingresa los dígitos del PIN"
                autoFocus
              />
            </label>
            {errorPinAcceso ? <div className="msg-error">{errorPinAcceso}</div> : null}
            <button className="btn btn-primario btn-ancho" type="submit">
              Desbloquear acceso
            </button>
          </form>
        </div>
      ) : null}

      {!requierePin && tab === 'general' ? (
        <div className="ajustes-seccion">
          <div className="ajustes-grid-2col">
            <section className="tarjeta">
              <h2 className="seccion-titulo" style={{ marginTop: 0 }}>👤 Datos del estudiante</h2>
              <form onSubmit={guardarPerfil} className="form-col">
                <label className="campo">
                  <span>Tu nombre</span>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Sofía"
                  />
                </label>
                <label className="campo">
                  <span>Curso actual</span>
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
                  <small>Validación de estudios para 1° medio.</small>
                </label>
                <label className="campo">
                  <span>Fecha estimada del examen</span>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                  <small>Permite calcular la cuenta regresiva en tu Inicio.</small>
                </label>
                <button className="btn btn-primario" type="submit" style={{ marginTop: 8 }}>
                  Guardar datos
                </button>
              </form>
            </section>

            <section className="tarjeta">
              <h2 className="seccion-titulo" style={{ marginTop: 0 }}>🔒 PIN de papás</h2>
              <p className="fila-sub" style={{ marginBottom: 16 }}>
                Protege el acceso a las pestañas de seguimiento y notas para que tus papás revisen tu avance.
              </p>
              <form onSubmit={guardarPin} className="form-col">
                {config.pin_hash ? (
                  <label className="campo">
                    <span>PIN actual</span>
                    <input
                      type="password"
                      value={pinActual}
                      onChange={(e) => setPinActual(e.target.value)}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="••••••"
                    />
                  </label>
                ) : null}
                <label className="campo">
                  <span>{config.pin_hash ? 'Nuevo PIN (4 a 6 dígitos)' : 'Crear PIN (4 a 6 dígitos)'}</span>
                  <input
                    type="password"
                    value={pinNuevo}
                    onChange={(e) => setPinNuevo(e.target.value)}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••••"
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
                    placeholder="••••••"
                  />
                </label>
                {msgPin ? <div className="msg-ok">{msgPin}</div> : null}
                <button className="btn btn-primario" type="submit" style={{ marginTop: 8 }}>
                  Guardar PIN
                </button>
              </form>
            </section>
          </div>
        </div>
      ) : null}

      {!requierePin && tab === 'ia' ? (
        <div className="ajustes-seccion">
          <div className="ajustes-tarjeta-foco">
            <section className="tarjeta">
              <div className="ajustes-ia-cab">
                <div>
                  <h2 className="seccion-titulo" style={{ marginTop: 0 }}>Conexión con OpenRouter</h2>
                  <p className="cabecera-sub">
                    Tu profe IA te enseña y evalúa directamente desde tu navegador. <OpenRouterInfo />
                  </p>
                </div>
                <span className="ajustes-ia-badge">IA directa</span>
              </div>

              <form onSubmit={guardarIA} className="form-col">
                <label className="campo">
                  <span>Clave de API de OpenRouter</span>
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="sk-or-v1-abcdef0123456789…"
                    autoComplete="off"
                  />
                  <small>
                    🔒 Guardada de forma permanente en este navegador para que no tengas que escribirla cada vez.
                  </small>
                </label>

                <label className="campo">
                  <span>Modelo de inteligencia artificial</span>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    disabled={cargandoModelos}
                  >
                    {modelos.length === 0 ? <option value={MODELO_DEFECTO}>{MODELO_DEFECTO}</option> : null}
                    {modelos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  {cargandoModelos ? <small>Cargando lista de modelos…</small> : null}
                </label>

                <div className="paso-acciones" style={{ marginTop: 6 }}>
                  <button type="button" className="btn btn-secundario" onClick={probarIA}>
                    Probar clave
                  </button>
                  <button type="button" className="btn btn-suave" onClick={quitarClave}>
                    Borrar clave
                  </button>
                </div>

                {testMsg ? <div className={testMsg.startsWith('✓') ? 'msg-ok' : 'msg-error'}>{testMsg}</div> : null}
                {msgIA ? <div className="msg-ok">{msgIA}</div> : null}

                <button className="btn btn-primario" type="submit" style={{ marginTop: 12 }}>
                  Guardar configuración
                </button>
              </form>
            </section>
          </div>
        </div>
      ) : null}

      {!requierePin && tab === 'planes' ? (
        <div className="ajustes-seccion">
          <div className="ajustes-planes-contenedor">
            {/* Sección Calendario y Plazos */}
            <section className="tarjeta">
              <h2 className="seccion-titulo" style={{ marginTop: 0 }}>📅 Calendario y plazos importantes</h2>
              <p className="fila-sub" style={{ marginBottom: 16 }}>
                Fechas clave de inscripción, examinación o metas personales.
              </p>

              <div className="lista-hitos">
                {hitos.length === 0 ? (
                  <p className="fila-sub" style={{ padding: '8px 0' }}>No hay plazos registrados todavía.</p>
                ) : (
                  hitos.map((h) => (
                    <div key={h.id} className="hito-item-tarjeta">
                      <button
                        className={`check ${h.completado ? 'check-on' : ''}`}
                        onClick={() => setHitoCompletado(h.id, !h.completado)}
                        title={h.completado ? 'Marcar como pendiente' : 'Marcar como completado'}
                      >
                        {h.completado ? '✓' : ''}
                      </button>

                      <div className="hito-item-cuerpo">
                        <div className={`hito-item-titulo ${h.completado ? 'completado' : ''}`}>{h.titulo}</div>
                        {h.descripcion ? <div className="fila-sub">{h.descripcion}</div> : null}
                      </div>

                      <div className="hito-item-acciones">
                        <div className="hito-fecha-input-wrapper">
                          <input
                            type="date"
                            className="input-fecha-limpio"
                            value={h.fecha || ''}
                            onChange={(e) => setHitoFecha(h.id, e.target.value)}
                          />
                        </div>
                        <button
                          className="btn-icono-eliminar"
                          onClick={() => deleteHito(h.id)}
                          title="Eliminar este plazo"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulario nuevo plazo con alineación perfecta */}
              <div className="hito-nuevo-box">
                <span className="hito-nuevo-titulo">Nuevo plazo</span>
                <div className="hito-nuevo-form">
                  <input
                    className="hito-nuevo-input-texto"
                    value={hitoTitulo}
                    onChange={(e) => setHitoTitulo(e.target.value)}
                    placeholder="Ej. Inscripción primer periodo"
                  />
                  <input
                    type="date"
                    className="hito-nuevo-input-fecha"
                    value={nuevaFechaHito}
                    onChange={(e) => setNuevaFechaHito(e.target.value)}
                  />
                  <button
                    className="btn btn-primario hito-nuevo-btn"
                    onClick={() => {
                      if (hitoTitulo.trim()) {
                        addHito(cursoId, hitoTitulo.trim(), nuevaFechaHito, '');
                        setHitoTitulo('');
                        setNuevaFechaHito('');
                      }
                    }}
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </section>

            {/* Sección Notas Rápidas */}
            <section className="tarjeta" style={{ marginTop: 18 }}>
              <h2 className="seccion-titulo" style={{ marginTop: 0 }}>📝 Notas y recordatorios</h2>
              <div className="nota-rapida-form">
                <input
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Escribe un apunte o recordatorio…"
                />
                <button
                  className="btn btn-primario"
                  onClick={() => {
                    if (nota.trim()) {
                      addBitacora(nota.trim());
                      setNota('');
                    }
                  }}
                >
                  Guardar nota
                </button>
              </div>

              {bitacora.length > 0 ? (
                <div className="lista" style={{ marginTop: 14 }}>
                  {bitacora.map((b) => (
                    <div key={b.id} className="tarjeta fila" style={{ padding: '12px 14px' }}>
                      <div className="fila-cuerpo">
                        <div className="fila-titulo">{b.texto}</div>
                        <div className="fila-sub">{new Date(b.fecha).toLocaleString('es-CL')}</div>
                      </div>
                      <button
                        className="btn-icono-eliminar"
                        onClick={() => deleteBitacora(b.id)}
                        title="Eliminar nota"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      ) : null}

      {!requierePin && tab === 'datos' ? (
        <div className="ajustes-seccion">
          <div className="ajustes-grid-2col">
            <section className="tarjeta">
              <h2 className="seccion-titulo" style={{ marginTop: 0 }}>💾 Respaldos de tu avance</h2>
              <p className="cabecera-sub" style={{ marginBottom: 16 }}>
                Todos tus datos y registros viven en este navegador. Descarga una copia de seguridad para conservarla en un lugar seguro.
              </p>
              <div className="botones-grid-respaldo">
                <button className="btn btn-secundario" onClick={exportarSqlite}>
                  ⬇️ Exportar .sqlite
                </button>
                <button className="btn btn-secundario" onClick={exportarJson}>
                  ⬇️ Exportar .json
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

            <section className="tarjeta peligro">
              <h2 className="seccion-titulo" style={{ marginTop: 0, color: 'var(--peligro)' }}>⚠️ Zona de riesgo</h2>
              <p className="cabecera-sub" style={{ marginBottom: 16 }}>
                Borra absolutamente todo el progreso, notas y registros de la aplicación en este navegador.
              </p>
              <button
                className="btn btn-peligro btn-ancho"
                onClick={() => {
                  if (confirm('¿Segura? Se borrará TODO tu avance, notas e historial sin posibilidad de recuperación.')) {
                    resetDatabase();
                  }
                }}
              >
                Restablecer datos de fábrica
              </button>
            </section>
          </div>
        </div>
      ) : null}

      {!requierePin && tab === 'padres' ? (
        <div className="ajustes-seccion" style={{ maxWidth: 860 }}>
          <section className="tarjeta resumen-global" style={{ marginBottom: 18 }}>
            <div className="resumen-texto">
              <div className="resumen-cifra">{Math.round(pctGlobal)}%</div>
              <div className="resumen-etiqueta">avance general · {hechasAct} de {totalAct} actividades completadas</div>
            </div>
            <ProgressBar pct={pctGlobal} alto={14} />
            <div className="resumen-meta">
              <span>⭐ {evaluaciones.length} evaluaciones realizadas</span>
              <span>✅ {verificadas} revisadas</span>
            </div>
          </section>

          <h2 className="seccion-titulo">Avance por asignatura</h2>
          <div className="lista" style={{ marginBottom: 24 }}>
            {porAsignatura.map(({ asig, total: t, hechas: h, pct }) => (
              <div key={asig.id} className="tarjeta fila">
                <span className="asig-icono" style={{ background: asig.color }}>
                  {asig.icono}
                </span>
                <div className="fila-cuerpo">
                  <div className="fila-titulo">{asig.nombre}</div>
                  <div className="fila-sub">
                    {h}/{t} actividades completadas
                  </div>
                  <ProgressBar pct={pct} color={asig.color} alto={6} />
                </div>
                <span className="fila-cifra">{Math.round(pct)}%</span>
              </div>
            ))}
          </div>

          <h2 className="seccion-titulo">Últimas evaluaciones</h2>
          {evaluaciones.length === 0 ? (
            <EmptyState icono="⭐" titulo="Aún no hay evaluaciones registradas" />
          ) : (
            <div className="lista">
              {evaluaciones.slice(0, 10).map((r) => (
                <div key={r.id} className="tarjeta fila">
                  <span className="nota-burbuja" style={{ background: notaColor(r.nota) }}>
                    {r.nota != null ? r.nota.toFixed(1) : '–'}
                  </span>
                  <div className="fila-cuerpo">
                    <div className="fila-titulo">{getNombreModulo(r.modulo_id)}</div>
                    <div className="fila-sub">
                      {new Date(r.fecha).toLocaleDateString('es-CL')}
                      {r.temas_a_reforzar.length ? ` · A reforzar: ${r.temas_a_reforzar.join(', ')}` : ' · Sin temas pendientes'}
                    </div>
                  </div>
                  <span>{r.verificado ? '✅' : '⏳'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {!requierePin && tab === 'registro' ? (
        <div className="ajustes-seccion" style={{ maxWidth: 860 }}>
          <div className="tabs" style={{ marginBottom: 14 }}>
            <button
              className={`tab ${filtroRegistro === 'todas' ? 'activo' : ''}`}
              onClick={() => setFiltroRegistro('todas')}
            >
              Todas ({evaluaciones.length})
            </button>
            <button
              className={`tab ${filtroRegistro === 'aprobadas' ? 'activo' : ''}`}
              onClick={() => setFiltroRegistro('aprobadas')}
            >
              Aprobadas (≥ 4.0)
            </button>
            <button
              className={`tab ${filtroRegistro === 'repasar' ? 'activo' : ''}`}
              onClick={() => setFiltroRegistro('repasar')}
            >
              Por repasar (&lt; 4.0)
            </button>
          </div>

          {registrosFiltrados.length === 0 ? (
            <EmptyState
              icono="⭐"
              titulo="Sin evaluaciones aquí"
              texto="Las evaluaciones realizadas con tu IA se listarán aquí automáticamente."
            />
          ) : (
            <div className="lista">
              {registrosFiltrados.map((r: RegistroRow) => {
                const isExp = registroExpandido === r.id;
                return (
                  <div key={r.id} className="tarjeta registro">
                    <div
                      className="registro-cabecera"
                      onClick={() => setRegistroExpandido(isExp ? null : r.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="nota-burbuja" style={{ background: notaColor(r.nota) }}>
                        {r.nota != null ? r.nota.toFixed(1) : '–'}
                      </span>
                      <div className="fila-cuerpo">
                        <div className="fila-titulo">{getNombreModulo(r.modulo_id)}</div>
                        <div className="fila-sub">
                          {new Date(r.fecha).toLocaleString('es-CL')}
                          {r.preguntas_totales
                            ? ` · ${r.preguntas_correctas ?? '?'}/${r.preguntas_totales} correctas`
                            : ''}
                        </div>
                      </div>
                      <button
                        className={`check ${r.verificado ? 'check-on' : ''}`}
                        title="Marcar como verificado por papás"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRegistroVerificado(r.id, !r.verificado);
                        }}
                      >
                        {r.verificado ? '✓' : ''}
                      </button>
                    </div>

                    {isExp ? (
                      <div className="detalle-registro" style={{ padding: '12px 4px 6px' }}>
                        {r.temas_dominados.length ? (
                          <div className="detalle-grupo">
                            <strong>✅ Temas dominados</strong>
                            <ul>{r.temas_dominados.map((t, i) => <li key={i}>{t}</li>)}</ul>
                          </div>
                        ) : null}
                        {r.temas_a_reforzar.length ? (
                          <div className="detalle-grupo">
                            <strong>🔁 Temas a reforzar</strong>
                            <ul>{r.temas_a_reforzar.map((t, i) => <li key={i}>{t}</li>)}</ul>
                          </div>
                        ) : null}
                        {r.retroalimentacion ? (
                          <div className="detalle-grupo">
                            <strong>💬 Retroalimentación</strong>
                            <p>{r.retroalimentacion}</p>
                          </div>
                        ) : null}
                        {r.siguiente_paso ? (
                          <div className="detalle-grupo">
                            <strong>👉 Siguiente paso</strong>
                            <p>{r.siguiente_paso}</p>
                          </div>
                        ) : null}
                        <div className="registro-pie" style={{ marginTop: 12 }}>
                          <button
                            className="btn btn-peligro-suave"
                            onClick={() => {
                              if (confirm('¿Eliminar esta evaluación?')) deleteRegistro(r.id);
                            }}
                          >
                            🗑️ Eliminar evaluación
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
