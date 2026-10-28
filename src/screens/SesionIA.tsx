import { useEffect, useMemo, useRef, useState } from 'react';
import { useNav } from '../App';
import {
  actividadId,
  ensayoId,
  getAsignatura,
  getConfig,
  getCursoActivoId,
  getEnsayoNota,
  getModulo,
  getModulos,
  getRegistrosDeModulo,
  insertRegistro,
  saveSesionIA,
  getSesionIA,
  resetSesionIA,
  setProgreso,
} from '../db/queries';
import { NOTA_APROBACION } from '../data/tipos';
import { cargarClave } from '../lib/secureKey';
import { MODELO_DEFECTO, chatJSON, chatStream, listarModelos, type MensajeIA } from '../lib/openrouter';
import {
  buildDeepenMessages,
  buildEvalMessages,
  buildEvalSchema,
  buildTeachMessages,
  calificar,
  normalizarPreguntas,
  parseCobertura,
  type CoberturaEstado,
  type Pregunta,
  type TipoPregunta,
  type ResultadoEval,
  type Unidad,
} from '../lib/cobertura';
import { getGuiaMineduc, type CriterioProfundizacion } from '../data/guiasMineduc';
import { prepararHTML, sanitizarHTML } from '../lib/sanitize';
import { Chip, ProgressBar } from '../components/ui';
import { notaColor } from '../lib/parser';

type Fase = 'ensenar' | 'evaluar' | 'resultado';

interface EvalGuardada {
  plan: number[];
  indice: number;
  historial: { pregunta: Pregunta; respuesta: number }[];
  preguntaData: Pregunta | null;
  elegida: number | null;
}

function HtmlIA({ html }: { html: string }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const safe = useMemo(() => sanitizarHTML(html), [html]);
  useEffect(() => {
    prepararHTML(ref.current);
  }, [safe]);
  return <div ref={ref} className="contenido-ia" dangerouslySetInnerHTML={{ __html: safe }} />;
}

