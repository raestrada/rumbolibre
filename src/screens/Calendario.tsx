import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNav } from '../App';
import {
  getAsignaturas,
  getConfig,
  getCursoActivoId,
  getCursos,
  getEnsayoNota,
  getModulos,
  getRegistros,
  setConfig,
  type ModuloFull,
} from '../db/queries';
import {
  MODALIDADES,
  avanzarEntrevistaCalendario,
  estimarFactorBase,
  generarPlanCalendario,
  hoyISO,
  sumarDiasISO,
  type CalendarioConfig,
  type DiaCalendario,
  type TurnoEntrevista,
} from '../lib/calendario';
import { MODELO_DEFECTO, listarModelos, type ModeloOR } from '../lib/openrouter';
import { cargarClave } from '../lib/secureKey';

const DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function cargarCalendarioConfig(config: Record<string, string>): CalendarioConfig {
  const hoy = hoyISO();
  const defectoPrueba = config.fecha_examen || sumarDiasISO(hoy, 60);
  const raw = config.calendario_plan;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<CalendarioConfig>;
      return {
        fechaInicio: parsed.fechaInicio || hoy,
        fechaPrueba: config.fecha_examen || parsed.fechaPrueba || defectoPrueba,
        modalidades: Array.isArray(parsed.modalidades) ? parsed.modalidades : [],
        otraModalidad: parsed.otraModalidad || '',
        factorTiempo: typeof parsed.factorTiempo === 'number' ? parsed.factorTiempo : 1.0,
        horasSemanales: typeof parsed.horasSemanales === 'number' ? parsed.horasSemanales : 15,
        diasEstudio:
          Array.isArray(parsed.diasEstudio) && parsed.diasEstudio.length > 0
            ? parsed.diasEstudio
            : [1, 2, 3, 4, 5],
        resumenIA: parsed.resumenIA,
        recomendaciones: Array.isArray(parsed.recomendaciones) ? parsed.recomendaciones : undefined,
        entrevistaCompletada: Boolean(parsed.entrevistaCompletada),
      };
    } catch {
      /* fallback */
    }
  }
  return {
    fechaInicio: hoy,
    fechaPrueba: defectoPrueba,
    modalidades: [],
    otraModalidad: '',
    factorTiempo: 1.0,
    horasSemanales: 15,
    diasEstudio: [1, 2, 3, 4, 5],
  };
}

function etiquetaViabilidad(v: string): { texto: string; clase: string } {
  switch (v) {
    case 'holgado':
      return { texto: '🌿 Ritmo holgado', clase: 'ok' };
    case 'equilibrado':
      return { texto: '✅ Ritmo equilibrado', clase: 'ok' };
    case 'exigente':
      return { texto: '⚡ Ritmo exigente', clase: 'alerta' };
    default:
      return { texto: '🔥 Muy apretado', clase: 'peligro' };
  }
}

