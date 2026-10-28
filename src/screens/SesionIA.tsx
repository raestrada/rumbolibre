import { useEffect, useMemo, useRef, useState } from 'react';
import { useNav } from '../App';
import {
  actividadId,
  ensayoId,
  getAsignatura,
  getConfig,
  getCursoActivoId,
  getModulo,
  getModulos,
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
  buildEvalMessages,
  buildEvalSchema,
  buildTeachMessages,
  calificar,
  normalizarPreguntas,
  type Pregunta,
  type ResultadoEval,
  type Unidad,
} from '../lib/cobertura';
import { prepararHTML, sanitizarHTML } from '../lib/sanitize';
import { Chip, ProgressBar } from '../components/ui';

type Fase = 'ensenar' | 'evaluar' | 'resultado';

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
  onSiguiente,
  puedeSiguiente,
  fullscreen,
  onCerrar,
  titulo,
  puntos,
  paso,
  vistos,
  onCambiarPunto,
}: {
  mensajes: MensajeIA[];
  streaming: boolean;
  streamTexto: string;
  preguntaLibre: string;
  setPreguntaLibre: (v: string) => void;
  onPreguntar: () => void;
  onExplicar: () => void;
  onSiguiente: () => void;
  puedeSiguiente: boolean;
  fullscreen?: boolean;
  onCerrar?: () => void;
  titulo?: string;
  puntos?: string[];
  paso?: number;
  vistos?: number[];
  onCambiarPunto?: (i: number) => void;
}): JSX.Element {
  const contenido = (
    <>
      {fullscreen ? (
        <div className="ia-fullscreen-cab">
          <div className="ia-fullscreen-info">
            <span className="fila-sub">Chat del punto</span>
            {puntos && puntos.length && onCambiarPunto ? (
              <select value={paso ?? 0} onChange={(e) => onCambiarPunto(Number(e.target.value))} disabled={streaming}>
                {puntos.map((p, i) => (
                  <option key={i} value={i}>
                    {(vistos?.includes(i) ? '✓ ' : '') + p.slice(0, 70)}
                  </option>
                ))}
              </select>
            ) : (
              <strong>{titulo}</strong>
            )}
          </div>
          <button className="ia-fullscreen-cerrar" onClick={onCerrar} aria-label="Cerrar pantalla completa">
            ✕
          </button>
        </div>
      ) : null}

      <div className={fullscreen ? 'ia-fullscreen-chat' : 'sesion-chat'}>
        {mensajes.length === 0 && !streaming ? (
          <p className="fila-sub">Pulsa "Explicar este punto" para empezar. Cada punto tiene su propio chat.</p>
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
          placeholder="Pregunta sobre este punto…"
          disabled={streaming}
        />
        <button className="btn btn-secundario" disabled={streaming || !preguntaLibre.trim()} onClick={onPreguntar}>
          Enviar
        </button>
      </div>

      <div className="paso-acciones">
        <button className="btn btn-primario" disabled={streaming} onClick={onExplicar}>
          {mensajes.length ? 'Volver a explicar' : 'Explicar este punto'}
        </button>
        {puedeSiguiente ? (
          <button className="btn btn-secundario" disabled={streaming} onClick={onSiguiente}>
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

  const unidades: Unidad[] = esEnsayo
    ? modulos.map((m) => ({ etiqueta: `${m.codigo} — ${m.titulo}`, detalle: m.descripcion.slice(0, 110) }))
    : indicadores.map((ind) => ({ etiqueta: ind, detalle: '' }));

  const [clave, setClave] = useState<string | null>(null);
  const [caps, setCaps] = useState({ structured: false, json: false });
  const [chats, setChats] = useState<Record<number, MensajeIA[]>>({});
  const [cobertura, setCobertura] = useState<number[]>([]);
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
    if (!s) return;
    try {
      const raw = JSON.parse(s.mensajes) as unknown;
      if (Array.isArray(raw)) setChats({ 0: raw as MensajeIA[] });
      else if (raw && typeof raw === 'object') setChats(raw as Record<number, MensajeIA[]>);
      const cob = JSON.parse(s.cobertura) as number[];
      setCobertura(cob);
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
          const idx = indicadores.findIndex((_, i) => !cob.includes(i));
          setPaso(idx === -1 ? 0 : idx);
        }
      }
    } catch {
      /* ignore */
    }
  }, [esEnsayo, id]);

  function persistir(c: Record<number, MensajeIA[]>, cob: number[], f: Fase): void {
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
    if (!clave || !modulo || !asignatura) return;
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
          key: clave,
          model: modelo,
          messages: msgs,
          tools: [{ type: 'openrouter:web_search' }],
          onDelta,
        });
      } catch {
        acc = '';
        setStreamTexto('');
        texto = await chatStream({ key: clave, model: modelo, messages: msgs, onDelta });
      }
      const nuevosChats = {
        ...chats,
        [indicePunto]: [
          ...historialPunto,
          { role: 'user' as const, content: `Explícame: ${indicadores[indicePunto]}` },
          { role: 'assistant' as const, content: texto },
        ],
      };
      const nuevaCob = cobertura.includes(indicePunto) ? cobertura : [...cobertura, indicePunto];
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
    if (!clave || !preguntaLibre.trim()) return;
    const texto = preguntaLibre.trim();
    const hist = chats[paso] || [];
    setPreguntaLibre('');
    setError('');
    setStreaming(true);
    setStreamTexto('');
    try {
      const msgs: MensajeIA[] = [
        { role: 'system', content: 'Eres una profesora chilena de 1° medio. Responde claro, breve y en HTML didáctico (h3, p, ul, strong, em, div class="rl-callout"/"rl-note", blockquote class="rl-quote", span class="rl-concept", figure/img de Wikimedia/NASA). Usa emojis. Párrafos cortos, tablas de máximo 3 columnas, sin atributos style/width/height (el diseño es responsivo), sin markdown ni scripts.' },
        ...hist,
        { role: 'user', content: texto },
      ];
      let acc = '';
      const resp = await chatStream({
        key: clave,
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

  function marcarVistoYSeguir(): void {
    const nuevaCob = cobertura.includes(paso) ? cobertura : [...cobertura, paso];
    setCobertura(nuevaCob);
    persistir(chats, nuevaCob, fase);
    cambiarPaso(Math.min(paso + 1, Math.max(0, indicadores.length - 1)));
  }

  function iniciarEvaluacion(): void {
    if (!clave) return;
    setError('');
    const total = esEnsayo ? 25 : Math.max(8, Math.min(25, unidades.length));
    const p: number[] = [];
    for (let i = 0; i < total; i++) p.push((i % Math.max(1, unidades.length)) + 1);
    setPlan(p);
    setIndice(0);
    setHistorial([]);
    setResultado(null);
    setPreguntaData(null);
    setElegida(null);
    setFase('evaluar');
    persistir(chats, cobertura, 'evaluar');
    void generarPregunta(p[0]);
  }

  async function generarPregunta(unidad: number): Promise<void> {
    if (!clave) return;
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
      let q: Pregunta | null = null;
      for (let intento = 0; intento < 2 && !q; intento++) {
        const schema = buildEvalSchema(unidades.length, 1);
        const msgs = buildEvalMessages({ titulo, contexto, unidades, nPreguntas: 1, soloUnidades: [unidad] });
        const raw = await chatJSON({
          key: clave,
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
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerandoPregunta(false);
    }
  }

  function responder(opcion: number): void {
    if (elegida != null) return;
    setElegida(opcion);
  }

  function siguientePregunta(): void {
    if (!preguntaData || elegida == null) return;
    const nuevoHist = [...historial, { pregunta: preguntaData, respuesta: elegida }];
    setHistorial(nuevoHist);
    if (indice + 1 < plan.length) {
      setIndice(indice + 1);
      void generarPregunta(plan[indice + 1]);
    } else {
      finalizar(nuevoHist);
    }
  }

  function finalizar(hist: { pregunta: Pregunta; respuesta: number }[]): void {
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
      if (cobertura.length >= indicadores.length) {
        setProgreso(actividadId(modulo.id, 'estudiar'), modulo.id, 'estudiar', 'completada');
      }
    }
    persistir(chats, cobertura, 'resultado');
  }

  function reiniciar(): void {
    const key = esEnsayo ? `ensayo:${id}` : id;
    resetSesionIA(key);
    setChats({});
    setCobertura([]);
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

  const titulo = esEnsayo ? `Ensayo con IA · ${asignatura?.nombre ?? ''}` : `Sesión IA · ${modulo?.titulo ?? ''}`;
  const chatActual = chats[paso] || [];
  const visto = cobertura.includes(paso);
  const porcentaje = resultado ? Math.round(resultado.pct * 100) : 0;
  const faseEfectiva: Fase = fase === 'resultado' && !resultado ? (esEnsayo ? 'evaluar' : 'ensenar') : fase;

  return (
    <div className="pantalla pantalla-ancha">
      <button className="btn-volver" onClick={() => go(esEnsayo ? { name: 'ensayo', asignaturaId: id } : { name: 'modulo', moduloId: id })}>
        ← Volver
      </button>

      <header className="cabecera cabecera-modulo">
        <div className="modulo-codigo">
          <Chip color="var(--violeta)">IA</Chip>
          <Chip tono="suave">{modelo}</Chip>
        </div>
        <h1>{titulo}</h1>
      </header>

      {!clave ? (
        <div className="banner banner-mal">
          No hay una clave de OpenRouter disponible. Configúrala (o desbloquéala) en Ajustes.
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-primario" onClick={() => go({ name: 'ajustes' })}>
              Configurar clave
            </button>
          </div>
        </div>
      ) : (
        <>
          {error ? <div className="msg-error">{error}</div> : null}

          {faseEfectiva === 'ensenar' && !esEnsayo && !pantallaCompleta ? (
            <>
              <div className="sesion-barra">
                <div>
                  <strong>
                    {cobertura.length}/{indicadores.length} puntos
                  </strong>
                  <ProgressBar pct={indicadores.length ? (cobertura.length / indicadores.length) * 100 : 0} alto={6} />
                </div>
                <button className="btn btn-exito" disabled={streaming || cobertura.length === 0} onClick={iniciarEvaluacion}>
                  Evaluarme
                </button>
              </div>

              <div className="sesion-layout">
                <aside className="sesion-puntos tarjeta">
                  <div className="sesion-puntos-cab">Puntos del módulo</div>
                  {indicadores.map((ind, i) => (
                    <button
                      key={i}
                      className={`sesion-punto ${i === paso ? 'actual' : ''} ${cobertura.includes(i) ? 'visto' : ''}`}
                      onClick={() => cambiarPaso(i)}
                    >
                      <span className="sesion-dot">{cobertura.includes(i) ? '✓' : i === paso ? '▸' : '○'}</span>
                      <span>{ind}</span>
                    </button>
                  ))}
                </aside>

                <section className="sesion-panel tarjeta">
                  <div className="ia-eval-cab">
                    <span className="fila-sub">
                      Punto {paso + 1} de {indicadores.length}
                    </span>
                    <div className="sesion-panel-acciones">
                      <span className={visto ? 'paso-estado ok' : 'paso-estado'}>{visto ? '✓ visto' : 'pendiente'}</span>
                      <button className="btn-icono" title="Pantalla completa" onClick={() => setPantallaCompleta(true)}>
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
                    onSiguiente={marcarVistoYSeguir}
                    puedeSiguiente={indicadores.length > 1}
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
              onSiguiente={marcarVistoYSeguir}
              puedeSiguiente={indicadores.length > 1}
              puntos={indicadores}
              paso={paso}
              vistos={cobertura}
              onCambiarPunto={cambiarPaso}
            />
          ) : null}

          {faseEfectiva === 'evaluar' ? (
            <section className="tarjeta">
              {plan.length === 0 ? (
                <>
                  <h2 className="seccion-titulo">{esEnsayo ? 'Ensayo general' : 'Evaluación'}</h2>
                  <p className="fila-sub">
                    {esEnsayo
                      ? '25 preguntas, una por vez, mezclando todas las OA de la asignatura.'
                      : `Preguntas que cubren los ${unidades.length} puntos del módulo, una por vez.`}
                  </p>
                  <button className="btn btn-primario btn-ancho" onClick={iniciarEvaluacion}>
                    {esEnsayo ? 'Empezar ensayo con IA' : 'Empezar evaluación con IA'}
                  </button>
                </>
              ) : generandoPregunta ? (
                <p className="fila-sub">
                  Generando pregunta {indice + 1} de {plan.length}…
                </p>
              ) : preguntaData ? (
                <>
                  <div className="ia-eval-cab">
                    <span className="fila-sub">
                      Pregunta {indice + 1} de {plan.length}
                    </span>
                    <Chip tono="suave">{(unidades[preguntaData.unidad - 1]?.etiqueta ?? '').slice(0, 46)}</Chip>
                  </div>
                  <ProgressBar pct={(indice / Math.max(1, plan.length)) * 100} alto={6} />
                  <p className="ia-pregunta">{preguntaData.pregunta}</p>
                  <div className="ia-opciones">
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
                      <div className={elegida === preguntaData.correcta ? 'msg-ok' : 'msg-error'}>
                        {elegida === preguntaData.correcta ? '✓ Correcto' : `✗ Correcto: ${String.fromCharCode(65 + preguntaData.correcta)}`}
                        {preguntaData.explicacion ? ` — ${preguntaData.explicacion}` : ''}
                      </div>
                      <button className="btn btn-primario btn-ancho" onClick={siguientePregunta}>
                        {indice + 1 < plan.length ? 'Siguiente pregunta →' : 'Ver resultado'}
                      </button>
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="fila-sub">No se pudo generar la pregunta.</p>
                  <button className="btn btn-secundario" onClick={() => void generarPregunta(plan[Math.min(indice, plan.length - 1)])}>
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
                ) : null}
                <button className="btn btn-primario" onClick={() => go(esEnsayo ? { name: 'ensayo', asignaturaId: id } : { name: 'modulo', moduloId: id })}>
                  Volver
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
