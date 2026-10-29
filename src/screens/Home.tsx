import { useState } from 'react';
import Logo from '../components/Logo';
import { getAsignaturas, getConfig, getModulos } from '../db/queries';

interface HomeProps {
  onIngresar: () => void;
}

export default function Home({ onIngresar }: HomeProps): JSX.Element {
  const config = getConfig();
  const nombreEstudiante = config.nombre || '';
  const cursoActivoId = config.curso_activo || 'b5';
  const asignaturas = getAsignaturas(cursoActivoId);
  const modulos = getModulos(cursoActivoId);

  // Estado para acordeón FAQ interactivo
  const [faqAbierta, setFaqAbierta] = useState<number | null>(0);

  const faqs = [
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
      a: 'Sí, 100%. Rumbo Libre se distribuye con licencia libre MIT. No hay planes "Pro" con trampa, ni mensualidades ocultas, ni publicidad comercial. Todo el código fuente está disponible públicamente para que cualquier docente, familia o programador pueda auditarlo y colaborar.',
    },
    {
      q: '¿El temario está alineado con los programas oficiales del MINEDUC?',
      a: 'Totalmente. Incluye los temarios oficiales de 5° básico (43 módulos) y 1° medio (40 módulos) para Lenguaje, Matemática, Ciencias Naturales, Historia y Geografía e Inglés, cubriendo cada Objetivo de Aprendizaje (OA) y sus indicadores de evaluación oficiales sin alucinaciones.',
    },
    {
      q: '¿Cómo funciona el tutor con Inteligencia Artificial?',
      a: 'Te conectas usando tu propia clave de OpenRouter (puedes usar modelos gratuitos o de costo ínfimo como DeepSeek). La IA actúa como un profesor particular paciente: te explica cada punto con ejemplos chilenos cotidianos, profundiza cuando lo necesitas y te evalúa con preguntas reales.',
    },
    {
      q: '¿Puedo respaldar o mover mi avance a otro computador?',
      a: '¡Por supuesto! En la sección de Ajustes puedes descargar una copia de seguridad completa en archivo `.sqlite` o JSON y restaurarla en cualquier otro equipo con un solo clic.',
    },
  ];

  return (
    <div className="home-pagina">
      {/* Barra de navegación pública */}
      <header className="home-nav-contenedor">
        <nav className="home-nav" aria-label="Navegación principal">
          <div className="home-nav-marca">
            <Logo size={40} />
            <div>
              <span className="home-marca-titulo">Rumbo Libre</span>
              <span className="home-marca-sub">1° Medio MINEDUC</span>
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
              La plataforma web libre y gratuita diseñada para rendir la <strong>Validación de Estudios de 1° Medio</strong> en Chile. Estudia los 40 módulos oficiales con un tutor IA paciente, evalúate con preguntas reales y mantén todos tus datos seguros en tu propio computador.
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
                <span className="chip-confianza-icono">💰</span>
                <span><strong>$0</strong> Siempre Gratuito</span>
              </div>
              <div className="chip-confianza">
                <span className="chip-confianza-icono">📚</span>
                <span><strong>40 Módulos</strong> Oficiales</span>
              </div>
            </div>
          </div>

          {/* Visual Mockup Interactivo del Espacio de Estudio */}
          <div className="home-hero-visual">
            <div className="home-mockup-tarjeta">
              <div className="home-mockup-cabecera">
                <div className="home-mockup-puntos">
                  <span className="punto-rojo"></span>
                  <span className="punto-amarillo"></span>
                  <span className="punto-verde"></span>
                </div>
                <div className="home-mockup-chip-asig">
                  <span>📖 Lengua y Literatura · M1-LEN-OA3</span>
                </div>
              </div>

              <div className="home-mockup-chat">
                <div className="mockup-burbuja profe">
                  <div className="mockup-burbuja-autor">🤖 Profe IA Rumbo Libre</div>
                  <p>
                    ¡Hola! En este punto analizaremos <strong>cómo los conflictos narrativos</strong> hacen avanzar la historia. Imagina que dos personajes en Valparaíso quieren el mismo libro antiguo...
                  </p>
                  <div className="mockup-badge-mineduc">
                    ✓ Criterio MINEDUC verificado: conflicto humano y motivación interna
                  </div>
                </div>

                <div className="mockup-burbuja estudiante">
                  <div className="mockup-burbuja-autor">👧 Estudiante (14 años)</div>
                  <p>¿Y la motivación siempre tiene que ser egoísta o puede nacer de un deber ético?</p>
                </div>

                <div className="mockup-eval-preview">
                  <div className="mockup-eval-titulo">🎯 Pregunta tipo examen MINEDUC</div>
                  <p className="mockup-eval-enunciado">
                    ¿Cuál de las siguientes alternativas describe el conflicto principal del fragmento anterior?
                  </p>
                  <div className="mockup-eval-opcion correcta">
                    <span>A)</span> Una pugna ética entre la lealtad familiar y la vocación personal.
                  </div>
                  <div className="mockup-eval-resultado">🎉 ¡Correcto! Explicación con retroalimentación inmediata.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Comparativa (El Problema vs Rumbo Libre) */}
        <section id="ventajas" className="home-seccion">
          <div className="home-seccion-cabecera">
            <span className="home-seccion-kicker">¿POR QUÉ RUMBO LIBRE?</span>
            <h2 className="home-seccion-titulo">El camino tradicional está roto. Creamos una mejor alternativa.</h2>
            <p className="home-seccion-sub">
              Preparar exámenes libres no debería costar cientos de miles de pesos ni significar estudiar aislado con guías aburridas en PDF.
            </p>
          </div>

          <div className="home-comparativa-grid">
            <div className="tarjeta-comparativa tradicional">
              <div className="comparativa-etiqueta">❌ Preuniversitarios y colegios online</div>
              <ul className="comparativa-lista">
                <li>Mensualidades de $100.000 a $300.000 CLP.</li>
                <li>Horarios rígidos y clases masivas con 40 alumnos por llamada.</li>
                <li>Poca personalización: si te atrasas, te quedas fuera.</li>
                <li>Tus datos son almacenados en plataformas comerciales.</li>
              </ul>
            </div>

            <div className="tarjeta-comparativa pdfs">
              <div className="comparativa-etiqueta">⚠️ Estudiar solo con PDFs o guías sueltas</div>
              <ul className="comparativa-lista">
                <li>Textos largos sin interactividad ni ejemplos cercanos.</li>
                <li>Nadie responde tus dudas cuando no entiendes un teorema o un poema.</li>
                <li>No sabes si tu respuesta es correcta hasta que ya es muy tarde.</li>
                <li>Fácil perder la motivación y el ritmo de estudio.</li>
              </ul>
            </div>

            <div className="tarjeta-comparativa rumbolibre destacada">
              <div className="comparativa-etiqueta-destacada">✨ La Solución: Rumbo Libre</div>
              <ul className="comparativa-lista">
                <li><strong>$0 Siempre</strong>: 100% código abierto y de libre acceso.</li>
                <li><strong>Tutor IA Personalizado 1-a-1</strong>: Pregunta las veces que quieras con paciencia infinita.</li>
                <li><strong>Temario MINEDUC estricto</strong>: Sin inventar materia; cubre los 40 módulos oficiales.</li>
                <li><strong>Privacidad Radical</strong>: Toda tu base de datos vive dentro de tu propio navegador.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sección: Privacidad y Open Source (El valor diferencial) */}
        <section id="privacidad" className="home-seccion home-seccion-os">
          <div className="home-seccion-cabecera">
            <span className="home-seccion-kicker">PRIVACIDAD RADICAL & OPEN SOURCE</span>
            <h2 className="home-seccion-titulo">Tus datos nunca salen de tu computador. Garantizado.</h2>
            <p className="home-seccion-sub">
              Construido con tecnología moderna que respeta los derechos de estudiantes y familias.
            </p>
          </div>

          <div className="home-features-grid">
            <div className="feature-card">
              <div className="feature-icono">💾</div>
              <h3 className="feature-titulo">Base de datos SQLite local (WASM)</h3>
              <p className="feature-desc">
                Tu historial de notas, módulos aprobados, tiempos de lectura y bitácora se guardan en IndexedDB mediante SQLite compilado a WebAssembly. No hay un backend espiándote.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icono">🔓</div>
              <h3 className="feature-titulo">100% Código Abierto (Licencia MIT)</h3>
              <p className="feature-desc">
                Cualquier persona puede revisar el código fuente en GitHub, verificar que no contiene rastreadores, auditar la seguridad o adaptarlo para su propia comunidad escolar.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icono">🔑</div>
              <h3 className="feature-titulo">Tú eres dueño de tu IA (OpenRouter)</h3>
              <p className="feature-desc">
                Tú decides qué modelo de IA usar (DeepSeek, Claude, GPT, etc.) usando tu propia clave API que se guarda cifrada en tu navegador. Cero intermediarios cobrándote comisiones.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icono">📦</div>
              <h3 className="feature-titulo">Exportación e importación total</h3>
              <p className="feature-desc">
                Con un clic descargas tu archivo `.sqlite` completo para respaldarlo, imprimir tus reportes familiares o llevarte tu avance a otro computador sin depender de nadie.
              </p>
            </div>
          </div>
        </section>

        {/* Sección: Las 6 Asignaturas Oficiales de 1° Medio */}
        <section id="temario" className="home-seccion">
          <div className="home-seccion-cabecera">
            <span className="home-seccion-kicker">CURRÍCULUM MINEDUC 1° MEDIO</span>
            <h2 className="home-seccion-titulo">Las 6 asignaturas oficiales, módulo por módulo</h2>
            <p className="home-seccion-sub">
              {modulos.length} módulos estructurados según los Objetivos de Aprendizaje (OA) del Ministerio de Educación de Chile.
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
                El sistema valida determinísticamente según las directrices oficiales del MINEDUC que el concepto fue completamente cubierto antes de evaluarte.
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
            <h2>Empieza hoy tu camino para aprobar 1° Medio</h2>
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
              Plataforma de código abierto para preparar los Exámenes Libres (Validación de Estudios) del MINEDUC en Chile.
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
