import { EXAMENES_PDF, ejemploDeAsignatura } from '../data/ejemplos';
import { Chip } from '../components/ui';
import { getCursoActivoId, getCursos } from '../db/queries';

export default function Examenes(): JSX.Element {
  const cursoId = getCursoActivoId();
  const cursos = getCursos();
  const cursoActual = cursos.find((c) => c.id === cursoId) ?? cursos[0];

  const examenesDelCurso = EXAMENES_PDF.filter((ex) => ex.cursoId === cursoId);

  const esBasica = cursoId.startsWith('b');

  return (
    <div className="pantalla pantalla-ancha">
      <header className="cabecera">
        <h1>Exámenes reales · {cursoActual?.nombre ?? 'MINEDUC'} 📄</h1>
        <p className="cabecera-sub">
          Preguntas de ejemplo y temarios <strong>oficiales del MINEDUC</strong> para {cursoActual?.nombre}.
          Sirven para ver el formato real: opción múltiple, verdadero/falso y respuesta corta.
        </p>
      </header>

      <div className="banner banner-info">
        {esBasica ? (
          <>
            ℹ️ Para menores de 18 años el MINEDUC publica temarios oficiales por curso (incluido arriba en PDF oficial).
            Las pruebas se estructuran en 25 preguntas escritas por asignatura con 90 minutos de duración, permitiéndose calculadora en Matemática y diccionario en Inglés.
          </>
        ) : (
          <>
            ℹ️ Para menores de 18 el MINEDUC publica temarios oficiales por curso. Las preguntas de ejemplo oficiales
            de la modalidad adultos (equivalente a 1° y 2° medio / Nivel Medio 1) ilustran el mismo formato real y temas de examen.
          </>
        )}
      </div>

      <div className="lista">
        {examenesDelCurso.map((ex) => {
          const ej = ejemploDeAsignatura(ex.asignatura, cursoId);
          return (
            <section key={ex.id} className="tarjeta">
              <div className="examen-cabecera">
                <div className="examen-titulo">
                  <h3>{ex.nombre}</h3>
                  <span className="fila-sub">
                    {ex.esTemario
                      ? cursoId === 'b7' || cursoId === 'b8' || cursoId === 'm1'
                        ? 'Temario oficial UCE · Decreto N°614/2013'
                        : 'Temario oficial UCE · Decreto N°439/2012'
                      : 'Preguntas de ejemplo · formato real MINEDUC'}
                  </span>
                </div>
                <div className="examen-acciones">
                  <a className="btn btn-primario" href={ex.archivo} target="_blank" rel="noopener">
                    📄 Ver PDF
                  </a>
                  <a className="btn btn-suave" href={ex.archivo} download>
                    ⬇️ Descargar
                  </a>
                </div>
              </div>

              {ej ? (
                <div className="ejemplo-pregunta">
                  <div className="ejemplo-etiqueta">
                    <Chip tono="suave">Ejemplo real oficial</Chip>
                  </div>
                  {ej.contexto ? <p className="ejemplo-contexto">{ej.contexto}</p> : null}
                  <p className="ejemplo-enunciado">{ej.enunciado}</p>
                  <div className="ejemplo-opciones">
                    {ej.alternativas.map((a, i) => (
                      <div key={i} className="ejemplo-opcion">
                        <strong>{String.fromCharCode(65 + i)}.</strong> {a}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <p className="cabecera-sub" style={{ marginTop: 16 }}>
        Fuente: portal de Validación de Estudios del MINEDUC (epja.mineduc.cl → Material de apoyo para la
        examinación / Temarios de examinación).
      </p>
    </div>
  );
}