export default function Calendario(): JSX.Element {
  const { go } = useNav();
  const config = getConfig();
  const cursoId = getCursoActivoId();
  const curso = getCursos().find((c) => c.id === cursoId);
  const asignaturas = getAsignaturas(cursoId);
  const registros = getRegistros(cursoId);

  const modulosPorAsig = useMemo(() => {
    const map = new Map<string, ModuloFull[]>();
    for (const a of asignaturas) map.set(a.id, getModulos(a.id));
    return map;
  }, [asignaturas]);

  const ensayosNotas = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const a of asignaturas) map.set(a.id, getEnsayoNota(a.id));
    return map;
  }, [asignaturas]);

  const [cfg, setCfg] = useState<CalendarioConfig>(() => cargarCalendarioConfig(config));
  const [vista, setVista] = useState<'mes' | 'semanas'>('mes');
  const [mostrarAjusteManual, setMostrarAjusteManual] = useState(false);

  // Estado IA / entrevista iterativa
  const [apiKey, setApiKey] = useState<string>('');
  const [modelos, setModelos] = useState<ModeloOR[]>([]);
  const [entrevistaActiva, setEntrevistaActiva] = useState(false);
  const [historial, setHistorial] = useState<TurnoEntrevista[]>([]);
  const [preguntaActual, setPreguntaActual] = useState<string>('');
  const [opcionesRapidas, setOpcionesRapidas] = useState<string[]>([]);
  const [resumenEntendido, setResumenEntendido] = useState<string>('');
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [errorIA, setErrorIA] = useState('');

  // Mes visible en la vista mensual
  const [mesCursor, setMesCursor] = useState<{ year: number; month: number }>(() => {
    const base = cfg.fechaInicio ? new Date(cfg.fechaInicio + 'T00:00:00') : new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  useEffect(() => {
    void cargarClave().then((k) => setApiKey(k || ''));
    listarModelos().then(setModelos).catch(() => setModelos([]));
  }, []);

  function actualizarCfg(parcial: Partial<CalendarioConfig>, sincronizarExamen = false): void {
    setCfg((prev) => {
      const next = { ...prev, ...parcial };
      setConfig('calendario_plan', JSON.stringify(next));
      if (sincronizarExamen && parcial.fechaPrueba !== undefined) {
        setConfig('fecha_examen', parcial.fechaPrueba);
      }
      return next;
    });
  }

  function toggleModalidad(id: string): void {
    const existe = cfg.modalidades.includes(id);
    const nuevas = existe ? cfg.modalidades.filter((x) => x !== id) : [...cfg.modalidades, id];
    const est = estimarFactorBase(nuevas);
    actualizarCfg({
      modalidades: nuevas,
      factorTiempo: est.factor,
      horasSemanales: est.horas,
      entrevistaCompletada: false,
    });
  }

  function toggleDiaEstudio(dia: number): void {
    const existe = cfg.diasEstudio.includes(dia);
    const nuevos = existe
      ? cfg.diasEstudio.filter((d) => d !== dia)
      : [...cfg.diasEstudio, dia].sort((a, b) => a - b);
    if (nuevos.length === 0) return;
    actualizarCfg({ diasEstudio: nuevos });
  }

  const plan = useMemo(
    () =>
      generarPlanCalendario({
        cursoId,
        cfg,
        asignaturas,
        modulosPorAsig,
        registros,
        ensayosNotas,
      }),
    [cursoId, cfg, asignaturas, modulosPorAsig, registros, ensayosNotas],
  );

  async function ejecutarTurnoIA(nuevoHistorial: TurnoEntrevista[]): Promise<void> {
    setCargandoIA(true);
    setErrorIA('');
    try {
      const key = apiKey || (await cargarClave()) || '';
      if (!key) {
        setErrorIA('Necesitas configurar tu clave de OpenRouter en Ajustes → Inteligencia artificial.');
        setCargandoIA(false);
        return;
      }
      const modelId = config.ai_model || MODELO_DEFECTO;
      const metaModelo = modelos.find((m) => m.id === modelId);
      const res = await avanzarEntrevistaCalendario({
        key,
        model: modelId,
        structured: metaModelo?.structured ?? false,
        json: metaModelo?.json ?? true,
        cursoNombre: curso?.nombre || '1° medio',
        modalidades: cfg.modalidades,
        otraModalidad: cfg.otraModalidad,
        fechaInicio: cfg.fechaInicio,
        fechaPrueba: cfg.fechaPrueba,
        modulosRestantes: plan.modulosPorHacer + plan.modulosPorRepasar,
        historial: nuevoHistorial,
      });

      if (res.listo) {
        actualizarCfg({
          factorTiempo: res.factor_tiempo ?? cfg.factorTiempo,
          horasSemanales: res.horas_semanales ?? cfg.horasSemanales,
          diasEstudio: res.dias_estudio && res.dias_estudio.length > 0 ? res.dias_estudio : cfg.diasEstudio,
          resumenIA: res.explicacion_factor || 'Disponibilidad calculada según tus actividades.',
          recomendaciones: res.recomendaciones || [],
          entrevistaCompletada: true,
        });
        setEntrevistaActiva(false);
        setPreguntaActual('');
        setOpcionesRapidas([]);
      } else {
        const preg = res.pregunta || '¿Cuántas horas a la semana dedicas en total a estas actividades?';
        setPreguntaActual(preg);
        setOpcionesRapidas(res.opciones_rapidas || []);
        setResumenEntendido(res.resumen_entendido || '');
        setHistorial([...nuevoHistorial, { role: 'assistant', content: preg }]);
      }
    } catch (e) {
      setErrorIA((e as Error).message || 'No se pudo consultar a la IA.');
    } finally {
      setCargandoIA(false);
    }
  }

  function iniciarEntrevista(): void {
    setEntrevistaActiva(true);
    setHistorial([]);
    setPreguntaActual('');
    setOpcionesRapidas([]);
    setResumenEntendido('');
    setErrorIA('');
    void ejecutarTurnoIA([]);
  }

  function responderEntrevista(texto: string): void {
    const clean = texto.trim();
    if (!clean || cargandoIA) return;
    setRespuestaUsuario('');
    const nextHist: TurnoEntrevista[] = [...historial, { role: 'user', content: clean }];
    setHistorial(nextHist);
    void ejecutarTurnoIA(nextHist);
  }

  function onSubmitRespuesta(e: FormEvent): void {
    e.preventDefault();
    responderEntrevista(respuestaUsuario);
  }

  // Mapa rápido por fecha para la vista mensual
  const diasPorFecha = useMemo(() => {
    const map = new Map<string, DiaCalendario>();
    for (const d of plan.dias) map.set(d.fecha, d);
    return map;
  }, [plan.dias]);

  // Celdas del mes actual (Lunes a Domingo)
  const celdasMes = useMemo(() => {
    const { year, month } = mesCursor;
    const primero = new Date(year, month, 1);
    const ultimo = new Date(year, month + 1, 0);
    // Convertir getDay() (0=Dom..6=Sab) a índice Lunes=0..Domingo=6
    const offsetInicio = (primero.getDay() + 6) % 7;
    const totalDias = ultimo.getDate();
    const celdas: (string | null)[] = [];
    for (let i = 0; i < offsetInicio; i++) celdas.push(null);
    for (let d = 1; d <= totalDias; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      celdas.push(`${year}-${mStr}-${dStr}`);
    }
    while (celdas.length % 7 !== 0) celdas.push(null);
    return celdas;
  }, [mesCursor]);

  // Agrupación por semanas para la vista lista/semanas
  const semanasLista = useMemo(() => {
    const grupos: { titulo: string; dias: DiaCalendario[] }[] = [];
    let actual: DiaCalendario[] = [];
    let numSemana = 1;
    for (const d of plan.dias) {
      actual.push(d);
      // Cortar los domingos o al final
      if (d.diaSemana === 0) {
        grupos.push({ titulo: `Semana ${numSemana}`, dias: actual });
        actual = [];
        numSemana += 1;
      }
    }
    if (actual.length > 0) {
      grupos.push({ titulo: `Semana ${numSemana}`, dias: actual });
    }
    return grupos;
  }, [plan.dias]);

  function cambiarMes(delta: number): void {
    setMesCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const badgeViab = etiquetaViabilidad(plan.viabilidad);

  return (
    <div className="pantalla pantalla-ancha">
      <header className="cabecera">
        <h1>Calendario de estudio 📅</h1>
        <p className="cabecera-sub">
          Organiza tus estudios y repasos entre tu fecha de inicio y tu prueba, adaptando el ritmo a
          tus actividades paralelas.
        </p>
      </header>

      {/* 1. Fechas y Modalidades */}
      <section className="tarjeta calendario-config">
        <div className="calendario-fechas-grid">
          <label className="campo">
            <span>📆 Fecha de inicio</span>
            <input
              type="date"
              value={cfg.fechaInicio}
              onChange={(e) => {
                const v = e.target.value;
                actualizarCfg({ fechaInicio: v });
                if (v) {
                  const d = new Date(v + 'T00:00:00');
                  if (!isNaN(d.getTime())) setMesCursor({ year: d.getFullYear(), month: d.getMonth() });
                }
              }}
            />
          </label>
          <label className="campo">
            <span>🎯 Fecha de la prueba</span>
            <input
              type="date"
              value={cfg.fechaPrueba}
              onChange={(e) => actualizarCfg({ fechaPrueba: e.target.value }, true)}
            />
          </label>
        </div>

        <div className="calendario-bloque-titulo">
          <span>¿Qué otras actividades realizas en serio?</span>
          <small>Puedes elegir una o varias para adaptar tu calendario.</small>
        </div>

        <div className="modalidades-grid">
          {MODALIDADES.map((m) => {
            const activa = cfg.modalidades.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                className={`modalidad-card ${activa ? 'activa' : ''}`}
                onClick={() => toggleModalidad(m.id)}
              >
                <div className="modalidad-top">
                  <span className="modalidad-icono">{m.icono}</span>
                  <span className="modalidad-nombre">{m.nombre}</span>
                  <span className="modalidad-check">{activa ? '✓' : '+'}</span>
                </div>
                <p className="modalidad-desc">{m.descripcion}</p>
              </button>
            );
          })}
        </div>

        {cfg.modalidades.includes('otro') ? (
          <label className="campo" style={{ marginTop: 12 }}>
            <span>Cuéntanos cuál es esa otra actividad</span>
            <input
              value={cfg.otraModalidad || ''}
              onChange={(e) => actualizarCfg({ otraModalidad: e.target.value })}
              placeholder="Ej. Entreno ajedrez, voluntariado, clases de teatro…"
            />
          </label>
        ) : null}

        {/* Barra de acción: IA iterativa + ajuste manual */}
        <div className="calendario-ia-bar">
          <div className="calendario-ia-info">
            <strong>Factor de disponibilidad actual: {Math.round(cfg.factorTiempo * 100)}%</strong>
            <span>
              · ~{cfg.horasSemanales} h/semana ·{' '}
              {cfg.diasEstudio.map((d) => DIAS_CORTO[d]).join(', ')}
            </span>
          </div>
          <div className="calendario-ia-acciones">
            <button
              type="button"
              className="btn btn-primario"
              onClick={iniciarEntrevista}
              disabled={cargandoIA}
            >
              🤖 {cfg.entrevistaCompletada ? 'Recalcular con IA' : 'Estimar tiempo con IA'}
            </button>
            <button
              type="button"
              className="btn btn-suave"
              onClick={() => setMostrarAjusteManual((v) => !v)}
            >
              {mostrarAjusteManual ? 'Ocultar ajuste manual' : '⚙️ Ajustar a mano'}
            </button>
          </div>
        </div>

        {/* Entrevista iterativa con el LLM */}
        {entrevistaActiva ? (
          <div className="entrevista-ia-caja">
            <div className="entrevista-ia-head">
              <span>🤖 Asistente de planificación</span>
              <button
                type="button"
                className="btn-link"
                onClick={() => setEntrevistaActiva(false)}
              >
                Cerrar
              </button>
            </div>

            {resumenEntendido ? (
              <div className="entrevista-entendido">✓ {resumenEntendido}</div>
            ) : null}

            {cargandoIA ? (
              <div className="entrevista-cargando">Analizando tu rutina y preparando la siguiente pregunta…</div>
            ) : errorIA ? (
              <div className="msg-error">
                {errorIA}{' '}
                {!apiKey ? (
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => go({ name: 'ajustes', tab: 'ia' })}
                  >
                    Ir a Ajustes → IA
                  </button>
                ) : null}
              </div>
            ) : preguntaActual ? (
              <div className="entrevista-turno">
                <p className="entrevista-pregunta">{preguntaActual}</p>
                {opcionesRapidas.length > 0 ? (
                  <div className="entrevista-opciones">
                    {opcionesRapidas.map((op) => (
                      <button
                        key={op}
                        type="button"
                        className="chip entrevista-chip"
                        onClick={() => responderEntrevista(op)}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                ) : null}
                <form onSubmit={onSubmitRespuesta} className="entrevista-form">
                  <input
                    value={respuestaUsuario}
                    onChange={(e) => setRespuestaUsuario(e.target.value)}
                    placeholder="O escribe tu respuesta con más detalle…"
                  />
                  <button type="submit" className="btn btn-primario" disabled={!respuestaUsuario.trim()}>
                    Enviar →
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Ajuste manual */}
        {mostrarAjusteManual ? (
          <div className="calendario-manual-caja">
            <div className="calendario-manual-row">
              <div>
                <div className="manual-label">Días que puedes estudiar</div>
                <div className="dias-selector">
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                    const on = cfg.diasEstudio.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        className={`dia-pill ${on ? 'activo' : ''}`}
                        onClick={() => toggleDiaEstudio(d)}
                      >
                        {DIAS_CORTO[d]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="campo" style={{ minWidth: 200 }}>
                <span>Horas de estudio por semana: {cfg.horasSemanales} h</span>
                <input
                  type="range"
                  min={3}
                  max={25}
                  value={cfg.horasSemanales}
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    actualizarCfg({
                      horasSemanales: h,
                      factorTiempo: Math.max(0.25, Math.min(1.0, Math.round((h / 15) * 100) / 100)),
                    });
                  }}
                />
              </label>
            </div>
          </div>
        ) : null}
      </section>

      {/* Resultado IA si existe */}
      {cfg.resumenIA ? (
        <section className="tarjeta calendario-ia-resumen">
          <div className="ia-resumen-titulo">💡 Análisis de tu disponibilidad (IA)</div>
          <p>{cfg.resumenIA}</p>
          {cfg.recomendaciones && cfg.recomendaciones.length > 0 ? (
            <ul className="ia-resumen-lista">
              {cfg.recomendaciones.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {/* 2. Resumen y Viabilidad */}
      {!plan.valido ? (
        <div className="msg-error">{plan.error}</div>
      ) : (
        <>
          <section className="tarjeta calendario-resumen">
            <div className="calendario-stats">
              <div className="stat-box">
                <div className="stat-num">{plan.diasTotales}</div>
                <div className="stat-lbl">Días en el plan</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{plan.diasEstudioDisponibles}</div>
                <div className="stat-lbl">Días de estudio</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">
                  {plan.modulosPorHacer + plan.modulosPorRepasar}
                </div>
                <div className="stat-lbl">
                  Módulos pendientes{plan.modulosPorRepasar > 0 ? ` (${plan.modulosPorRepasar} repaso)` : ''}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{plan.ritmoSemanal}</div>
                <div className="stat-lbl">Actividades / sem</div>
              </div>
            </div>
            <div className={`viabilidad-banner ${badgeViab.clase}`}>
              <strong>{badgeViab.texto}:</strong> {plan.mensajeViabilidad}
            </div>
          </section>

          {/* Controles de vista */}
          <div className="calendario-vista-bar">
            <div className="tabs">
              <button
                className={`tab ${vista === 'mes' ? 'activo' : ''}`}
                onClick={() => setVista('mes')}
              >
                🗓️ Vista mensual
              </button>
              <button
                className={`tab ${vista === 'semanas' ? 'activo' : ''}`}
                onClick={() => setVista('semanas')}
              >
                📋 Vista por semanas
              </button>
            </div>
            {vista === 'mes' ? (
              <div className="mes-nav">
                <button type="button" className="btn btn-suave btn-chico" onClick={() => cambiarMes(-1)}>
                  ← Anterior
                </button>
                <span className="mes-titulo">
                  {MESES[mesCursor.month]} {mesCursor.year}
                </span>
                <button type="button" className="btn btn-suave btn-chico" onClick={() => cambiarMes(1)}>
                  Siguiente →
                </button>
              </div>
            ) : null}
          </div>

          {/* 3A. Vista Mensual */}
          {vista === 'mes' ? (
            <section className="tarjeta calendario-mes-tarjeta">
              <div className="calendario-grid-header">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
                  <div key={d} className="cal-dow">
                    {d}
                  </div>
                ))}
              </div>
              <div className="calendario-grid">
                {celdasMes.map((fecha, idx) => {
                  if (!fecha) return <div key={`empty-${idx}`} className="cal-celda vacia" />;
                  const dia = diasPorFecha.get(fecha);
                  const numDia = Number(fecha.slice(8, 10));
                  const fueraDeRango = !dia;
                  return (
                    <div
                      key={fecha}
                      className={`cal-celda ${fueraDeRango ? 'fuera' : ''} ${
                        dia?.esHoy ? 'hoy' : ''
                      } ${dia?.esPrueba ? 'prueba' : ''} ${
                        dia && !dia.esDiaEstudio && !dia.esPrueba ? 'libre' : ''
                      }`}
                    >
                      <div className="cal-celda-top">
                        <span className="cal-num">{numDia}</span>
                        {dia?.esInicio ? <span className="cal-tag inicio">Inicio</span> : null}
                        {dia?.esPrueba ? <span className="cal-tag prueba">Prueba</span> : null}
                        {dia?.esHoy ? <span className="cal-tag hoy">Hoy</span> : null}
                      </div>
                      <div className="cal-tareas">
                        {dia?.tareas.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            className={`cal-tarea ${t.tipo}`}
                            style={t.color ? { borderLeftColor: t.color } : undefined}
                            title={`${t.titulo} — ${t.subtitulo}`}
                            onClick={() => {
                              if (t.moduloId) go({ name: 'modulo', moduloId: t.moduloId });
                              else if (t.asignaturaId) go({ name: 'ensayo', asignaturaId: t.asignaturaId });
                            }}
                          >
                            <span>{t.icono}</span>
                            <span className="cal-tarea-txt">{t.titulo}</span>
                          </button>
                        ))}
                        {dia && !dia.esDiaEstudio && !dia.esPrueba && dia.tareas.length === 0 ? (
                          <span className="cal-libre-lbl">Actividad / descanso</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            /* 3B. Vista por Semanas */
            <div className="semanas-lista">
              {semanasLista.map((sem) => {
                const tareasSemana = sem.dias.reduce((acc, d) => acc + d.tareas.length, 0);
                return (
                  <section key={sem.titulo} className="tarjeta semana-card">
                    <div className="semana-head">
                      <h3>{sem.titulo}</h3>
                      <span className="fila-sub">
                        {new Date(sem.dias[0].fecha + 'T00:00:00').toLocaleDateString('es-CL')} –{' '}
                        {new Date(sem.dias[sem.dias.length - 1].fecha + 'T00:00:00').toLocaleDateString('es-CL')} ·{' '}
                        {tareasSemana} {tareasSemana === 1 ? 'actividad' : 'actividades'}
                      </span>
                    </div>
                    <div className="semana-dias">
                      {sem.dias
                        .filter((d) => d.tareas.length > 0 || d.esHoy || d.esPrueba)
                        .map((d) => (
                          <div key={d.fecha} className={`semana-dia-row ${d.esHoy ? 'hoy' : ''}`}>
                            <div className="semana-dia-fecha">
                              <strong>{DIAS_CORTO[d.diaSemana]}</strong>
                              <span>{d.fecha.slice(5).split('-').reverse().join('/')}</span>
                            </div>
                            <div className="semana-dia-tareas">
                              {d.tareas.map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  className={`semana-tarea-chip ${t.tipo}`}
                                  style={t.color ? { borderLeftColor: t.color } : undefined}
                                  onClick={() => {
                                    if (t.moduloId) go({ name: 'modulo', moduloId: t.moduloId });
                                    else if (t.asignaturaId) go({ name: 'ensayo', asignaturaId: t.asignaturaId });
                                  }}
                                >
                                  <span>{t.icono}</span>
                                  <div>
                                    <div className="semana-tarea-titulo">{t.titulo}</div>
                                    <div className="semana-tarea-sub">{t.subtitulo}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
