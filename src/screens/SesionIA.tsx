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
  preguntasParaFaltantes,
  unidadesCubiertas,
  type Pregunta,
  type ResultadoEval,
  type Unidad,
} from '../lib/cobertura';
import { arreglarImagenes, sanitizarHTML } from '../lib/sanitize';
import { Chip, CopyButton, Modal } from '../components/ui';

type Fase = 'ensenar' | 'evaluar' | 'resultado';

function HtmlIA({ html }: { html: string }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const safe = useMemo(() => sanitizarHTML(html), [html]);
  useEffect(() => {
    arreglarImagenes(ref.current);
  }, [safe]);
  return <div ref={ref} className="contenido-ia" dangerouslySetInnerHTML={{ __html: safe }} />;
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
  const modoIA = config.ai_mode === 'openrouter';

  const unidades: Unidad[] = esEnsayo
    ? modulos.map((m) => ({ etiqueta: `${m.codigo} — ${m.titulo}`, detalle: m.descripcion.slice(0, 110) }))
    : indicadores.map((ind) => ({ etiqueta: ind, detalle: '' }));

  const [clave, setClave] = useState<string | null>(null);
  const [caps, setCaps] = useState({ structured: false, json: false });
  const [mensajes, setMensajes] = useState<MensajeIA[]>([]);
  const [cobertura, setCobertura] = useState<number[]>([]);
  const [fase, setFase] = useState<Fase>(esEnsayo ? 'evaluar' : 'ensenar');
  const [paso, setPaso] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const [streamTexto, setStreamTexto] = useState('');
  const [preguntaLibre, setPreguntaLibre] = useState('');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<(number | null)[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [resultado, setResultado] = useState<ResultadoEval | null>(null);
  const [cargando, setCargando] = useState(false);
  const [estadoCarga, setEstadoCarga] = useState('');
  const [error, setError] = useState('');

  // Cargar clave y sesión guardada.
  useEffect(() => {
    void cargarClave().then(setClave);
  }, []);

  useEffect(() => {
    if (!modoIA) return;
    listarModelos()
      .then((ms) => {
        const m = ms.find((x) => x.id === modelo);
        setCaps({ structured: !!m?.structured, json: !!m?.json });
      })
      .catch(() => setCaps({ structured: false, json: false }));
  }, [modoIA, modelo]);

  useEffect(() => {
    const key = esEnsayo ? `ensayo:${id}` : id;
    const s = getSesionIA(key);
    if (!s) return;
    try {
      setMensajes(JSON.parse(s.mensajes) as MensajeIA[]);
      setCobertura(JSON.parse(s.cobertura) as number[]);
      setFase((s.fase as Fase) || 'ensenar');
    } catch {
      /* ignore */
    }
  }, [esEnsayo, id]);

  function persistir(m: MensajeIA[], c: number[], f: Fase): void {
    const key = esEnsayo ? `ensayo:${id}` : id;
    saveSesionIA(key, m, c, f);
  }

  function agregarMensaje(m: MensajeIA, c = cobertura, f = fase): void {
    const next = [...mensajes, m];
    setMensajes(next);
    persistir(next, c, f);
  }

  async function explicar(indice: number): Promise<void> {
    if (!clave || !modulo || !asignatura) return;
    setError('');
    setStreaming(true);
    setStreamTexto('');
    try {
      const msgs = buildTeachMessages(asignatura.nombre, modulo, indicadores[indice], mensajes);
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
      const nuevos = [...mensajes, { role: 'user' as const, content: `Explícame: ${indicadores[indice]}` }, { role: 'assistant' as const, content: texto }];
      const nuevaCob = cobertura.includes(indice) ? cobertura : [...cobertura, indice];
      setMensajes(nuevos);
      setCobertura(nuevaCob);
      persistir(nuevos, nuevaCob, fase);
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
    setPreguntaLibre('');
    setError('');
    setStreaming(true);
    setStreamTexto('');
    try {
      const msgs: MensajeIA[] = [
        { role: 'system', content: 'Eres una profesora chilena de 1° medio. Responde claro y breve, con ejemplos. Puedes usar HTML simple.' },
        ...mensajes,
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
      const nuevos: MensajeIA[] = [...mensajes, { role: 'user', content: texto }, { role: 'assistant', content: resp }];
      setMensajes(nuevos);
      persistir(nuevos, cobertura, fase);
      setStreamTexto('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStreaming(false);
    }
  }

  async function generarEvaluacion(): Promise<void> {
    if (!clave) return;
    setError('');
    setCargando(true);
    setEstadoCarga('Preparando…');
    try {
      const nPreguntas = esEnsayo ? 25 : Math.min(25, Math.max(8, unidades.length + 2));
      const titulo = esEnsayo
        ? `Ensayo general — ${asignatura?.nombre}`
        : `Módulo ${modulo?.codigo} — ${modulo?.titulo}`;
      const contexto = esEnsayo
        ? `Todas las OA de ${asignatura?.nombre}.`
        : `${asignatura?.nombre}. ${modulo?.descripcion}`;

      const indices = unidades.map((_, i) => i + 1);
      const nLotes = Math.max(1, Math.ceil(unidades.length / 6));
      const tam = Math.ceil(unidades.length / nLotes);
      const lotes: number[][] = [];
      for (let i = 0; i < indices.length; i += tam) lotes.push(indices.slice(i, i + tam));
      const base = Math.floor(nPreguntas / lotes.length);
      const extra = nPreguntas % lotes.length;

      let acumuladas: Pregunta[] = [];
      for (let li = 0; li < lotes.length; li++) {
        const lote = lotes[li];
        setEstadoCarga(`Generando preguntas (${li + 1}/${lotes.length})…`);
        const pedir = Math.max(lote.length, Math.min(12, base + (li < extra ? 1 : 0)));
        let nuevas: Pregunta[] = [];
        for (let intento = 0; intento < 2 && nuevas.length === 0; intento++) {
          const schema = buildEvalSchema(unidades.length, pedir);
          const msgs = buildEvalMessages({ titulo, contexto, unidades, nPreguntas: pedir, soloUnidades: lote });
          const raw = await chatJSON({
            key: clave,
            model: modelo,
            messages: msgs,
            schema,
            structured: caps.structured,
            json: caps.json,
          });
          nuevas = normalizarPreguntas(raw, unidades.length).filter((p) => lote.includes(p.unidad));
        }
        acumuladas = [...acumuladas, ...nuevas];
      }

      // Reintento final para unidades que hayan quedado sin pregunta.
      const faltan = preguntasParaFaltantes(unidadesCubiertas(acumuladas), unidades.length);
      if (faltan.length) {
        try {
          setEstadoCarga('Completando puntos faltantes…');
          const schema = buildEvalSchema(unidades.length, faltan.length);
          const msgs = buildEvalMessages({ titulo, contexto, unidades, nPreguntas: faltan.length, soloUnidades: faltan });
          const raw = await chatJSON({
            key: clave,
            model: modelo,
            messages: msgs,
            schema,
            structured: caps.structured,
            json: caps.json,
          });
          acumuladas = [...acumuladas, ...normalizarPreguntas(raw, unidades.length).filter((p) => faltan.includes(p.unidad))];
        } catch {
          /* seguimos con lo que haya */
        }
      }

      if (acumuladas.length === 0) {
        throw new Error('El modelo no devolvió preguntas válidas. Revisa el crédito/modelo e intenta de nuevo.');
      }
      setPreguntas(acumuladas);
      setRespuestas(acumuladas.map(() => null));
      setPreguntaActual(0);
      setElegida(null);
      setFase('evaluar');
      persistir(mensajes, cobertura, 'evaluar');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
      setEstadoCarga('');
    }
  }

  function responder(opcion: number): void {
    if (elegida != null) return;
    setElegida(opcion);
    const next = [...respuestas];
    next[preguntaActual] = opcion;
    setRespuestas(next);
  }

  function siguientePregunta(): void {
    if (preguntaActual + 1 < preguntas.length) {
      setPreguntaActual(preguntaActual + 1);
      setElegida(null);
    } else {
      finalizar();
    }
  }

  function finalizar(): void {
    const res = calificar(preguntas, respuestas);
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
      texto_crudo: JSON.stringify({ origen: 'ia', preguntas, respuestas }),
      estado_parseo: 'ok',
    });

    if (!esEnsayo && modulo) {
      setProgreso(actividadId(modulo.id, 'evaluar'), modulo.id, 'evaluar', 'completada');
      if (cobertura.length >= indicadores.length) {
        setProgreso(actividadId(modulo.id, 'estudiar'), modulo.id, 'estudiar', 'completada');
      }
    }
    persistir(mensajes, cobertura, 'resultado');
  }

  function reiniciar(): void {
    const key = esEnsayo ? `ensayo:${id}` : id;
    resetSesionIA(key);
    setMensajes([]);
    setCobertura([]);
    setFase(esEnsayo ? 'evaluar' : 'ensenar');
    setPaso(0);
    setPreguntas([]);
    setRespuestas([]);
    setResultado(null);
    setError('');
  }

  const titulo = esEnsayo ? `Ensayo con IA · ${asignatura?.nombre ?? ''}` : `Sesión IA · ${modulo?.titulo ?? ''}`;
  const unidadActual = esEnsayo ? null : indicadores[paso];
  const pregunta = preguntas[preguntaActual];
  const porcentaje = resultado ? Math.round(resultado.pct * 100) : 0;
  // Si quedó guardada una fase "resultado" sin resultado en memoria, mostramos la evaluación.
  const faseEfectiva: Fase = fase === 'resultado' && !resultado ? (esEnsayo ? 'evaluar' : 'ensenar') : fase;

  return (
    <div className="pantalla">
      <button className="btn-volver" onClick={() => go(esEnsayo ? { name: 'ensayo', asignaturaId: id } : { name: 'modulo', moduloId: id })}>
        ← Volver
      </button>

      <header className="cabecera cabecera-modulo">
        <div className="modulo-codigo">
          <Chip color="var(--violeta)">IA</Chip>
          <Chip tono="suave">{modelo}</Chip>
        </div>
        <h1>{titulo}</h1>
        <p className="cabecera-sub">
          Tu agente trabaja desde este navegador. La app controla el contexto y la cobertura para que no se pierda nada.
        </p>
      </header>

      {!modoIA ? (
        <div className="banner banner-info">
          Activa el **modo IA** en Ajustes para usar esta pantalla. Mientras tanto, puedes seguir con el modo manual (copiar/pegar).
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-primario" onClick={() => go({ name: 'ajustes' })}>
              Ir a Ajustes
            </button>
          </div>
        </div>
      ) : !clave ? (
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

          {!esEnsayo ? (
            <section className="tarjeta">
              <div className="ia-cobertura">
                <div className="ia-cobertura-cab">
                  <strong>Cobertura de puntos</strong>
                  <span className="fila-sub">
                    {cobertura.length}/{indicadores.length} vistos
                  </span>
                </div>
                <ul className="ia-checklist">
                  {indicadores.map((ind, i) => (
                    <li key={i} className={cobertura.includes(i) ? 'visto' : i === paso ? 'actual' : ''}>
                      <span className="ia-check">{cobertura.includes(i) ? '✓' : i === paso ? '▸' : '○'}</span>
                      <button className="ia-check-texto" onClick={() => setPaso(i)}>
                        {ind}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          {faseEfectiva === 'ensenar' && !esEnsayo ? (
            <section className="tarjeta">
              <h2 className="seccion-titulo">Punto actual</h2>
              <p className="ia-punto">{unidadActual}</p>
              <div className="paso-acciones">
                <button className="btn btn-primario" disabled={streaming} onClick={() => explicar(paso)}>
                  {streaming ? 'Explicando…' : 'Explicar este punto'}
                </button>
                <button className="btn btn-secundario" disabled={streaming} onClick={() => setPaso(Math.min(paso + 1, indicadores.length - 1))}>
                  Siguiente punto →
                </button>
                <button className="btn btn-exito" disabled={streaming || cobertura.length === 0} onClick={generarEvaluacion}>
                  Generar evaluación
                </button>
              </div>
            </section>
          ) : null}

          {faseEfectiva === 'ensenar' && !esEnsayo ? (
            <section className="tarjeta">
              <h2 className="seccion-titulo">Conversación</h2>
              <div className="ia-chat">
                {mensajes.length === 0 && !streaming ? (
                  <p className="fila-sub">Pulsa "Explicar este punto" para empezar. También puedes escribir una pregunta abajo.</p>
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
                    if (e.key === 'Enter') void preguntar();
                  }}
                  placeholder="Pregunta lo que no entiendas…"
                  disabled={streaming}
                />
                <button className="btn btn-secundario" disabled={streaming || !preguntaLibre.trim()} onClick={preguntar}>
                  Enviar
                </button>
              </div>
            </section>
          ) : null}

          {faseEfectiva === 'evaluar' ? (
            <section className="tarjeta">
              {preguntas.length === 0 ? (
                <>
                  <h2 className="seccion-titulo">{esEnsayo ? 'Ensayo general' : 'Evaluación'}</h2>
                  <p className="fila-sub">
                    {esEnsayo
                      ? '25 preguntas mezclando todas las OA de la asignatura.'
                      : `Preguntas que cubren los ${unidades.length} puntos del módulo.`}
                  </p>
                  <button className="btn btn-primario btn-ancho" disabled={cargando} onClick={generarEvaluacion}>
                    {cargando ? estadoCarga || 'Generando preguntas…' : esEnsayo ? 'Generar ensayo con IA' : 'Generar evaluación con IA'}
                  </button>
                </>
              ) : (
                <>
                  <div className="ia-eval-cab">
                    <span className="fila-sub">
                      Pregunta {preguntaActual + 1} de {preguntas.length}
                    </span>
                    <Chip tono="suave">unidad {pregunta?.unidad}</Chip>
                  </div>
                  <p className="ia-pregunta">{pregunta?.pregunta}</p>
                  <div className="ia-opciones">
                    {pregunta?.alternativas.map((alt, i) => {
                      let clase = 'ia-opcion';
                      if (elegida != null) {
                        if (i === pregunta.correcta) clase += ' correcta';
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
                      <div className={elegida === pregunta.correcta ? 'msg-ok' : 'msg-error'}>
                        {elegida === pregunta.correcta ? '✓ Correcto' : `✗ Correcto: ${String.fromCharCode(65 + pregunta.correcta)}`}
                        {pregunta.explicacion ? ` — ${pregunta.explicacion}` : ''}
                      </div>
                      <button className="btn btn-primario btn-ancho" onClick={siguientePregunta}>
                        {preguntaActual + 1 < preguntas.length ? 'Siguiente pregunta →' : 'Ver resultado'}
                      </button>
                    </>
                  ) : null}
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
                <button className="btn btn-secundario" onClick={reiniciar}>
                  Reiniciar sesión
                </button>
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
