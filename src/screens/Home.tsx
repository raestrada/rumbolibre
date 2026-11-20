import { useMemo, useState } from 'react';
import Logo from '../components/Logo';
import { getAsignaturas, getConfig, getCursos, getModulos } from '../db/queries';
import './home.css';

interface HomeProps {
  onIngresar: () => void;
}

type PreviewTab = 'ruta' | 'tutor' | 'familias';

/* — Iconos SVG minimalistas (sin dependencias externas) — */
function IconArrowRight({ size = 16 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconGithub({ size = 18 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

function IconShield({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconCompass({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function IconSparkles({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

function IconCalendar({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function IconUsers({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconBook({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconDatabase({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </svg>
  );
}

function IconKey({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}

function IconCode({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconCheck({ size = 15 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconChevronDown({ size = 18 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function Home({ onIngresar }: HomeProps): JSX.Element {
  const config = getConfig();
  const nombreEstudiante = config.nombre || '';
  const cursosDisponibles = useMemo(() => getCursos(), []);

  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState<string>(
    () => config.curso_activo || 'm1',
  );
  const [previewTab, setPreviewTab] = useState<PreviewTab>('ruta');
  const [faqAbierta, setFaqAbierta] = useState<number | null>(0);

  const cursosConConteo = useMemo(() => {
    return cursosDisponibles.map((c) => {
      const asigs = getAsignaturas(c.id);
      const totalModulos = asigs.reduce((acc, a) => acc + getModulos(a.id).length, 0);
      return {
        ...c,
        totalModulos,
      };
    });
  }, [cursosDisponibles]);

  const totalModulosGlobal = useMemo(
    () => cursosConConteo.reduce((acc, c) => acc + c.totalModulos, 0),
    [cursosConConteo],
  );

  const cursoActivo =
    cursosConConteo.find((c) => c.id === cursoSeleccionadoId) ?? cursosConConteo[0];
  const asignaturasConModulos = useMemo(() => {
    return getAsignaturas(cursoSeleccionadoId).map((asig) => ({
      ...asig,
      modulos: getModulos(asig.id),
    }));
  }, [cursoSeleccionadoId]);

  const totalModulosCursoActivo = useMemo(
    () => asignaturasConModulos.reduce((acc, a) => acc + a.modulos.length, 0),
    [asignaturasConModulos],
  );

  const faqs: Array<{ q: string; a: React.ReactNode }> = [
    {
      q: '¿Qué son los Exámenes Libres de Validación de Estudios del MINEDUC?',
      a: 'Es el proceso oficial del Ministerio de Educación de Chile que permite a niñas, niños y jóvenes menores de 18 años validar formalmente su año escolar y obtener certificados oficiales de notas reconocidos por el Estado, ideal para educación en casa, deportistas o familias en movimiento.',
    },
    {
      q: '¿Por qué los datos se guardan solo en mi navegador?',
      a: 'Rumbo Libre corre una base de datos SQLite real (WASM) dentro de tu propio navegador mediante IndexedDB. No existe un servidor central recopilando notas, respuestas ni perfiles de menores. Tus datos nunca salen de tu equipo.',
    },
    {
      q: '¿Es realmente gratuito y de código abierto?',
      a: (
        <>
          Sí, por completo. El código fuente está publicado bajo licencia MIT en{' '}
          <a
            href="https://github.com/raestrada/rumbolibre"
            target="_blank"
            rel="noopener noreferrer"
            className="home-inline-link"
          >
            GitHub
          </a>
          . No hay cuentas obligatorias, suscripciones, planes ocultos ni publicidad. Cualquier persona puede auditarlo, contribuir o instalar su propia instancia.
        </>
      ),
    },
    {
      q: '¿Cómo funciona el tutor IA y qué proveedor necesito?',
      a: (
        <>
          Para mantener la independencia y no cobrar mensualidades, tú conectas tu propia clave de API directamente desde el navegador. Actualmente soportamos{' '}
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="home-inline-link"
          >
            OpenRouter
          </a>
          , que da acceso a modelos gratuitos y de costo mínimo (como DeepSeek, Llama, Claude o GPT). Tu clave se guarda cifrada localmente y nunca pasa por servidores nuestros.
        </>
      ),
    },
    {
      q: '¿El temario corresponde exactamente a los programas oficiales del MINEDUC?',
      a: `Sí. Cubre los ${cursosConConteo.length} niveles disponibles (5° básico a 4° medio) con ${totalModulosGlobal} módulos estructurados directamente a partir de los Decretos de Bases Curriculares, Objetivos de Aprendizaje (OA) e indicadores oficiales publicados por la UCE del MINEDUC.`,
    },
    {
      q: '¿Puedo respaldar o mover mi avance a otro computador?',
      a: 'Sí. Desde Ajustes puedes exportar toda tu base de datos en un archivo .sqlite o JSON en cualquier momento y restaurarla en otro dispositivo con un clic.',
    },
  ];

  return (
    <div className="home-pagina">
      {/* Navegación superior translúcida */}
      <header className="home-header">
        <nav className="home-nav" aria-label="Navegación principal">
          <a href="#inicio" className="home-nav-marca">
            <Logo size={32} />
            <span className="home-marca-nombre">Rumbo Libre</span>
            <span className="home-marca-tag">Open Source</span>
          </a>

          <div className="home-nav-links">
            <a href="#beneficios" className="home-nav-link">Qué ofrece</a>
            <a href="#temario" className="home-nav-link">Temario oficial</a>
            <a href="#metodo" className="home-nav-link">Cómo funciona</a>
            <a href="#privacidad" className="home-nav-link">Privacidad</a>
            <a href="#faq" className="home-nav-link">Preguntas</a>
          </div>

          <div className="home-nav-acciones">
            <a
              href="https://github.com/raestrada/rumbolibre"
              target="_blank"
              rel="noopener noreferrer"
              className="home-nav-github"
              aria-label="Ver código fuente en GitHub"
              title="Código fuente en GitHub"
            >
              <IconGithub size={18} />
            </a>
            <button type="button" className="home-btn-primario home-btn-sm" onClick={onIngresar}>
              <span>{nombreEstudiante ? `Continuar, ${nombreEstudiante}` : 'Abrir app'}</span>
              <IconArrowRight size={15} />
            </button>
          </div>
        </nav>
      </header>

      <main id="inicio">
        {/* Hero Editorial + Vista Interactiva de la App */}
        <section className="home-hero">
          <div className="home-hero-aurora" aria-hidden="true" />
          <div className="home-hero-inner">
            <div className="home-eyebrow">
              <span className="home-eyebrow-dot" aria-hidden="true" />
              <span>Validación de Estudios MINEDUC · 5° básico a 4° medio</span>
            </div>

            <h1 className="home-hero-titulo">
              Prepara tus Exámenes Libres con claridad, a tu ritmo y{' '}
              <span className="home-hero-acento">dueño de tus datos.</span>
            </h1>

            <p className="home-hero-bajada">
              Una guía de estudio abierta y gratuita para familias y estudiantes en Chile.
              Todo el temario oficial del MINEDUC organizado paso a paso, con tutoría asistida
              por IA y persistencia 100% local en tu navegador.
            </p>

            <div className="home-hero-acciones">
              <button type="button" className="home-btn-primario home-btn-lg" onClick={onIngresar}>
                <span>
                  {nombreEstudiante
                    ? `Continuar estudiando (${nombreEstudiante})`
                    : 'Empezar a estudiar gratis'}
                </span>
                <IconArrowRight size={17} />
              </button>
              <a href="#temario" className="home-btn-secundario home-btn-lg">
                Explorar temario oficial
              </a>
            </div>

            <div className="home-hero-notas" aria-label="Principios clave">
              <span><IconCheck size={14} /> Sin cuentas ni registro</span>
              <span><IconCheck size={14} /> 100% local (SQLite en tu navegador)</span>
              <span><IconCheck size={14} /> Código abierto MIT</span>
            </div>
          </div>

          {/* Ventana Interactiva de Producto */}
          <div className="home-showcase">
            <div className="home-showcase-tabs" role="tablist" aria-label="Vistas de la aplicación">
              <button
                type="button"
                role="tab"
                aria-selected={previewTab === 'ruta'}
                className={`home-showcase-tab ${previewTab === 'ruta' ? 'activo' : ''}`}
                onClick={() => setPreviewTab('ruta')}
              >
                <IconCompass size={15} />
                <span>Ruta de estudio</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={previewTab === 'tutor'}
                className={`home-showcase-tab ${previewTab === 'tutor' ? 'activo' : ''}`}
                onClick={() => setPreviewTab('tutor')}
              >
                <IconSparkles size={15} />
                <span>Tutor IA guiado</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={previewTab === 'familias'}
                className={`home-showcase-tab ${previewTab === 'familias' ? 'activo' : ''}`}
                onClick={() => setPreviewTab('familias')}
              >
                <IconUsers size={15} />
                <span>Panel familias</span>
              </button>
            </div>

            <div className="home-window">
              <div className="home-window-bar">
                <div className="home-window-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="home-window-url">
                  <IconShield size={13} />
                  <span>rumbolibre.app · Base de datos local activa</span>
                </div>
                <div className="home-window-badge">Offline-ready</div>
              </div>

              <div className="home-window-body">
                {previewTab === 'ruta' && (
                  <div className="home-preview-grid">
                    <div className="home-preview-sidebar">
                      <div className="home-preview-brand">
                        <Logo size={22} />
                        <div>
                          <strong>1° Medio</strong>
                          <span>Plan MINEDUC</span>
                        </div>
                      </div>
                      <div className="home-preview-nav">
                        <span className="activo">Resumen</span>
                        <span>Ruta de estudio</span>
                        <span>Calendario</span>
                        <span>Ensayos</span>
                        <span>Biblioteca</span>
                      </div>
                    </div>

                    <div className="home-preview-main">
                      <div className="home-preview-head">
                        <div>
                          <span className="home-preview-kicker">Siguiente paso recomendado</span>
                          <h3>OA 3 · Comprensión de textos narrativos y conflictos</h3>
                        </div>
                        <span className="home-preview-pill">Lengua y Literatura</span>
                      </div>

                      <div className="home-preview-progress-wrap">
                        <div className="home-preview-progress-top">
                          <span>Avance general del curso</span>
                          <strong>18 de 40 módulos · 45%</strong>
                        </div>
                        <div className="home-preview-bar">
                          <div className="home-preview-bar-fill" style={{ width: '45%' }} />
                        </div>
                      </div>

                      <div className="home-preview-cards">
                        <div className="home-preview-mini-card">
                          <span className="dot" style={{ background: '#ec4899' }} />
                          <div>
                            <strong>Lengua y Literatura</strong>
                            <small>4 de 7 OA aprobados</small>
                          </div>
                        </div>
                        <div className="home-preview-mini-card">
                          <span className="dot" style={{ background: '#3b82f6' }} />
                          <div>
                            <strong>Matemática</strong>
                            <small>5 de 11 OA aprobados</small>
                          </div>
                        </div>
                        <div className="home-preview-mini-card">
                          <span className="dot" style={{ background: '#10b981' }} />
                          <div>
                            <strong>Ciencias Naturales</strong>
                            <small>4 de 9 OA aprobados</small>
                          </div>
                        </div>
                        <div className="home-preview-mini-card">
                          <span className="dot" style={{ background: '#f59e0b' }} />
                          <div>
                            <strong>Historia y Geografía</strong>
                            <small>5 de 10 OA aprobados</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {previewTab === 'tutor' && (
                  <div className="home-preview-tutor">
                    <div className="home-preview-tutor-top">
                      <div>
                        <span className="home-preview-kicker">Sesión guiada · Indicadores oficiales</span>
                        <h3>Matemática · Sistemas de ecuaciones lineales (2×2)</h3>
                      </div>
                      <span className="home-preview-coverage">3 / 4 indicadores cubiertos</span>
                    </div>

                    <div className="home-preview-chat">
                      <div className="home-chat-msg tutor">
                        <span className="home-chat-role">Tutor IA</span>
                        <p>
                          Antes de pasar a la evaluación, probemos un caso cotidiano: si dos entradas
                          de cine y una bebida cuestan $11.000, y una entrada más una bebida cuestan
                          $7.000, ¿cómo escribirías las dos ecuaciones?
                        </p>
                      </div>
                      <div className="home-chat-msg student">
                        <span className="home-chat-role">Estudiante</span>
                        <p>2x + y = 11000 y x + y = 7000. Si las resto, me queda x = 4000.</p>
                      </div>
                      <div className="home-chat-msg tutor">
                        <span className="home-chat-role">Tutor IA</span>
                        <p>
                          Exacto. Acabas de aplicar el método de reducción con precisión. Ya cubrimos
                          los indicadores de planteamiento y resolución; cuando quieras, pasamos al
                          ensayo de verificación.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {previewTab === 'familias' && (
                  <div className="home-preview-familias">
                    <div className="home-preview-head">
                      <div>
                        <span className="home-preview-kicker">Panel protegido con PIN local</span>
                        <h3>Seguimiento transparente sin invadir el estudio</h3>
                      </div>
                      <span className="home-preview-pill verde">Respaldo .sqlite al día</span>
                    </div>

                    <div className="home-preview-stats">
                      <div className="home-preview-stat">
                        <small>Promedio ensayos</small>
                        <strong>6,1</strong>
                        <span>Escala chilena 1,0 – 7,0</span>
                      </div>
                      <div className="home-preview-stat">
                        <small>Ritmo semanal</small>
                        <strong>4 sesiones</strong>
                        <span>En fecha para octubre</span>
                      </div>
                      <div className="home-preview-stat">
                        <small>Por reforzar</small>
                        <strong>2 temas</strong>
                        <span>Listos en cola de repaso</span>
                      </div>
                    </div>

                    <div className="home-preview-log">
                      <div className="home-preview-log-row">
                        <span>Evaluación · OA 4 Potencias y raíces</span>
                        <strong>Nota 6,4 · Verificada</strong>
                      </div>
                      <div className="home-preview-log-row">
                        <span>Evaluación · OA 2 Revolución Industrial</span>
                        <strong>Nota 5,8 · Pendiente revisión</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Franja de cifras reales */}
        <section className="home-metrics" aria-label="Resumen de la plataforma">
          <div className="home-metrics-grid">
            <div className="home-metric">
              <span className="home-metric-val">{cursosConConteo.length}</span>
              <span className="home-metric-label">Cursos oficiales (5° básico a 4° medio)</span>
            </div>
            <div className="home-metric">
              <span className="home-metric-val">{totalModulosGlobal}</span>
              <span className="home-metric-label">Módulos y OA alineados al MINEDUC</span>
            </div>
            <div className="home-metric">
              <span className="home-metric-val">0</span>
              <span className="home-metric-label">Servidores externos ni rastreadores</span>
            </div>
            <div className="home-metric">
              <span className="home-metric-val">100%</span>
              <span className="home-metric-label">Gratuito y código abierto (MIT)</span>
            </div>
          </div>
        </section>

        {/* Bento Grid: Qué ofrece */}
        <section id="beneficios" className="home-section">
          <div className="home-section-head">
            <span className="home-kicker">Pensado para familias y autodidactas</span>
            <h2 className="home-section-title">
              Estructura real para estudiar sin abrumarse.
            </h2>
            <p className="home-section-sub">
              Estudiar fuera del aula tradicional no debería significar improvisar con PDFs
              sueltos ni pagar plataformas cerradas. Rumbo Libre ordena todo el camino.
            </p>
          </div>

          <div className="home-bento">
            <article className="home-bento-card span-2">
              <div className="home-bento-icon violeta">
                <IconCompass size={20} />
              </div>
              <h3>Temario oficial del MINEDUC, sin relleno</h3>
              <p>
                Cada asignatura y módulo se construye directamente desde las Bases Curriculares
                y temarios de Validación de Estudios. Incluye una ruta ordenada por dependencias
                y ensayos de 25 preguntas con el formato real del examen.
              </p>
            </article>

            <article className="home-bento-card">
              <div className="home-bento-icon azul">
                <IconCalendar size={20} />
              </div>
              <h3>Calendario a tu ritmo</h3>
              <p>
                Define tu fecha objetivo y reparte los módulos según la rutina real de tu familia,
                sin rachas agresivas ni notificaciones invasivas.
              </p>
            </article>

            <article className="home-bento-card">
              <div className="home-bento-icon menta">
                <IconUsers size={20} />
              </div>
              <h3>Panel de familias con PIN</h3>
              <p>
                Madres, padres o tutores pueden revisar avances, notas verificadas y temas a
                reforzar desde una vista protegida localmente con PIN.
              </p>
            </article>

            <article className="home-bento-card span-2">
              <div className="home-bento-icon rosa">
                <IconSparkles size={20} />
              </div>
              <h3>Tutor IA con tus propias reglas</h3>
              <p>
                Estudia conversando, pide ejemplos cotidianos y practica antes de rendir cada
                módulo. Conectas tu propia clave de{' '}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-inline-link"
                >
                  OpenRouter
                </a>{' '}
                (con modelos gratuitos o de costo mínimo) directamente desde tu navegador, sin
                intermediarios ni suscripciones.
              </p>
            </article>

            <article className="home-bento-card span-3 home-bento-horizontal">
              <div className="home-bento-h-left">
                <div className="home-bento-icon ambar">
                  <IconBook size={20} />
                </div>
                <div>
                  <h3>Biblioteca curada y exámenes de práctica</h3>
                  <p>
                    Más de 60 libros recomendados de literatura y divulgación científica filtrados
                    por edad y nivel, junto con guías y modelos oficiales del MINEDUC para llegar
                    con confianza el día de la prueba.
                  </p>
                </div>
              </div>
              <button type="button" className="home-btn-secundario" onClick={onIngresar}>
                Ver biblioteca en la app
              </button>
            </article>
          </div>
        </section>

        {/* Explorador Interactivo del Temario Oficial */}
        <section id="temario" className="home-section home-section-tinted">
          <div className="home-section-inner">
            <div className="home-section-head">
              <span className="home-kicker">Currículum oficial UCE · MINEDUC</span>
              <h2 className="home-section-title">Explora el temario real antes de empezar</h2>
              <p className="home-section-sub">
                Selecciona un curso para inspeccionar sus asignaturas, ejes temáticos y ejemplos
                de Objetivos de Aprendizaje incluidos en la aplicación.
              </p>
            </div>

            <div className="home-curso-selector" role="tablist" aria-label="Seleccionar curso">
              {cursosConConteo.map((c) => {
                const activo = c.id === cursoSeleccionadoId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={activo}
                    className={`home-curso-pill ${activo ? 'activo' : ''}`}
                    onClick={() => setCursoSeleccionadoId(c.id)}
                  >
                    <span>{c.nombre}</span>
                    <small>{c.totalModulos} OA</small>
                  </button>
                );
              })}
            </div>

            <div className="home-curso-meta">
              <strong>{cursoActivo?.nombre}</strong>
              <span className="home-sep" aria-hidden="true">·</span>
              <span>{totalModulosCursoActivo} módulos oficiales</span>
              <span className="home-sep" aria-hidden="true">·</span>
              <span>{cursoActivo?.decreto}</span>
            </div>

            <div className="home-asig-grid">
              {asignaturasConModulos.map((asig) => {
                const muestras = asig.modulos.slice(0, 2);
                return (
                  <article key={asig.id} className="home-asig-card">
                    <div className="home-asig-top">
                      <span
                        className="home-asig-dot"
                        style={{ backgroundColor: asig.color }}
                        aria-hidden="true"
                      />
                      <span className="home-asig-count">{asig.modulos.length} módulos</span>
                    </div>

                    <h3 className="home-asig-nombre">{asig.nombre}</h3>

                    <p className="home-asig-ejes">
                      {asig.ejes.join(' · ')}
                    </p>

                    {muestras.length > 0 && (
                      <ul className="home-asig-muestras">
                        {muestras.map((m) => (
                          <li key={m.id}>
                            <span className="home-asig-oa">{m.numero}</span>
                            <span>{m.titulo}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cómo funciona (3 pasos sobrios) */}
        <section id="metodo" className="home-section">
          <div className="home-section-head">
            <span className="home-kicker">Cómo funciona</span>
            <h2 className="home-section-title">De la incertidumbre a una rutina clara en tres pasos</h2>
          </div>

          <div className="home-steps">
            <div className="home-step">
              <div className="home-step-num">01</div>
              <h3>Elige tu curso y tu calendario</h3>
              <p>
                Ingresa un nombre, escoge tu nivel de 5° básico a 4° medio y define cuándo rindes
                tus exámenes. Todo queda guardado al instante en tu dispositivo.
              </p>
            </div>

            <div className="home-step">
              <div className="home-step-num">02</div>
              <h3>Estudia cada objetivo con guía</h3>
              <p>
                Avanza módulo por módulo. El tutor IA adapta las explicaciones a tu ritmo y
                verifica que cubras cada indicador oficial del MINEDUC antes de evaluarte.
              </p>
            </div>

            <div className="home-step">
              <div className="home-step-num">03</div>
              <h3>Evalúa, repasa y respalda</h3>
              <p>
                Rinde evaluaciones formativas y ensayos completos de 25 preguntas. Refuerza solo
                lo que te costó y descarga copias de seguridad de tu base de datos cuando quieras.
              </p>
            </div>
          </div>
        </section>

        {/* Manifiesto Open Source & Privacidad */}
        <section id="privacidad" className="home-manifesto-wrap">
          <div className="home-manifesto">
            <div className="home-manifesto-head">
              <span className="home-manifesto-kicker">Principios del proyecto</span>
              <h2>Abierto por convicción. Privado por diseño.</h2>
              <p>
                Rumbo Libre no nació para vender suscripciones ni recolectar datos de estudiantes.
                Es una herramienta comunitaria creada para ayudar a las familias en Chile a
                preparar sus exámenes libres con autonomía y tranquilidad.
              </p>
            </div>

            <div className="home-manifesto-grid">
              <div className="home-manifesto-item">
                <div className="home-manifesto-icon">
                  <IconCode size={20} />
                </div>
                <h3>Software libre (Licencia MIT)</h3>
                <p>
                  El código fuente completo está publicado en GitHub. Cualquier familia, docente o
                  programador puede auditarlo, proponer mejoras o adaptarlo libremente.
                </p>
              </div>

              <div className="home-manifesto-item">
                <div className="home-manifesto-icon">
                  <IconDatabase size={20} />
                </div>
                <h3>100% local en tu navegador</h3>
                <p>
                  Tus datos viven en una base de datos SQLite local dentro de tu navegador
                  (IndexedDB). Sin servidores centrales, sin analíticas invasivas y con respaldo
                  exportable en un clic.
                </p>
              </div>

              <div className="home-manifesto-item">
                <div className="home-manifesto-icon">
                  <IconKey size={20} />
                </div>
                <h3>Sin intermediarios en tu IA</h3>
                <p>
                  Tú eliges el modelo y controlas el gasto usando tu propia clave de OpenRouter
                  directamente desde tu equipo. Nunca vemos tu clave ni tus conversaciones.
                </p>
              </div>
            </div>

            <div className="home-manifesto-footer">
              <a
                href="https://github.com/raestrada/rumbolibre"
                target="_blank"
                rel="noopener noreferrer"
                className="home-manifesto-link"
              >
                <IconGithub size={17} />
                <span>Revisar el repositorio en GitHub</span>
                <IconArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* Preguntas Frecuentes (layout editorial de 2 columnas) */}
        <section id="faq" className="home-section">
          <div className="home-faq-layout">
            <div className="home-faq-intro">
              <span className="home-kicker">Preguntas frecuentes</span>
              <h2 className="home-section-title">Respuestas directas, sin letra chica</h2>
              <p className="home-section-sub">
                Si tienes otra duda técnica o curricular, puedes abrir una consulta directamente en
                el repositorio comunitario de GitHub.
              </p>
            </div>

            <div className="home-faq-list">
              {faqs.map((f, i) => {
                const abierta = faqAbierta === i;
                return (
                  <div key={f.q} className={`home-faq-item ${abierta ? 'abierto' : ''}`}>
                    <button
                      type="button"
                      className="home-faq-btn"
                      onClick={() => setFaqAbierta(abierta ? null : i)}
                      aria-expanded={abierta}
                    >
                      <span>{f.q}</span>
                      <span className="home-faq-chevron">
                        <IconChevronDown size={18} />
                      </span>
                    </button>
                    {abierta && (
                      <div className="home-faq-body">
                        <p>{f.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Invitación Final Sobria */}
        <section className="home-closing">
          <div className="home-closing-card">
            <h2>Tu preparación, en tus manos.</h2>
            <p>
              Abre la aplicación ahora mismo. Sin formularios, sin correos y con todo el temario
              oficial listo para empezar.
            </p>
            <div className="home-closing-actions">
              <button type="button" className="home-btn-primario home-btn-lg" onClick={onIngresar}>
                <span>{nombreEstudiante ? `Volver a mi espacio (${nombreEstudiante})` : 'Abrir Rumbo Libre'}</span>
                <IconArrowRight size={17} />
              </button>
              <a
                href="https://github.com/raestrada/rumbolibre"
                target="_blank"
                rel="noopener noreferrer"
                className="home-btn-secundario home-btn-lg"
              >
                <IconGithub size={17} />
                <span>Ver en GitHub</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Minimalista */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <div className="home-footer-logo">
              <Logo size={28} />
              <strong>Rumbo Libre</strong>
            </div>
            <p>
              Proyecto comunitario de código abierto para preparar los Exámenes Libres de
              Validación de Estudios del MINEDUC en Chile.
            </p>
          </div>

          <div className="home-footer-col">
            <h4>Explorar</h4>
            <a href="#beneficios">Qué ofrece</a>
            <a href="#temario">Temario oficial</a>
            <a href="#metodo">Cómo funciona</a>
            <a href="#privacidad">Privacidad</a>
            <a href="#faq">Preguntas frecuentes</a>
          </div>

          <div className="home-footer-col">
            <h4>Comunidad y código</h4>
            <a href="https://github.com/raestrada/rumbolibre" target="_blank" rel="noopener noreferrer">
              Repositorio en GitHub
            </a>
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">
              OpenRouter (proveedor IA)
            </a>
            <a
              href="https://www.ayudamineduc.cl/ficha/examenes-libres-menores-de-18-anos"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ayuda MINEDUC · Exámenes Libres
            </a>
            <span>Licencia MIT · Software libre</span>
          </div>
        </div>

        <div className="home-footer-bottom">
          <span>© {new Date().getFullYear()} Rumbo Libre · Hecho para las familias que educan con libertad en Chile.</span>
          <span>100% cliente · Sin rastreadores</span>
        </div>
      </footer>
    </div>
  );
}