function ChatPunto({
  mensajes,
  streaming,
  streamTexto,
  preguntaLibre,
  setPreguntaLibre,
  onPreguntar,
  onExplicar,
  onProfundizar,
  onSiguiente,
  puedeSiguiente,
  fullscreen,
  onCerrar,
  titulo,
  puntos,
  paso,
  vistos,
  profundizados,
  esProfundizado,
  esVisto,
  criterio,
  listoParaEvaluar,
  profundizadosCount,
  onCambiarPunto,
  onEvaluar,
  onEvaluarPunto,
}: {
  mensajes: MensajeIA[];
  streaming: boolean;
  streamTexto: string;
  preguntaLibre: string;
  setPreguntaLibre: (v: string) => void;
  onPreguntar: () => void;
  onExplicar: () => void;
  onProfundizar: () => void;
  onSiguiente: () => void;
  puedeSiguiente: boolean;
  fullscreen?: boolean;
  onCerrar?: () => void;
  titulo?: string;
  puntos?: string[];
  paso?: number;
  vistos?: number[];
  profundizados?: number[];
  esProfundizado?: boolean;
  esVisto?: boolean;
  criterio?: CriterioProfundizacion;
  listoParaEvaluar?: boolean;
  profundizadosCount?: number;
  onCambiarPunto?: (i: number) => void;
  onEvaluar?: () => void;
  onEvaluarPunto?: (i: number) => void;
}): JSX.Element {
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll suave mientras la IA va escribiendo o llegan mensajes
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [mensajes, streamTexto, streaming]);

  const contenido = (
    <>
      {fullscreen ? (
        <div className="ia-fullscreen-cab">
          <div className="ia-fullscreen-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="fila-sub">Chat del punto</span>
              {puntos && puntos.length ? (
                <span className="ia-fullscreen-progreso">
                  ({profundizadosCount ?? 0}/{puntos.length} profundizados)
                </span>
              ) : null}
            </div>
            {puntos && puntos.length && onCambiarPunto ? (
              <div className="ia-fullscreen-selector-fila">
                <button
                  className="btn-icono"
                  disabled={streaming || (paso ?? 0) <= 0}
                  onClick={() => onCambiarPunto((paso ?? 0) - 1)}
                  title="Punto anterior"
                >
                  ←
                </button>
                <select
                  value={paso ?? 0}
                  onChange={(e) => onCambiarPunto(Number(e.target.value))}
                  disabled={streaming}
                >
                  {puntos.map((p, i) => (
                    <option key={i} value={i}>
                      {(profundizados?.includes(i) ? '✅ ' : vistos?.includes(i) ? '📖 ' : '○ ') + p.slice(0, 70)}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-icono"
                  disabled={streaming || (paso ?? 0) >= (puntos.length - 1)}
                  onClick={() => onCambiarPunto((paso ?? 0) + 1)}
                  title="Siguiente punto"
                >
                  →
                </button>
              </div>
            ) : (
              <strong>{titulo}</strong>
            )}
          </div>
          <div className="ia-fullscreen-acciones">
            {onEvaluar ? (
              <button
                className="btn btn-exito"
                disabled={streaming || !listoParaEvaluar}
                onClick={onEvaluar}
                title={
                  !listoParaEvaluar
                    ? `Debes profundizar al menos 1 punto para evaluarte (${profundizadosCount ?? 0}/${puntos?.length ?? 0} listos)`
                    : 'Evaluarme ahora'
                }
              >
                {listoParaEvaluar ? '✨ Evaluarme' : `🔒 Evaluarme (${profundizadosCount ?? 0}/${puntos?.length ?? 0})`}
              </button>
            ) : null}
            <button
              className="ia-fullscreen-cerrar"
              onClick={onCerrar}
              title="Cerrar pantalla completa (Esc)"
              aria-label="Cerrar pantalla completa"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      {/* Banner informativo de profundidad MINEDUC */}
      {mensajes.length > 0 && criterio ? (
        esProfundizado ? (
          <div
            className="ia-profundidad-banner banner-ok"
            style={{
              margin: '8px 0 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <span>
                ✅ <strong>Punto profundizado y completo:</strong> Cumple con el criterio oficial: {criterio.meta}
              </span>
              <div className="ia-profundidad-detalle" style={{ color: '#047857', marginTop: 3 }}>
                No requiere más profundización. ¡Puedes evaluarte de inmediato!
              </div>
            </div>
            {onEvaluarPunto && paso != null ? (
              <button
                className="btn btn-exito btn-chico"
                disabled={streaming}
                onClick={() => onEvaluarPunto(paso)}
                style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                title="Hacer una evaluación enfocada en este punto"
              >
                🎯 Evaluar este punto
              </button>
            ) : null}
          </div>
        ) : esVisto ? (
          <div className="ia-profundidad-banner banner-aviso" style={{ margin: '8px 0 10px' }}>
            <div>
              <strong>⚠️ Falta profundizar para desbloquear la evaluación:</strong>
              <div className="ia-profundidad-detalle">{criterio.queFaltaSiNoSeProfundiza}</div>
            </div>
            <button className="btn btn-primario btn-chico" disabled={streaming} onClick={onProfundizar}>
              🔍 Profundizar ahora
            </button>
          </div>
        ) : null
      ) : null}

      <div ref={chatRef} className={fullscreen ? 'ia-fullscreen-chat' : 'sesion-chat'}>
        {mensajes.length === 0 && !streaming ? (
          <div className="ia-chat-vacio">
            <div className="ia-vacio-icono">✨</div>
            <p className="ia-vacio-texto">Aún no has explorado este punto con tu profe IA.</p>
            <button className="btn btn-primario btn-grande" disabled={streaming} onClick={onExplicar}>
              ✨ Explicar este punto
            </button>
          </div>
        ) : null}
        {mensajes.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="ia-msg ia-user">
              {m.content}
            </div>
          ) : (
            <div key={i} className="ia-msg ia-bot">
              <HtmlIA html={m.content} />
            </div>
          ),
        )}
        {streaming ? (
          <div className="ia-msg ia-bot">
            {streamTexto ? <HtmlIA html={streamTexto} /> : <span className="fila-sub">Escribiendo…</span>}
          </div>
        ) : null}
      </div>

      <div className="ia-input">
        <input
          value={preguntaLibre}
          onChange={(e) => setPreguntaLibre(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onPreguntar();
          }}
          placeholder="Pregunta o pide aclarar una duda…"
          disabled={streaming}
        />
        <button className="btn btn-secundario" disabled={streaming || !preguntaLibre.trim()} onClick={onPreguntar}>
          Enviar
        </button>
      </div>

      <div className="paso-acciones" style={{ marginTop: 8 }}>
        {mensajes.length > 0 ? (
          <>
            <button
              className="btn btn-profundizar"
              disabled={streaming}
              onClick={onProfundizar}
              title="Profundizar en este punto con casos prácticos, resolución paso a paso y trampas de examen"
            >
              🔍 {esProfundizado ? 'Volver a profundizar' : 'Profundizar en este punto'}
            </button>
            <button className="btn btn-secundario" disabled={streaming} onClick={onExplicar} title="Volver a explicar desde cero">
              Volver a explicar
            </button>
          </>
        ) : null}
        {puedeSiguiente ? (
          <button className="btn btn-suave" disabled={streaming} onClick={onSiguiente}>
            Siguiente punto →
          </button>
        ) : null}
      </div>
    </>
  );

  if (fullscreen) return <div className="ia-fullscreen">{contenido}</div>;
  return <>{contenido}</>;
}

export default function SesionIA({ tipo, id }: { tipo: 'modulo' | 'ensayo'; id: string }): JSX.Element {
  const { go } = useNav();
  const esEnsayo = tipo === 'ensayo';
  const modulo = esEnsayo ? null : getModulo(id);
  const asignatura = esEnsayo ? getAsignatura(id) : modulo ? getAsignatura(modulo.asignatura_id) : undefined;
  const modulos = esEnsayo ? getModulos(id) : [];
  const indicadores = modulo?.indicadores ?? [];
  const cursoId = getCursoActivoId();
  const config = getConfig();
  const modelo = config.ai_model || MODELO_DEFECTO;

  // Información histórica del módulo o ensayo
  const registrosModulo = !esEnsayo && modulo ? getRegistrosDeModulo(modulo.id) : [];
  const evaluacionesModulo = registrosModulo.filter((r) => r.tipo === 'evaluacion');
  const ultimaNotaModulo = evaluacionesModulo[0]?.nota ?? null;
  const moduloAprobado = ultimaNotaModulo != null && ultimaNotaModulo >= NOTA_APROBACION;

  const ensayoNota = esEnsayo ? getEnsayoNota(id) : null;
  const ensayoAprobado = ensayoNota != null && ensayoNota >= NOTA_APROBACION;

  const unidades: Unidad[] = esEnsayo
    ? modulos.map((m) => ({ etiqueta: `${m.codigo} — ${m.titulo}`, detalle: m.descripcion.slice(0, 110) }))
    : indicadores.map((ind) => ({ etiqueta: ind, detalle: '' }));

  const [clave, setClave] = useState<string | null>(null);
  const [caps, setCaps] = useState({ structured: false, json: false });
  const [chats, setChats] = useState<Record<number, MensajeIA[]>>({});
  const [cobertura, setCobertura] = useState<CoberturaEstado>({ vistos: [], profundizados: [] });
  const [fase, setFase] = useState<Fase>(esEnsayo ? 'evaluar' : 'ensenar');
  const [paso, setPaso] = useState(0);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamTexto, setStreamTexto] = useState('');
  const [preguntaLibre, setPreguntaLibre] = useState('');
  const [plan, setPlan] = useState<number[]>([]);
  const [indice, setIndice] = useState(0);
  const [preguntaData, setPreguntaData] = useState<Pregunta | null>(null);
  const [historial, setHistorial] = useState<{ pregunta: Pregunta; respuesta: number }[]>([]);
  const [elegida, setElegida] = useState<number | null>(null);
  const [generandoPregunta, setGenerandoPregunta] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEval | null>(null);
  const [error, setError] = useState('');
  const [evalPendienteGuardada, setEvalPendienteGuardada] = useState<EvalGuardada | null>(null);

  const evalStorageKey = `rl-eval-${esEnsayo ? 'e' : 'm'}-${id}`;
  const guiaAsignatura = asignatura ? getGuiaMineduc(asignatura.codigo) : getGuiaMineduc('LEN');
  const totalPuntos = indicadores.length;
  const puntosProfundizadosCount = cobertura.profundizados.length;
  // Se activa en cuanto al menos 1 punto ya no necesita profundización (está profundizado y completo)
  const listoParaEvaluar = esEnsayo ? true : totalPuntos > 0 && puntosProfundizadosCount > 0;

  // Tecla Esc para salir de pantalla completa
  useEffect(() => {
    if (!pantallaCompleta) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setPantallaCompleta(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pantallaCompleta]);

  useEffect(() => {
    void cargarClave().then(setClave);
  }, []);

  useEffect(() => {
    listarModelos()
      .then((ms) => {
        const m = ms.find((x) => x.id === modelo);
        setCaps({ structured: !!m?.structured, json: !!m?.json });
      })
      .catch(() => setCaps({ structured: false, json: false }));
  }, [modelo]);

  useEffect(() => {
    const key = esEnsayo ? `ensayo:${id}` : id;
    const s = getSesionIA(key);
    if (s) {
      try {
        const raw = JSON.parse(s.mensajes) as unknown;
        if (Array.isArray(raw)) setChats({ 0: raw as MensajeIA[] });
        else if (raw && typeof raw === 'object') setChats(raw as Record<number, MensajeIA[]>);
        const cobObj = parseCobertura(JSON.parse(s.cobertura));
        setCobertura(cobObj);
        setFase((s.fase as Fase) || (esEnsayo ? 'evaluar' : 'ensenar'));
        if (!esEnsayo && indicadores.length) {
          let guardado = NaN;
          try {
            guardado = Number(localStorage.getItem(`rl-punto-m-${id}`));
          } catch {
            /* ignore */
          }
          if (Number.isInteger(guardado) && guardado >= 0 && guardado < indicadores.length) {
            setPaso(guardado);
          } else {
            const idx = indicadores.findIndex((_, i) => !cobObj.profundizados.includes(i));
            setPaso(idx === -1 ? 0 : idx);
          }
        }
      } catch {
        /* ignore */
      }
    }

    // Revisar si había una evaluación pendiente guardada
    try {
      const guardadaRaw = localStorage.getItem(evalStorageKey);
      if (guardadaRaw) {
        const g = JSON.parse(guardadaRaw) as EvalGuardada;
        if (g && g.plan && g.plan.length > 0 && g.indice < g.plan.length) {
          setEvalPendienteGuardada(g);
        }
      }
    } catch {
      /* ignore */
    }
  }, [esEnsayo, id, evalStorageKey]);

  function persistir(c: Record<number, MensajeIA[]>, cob: CoberturaEstado, f: Fase): void {
    const key = esEnsayo ? `ensayo:${id}` : id;
    saveSesionIA(key, c, cob, f);
  }

  function cambiarPaso(i: number): void {
    setPaso(i);
    try {
      localStorage.setItem(`rl-punto-${esEnsayo ? 'e' : 'm'}-${id}`, String(i));
    } catch {
      /* ignore */
    }
  }

  async function explicar(indicePunto: number): Promise<void> {
    const k = clave || (await cargarClave());
    if (k && !clave) setClave(k);
    if (!k || !modulo || !asignatura) return;
    setError('');
    setStreaming(true);
    setStreamTexto('');
    try {
      const historialPunto = chats[indicePunto] || [];
      const msgs = buildTeachMessages(asignatura.nombre, modulo, indicadores[indicePunto], historialPunto);
      let acc = '';
      const onDelta = (d: string): void => {
        acc += d;
        setStreamTexto(acc);
      };
      let texto: string;
      try {
        texto = await chatStream({
          key: k,
          model: modelo,
          messages: msgs,
          tools: [{ type: 'openrouter:web_search' }],
          onDelta,
        });
      } catch {
        acc = '';
        setStreamTexto('');
        texto = await chatStream({ key: k, model: modelo, messages: msgs, onDelta });
      }
      const nuevosChats = {
        ...chats,
        [indicePunto]: [
          ...historialPunto,
          { role: 'user' as const, content: `Explícame: ${indicadores[indicePunto]}` },
          { role: 'assistant' as const, content: texto },
        ],
      };
      const nuevosVistos = cobertura.vistos.includes(indicePunto) ? cobertura.vistos : [...cobertura.vistos, indicePunto];
      const nuevaCob: CoberturaEstado = {
        vistos: nuevosVistos,
        profundizados: cobertura.profundizados,
      };
      setChats(nuevosChats);
      setCobertura(nuevaCob);
      persistir(nuevosChats, nuevaCob, fase);
      setStreamTexto('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStreaming(false);
    }
  }

  async function profundizar(indicePunto: number): Promise<void> {
    const k = clave || (await cargarClave());
    if (k && !clave) setClave(k);
    if (!k || !modulo || !asignatura) return;
    setError('');
    setStreaming(true);
    setStreamTexto('');
    try {
      const historialPunto = chats[indicePunto] || [];
      const msgs = buildDeepenMessages(
        asignatura.nombre,
        asignatura.codigo,
        modulo,
        indicadores[indicePunto],
        historialPunto,
      );
      let acc = '';
      const onDelta = (d: string): void => {
        acc += d;
        setStreamTexto(acc);
      };
      let texto: string;
      try {
        texto = await chatStream({
          key: k,
          model: modelo,
          messages: msgs,
          tools: [{ type: 'openrouter:web_search' }],
          onDelta,
        });
      } catch {
        acc = '';
        setStreamTexto('');
        texto = await chatStream({ key: k, model: modelo, messages: msgs, onDelta });
      }
      const nuevosChats = {
        ...chats,
        [indicePunto]: [
          ...historialPunto,
          { role: 'user' as const, content: `Profundizar: ${indicadores[indicePunto]}` },
          { role: 'assistant' as const, content: texto },
        ],
      };
      const nuevosVistos = cobertura.vistos.includes(indicePunto) ? cobertura.vistos : [...cobertura.vistos, indicePunto];
      const nuevosProf = cobertura.profundizados.includes(indicePunto)
        ? cobertura.profundizados
        : [...cobertura.profundizados, indicePunto];
      const nuevaCob: CoberturaEstado = {
        vistos: nuevosVistos,
        profundizados: nuevosProf,
      };
      setChats(nuevosChats);
      setCobertura(nuevaCob);
      persistir(nuevosChats, nuevaCob, fase);
      setStreamTexto('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStreaming(false);
    }
  }

  async function preguntar(): Promise<void> {
    const k = clave || (await cargarClave());
    if (k && !clave) setClave(k);
    if (!k || !preguntaLibre.trim()) return;
    const texto = preguntaLibre.trim();
    const hist = chats[paso] || [];
    setPreguntaLibre('');
    setError('');
    setStreaming(true);
    setStreamTexto('');
    try {
      const msgs: MensajeIA[] = [
        {
          role: 'system',
          content:
            'Eres una profesora chilena de 1° medio. Responde claro, breve y en HTML didáctico (h3, p, ul, strong, em, div class="rl-callout"/"rl-note", blockquote class="rl-quote", span class="rl-concept", figure/img de Wikimedia/NASA). Usa emojis. Párrafos cortos, tablas de máximo 3 columnas, sin atributos style/width/height (el diseño es responsivo), sin markdown ni scripts.',
        },
        ...hist,
        { role: 'user', content: texto },
      ];
      let acc = '';
      const resp = await chatStream({
        key: k,
        model: modelo,
        messages: msgs,
        onDelta: (d) => {
          acc += d;
          setStreamTexto(acc);
        },
      });
      const nuevosChats = {
        ...chats,
        [paso]: [...hist, { role: 'user' as const, content: texto }, { role: 'assistant' as const, content: resp }],
      };
      setChats(nuevosChats);
      persistir(nuevosChats, cobertura, fase);
      setStreamTexto('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStreaming(false);
    }
  }

  function irSiguientePunto(): void {
    cambiarPaso(Math.min(paso + 1, Math.max(0, indicadores.length - 1)));
  }

  function guardarAvanceEval(
    p: number[],
    ind: number,
    hist: { pregunta: Pregunta; respuesta: number }[],
    qData: Pregunta | null,
    eleg: number | null,
  ): void {
    try {
      const g: EvalGuardada = { plan: p, indice: ind, historial: hist, preguntaData: qData, elegida: eleg };
      localStorage.setItem(evalStorageKey, JSON.stringify(g));
    } catch {
      /* ignore */
    }
  }

  function borrarAvanceEval(): void {
    try {
      localStorage.removeItem(evalStorageKey);
      setEvalPendienteGuardada(null);
    } catch {
      /* ignore */
    }
  }

  function iniciarEvaluacion(puntoEspecifico?: number): void {
    if (!listoParaEvaluar && puntoEspecifico == null) return;
    void (async () => {
      const k = clave || (await cargarClave());
      if (k && !clave) setClave(k);
      if (!k) return;
      setError('');
      borrarAvanceEval();

      let unidadesListas: number[];
      if (esEnsayo) {
        unidadesListas = unidades.map((_, i) => i + 1);
      } else if (puntoEspecifico != null) {
        unidadesListas = [puntoEspecifico + 1];
      } else if (cobertura.profundizados.length > 0) {
        unidadesListas = cobertura.profundizados.map((idx) => idx + 1);
      } else {
        unidadesListas = [paso + 1];
      }

      // Proporcional a los puntos profundizados: 3 preguntas si es 1 solo punto, hasta 18 si son varios
      const total = esEnsayo
        ? 25
        : unidadesListas.length === 1
        ? 3
        : Math.min(20, Math.max(unidadesListas.length * 2, 4));

      const p: number[] = [];
      for (let i = 0; i < total; i++) {
        p.push(unidadesListas[i % unidadesListas.length]);
      }

      setPlan(p);
      setIndice(0);
      setHistorial([]);
      setResultado(null);
      setPreguntaData(null);
      setElegida(null);
      setFase('evaluar');
      guardarAvanceEval(p, 0, [], null, null);
      persistir(chats, cobertura, 'evaluar');
      void generarPregunta(p[0], 0, []);
    })();
  }

  function reanudarEvaluacionGuardada(): void {
    if (!evalPendienteGuardada) return;
    setPlan(evalPendienteGuardada.plan);
    setIndice(evalPendienteGuardada.indice);
    setHistorial(evalPendienteGuardada.historial);
    setPreguntaData(evalPendienteGuardada.preguntaData);
    setElegida(evalPendienteGuardada.elegida);
    setFase('evaluar');
    setEvalPendienteGuardada(null);
    if (!evalPendienteGuardada.preguntaData) {
      void generarPregunta(
        evalPendienteGuardada.plan[evalPendienteGuardada.indice],
        evalPendienteGuardada.indice,
        evalPendienteGuardada.historial,
      );
    }
  }

  async function generarPregunta(
    unidad: number,
    indActual = indice,
    histActual = historial,
  ): Promise<void> {
    const k = clave || (await cargarClave());
    if (k && !clave) setClave(k);
    if (!k) return;
    setGenerandoPregunta(true);
    setError('');
    setPreguntaData(null);
    setElegida(null);
    try {
      const titulo = esEnsayo
        ? `Ensayo general — ${asignatura?.nombre}`
        : `Módulo ${modulo?.codigo} — ${modulo?.titulo}`;
      const contexto = esEnsayo
        ? `Todas las OA de ${asignatura?.nombre}.`
        : `${asignatura?.nombre}. ${modulo?.descripcion}`;
      const TIPOS_DETERMINISTICOS: TipoPregunta[] = ['analisis_caso', 'seleccion_multiple', 'verdadero_falso'];
      const tipoSugerido = TIPOS_DETERMINISTICOS[indActual % TIPOS_DETERMINISTICOS.length];

      let q: Pregunta | null = null;
      for (let intento = 0; intento < 2 && !q; intento++) {
        const schema = buildEvalSchema(unidades.length, 1);
        const msgs = buildEvalMessages({
          titulo,
          contexto,
          codigoAsignatura: asignatura?.codigo,
          unidades,
          nPreguntas: 1,
          soloUnidades: [unidad],
          tipoSugerido,
        });
        const raw = await chatJSON({
          key: k,
          model: modelo,
          messages: msgs,
          schema,
          structured: caps.structured,
          json: caps.json,
        });
        const arr = normalizarPreguntas(raw, unidades.length);
        q = arr.find((x) => x.unidad === unidad) || arr[0] || null;
      }
      if (!q) throw new Error('No se pudo generar la pregunta. Intenta de nuevo.');
      setPreguntaData(q);
      guardarAvanceEval(plan, indActual, histActual, q, null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerandoPregunta(false);
    }
  }

  function responder(opcion: number): void {
    if (elegida != null) return;
    setElegida(opcion);
    guardarAvanceEval(plan, indice, historial, preguntaData, opcion);
  }

  function siguientePregunta(): void {
    if (!preguntaData || elegida == null) return;
    const nuevoHist = [...historial, { pregunta: preguntaData, respuesta: elegida }];
    setHistorial(nuevoHist);
    if (indice + 1 < plan.length) {
      const proxIndice = indice + 1;
      setIndice(proxIndice);
      guardarAvanceEval(plan, proxIndice, nuevoHist, null, null);
      void generarPregunta(plan[proxIndice], proxIndice, nuevoHist);
    } else {
      finalizar(nuevoHist);
    }
  }

  function finalizar(hist: { pregunta: Pregunta; respuesta: number }[]): void {
    borrarAvanceEval();
    const res = calificar(hist.map((h) => h.pregunta), hist.map((h) => h.respuesta));
    setResultado(res);
    setFase('resultado');

    const etiqueta = (u: number): string => unidades[u - 1]?.etiqueta ?? `Unidad ${u}`;
    const reforzar = res.porUnidad.filter((x) => x.correctas < x.total).map((x) => etiqueta(x.unidad));
    const dominados = res.porUnidad.filter((x) => x.correctas === x.total).map((x) => etiqueta(x.unidad));

    const moduloId = esEnsayo ? ensayoId(id) : (modulo?.id ?? id);
    insertRegistro({
      modulo_id: moduloId,
      curso_id: cursoId,
      tipo: 'evaluacion',
      nota: res.nota,
      preguntas_correctas: res.correctas,
      preguntas_totales: res.total,
      temas_dominados: dominados,
      temas_a_reforzar: reforzar,
      retroalimentacion: esEnsayo
        ? `Ensayo general con IA: ${res.correctas}/${res.total}.`
        : `Evaluación con IA: ${res.correctas}/${res.total}.`,
      siguiente_paso: reforzar.length ? `Repasar: ${reforzar.slice(0, 3).join('; ')}` : '¡Buen trabajo!',
      ideas_clave: [],
      conceptos: [],
      dudas: [],
      texto_crudo: JSON.stringify({ origen: 'ia', historial: hist }),
      estado_parseo: 'ok',
    });

    if (!esEnsayo && modulo) {
      setProgreso(actividadId(modulo.id, 'evaluar'), modulo.id, 'evaluar', 'completada');
      if (cobertura.profundizados.length >= indicadores.length) {
        setProgreso(actividadId(modulo.id, 'estudiar'), modulo.id, 'estudiar', 'completada');
      }
    }
    persistir(chats, cobertura, 'resultado');
  }

  function reiniciar(): void {
    borrarAvanceEval();
    const key = esEnsayo ? `ensayo:${id}` : id;
    resetSesionIA(key);
    setChats({});
    setCobertura({ vistos: [], profundizados: [] });
    setFase(esEnsayo ? 'evaluar' : 'ensenar');
    setPaso(0);
    setPlan([]);
    setIndice(0);
    setPreguntaData(null);
    setHistorial([]);
    setElegida(null);
    setResultado(null);
    setError('');
  }

  const volverDestino = () => {
    go({ name: 'ruta', asignaturaId: esEnsayo ? id : modulo?.asignatura_id });
  };

  const chatActual = chats[paso] || [];
  const esProfundizadoPaso = cobertura.profundizados.includes(paso);
  const esVistoPaso = cobertura.vistos.includes(paso);
  const porcentaje = resultado ? Math.round(resultado.pct * 100) : 0;
  const faseEfectiva: Fase = fase === 'resultado' && !resultado ? (esEnsayo ? 'evaluar' : 'ensenar') : fase;

  return (
    <div className="pantalla pantalla-ancha">
      <button className="btn-volver" onClick={volverDestino}>
        ← Volver a {asignatura?.nombre ?? 'Mi ruta'}
      </button>

      <header className="cabecera cabecera-modulo">
        <div className="modulo-codigo">
          {asignatura ? <Chip color={asignatura.color}>{asignatura.nombre}</Chip> : null}
          {esEnsayo ? (
            <Chip tono="suave">🎯 Ensayo general (25 preguntas)</Chip>
          ) : modulo ? (
            <>
              <Chip tono="suave">{modulo.codigo}</Chip>
              {modulo.eje ? <Chip tono="suave">{modulo.eje}</Chip> : null}
            </>
          ) : null}
          <Chip tono="suave">🤖 {modelo}</Chip>
        </div>
        <h1>
          {esEnsayo ? `${asignatura?.icono ?? '🎯'} Ensayo general de ${asignatura?.nombre ?? ''}` : modulo?.titulo ?? ''}
        </h1>
      </header>

      {/* Banner de última nota si existe */}
      {!esEnsayo && ultimaNotaModulo != null ? (
        <div className={`banner ${moduloAprobado ? 'banner-ok' : 'banner-mal'}`}>
          {moduloAprobado ? '🎉 ¡Módulo aprobado!' : '🔁 Reprobado, a repasar'} — última nota {ultimaNotaModulo.toFixed(1)}
        </div>
      ) : null}

      {esEnsayo && ensayoNota != null ? (
        <div className={`banner ${ensayoAprobado ? 'banner-ok' : 'banner-mal'}`}>
          {ensayoAprobado ? '🎉 ¡Ensayo general aprobado!' : '🔁 Ensayo general reprobado'} — última nota {ensayoNota.toFixed(1)}
        </div>
      ) : null}

      {/* Pestaña / Desplegable compacto de historial y qué se evalúa para módulos */}
      {!esEnsayo && modulo ? (
        <details className="acordeon sesion-historial" style={{ marginBottom: 16 }}>
          <summary>
            <span>📜 Qué se evalúa e historial ({evaluacionesModulo.length} evaluaciones)</span>
            <span className="acordeon-flecha">▾</span>
          </summary>
          <div className="acordeon-cuerpo">
            <p className="modulo-descripcion">{modulo.descripcion}</p>
            <h4 style={{ margin: '12px 0 6px' }}>Indicadores de evaluación</h4>
            <ul className="indicadores">
              {modulo.indicadores.map((ind, i) => (
                <li key={i}>{ind}</li>
              ))}
            </ul>

            <h4 style={{ margin: '16px 0 8px' }}>Historial de evaluaciones</h4>
            {registrosModulo.length === 0 ? (
              <p className="fila-sub">Aún no hay evaluaciones guardadas para este módulo.</p>
            ) : (
              <div className="lista">
                {registrosModulo.map((r) => (
                  <div key={r.id} className="tarjeta fila">
                    <span
                      className="nota-burbuja"
                      style={{ background: r.tipo === 'resumen' ? 'var(--teal)' : notaColor(r.nota) }}
                    >
                      {r.tipo === 'resumen' ? '📝' : r.nota != null ? r.nota.toFixed(1) : '–'}
                    </span>
                    <div className="fila-cuerpo">
                      <div className="fila-titulo">{r.tipo === 'resumen' ? 'Apuntes' : 'Evaluación'}</div>
                      <div className="fila-sub">
                        {r.temas_a_reforzar.length
                          ? `A reforzar: ${r.temas_a_reforzar.join(', ')}`
                          : r.siguiente_paso || '—'}
                      </div>
                    </div>
                    <span className="fila-fecha">{new Date(r.fecha).toLocaleDateString('es-CL')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>
      ) : null}

      {!clave ? (
        <div className="banner banner-mal">
          No hay una clave de OpenRouter configurada. Agrégala en Ajustes para estudiar y evaluarte.
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-primario" onClick={() => go({ name: 'ajustes', tab: 'ia' })}>
              Configurar clave en Ajustes
            </button>
          </div>
        </div>
      ) : (
        <>
          {error ? <div className="msg-error">{error}</div> : null}

          {/* Aviso para continuar evaluación si había una pendiente */}
          {faseEfectiva !== 'resultado' && evalPendienteGuardada && plan.length === 0 ? (
            <div className="banner banner-info sesion-reanudar-banner">
              <div>
                <strong>Tienes una evaluación guardada en curso</strong>
                <div style={{ fontSize: '0.88rem' }}>
                  Avanzaste hasta la pregunta {evalPendienteGuardada.indice + 1} de {evalPendienteGuardada.plan.length}.
                </div>
              </div>
              <div className="sesion-reanudar-acciones">
                <button className="btn btn-primario btn-chico" onClick={reanudarEvaluacionGuardada}>
                  Continuar pregunta {evalPendienteGuardada.indice + 1} →
                </button>
                <button className="btn btn-suave btn-chico" onClick={borrarAvanceEval}>
                  Descartar
                </button>
              </div>
            </div>
          ) : null}

          {faseEfectiva === 'ensenar' && !esEnsayo && !pantallaCompleta ? (
            <>
              <div className="sesion-barra">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <strong>
                      {puntosProfundizadosCount}/{totalPuntos} puntos profundizados
                    </strong>
                    {listoParaEvaluar ? (
                      <span className="chip chip-fuerte" style={{ background: 'var(--exito)' }}>
                        {puntosProfundizadosCount >= totalPuntos
                          ? '¡Módulo completo listo! ✨'
                          : '¡Evaluación disponible! ✨'}
                      </span>
                    ) : (
                      <span className="chip" style={{ background: '#fff7ed', color: 'var(--amarillo)' }}>
                        Faltan {totalPuntos - puntosProfundizadosCount} por profundizar
                      </span>
                    )}
                  </div>
                  <ProgressBar pct={totalPuntos ? (puntosProfundizadosCount / totalPuntos) * 100 : 0} alto={7} />
                  {!listoParaEvaluar ? (
                    <small className="fila-sub" style={{ fontSize: '0.78rem' }}>
                      Para desbloquear la evaluación, profundiza el punto actual con tu profe IA según las directrices oficiales del MINEDUC.
                    </small>
                  ) : puntosProfundizadosCount < totalPuntos ? (
                    <small className="fila-sub" style={{ fontSize: '0.78rem' }}>
                      ¡Ya puedes evaluarte sobre los {puntosProfundizadosCount} {puntosProfundizadosCount === 1 ? 'punto listo' : 'puntos listos'}! (O continúa profundizando los demás).
                    </small>
                  ) : (
                    <small className="fila-sub" style={{ fontSize: '0.78rem', color: 'var(--exito)' }}>
                      🎉 ¡Todos los puntos del módulo están profundizados y listos para la evaluación completa!
                    </small>
                  )}
                </div>
                <button
                  className="btn btn-exito"
                  disabled={streaming || !listoParaEvaluar}
                  onClick={() => iniciarEvaluacion()}
                  title={
                    !listoParaEvaluar
                      ? 'Debes profundizar al menos 1 punto para evaluarte'
                      : puntosProfundizadosCount < totalPuntos
                      ? `Evaluar los ${puntosProfundizadosCount} de ${totalPuntos} puntos preparados`
                      : 'Empezar evaluación completa del módulo'
                  }
                >
                  {listoParaEvaluar
                    ? puntosProfundizadosCount < totalPuntos
                      ? `✨ Evaluarme (${puntosProfundizadosCount}/${totalPuntos})`
                      : '✨ Evaluar módulo completo'
                    : `🔒 Evaluarme (0/${totalPuntos})`}
                </button>
              </div>

              <div className="sesion-layout">
                <aside className="sesion-puntos tarjeta">
                  <div className="sesion-puntos-cab">
                    <span>Puntos del módulo</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--texto-suave)', fontWeight: 'bold' }}>
                      {puntosProfundizadosCount}/{totalPuntos}
                    </span>
                  </div>
                  {indicadores.map((ind, i) => {
                    const esProf = cobertura.profundizados.includes(i);
                    const esVis = cobertura.vistos.includes(i);
                    return (
                      <button
                        key={i}
                        className={`sesion-punto ${i === paso ? 'actual' : ''} ${esProf ? 'profundizado' : esVis ? 'visto' : ''}`}
                        onClick={() => cambiarPaso(i)}
                      >
                        <span className={`sesion-dot ${esProf ? 'dot-completo' : esVis ? 'dot-explicado' : 'dot-pendiente'}`}>
                          {esProf ? '✓' : esVis ? '📖' : '○'}
                        </span>
                        <div className="sesion-punto-info">
                          <span className="sesion-punto-texto">{ind}</span>
                          <span className={`sesion-punto-tag ${esProf ? 'tag-ok' : esVis ? 'tag-aviso' : 'tag-pendiente'}`}>
                            {esProf ? 'Listo ✓' : esVis ? 'Por profundizar ⚠️' : 'Sin explicar'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </aside>

                <section className="sesion-panel tarjeta">
                  <div className="ia-eval-cab">
                    <span className="fila-sub">
                      Punto {paso + 1} de {indicadores.length}
                    </span>
                    <div className="sesion-panel-acciones">
                      <span className={esProfundizadoPaso ? 'paso-estado ok' : esVistoPaso ? 'paso-estado' : 'paso-estado'}>
                        {esProfundizadoPaso ? '✅ Profundizado' : esVistoPaso ? '📖 Por profundizar' : '⏳ Pendiente'}
                      </span>
                      <button className="btn-icono" title="Pantalla completa (Esc)" onClick={() => setPantallaCompleta(true)}>
                        ⛶
                      </button>
                    </div>
                  </div>
                  <p className="ia-punto">{indicadores[paso]}</p>
                  <ChatPunto
                    mensajes={chatActual}
                    streaming={streaming}
                    streamTexto={streamTexto}
                    preguntaLibre={preguntaLibre}
                    setPreguntaLibre={setPreguntaLibre}
                    onPreguntar={() => void preguntar()}
                    onExplicar={() => void explicar(paso)}
                    onProfundizar={() => void profundizar(paso)}
                    onSiguiente={irSiguientePunto}
                    puedeSiguiente={indicadores.length > 1}
                    paso={paso}
                    puntos={indicadores}
                    esProfundizado={esProfundizadoPaso}
                    esVisto={esVistoPaso}
                    criterio={guiaAsignatura.criterioProfundizacion}
                    listoParaEvaluar={listoParaEvaluar}
                    profundizadosCount={puntosProfundizadosCount}
                    onEvaluarPunto={(idx) => iniciarEvaluacion(idx)}
                  />
                </section>
              </div>
            </>
          ) : null}

          {faseEfectiva === 'ensenar' && !esEnsayo && pantallaCompleta ? (
            <ChatPunto
              fullscreen
              titulo={indicadores[paso]}
              onCerrar={() => setPantallaCompleta(false)}
              mensajes={chatActual}
              streaming={streaming}
              streamTexto={streamTexto}
              preguntaLibre={preguntaLibre}
              setPreguntaLibre={setPreguntaLibre}
              onPreguntar={() => void preguntar()}
              onExplicar={() => void explicar(paso)}
              onProfundizar={() => void profundizar(paso)}
              onSiguiente={irSiguientePunto}
              puedeSiguiente={indicadores.length > 1}
              puntos={indicadores}
              paso={paso}
              vistos={cobertura.vistos}
              profundizados={cobertura.profundizados}
              esProfundizado={esProfundizadoPaso}
              esVisto={esVistoPaso}
              criterio={guiaAsignatura.criterioProfundizacion}
              listoParaEvaluar={listoParaEvaluar}
              profundizadosCount={puntosProfundizadosCount}
              onCambiarPunto={cambiarPaso}
              onEvaluar={() => iniciarEvaluacion()}
              onEvaluarPunto={(idx) => iniciarEvaluacion(idx)}
            />
          ) : null}

          {faseEfectiva === 'evaluar' ? (
            <section className="tarjeta">
              {plan.length === 0 ? (
                <>
                  <h2 className="seccion-titulo">{esEnsayo ? 'Ensayo general' : 'Evaluación'}</h2>
                  <p className="fila-sub">
                    {esEnsayo
                      ? '25 preguntas interactivas, una por vez, mezclando todas las OA de la asignatura.'
                      : `Preguntas que cubren los ${unidades.length} puntos del módulo, una por vez.`}
                  </p>
                  <button className="btn btn-primario btn-ancho" onClick={() => iniciarEvaluacion()}>
                    {esEnsayo ? 'Empezar ensayo con IA' : 'Empezar evaluación con IA'}
                  </button>
                </>
              ) : generandoPregunta ? (
                <div style={{ padding: '30px 10px', textAlign: 'center' }}>
                  <p className="fila-sub" style={{ fontSize: '1.05rem' }}>
                    Generando pregunta {indice + 1} de {plan.length}… ✨
                  </p>
                  <ProgressBar pct={(indice / Math.max(1, plan.length)) * 100} alto={6} />
                </div>
              ) : preguntaData ? (
                <>
                  <div className="ia-eval-cab">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="fila-sub">
                        Pregunta {indice + 1} de {plan.length}
                      </span>
                      <span className="chip chip-tipo">
                        {preguntaData.tipo === 'verdadero_falso'
                          ? '⚖️ Verdadero o Falso'
                          : preguntaData.tipo === 'analisis_caso'
                            ? '📋 Análisis de caso'
                            : '🎯 Selección múltiple'}
                      </span>
                    </div>
                    <Chip tono="suave">{(unidades[preguntaData.unidad - 1]?.etiqueta ?? '').slice(0, 46)}</Chip>
                  </div>
                  <ProgressBar pct={(indice / Math.max(1, plan.length)) * 100} alto={6} />

                  {preguntaData.contexto ? (
                    <div className="ia-contexto-box">
                      <span className="ia-contexto-tag">📖 Situación / Contexto oficial</span>
                      <p>{preguntaData.contexto}</p>
                    </div>
                  ) : null}

                  <p className="ia-pregunta">{preguntaData.pregunta}</p>

                  <div className={`ia-opciones ${preguntaData.alternativas.length === 2 ? 'ia-opciones-vf' : ''}`}>
                    {preguntaData.alternativas.map((alt, i) => {
                      let clase = 'ia-opcion';
                      if (elegida != null) {
                        if (i === preguntaData.correcta) clase += ' correcta';
                        else if (i === elegida) clase += ' incorrecta';
                      }
                      return (
                        <button key={i} className={clase} onClick={() => responder(i)} disabled={elegida != null}>
                          <strong>{String.fromCharCode(65 + i)}.</strong> {alt}
                        </button>
                      );
                    })}
                  </div>

                  {elegida != null ? (
                    <>
                      {elegida === preguntaData.correcta ? (
                        <div className="msg-ok">
                          <strong>🎉 ¡Correcto!</strong>
                          {preguntaData.explicacion ? ` — ${preguntaData.explicacion}` : ''}
                        </div>
                      ) : (
                        <div className="msg-error">
                          <strong>❌ Incorrecto.</strong> La alternativa correcta es la{' '}
                          <strong>{String.fromCharCode(65 + preguntaData.correcta)}</strong> ({preguntaData.alternativas[preguntaData.correcta]}).
                          {preguntaData.explicacion ? (
                            <div style={{ marginTop: 6, opacity: 0.95 }}>
                              💡 <strong>Explicación:</strong> {preguntaData.explicacion}
                            </div>
                          ) : null}
                        </div>
                      )}
                      <button className="btn btn-primario btn-ancho" onClick={siguientePregunta} style={{ marginTop: 12 }}>
                        {indice + 1 < plan.length ? 'Siguiente pregunta →' : 'Ver resultado'}
                      </button>
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="fila-sub">No se pudo generar la pregunta.</p>
                  <button
                    className="btn btn-secundario"
                    onClick={() => void generarPregunta(plan[Math.min(indice, plan.length - 1)], indice, historial)}
                  >
                    Reintentar
                  </button>
                </>
              )}
            </section>
          ) : null}

          {faseEfectiva === 'resultado' && resultado ? (
            <section className="tarjeta">
              <div className={`banner ${resultado.nota >= NOTA_APROBACION ? 'banner-ok' : 'banner-mal'}`}>
                {resultado.nota >= NOTA_APROBACION ? '🎉 ¡Aprobado!' : '🔁 A repasar'} — nota {resultado.nota.toFixed(1)} ·{' '}
                {resultado.correctas}/{resultado.total} ({porcentaje}%)
              </div>
              <ul className="ia-resultado-lista">
                {resultado.porUnidad.map((u) => (
                  <li key={u.unidad} className={u.correctas === u.total ? 'ok' : 'mal'}>
                    <span>{unidades[u.unidad - 1]?.etiqueta ?? `Unidad ${u.unidad}`}</span>
                    <span>
                      {u.correctas}/{u.total}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="paso-acciones">
                {!esEnsayo ? (
                  <button className="btn btn-secundario" onClick={() => setFase('ensenar')}>
                    Volver a estudiar
                  </button>
                ) : (
                  <button className="btn btn-secundario" onClick={() => iniciarEvaluacion()}>
                    Repetir ensayo
                  </button>
                )}
                <button className="btn btn-primario" onClick={volverDestino}>
                  Volver a mi ruta
                </button>
              </div>
            </section>
          ) : null}

          {faseEfectiva !== 'resultado' ? (
            <div className="ia-footer">
              <button className="btn btn-suave" onClick={reiniciar}>
                ↺ Reiniciar sesión
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
