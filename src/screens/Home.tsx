import { useState } from 'react';
import Logo from '../components/Logo';
import { getAsignaturas, getConfig, getCursos, getModulos } from '../db/queries';

interface HomeProps {
  onIngresar: () => void;
}

export default function Home({ onIngresar }: HomeProps): JSX.Element {
  const config = getConfig();
  const nombreEstudiante = config.nombre || '';
  const cursosDisponibles = getCursos();
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState<string>(() => config.curso_activo || 'b5');
  const cursoActivo = cursosDisponibles.find((c) => c.id === cursoSeleccionadoId) ?? cursosDisponibles[0];
  const asignaturas = getAsignaturas(cursoSeleccionadoId);
  const modulos = getModulos(cursoSeleccionadoId);

  // Estado para acordeón FAQ interactivo
  const [faqAbierta, setFaqAbierta] = useState<number | null>(0);

  const faqs: Array<{ q: string; a: React.ReactNode }> = [
    {
      q: '¿Qué son los Exámenes Libres de Validación de Estudios del MINEDUC?',
      a: 'Es el mecanismo oficial del Ministerio de Educación de Chile que permite a niñas, niños y jóvenes menores de 18 años (especialmente quienes realizan educación en casa o homeschooling) validar formalmente sus estudios y obtener sus certificados oficiales de notas reconocidos por el Estado.',
    },
    {
      q: '¿Por qué Rumbo Libre dice que los datos son "100% locales en tu browser"?',
      a: 'A diferencia de otras apps que guardan tu vida en la nube, Rumbo Libre funciona con una base de datos SQLite integrada (WASM) directamente en tu navegador mediante IndexedDB. Tus notas, respuestas, horarios e información jamás se transmiten a servidores centrales ni se venden a terceros.',
    },
    {
      q: '¿Es realmente gratuito y de código abierto (Open Source)?',
      a: (
        <>
          Sí, 100%. Rumbo Libre es un proyecto comunitario de código abierto publicado bajo licencia libre MIT en{' '}
          <a
            href="https://github.com/raestrada/rumbolibre"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--violeta)', fontWeight: 600, textDecoration: 'underline' }}
          >
            GitHub
          </a>
          . No hay suscripciones, ni planes "Pro" con trampa, ni mensualidades ocultas, ni publicidad comercial. Todo el código fuente es público y auditable.
        </>
      ),
    },
    {
      q: '¿El temario está alineado con los programas oficiales del MINEDUC?',
      a: 'Totalmente. Incluye los temarios oficiales de 5° básico (43 módulos), 6° básico (44 módulos), 7° básico (39 módulos), 8° básico (40 módulos) y 1° medio (40 módulos) para Lenguaje, Matemática, Ciencias Naturales, Historia y Geografía e Inglés, cubriendo cada Objetivo de Aprendizaje (OA) y sus indicadores de evaluación oficiales sin alucinaciones.',
    },
    {
      q: '¿Cómo funciona el tutor con Inteligencia Artificial y qué proveedor necesito?',
      a: (
        <>
          Rumbo Libre no cobra por el uso de IA ni revende servicios. Tú ingresas tu propio token o API Key de proveedor de IA directamente en la aplicación. Por el momento, el único proveedor soportado es{' '}
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--violeta)', fontWeight: 700, textDecoration: 'underline' }}
          >
            OpenRouter (openrouter.ai)
          </a>
          , que te da acceso a modelos de vanguardia (DeepSeek, Llama 3, Claude, GPT) con opciones totalmente gratuitas o de costo ínfimo (centavos de dólar por semana de estudio). Tu clave se guarda en tu propio dispositivo y no pasa por ningún servidor intermedio.
        </>
      ),
    },
    {
      q: '¿Puedo respaldar o mover mi avance a otro computador?',
      a: '¡Por supuesto! En la sección de Ajustes puedes descargar una copia de seguridad completa en archivo `.sqlite` o JSON y restaurarla en cualquier otro equipo con un solo clic.',
    },
  ];

  return (
    <div className="home-pagina">
      {/* Barra de Navegación Pública */}
      <header className="home-header">
        <nav className="home-nav" aria-label="Navegación principal">
          <div className="home-nav-marca">
            <Logo size={40} />
            <div>
              <span className="home-marca-titulo">Rumbo Libre</span>
              <span className="home-marca-sub">Exámenes Libres MINEDUC</span>
            </div>
          </div>

          <div className="home-nav-links">
            <a href="#ventajas" className="home-nav-link">¿Por qué Rumbo Libre?</a>
            <a href="#temario" className="home-nav-link">Temario Oficial</a>
            <a href="#privacidad" className="home-nav-link">Privacidad & OSS</a>
            <a href="#metodo" className="home-nav-link">Cómo Funciona</a>
            <a href="#faq" className="home-nav-link">Preguntas Frecuentes</a>
          </div>

          <div className="home-nav-cta">
            <button className="btn btn-primario home-btn-ingresar" onClick={onIngresar}>
              {nombreEstudiante ? `Hola, ${nombreEstudiante} → Entrar` : '🚀 Ingresar a la App'}
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section con llamado a la acción persuasivo */}
        <section className="home-hero">
          <div className="home-hero-contenido">
            <div className="home-badge-pill">
              <span>🇨🇱 TEMARIO OFICIAL MINEDUC</span>
              <span className="badge-separador">·</span>
              <span>100% OPEN SOURCE & PRIVADO</span>
            </div>

            <h1 className="home-hero-titulo">
              Prepara tus Exámenes Libres con Inteligencia, a tu Ritmo y con Privacidad Total.
            </h1>

            <p className="home-hero-bajada">
              La plataforma web de <strong>código abierto</strong> diseñada para rendir la <strong>Validación de Estudios (Exámenes Libres)</strong> del MINEDUC en Chile (disponible para <strong>5°, 6°, 7°, 8° básico</strong> y <strong>1° medio</strong>). Estudia los módulos oficiales con un tutor IA paciente: <strong>tú ingresas tu propio token de proveedor de IA</strong> (por el momento soportamos{' '}
              <a
                href="https://openrouter.ai"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--violeta)', fontWeight: 700, textDecoration: 'underline' }}
              >
                OpenRouter
              </a>
              ) y mantén todos tus datos seguros en tu propio navegador sin intermediarios ni suscripciones.
            </p>

            <div className="home-hero-acciones">
              <button className="btn btn-primario btn-grande home-cta-principal" onClick={onIngresar}>
                {nombreEstudiante ? `Continuar estudiando (${nombreEstudiante}) →` : '🚀 Empezar a estudiar gratis (Sin registro)'}
              </button>
              <a href="#temario" className="btn btn-secundario btn-grande">
                📖 Explorar temario oficial
              </a>
            </div>

            <div className="home-confianza-chips">
              <div className="chip-confianza">
                <span className="chip-confianza-icono">🛡️</span>
                <span><strong>100% Local</strong> (SQLite en tu navegador)</span>
              </div>
              <div className="chip-confianza">
                <span className="chip-confianza-icono">🔓</span>
                <span><strong>Código Abierto</strong> (Licencia MIT)</span>
              </div>
              <div className="chip-confianza">
                <span className="chip-confianza-icono">🤖</span>
                <span>
                  <strong>Tu Token de IA</strong> (Vía{' '}
                  <a
                    href="https://openrouter.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    OpenRouter
                  </a>
                  )
                </span>
              </div>
              <div className="chip-confianza">
                <span className="chip-confianza-icono">📚</span>
                <span><strong>Básica & Media</strong> (Temarios UCE)</span>
              </div>
            </div>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <div className="home-mockup-tarjeta">
              <div className="home-mockup-cabecera">
                <div className="home-mockup-circulos">
                  <span className="circulo circulo-rojo" />
                  <span className="circulo circulo-amarillo" />
                  <span className="circulo circulo-verde" />
                </div>
                <div className="home-mockup-chip-asig">
                  <span>📖 Lenguaje y Comunicación · Módulos oficiales</span>
                </div>
              </div>
              <div className="home-mockup-cuerpo">
                <div className="home-mockup-burbuja profe">
                  <div className="burbuja-avatar">🤖</div>
                  <div className="burbuja-texto">
                    <strong>Tutor IA Rumbo Libre:</strong>
                    <p>
                      ¡Hola! Hoy revisaremos cómo extraer información explícita e implícita de textos. ¿Listo para resolver un caso con preguntas oficiales del MINEDUC?
                    </p>
                  </div>
                </div>
                <div className="home-mockup-burbuja estudiante">
                  <div className="burbuja-avatar">🎒</div>
                  <div className="burbuja-texto">
                    ¡Listo! Explícame la diferencia con un ejemplo cotidiano, por favor.
                  </div>
                </div>
                <div className="home-mockup-burbuja profe">
                  <div className="burbuja-avatar">🤖</div>
                  <div className="burbuja-texto">
                    Imagina que ves a alguien entrar a tu casa empapado y con un paraguas goteando. Lo <em>explícito</em> es que está mojado. Lo <em>implícito</em> es que afuera llueve...
                  </div>
                </div>
              </div>
              <div className="home-mockup-footer">
                <span className="badge-calidad">✓ Alineado al Decreto Supremo de Educación</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Propuesta de Valor y Ventajas */}
        <section id="ventajas" className="home-seccion">
          <div className="home-seccion-cabecera">
            <span className="home-seccion-kicker">¿POR QUÉ RUMBO LIBRE?</span>
            <h2 className="home-seccion-titulo">Diseñado pensando en familias homeschoolers y autodidactas</h2>
            <p className="home-seccion-sub">
              Aprender por tu cuenta no significa estudiar a ciegas. Rumbo Libre te da estructura y rigor pedagógico sin quitarte la libertad.
            </p>
          </div>

          <div className="home-grid-tarjetas">
            <div className="home-tarjeta-caracteristica">
              <div className="tarjeta-icono">🧭</div>
              <h3>Ruta Clara y Sin Relleno</h3>
              <p>
                No pierdas tiempo con contenidos que no entran en la prueba. Cada tema corresponde estrictamente a los Objetivos de Aprendizaje (OA) priorizados por el ministerio.
              </p>
            </div>

            <div className="home-tarjeta-caracteristica">
              <div className="tarjeta-icono">🤖</div>
              <h3>Tutor IA Personalizado</h3>
              <p>
                Aprende dialogando con un asistente paciente. Tú ingresas tu propio token de IA (por el momento soportado{' '}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--violeta)', fontWeight: 600, textDecoration: 'underline' }}
                >
                  OpenRouter
                </a>
                ) para usar modelos gratuitos o de costo ultra bajo, sin intermediarios ni suscripciones.
              </p>
            </div>
            <div className="home-tarjeta-caracteristica">
              <div className="tarjeta-icono">📝</div>
              <h3>Ensayos y Preguntas Reales</h3>
              <p>
                Preguntas calibradas según el formato oficial: opción múltiple, desarrollo breve y análisis crítico para que llegues al día del examen con total seguridad.
              </p>
            </div>

            <div className="home-tarjeta-caracteristica">
              <div className="tarjeta-icono">🔒</div>
              <h3>Tus Datos son 100% Tuyos</h3>
              <p>
                Sin servidores centrales ni almacenamiento en la nube de terceros. Tu progreso, notas y reflexiones viven en tu navegador mediante SQLite y persistencia IndexedDB.
              </p>
            </div>

            <div className="home-tarjeta-caracteristica">
              <div className="tarjeta-icono">📊</div>
              <h3>Seguimiento para Familias</h3>
              <p>
                Panel protegido por PIN donde padres o tutores pueden revisar calificaciones históricas, bitácora de estudio, alertas de refuerzo y exportar informes.
              </p>
            </div>

            <div className="home-tarjeta-caracteristica">
              <div className="tarjeta-icono">📚</div>
              <h3>Bibliotecas Curadas</h3>
              <p>
                Catálogo especializado con libros de literatura y divulgación científica clasificados para educación básica y media, con sinopsis y calificaciones de Goodreads.
              </p>
            </div>
          </div>
        </section>

        {/* Sección: Privacidad, Código Abierto e Inteligencia Artificial */}
        <section id="privacidad" className="home-seccion home-seccion-alt">
          <div className="home-seccion-cabecera">
            <span className="home-seccion-kicker">TRANSPARENCIA & PRIVACIDAD TOTAL</span>
            <h2 className="home-seccion-titulo">100% Código Abierto: Tú controlas tus datos y tu IA</h2>
            <p className="home-seccion-sub">
              Rumbo Libre es un proyecto libre y comunitario sin ánimo de lucro. La aplicación se ejecuta de forma íntegra en tu navegador y tú eres el dueño absoluto de tu aprendizaje y de tus datos.
            </p>
          </div>

          <div className="home-features-grid">
            <div className="feature-card">
              <div className="feature-icono">🔓</div>
              <h3 className="feature-titulo">100% Código Abierto (Open Source)</h3>
              <p className="feature-desc">
                Todo el código fuente está disponible públicamente bajo Licencia MIT en{' '}
                <a
                  href="https://github.com/raestrada/rumbolibre"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--violeta)', fontWeight: 600, textDecoration: 'underline' }}
                >
                  GitHub (raestrada/rumbolibre)
                </a>
                . Es auditable, libre de rastreadores comerciales y abierto a la colaboración de docentes y programadores.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icono">🔑</div>
              <h3 className="feature-titulo">Tú ingresas tu Token de Proveedor de IA</h3>
              <p className="feature-desc">
                No pagas intermediarios ni mensualidades por usar el tutor. Tú ingresas tu propia clave de API directamente en la app. Tu token se almacena de forma segura en tu navegador y sólo se usa para tus sesiones de estudio.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icono">🌐</div>
              <h3 className="feature-titulo">Por el momento soportado: OpenRouter</h3>
              <p className="feature-desc">
                Actualmente el único proveedor de IA soportado es{' '}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--violeta)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  OpenRouter (openrouter.ai)
                </a>
                . A través de él puedes elegir entre cientos de modelos (como DeepSeek V3, Llama 3, Claude o GPT), con opciones gratuitas y modelos de costo ínfimo (centavos por semana).
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icono">🛡️</div>
              <h3 className="feature-titulo">Sin Servidor Central (Zero Backend)</h3>
              <p className="feature-desc">
                Tu base de datos SQLite vive en tu propio navegador con IndexedDB. Ni tus notas, ni tus reflexiones, ni tus preguntas de ensayo se envían jamás a servidores nuestros, porque Rumbo Libre opera 100% en el cliente.
              </p>
            </div>
          </div>
        </section>

        {/* Sección: Temario Oficial Interactivo (Básica y Media) */}
        <section id="temario" className="home-seccion">
          <div className="home-seccion-cabecera">
            <span className="home-seccion-kicker">CURRÍCULUM MINEDUC OFICIAL</span>
            <h2 className="home-seccion-titulo">Todas las asignaturas oficiales, módulo por módulo</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              {cursosDisponibles.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`btn ${c.id === cursoSeleccionadoId ? 'btn-primario' : 'btn-suave'}`}
                  onClick={() => setCursoSeleccionadoId(c.id)}
                  style={{ fontSize: '0.95rem', padding: '8px 18px' }}
                >
                  {c.nombre} {c.id === 'b5' ? '(43 OA)' : c.id === 'b6' ? '(44 OA)' : c.id === 'b7' ? '(39 OA)' : c.id === 'b8' ? '(40 OA)' : '(40 OA)'}
                </button>
              ))}
            </div>
            <p className="home-seccion-sub" style={{ marginTop: 10 }}>
              {modulos.length} módulos estructurados según el temario oficial del MINEDUC para {cursoActivo?.nombre} ({cursoActivo?.decreto}).
            </p>
          </div>

          <div className="home-asig-grid">
            {asignaturas.map((asig) => {
              const cantModulos = modulos.filter((m) => m.asignatura_id === asig.id).length;
              return (
                <div key={asig.id} className="home-asig-card" style={{ borderTopColor: asig.color }}>
                  <div className="home-asig-icono" style={{ background: asig.color }}>
                    {asig.icono}
                  </div>
                  <h3 className="home-asig-nombre">{asig.nombre}</h3>
                  <div className="home-asig-meta">
                    <span className="badge-modulo-cant">{cantModulos} módulos oficiales</span>
                  </div>
                  <p className="home-asig-ejes">
                    <strong>Ejes clave:</strong> {asig.ejes.slice(0, 3).join(' · ')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sección: El Método de 3 Pasos */}
        <section id="metodo" className="home-seccion home-seccion-alt">
          <div className="home-seccion-cabecera">
            <span className="home-seccion-kicker">EL MÉTODO RUMBO LIBRE</span>
            <h2 className="home-seccion-titulo">Cómo dominar cada punto del examen en 3 pasos</h2>
          </div>

          <div className="home-pasos-grid">
            <div className="home-paso-card">
              <div className="home-paso-numero">1</div>
              <h3 className="home-paso-titulo">Comprende el punto</h3>
              <p className="home-paso-desc">
                Tu tutor IA te explica el indicador específico con analogías claras, lenguaje amigable y sin tecnicismos innecesarios.
              </p>
            </div>

            <div className="home-paso-card">
              <div className="home-paso-numero">2</div>
              <h3 className="home-paso-titulo">Profundiza sin límites</h3>
              <p className="home-paso-desc">
                El sistema valida según las directrices oficiales del MINEDUC que el concepto fue completamente cubierto antes de evaluarte.
              </p>
            </div>

            <div className="home-paso-card">
              <div className="home-paso-numero">3</div>
              <h3 className="home-paso-titulo">Evalúate con preguntas reales</h3>
              <p className="home-paso-desc">
                Resuelve preguntas de selección múltiple, análisis de caso y verdadero/falso idénticas a los exámenes del ministerio, con corrección instantánea y explicativa.
              </p>
            </div>
          </div>
        </section>

        {/* Sección: Preguntas Frecuentes (FAQ) */}
        <section id="faq" className="home-seccion">
          <div className="home-seccion-cabecera">
            <span className="home-seccion-kicker">RESOLVEMOS TUS DUDAS</span>
            <h2 className="home-seccion-titulo">Preguntas Frecuentes</h2>
          </div>

          <div className="home-faq-contenedor">
            {faqs.map((f, i) => {
              const abierta = faqAbierta === i;
              return (
                <div key={i} className={`home-faq-item ${abierta ? 'abierto' : ''}`}>
                  <button
                    className="home-faq-pregunta"
                    onClick={() => setFaqAbierta(abierta ? null : i)}
                    aria-expanded={abierta}
                  >
                    <span>{f.q}</span>
                    <span className="faq-icono">{abierta ? '−' : '+'}</span>
                  </button>
                  {abierta ? (
                    <div className="home-faq-respuesta">
                      <p>{f.a}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Banner Final */}
        <section className="home-cta-banner">
          <div className="home-cta-cuerpo">
            <h2>Empieza hoy tu camino para aprobar tus exámenes libres</h2>
            <p>
              Sin cuentas obligatorias, sin publicidad y con la libertad que tu educación merece.
            </p>
            <button className="btn btn-primario btn-grande home-cta-btn-final" onClick={onIngresar}>
              🚀 Ingresar a Rumbo Libre Gratis →
            </button>
          </div>
        </section>
      </main>

      {/* Footer Público */}
      <footer className="home-footer">
        <div className="home-footer-grid">
          <div className="home-footer-marca">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Logo size={32} />
              <strong style={{ fontSize: '1.1rem' }}>Rumbo Libre</strong>
            </div>
            <p style={{ color: 'var(--texto-suave)', fontSize: '0.86rem', maxWidth: 320, lineHeight: 1.5 }}>
              Plataforma comunitaria de código abierto para preparar los Exámenes Libres (Validación de Estudios) del MINEDUC en Chile.
            </p>
          </div>

          <div className="home-footer-col">
            <h4>Navegación</h4>
            <a href="#ventajas">Ventajas</a>
            <a href="#temario">Temario oficial</a>
            <a href="#privacidad">Privacidad</a>
            <a href="#faq">Preguntas frecuentes</a>
          </div>

          <div className="home-footer-col">
            <h4>Comunidad & Legal</h4>
            <a href="https://github.com/raestrada/rumbolibre" target="_blank" rel="noopener noreferrer">
              Repositorio en GitHub (Código Fuente)
            </a>
            <span>Licencia MIT (100% Software Libre)</span>
            <span>Hecho con ❤️ para la educación en Chile</span>
          </div>
        </div>

        <div className="home-footer-bottom">
          <p>© {new Date().getFullYear()} Rumbo Libre · Proyecto Comunitario de Código Abierto para Chile.</p>
        </div>
      </footer>
    </div>
  );
}
